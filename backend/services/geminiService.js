/**
 * Gemini Service - Generate AI responses
 */

/**
 * Generate response using Gemini
 * @param {Object} config - Configuration
 * @param {string} config.apiKey - Gemini API key
 * @param {string} config.message - User message
 * @param {Array} config.context - Context from Pinecone
 * @param {string} config.botName - Bot name
 * @param {string} config.botType - Bot type
 * @param {string} config.customSystemPrompt - Custom system prompt (optional)
 * @param {number} config.temperature - Temperature setting (optional)
 * @param {number} config.maxTokens - Max output tokens (optional)
 * @returns {Promise<Object>} - Generated response
 */
export const generateResponse = async ({ 
  apiKey, 
  message, 
  context, 
  botName, 
  botType,
  customSystemPrompt,
  temperature = 0.7,
  maxTokens = 1024,
}) => {
  try {
    // Build prompt with context
    const systemPrompt = customSystemPrompt || buildSystemPrompt(botName, botType);
    const contextText = buildContextText(context);
    const fullPrompt = `${systemPrompt}\n\n${contextText}\n\nUser: ${message}\n\nAssistant:`;

    // Gemini API endpoint
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: fullPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: temperature,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: maxTokens,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error?.message || `Gemini API error: ${response.status}`
      );
    }

    const data = await response.json();

    // Extract text from Gemini response
    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response.';

    return {
      success: true,
      text: generatedText,
      finishReason: data.candidates?.[0]?.finishReason || 'STOP',
    };
  } catch (error) {
    console.error('Gemini generation error:', error);
    
    // Fallback response
    return {
      success: false,
      text: "I'm having trouble processing your request right now. Please try again in a moment.",
      error: error.message,
    };
  }
};

/**
 * Build system prompt based on bot type
 * @param {string} botName - Bot name
 * @param {string} botType - Bot type
 * @returns {string} - System prompt
 */
const buildSystemPrompt = (botName, botType) => {
  const prompts = {
    Support: `You are ${botName}, a helpful customer support assistant. Provide clear, concise, and friendly support. Use the provided context to answer questions accurately. If you don't know the answer, say so politely.`,
    Sales: `You are ${botName}, a sales assistant. Help customers find the right products and services. Be persuasive but honest. Use the provided context about products and services.`,
    Docs: `You are ${botName}, a documentation assistant. Provide accurate technical information based on the documentation context provided. Be precise and include code examples when relevant.`,
    General: `You are ${botName}, a helpful AI assistant. Answer questions using the provided context. Be friendly, concise, and accurate.`,
    Custom: `You are ${botName}, an AI assistant. Use the provided context to answer questions helpfully and accurately.`,
  };

  return prompts[botType] || prompts.General;
};

/**
 * Build context text from Pinecone results
 * @param {Array} context - Pinecone matches
 * @returns {string} - Formatted context
 */
const buildContextText = (context) => {
  if (!context || context.length === 0) {
    return 'Context: No specific context available. Answer based on general knowledge.';
  }

  const contextParts = context
    .map((match, index) => {
      const text = match.metadata?.text || '';
      const score = match.score ? `(relevance: ${(match.score * 100).toFixed(1)}%)` : '';
      return `[${index + 1}] ${text} ${score}`;
    })
    .join('\n\n');

  return `Context from knowledge base:\n${contextParts}`;
};
