const { GoogleGenerativeAI } = require('@google/generative-ai');
const { isGeminiConfigured } = require('../config/gemini');

/**
 * Generate a 768-dimensional embedding vector for the given text.
 * Uses Gemini's text-embedding-004 model.
 */
const generateEmbedding = async (text) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is missing. Skipping embedding generation.');
      return new Array(768).fill(0);
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });

    // Set a 5-second timeout for the embedding API call
    const resultPromise = model.embedContent(text);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Embedding timeout')), 5000));
    
    const result = await Promise.race([resultPromise, timeoutPromise]);
    return result.embedding.values;
  } catch (error) {
    console.error('Embedding generation error:', error.message);
    return new Array(768).fill(0);
  }
};

/**
 * Generate embeddings for an array of text items and average them.
 */
const generateAverageEmbedding = async (textArray) => {
  if (!textArray || textArray.length === 0) {
    return new Array(768).fill(0);
  }

  const combinedText = textArray.join(', ');
  return generateEmbedding(combinedText);
};

module.exports = { generateEmbedding, generateAverageEmbedding };
