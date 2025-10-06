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
 * @param {number} config.topK - Number of results to return
 * @returns {Promise<Object>} - Query results
 */
export const queryPinecone = async ({ apiKey, environment, indexName, query, topK = 3 }) => {
  try {
    // First, we need to convert text to embeddings
    // For now, using a simple text-based query (you'll need to add embedding service)
    const queryVector = await textToEmbedding(query, apiKey);

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
 * Convert text to embedding vector
 * This is a placeholder - you'll need to integrate with an embedding service
 * Options: OpenAI Embeddings, Cohere, or Sentence Transformers
 * @param {string} text - Text to embed
 * @param {string} apiKey - API key for embedding service
 * @returns {Promise<number[]>} - Embedding vector
 */
const textToEmbedding = async (text, apiKey) => {
  // TODO: Integrate with embedding service
  // For now, return a dummy vector (replace with actual embedding)
  // Example with OpenAI:
  // const response = await fetch('https://api.openai.com/v1/embeddings', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${openAiKey}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     input: text,
  //     model: 'text-embedding-ada-002',
  //   }),
  // });
  // return response.data[0].embedding;

  // Placeholder: Return empty vector for now
  // This will cause Pinecone to return no matches, which is fine for initial setup
  return [];
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
