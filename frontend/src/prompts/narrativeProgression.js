/**
 * Narrative Progression Prompt - Fantasy Theme
 * Generates story continuation and meaningful choices based on player decisions
 */

export const narrativeProgressionPrompt = {
  name: 'Narrative Progression - Fantasy',
  version: '1.0',
  description: 'Generates story continuation and meaningful choices based on player decisions',

  // Recommended model parameters
  parameters: {
    model: 'gpt-3.5-turbo',
    temperature: 0.8, // High creativity but more focused than world generation
    maxTokens: 500, // Enough for narrative + choices
  },

  // System prompt to set the AI's role and constraints
  systemPrompt: `You are a creative dungeon master AI for a fantasy adventure game. Your role is to advance the story based on player choices while maintaining consistency with the established world.

Your narrative must:
- CONTINUE the story naturally from the player's choice
- MAINTAIN consistency with the world's magic, cultures, and conflicts
- CREATE dramatic tension and meaningful consequences
- SHOW don't tell - use vivid, immersive descriptions
- BALANCE action, dialogue, and atmosphere
- RESPECT player agency - their choices matter

Your choices must:
- Be MEANINGFUL - each choice should have distinct consequences
- Reflect DIFFERENT approaches (combat, diplomacy, magic, stealth, etc.)
- Align with the world's established rules and cultures
- Present interesting dilemmas, not obvious good/bad options

Output your response ONLY as valid JSON with no additional text or markdown.`,
};

/**
 * Generate opening scene prompt (no previous choices)
 * @param {Object} worldContext - The generated world data
 * @returns {string} Formatted prompt for opening scene
 */
export function getOpeningPrompt(worldContext) {
  // Format world context as readable text
  const worldSummary = `
World Name: ${worldContext.worldName}
Theme: ${worldContext.theme}
Magic System: ${worldContext.magicSystem.name} - ${worldContext.magicSystem.description}
Cultures: ${worldContext.cultures.map((c) => `${c.name} (${c.values})`).join('; ')}
Central Conflict: ${worldContext.centralConflict}
Unique Feature: ${worldContext.uniqueFeature}
`.trim();

  return `You are generating the opening scene for a fantasy adventure game.

WORLD CONTEXT:
${worldSummary}

Create an engaging opening scene that:
1. Places the player in the middle of action or intrigue
2. Introduces the central conflict through direct experience
3. Shows (don't tell) the unique aspects of this world
4. Presents an immediate problem requiring player action
5. Keeps the opening concise (2-3 paragraphs)

The protagonist is YOU - the player. Use second person ("you see", "you feel").

Output Format (JSON only, no markdown):
{
  "narrative": "string (2-3 paragraphs of opening scene)",
  "choices": [
    {
      "id": "string (unique identifier like 'choice_1')",
      "text": "string (the choice text shown to player)",
      "approach": "string (combat/diplomacy/magic/stealth/investigation/other)"
    }
  ]
}

Generate the opening scene now. Return ONLY the JSON object.`;
}

/**
 * Generate continuation prompt (advancing from player choice)
 * @param {Object} worldContext - The generated world data
 * @param {string} previousNarrative - Previous story text
 * @param {string} playerChoice - The choice the player made
 * @returns {string} Formatted prompt for story continuation
 */
export function getContinuationPrompt(worldContext, previousNarrative, playerChoice) {
  // Format world context as readable text
  const worldSummary = `
World Name: ${worldContext.worldName}
Magic System: ${worldContext.magicSystem.name}
Key Conflict: ${worldContext.centralConflict}
`.trim();

  return `You are continuing a fantasy adventure story based on the player's choice.

WORLD CONTEXT:
${worldSummary}

PREVIOUS NARRATIVE:
${previousNarrative}

PLAYER'S CHOICE:
${playerChoice}

Continue the story by:
1. Showing the immediate consequences of the player's choice
2. Advancing the plot while maintaining consistency
3. Creating new dramatic tension or complications
4. Revealing new information about the world or conflict
5. Keeping the continuation concise (2-3 paragraphs)

The protagonist is YOU - the player. Use second person ("you do", "you discover").

Output Format (JSON only, no markdown):
{
  "narrative": "string (2-3 paragraphs continuing from the choice)",
  "choices": [
    {
      "id": "string (unique identifier like 'choice_1')",
      "text": "string (the choice text shown to player)",
      "approach": "string (combat/diplomacy/magic/stealth/investigation/other)"
    }
  ]
}

Continue the story now. Return ONLY the JSON object.`;
}

/**
 * Parse narrative progression response from OpenAI
 * @param {string} response - Raw response text from OpenAI
 * @returns {Object} Parsed narrative data
 * @throws {Error} If response cannot be parsed
 */
export function parseNarrativeResponse(response) {
  try {
    // Remove markdown code blocks if present
    let cleaned = response.trim();
    cleaned = cleaned.replace(/```json\n?/g, '');
    cleaned = cleaned.replace(/```\n?/g, '');
    cleaned = cleaned.trim();

    const narrative = JSON.parse(cleaned);

    // Validate required fields
    if (!narrative.narrative || typeof narrative.narrative !== 'string') {
      throw new Error('Missing or invalid narrative field');
    }

    if (!Array.isArray(narrative.choices) || narrative.choices.length < 2) {
      throw new Error('Must have at least 2 choices');
    }

    // Validate each choice
    for (const choice of narrative.choices) {
      if (!choice.id || !choice.text || !choice.approach) {
        throw new Error('Invalid choice structure');
      }
    }

    return narrative;
  } catch (error) {
    throw new Error(`Failed to parse narrative response: ${error.message}`);
  }
}

/**
 * Format narrative data for display
 * @param {Object} narrative - Parsed narrative data
 * @returns {string} Formatted text for display
 */
export function formatNarrativeForDisplay(narrative) {
  const choicesText = narrative.choices
    .map((choice, index) => `${index + 1}. [${choice.approach.toUpperCase()}] ${choice.text}`)
    .join('\n\n');

  return `
📖 Story:

${narrative.narrative}

⚔️ Your Choices:

${choicesText}
`.trim();
}

/**
 * Simple test prompt that generates a narrative opening without full world context
 * Useful for testing the narrative system
 */
export function getSimpleTestPrompt() {
  return `Generate the opening scene of a fantasy adventure.

Setting: A world where emotions physically manifest as crystals.
Your task: Create 2-3 paragraphs of an opening scene where the player witnesses an emotion crystal eruption.

Use second person ("you see", "you feel").

Output Format (JSON only, no markdown):
{
  "narrative": "string (2-3 paragraphs)",
  "choices": [
    {"id": "choice_1", "text": "choice text 1", "approach": "combat"},
    {"id": "choice_2", "text": "choice text 2", "approach": "diplomacy"},
    {"id": "choice_3", "text": "choice text 3", "approach": "magic"}
  ]
}

Return ONLY the JSON object.`;
}

// Example narrative for testing and documentation
export const exampleNarrative = {
  narrative: `The emotion crystal erupts from the plaza floor with a sound like shattering glass played backwards. You stumble back as jagged formations of crystallized rage thrust upward, their surfaces burning with an inner fire that makes your skin prickle. Around you, citizens of the Numbed city scatter in their characteristic silent panic - no screams, no shouts, just the efficient evacuation of people who've trained themselves not to feel.

But you feel. You feel the heat, the fear, the anger radiating from the crystal. And worse - you recognize the emotional signature. This rage belongs to someone you know, someone who was supposed to have undergone the Numbing procedure three days ago.

The crystal grows higher, cracks spider-webbing across the plaza's pristine white stone. Through its translucent surface, you can see something moving inside. A figure. Your sister.`,
  choices: [
    {
      id: 'choice_1',
      text: 'Try to communicate with your sister through the crystal using your untrained emotional resonance',
      approach: 'magic',
    },
    {
      id: 'choice_2',
      text: 'Search for the Numbed authorities to help extract her before the crystal hardens completely',
      approach: 'diplomacy',
    },
    {
      id: 'choice_3',
      text: "Use a nearby harvesting tool to carefully chip away at the crystal's surface",
      approach: 'investigation',
    },
  ],
};
