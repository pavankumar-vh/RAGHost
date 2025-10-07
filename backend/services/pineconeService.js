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
 * @param {string} config.geminiApiKey - Gemini API key for embeddings
 * @param {number} config.topK - Number of results to return
 * @returns {Promise<Object>} - Query results
 */
export const queryPinecone = async ({ apiKey, environment, indexName, query, geminiApiKey, topK = 3 }) => {
  try {
    // Convert text to embeddings using Gemini
    const queryVector = await textToEmbedding(query, geminiApiKey);

    if (!queryVector || queryVector.length === 0) {
      console.warn('Empty embedding vector, skipping Pinecone query');
      return {
        success: true,
        matches: [],
        count: 0,
      };
    }

    // Pinecone query endpoint
    const url = `https://${indexName}-${environment}.pinecone.io/query`;

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
      throw new Error(`Pinecone query failed: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      success: true,
      matches: data.matches || [],
      count: data.matches?.length || 0,
    };
  } catch (error) {
    console.error('Pinecone query error:', error);
    
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
 * Convert text to embedding vector using Gemini
 * @param {string} text - Text to embed
 * @param {string} geminiApiKey - Gemini API key
 * @returns {Promise<number[]>} - Embedding vector
 */
const textToEmbedding = async (text, geminiApiKey) => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${geminiApiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: {
          parts: [{
            text: text.substring(0, 10000), // Limit to 10k characters per embedding
          }],
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini embedding error:', error);
      throw new Error(`Gemini embedding failed: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding?.values || [];
  } catch (error) {
    console.error('Text to embedding error:', error);
    throw error;
  }
};

/**
 * Upsert vectors to Pinecone (for knowledge base upload)
 * @param {Object} config - Pinecone configuration
 * @param {Array} vectors - Array of {id, values, metadata}
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
