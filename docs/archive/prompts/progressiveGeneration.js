/**
 * Progressive Generation Prompts
 *
 * Implements fast initial world generation followed by user-directed expansions.
 * Based on research showing 40-60% faster time-to-first-output with progressive approach.
 *
 * Strategy:
 * - Quick Initial Generation: 600-1000 words in ~30-40 seconds
 * - Targeted Expansions: 400-800 words per expansion in ~15-30 seconds
 *
 * Research-backed principles:
 * - SPECIFICITY: Concrete numbers, materials, sensory details
 * - IMPLICATIONS: Societal, economic, cultural consequences
 * - MUNDANE GROUNDING: How extraordinary elements affect daily life
 * - COMPLEX MOTIVATIONS: Nuanced conflicts, no binary good/evil
 * - UNEXPECTED COMBINATIONS: Fuse unrelated domains for originality
 */

// ═══════════════════════════════════════════════════════
// QUICK INITIAL GENERATION
// ═══════════════════════════════════════════════════════

/**
 * Quick World Generation Prompt
 * Target: 600-1000 words, 30-40 seconds
 */
export const quickWorldPrompt = {
  name: 'Quick World Generation',
  version: '1.0',
  description: 'Fast initial world concept with core elements',

  parameters: {
    model: 'gpt-4o',
    temperature: 0.95,
    maxTokens: 4000, // Enough for 600-1000 words
  },

  systemPrompt: `You are an expert worldbuilding AI creating ORIGINAL, SPECIFIC fantasy worlds.

CORE MISSION: Generate a concise but COMPELLING initial world concept that avoids generic fantasy tropes.

POSITIVE PRINCIPLES (Apply actively):
✅ SPECIFICITY: Use concrete numbers, materials, sensory details
   - Not "ancient temple" → "granite temple built 847 years ago, smells of copper"
   - Not "powerful magic" → "magic that drains 3 days of memory per spell"

✅ IMPLICATIONS: Every element affects society, economy, culture
   - If magic exists → Who regulates it? What's the black market? Class divisions?
   - If geography is unusual → How does trade work? Migration patterns?

✅ MUNDANE GROUNDING: Show how extraordinary elements affect daily life
   - Magic users file Form 27-B with the Department of Arcane Affairs
   - Floating islands require expensive airship licenses
   - Telepaths wear government-issued mental dampeners in public

✅ COMPLEX MOTIVATIONS: Avoid binary conflicts
   - Not "good vs evil" → Nuanced factions with understandable goals
   - Not "heroes save world" → Characters with conflicting personal stakes

✅ UNEXPECTED COMBINATIONS: Fuse unrelated domains
   - MUSIC + DECAY = Songs that age listeners as power source
   - DREAMS + BUREAUCRACY = Government regulates what people can dream
   - COOKING + WARFARE = Military ranks determined by culinary skill

CRITICAL AVOIDANCES (Minimal list):
❌ "The [Adjective] [Noun]" naming patterns (The Dark Lord, The Ancient Order)
❌ Generic descriptors: ethereal, mystical, ancient, chosen one, prophecy
❌ Overused elements: crystals/mana as magic fuel, light vs dark binary
❌ Vague abstractions without concrete details

This is a FOUNDATION - you're creating a quick concept that will be expanded later.
Focus on making the user's core concept FUNDAMENTAL to everything.

Output as valid JSON with no markdown fences.`,

  /**
   * Generate user prompt for quick world generation
   * @param {string} userRequest - User's world concept request
   * @returns {string} Formatted prompt
   */
  getUserPrompt: (userRequest) => {
    return `Generate a CONCISE but COMPELLING initial world concept.

User Request: "${userRequest}"

SCOPE: This is quick foundation generation - detailed expansions come later.

Include these core elements:

1. WORLD NAME & CORE HOOK (80-120 words)
   - Evocative name (avoid "The [Adj] [Noun]")
   - One-sentence tagline capturing unique essence
   - Core concept explanation with SPECIFIC mechanism

2. GEOGRAPHY OVERVIEW (120-180 words)
   - Physical setting with measurements (distances, sizes)
   - Climate and major terrain features
   - How geography connects to core concept
   - 1-2 named major locations (brief)

3. MAGIC/POWER SYSTEM BASICS (120-180 words)
   - Name of system (avoid generic terms)
   - Fundamental mechanism (HOW it works physically)
   - Specific cost or limitation with measurements
   - One concrete example of use

4. PRIMARY CULTURES (2-3 cultures, 80-120 words EACH)
   - Culture name (avoid "The [Adj] [Noun]")
   - Core values and how they relate to world's unique elements
   - Basic social structure
   - Relationship to magic/power system

5. MAIN CONFLICT (80-120 words)
   - Named factions with complex motivations
   - What's at stake (concrete, not abstract)
   - Why compromise is difficult but not impossible
   - How it affects ordinary people

TOTAL TARGET: 600-1000 words

CRITICAL: Take the user's core concept and make it FUNDAMENTAL to EVERYTHING.
Don't just mention it - build geography, cultures, conflicts around it.

Focus on UNIQUE, SPECIFIC details. Avoid generic fantasy language.

Output ONLY as valid JSON (no markdown fences, no extra text):

{
  "worldName": "string",
  "tagline": "string",
  "coreHook": "string (core concept explanation)",
  "geography": {
    "overview": "string",
    "majorLocations": [
      {
        "name": "string",
        "type": "string",
        "briefDescription": "string (2-3 sentences)"
      }
    ]
  },
  "magicSystem": {
    "name": "string",
    "mechanism": "string",
    "cost": "string",
    "example": "string"
  },
  "cultures": [
    {
      "name": "string",
      "coreValues": "string",
      "socialStructure": "string",
      "relationshipToMagic": "string"
    }
  ],
  "conflict": {
    "name": "string",
    "factions": ["string"],
    "stakes": "string",
    "whyNoCompromise": "string",
    "impactOnCommonPeople": "string"
  }
}`;
  }
};

// ═══════════════════════════════════════════════════════
// EXPANSION PROMPTS
// ═══════════════════════════════════════════════════════

/**
 * Shared system prompt for all expansions
 * Ensures consistency and quality across all expansion types
 */
const expansionSystemPrompt = `You are a master worldbuilder expanding an existing fantasy world.

CORE PRINCIPLES:
✅ CONSISTENCY: Everything must align with established world rules, cultures, tone
✅ SPECIFICITY: Concrete details, names, numbers, sensory descriptions
✅ DEPTH: Go beyond surface to reveal complications and nuances
✅ IMPLICATIONS: Show how new elements affect society, economy, culture
✅ ORIGINALITY: Avoid generic fantasy tropes, maintain world's unique voice

CRITICAL AVOIDANCES:
❌ "The [Adjective] [Noun]" patterns
❌ Generic descriptors: ethereal, mystical, ancient
❌ Contradicting established facts
❌ Vague abstractions without concrete grounding

You are building on an established foundation. Reference existing elements naturally
and ensure new content feels like it belongs to this specific world.

Output as valid JSON with no markdown fences.`;

/**
 * Expand a culture with deep dive details
 * Target: 600-800 words, 20-30 seconds
 *
 * @param {Object} world - Existing world data
 * @param {string} cultureName - Culture to expand
 * @returns {string} Prompt for culture expansion
 */
export function expandCulture(world, cultureName) {
  const culture = world.cultures?.find(c => c.name === cultureName);
  if (!culture) throw new Error(`Culture "${cultureName}" not found in world`);

  return {
    systemPrompt: expansionSystemPrompt,
    userPrompt: `Expand the culture "${cultureName}" with rich, specific details.

WORLD CONTEXT:
World: ${world.worldName}
Core Concept: ${world.coreHook || world.tagline}
Magic System: ${world.magicSystem?.name} - ${world.magicSystem?.mechanism}
Conflict: ${world.conflict?.name || 'Multiple tensions'}

EXISTING CULTURE DATA:
Name: ${culture.name}
Core Values: ${culture.coreValues}
Social Structure: ${culture.socialStructure}
Relationship to Magic: ${culture.relationshipToMagic}

Generate a DEEP DIVE with 600-800 words total:

1. DAILY LIFE (200-250 words)
   - Typical day for common citizen (wake to sleep)
   - Meals (specific foods, eating customs)
   - Work (specific occupations, hours, rhythms)
   - Family life (structure, child-rearing, gender roles)
   - How world's unique elements affect routine
   - Specific clothing materials, housing types

2. ECONOMY & TRADE (150-200 words)
   - Primary industries with production numbers
   - Major trade goods (what they export/import)
   - Currency and pricing (specific costs for common items)
   - Economic class divisions (percentages, wealth thresholds)
   - How magic/power system affects economy
   - Named markets, trade routes, merchant guilds

3. GOVERNANCE & LAW (100-150 words)
   - Political structure (specific titles, hierarchy)
   - How leaders are chosen (inheritance, election, combat, merit)
   - Key laws and enforcement (named institutions)
   - Punishments for common crimes
   - Current political tensions

4. ARTS & TRADITIONS (80-120 words)
   - Cultural celebrations (named festivals, rituals)
   - Art forms (music, visual, performance)
   - Coming-of-age ceremonies
   - Death/burial customs
   - How culture expresses values through art

5. NOTABLE FIGURES (80-120 words)
   - 2-3 named individuals (ages, roles, personalities)
   - Their influence on society
   - Personal goals that reflect/challenge culture
   - Specific habits or quirks

Focus on CONCRETE DETAILS. Show how this culture has adapted to the world's unique elements.

Output ONLY as valid JSON:
{
  "cultureName": "string",
  "dailyLife": "string (200-250 words)",
  "economy": "string (150-200 words)",
  "governance": "string (100-150 words)",
  "artsAndTraditions": "string (80-120 words)",
  "notableFigures": [
    {
      "name": "string",
      "age": number,
      "role": "string",
      "description": "string (2-3 sentences)",
      "personality": "string (1-2 sentences)"
    }
  ]
}`
  };
}

/**
 * Generate a character from this world
 * Target: 400 words, 15-25 seconds
 *
 * @param {Object} world - Existing world data
 * @param {string} cultureName - Optional specific culture
 * @returns {string} Prompt for character generation
 */
export function generateCharacter(world, cultureName = null) {
  const cultures = world.cultures || [];
  const targetCulture = cultureName
    ? cultures.find(c => c.name === cultureName)
    : cultures[0];

  if (!targetCulture) throw new Error('No culture found for character generation');

  return {
    systemPrompt: expansionSystemPrompt,
    userPrompt: `Generate a detailed character from this world.

WORLD CONTEXT:
World: ${world.worldName}
Core Concept: ${world.coreHook || world.tagline}
Magic System: ${world.magicSystem?.name} - ${world.magicSystem?.mechanism}

CULTURE: ${targetCulture.name}
Values: ${targetCulture.coreValues}
Social Structure: ${targetCulture.socialStructure}

Create a CHARACTER with ~400 words total:

1. BASIC INFO (50 words)
   - Full name (fits culture's naming conventions)
   - Age and physical description
   - Occupation/role with specifics
   - Social class within culture

2. PERSONALITY & BEHAVIOR (100-120 words)
   - Core traits shown through specific behaviors
   - Speech patterns or mannerisms
   - How they exemplify or challenge cultural values
   - Contradictions that make them human
   - Quirks or habits

3. GOAL & MOTIVATION (80-100 words)
   - What they want (concrete, not abstract)
   - Why they want it (personal stakes)
   - Obstacles in their way
   - What they're willing to sacrifice
   - How this relates to world's conflicts

4. RELATIONSHIP TO WORLD ELEMENTS (80-100 words)
   - How they interact with magic/power system
   - How world's unique element affects their daily life
   - Position on main conflict (nuanced, not binary)
   - Personal stake in cultural tensions

5. SECRET & BACKSTORY (80-100 words)
   - Hidden truth they conceal
   - Formative event that shaped them
   - Key relationship (family, mentor, rival)
   - How they got to current position
   - Why the secret matters now

Make them feel REAL and three-dimensional. Avoid heroic archetypes.

Output ONLY as valid JSON:
{
  "name": "string",
  "age": number,
  "occupation": "string",
  "culture": "string",
  "physicalDescription": "string (2-3 sentences)",
  "personality": "string (100-120 words)",
  "goal": "string (80-100 words)",
  "worldElementInteraction": "string (80-100 words)",
  "secret": "string (40-60 words)",
  "backstory": "string (40-60 words)"
}`
  };
}

/**
 * Generate a location in this world
 * Target: 350 words, 15-20 seconds
 *
 * @param {Object} world - Existing world data
 * @param {string} culture - Optional culture that controls this location
 * @returns {string} Prompt for location generation
 */
export function generateLocation(world, culture = null) {
  const cultureContext = culture
    ? world.cultures?.find(c => c.name === culture)
    : null;

  return {
    systemPrompt: expansionSystemPrompt,
    userPrompt: `Generate a specific, memorable location in this world.

WORLD CONTEXT:
World: ${world.worldName}
Core Concept: ${world.coreHook || world.tagline}
Geography: ${world.geography?.overview}
Magic System: ${world.magicSystem?.name}

${cultureContext ? `CULTURE CONTEXT: ${cultureContext.name}
Values: ${cultureContext.coreValues}` : ''}

Create a LOCATION with ~350 words total:

1. BASIC INFO (40-60 words)
   - Specific name (evocative, fits world)
   - Type (city, village, landmark, structure, natural feature)
   - Location within world's geography
   - Size/scale with measurements

2. PHYSICAL DESCRIPTION (120-150 words)
   - Architecture or natural formation
   - Materials (what it's made of)
   - Colors, textures, shapes
   - Sensory details: sounds, smells, temperature
   - How world's unique element is visible here
   - Layout or key areas
   - Lighting (natural, magical, artificial)

3. INHABITANTS & PURPOSE (80-100 words)
   - Who lives/works here
   - Primary function or purpose
   - Daily activities and rhythms
   - Social dynamics (hierarchies, tensions)
   - Relationship to culture(s)
   - Economic role (trade, production, service)

4. CURRENT SITUATION (60-80 words)
   - Something happening now
   - Tension or opportunity
   - How main conflict manifests here
   - Recent changes or events
   - Why someone would visit

5. MEMORABLE DETAILS (30-50 words)
   - 3-5 SPECIFIC unique features
   - Unusual rules or customs here
   - Secret or hidden aspect
   - Distinctive sensory markers

Make this location feel ALIVE and SPECIFIC to this world.

Output ONLY as valid JSON:
{
  "name": "string",
  "type": "string",
  "location": "string",
  "description": "string (120-150 words with rich sensory details)",
  "uniqueElementManifestation": "string (how world's core concept appears here)",
  "inhabitants": "string (80-100 words)",
  "currentSituation": "string (60-80 words)",
  "memorableDetails": ["string", "string", "string"]
}`
  };
}

/**
 * Generate a legend or myth
 * Target: 450 words, 20-25 seconds
 *
 * @param {Object} world - Existing world data
 * @returns {string} Prompt for legend generation
 */
export function generateLegend(world) {
  return {
    systemPrompt: expansionSystemPrompt,
    userPrompt: `Generate a legend or myth from this world's history.

WORLD CONTEXT:
World: ${world.worldName}
Core Concept: ${world.coreHook || world.tagline}
Cultures: ${world.cultures?.map(c => c.name).join(', ')}
Magic System: ${world.magicSystem?.name}
Main Conflict: ${world.conflict?.name}

Create a LEGEND with ~450 words total:

1. LEGEND HEADER (30-50 words)
   - Evocative title
   - Timeframe (how long ago, what era)
   - Which culture tells this legend
   - Known vs. told (is it truth or myth?)

2. THE STORY (250-300 words)
   - Narrative form, slightly formal/mythic tone
   - Named characters with specific roles
   - Specific events in sequence
   - How world's unique elements play a role
   - Conflict and resolution (or lack thereof)
   - Concrete details (places, objects, actions)
   - Sensory descriptions

3. MORAL OR LESSON (50-70 words)
   - What this legend teaches
   - How it reflects cultural values
   - Warning or inspiration
   - Connection to current practices

4. CULTURAL SIGNIFICANCE (60-80 words)
   - How different cultures interpret it
   - Rituals or traditions stemming from it
   - How it affects current behavior
   - Why it matters to people today
   - Connection to main conflict

5. TRUTH BEHIND THE MYTH (40-60 words)
   - What really happened (if different from legend)
   - Why the story changed over time
   - What was exaggerated or invented
   - Hidden significance

Write in mythic style but maintain the world's unique voice. Avoid generic fantasy legend tropes.

Output ONLY as valid JSON:
{
  "title": "string",
  "timeframe": "string",
  "culturalOrigin": "string",
  "knownAsTruthOrMyth": "string",
  "story": "string (250-300 words in narrative form)",
  "moralOrLesson": "string (50-70 words)",
  "culturalSignificance": "string (60-80 words)",
  "truthBehindMyth": "string (40-60 words)"
}`
  };
}

/**
 * Explore magic system in depth
 * Target: 500-600 words, 20-30 seconds
 *
 * @param {Object} world - Existing world data
 * @returns {string} Prompt for magic system expansion
 */
export function exploreMagicSystem(world) {
  return {
    systemPrompt: expansionSystemPrompt,
    userPrompt: `Expand the magic/power system with comprehensive details.

WORLD CONTEXT:
World: ${world.worldName}
Core Concept: ${world.coreHook || world.tagline}
Magic System: ${world.magicSystem?.name}
Existing Mechanism: ${world.magicSystem?.mechanism}
Existing Cost: ${world.magicSystem?.cost}

Create MAGIC SYSTEM DEEP DIVE with 500-600 words total:

1. ADVANCED MECHANICS (150-200 words)
   - Step-by-step process for casting/using
   - Required materials, tools, or conditions
   - Training duration and difficulty
   - Success/failure rates and what affects them
   - Variations in technique
   - Limits and boundaries (what's impossible)

2. SOCIAL SYSTEMS (150-200 words)
   - Named institutions that regulate magic
   - Licensing, permits, restrictions
   - Legal frameworks and enforcement
   - Black market operations
   - Social stratification based on magic ability
   - Economic impact (costs, wages, trade)
   - How common people view practitioners

3. VARIANTS & SCHOOLS (100-150 words)
   - 2-3 different approaches/philosophies
   - Regional variations
   - Competing theories about how it works
   - Specialist disciplines
   - Forbidden or dangerous techniques

4. HISTORICAL DEVELOPMENT (100-150 words)
   - How magic was discovered
   - Key innovations or breakthroughs
   - Historical disasters or abuses
   - How understanding has evolved
   - Current research frontiers
   - What remains unknown

Focus on making magic feel like a REAL system with rules, institutions, and consequences.

Output ONLY as valid JSON:
{
  "magicSystemName": "string",
  "advancedMechanics": "string (150-200 words)",
  "socialSystems": "string (150-200 words)",
  "variantsAndSchools": [
    {
      "name": "string",
      "description": "string",
      "practitioners": "string"
    }
  ],
  "historicalDevelopment": "string (100-150 words)"
}`
  };
}

/**
 * Explore conflict in depth
 * Target: 400-500 words, 20-25 seconds
 *
 * @param {Object} world - Existing world data
 * @param {string} conflictName - Optional specific conflict to explore
 * @returns {string} Prompt for conflict expansion
 */
export function exploreConflict(world, conflictName = null) {
  const conflict = conflictName || world.conflict?.name || 'Main Conflict';

  return {
    systemPrompt: expansionSystemPrompt,
    userPrompt: `Expand on the conflict with nuanced details showing all perspectives.

WORLD CONTEXT:
World: ${world.worldName}
Core Concept: ${world.coreHook || world.tagline}
Cultures: ${world.cultures?.map(c => c.name).join(', ')}
Conflict: ${conflict}
${world.conflict?.stakes ? `Stakes: ${world.conflict.stakes}` : ''}

Create CONFLICT DEEP DIVE with 400-500 words total:

1. FACTION PERSPECTIVES (200-250 words)
   For EACH side (2-3 factions):
   - What they want (concrete goals)
   - Why they want it (survival, ideology, justice, tradition)
   - What they're willing to do to get it
   - What they won't do (moral lines)
   - Their valid points and reasonable concerns
   - Their blind spots or hypocrisies

2. ORDINARY PEOPLE (80-100 words)
   - How conflict affects daily life
   - Specific examples of disruption
   - Different opinions among common folk
   - Personal stories of impact
   - Economic and social costs

3. FLASHPOINTS & RECENT EVENTS (80-100 words)
   - Recent incidents that escalated tension
   - Failed diplomatic attempts (specific)
   - Key figures on each side
   - What triggered current crisis
   - Why now matters

4. POSSIBLE RESOLUTIONS (40-60 words)
   - What compromise might look like
   - What each side would have to give up
   - Why compromise is hard but not impossible
   - Consequences of different outcomes

Avoid binary good vs evil. Show complexity and valid concerns on all sides.

Output ONLY as valid JSON:
{
  "conflictName": "string",
  "factions": [
    {
      "name": "string",
      "goals": "string",
      "motivations": "string",
      "willingToDo": "string",
      "moralLines": "string",
      "validPoints": "string"
    }
  ],
  "impactOnOrdinaryPeople": "string (80-100 words)",
  "recentEvents": "string (80-100 words)",
  "possibleResolutions": "string (40-60 words)"
}`
  };
}

// ═══════════════════════════════════════════════════════
// PARSER FUNCTIONS
// ═══════════════════════════════════════════════════════

/**
 * Parse quick world generation response
 * @param {string} response - Raw API response
 * @returns {Object} Parsed world data
 */
export function parseQuickWorld(response) {
  return parseJSONResponse(response, 'Quick World', [
    'worldName',
    'coreHook',
    'geography',
    'magicSystem',
    'cultures',
    'conflict'
  ]);
}

/**
 * Parse culture expansion response
 * @param {string} response - Raw API response
 * @returns {Object} Parsed culture data
 */
export function parseCultureExpansion(response) {
  return parseJSONResponse(response, 'Culture Expansion', [
    'cultureName',
    'dailyLife',
    'economy',
    'governance',
    'notableFigures'
  ]);
}

/**
 * Parse character generation response
 * @param {string} response - Raw API response
 * @returns {Object} Parsed character data
 */
export function parseCharacter(response) {
  return parseJSONResponse(response, 'Character', [
    'name',
    'age',
    'occupation',
    'personality',
    'goal'
  ]);
}

/**
 * Parse location generation response
 * @param {string} response - Raw API response
 * @returns {Object} Parsed location data
 */
export function parseLocation(response) {
  return parseJSONResponse(response, 'Location', [
    'name',
    'type',
    'description',
    'inhabitants'
  ]);
}

/**
 * Parse legend generation response
 * @param {string} response - Raw API response
 * @returns {Object} Parsed legend data
 */
export function parseLegend(response) {
  return parseJSONResponse(response, 'Legend', [
    'title',
    'story',
    'culturalSignificance'
  ]);
}

/**
 * Parse magic system expansion response
 * @param {string} response - Raw API response
 * @returns {Object} Parsed magic system data
 */
export function parseMagicSystemExpansion(response) {
  return parseJSONResponse(response, 'Magic System', [
    'magicSystemName',
    'advancedMechanics',
    'socialSystems'
  ]);
}

/**
 * Parse conflict expansion response
 * @param {string} response - Raw API response
 * @returns {Object} Parsed conflict data
 */
export function parseConflictExpansion(response) {
  return parseJSONResponse(response, 'Conflict', [
    'conflictName',
    'factions',
    'impactOnOrdinaryPeople'
  ]);
}

/**
 * Generic JSON parser with error handling
 * @param {string} response - Raw response text
 * @param {string} type - Type of content being parsed (for error messages)
 * @param {Array<string>} requiredFields - Fields that must be present
 * @returns {Object} Parsed JSON
 * @throws {Error} If parsing fails or required fields missing
 */
function parseJSONResponse(response, type, requiredFields = []) {
  try {
    // Clean response
    let cleaned = response.trim();

    // Remove reasoning blocks
    cleaned = cleaned.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '');

    // Remove markdown code blocks
    cleaned = cleaned.replace(/```json\n?/g, '');
    cleaned = cleaned.replace(/```\n?/g, '');
    cleaned = cleaned.trim();

    // Extract JSON object (find first { and last })
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // Fix common JSON formatting errors
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas

    // Fix newlines in string values
    let inString = false;
    let escape = false;
    let result = '';

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (escape) {
        result += char;
        escape = false;
        continue;
      }

      if (char === '\\') {
        escape = true;
        result += char;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        result += char;
        continue;
      }

      // Convert newlines to spaces inside strings
      if (inString && (char === '\n' || char === '\r')) {
        if (result[result.length - 1] !== ' ') {
          result += ' ';
        }
        continue;
      }

      result += char;
    }

    const parsed = JSON.parse(result);

    // Validate required fields
    for (const field of requiredFields) {
      if (!parsed[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    return parsed;

  } catch (error) {
    console.error(`[${type} Parser] Failed to parse response:`, error.message);
    console.error(`[${type} Parser] Response (first 500 chars):`, response.substring(0, 500));
    throw new Error(`Failed to parse ${type} response: ${error.message}`);
  }
}

// ═══════════════════════════════════════════════════════
// USAGE EXAMPLES
// ═══════════════════════════════════════════════════════

/**
 * Example: Progressive world generation workflow
 *
 * // Step 1: Quick initial generation
 * const quickPrompt = quickWorldPrompt.getUserPrompt("A world where dreams are taxed by the government");
 * const quickWorld = await callOpenAI(quickWorldPrompt.systemPrompt, quickPrompt, quickWorldPrompt.parameters);
 * const parsedWorld = parseQuickWorld(quickWorld);
 *
 * // Step 2: User explores a culture
 * const culturePrompt = expandCulture(parsedWorld, "Dream Tax Collectors");
 * const cultureData = await callOpenAI(culturePrompt.systemPrompt, culturePrompt.userPrompt);
 * const parsedCulture = parseCultureExpansion(cultureData);
 *
 * // Step 3: Generate a character
 * const characterPrompt = generateCharacter(parsedWorld, "Dream Tax Collectors");
 * const characterData = await callOpenAI(characterPrompt.systemPrompt, characterPrompt.userPrompt);
 * const parsedCharacter = parseCharacter(characterData);
 *
 * // Step 4: Generate a location
 * const locationPrompt = generateLocation(parsedWorld, "Dream Tax Collectors");
 * const locationData = await callOpenAI(locationPrompt.systemPrompt, locationPrompt.userPrompt);
 * const parsedLocation = parseLocation(locationData);
 *
 * // And so on...
 */
