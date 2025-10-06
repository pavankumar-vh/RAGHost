/**
 * Service to test API connections for Pinecone and Gemini
 */

/**
 * Test Pinecone connection
 * @param {string} apiKey - Pinecone API key
 * @param {string} environment - Pinecone environment
 * @param {string} indexName - Pinecone index name
 */
export const testPineconeConnection = async (apiKey, environment, indexName) => {
  try {
    // Pinecone API endpoint to describe index
    const url = `https://${indexName}-${environment}.pinecone.io/describe_index_stats`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Pinecone API error: ${response.status} - ${error}`);
    }

    const data = await response.json();

    return {
      success: true,
      message: 'Pinecone connection successful',
      details: {
        indexName,
        environment,
        totalVectorCount: data.totalVectorCount || 0,
        dimension: data.dimension || null,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to connect to Pinecone',
    };
  }
};

/**
 * Test Gemini connection
 * @param {string} apiKey - Gemini API key
 */
export const testGeminiConnection = async (apiKey) => {
  try {
    // Gemini API endpoint for model info
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error?.message || `Gemini API error: ${response.status}`
      );
    }

    const data = await response.json();

    return {
      success: true,
      message: 'Gemini connection successful',
      details: {
        model: data.name || 'gemini-pro',
        displayName: data.displayName || null,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to connect to Gemini',
    };
  }
};
