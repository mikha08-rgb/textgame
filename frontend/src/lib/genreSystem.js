/**
 * Genre Detection and Configuration System
 *
 * Provides:
 * - Automatic genre detection from user input
 * - Genre-specific quality principle weights
 * - Genre-specific cliché lists and focus areas
 * - Multi-genre blend support
 *
 * Part of Phase 1: Quick Wins (Task 1.3)
 */

// ============================================================================
// GENRE DEFINITIONS
// ============================================================================

/**
 * Available genres with metadata
 */
export const GENRES = {
  fantasy: {
    id: 'fantasy',
    name: 'Fantasy',
    description: 'Magic, mythical creatures, alternate worlds',
    icon: '🐉',
    color: '#8B4789'
  },
  scifi: {
    id: 'scifi',
    name: 'Science Fiction',
    description: 'Technology, space, future societies',
    icon: '🚀',
    color: '#2563EB'
  },
  horror: {
    id: 'horror',
    name: 'Horror',
    description: 'Fear, dread, supernatural threats',
    icon: '👻',
    color: '#DC2626'
  },
  contemporary: {
    id: 'contemporary',
    name: 'Contemporary',
    description: 'Modern/realistic settings, current day',
    icon: '🏙️',
    color: '#059669'
  },
  historical: {
    id: 'historical',
    name: 'Historical',
    description: 'Past eras, real historical events',
    icon: '📜',
    color: '#D97706'
  },
  dystopian: {
    id: 'dystopian',
    name: 'Dystopian',
    description: 'Oppressive societies, post-apocalyptic',
    icon: '🏚️',
    color: '#6B7280'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'High tech, low life, corporate dystopia',
    icon: '🌆',
    color: '#EC4899'
  },
  steampunk: {
    id: 'steampunk',
    name: 'Steampunk',
    description: 'Victorian era, steam-powered technology',
    icon: '⚙️',
    color: '#92400E'
  }
};

// ============================================================================
// KEYWORD DETECTION
// ============================================================================

/**
 * Keywords for genre detection
 * Each keyword has a weight (importance) and associated genre
 */
const GENRE_KEYWORDS = {
  fantasy: [
    // Magic-related
    { word: 'magic', weight: 3 },
    { word: 'magical', weight: 2 },
    { word: 'mage', weight: 3 },
    { word: 'wizard', weight: 3 },
    { word: 'sorcerer', weight: 3 },
    { word: 'witch', weight: 2 },
    { word: 'spell', weight: 2 },
    { word: 'enchant', weight: 2 },
    { word: 'curse', weight: 1 },

    // Creatures
    { word: 'dragon', weight: 3 },
    { word: 'elf', weight: 3 },
    { word: 'elves', weight: 3 },
    { word: 'dwarf', weight: 3 },
    { word: 'dwarves', weight: 3 },
    { word: 'orc', weight: 2 },
    { word: 'goblin', weight: 2 },
    { word: 'fairy', weight: 2 },
    { word: 'unicorn', weight: 2 },

    // Settings
    { word: 'kingdom', weight: 2 },
    { word: 'realm', weight: 2 },
    { word: 'castle', weight: 1 },
    { word: 'dungeon', weight: 1 },
    { word: 'medieval', weight: 2 },
    { word: 'quest', weight: 2 }
  ],

  scifi: [
    // Technology
    { word: 'technology', weight: 2 },
    { word: 'robot', weight: 3 },
    { word: 'android', weight: 3 },
    { word: 'cyborg', weight: 3 },
    { word: 'AI', weight: 2 },
    { word: 'artificial intelligence', weight: 3 },
    { word: 'computer', weight: 1 },
    { word: 'quantum', weight: 2 },
    { word: 'nano', weight: 2 },
    { word: 'tech', weight: 1 },

    // Space
    { word: 'space', weight: 3 },
    { word: 'spaceship', weight: 3 },
    { word: 'spacecraft', weight: 3 },
    { word: 'planet', weight: 2 },
    { word: 'alien', weight: 3 },
    { word: 'extraterrestrial', weight: 3 },
    { word: 'galaxy', weight: 2 },
    { word: 'star system', weight: 2 },
    { word: 'colony', weight: 2 },

    // Future
    { word: 'future', weight: 2 },
    { word: 'futuristic', weight: 2 },
    { word: 'laser', weight: 1 },
    { word: 'plasma', weight: 1 }
  ],

  horror: [
    // Fear/Emotion
    { word: 'horror', weight: 3 },
    { word: 'terror', weight: 3 },
    { word: 'fear', weight: 2 },
    { word: 'dread', weight: 2 },
    { word: 'nightmare', weight: 2 },
    { word: 'scream', weight: 1 },

    // Supernatural
    { word: 'ghost', weight: 3 },
    { word: 'demon', weight: 3 },
    { word: 'spirit', weight: 2 },
    { word: 'haunt', weight: 3 },
    { word: 'haunted', weight: 3 },
    { word: 'haunting', weight: 3 },
    { word: 'possession', weight: 3 },
    { word: 'exorcis', weight: 2 },

    // Monsters
    { word: 'vampire', weight: 3 },
    { word: 'zombie', weight: 3 },
    { word: 'werewolf', weight: 3 },
    { word: 'monster', weight: 2 },
    { word: 'creature', weight: 1 },

    // Settings/Atmosphere
    { word: 'dark', weight: 1 },
    { word: 'blood', weight: 1 },
    { word: 'death', weight: 1 },
    { word: 'murder', weight: 1 }
  ],

  contemporary: [
    { word: 'modern', weight: 2 },
    { word: 'contemporary', weight: 3 },
    { word: 'today', weight: 1 },
    { word: 'current', weight: 1 },
    { word: 'city', weight: 1 },
    { word: 'urban', weight: 1 },
    { word: 'realistic', weight: 2 },
    { word: 'everyday', weight: 2 },
    { word: 'office', weight: 1 },
    { word: 'smartphone', weight: 2 },
    { word: 'internet', weight: 1 },
    { word: 'social media', weight: 2 }
  ],

  historical: [
    { word: 'historical', weight: 3 },
    { word: 'history', weight: 2 },
    { word: 'ancient', weight: 1 },
    { word: 'century', weight: 1 },
    { word: 'era', weight: 1 },
    { word: 'period', weight: 1 },
    { word: 'roman', weight: 2 },
    { word: 'victorian', weight: 2 },
    { word: 'medieval', weight: 1 },  // Can overlap with fantasy
    { word: 'renaissance', weight: 2 },
    { word: 'empire', weight: 1 }
  ],

  dystopian: [
    { word: 'dystopian', weight: 3 },
    { word: 'dystopia', weight: 3 },
    { word: 'oppressive', weight: 2 },
    { word: 'totalitarian', weight: 3 },
    { word: 'authoritarian', weight: 2 },
    { word: 'surveillance', weight: 2 },
    { word: 'rebellion', weight: 2 },
    { word: 'resistance', weight: 1 },
    { word: 'post-apocalyptic', weight: 3 },
    { word: 'wasteland', weight: 2 },
    { word: 'survival', weight: 1 }
  ],

  cyberpunk: [
    { word: 'cyberpunk', weight: 3 },
    { word: 'cyber', weight: 2 },
    { word: 'hacker', weight: 3 },
    { word: 'hacking', weight: 2 },
    { word: 'corporation', weight: 2 },
    { word: 'mega-corp', weight: 3 },
    { word: 'neon', weight: 2 },
    { word: 'virtual reality', weight: 2 },
    { word: 'cyberspace', weight: 3 },
    { word: 'netrunner', weight: 3 },
    { word: 'street', weight: 1 }
  ],

  steampunk: [
    { word: 'steampunk', weight: 3 },
    { word: 'steam', weight: 2 },
    { word: 'clockwork', weight: 3 },
    { word: 'gear', weight: 1 },
    { word: 'brass', weight: 1 },
    { word: 'victorian', weight: 2 },
    { word: 'airship', weight: 3 },
    { word: 'goggles', weight: 1 },
    { word: 'mechanical', weight: 1 }
  ]
};

// ============================================================================
// GENRE DETECTION FUNCTIONS
// ============================================================================

/**
 * Detect genre from user input text
 *
 * @param {string} text - User input describing their world
 * @returns {Object} - Detection results with confidence scores
 *
 * @example
 * detectGenre("A world with magic and dragons")
 * // Returns: { primary: 'fantasy', confidence: 0.85, all: {...} }
 */
export function detectGenre(text) {
  if (!text || typeof text !== 'string') {
    return {
      primary: 'fantasy', // Default
      confidence: 0.0,
      all: {},
      isMultiGenre: false
    };
  }

  const normalizedText = text.toLowerCase();
  const genreScores = {};

  // Calculate scores for each genre
  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    let score = 0;

    for (const { word, weight } of keywords) {
      // Count occurrences (case-insensitive)
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = normalizedText.match(regex);
      if (matches) {
        score += matches.length * weight;
      }
    }

    genreScores[genre] = score;
  }

  // Find highest score
  const sortedGenres = Object.entries(genreScores)
    .sort(([, a], [, b]) => b - a);

  const [primaryGenre, primaryScore] = sortedGenres[0];
  const [secondaryGenre, secondaryScore] = sortedGenres[1] || ['', 0];

  // Calculate confidence (0-1)
  const totalScore = Object.values(genreScores).reduce((sum, s) => sum + s, 0);
  const confidence = totalScore > 0 ? primaryScore / totalScore : 0;

  // Check if multi-genre (secondary is close to primary)
  // Lowered threshold from 0.5 to 0.4 for better multi-genre detection
  const isMultiGenre = secondaryScore > 0 && (secondaryScore / primaryScore) > 0.4;

  return {
    primary: primaryGenre || 'fantasy',
    secondary: isMultiGenre ? secondaryGenre : null,
    confidence: Math.min(confidence, 1.0),
    all: genreScores,
    isMultiGenre,
    suggestions: isMultiGenre
      ? [`Primary: ${primaryGenre}`, `Secondary: ${secondaryGenre}`]
      : [`Detected: ${primaryGenre}`]
  };
}

/**
 * Get genre from explicit user selection or detect from text
 */
export function getGenre(text, explicitGenre = null) {
  if (explicitGenre && GENRES[explicitGenre]) {
    return {
      genre: explicitGenre,
      detected: false,
      confidence: 1.0
    };
  }

  const detection = detectGenre(text);
  return {
    genre: detection.primary,
    detected: true,
    confidence: detection.confidence,
    isMultiGenre: detection.isMultiGenre,
    secondary: detection.secondary
  };
}

// ============================================================================
// GENRE-SPECIFIC CONFIGURATIONS
// ============================================================================

/**
 * Genre-specific quality principle weights
 * Different genres prioritize different aspects of worldbuilding
 */
export const GENRE_CONFIGS = {
  fantasy: {
    // Fantasy prioritizes originality (avoid clichés) and magic system specificity
    principleWeights: {
      originality: 0.35,    // Highest - many fantasy clichés exist
      specificity: 0.25,    // Important for magic systems
      implications: 0.20,   // How magic affects society
      consistency: 0.15,    // Rules must be consistent
      mundaneGrounding: 0.05 // Less critical in fantasy
    },

    // Fantasy-specific clichés to avoid (beyond universal detector)
    additionalCliches: [
      'The chosen one must fulfill the prophecy',
      'Dark lord threatens the kingdom',
      'Ancient evil awakens',
      'Magic solves every problem',
      'Elves are wise, dwarves are gruff',
      'Light versus darkness'
    ],

    // Areas to focus worldbuilding efforts
    focusAreas: [
      'Magic system rules and limitations',
      'Cultural diversity and specificity',
      'Economic impact of magic/creatures',
      'Geography and ecology',
      'Social structures and governance'
    ],

    // Example prompts to inspire users
    examplePrompts: [
      'A world where magic requires mathematical precision',
      'Society where metallic composition determines social class',
      'Magic that drains years of lifespan per use'
    ],

    // Sanderson's Laws emphasis
    emphasizeLimitations: true,  // Strong emphasis on magic system limits
    limitationMultiplier: 1.5    // Extra weight on limitation critique
  },

  scifi: {
    // Sci-fi prioritizes implications (tech → society) and internal consistency
    principleWeights: {
      implications: 0.35,   // Highest - tech always impacts society
      specificity: 0.30,    // Technical details matter
      consistency: 0.20,    // Must follow established rules
      originality: 0.10,    // Less focus than fantasy
      mundaneGrounding: 0.05
    },

    additionalCliches: [
      'Evil AI threatens humanity',
      'Robots gain sentience and rebel',
      'Time travel creates paradoxes',
      'Aliens invade Earth',
      'Technology solves all problems'
    ],

    focusAreas: [
      'Technology and its social implications',
      'Scientific basis for innovations',
      'Economic systems in the future',
      'Political structures and governance',
      'Cultural evolution and diversity'
    ],

    examplePrompts: [
      'Neural interface technology creates new social classes',
      'Faster-than-light travel requires biological modification',
      'AI governs resource allocation, humans adjust culture'
    ],

    emphasizeLimitations: true,
    limitationMultiplier: 1.3
  },

  horror: {
    // Horror prioritizes atmosphere, consistency, and grounding
    principleWeights: {
      consistency: 0.30,    // Rules of horror must be clear
      mundaneGrounding: 0.25, // Horror works through contrast with normal
      specificity: 0.20,    // Concrete details enhance fear
      implications: 0.15,   // How horror affects daily life
      originality: 0.10     // Can use familiar tropes effectively
    },

    additionalCliches: [
      'Built on ancient burial ground',
      'Teenagers investigating alone',
      'Evil is unexplained and unstoppable',
      'Dark and stormy night'
    ],

    focusAreas: [
      'Rules and limitations of horror elements',
      'How normal life is disrupted',
      'Societal response to threats',
      'Sensory details and atmosphere',
      'Escalation and stakes'
    ],

    examplePrompts: [
      'Infection that spreads through shared memories',
      'Horror that only affects those who know about it',
      'Supernatural threat bound by specific rules'
    ],

    emphasizeLimitations: true,
    limitationMultiplier: 1.4  // Horror needs clear rules
  },

  contemporary: {
    // Contemporary prioritizes grounding and implications
    principleWeights: {
      mundaneGrounding: 0.35,  // Highest - must feel realistic
      implications: 0.30,      // Social commentary often present
      specificity: 0.20,       // Concrete modern details
      consistency: 0.10,
      originality: 0.05        // Realism > novelty
    },

    additionalCliches: [
      'Small town with a secret',
      'Misunderstood artist in the city',
      'Workaholic learns to slow down'
    ],

    focusAreas: [
      'Modern social dynamics',
      'Economic realities',
      'Technology in daily life',
      'Contemporary cultural issues',
      'Realistic character motivations'
    ],

    examplePrompts: [
      'City where housing costs force multi-generational cohabitation',
      'Community shaped by specific local industry',
      'Modern culture around emerging technology'
    ],

    emphasizeLimitations: false,
    limitationMultiplier: 1.0
  },

  historical: {
    principleWeights: {
      specificity: 0.35,       // Historical accuracy matters
      consistency: 0.25,       // Must fit historical context
      implications: 0.20,      // How era affects society
      mundaneGrounding: 0.15,
      originality: 0.05
    },

    additionalCliches: [
      'Perfectly accurate historical recreation',
      'Modern sensibilities in historical setting',
      'Ignoring historical social constraints'
    ],

    focusAreas: [
      'Historical accuracy and research',
      'Period-appropriate technology',
      'Social structures of the era',
      'Economic systems',
      'Cultural attitudes and values'
    ],

    examplePrompts: [
      'Renaissance city-state with unique banking system',
      'Roman colony with blended cultures',
      'Medieval trade route connecting diverse societies'
    ],

    emphasizeLimitations: false,
    limitationMultiplier: 1.0
  },

  dystopian: {
    principleWeights: {
      implications: 0.40,      // How oppression affects life
      consistency: 0.25,       // System rules must be clear
      specificity: 0.20,
      mundaneGrounding: 0.10,
      originality: 0.05
    },

    additionalCliches: [
      'Teenagers lead the rebellion',
      'Perfect dystopia with one flaw',
      'Oppression is purely evil with no logic'
    ],

    focusAreas: [
      'Mechanisms of social control',
      'How ordinary people adapt',
      'Economic systems under oppression',
      'Justifications for the system',
      'Points of resistance'
    ],

    examplePrompts: [
      'Society controlled through mandatory memory editing',
      'Resource scarcity creates new social hierarchies',
      'Surveillance state with logical justification'
    ],

    emphasizeLimitations: true,
    limitationMultiplier: 1.2
  },

  cyberpunk: {
    principleWeights: {
      implications: 0.35,      // Tech + society intersection
      specificity: 0.30,       // Technical details
      mundaneGrounding: 0.20,  // Street-level view
      originality: 0.10,
      consistency: 0.05
    },

    additionalCliches: [
      'Hackers can do anything',
      'Corporations are cartoonishly evil',
      'VR is indistinguishable from reality'
    ],

    focusAreas: [
      'Technology and social stratification',
      'Corporate power structures',
      'Underground economies',
      'Cybernetic enhancement implications',
      'Digital vs. physical worlds'
    ],

    examplePrompts: [
      'Neural implants create new social classes',
      'Corporate citizenship replaces national identity',
      'Hacker culture with specific technical constraints'
    ],

    emphasizeLimitations: true,
    limitationMultiplier: 1.3
  },

  steampunk: {
    principleWeights: {
      specificity: 0.35,       // Technical details of steam tech
      implications: 0.25,      // How steam tech affects society
      consistency: 0.20,       // Must follow Victorian + steam rules
      originality: 0.15,
      mundaneGrounding: 0.05
    },

    additionalCliches: [
      'Goggles and gears everywhere',
      'Victorian England exactly but with airships',
      'Steam technology has no limitations'
    ],

    focusAreas: [
      'Steam-powered technology specifics',
      'Victorian social structures',
      'Industrial revolution implications',
      'Class dynamics',
      'Environmental effects'
    ],

    examplePrompts: [
      'Steam technology limited by coal scarcity',
      'Airship travel creates new social classes',
      'Clockwork automation disrupts labor markets'
    ],

    emphasizeLimitations: true,
    limitationMultiplier: 1.4
  }
};

/**
 * Get configuration for a specific genre
 */
export function getGenreConfig(genre) {
  return GENRE_CONFIGS[genre] || GENRE_CONFIGS.fantasy;
}

/**
 * Get blended configuration for multi-genre worlds
 */
export function getBlendedConfig(primaryGenre, secondaryGenre, primaryWeight = 0.7) {
  const primary = getGenreConfig(primaryGenre);
  const secondary = getGenreConfig(secondaryGenre);

  const secondaryWeight = 1 - primaryWeight;

  // Blend principle weights
  const blendedWeights = {};
  for (const principle in primary.principleWeights) {
    blendedWeights[principle] =
      (primary.principleWeights[principle] * primaryWeight) +
      (secondary.principleWeights[principle] * secondaryWeight);
  }

  return {
    principleWeights: blendedWeights,
    additionalCliches: [
      ...primary.additionalCliches,
      ...secondary.additionalCliches
    ],
    focusAreas: [
      ...primary.focusAreas.slice(0, 3),
      ...secondary.focusAreas.slice(0, 2)
    ],
    examplePrompts: [
      ...primary.examplePrompts.slice(0, 2),
      ...secondary.examplePrompts.slice(0, 1)
    ],
    emphasizeLimitations: primary.emphasizeLimitations || secondary.emphasizeLimitations,
    limitationMultiplier: Math.max(primary.limitationMultiplier, secondary.limitationMultiplier),
    isBlended: true,
    genres: [primaryGenre, secondaryGenre]
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get human-readable genre name
 */
export function getGenreName(genreId) {
  return GENRES[genreId]?.name || 'Unknown';
}

/**
 * Get all available genres as array
 */
export function getAllGenres() {
  return Object.values(GENRES);
}

/**
 * Validate genre ID
 */
export function isValidGenre(genreId) {
  return !!GENRES[genreId];
}

/**
 * Format detection result for display
 */
export function formatDetectionResult(detection) {
  const lines = [];

  lines.push(`Primary Genre: ${getGenreName(detection.primary)} (${(detection.confidence * 100).toFixed(0)}% confidence)`);

  if (detection.isMultiGenre && detection.secondary) {
    lines.push(`Secondary Genre: ${getGenreName(detection.secondary)}`);
  }

  if (detection.all && Object.keys(detection.all).length > 0) {
    lines.push('\nGenre Scores:');
    const sorted = Object.entries(detection.all)
      .filter(([, score]) => score > 0)
      .sort(([, a], [, b]) => b - a);

    for (const [genre, score] of sorted) {
      lines.push(`  ${getGenreName(genre)}: ${score}`);
    }
  }

  return lines.join('\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  GENRES,
  detectGenre,
  getGenre,
  getGenreConfig,
  getBlendedConfig,
  getGenreName,
  getAllGenres,
  isValidGenre,
  formatDetectionResult,
  GENRE_CONFIGS
};
