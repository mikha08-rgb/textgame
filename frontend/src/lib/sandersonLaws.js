/**
 * Sanderson's Laws of Magic Implementation
 *
 * Implements both hard and soft magic frameworks:
 * - Sanderson's Second Law: "Limitations > Powers" (hard magic)
 * - Sanderson's First Law: Magic can't solve conflicts unless understood (soft magic)
 *
 * Part of Phase 1: Quick Wins (Task 1.4)
 */

// ============================================================================
// MAGIC STYLE DETECTION
// ============================================================================

/**
 * Keywords indicating soft magic preference
 */
const SOFT_MAGIC_KEYWORDS = [
  'soft magic',
  'soft-magic',
  'mysterious magic',
  'undefined magic',
  'atmospheric magic',
  'tolkien',
  'tolkien style',
  'tolkien-style',
  'wonder',
  'mysterious',
  'mystical',
  'enigmatic',
  'unknowable',
  'ancient mystery',
  'vague magic',
  'unexplained',
  'poetic magic',
  'mythical'
];

/**
 * Keywords indicating hard magic preference
 */
const HARD_MAGIC_KEYWORDS = [
  'hard magic',
  'hard-magic',
  'sanderson',
  'sanderson style',
  'magic system',
  'magic rules',
  'defined magic',
  'systematic magic',
  'scientific magic',
  'clear rules',
  'limitations',
  'costs',
  'constraints'
];

/**
 * Detect magic style from user input
 *
 * @param {string} text - User input describing their world
 * @returns {Object} - Detection result with style and confidence
 *
 * @example
 * detectMagicStyle("A world with soft magic and mysterious forces")
 * // Returns: { style: 'soft', confidence: 0.9, detected: true }
 */
export function detectMagicStyle(text) {
  if (!text || typeof text !== 'string') {
    return {
      style: 'hard', // Default
      confidence: 0.0,
      detected: false,
      reason: 'No input provided, using default'
    };
  }

  const normalizedText = text.toLowerCase();

  // Check for explicit mentions
  let softMatches = 0;
  let hardMatches = 0;

  for (const keyword of SOFT_MAGIC_KEYWORDS) {
    if (normalizedText.includes(keyword)) {
      softMatches++;
    }
  }

  for (const keyword of HARD_MAGIC_KEYWORDS) {
    if (normalizedText.includes(keyword)) {
      hardMatches++;
    }
  }

  // Determine style
  if (softMatches > hardMatches) {
    return {
      style: 'soft',
      confidence: Math.min(0.5 + (softMatches * 0.2), 1.0),
      detected: true,
      reason: `Detected ${softMatches} soft magic keyword${softMatches > 1 ? 's' : ''}`
    };
  } else if (hardMatches > softMatches) {
    return {
      style: 'hard',
      confidence: Math.min(0.5 + (hardMatches * 0.2), 1.0),
      detected: true,
      reason: `Detected ${hardMatches} hard magic keyword${hardMatches > 1 ? 's' : ''}`
    };
  }

  // Default to hard magic (better for worldbuilding)
  return {
    style: 'hard',
    confidence: 0.5,
    detected: false,
    reason: 'No explicit preference detected, defaulting to hard magic'
  };
}

// ============================================================================
// SANDERSON'S SECOND LAW - HARD MAGIC
// ============================================================================

/**
 * Sanderson's Second Law: "Limitations > Powers"
 *
 * For hard magic systems, powers are less interesting than limitations.
 * Well-defined limitations make magic feel real and create story opportunities.
 */

export const SANDERSON_SECOND_LAW = {
  name: "Sanderson's Second Law",
  principle: "Limitations > Powers",
  description: "The limitations of a magic system are more interesting than its powers. Well-defined limitations make magic feel real and create story opportunities.",

  // Four required limitation types
  limitationTypes: {
    constraints: {
      name: 'Constraints',
      description: 'What the magic/technology CANNOT do',
      examples: [
        'Cannot affect living minds directly',
        'Only works on metals',
        'Cannot create matter from nothing',
        'Range limited to 50 meters'
      ],
      minimumRequired: 2
    },

    costs: {
      name: 'Costs',
      description: 'What the magic/technology REQUIRES to function',
      examples: [
        '1 gram of copper dust per 5 minutes of use',
        'Drains 2 years of lifespan per casting',
        'Requires 8 hours of sunlight exposure to recharge',
        'Costs 500 gold per activation'
      ],
      minimumRequired: 1,
      requiresMeasurements: true // Must include numbers/specifics
    },

    vulnerabilities: {
      name: 'Vulnerabilities',
      description: 'What can DEFEAT or block the magic/technology',
      examples: [
        'Aluminum completely blocks all effects',
        'Salt water disrupts signals',
        'Iron nullifies the magic',
        'Counter-frequency at 440Hz cancels it'
      ],
      minimumRequired: 1
    },

    socialRestrictions: {
      name: 'Social Restrictions',
      description: 'How society CONTROLS or LIMITS the magic/technology',
      examples: [
        'Guild licensing required (500 gold fee)',
        'Forbidden by religious law, punishable by death',
        'Only nobility allowed to practice',
        'Government registration and monthly reporting mandatory'
      ],
      minimumRequired: 1
    }
  }
};

/**
 * Generate hard magic prompt guidance
 */
export function getHardMagicGuidance() {
  return `
═══════════════════════════════════════════════════════
SANDERSON'S SECOND LAW: HARD MAGIC SYSTEM REQUIREMENTS
═══════════════════════════════════════════════════════

"Limitations > Powers" — Brandon Sanderson

For every magic or technology system, you MUST define 4 types of limitations.
These limitations are MORE IMPORTANT than the powers themselves.

**REQUIRED: All 4 Limitation Types**

1. **CONSTRAINTS** (What it CAN'T do):
   - Minimum: 2 specific things the system cannot accomplish
   - Be explicit about boundaries
   - Examples:
     • "Cannot affect living minds directly"
     • "Only works on metals within 50 meters"
     • "Cannot create matter, only transform existing matter"

2. **COSTS** (What it REQUIRES):
   - Minimum: 1 concrete cost with measurements
   - MUST include numbers/quantities/specifics
   - Examples:
     • "Requires 1 gram of copper dust per 5 minutes"
     • "Drains 2 years of lifespan per use"
     • "Costs 500 gold coins per activation"
     • "Requires 8 hours of sunlight exposure to recharge"

3. **VULNERABILITIES** (What DEFEATS it):
   - Minimum: 1 way the system can be blocked or countered
   - Should be specific and exploitable
   - Examples:
     • "Aluminum completely blocks all magical effects"
     • "Salt water disrupts the energy flow"
     • "Iron nullifies the magic within 10 meters"
     • "Counter-frequency at 440Hz cancels the effect"

4. **SOCIAL RESTRICTIONS** (How society LIMITS it):
   - Minimum: 1 legal, cultural, or institutional control
   - Shows how ordinary people deal with this power
   - Examples:
     • "Guild licensing required, costs 500 gold"
     • "Forbidden by religious law, death penalty"
     • "Only nobility permitted to practice"
     • "Government registration and Form 27-B monthly"

**WHY THIS MATTERS:**

Without all 4 limitation types, magic feels like "I win" button.
Limitations create:
- Story conflict (characters work around limits)
- Believability (feels like real physics)
- Strategy (clever use within constraints)
- Stakes (costs make choices meaningful)

**VALIDATION:**

Before finalizing your world, check:
- [ ] 2+ Constraints listed
- [ ] 1+ Cost with specific measurements
- [ ] 1+ Vulnerability that can be exploited
- [ ] 1+ Social restriction affecting daily life

If any checkbox is empty, add that limitation type before proceeding.
`;
}

// ============================================================================
// SANDERSON'S FIRST LAW - SOFT MAGIC
// ============================================================================

/**
 * Sanderson's First Law: Soft Magic Framework
 *
 * "An author's ability to solve conflict with magic is DIRECTLY PROPORTIONAL
 * to how well the reader understands said magic."
 *
 * For soft magic: Keep it mysterious, don't solve main conflicts with it.
 */

export const SANDERSON_FIRST_LAW = {
  name: "Sanderson's First Law",
  principle: "Magic can only solve problems proportional to reader understanding",
  description: "Soft magic must remain mysterious and cannot solve main conflicts. It creates atmosphere and complications, not solutions.",

  // Guidelines for soft magic
  guidelines: {
    mystery: {
      name: 'Preserve Mystery',
      description: 'Keep the magic unexplained and wondrous',
      rules: [
        'Do NOT explain how magic works mechanically',
        'Avoid defining limitations explicitly',
        'Maintain sense of ancient, unknowable power',
        'Focus on atmospheric and emotional impact'
      ]
    },

    conflicts: {
      name: 'Cannot Solve Main Conflicts',
      description: 'Magic must not be a convenient solution',
      rules: [
        'Magic can CREATE problems (complications welcome)',
        'Magic CANNOT solve the central conflict',
        'Avoid Deus Ex Machina (magic saves the day)',
        'If magic solves something, make it small/secondary'
      ]
    },

    characterization: {
      name: 'Belongs to Mysterious Characters',
      description: 'Soft magic users should be enigmatic',
      rules: [
        'Powerful magic belongs to gods, ancient beings, wizards',
        'POV characters should NOT understand it fully',
        'The less a character knows, the softer magic can be',
        'Distance creates mystery (ancient ruins, lost civilizations)'
      ]
    },

    atmosphere: {
      name: 'Serves Mood and Wonder',
      description: 'Magic creates feeling, not function',
      rules: [
        'Emphasize beauty, terror, or grandeur',
        'Use poetic, evocative descriptions',
        'Sensory details over mechanical explanations',
        'Magic feels dangerous and unpredictable'
      ]
    }
  }
};

/**
 * Generate soft magic prompt guidance
 */
export function getSoftMagicGuidance() {
  return `
═══════════════════════════════════════════════════════
SANDERSON'S FIRST LAW: SOFT MAGIC SYSTEM REQUIREMENTS
═══════════════════════════════════════════════════════

"An author's ability to solve conflict with magic is DIRECTLY PROPORTIONAL
to how well the reader understands said magic." — Brandon Sanderson

For soft magic: Keep it MYSTERIOUS. Magic creates ATMOSPHERE, not solutions.

**REQUIRED: Follow These Guidelines**

1. **PRESERVE MYSTERY**
   - DO NOT explain how magic works mechanically
   - Avoid defining specific limitations or rules
   - Maintain sense of ancient, unknowable power
   - Focus on atmospheric and emotional impact
   - Examples:
     • "Ancient forces stir in forgotten places"
     • "The old magic responds to need, not command"
     • "Gods weave fate in ways mortals cannot fathom"

2. **CANNOT SOLVE MAIN CONFLICTS** (Critical!)
   - Magic CAN create problems (complications welcome)
   - Magic CANNOT solve the central conflict
   - Avoid Deus Ex Machina (magic conveniently saves the day)
   - If magic solves something, make it small/secondary
   - Examples:
     • Magic creates the curse, heroes must solve it mundanely
     • Magic blocks a path, forcing alternate route
     • Magic makes things worse, not better

3. **BELONGS TO MYSTERIOUS CHARACTERS**
   - Powerful magic belongs to:
     • Gods and divine beings
     • Ancient wizards shrouded in legend
     • Lost civilizations (ruins, artifacts)
     • Forces of nature personified
   - POV characters should NOT fully understand it
   - Distance creates mystery (ancient, far away, incomprehensible)

4. **SERVES MOOD AND WONDER**
   - Magic creates FEELING, not function
   - Emphasize beauty, terror, grandeur, or dread
   - Use poetic, evocative descriptions (not technical)
   - Sensory details: "silver moonlight weaving shadows"
   - Magic feels dangerous, unpredictable, alive

**WHY THIS MATTERS:**

Soft magic creates wonder and atmosphere. It makes the world feel vast
and mysterious. But it MUST NOT be a convenient "win button" or it breaks
the story's believability.

**EXAMPLES OF EXCELLENT SOFT MAGIC:**

✅ Gandalf (Lord of the Rings) - mysterious, we don't know his limits
✅ The Force (original Star Wars) - mystical, unexplained power
✅ Old magic in Narnia - ancient, poetic, beyond understanding

❌ "Magic solves the problem at the last second" - BAD soft magic
❌ "Wizard explains exactly how spell works" - That's hard magic!

**VALIDATION:**

Before finalizing, check:
- [ ] Magic mechanics left unexplained/mysterious
- [ ] Magic does NOT solve main conflict
- [ ] Magic creates atmosphere and complications
- [ ] Powerful magic belongs to distant/mysterious entities
- [ ] Descriptions are poetic, not technical

If any checkbox is empty, adjust the magic to be more mysterious and less convenient.
`;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate hard magic system has required limitations
 *
 * @param {Object} magicSystem - Magic system object from generated world
 * @returns {Object} - Validation result
 */
export function validateHardMagic(magicSystem) {
  if (!magicSystem) {
    return {
      valid: false,
      missing: ['entire magic system'],
      score: 0
    };
  }

  const missing = [];
  let score = 0;

  // Check Constraints (need 2+)
  const constraints = magicSystem.constraints || magicSystem.limitations || [];
  if (Array.isArray(constraints) && constraints.length >= 2) {
    score += 2.5;
  } else {
    missing.push('constraints (need 2+)');
  }

  // Check Costs (need 1+ with measurements)
  const costs = magicSystem.costs || magicSystem.cost || '';
  const hasCosts = costs && typeof costs === 'string' && costs.length > 10;
  const hasNumbers = hasCosts && /\d+/.test(costs);
  if (hasCosts && hasNumbers) {
    score += 2.5;
  } else if (hasCosts) {
    score += 0; // No points for costs without measurements (strict)
    missing.push('costs need specific measurements/numbers');
  } else {
    missing.push('costs (what it requires)');
  }

  // Check Vulnerabilities (need 1+)
  const vulnerabilities = magicSystem.vulnerabilities || magicSystem.weaknesses || [];
  if ((Array.isArray(vulnerabilities) && vulnerabilities.length >= 1) ||
      (typeof vulnerabilities === 'string' && vulnerabilities.length > 10)) {
    score += 2.5;
  } else {
    missing.push('vulnerabilities (what defeats it)');
  }

  // Check Social Restrictions (need 1+)
  const socialRestrictions = magicSystem.socialRestrictions ||
                             magicSystem.socialLimitations ||
                             magicSystem.legalRestrictions || [];
  if ((Array.isArray(socialRestrictions) && socialRestrictions.length >= 1) ||
      (typeof socialRestrictions === 'string' && socialRestrictions.length > 10)) {
    score += 2.5;
  } else {
    missing.push('social restrictions (how society limits it)');
  }

  return {
    valid: score >= 8.0, // Need 8/10 points minimum
    score,
    missing,
    suggestions: missing.length > 0 ? [
      `Add missing limitation types: ${missing.join(', ')}`,
      'See Sanderson\'s Second Law guidance for examples'
    ] : []
  };
}

/**
 * Validate soft magic preserves mystery and doesn't solve conflicts
 *
 * @param {Object} magicSystem - Magic system object from generated world
 * @returns {Object} - Validation result
 */
export function validateSoftMagic(magicSystem) {
  if (!magicSystem) {
    return {
      valid: false,
      issues: ['No magic system defined'],
      score: 0
    };
  }

  const issues = [];
  let score = 10; // Start at perfect, deduct for violations

  // Check if mechanics are over-explained (BAD for soft magic)
  const description = JSON.stringify(magicSystem).toLowerCase();

  if (description.includes('costs') && /\d+/.test(description)) {
    score -= 2;
    issues.push('Magic costs are too specific (keep mysterious for soft magic)');
  }

  if (description.includes('rule') || description.includes('limitation')) {
    score -= 2;
    issues.push('Avoid explicit rules/limitations in soft magic');
  }

  if (description.includes('constraint')) {
    score -= 2;
    issues.push('Avoid defining constraints in soft magic');
  }

  // Check for Deus Ex Machina language (BAD)
  const deusExPatterns = ['solves', 'resolves', 'fixes', 'saves the day', 'saves', 'rescues'];
  if (deusExPatterns.some(pattern => description.includes(pattern))) {
    score -= 5; // Increased to 5 to ensure it fails validation (10 - 5 = 5 < 7.0)
    issues.push('CRITICAL: Magic should not solve main conflicts (Sanderson\'s First Law)');
  }

  // Check for good soft magic indicators (GOOD)
  const goodPatterns = ['mysterious', 'ancient', 'unknowable', 'enigmatic', 'wonder'];
  if (goodPatterns.some(pattern => description.includes(pattern))) {
    score += 2; // Bonus points
  }

  return {
    valid: score > 7.0, // Changed from >= to > for stricter validation
    score: Math.max(0, Math.min(10, score)),
    issues,
    suggestions: issues.length > 0 ? [
      'Remove mechanical explanations',
      'Add mysterious, atmospheric descriptions',
      'Ensure magic cannot solve main conflicts'
    ] : []
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get appropriate guidance based on detected style
 */
export function getMagicGuidance(text) {
  const detection = detectMagicStyle(text);

  if (detection.style === 'soft') {
    return {
      style: 'soft',
      law: SANDERSON_FIRST_LAW,
      guidance: getSoftMagicGuidance(),
      detection
    };
  } else {
    return {
      style: 'hard',
      law: SANDERSON_SECOND_LAW,
      guidance: getHardMagicGuidance(),
      detection
    };
  }
}

/**
 * Validate magic system based on detected style
 */
export function validateMagicSystem(magicSystem, style = 'hard') {
  if (style === 'soft') {
    return validateSoftMagic(magicSystem);
  } else {
    return validateHardMagic(magicSystem);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Detection
  detectMagicStyle,

  // Laws
  SANDERSON_FIRST_LAW,
  SANDERSON_SECOND_LAW,

  // Guidance
  getHardMagicGuidance,
  getSoftMagicGuidance,
  getMagicGuidance,

  // Validation
  validateHardMagic,
  validateSoftMagic,
  validateMagicSystem
};
