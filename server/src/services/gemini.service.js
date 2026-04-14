const ai = require('../config/genkit');
const { z } = require('genkit');
const { generateEmbedding } = require('./embedding.service');
const { searchHardware, searchMentors } = require('./vectorSearch.service');
const { isGeminiConfigured } = require('../config/gemini');

/**
 * Define a Simple Retriever for Hardware Items
 */
const hardwareRetriever = ai.defineRetriever(
  {
    name: 'hardwareRetriever',
    configSchema: z.object({
      availability_status: z.string().optional(),
    }).optional(),
  },
  async (query, options) => {
    try {
      const embedding = await generateEmbedding(query.text);
      const results = await searchHardware(embedding, {
        availability_status: options?.availability_status || 'available'
      });
      
      return {
        documents: results.map(hw => ({
          content: [{ text: `${hw.name}: ${hw.description}` }],
          metadata: { id: hw._id, owner: hw.owner_id?.name, name: hw.name }
        }))
      };
    } catch (err) {
      console.error('Hardware Retriever Error:', err);
      return { documents: [] };
    }
  }
);

/**
 * Define a Simple Retriever for Mentors
 */
const mentorRetriever = ai.defineRetriever(
  {
    name: 'mentorRetriever',
    configSchema: z.object({
      availability: z.boolean().optional(),
    }).optional(),
  },
  async (query, options) => {
    try {
      const embedding = await generateEmbedding(query.text);
      const results = await searchMentors(embedding, {
        availability: options?.availability ?? true
      });
      
      return {
        documents: results.map(m => ({
          content: [{ text: `${m.name} skills: ${m.skills.join(', ')}. Bio: ${m.bio}` }],
          metadata: { id: m._id, name: m.name, skills: m.skills }
        }))
      };
    } catch (err) {
      console.error('Mentor Retriever Error:', err);
      return { documents: [] };
    }
  }
);

/**
 * Genkit Flow for Project Generation
 */
const projectAdvisorFlow = ai.defineFlow(
  {
    name: 'projectAdvisor',
    inputSchema: z.object({
      rawDescription: z.string(),
      matchedHardware: z.array(z.any()).optional(),
      matchedMentors: z.array(z.any()).optional(),
    }),
    outputSchema: z.object({
      strategy: z.string(),
      difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Unknown']),
      feasibility_score: z.number(),
      next_steps: z.array(z.string()),
    }),
  },
  async (input) => {
    const { rawDescription, matchedHardware = [], matchedMentors = [] } = input;
    
    console.log(`[Flow: projectAdvisor] Processing advice for: "${rawDescription.substring(0, 50)}..."`);
    console.log(`[Flow: projectAdvisor] Context: ${matchedHardware.length} HW, ${matchedMentors.length} Mentors`);

    const hardwareContext = matchedHardware.length > 0 
      ? matchedHardware.map(h => `- ${h.name} (Owned by: ${h.owner_id?.name || 'Community'})`).join('\n')
      : 'No hardware matches found in community.';

    const mentorContext = matchedMentors.length > 0
      ? matchedMentors.map(m => `- ${m.name} (Skills: ${m.skills.join(', ')})`).join('\n')
      : 'No mentor matches found in community.';

    const systemPrompt = `You are a Senior Technical Project Advisor at OmniPool.
Help the user build their project strictly using the available community resources where possible.

AVAILABLE COMMUNITY HARDWARE:
${hardwareContext}

AVAILABLE COMMUNITY MENTORS:
${mentorContext}

Provide a realistic strategy, difficulty assessment, and a feasibility score (0-100) based on resource availability.`;

    try {
      const { output } = await ai.generate({
        prompt: `Project Goal: ${rawDescription}`,
        system: systemPrompt,
        output: {
          format: 'json',
          schema: z.object({
            strategy: z.string(),
            difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Unknown']),
            feasibility_score: z.coerce.number(), // Use coerce for robustness
            next_steps: z.array(z.string()),
          })
        }
      });

      if (!output) throw new Error('AI generated null output');
      return output;
    } catch (err) {
      console.error('[Flow: projectAdvisor] AI Generation Failed:', err);
      throw err;
    }
  }
);

/**
 * Existing service exports mapped to Genkit
 */
const parseProjectDescription = async (rawText) => {
  console.log(`[Service: parseProject] Parsing text: "${rawText.substring(0, 50)}..."`);
  
  try {
    const { output } = await ai.generate({
      prompt: `Analyze project: ${rawText}`,
      system: 'Parse project into structured JSON. Extract BOM and skills.',
      output: {
        format: 'json',
        schema: z.object({
          title: z.string(),
          extrapolated_BOM: z.array(z.object({
            hardware_name: z.string(),
            quantity: z.coerce.number(),
            notes: z.string().optional()
          })),
          required_skills: z.array(z.string())
        })
      }
    });
    
    if (!output) throw new Error('AI parsed null project');
    return output;
  } catch (err) {
    console.error('[Service: parseProject] Failed:', err);
    throw err;
  }
};

const generateProjectAdvice = async (rawDescription, matchedHardware, matchedMentors) => {
  return await projectAdvisorFlow({ 
    rawDescription, 
    matchedHardware, 
    matchedMentors 
  });
};

module.exports = { 
  parseProjectDescription, 
  generateProjectAdvice,
  projectAdvisorFlow,
  hardwareRetriever,
  mentorRetriever
};
