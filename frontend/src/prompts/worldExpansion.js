/**
 * World Expansion Prompts
 * Allows drilling deeper into generated worlds with specific questions
 */

export const worldExpansionPrompt = {
  name: 'World Expansion',
  version: '1.0',
  description: 'Generates detailed expansions of specific world elements',

  parameters: {
    model: 'gpt-4', // GPT-4 for high-quality, detailed expansions
    temperature: 0.85,
    maxTokens: 1500,
  },

  systemPrompt: `You are a master worldbuilder expanding on an existing fantasy world. Your role is to generate rich, detailed content that fits seamlessly with the established world's rules, cultures, and tone.

Core Principles:
- CONSISTENCY: Everything you create must align with the world's Core Law and existing elements
- SPECIFICITY: Use concrete details, names, numbers, and sensory descriptions
- DEPTH: Go beyond surface-level descriptions to reveal interesting complications and nuances
- COHERENCE: Make sure new details connect logically to what already exists

Output your response as valid JSON with no additional text or markdown.`,
};

/**
 * Generate expansion for a specific culture
 */
export function getCultureExpansionPrompt(world, cultureName) {
  const culture = world.cultures.find((c) => c.name === cultureName);
  if (!culture) throw new Error(`Culture ${cultureName} not found`);

  return `Expand on the culture: ${cultureName}

WORLD CONTEXT:
World: ${world.worldName}
Core Law: ${world.theme}
Magic System: ${world.magicSystem.name} - ${world.magicSystem.description}

CULTURE TO EXPAND:
${culture.name}
${culture.description}
Values: ${culture.values}

Generate detailed expansion covering:

1. DAILY LIFE (150-200 words):
- Typical day for a common citizen
- Morning rituals, work, evening activities
- Family structure and child-rearing
- How the Core Law affects routine activities
- Specific foods, clothing, housing details

2. NOTABLE FIGURES (100-150 words):
- 2-3 named individuals with specific roles
- Their personalities, quirks, and goals
- How they exemplify or challenge cultural values
- Their relationship to the Core Law

3. ARCHITECTURE & PLACES (100-150 words):
- 2-3 specific named locations within their territory
- Architectural features influenced by the Core Law
- Purpose and significance of each location
- Sensory details (materials, sounds, smells, atmosphere)

Output Format (JSON):
{
  "dailyLife": "string (150-200 words with specific details)",
  "notableFigures": [
    {
      "name": "string",
      "role": "string",
      "description": "string (2-3 sentences)",
      "personality": "string (1-2 sentences)"
    }
  ],
  "locations": [
    {
      "name": "string",
      "type": "string (market, temple, workshop, etc.)",
      "description": "string (3-4 sentences with sensory details)",
      "significance": "string (why this place matters)"
    }
  ]
}

Generate NOW. Output ONLY valid JSON (no markdown fences).`;
}

/**
 * Generate a character from this world
 */
export function getCharacterGenerationPrompt(world, cultureName = null) {
  const cultureContext = cultureName
    ? world.cultures.find((c) => c.name === cultureName)
    : world.cultures[0];

  return `Generate a detailed character from this world.

WORLD CONTEXT:
World: ${world.worldName}
Core Law: ${world.theme}
Magic System: ${world.magicSystem.name}

CULTURE: ${cultureContext.name}
${cultureContext.description}
Values: ${cultureContext.values}

Generate a memorable character:

Requirements:
- Name that fits the culture
- Specific occupation/role
- Age and physical description (influenced by culture's traits)
- Personality with quirks and contradictions
- Personal goal or problem
- Relationship to the Core Law (how it affects their life)
- 1-2 specific possessions or habits
- A secret or hidden aspect

Output Format (JSON):
{
  "name": "string",
  "age": "number",
  "role": "string (occupation)",
  "physicalDescription": "string (2-3 sentences with specific details)",
  "personality": "string (3-4 sentences showing character through behavior)",
  "goal": "string (what they want and why)",
  "coreLayInteraction": "string (how the world's unique law affects their daily life)",
  "distinctiveTrait": "string (habit, possession, or quirk that makes them memorable)",
  "secret": "string (something they hide, a complication in their life)"
}

Make this character feel real and three-dimensional. Show personality through specific behaviors and details.

Generate NOW. Output ONLY valid JSON (no markdown fences).`;
}

/**
 * Generate a specific location in this world
 */
export function getLocationGenerationPrompt(world) {
  return `Generate a detailed location in this world.

WORLD CONTEXT:
World: ${world.worldName}
Core Law: ${world.theme}
Magic System: ${world.magicSystem.name}
Central Conflict: ${world.centralConflict}

Generate a specific, interesting location:

Requirements:
- Specific name
- Type (city, village, landmark, structure, natural feature)
- Physical description with sensory details
- How the Core Law manifests here
- Who uses this location and why
- Current situation or tension
- 2-3 specific details that make it memorable

Output Format (JSON):
{
  "name": "string",
  "type": "string",
  "description": "string (3-4 paragraphs, 200-250 words total with rich sensory details)",
  "coreLawManifestation": "string (how the world's unique law is visible/active here)",
  "inhabitants": "string (who lives here or uses this place)",
  "currentSituation": "string (something happening now, a tension or opportunity)",
  "memorableDetails": [
    "string (specific detail 1)",
    "string (specific detail 2)",
    "string (specific detail 3)"
  ]
}

Make this location feel alive and specific. Use concrete sensory details.

Generate NOW. Output ONLY valid JSON (no markdown fences).`;
}

/**
 * Generate a legend or myth from this world
 */
export function getLegendGenerationPrompt(world) {
  return `Generate a legend or myth from this world's history.

WORLD CONTEXT:
World: ${world.worldName}
Core Law: ${world.theme}
Magic System: ${world.magicSystem.name}
Cultures: ${world.cultures.map((c) => c.name).join(', ')}
Central Conflict: ${world.centralConflict}

Generate a legendary story or myth:

Requirements:
- Takes place in this world's past
- Explains some aspect of the Core Law or current situation
- Features named characters
- Has moral or lesson relevant to the cultures
- 250-350 words
- Told in a mythic/legendary style

Output Format (JSON):
{
  "title": "string (name of the legend)",
  "timeframe": "string (how long ago, what era)",
  "story": "string (250-350 words, told in mythic style)",
  "moralOrLesson": "string (what this legend teaches)",
  "culturalSignificance": "string (which culture tells this story and why it matters to them)"
}

Write in a mythic, slightly formal tone. Make it feel like an actual legend from this world.

Generate NOW. Output ONLY valid JSON (no markdown fences).`;
}

/**
 * Generate a historical event
 */
export function getHistoricalEventPrompt(world) {
  return `Generate a significant historical event from this world.

WORLD CONTEXT:
World: ${world.worldName}
Core Law: ${world.theme}
Magic System: ${world.magicSystem.name}
Cultures: ${world.cultures.map((c) => c.name).join(', ')}
Central Conflict: ${world.centralConflict}

Generate a pivotal historical event:

Requirements:
- Specific timeframe (X years ago)
- Named key figures involved
- How the Core Law influenced the event
- Consequences that still affect the present
- Different perspectives from each culture
- 200-300 words

Output Format (JSON):
{
  "name": "string (name of the event)",
  "timeframe": "string (when it happened)",
  "description": "string (200-300 words describing what happened)",
  "keyFigures": [
    {
      "name": "string",
      "role": "string",
      "impact": "string"
    }
  ],
  "consequences": "string (how this event shaped the current situation)",
  "culturalPerspectives": {
    "${world.cultures[0].name}": "string (how this culture views this event)",
    "${world.cultures[1].name}": "string (how this culture views this event)"
  }
}

Make this event feel consequential and connected to the present conflict.

Generate NOW. Output ONLY valid JSON (no markdown fences).`;
}

/**
 * Free-form question about the world
 */
export function getFreeformQuestionPrompt(world, question) {
  return `Answer a specific question about this world.

WORLD CONTEXT:
World: ${world.worldName}
Core Law: ${world.theme}
Magic System: ${world.magicSystem.name}
Cultures: ${world.cultures.map((c) => c.name).join(', ')}
Central Conflict: ${world.centralConflict}
Unique Feature: ${world.uniqueFeature}

QUESTION: ${question}

Generate a detailed answer:

Requirements:
- Stay consistent with established world rules
- Provide specific, concrete details
- Reference the Core Law where relevant
- Include names, numbers, sensory details
- 150-250 words

Output Format (JSON):
{
  "answer": "string (150-250 words with specific details)",
  "relatedElements": [
    "string (aspect of world this connects to)",
    "string (another connection)"
  ]
}

Be specific and concrete. Avoid generic fantasy answers.

Generate NOW. Output ONLY valid JSON (no markdown fences).`;
}

/**
 * Parse expansion response
 */
export function parseExpansionResponse(response) {
  try {
    let cleaned = response.trim();

    // Remove reasoning blocks
    cleaned = cleaned.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '');

    // Remove markdown
    cleaned = cleaned.replace(/```json\n?/g, '');
    cleaned = cleaned.replace(/```\n?/g, '');
    cleaned = cleaned.trim();

    // Extract JSON
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // Fix common JSON errors
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    cleaned = cleaned.replace(/"(\s+)"(\w+)":/g, '",\n  "$2":');

    return JSON.parse(cleaned);
  } catch (error) {
    console.error('[Expansion Parser] Failed to parse:', error.message);
    console.error('[Expansion Parser] Response:', response.substring(0, 500));
    throw new Error(`Failed to parse expansion response: ${error.message}`);
  }
}
