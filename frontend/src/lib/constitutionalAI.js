/**
 * Constitutional AI Self-Critique System
 *
 * Implements generate → critique → revise loop for higher quality worldbuilding
 *
 * Based on Anthropic's Constitutional AI research:
 * - Helps AI evaluate its own outputs against principles
 * - Enables self-improvement through critique and revision
 * - Significantly improves output quality (+30-50%)
 *
 * Phase 1 Enhancement: Integrated Cliché Detection
 * - Automatic pattern-based cliché detection
 * - Genre-specific cliché patterns
 * - Combined scoring for comprehensive quality assessment
 */

import { detectCliches, formatDetectionResult } from './clicheDetector.js';

/**
 * Quality principles for worldbuilding
 * These are used to critique generated content
 */
export const WORLDBUILDING_PRINCIPLES = {
  specificity: {
    name: 'Specificity',
    description: 'Uses concrete numbers, materials, measurements, and sensory details',
    weight: 0.25,
    examples: {
      good: 'granite temple built 847 years ago, smells of copper, walls 3 meters thick',
      bad: 'ancient temple with mysterious atmosphere'
    }
  },

  implications: {
    name: 'Implications',
    description: 'Shows how world elements affect society, economy, culture, and daily life',
    weight: 0.20,
    examples: {
      good: 'Magic users must register with the Guild (500 gold fee), creating a black market for unlicensed practitioners',
      bad: 'Magic exists in this world'
    }
  },

  originality: {
    name: 'Originality',
    description: 'Avoids generic fantasy tropes, clichés, and overused descriptors. No "shadowy", "ancient", "mysterious", "forbidden", "ethereal". No "The [Adjective] [Noun]" naming. No Light vs Dark conflicts.',
    weight: 0.25,
    examples: {
      good: 'Military ranks determined by culinary skill - generals must pass 7-course banquet exam',
      bad: 'The Dark Lord threatens the kingdom in the shadowy realm of forbidden magic'
    }
  },

  consistency: {
    name: 'Internal Consistency',
    description: 'All elements fit together logically, no contradictions',
    weight: 0.15,
    examples: {
      good: 'Desert culture values water conservation: citizens limited to 3 liters/day, violators fined heavily',
      bad: 'Desert culture hosts annual water festival with massive fountains (contradicts scarcity)'
    }
  },

  mundaneGrounding: {
    name: 'Mundane Grounding',
    description: 'Connects extraordinary elements to practical daily life',
    weight: 0.15,
    examples: {
      good: 'Telepaths wear government-issued mental dampeners in public spaces, must file Form 27-B monthly',
      bad: 'People have telepathy and use it sometimes'
    }
  }
};

/**
 * Generate critique prompt for world content
 */
export function getCritiquePrompt(content, contentType = 'world') {
  return `You are a worldbuilding quality critic. Evaluate the following ${contentType} content against these principles:

CONTENT TO CRITIQUE:
${content}

EVALUATION PRINCIPLES:
1. **Specificity** (Weight: 25%): Does it use concrete numbers, materials, measurements, sensory details?
   - Good: "granite temple built 847 years ago, smells of copper"
   - Bad: "ancient mysterious temple"

2. **Implications** (Weight: 20%): Does it show how elements affect society, economy, culture?
   - Good: "Magic users register with Guild (500 gold), creating black market"
   - Bad: "Magic exists"

3. **Originality** (Weight: 25%): Does it avoid generic fantasy tropes and overused words?
   - Bad words: shadowy, ancient, mysterious, forbidden, ethereal, dark, mystical
   - Bad patterns: "The [Adjective] [Noun]" names, Light vs Dark conflicts
   - Good: "Military ranks by culinary skill"
   - Bad: "The Dark Council rules the shadowy realm of forbidden magic"

4. **Consistency** (Weight: 15%): Do all elements fit together logically?
   - Good: "Desert culture values water: 3L/day limit, heavy fines"
   - Bad: "Desert culture hosts water festival with massive fountains"

5. **Mundane Grounding** (Weight: 15%): Does it connect extraordinary to daily life?
   - Good: "Telepaths wear dampeners, file Form 27-B"
   - Bad: "People have telepathy"

TASK: Evaluate each principle, assign scores (0-10), identify specific weaknesses, suggest improvements.

Output as JSON:
{
  "overallScore": number (0-10, weighted average),
  "principleScores": {
    "specificity": {
      "score": number (0-10),
      "strengths": ["string", "string"],
      "weaknesses": ["string", "string"],
      "examples": ["string (specific quote from content showing weakness)"]
    },
    "implications": { /* same structure */ },
    "originality": { /* same structure */ },
    "consistency": { /* same structure */ },
    "mundaneGrounding": { /* same structure */ }
  },
  "criticalIssues": [
    "string (major problem)",
    "string (major problem)"
  ],
  "suggestedImprovements": [
    {
      "issue": "string (what needs fixing)",
      "suggestion": "string (how to fix it, be specific)",
      "priority": "high|medium|low"
    }
  ],
  "shouldRevise": boolean (true if overallScore < 8.0)
}`;
}

/**
 * Generate revision prompt based on critique
 */
export function getRevisionPrompt(originalContent, critique, contentType = 'world') {
  const improvements = critique.suggestedImprovements
    .filter(imp => imp.priority === 'high' || imp.priority === 'medium')
    .map(imp => `- ${imp.issue}: ${imp.suggestion}`)
    .join('\n');

  return `You are an expert worldbuilder. Revise the following ${contentType} content to address the critique.

ORIGINAL CONTENT:
${originalContent}

CRITIQUE SUMMARY:
Overall Score: ${critique.overallScore}/10
Critical Issues: ${critique.criticalIssues.join(', ')}

KEY IMPROVEMENTS NEEDED:
${improvements}

SPECIFIC WEAKNESSES BY PRINCIPLE:
${Object.entries(critique.principleScores).map(([principle, data]) => {
  return `**${principle}** (${data.score}/10):
${data.weaknesses.map(w => `  - ${w}`).join('\n')}
${data.examples ? data.examples.map(e => `  Example: "${e}"`).join('\n') : ''}`;
}).join('\n\n')}

TASK: Rewrite the content to fix these issues while maintaining the core concept.

REQUIREMENTS:
1. Keep the same overall structure and core ideas
2. Address ALL high-priority improvements
3. Address most medium-priority improvements
4. Significantly improve weak principles (score < 7)
5. Maintain consistency with any established facts
6. Make the content MORE specific, original, and grounded
7. Output in the SAME FORMAT as the original (JSON/markdown/etc)

Generate the REVISED content now. Focus on making it significantly better, not just slightly different.`;
}

/**
 * Parse critique response from AI
 */
export function parseCritique(response) {
  try {
    // Remove markdown fences if present
    let cleaned = response.trim();
    cleaned = cleaned.replace(/```json\n?/g, '');
    cleaned = cleaned.replace(/```\n?/g, '');

    // Extract JSON
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    const critique = JSON.parse(cleaned);

    // Validate structure
    if (typeof critique.overallScore !== 'number' || !critique.principleScores) {
      throw new Error('Invalid critique structure');
    }

    return critique;
  } catch (error) {
    console.error('Failed to parse critique:', error);
    console.error('Response:', response.substring(0, 500));
    throw new Error(`Failed to parse critique: ${error.message}`);
  }
}

/**
 * Run cliché detection on content
 * Phase 1 Enhancement
 *
 * @param {string} content - Content to check for clichés
 * @param {string} genre - Genre for genre-specific patterns
 * @returns {Object} - Cliché detection results
 */
export function runClicheDetection(content, genre = 'fantasy') {
  const detection = detectCliches(content, genre);

  return {
    originalityScore: detection.score,
    clicheCount: detection.summary.total,
    uniqueCliches: detection.summary.uniqueCliches,
    shouldRegenerate: detection.shouldRegenerate,
    detected: detection.detected,
    recommendations: detection.recommendations,
    formatted: formatDetectionResult(detection)
  };
}

/**
 * Enhanced critique that includes both Constitutional AI and Cliché Detection
 * Phase 1 Enhancement
 *
 * @param {string} content - Content to critique
 * @param {Function} apiCallFn - Function to call OpenAI API
 * @param {string} contentType - Type of content
 * @param {string} genre - Genre for cliché detection
 * @returns {Object} - Combined critique results
 */
export async function runEnhancedCritique(content, apiCallFn, contentType = 'world', genre = 'fantasy') {
  // Run both critiques in parallel for efficiency
  const [aiCritique, clicheResults] = await Promise.all([
    // Constitutional AI critique
    (async () => {
      const critiquePrompt = getCritiquePrompt(content, contentType);
      const critiqueResponse = await apiCallFn([
        { role: 'system', content: 'You are a worldbuilding quality critic. Provide honest, constructive feedback.' },
        { role: 'user', content: critiquePrompt }
      ], true);
      return parseCritique(critiqueResponse);
    })(),

    // Cliché detection
    Promise.resolve(runClicheDetection(content, genre))
  ]);

  // Combine results
  // If cliché detection found issues, adjust originality score in AI critique
  const combinedCritique = {
    ...aiCritique,
    clicheDetection: clicheResults,

    // Adjust originality score based on cliché detection
    // Use the lower of the two scores (more conservative)
    principleScores: {
      ...aiCritique.principleScores,
      originality: {
        ...aiCritique.principleScores.originality,
        score: Math.min(
          aiCritique.principleScores.originality.score,
          clicheResults.originalityScore
        ),
        clicheDetected: clicheResults.clicheCount > 0,
        clicheDetails: clicheResults.clicheCount > 0 ? {
          count: clicheResults.clicheCount,
          unique: clicheResults.uniqueCliches,
          examples: clicheResults.detected.slice(0, 5).map(c => c.text)
        } : null
      }
    }
  };

  // Recalculate overall score with adjusted originality
  const weights = Object.values(WORLDBUILDING_PRINCIPLES).reduce((acc, p) => acc + p.weight, 0);
  combinedCritique.overallScore = Object.entries(WORLDBUILDING_PRINCIPLES).reduce((score, [key, principle]) => {
    return score + (combinedCritique.principleScores[key].score * principle.weight);
  }, 0) / weights;

  // Update shouldRevise based on combined score
  combinedCritique.shouldRevise = combinedCritique.overallScore < 8.0 || clicheResults.shouldRegenerate;

  return combinedCritique;
}

/**
 * Enhanced revision prompt that includes cliché detection feedback
 * Phase 1 Enhancement
 */
export function getEnhancedRevisionPrompt(originalContent, critique, contentType = 'world') {
  const basePrompt = getRevisionPrompt(originalContent, critique, contentType);

  // Add cliché-specific guidance if clichés were detected
  if (critique.clicheDetection && critique.clicheDetection.clicheCount > 0) {
    const clicheSection = `

CLICHÉ DETECTION RESULTS:
Originality Score: ${critique.clicheDetection.originalityScore}/10
Clichés Detected: ${critique.clicheDetection.clicheCount} (${critique.clicheDetection.uniqueCliches} unique)

${critique.clicheDetection.recommendations.map(rec => `- ${rec.message}${rec.examples ? '\n  Examples: ' + rec.examples.join(', ') : ''}`).join('\n')}

SPECIFIC CLICHÉS TO REPLACE:
${critique.clicheDetection.detected.slice(0, 10).map(c => `  - "${c.text}" (${c.category})`).join('\n')}

IMPORTANT: Replace ALL detected clichés with specific, original alternatives.`;

    return basePrompt + clicheSection;
  }

  return basePrompt;
}

/**
 * Main Constitutional AI function: Generate → Critique → Revise
 * Enhanced with Cliché Detection (Phase 1)
 *
 * @param {Function} generateFn - Function that generates initial content
 * @param {Function} apiCallFn - Function to call OpenAI API
 * @param {string} contentType - Type of content being generated
 * @param {Object} options - Additional options
 * @returns {Object} - Final content and quality metrics
 */
export async function generateWithConstitutionalAI(
  generateFn,
  apiCallFn,
  contentType = 'world',
  options = {}
) {
  const {
    qualityThreshold = 8.0, // Revise if score < 8.0
    maxRevisions = 1, // Usually 1 revision is enough
    onProgress = null, // Callback for progress updates
    genre = 'fantasy', // Genre for cliché detection (Phase 1)
    enableClicheDetection = true // Enable/disable cliché detection
  } = options;

  // Step 1: Generate initial content
  if (onProgress) onProgress({ step: 'generate', status: 'in_progress' });

  const initialContent = await generateFn();

  if (onProgress) onProgress({ step: 'generate', status: 'complete', content: initialContent });

  // Step 2: Enhanced critique (Constitutional AI + Cliché Detection)
  if (onProgress) onProgress({ step: 'critique', status: 'in_progress' });

  const critique = enableClicheDetection
    ? await runEnhancedCritique(initialContent, apiCallFn, contentType, genre)
    : await (async () => {
      const critiquePrompt = getCritiquePrompt(initialContent, contentType);
      const critiqueResponse = await apiCallFn([
        { role: 'system', content: 'You are a worldbuilding quality critic. Provide honest, constructive feedback.' },
        { role: 'user', content: critiquePrompt }
      ], true);
      return parseCritique(critiqueResponse);
    })();

  if (onProgress) onProgress({ step: 'critique', status: 'complete', critique });

  // Step 3: Decide if revision is needed
  if (critique.overallScore >= qualityThreshold || maxRevisions === 0) {
    // Quality is good enough, return initial content
    return {
      finalContent: initialContent,
      revised: false,
      critique,
      revisionCount: 0
    };
  }

  // Step 4: Revise the content with enhanced prompt
  if (onProgress) onProgress({ step: 'revise', status: 'in_progress', critique });

  const revisionPrompt = enableClicheDetection
    ? getEnhancedRevisionPrompt(initialContent, critique, contentType)
    : getRevisionPrompt(initialContent, critique, contentType);

  const revisedContent = await apiCallFn([
    { role: 'system', content: 'You are an expert worldbuilder making revisions based on critique.' },
    { role: 'user', content: revisionPrompt }
  ], false); // Don't force JSON - maintain format of original

  if (onProgress) onProgress({ step: 'revise', status: 'complete', content: revisedContent });

  // Optional: Could critique again and revise iteratively, but usually 1 revision is enough

  return {
    finalContent: revisedContent,
    revised: true,
    critique,
    originalContent: initialContent,
    revisionCount: 1
  };
}

/**
 * Simplified wrapper for single-step generation with optional critique
 */
export async function generateWithQualityCheck(
  content,
  apiCallFn,
  contentType,
  enableCritique = true
) {
  if (!enableCritique) {
    return { finalContent: content, revised: false };
  }

  return await generateWithConstitutionalAI(
    async () => content, // Content already generated
    apiCallFn,
    contentType,
    { qualityThreshold: 8.0, maxRevisions: 1 }
  );
}
