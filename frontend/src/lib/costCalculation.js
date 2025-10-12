/**
 * Cost Calculation Utility
 * Handles accurate cost estimation for OpenAI API usage
 * with support for different models and token types
 */

/**
 * Pricing rates per 1K tokens (as of January 2025)
 * Source: https://openai.com/pricing
 * Last verified: 2025-10-11
 */
const PRICING = {
  'gpt-4': {
    input: 0.03,   // $0.03 per 1K input tokens (GPT-4 original)
    output: 0.06,  // $0.06 per 1K output tokens (GPT-4 original)
  },
  'gpt-4-turbo': {
    input: 0.01,   // $0.01 per 1K input tokens
    output: 0.03,  // $0.03 per 1K output tokens
  },
  'gpt-3.5-turbo': {
    input: 0.0005,  // $0.0005 per 1K input tokens
    output: 0.0015, // $0.0015 per 1K output tokens
  },
};

/**
 * Calculate cost for a single API call
 * @param {Object} usage - Token usage object from OpenAI response
 * @param {number} usage.prompt_tokens - Input tokens used
 * @param {number} usage.completion_tokens - Output tokens generated
 * @param {number} usage.total_tokens - Total tokens (input + output)
 * @param {string} model - Model name (e.g., 'gpt-4', 'gpt-3.5-turbo')
 * @returns {number} Cost in dollars
 */
export function calculateCost(usage, model = 'gpt-4') {
  if (!usage) {
    return 0;
  }

  const inputTokens = usage.prompt_tokens || 0;
  const outputTokens = usage.completion_tokens || 0;

  // Normalize model name (check turbo before base model to avoid incorrect matching)
  const baseModel = model.includes('gpt-4-turbo') || model.includes('gpt-4o') ? 'gpt-4-turbo'
    : model.includes('gpt-4') ? 'gpt-4'
    : model.includes('gpt-3.5') ? 'gpt-3.5-turbo'
    : 'gpt-4'; // default to gpt-4 (conservative pricing)

  const pricing = PRICING[baseModel];

  if (!pricing) {
    console.warn(`[CostCalc] Unknown model: ${model}, using gpt-4 pricing`);
    return calculateCost(usage, 'gpt-4');
  }

  // Calculate cost per token type
  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  const totalCost = inputCost + outputCost;

  return totalCost;
}

/**
 * Format cost for display
 * @param {number} cost - Cost in dollars
 * @param {boolean} includeSymbol - Whether to include $ symbol
 * @returns {string} Formatted cost string
 */
export function formatCost(cost, includeSymbol = true) {
  const formatted = cost.toFixed(3);
  return includeSymbol ? `$${formatted}` : formatted;
}

/**
 * Calculate cumulative session cost
 * @param {Array} usageHistory - Array of usage objects with model info
 * @returns {Object} Cost breakdown
 */
export function calculateSessionCost(usageHistory) {
  if (!usageHistory || usageHistory.length === 0) {
    return {
      totalCost: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      callCount: 0,
    };
  }

  let totalCost = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalTokens = 0;

  usageHistory.forEach(({ usage, model }) => {
    if (usage) {
      totalCost += calculateCost(usage, model);
      totalInputTokens += usage.prompt_tokens || 0;
      totalOutputTokens += usage.completion_tokens || 0;
      totalTokens += usage.total_tokens || 0;
    }
  });

  return {
    totalCost,
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    callCount: usageHistory.length,
  };
}

/**
 * Get pricing info for a specific model
 * @param {string} model - Model name
 * @returns {Object} Pricing info
 */
export function getModelPricing(model = 'gpt-4') {
  const baseModel = model.includes('gpt-4-turbo') || model.includes('gpt-4o') ? 'gpt-4-turbo'
    : model.includes('gpt-4') ? 'gpt-4'
    : model.includes('gpt-3.5') ? 'gpt-3.5-turbo'
    : 'gpt-4';

  return PRICING[baseModel] || PRICING['gpt-4'];
}

/**
 * Estimate cost for a typical adventure
 * @param {number} interactionCount - Expected number of interactions
 * @param {string} model - Model being used
 * @returns {Object} Cost estimate range
 */
export function estimateAdventureCost(interactionCount = 15, model = 'gpt-4') {
  // Typical token usage per interaction (based on testing)
  const avgInputTokens = 800;  // World context + recent narrative
  const avgOutputTokens = 400; // Generated narrative + choices

  const pricing = getModelPricing(model);
  const costPerInteraction =
    (avgInputTokens / 1000) * pricing.input +
    (avgOutputTokens / 1000) * pricing.output;

  // Add world generation cost (one-time, larger)
  const worldGenCost = calculateCost(
    { prompt_tokens: 500, completion_tokens: 800 },
    model
  );

  const minCost = (costPerInteraction * interactionCount * 0.8) + worldGenCost;
  const maxCost = (costPerInteraction * interactionCount * 1.2) + worldGenCost;

  return {
    minCost,
    maxCost,
    averageCost: (minCost + maxCost) / 2,
    perInteraction: costPerInteraction,
  };
}

/**
 * Cost warning thresholds
 */
export const COST_THRESHOLDS = [0.10, 0.25, 0.50, 0.75, 1.00, 1.25, 1.50];

/**
 * Check if cost has crossed a new threshold
 * @param {number} previousCost - Previous total cost
 * @param {number} currentCost - Current total cost
 * @param {Set} triggeredThresholds - Set of already triggered thresholds
 * @returns {number|null} Threshold that was crossed, or null
 */
export function checkCostThreshold(previousCost, currentCost, triggeredThresholds = new Set()) {
  for (const threshold of COST_THRESHOLDS) {
    if (previousCost < threshold && currentCost >= threshold && !triggeredThresholds.has(threshold)) {
      return threshold;
    }
  }
  return null;
}
