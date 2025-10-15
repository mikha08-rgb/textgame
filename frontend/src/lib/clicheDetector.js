/**
 * Cliché Detection System
 *
 * Detects common worldbuilding clichés across multiple genres and categories.
 * Provides originality scoring and specific feedback for improvement.
 *
 * Part of Phase 1: Quick Wins (Task 1.2)
 */

// ============================================================================
// CLICHÉ PATTERN DEFINITIONS
// ============================================================================

/**
 * Universal cliché patterns that apply across all genres
 */
const UNIVERSAL_PATTERNS = {
  naming: [
    // Generic "The [Adjective] [Noun]" patterns
    /\bThe\s+(?:Ancient|Dark|Forbidden|Sacred|Eternal|Shadow|Crystal|Mystic|Divine|Cursed|Holy|Lost|Hidden|Secret)\s+\w+/gi,

    // "X of Y" patterns with overused words
    /\b\w+\s+of\s+(?:Darkness|Light|Shadows|Eternity|Destiny|Power|Chaos|Order|Dawn|Dusk|Fire|Ice)\b/gi,

    // Generic fantasy naming with apostrophes (Elf'nar, etc.)
    /\b\w+'[a-z]{2,3}\b/gi
  ],

  descriptors: [
    // Overused atmospheric adjectives (3+ uses in close proximity is cliché)
    /\b(?:ancient|mystical|mysterious|shadowy|ethereal|arcane|forbidden|enigmatic|elusive|cryptic)\b/gi,

    // Vague intensity words
    /\b(?:immense|vast|infinite|endless|boundless|limitless)\b/gi,

    // Generic fantasy descriptors
    /\b(?:magical|enchanted|bewitched|spellbound)\b/gi
  ],

  phrases: [
    // Passive constructions that add nothing
    /\bit\s+is\s+said\s+that/gi,
    /\blegend\s+tells\s+of/gi,
    /\bno\s+one\s+knows/gi,
    /\bfor\s+reasons\s+unknown/gi,
    /\bsince\s+time\s+immemorial/gi,
    /\bfrom\s+the\s+dawn\s+of\s+time/gi
  ]
};

/**
 * Genre-specific cliché patterns
 */
const GENRE_PATTERNS = {
  fantasy: {
    tropes: [
      /\bchosen\s+one\b/gi,
      /\bprophecy\s+(?:foretold|prophesied)/gi,
      /\blight\s+(?:vs\.?|versus|against)\s+(?:dark|darkness)/gi,
      /\bdark\s+lord\b/gi,
      /\bevil\s+(?:empire|king|sorcerer|wizard)\b/gi,
      /\bmagical\s+artifact\b/gi,
      /\belves?\s+(?:and|with)\s+dwarves\b/gi,
      /\bdragon(?:s?)\s+(?:hoard|treasure)/gi,
      /\bcoming\s+of\s+age\s+(?:story|tale|journey)/gi,
      /\borphan(?:ed)?\s+(?:boy|girl|child|hero)/gi
    ],

    magicSystems: [
      /\bmagic\s+(?:without|with\s+no)\s+(?:cost|price|limit)/gi,
      /\bunlimited\s+(?:magic|power)/gi,
      /\bmagic\s+words?\s+(?:activate|trigger)/gi,
      /\bmagic\s+wands?\b/gi
    ],

    creatures: [
      /\b(?:evil|dark|corrupted)\s+(?:elves|dwarves|humans)/gi,
      /\b(?:good|noble|wise)\s+(?:elves|wizards)/gi,
      /\bdragons?\s+(?:guarding|protecting|hoarding)/gi,
      /\borcs?\s+and\s+goblins\b/gi
    ],

    settings: [
      /\bmedieval\s+(?:Europe|setting|kingdom)/gi,
      /\b(?:castle|fortress)\s+on\s+a\s+hill/gi,
      /\btavern\s+(?:where|that)\s+(?:adventurers|heroes)/gi
    ]
  },

  scifi: {
    tropes: [
      /\bevil\s+(?:AI|artificial\s+intelligence)/gi,
      /\brobot(?:s?)\s+(?:uprising|rebellion|revolt)/gi,
      /\btime\s+(?:travel\s+)?paradox/gi,
      /\balien\s+invasion/gi,
      /\b(?:faster|slower)\s+than\s+light\s+travel/gi,
      /\bwarp\s+(?:drive|speed)/gi,
      /\bteleport(?:ation|er)/gi,
      /\bcryogenic\s+(?:sleep|freezing)/gi,
      /\bdystopian\s+future/gi,
      /\bclones?\s+(?:of|replacing)/gi
    ],

    technology: [
      /\blaser\s+(?:sword|saber|blade)/gi,
      /\bforce\s+field/gi,
      /\bhologram(?:s?)\s+(?:that|which)/gi,
      /\bfuturistic\s+(?:technology|gadget|device)/gi,
      /\bnanobots?\s+(?:that|which)\s+(?:can|will)/gi
    ],

    settings: [
      /\bspace\s+station\b/gi,
      /\bdistant\s+planet/gi,
      /\balien\s+(?:world|planet)/gi,
      /\bpost-apocalyptic\s+(?:world|earth)/gi
    ]
  },

  horror: {
    tropes: [
      /\bancient\s+(?:evil|curse|demon)/gi,
      /\bhaunted\s+(?:house|mansion|castle)/gi,
      /\bbuilt\s+on\s+(?:an?\s+)?(?:ancient\s+)?(?:burial|indian)\s+ground/gi,
      /\bzombie\s+(?:outbreak|apocalypse)/gi,
      /\bvampires?\s+(?:and|vs\.?)\s+werewolves/gi,
      /\bdemonic\s+possession/gi,
      /\bblood\s+sacrifice/gi,
      /\bold\s+book\s+of\s+(?:spells|summoning)/gi,
      /\bdeal\s+with\s+(?:the\s+)?devil/gi,
      /\bcursed\s+(?:object|artifact|item)/gi
    ],

    settings: [
      /\babandoned\s+(?:house|asylum|hospital|school)/gi,
      /\bcreaky\s+(?:floors|doors|stairs)/gi,
      /\bdark\s+and\s+stormy\s+night/gi,
      /\bisolated\s+(?:cabin|house|location)/gi,
      /\bfog(?:gy)?\s+(?:night|evening|forest)/gi
    ],

    victims: [
      /\bteenagers?\s+(?:alone|camping|partying)/gi,
      /\binvestigat(?:ing|e)\s+(?:strange|mysterious)\s+(?:noises?|sounds?|events?)/gi,
      /\bsplitting\s+up\s+(?:to|is)\s+(?:search|investigate)/gi
    ]
  },

  contemporary: {
    tropes: [
      /\bmisunderstood\s+(?:artist|genius)/gi,
      /\bsmall\s+town\s+(?:with\s+a\s+)?secret/gi,
      /\bhigh\s+school\s+(?:drama|romance)/gi,
      /\brags\s+to\s+riches/gi,
      /\bworkaholic\s+(?:learns|discovers)/gi,
      /\bdiscover(?:s|ing)\s+(?:themselves|who\s+they\s+really\s+are)/gi
    ],

    settings: [
      /\bquaint\s+(?:village|town)/gi,
      /\bbustling\s+city/gi,
      /\bcoffee\s+shop\s+(?:where|that)/gi
    ]
  }
};

// ============================================================================
// SCORING CONFIGURATION
// ============================================================================

/**
 * Weight multipliers for different types of clichés
 * Higher weight = more severe penalty
 */
const CLICHE_WEIGHTS = {
  // Universal patterns
  naming: 1.0,
  descriptors: 0.8,  // Increased from 0.5 - when repeated, should be penalized
  phrases: 0.8,

  // Genre-specific patterns
  tropes: 1.5,  // Most severe - these are plot/concept clichés
  magicSystems: 1.2,
  technology: 1.0,
  creatures: 0.8,
  settings: 0.7,
  victims: 0.9
};

/**
 * Thresholds for scoring
 */
const SCORING_CONFIG = {
  // Ideal state: no clichés
  maxScore: 10,

  // Points deducted per cliché (weighted)
  // Increased from 0.3 to 0.5 to be more aggressive on clichés
  penaltyPerMatch: 0.5,

  // Minimum score (even if many clichés found)
  minScore: 0,

  // If descriptor/phrase appears this many times, it's definitely a cliché
  repetitionThreshold: 3,

  // Score threshold for regeneration recommendation
  regenerateThreshold: 7.0
};

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

/**
 * Detect clichés in text and calculate originality score
 *
 * @param {string} text - Text to analyze
 * @param {string} [genre='fantasy'] - Genre for genre-specific patterns
 * @returns {Object} Detection results with the following properties:
 *   - score {number} - Originality score on 0-10 scale
 *   - overallScore {number} - Originality score as percentage (0-100)
 *   - detected {Array} - Array of detected cliché matches
 *   - issues {Array} - Alias for 'detected' (backward compatibility)
 *   - summary {Object} - Statistics about detected clichés
 *   - shouldRegenerate {boolean} - Whether content should be regenerated
 *   - recommendations {Array} - Actionable improvement suggestions
 *
 * @example
 * const result = detectCliches(worldText, 'fantasy');
 * console.log(result.score); // 7.5 (out of 10)
 * console.log(result.overallScore); // 75 (percentage)
 * console.log(result.shouldRegenerate); // false
 * console.log(result.detected); // Array of detected clichés
 * console.log(result.issues); // Same as result.detected
 */
export function detectCliches(text, genre = 'fantasy') {
  if (!text || typeof text !== 'string') {
    return {
      score: 10,
      overallScore: 100, // 0-100 percentage scale
      detected: [],
      issues: [], // Alias for 'detected' (for backward compatibility)
      summary: { total: 0, byCategory: {} },
      shouldRegenerate: false,
      recommendations: []
    };
  }

  // Normalize genre
  genre = genre.toLowerCase();

  // Collect all matches
  const allMatches = [];

  // Check universal patterns
  for (const [category, patterns] of Object.entries(UNIVERSAL_PATTERNS)) {
    const matches = findPatternMatches(text, patterns, category, 'universal');
    allMatches.push(...matches);
  }

  // Check genre-specific patterns
  if (GENRE_PATTERNS[genre]) {
    for (const [category, patterns] of Object.entries(GENRE_PATTERNS[genre])) {
      const matches = findPatternMatches(text, patterns, category, genre);
      allMatches.push(...matches);
    }
  }

  // Filter for repetition (descriptors used 3+ times are definitely clichés)
  const filteredMatches = filterByRepetition(allMatches, text);

  // Calculate score
  const score = calculateOriginalityScore(filteredMatches);

  // Generate summary
  const summary = generateSummary(filteredMatches);

  // Generate recommendations
  const recommendations = generateRecommendations(filteredMatches, score);

  const roundedScore = Math.round(score * 10) / 10;

  return {
    score: roundedScore, // 0-10 scale (for backward compatibility)
    overallScore: roundedScore * 10, // 0-100 percentage scale
    detected: filteredMatches,
    issues: filteredMatches, // Alias for 'detected' (for backward compatibility)
    summary,
    shouldRegenerate: score < SCORING_CONFIG.regenerateThreshold,
    recommendations
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Find all matches for a set of patterns
 */
function findPatternMatches(text, patterns, category, genre) {
  const matches = [];

  for (const pattern of patterns) {
    let match;
    const regex = new RegExp(pattern.source, pattern.flags);

    while ((match = regex.exec(text)) !== null) {
      matches.push({
        text: match[0],
        category,
        genre,
        index: match.index,
        weight: CLICHE_WEIGHTS[category] || 1.0,
        pattern: pattern.source
      });
    }
  }

  return matches;
}

/**
 * Filter matches by repetition threshold
 * For descriptors/phrases, only flag if used 3+ times
 */
function filterByRepetition(matches, text) {
  const lowSeverityCategories = ['descriptors', 'phrases'];

  // Group by matched text (case-insensitive)
  const grouped = {};

  for (const match of matches) {
    const key = match.text.toLowerCase();
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(match);
  }

  // Filter out low-severity items that don't meet repetition threshold
  const filtered = [];

  for (const [key, group] of Object.entries(grouped)) {
    const firstMatch = group[0];

    if (lowSeverityCategories.includes(firstMatch.category)) {
      // Only include if repeated 3+ times
      if (group.length >= SCORING_CONFIG.repetitionThreshold) {
        // Add all instances
        filtered.push(...group.map(m => ({
          ...m,
          repetitionCount: group.length,
          repetitionNote: `Used ${group.length} times`
        })));
      }
    } else {
      // High-severity clichés: always include
      filtered.push(...group.map(m => ({
        ...m,
        repetitionCount: group.length,
        repetitionNote: group.length > 1 ? `Used ${group.length} times` : null
      })));
    }
  }

  return filtered;
}

/**
 * Calculate originality score based on detected clichés
 */
function calculateOriginalityScore(matches) {
  let score = SCORING_CONFIG.maxScore;

  for (const match of matches) {
    const penalty = SCORING_CONFIG.penaltyPerMatch * match.weight;
    score -= penalty;
  }

  // Ensure score stays within bounds
  return Math.max(SCORING_CONFIG.minScore, Math.min(SCORING_CONFIG.maxScore, score));
}

/**
 * Generate summary statistics
 */
function generateSummary(matches) {
  const byCategory = {};
  const byGenre = {};

  for (const match of matches) {
    // By category
    if (!byCategory[match.category]) {
      byCategory[match.category] = 0;
    }
    byCategory[match.category]++;

    // By genre
    if (!byGenre[match.genre]) {
      byGenre[match.genre] = 0;
    }
    byGenre[match.genre]++;
  }

  // Get unique cliché count (deduplicate identical matches)
  const uniqueCliches = new Set(matches.map(m => m.text.toLowerCase())).size;

  return {
    total: matches.length,
    uniqueCliches,
    byCategory,
    byGenre
  };
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(matches, score) {
  const recommendations = [];

  if (score >= 9.0) {
    recommendations.push({
      type: 'success',
      message: 'Excellent originality! Very few or no clichés detected.'
    });
    return recommendations;
  }

  if (score >= 7.0) {
    recommendations.push({
      type: 'info',
      message: 'Good originality. Minor improvements possible.'
    });
  } else {
    recommendations.push({
      type: 'warning',
      message: 'Originality could be improved. Consider regenerating with more specific instructions to avoid common tropes.'
    });
  }

  // Specific recommendations by category
  const categoryCounts = matches.reduce((acc, m) => {
    acc[m.category] = (acc[m.category] || 0) + 1;
    return acc;
  }, {});

  // Naming issues
  if (categoryCounts.naming >= 3) {
    recommendations.push({
      type: 'naming',
      message: 'Avoid generic naming patterns like "The Ancient X" or "Y of Darkness". Use specific, unique names instead.',
      examples: matches.filter(m => m.category === 'naming').slice(0, 3).map(m => m.text)
    });
  }

  // Trope issues
  if (categoryCounts.tropes >= 2) {
    recommendations.push({
      type: 'tropes',
      message: 'Common tropes detected. Try subverting expectations or combining elements in unexpected ways.',
      examples: matches.filter(m => m.category === 'tropes').slice(0, 3).map(m => m.text)
    });
  }

  // Descriptor overuse
  if (categoryCounts.descriptors >= 3) {
    recommendations.push({
      type: 'descriptors',
      message: 'Overused atmospheric words detected. Replace with concrete, specific details instead.',
      examples: matches.filter(m => m.category === 'descriptors').slice(0, 3).map(m => m.text)
    });
  }

  return recommendations;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a detailed breakdown of detected clichés by category
 * Useful for debugging or detailed UI display
 */
export function getClicheBreakdown(detectionResult) {
  const breakdown = {};

  for (const match of detectionResult.detected) {
    const category = match.category;

    if (!breakdown[category]) {
      breakdown[category] = {
        count: 0,
        weight: match.weight,
        examples: []
      };
    }

    breakdown[category].count++;

    // Add to examples (limit to 5 per category)
    if (breakdown[category].examples.length < 5) {
      breakdown[category].examples.push({
        text: match.text,
        repetitionCount: match.repetitionCount,
        index: match.index
      });
    }
  }

  return breakdown;
}

/**
 * Format detection result for display
 * Returns human-readable string
 */
export function formatDetectionResult(result) {
  const lines = [];

  lines.push(`Originality Score: ${result.score}/10`);
  lines.push(`Total Clichés Detected: ${result.summary.total} (${result.summary.uniqueCliches} unique)`);

  if (result.shouldRegenerate) {
    lines.push('\n⚠️ Regeneration recommended');
  }

  if (result.recommendations.length > 0) {
    lines.push('\nRecommendations:');
    for (const rec of result.recommendations) {
      lines.push(`- ${rec.message}`);
      if (rec.examples && rec.examples.length > 0) {
        lines.push(`  Examples: ${rec.examples.join(', ')}`);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Add custom cliché patterns
 * Allows users/developers to extend the detector
 */
export function addCustomPatterns(genre, category, patterns) {
  if (!GENRE_PATTERNS[genre]) {
    GENRE_PATTERNS[genre] = {};
  }

  if (!GENRE_PATTERNS[genre][category]) {
    GENRE_PATTERNS[genre][category] = [];
  }

  // Convert strings to RegExp objects
  const regexPatterns = patterns.map(p => {
    if (p instanceof RegExp) return p;
    return new RegExp(p, 'gi');
  });

  GENRE_PATTERNS[genre][category].push(...regexPatterns);

  return true;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  detectCliches,
  getClicheBreakdown,
  formatDetectionResult,
  addCustomPatterns,
  // Export constants for testing/configuration
  UNIVERSAL_PATTERNS,
  GENRE_PATTERNS,
  CLICHE_WEIGHTS,
  SCORING_CONFIG
};
