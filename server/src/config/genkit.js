const { genkit } = require('genkit');
const { googleAI } = require('@genkit-ai/google-genai');

const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
  ],
  model: googleAI.model('gemini-2.5-flash'),
});

module.exports = ai;
