/**
 * Response Validation Module
 * Validates AI-generated responses for quality, length, and content issues
 */

/**
 * AI refusal patterns to detect
 */
const REFUSAL_PATTERNS = [
  /I cannot/i,
  /I can't/i,
  /I'm not able to/i,
  /I am not able to/i,
  /I'm unable to/i,
  /I am unable to/i,
  /I apologize, but I/i,
  /I'm sorry, but I/i,
  /I don't feel comfortable/i,
  /I would not be appropriate/i,
  /against my programming/i,
  /I must decline/i,
  /I will not/i,
  /I won't/i,
];

/**
 * Error class for validation failures
 */
export class ValidationError extends Error {
  constructor(message, type, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.type = type;
    this.details = details;
  }
}

/**
 * Count words in a string
 * @param {string} text - Text to count words in
 * @returns {number} Word count
 */
function countWords(text) {
  return text.trim().split(/\s+/).length;
}

/**
 * Check if response length is appropriate
 * @param {string} text - Response text to validate
 * @param {number} minWords - Minimum word count
 * @param {number} maxWords - Maximum word count
 * @returns {Object} Validation result
 */
export function validateResponseLength(text, minWords = 50, maxWords = 500) {
  const wordCount = countWords(text);

  if (wordCount < minWords) {
    return {
      valid: false,
      error: new ValidationError(
        `Response too short: ${wordCount} words (minimum ${minWords})`,
        'length_too_short',
        { wordCount, minWords, maxWords }
      ),
    };
  }

  if (wordCount > maxWords) {
    return {
      valid: false,
      error: new ValidationError(
        `Response too long: ${wordCount} words (maximum ${maxWords})`,
        'length_too_long',
        { wordCount, minWords, maxWords }
      ),
    };
  }

  return { valid: true, wordCount };
}

/**
 * Check if response contains AI refusal
 * @param {string} text - Response text to check
 * @returns {Object} Detection result
 */
export function detectAIRefusal(text) {
  for (const pattern of REFUSAL_PATTERNS) {
    if (pattern.test(text)) {
      return {
        refused: true,
        pattern: pattern.source,
        error: new ValidationError(
          'AI refused to generate content',
          'ai_refusal',
          { matchedPattern: pattern.source }
        ),
      };
    }
  }

  return { refused: false };
}

/**
 * Check if response appears to be malformed or incomplete
 * @param {string} text - Response text to check
 * @returns {Object} Validation result
 */
export function validateResponseCompleteness(text) {
  const trimmed = text.trim();

  // Check for empty or whitespace-only
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: new ValidationError('Response is empty', 'empty_response'),
    };
  }

  // Check if it ends mid-sentence (no punctuation at end)
  const endsWithPunctuation = /[.!?]$/.test(trimmed);
  if (!endsWithPunctuation) {
    // Only warn, not a hard failure
    console.warn('[Validation] Response may be incomplete - no ending punctuation');
  }

  // Check for excessive ellipsis (sign of incomplete thought)
  const ellipsisCount = (trimmed.match(/\.\.\./g) || []).length;
  if (ellipsisCount > 3) {
    return {
      valid: false,
      error: new ValidationError(
        'Response appears incomplete or rambling',
        'excessive_ellipsis',
        { ellipsisCount }
      ),
    };
  }

  return { valid: true };
}

/**
 * Comprehensive response validation
 * @param {string} text - Response text to validate
 * @param {Object} options - Validation options
 * @param {number} options.minWords - Minimum word count
 * @param {number} options.maxWords - Maximum word count
 * @param {boolean} options.checkRefusal - Check for AI refusals
 * @param {boolean} options.checkCompleteness - Check for completeness
 * @returns {Object} Validation result
 */
export function validateResponse(
  text,
  {
    minWords = 50,
    maxWords = 500,
    checkRefusal = true,
    checkCompleteness = true,
  } = {}
) {
  const results = {
    valid: true,
    errors: [],
    warnings: [],
    wordCount: countWords(text),
  };

  // Check length
  const lengthCheck = validateResponseLength(text, minWords, maxWords);
  if (!lengthCheck.valid) {
    results.valid = false;
    results.errors.push(lengthCheck.error);
  }

  // Check for refusal
  if (checkRefusal) {
    const refusalCheck = detectAIRefusal(text);
    if (refusalCheck.refused) {
      results.valid = false;
      results.errors.push(refusalCheck.error);
    }
  }

  // Check completeness
  if (checkCompleteness) {
    const completenessCheck = validateResponseCompleteness(text);
    if (!completenessCheck.valid) {
      results.valid = false;
      results.errors.push(completenessCheck.error);
    }
  }

  return results;
}

/**
 * Validate narrative response specifically
 * Narratives should be descriptive, immersive, and complete
 * @param {string} text - Narrative text to validate
 * @returns {Object} Validation result
 */
export function validateNarrativeResponse(text) {
  const baseValidation = validateResponse(text, {
    minWords: 100, // Narratives should be longer
    maxWords: 400,
    checkRefusal: true,
    checkCompleteness: true,
  });

  if (!baseValidation.valid) {
    return baseValidation;
  }

  // Check for second-person perspective ("you")
  const hasSecondPerson = /\byou\b/i.test(text);
  if (!hasSecondPerson) {
    baseValidation.warnings.push(
      'Narrative may not be in second person - check if "you" perspective is used'
    );
  }

  return baseValidation;
}

/**
 * Validate choice text
 * Choices should be concise and action-oriented
 * @param {string} text - Choice text to validate
 * @returns {Object} Validation result
 */
export function validateChoiceText(text) {
  const wordCount = countWords(text);

  if (wordCount < 3) {
    return {
      valid: false,
      error: new ValidationError(
        `Choice too short: ${wordCount} words (minimum 3)`,
        'choice_too_short',
        { wordCount }
      ),
    };
  }

  if (wordCount > 20) {
    return {
      valid: false,
      error: new ValidationError(
        `Choice too long: ${wordCount} words (maximum 20)`,
        'choice_too_long',
        { wordCount }
      ),
    };
  }

  return { valid: true, wordCount };
}

/**
 * Validate world generation response
 * @param {string} text - World text to validate
 * @returns {Object} Validation result
 */
export function validateWorldResponse(text) {
  return validateResponse(text, {
    minWords: 200, // Worlds need substantial detail
    maxWords: 800,
    checkRefusal: true,
    checkCompleteness: true,
  });
}
