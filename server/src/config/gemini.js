const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;
let embeddingModel = null;

const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('⚠️  GEMINI_API_KEY not set — AI features will use mock responses.');
    return { genAI: null, model: null, embeddingModel: null };
  }

  genAI = new GoogleGenerativeAI(apiKey);
  model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

  console.log('✅ Gemini AI client initialized');
  return { genAI, model, embeddingModel };
};

const getModel = () => {
  if (!model) initGemini();
  return model;
};

const getEmbeddingModel = () => {
  if (!embeddingModel) initGemini();
  return embeddingModel;
};

const isGeminiConfigured = () => {
  const key = process.env.GEMINI_API_KEY;
  return key && key !== 'your_gemini_api_key_here';
};

module.exports = { initGemini, getModel, getEmbeddingModel, isGeminiConfigured };
