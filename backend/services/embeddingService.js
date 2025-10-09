/**
 * Embedding Service - Convert text to vectors and upsert to Pinecone
 * Standard: Gemini gemini-embedding-001 model at 1536 dimensions
 */

/**
 * DEFINITIVE FIX: Aggressively sanitizes text to remove all problematic characters.
 * This handles machine logs, special characters, and non-standard text files.
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export const sanitizeTextForEmbedding = (text) => {
  // Step 1: Replace all non-alphanumeric characters with a space
  // This breaks up file paths, special symbols, and complex punctuation
  const alphaNumericOnly = text.replace(/[^a-zA-Z0-9]/g, ' ');
  
  // Step 2: Replace multiple consecutive spaces with a single space
  const normalizedSpaces = alphaNumericOnly.replace(/\s+/g, ' ').trim();
  
  return normalizedSpaces;
};

/**
 * Chunk text into smaller pieces for embedding
 * @param {string} text - Full text to chunk
 * @param {number} chunkSize - Max characters per chunk (reduced from 500 to 350)
 * @param {number} overlap - Overlap between chunks
 * @returns {Array<string>} - Array of text chunks
 */
export const chunkText = (text, chunkSize = 350, overlap = 40) => {
  // Sanitize text first
  const sanitizedText = sanitizeTextForEmbedding(text);
  
  const chunks = [];
  let start = 0;
  const MAX_CHUNK_SIZE = 1500; // Gemini API safety limit

  while (start < sanitizedText.length) {
    const end = start + chunkSize;
    const chunk = sanitizedText.slice(start, end).trim();
    
    // Only include non-empty chunks within size limit
    if (chunk.length > 0 && chunk.length <= MAX_CHUNK_SIZE) {
      chunks.push(chunk);
    }

    start += chunkSize - overlap;
    if (start >= sanitizedText.length) break;
  }

  return chunks;
};

/**
 * Generate embeddings in batch using Gemini gemini-embedding-001
 * Uses batch API endpoint for efficiency (up to 100 chunks per call)
 * @param {Array<string>} chunks - Array of text chunks to embed
 * @param {string} geminiApiKey - Gemini API key
 * @returns {Promise<Array<number[]>>} - Array of embedding vectors (1536 dimensions each)
 */
export const generateBatchEmbeddings = async (chunks, geminiApiKey) => {
  try {
    const allEmbeddings = [];
    const batchSize = 100; // Gemini API limit
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batchChunks = chunks.slice(i, i + batchSize);
      console.log(`   Generating embeddings for chunks ${i + 1}-${Math.min(i + batchSize, chunks.length)}...`);
      
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:batchEmbedContents?key=${geminiApiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: batchChunks.map(chunk => ({
            model: 'models/gemini-embedding-001',
            content: {
              parts: [{ text: chunk }]
            }
          }))
        }),
      });

      if (!response.ok) {
        let errorText = '';
        try {
          const errJson = await response.json();
          errorText = errJson.error?.message || JSON.stringify(errJson);
        } catch (e) {
          errorText = await response.text();
        }
        throw new Error(`Gemini API Error: ${errorText}`);
      }

      const data = await response.json();
      if (!data.embeddings || !Array.isArray(data.embeddings)) {
        throw new Error('Gemini API Error: Invalid embeddings response');
      }
      
      // Extract and validate embeddings (1536 dimensions required by Pinecone)
      const batchEmbeddings = data.embeddings.map(e => e.values.slice(0, 1536));
      
      if (batchEmbeddings.length > 0 && batchEmbeddings[0].length !== 1536) {
        throw new Error(`Embedding dimension mismatch: expected 1536, got ${batchEmbeddings[0].length}`);
      }
      
      allEmbeddings.push(...batchEmbeddings);
      
      // Small delay to avoid rate limiting
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return allEmbeddings;
  } catch (error) {
    console.error('Generate batch embeddings error:', error);
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
export const upsertToPinecone = async ({ pineconeKey, environment, indexName, vectors, pineconeHost }) => {
  try {
    // Use pineconeHost directly (users now provide full URL)
    const url = `${pineconeHost}/vectors/upsert`;

    console.log(`   📤 Upserting ${vectors.length} vectors to Pinecone...`);
    console.log(`   URL: ${url}`);

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
      console.error(`   ❌ Pinecone upsert failed: ${response.status}`);
      console.error(`   Error response: ${error.substring(0, 200)}`);
      throw new Error(`Pinecone upsert failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log(`   ✅ Pinecone upsert successful: ${data.upsertedCount || vectors.length} vectors`);

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
 * @param {Function} config.onProgress - Progress callback function
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
  pineconeHost,
  onProgress,
}) => {
  try {
    console.log(`\n📄 Processing document: ${filename}`);
    console.log(`   Text length: ${text.length} characters`);
    
    // Step 1: Chunk and sanitize the text (350 chars, 40 overlap)
    if (onProgress) await onProgress('chunking', 20, `Creating text chunks...`);
    const chunks = chunkText(text);
    console.log(`   ✅ Step 1/4: Created ${chunks.length} chunks from document`);

    if (chunks.length === 0) {
      throw new Error('Could not extract any valid text chunks from the file after sanitization');
    }

    if (onProgress) await onProgress('chunking', 30, `Created ${chunks.length} chunks`);

    // Step 2: Generate embeddings in batches
    if (onProgress) await onProgress('embedding', 40, `Generating embeddings for ${chunks.length} chunks...`);
    console.log(`   🧠 Step 2/4: Generating ${chunks.length} embeddings in batches...`);
    const embeddings = await generateBatchEmbeddings(chunks, geminiKey);
    console.log(`   ✅ Step 2/4: Generated ${embeddings.length} embeddings successfully`);
    
    if (embeddings.length !== chunks.length) {
      throw new Error('Mismatch between number of chunks and generated embeddings');
    }

    if (onProgress) await onProgress('embedding', 70, `Generated ${embeddings.length} embeddings`);

    // Step 3: Prepare vectors for Pinecone
    if (onProgress) await onProgress('uploading', 75, `Preparing vectors for upload...`);
    console.log(`   📦 Step 3/4: Preparing vectors for Pinecone upsert...`);
    const vectors = chunks.map((chunk, i) => ({
      id: `${filename}-${documentId}-${i}`,
      values: embeddings[i],
      metadata: {
        fileName: filename,
        text: chunk,
        documentId,
        chunkIndex: i,
        totalChunks: chunks.length,
      },
    }));
    console.log(`   ✅ Prepared ${vectors.length} vectors with metadata`);

    // Step 4: Upsert to Pinecone
    if (onProgress) await onProgress('uploading', 80, `Uploading ${vectors.length} vectors to Pinecone...`);
    const result = await upsertToPinecone({
      pineconeKey,
      environment,
      indexName,
      vectors,
      pineconeHost,
    });

    console.log(`   ✅ Step 4/4: Successfully uploaded ${result.upsertedCount} vectors to Pinecone`);

    if (onProgress) await onProgress('completed', 100, `Successfully processed ${result.upsertedCount} vectors`);

    return {
      success: true,
      chunksProcessed: chunks.length,
      vectorsUploaded: result.upsertedCount,
    };
  } catch (error) {
    console.error('❌ Process and upload document error:', error);
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
export const deleteDocumentFromPinecone = async ({ documentId, pineconeKey, environment, indexName, pineconeHost }) => {
  try {
    // Use pineconeHost directly
    const url = `${pineconeHost}/vectors/delete`;

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

