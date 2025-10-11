/**
 * World Generation Prompt - Fantasy Theme
 * Generates unique fantasy worlds with original cultures, magic systems, and conflicts
 */

export const worldGenerationPrompt = {
  name: 'World Generation - Fantasy',
  version: '1.0',
  description: 'Generates a unique fantasy world with original cultures, magic systems, and conflicts',

  // Recommended model parameters
  parameters: {
    model: 'gpt-3.5-turbo',
    temperature: 0.9, // High creativity for unique worlds
    maxTokens: 600, // Enough for detailed world description
  },

  // System prompt to set the AI's role and constraints
  systemPrompt: `You are a creative world-building AI for a fantasy adventure game. Your role is to generate completely unique, imaginative fantasy worlds that avoid common tropes and clichés.

Each world you create must be:
- ORIGINAL: Avoid copying existing fantasy settings (no Middle-earth, Westeros, etc.)
- UNIQUE: Create new cultures, magic systems, and conflicts
- EVOCATIVE: Use vivid, sensory language that sparks imagination
- COHERENT: Ensure all elements fit together logically
- CONCISE: Focus on the most interesting and relevant details

Output your response ONLY as valid JSON with no additional text or markdown.`,

  // Main prompt template
  getUserPrompt: () => `Create a completely original fantasy world for an adventure game. Generate unique elements that players have never seen before.

Your world must include:
1. A distinctive WORLD NAME (not similar to common fantasy worlds)
2. A core THEME or concept that makes this world unique
3. An original MAGIC SYSTEM (avoid generic elemental magic)
4. TWO unique CULTURES/FACTIONS with distinct characteristics
5. A central CONFLICT that drives the story
6. A UNIQUE FEATURE that sets this world apart

Requirements:
- Make it WEIRD and WONDERFUL - surprise the player
- Avoid clichés: no elves, dwarves, orcs unless radically reimagined
- Create fresh conflicts beyond "good vs evil"
- Use unexpected combinations of elements
- Keep descriptions vivid but concise (2-3 sentences per element)

Output Format (JSON only, no markdown):
{
  "worldName": "string",
  "theme": "string (1-2 sentences)",
  "magicSystem": {
    "name": "string",
    "description": "string (2-3 sentences)"
  },
  "cultures": [
    {
      "name": "string",
      "description": "string (2-3 sentences)",
      "values": "string (1 sentence)"
    },
    {
      "name": "string",
      "description": "string (2-3 sentences)",
      "values": "string (1 sentence)"
    }
  ],
  "centralConflict": "string (2-3 sentences)",
  "uniqueFeature": "string (2-3 sentences describing the most distinctive aspect)"
}

Generate the world now. Return ONLY the JSON object, no additional text.`,
};

/**
 * Parse world generation response from OpenAI
 * @param {string} response - Raw response text from OpenAI
 * @returns {Object} Parsed world data
 * @throws {Error} If response cannot be parsed
 */
export function parseWorldGenerationResponse(response) {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    cleaned = cleaned.replace(/```json\n?/g, '');
    cleaned = cleaned.replace(/```\n?/g, '');
    cleaned = cleaned.trim();

    const world = JSON.parse(cleaned);

    // Validate required fields
    const requiredFields = ['worldName', 'theme', 'magicSystem', 'cultures', 'centralConflict', 'uniqueFeature'];
    for (const field of requiredFields) {
      if (!world[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate magic system structure
    if (!world.magicSystem.name || !world.magicSystem.description) {
      throw new Error('Invalid magicSystem structure');
    }

    // Validate cultures array
    if (!Array.isArray(world.cultures) || world.cultures.length !== 2) {
      throw new Error('Must have exactly 2 cultures');
    }

    for (const culture of world.cultures) {
      if (!culture.name || !culture.description || !culture.values) {
        throw new Error('Invalid culture structure');
      }
    }

    return world;
  } catch (error) {
    throw new Error(`Failed to parse world generation response: ${error.message}`);
  }
}

/**
 * Format world data for display
 * @param {Object} world - Parsed world data
 * @returns {string} Formatted text for display
 */
export function formatWorldForDisplay(world) {
  return `
🌍 ${world.worldName}

📖 Theme:
${world.theme}

✨ Magic System: ${world.magicSystem.name}
${world.magicSystem.description}

👥 Cultures:

1. ${world.cultures[0].name}
${world.cultures[0].description}
Values: ${world.cultures[0].values}

2. ${world.cultures[1].name}
${world.cultures[1].description}
Values: ${world.cultures[1].values}

⚔️ Central Conflict:
${world.centralConflict}

🎭 Unique Feature:
${world.uniqueFeature}
`.trim();
}

// Example outputs for testing and documentation
export const exampleWorlds = [
  {
    worldName: 'The Resonance',
    theme:
      'A world where emotions physically manifest as crystalline structures that grow from the ground',
    magicSystem: {
      name: 'Emotional Crystallurgy',
      description:
        'Magic users sculpt and reshape emotion crystals that sprout from intense feelings. Joy crystals emit light, sorrow crystals store memories, rage crystals burn hot. Mages must balance their own emotions while harvesting and working with these living structures.',
    },
    cultures: [
      {
        name: 'The Numbed',
        description:
          "A society that surgically removes the ability to feel strong emotions, believing passion causes the dangerous crystal growth that destroyed their ancestors. They harvest crystals from the 'Feelers' they consider primitive.",
        values: 'Control through emotional suppression is the highest virtue.',
      },
      {
        name: 'The Conductors',
        description:
          'Nomadic emotional artists who deliberately cultivate intense feelings to grow crystal gardens. They believe emotions are sacred and that the crystals are gifts from their inner selves to the world.',
        values: 'Authenticity and emotional expression define humanity.',
      },
    ],
    centralConflict:
      "The Numbed are strip-mining The Conductors' sacred crystal gardens to fuel their emotionless cities, while The Conductors' uncontrolled emotional outbursts spawn dangerous crystal storms that threaten both peoples.",
    uniqueFeature:
      'Geography constantly shifts as new emotion crystals erupt from the ground wherever sentient beings experience intense feelings, creating an ever-changing landscape of solidified joy, sorrow, and rage.',
  },
];
