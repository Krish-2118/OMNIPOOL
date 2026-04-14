const { GoogleGenerativeAI } = require('@google/generative-ai');
const { isGeminiConfigured } = require('../config/gemini');

/**
 * Generate a 768-dimensional embedding vector for the given text.
 * Uses Gemini's text-embedding-004 model.
 */
const generateEmbedding = async (text) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

    const result = await model.embedContent(text);
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
