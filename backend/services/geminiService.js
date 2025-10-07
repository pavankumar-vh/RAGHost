/**
 * Gemini Service - Generate AI responses using Gemini 2.5 Flash model
 */

/**
 * Generate response using Gemini 2.5 Flash
 * @param {Object} config - Configuration
 * @param {string} config.apiKey - Gemini API key
 * @param {string} config.message - User message
 * @param {Array} config.context - Context from Pinecone
 * @param {string} config.botName - Bot name
 * @param {string} config.botType - Bot type
 * @param {string} config.systemPrompt - Custom system prompt (optional)
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
  systemPrompt = '',
  temperature = 0.7,
  maxTokens = 1024
}) => {
  try {
    console.log('🎯 Generating response with Gemini 2.5 Flash...');
    
    // Build prompt with custom or default system prompt
    const finalSystemPrompt = systemPrompt || buildSystemPrompt(botName, botType);
    const contextText = buildContextText(context);
    
    // Create a more structured prompt
    const fullPrompt = `${finalSystemPrompt}

${contextText}

User Question: ${message}

Instructions:
1. Use the context from the knowledge base to answer the question accurately
2. If the context doesn't contain the answer, use your general knowledge but mention that
3. Be concise, helpful, and friendly
4. If you're unsure, say so honestly

Response:`;

    console.log('📝 Prompt length:', fullPrompt.length, 'characters');
    console.log('🎲 Temperature:', temperature);
    console.log('📊 Max tokens:', maxTokens);

    // Gemini API endpoint - using gemini-2.5-flash model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

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
      console.error('❌ Gemini API error:', error);
      throw new Error(
        error.error?.message || `Gemini API error: ${response.status}`
      );
    }

    const data = await response.json();

    // Extract text from Gemini response
    const generatedText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response.';

    console.log('✅ Response generated:', generatedText.substring(0, 100) + '...');

    return {
      success: true,
      text: generatedText,
      finishReason: data.candidates?.[0]?.finishReason || 'STOP',
      tokensUsed: data.usageMetadata?.totalTokenCount || 0,
    };
  } catch (error) {
    console.error('❌ Gemini generation error:', error);
    
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
    return 'Knowledge Base Context: No specific context found in the knowledge base. You may answer based on general knowledge, but please mention that this information is not from the knowledge base.';
  }

  console.log(`📚 Building context from ${context.length} matches`);

  const contextParts = context
    .map((match, index) => {
      const text = match.metadata?.text || '';
      const score = match.score ? ` [Relevance: ${(match.score * 100).toFixed(0)}%]` : '';
      const source = match.metadata?.source || 'Knowledge Base';
      return `[Source ${index + 1}${score}]
${text}`;
    })
    .join('\n\n');

  return `Knowledge Base Context (Retrieved from uploaded documents):
${contextParts}`;
};
