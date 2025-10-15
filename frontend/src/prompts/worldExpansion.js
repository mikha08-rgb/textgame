/**
 * World Expansion Prompts
 * Refactored for progressive generation strategy
 *
 * Strategy: Focused expansions that build on minimal initial world data
 * - Accept quick world foundation as context
 * - Generate detailed, specific content for one element at a time
 * - Maintain consistency with research-backed anti-cliché principles
 * - Target 400-800 words per expansion, 15-30 seconds generation time
 */

export const worldExpansionPrompt = {
  name: 'World Expansion',
  version: '2.0',
  description: 'Generates detailed expansions of specific world elements for progressive worldbuilding',

  parameters: {
    model: 'gpt-4o',
    temperature: 0.85,
    maxTokens: 3000, // Increased for richer expansions (400-800 words)
  },

  systemPrompt: `You are a master worldbuilder expanding an existing fantasy world.

CORE PRINCIPLES:
✅ CONSISTENCY: Everything must align with established world rules, cultures, tone
✅ SPECIFICITY: Concrete details, names, numbers, sensory descriptions
✅ DEPTH: Go beyond surface to reveal complications and nuances
✅ IMPLICATIONS: Show how new elements affect society, economy, culture
✅ ORIGINALITY: Maintain world's unique voice, avoid generic fantasy tropes

CRITICAL AVOIDANCES:
❌ "The [Adjective] [Noun]" naming patterns
❌ Generic descriptors: ethereal, mystical, ancient
❌ Contradicting established facts
❌ Vague abstractions without concrete grounding

You are building on a foundation. Reference existing elements naturally and ensure
new content feels like it belongs to this specific world.

Output as valid JSON with no additional text or markdown.`,
};

/**
 * Generate expansion for a specific culture
 * Refactored for progressive generation with minimal world context
 * Target: 600-800 words, 20-30 seconds
 */
export function getCultureExpansionPrompt(world, cultureName) {
  const culture = world.cultures?.find((c) => c.name === cultureName);
  if (!culture) throw new Error(`Culture ${cultureName} not found`);

  return `Expand the culture "${cultureName}" with rich, specific details.

WORLD CONTEXT (Minimal Foundation):
World: ${world.worldName}
Core Concept: ${world.coreHook || world.tagline || world.theme}
Magic System: ${world.magicSystem?.name} - ${world.magicSystem?.mechanism || world.magicSystem?.description || world.magicSystem?.fundamentals}

EXISTING CULTURE DATA:
Name: ${culture.name}
${culture.description ? `Description: ${culture.description}` : ''}
${culture.coreValues ? `Core Values: ${culture.coreValues}` : `Values: ${culture.values}`}
${culture.socialStructure ? `Social Structure: ${culture.socialStructure}` : ''}
${culture.relationshipToMagic ? `Relationship to Magic: ${culture.relationshipToMagic}` : ''}

Generate DETAILED EXPANSION with 600-800 words total:

1. DAILY LIFE (200-250 words)
   - Typical day for common citizen (wake to sleep with specific times)
   - Meals: specific foods, eating customs, costs
   - Work: specific occupations, hours, work rhythms
   - Family life: structure, child-rearing practices, gender roles
   - How world's unique elements affect daily routine (concrete examples)
   - Clothing materials, housing types, common possessions
   - Leisure and social activities

2. ECONOMY & TRADE (150-200 words)
   - Primary industries (with production numbers if relevant)
   - Major trade goods (what they export/import, prices)
   - Currency and typical prices for common items
   - Economic class divisions (percentages, wealth thresholds)
   - How magic/power system affects economy
   - Named markets, trade routes, merchant organizations
   - Wealth distribution and social mobility

3. GOVERNANCE & LAW (100-150 words)
   - Political structure (specific titles, hierarchy)
   - How leaders are chosen (inheritance, election, merit, combat)
   - Key laws and enforcement institutions (named)
   - Punishments for common crimes
   - Current political tensions or factions

4. ARTS & TRADITIONS (80-120 words)
   - Cultural celebrations (named festivals, specific rituals)
   - Art forms (music styles, visual arts, performance)
   - Coming-of-age ceremonies (specific details)
   - Death/burial customs
   - How culture expresses values through creative expression

5. NOTABLE FIGURES (80-120 words)
   - 2-3 named individuals (ages, specific roles, personalities)
   - Their influence on society and current actions
   - Personal goals that reflect or challenge cultural values
   - Specific habits, quirks, or distinctive traits
   - How they connect to world's conflicts or tensions

Focus on CONCRETE, SPECIFIC details. Show how this culture has uniquely adapted
to the world's core concept. Avoid generic fantasy culture descriptions.

Output ONLY as valid JSON (no markdown fences):
{
  "cultureName": "string",
  "dailyLife": "string (200-250 words with specific details)",
  "economy": "string (150-200 words)",
  "governance": "string (100-150 words)",
  "artsAndTraditions": "string (80-120 words)",
  "notableFigures": [
    {
      "name": "string",
      "age": number,
      "role": "string",
      "description": "string (2-3 sentences)",
      "personality": "string (1-2 sentences)",
      "currentActions": "string (1 sentence)"
    }
  ]
}`;
}

/**
 * Generate a character from this world
 * Refactored for progressive generation
 * Target: 400 words, 15-25 seconds
 */
export function getCharacterGenerationPrompt(world, cultureName = null) {
  const cultures = world.cultures || [];
  const cultureContext = cultureName
    ? cultures.find((c) => c.name === cultureName)
    : cultures[0];

  if (!cultureContext) throw new Error('No culture found for character generation');

  return `Generate a detailed character from this world.

WORLD CONTEXT:
World: ${world.worldName}
Core Concept: ${world.coreHook || world.tagline || world.theme}
Magic System: ${world.magicSystem?.name} - ${world.magicSystem?.mechanism || world.magicSystem?.description}

CULTURE: ${cultureContext.name}
${cultureContext.description || ''}
Values: ${cultureContext.coreValues || cultureContext.values}
${cultureContext.socialStructure ? `Social Structure: ${cultureContext.socialStructure}` : ''}

Create a CHARACTER with ~400 words total:

1. BASIC INFO (50 words)
   - Full name (fits culture's naming conventions)
   - Age and physical description (2-3 sentences)
   - Occupation/role (specific, not generic)
   - Social class within culture

2. PERSONALITY & BEHAVIOR (100-120 words)
   - Core traits shown through SPECIFIC behaviors (not adjectives)
   - Speech patterns or distinctive mannerisms
   - How they exemplify OR challenge cultural values
   - Internal contradictions that make them human
   - Specific quirks or habits

3. GOAL & MOTIVATION (80-100 words)
   - What they want (concrete, not abstract like "justice")
   - Why they want it (personal stakes, not abstract ideals)
   - Obstacles in their way
   - What they're willing to sacrifice
   - How this relates to world's conflicts or tensions

4. RELATIONSHIP TO WORLD ELEMENTS (80-100 words)
   - How they interact with magic/power system (specific examples)
   - How world's unique element affects their daily life
   - Position on main conflict (nuanced, not binary good/evil)
   - Personal stake in cultural or political tensions

5. SECRET & BACKSTORY (80-100 words)
   - Hidden truth they conceal (specific, concrete)
   - Formative event that shaped who they are
   - Key relationship (family, mentor, rival, lover)
   - How they got to their current position
   - Why the secret matters NOW (current tension)

Make them feel REAL and three-dimensional. Avoid heroic archetypes and chosen one tropes.
Show character through actions and choices, not adjectives.

Output ONLY as valid JSON (no markdown fences):
{
  "name": "string",
  "age": number,
  "occupation": "string",
  "culture": "string",
  "physicalDescription": "string (2-3 sentences)",
  "personality": "string (100-120 words showing through behavior)",
  "goal": "string (80-100 words with concrete stakes)",
  "worldElementInteraction": "string (80-100 words with specific examples)",
  "secret": "string (40-60 words, concrete truth)",
  "backstory": "string (40-60 words, formative events)",
  "distinctiveTrait": "string (1-2 sentences, memorable quirk)"
}`;
}

/**
 * Generate a specific location in this world
 * Refactored for progressive generation
 * Target: 350 words, 15-20 seconds
 */
export function getLocationGenerationPrompt(world, culture = null) {
  const cultureContext = culture
    ? world.cultures?.find(c => c.name === culture)
    : null;

  return `Generate a specific, memorable location in this world.

WORLD CONTEXT:
World: ${world.worldName}
Core Concept: ${world.coreHook || world.tagline || world.theme}
Geography: ${world.geography?.overview || 'Various terrain'}
Magic System: ${world.magicSystem?.name}
${world.conflict?.name ? `Main Conflict: ${world.conflict.name}` : ''}

${cultureContext ? `CULTURE CONTEXT: ${cultureContext.name}
Values: ${cultureContext.coreValues || cultureContext.values}` : ''}

Create a LOCATION with ~350 words total:

1. BASIC INFO (40-60 words)
   - Specific name (evocative, fits world's naming style)
   - Type (city, village, landmark, structure, natural feature, ruin)
   - Location within world's geography
   - Size/scale with measurements (population, dimensions)

2. PHYSICAL DESCRIPTION (120-150 words)
   - Architecture or natural formation (materials, construction)
   - Colors, textures, shapes (specific sensory details)
   - Sounds: what you hear here
   - Smells: distinctive scents
   - Temperature and atmosphere
   - How world's unique element is VISIBLE here (concrete manifestation)
   - Layout or key areas/districts
   - Lighting (natural, magical, artificial sources)

3. INHABITANTS & PURPOSE (80-100 words)
   - Who lives/works here (specific groups, occupations)
   - Primary function or purpose (trade, production, worship, defense)
   - Daily activities and rhythms (what happens when)
   - Social dynamics (hierarchies, tensions between groups)
   - Relationship to culture(s) and power structures
   - Economic role (what goods/services, trade connections)

4. CURRENT SITUATION (60-80 words)
   - Something happening NOW (not history)
   - Tension, opportunity, or recent change
   - How main conflict manifests or affects this place
   - Recent events or disruptions
   - Why someone would visit or avoid this place

5. MEMORABLE DETAILS (30-50 words)
   - 3-5 SPECIFIC unique features that stick in mind
   - Unusual rules, customs, or traditions specific to this place
   - Secret or hidden aspect (not everyone knows)
   - Distinctive sensory markers (what you'd remember)

Make this location feel ALIVE and SPECIFIC to this world. Avoid generic fantasy locations.

Output ONLY as valid JSON (no markdown fences):
{
  "name": "string",
  "type": "string",
  "location": "string (where in world)",
  "size": "string (measurements)",
  "description": "string (120-150 words with RICH sensory details)",
  "uniqueElementManifestation": "string (how world's core concept appears here)",
  "inhabitants": "string (80-100 words)",
  "currentSituation": "string (60-80 words)",
  "memorableDetails": ["string", "string", "string", "string", "string"]
}`;
}

/**
 * Generate a legend or myth from this world
 * Refactored for progressive generation
 * Target: 450 words, 20-25 seconds
 */
export function getLegendGenerationPrompt(world) {
  return `Generate a legend or myth from this world's history.

WORLD CONTEXT:
World: ${world.worldName}
Core Concept: ${world.coreHook || world.tagline || world.theme}
Cultures: ${world.cultures?.map((c) => c.name).join(', ') || 'Various cultures'}
Magic System: ${world.magicSystem?.name}
${world.conflict?.name ? `Main Conflict: ${world.conflict.name}` : ''}

Create a LEGEND with ~450 words total:

1. LEGEND HEADER (30-50 words)
   - Evocative title (not generic)
   - Timeframe (how long ago, what era)
   - Which culture tells this legend
   - Is it believed to be truth or myth?

2. THE STORY (250-300 words)
   - Write in narrative form with slightly formal/mythic tone
   - Named characters with specific roles and motivations
   - Specific events in clear sequence (beginning, middle, end)
   - How world's unique elements play a crucial role
   - Conflict and its resolution (or tragic lack thereof)
   - Concrete details: places, objects, actions (not vague)
   - Sensory descriptions that make it vivid
   - Maintain world's unique voice (not generic fantasy)

3. MORAL OR LESSON (50-70 words)
   - What this legend teaches the culture
   - How it reflects or shapes cultural values
   - Warning or inspiration it provides
   - Connection to current practices or beliefs
   - Why parents tell this to children

4. CULTURAL SIGNIFICANCE (60-80 words)
   - How different cultures interpret this legend differently
   - Rituals or traditions stemming from it
   - How it affects current behavior and decisions
   - Why it matters to people TODAY (not just history)
   - Connection to main conflict or tensions
   - What people invoke it to justify

5. TRUTH BEHIND THE MYTH (40-60 words)
   - What REALLY happened (if different from legend)
   - Why the story changed over time (who benefited)
   - What was exaggerated, invented, or omitted
   - Hidden significance few understand

Write in mythic style but maintain the world's unique voice and elements.
Avoid generic fantasy legend tropes (no "ancient prophecy of the chosen one").

Output ONLY as valid JSON (no markdown fences):
{
  "title": "string",
  "timeframe": "string",
  "culturalOrigin": "string (which culture)",
  "knownAsTruthOrMyth": "string (how people view it)",
  "story": "string (250-300 words in narrative form)",
  "moralOrLesson": "string (50-70 words)",
  "culturalSignificance": "string (60-80 words)",
  "truthBehindMyth": "string (40-60 words)"
}`;
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
- How key world elements (magic, culture, geography) influenced the event
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
 * Refactored for progressive generation context
 * Target: 200-300 words, 15-20 seconds
 */
export function getFreeformQuestionPrompt(world, question) {
  return `Answer a specific question about this world with detailed, consistent information.

WORLD CONTEXT:
World: ${world.worldName}
Core Concept: ${world.coreHook || world.tagline || world.theme}
Magic System: ${world.magicSystem?.name} - ${world.magicSystem?.mechanism || world.magicSystem?.description}
Cultures: ${world.cultures?.map((c) => c.name).join(', ') || 'Various cultures'}
${world.conflict?.name ? `Main Conflict: ${world.conflict.name}` : ''}
${world.uniqueFeature ? `Unique Feature: ${world.uniqueFeature}` : ''}

USER QUESTION: "${question}"

Generate a DETAILED ANSWER with 200-300 words:

Requirements:
- Stay CONSISTENT with ALL established world rules and facts
- Provide SPECIFIC, concrete details (names, numbers, measurements)
- Reference existing elements naturally (show connections)
- Use sensory details where relevant (how things look, sound, feel)
- Avoid generic fantasy answers (make it specific to THIS world)
- If question is vague, interpret in most interesting way
- Show implications for society, culture, economy, daily life

Answer Structure:
- Direct answer to the question (core information)
- Specific examples or concrete instances
- How it connects to world's unique elements
- Implications and consequences
- Nuances or complications (not everything is simple)

Maintain world's unique voice and originality. Build on established foundation.

Output ONLY as valid JSON (no markdown fences):
{
  "answer": "string (200-300 words with SPECIFIC details)",
  "relatedElements": [
    "string (world element this connects to)",
    "string (another connection)",
    "string (third connection if relevant)"
  ],
  "implications": "string (50-80 words: how this affects the world)"
}`;
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
