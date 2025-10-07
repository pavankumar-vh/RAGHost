/**
 * Pinecone Service - Query vector database
 */

/**
 * Query Pinecone index for relevant context
 * @param {Object} config - Pinecone configuration
 * @param {string} config.apiKey - Pinecone API key
 * @param {string} config.environment - Pinecone environment
 * @param {string} config.indexName - Index name
 * @param {string} config.query - User query text
 * @param {string} config.geminiKey - Gemini API key for embeddings
 * @param {number} config.topK - Number of results to return
 * @returns {Promise<Object>} - Query results
 */
export const queryPinecone = async ({ apiKey, environment, indexName, query, geminiKey, topK = 3, pineconeHost }) => {
  try {
    console.log('🔧 Starting Pinecone query...');
    console.log('📊 Query text:', query.substring(0, 100));
    
    // Convert text to embeddings using Gemini embedding-001
    console.log('🧮 Generating embedding vector...');
    const queryVector = await textToEmbedding(query, geminiKey);
    console.log('✅ Embedding generated, dimensions:', queryVector.length);

    // Use pineconeHost directly
    const url = `${pineconeHost}/query`;
    console.log('🌐 Pinecone URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vector: queryVector,
        topK,
        includeMetadata: true,
        includeValues: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Pinecone response error:', response.status, error);
      throw new Error(`Pinecone query failed: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('✅ Pinecone query successful');
    console.log('📦 Results count:', data.matches?.length || 0);

    return {
      success: true,
      matches: data.matches || [],
      count: data.matches?.length || 0,
    };
  } catch (error) {
    console.error('❌ Pinecone query error:', error.message);
    console.error('📍 Error stack:', error.stack);
    
    // Return empty context on error (fallback gracefully)
    return {
      success: false,
      matches: [],
      count: 0,
      error: error.message,
    };
  }
};

/**
 * Convert text to embedding vector using Gemini Embedding API
 * Uses gemini-embedding-001 model with 1536 dimensions (default for all services)
 * @param {string} text - Text to embed
 * @param {string} geminiApiKey - Gemini API key
 * @returns {Promise<number[]>} - Embedding vector (1536 dimensions)
 */
const textToEmbedding = async (text, geminiApiKey) => {
  try {
    console.log('🔑 Using Gemini embedding-001 model');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiApiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: {
          parts: [
            {
              text: text,
            },
          ],
        },
        outputDimensionality: 1536, // Standard dimension for all our services
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Gemini embedding error:', error);
      throw new Error(
        error.error?.message || `Gemini Embedding API error: ${response.status}`
      );
    }

    const data = await response.json();
    const embedding = data.embedding?.values || [];

    if (embedding.length === 0) {
      throw new Error('No embedding values returned from Gemini');
    }

    console.log('✅ Embedding created successfully, dimensions:', embedding.length);
    return embedding;
  } catch (error) {
    console.error('❌ Text to embedding error:', error.message);
    throw error;
  }
};

/**
 * Upsert vectors to Pinecone (for knowledge base upload)
 * @param {Object} config - Pinecone configuration
 * @param {string} config.apiKey - Pinecone API key
 * @param {string} config.environment - Pinecone environment
 * @param {string} config.indexName - Index name
 * @param {Array} config.vectors - Array of {id, values, metadata}
 * @returns {Promise<Object>} - Upsert result
 */
export const upsertVectors = async ({ apiKey, environment, indexName, vectors }) => {
  try {
    const url = `https://${indexName}-${environment}.pinecone.io/vectors/upsert`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vectors,
        namespace: '', // Optional: use namespaces for organization
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinecone upsert failed: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      success: true,
      upsertedCount: data.upsertedCount || 0,
    };
  } catch (error) {
    console.error('Pinecone upsert error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete all vectors from Pinecone index
 * @param {Object} config - Pinecone configuration
 * @returns {Promise<Object>} - Delete result
 */
export const deleteAllVectors = async ({ apiKey, environment, indexName }) => {
  try {
    const url = `https://${indexName}-${environment}.pinecone.io/vectors/delete`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deleteAll: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinecone delete failed: ${response.status} - ${error}`);
    }

    return {
      success: true,
      message: 'All vectors deleted',
    };
  } catch (error) {
    console.error('Pinecone delete error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};
