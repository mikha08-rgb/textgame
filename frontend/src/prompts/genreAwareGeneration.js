/**
 * Genre-Aware World Generation
 *
 * Enhances worldGeneration.js with genre-specific:
 * - Focus areas
 * - Cliché warnings
 * - Quality principle weights
 * - Example prompts
 * - Sanderson's Laws (hard/soft magic detection)
 *
 * Part of Phase 1: Quick Wins (Task 1.3 + 1.4)
 */

import { worldGenerationPrompt } from './worldGeneration.js';
import { getGenreConfig, getGenreName } from '../lib/genreSystem.js';
import { detectMagicStyle, getMagicGuidance, validateMagicSystem } from '../lib/sandersonLaws.js';

/**
 * Generate genre-specific system prompt enhancement
 *
 * Adds genre-specific guidance AND Sanderson's Laws to the base system prompt
 */
export function getGenreSpecificSystemPrompt(genre = 'fantasy', userInput = '') {
  const config = getGenreConfig(genre);
  const genreName = getGenreName(genre);

  // Detect magic style from user input
  const magicGuidance = getMagicGuidance(userInput);

  const genreGuidance = `

═══════════════════════════════════════════════════════
GENRE-SPECIFIC GUIDANCE: ${genreName.toUpperCase()}
═══════════════════════════════════════════════════════

This is a ${genreName} world. Focus your worldbuilding on these key areas:

${config.focusAreas.map((area, i) => `${i + 1}. ${area}`).join('\n')}

${config.additionalCliches && config.additionalCliches.length > 0 ? `
AVOID THESE ${genreName.toUpperCase()} CLICHÉS:
${config.additionalCliches.map(c => `- ${c}`).join('\n')}
` : ''}

${config.emphasizeLimitations ? `
⚠️ CRITICAL FOR ${genreName.toUpperCase()}: Emphasize LIMITATIONS and RULES
This genre requires clear, specific limitations for all extraordinary elements.
Every power system, technology, or supernatural element MUST have:
1. Constraints (what it CAN'T do)
2. Costs (what it REQUIRES)
3. Vulnerabilities (what DEFEATS it)
4. Social restrictions (how society LIMITS it)
` : ''}

QUALITY PRINCIPLE WEIGHTS FOR ${genreName.toUpperCase()}:
${Object.entries(config.principleWeights)
  .sort(([, a], [, b]) => b - a)
  .map(([principle, weight]) => `- ${principle}: ${(weight * 100).toFixed(0)}% importance`)
  .join('\n')}

EXAMPLE PROMPTS FOR INSPIRATION:
${config.examplePrompts.map(ex => `- "${ex}"`).join('\n')}

Remember: These examples show the level of specificity and originality expected.

${magicGuidance.guidance}
`;

  return worldGenerationPrompt.systemPrompt + genreGuidance;
}

/**
 * Generate genre-specific user prompt
 *
 * Modifies the Chain-of-Thought reasoning section for genre-specific considerations
 */
export function getGenreSpecificUserPrompt(userConcept, genre = 'fantasy') {
  const config = getGenreConfig(genre);
  const genreName = getGenreName(genre);
  const basePrompt = worldGenerationPrompt.getUserPrompt();

  // Find the CHAIN-OF-THOUGHT section and enhance it
  const cotStart = basePrompt.indexOf('CHAIN-OF-THOUGHT REASONING');
  const cotEnd = basePrompt.indexOf('After your reasoning');

  if (cotStart === -1 || cotEnd === -1) {
    // Fallback: just append genre guidance
    return `${basePrompt}

USER CONCEPT: ${userConcept}

GENRE: ${genreName}
Focus on: ${config.focusAreas.slice(0, 3).join(', ')}`;
  }

  // Extract sections
  const beforeCoT = basePrompt.substring(0, cotStart);
  const afterCoT = basePrompt.substring(cotEnd);

  // Enhanced Chain-of-Thought with genre-specific considerations
  const enhancedCoT = `CHAIN-OF-THOUGHT REASONING (REQUIRED BEFORE GENERATION)
═══════════════════════════════════════════════════════

GENRE: ${genreName}

USER CONCEPT: "${userConcept}"

Before generating the world JSON, you MUST provide structured reasoning in <reasoning> tags:

<reasoning>
1. CORE CONCEPT: What makes this ${genreName.toLowerCase()} world unique?
   - Identify 1-2 distinctive elements specific to ${genreName}
   - Consider: ${config.focusAreas[0]}
   - Avoid ${genreName} clichés: ${config.additionalCliches.slice(0, 2).join(', ')}

2. IMPLICATIONS: How does the core concept affect society, economy, and daily life?
   - ${genreName} perspective: ${config.focusAreas[1] || 'societal impact'}
   - Societal effects (class structure, social norms, taboos)
   - Economic effects (trade, resources, wealth distribution)
   - Daily life effects (how ordinary people live and work)

3. CONFLICTS: What tensions naturally arise?
   - Identify 2-3 conflicts relevant to ${genreName} worldbuilding
   - Ensure conflicts have valid perspectives on all sides
   - Consider how conflicts relate to: ${config.focusAreas[2] || 'power dynamics'}

4. SPECIFICITY: What concrete details will make this feel real?
   - ${genreName}-specific details: ${config.focusAreas[3] || 'measurements and names'}
   - Numbers (populations, distances, costs, timeframes)
   - Names (people, places, resources, institutions)
   - Materials and sensory details

5. ORIGINALITY CHECK: How am I avoiding ${genreName} clichés?
   - Clichés to avoid: ${config.additionalCliches.slice(0, 3).join(', ')}
   - Fresh approaches for: ${config.focusAreas[0]}
   - Ensure unique terminology (not generic "The [Adjective] [Noun]" patterns)

${config.emphasizeLimitations ? `
6. LIMITATIONS (CRITICAL FOR ${genreName.toUpperCase()}):
   For each extraordinary element (magic, technology, powers):
   - CONSTRAINTS: What can't it do? (2+ specific limitations)
   - COSTS: What does it require? (with measurements)
   - VULNERABILITIES: What defeats it? (1+ specific counters)
   - SOCIAL RESTRICTIONS: How does society control it?
` : ''}
</reasoning>

`;

  return `${beforeCoT}${enhancedCoT}${afterCoT}`;
}

/**
 * Get complete genre-aware prompt configuration
 *
 * Returns a modified worldGenerationPrompt object with genre + Sanderson Laws enhancements
 */
export function getGenreAwarePrompt(userConcept, genre = 'fantasy') {
  const genreName = getGenreName(genre);

  // Detect magic style for metadata
  const magicDetection = detectMagicStyle(userConcept);

  return {
    ...worldGenerationPrompt,
    name: `World Generation - ${genreName}`,
    description: `Generates a unique ${genreName.toLowerCase()} world with original cultures and conflicts`,

    // Enhanced system prompt (includes Sanderson's Laws)
    systemPrompt: getGenreSpecificSystemPrompt(genre, userConcept),

    // Enhanced user prompt generator
    getUserPrompt: () => getGenreSpecificUserPrompt(userConcept, genre),

    // Additional metadata
    genre,
    genreName,
    magicStyle: magicDetection.style,
    magicDetection
  };
}

/**
 * Helper: Get quality principle weights for critique
 *
 * Used by Constitutional AI to adjust scoring based on genre
 */
export function getGenreQualityWeights(genre = 'fantasy') {
  const config = getGenreConfig(genre);
  return config.principleWeights;
}

/**
 * Helper: Should emphasize limitations for this genre?
 */
export function shouldEmphasizeLimitations(genre = 'fantasy') {
  const config = getGenreConfig(genre);
  return config.emphasizeLimitations || false;
}

/**
 * Helper: Get limitation multiplier for scoring
 */
export function getLimitationMultiplier(genre = 'fantasy') {
  const config = getGenreConfig(genre);
  return config.limitationMultiplier || 1.0;
}

/**
 * Helper: Validate magic system based on detected style
 */
export function validateMagicInWorld(world, userInput = '') {
  const magicDetection = detectMagicStyle(userInput);

  // Look for magic system in world object
  const magicSystem = world.magicSystem || world.magic || world.powerSystem || null;

  if (!magicSystem) {
    return {
      valid: true, // No magic system to validate
      style: magicDetection.style,
      message: 'No magic/power system detected in world'
    };
  }

  // Use the appropriate validation based on detected style
  return validateMagicSystem(magicSystem, magicDetection.style);
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getGenreSpecificSystemPrompt,
  getGenreSpecificUserPrompt,
  getGenreAwarePrompt,
  getGenreQualityWeights,
  shouldEmphasizeLimitations,
  getLimitationMultiplier,
  validateMagicInWorld
};
