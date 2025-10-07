/**
 * Embedding Service - Convert text to vectors and upsert to Pinecone
 * Standard: Gemini embedding-001 model at 1536 dimensions
 */

/**
 * Chunk text into smaller pieces for embedding
 * @param {string} text - Full text to chunk
 * @param {number} chunkSize - Max characters per chunk
 * @param {number} overlap - Overlap between chunks
 * @returns {Array<string>} - Array of text chunks
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.substring(start, end).trim();
    
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    start = end - overlap;
    if (start >= text.length) break;
  }

  return chunks;
};

/**
 * Generate embedding using Gemini embedding-001
 * Uses 1536 dimensions (standard for all our services)
 * @param {string} text - Text to embed
 * @param {string} geminiApiKey - Gemini API key
 * @returns {Promise<number[]>} - Embedding vector (1536 dimensions)
 */
export const generateEmbedding = async (text, geminiApiKey) => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${geminiApiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'models/embedding-001',
        content: {
          parts: [{
            text: text.substring(0, 10000), // Limit to 10k chars per chunk
          }],
        },
        outputDimensionality: 1536, // Standard dimension for all our services
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini embedding failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const embedding = data.embedding?.values || [];
    
    if (embedding.length === 0) {
      throw new Error('No embedding values returned from Gemini');
    }
    
    if (embedding.length !== 1536) {
      console.warn(`Expected 1536 dimensions, got ${embedding.length}`);
    }
    
    return embedding;
  } catch (error) {
    console.error('Generate embedding error:', error);
    throw error;
  }
};

/**
 * Upsert vectors to Pinecone
 * @param {Object} config - Configuration
 * @param {string} config.pineconeKey - Pinecone API key
 * @param {string} config.environment - Pinecone environment
 * @param {string} config.indexName - Index name
 * @param {Array} config.vectors - Array of {id, values, metadata}
 * @returns {Promise<Object>} - Upsert result
 */
export const upsertToPinecone = async ({ pineconeKey, environment, indexName, vectors }) => {
  try {
    const url = `https://${indexName}-${environment}.pinecone.io/vectors/upsert`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': pineconeKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors,
        namespace: '',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinecone upsert failed: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      success: true,
      upsertedCount: data.upsertedCount || vectors.length,
    };
  } catch (error) {
    console.error('Pinecone upsert error:', error);
    throw error;
  }
};

/**
 * Process document: chunk, embed, and upsert to Pinecone
 * @param {Object} config - Configuration
 * @param {string} config.text - Document text
 * @param {string} config.documentId - Unique document ID
 * @param {string} config.filename - Original filename
 * @param {string} config.pineconeKey - Pinecone API key
 * @param {string} config.geminiKey - Gemini API key
 * @param {string} config.environment - Pinecone environment
 * @param {string} config.indexName - Pinecone index name
 * @returns {Promise<Object>} - Processing result
 */
export const processAndUploadDocument = async ({
  text,
  documentId,
  filename,
  pineconeKey,
  geminiKey,
  environment,
  indexName,
}) => {
  try {
    // Step 1: Chunk the text
    const chunks = chunkText(text, 500, 50);
    console.log(`Processing ${chunks.length} chunks from ${filename}`);

    // Step 2: Generate embeddings for each chunk
    const vectors = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      
      try {
        const embedding = await generateEmbedding(chunk, geminiKey);
        
        vectors.push({
          id: `${documentId}_chunk_${i}`,
          values: embedding,
          metadata: {
            text: chunk,
            documentId,
            filename,
            chunkIndex: i,
            totalChunks: chunks.length,
          },
        });

        // Add small delay to avoid rate limiting
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (embeddingError) {
        console.error(`Error embedding chunk ${i}:`, embeddingError);
        // Continue with other chunks even if one fails
      }
    }

    // Step 3: Upsert to Pinecone
    if (vectors.length > 0) {
      const result = await upsertToPinecone({
        pineconeKey,
        environment,
        indexName,
        vectors,
      });

      console.log(`✅ Uploaded ${result.upsertedCount} vectors to Pinecone`);

      return {
        success: true,
        chunksProcessed: chunks.length,
        vectorsUploaded: result.upsertedCount,
      };
    } else {
      throw new Error('No vectors generated from document');
    }
  } catch (error) {
    console.error('Process and upload document error:', error);
    throw error;
  }
};

/**
 * Delete document vectors from Pinecone
 * @param {Object} config - Configuration
 * @param {string} config.documentId - Document ID to delete
 * @param {string} config.pineconeKey - Pinecone API key
 * @param {string} config.environment - Pinecone environment
 * @param {string} config.indexName - Index name
 * @returns {Promise<Object>} - Delete result
 */
export const deleteDocumentFromPinecone = async ({ documentId, pineconeKey, environment, indexName }) => {
  try {
    const url = `https://${indexName}-${environment}.pinecone.io/vectors/delete`;

    // Delete all vectors with this documentId prefix
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': pineconeKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          documentId: { $eq: documentId }
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Pinecone delete error:', error);
      throw new Error(`Pinecone delete failed: ${response.status}`);
    }

    return {
      success: true,
      message: 'Document vectors deleted from Pinecone',
    };
  } catch (error) {
    console.error('Delete from Pinecone error:', error);
    throw error;
  }
};

