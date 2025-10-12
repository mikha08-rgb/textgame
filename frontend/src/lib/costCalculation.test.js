/**
 * Unit tests for cost calculation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCost,
  formatCost,
  calculateSessionCost,
  checkCostThreshold,
  getModelPricing,
  estimateAdventureCost,
  COST_THRESHOLDS
} from './costCalculation.js';

describe('calculateCost', () => {
  it('should calculate cost correctly for GPT-3.5-turbo', () => {
    const usage = {
      prompt_tokens: 1000,
      completion_tokens: 500,
      total_tokens: 1500
    };

    const cost = calculateCost(usage, 'gpt-3.5-turbo');

    // Expected: (1000/1000 * 0.0005) + (500/1000 * 0.0015) = 0.0005 + 0.00075 = 0.00125
    expect(cost).toBeCloseTo(0.00125, 5);
  });

  it('should calculate cost correctly for GPT-4 Turbo', () => {
    const usage = {
      prompt_tokens: 1000,
      completion_tokens: 500,
      total_tokens: 1500
    };

    const cost = calculateCost(usage, 'gpt-4-turbo');

    // Expected: (1000/1000 * 0.01) + (500/1000 * 0.03) = 0.01 + 0.015 = 0.025
    expect(cost).toBeCloseTo(0.025, 5);
  });

  it('should calculate cost correctly for GPT-4', () => {
    const usage = {
      prompt_tokens: 1000,
      completion_tokens: 500,
      total_tokens: 1500
    };

    const cost = calculateCost(usage, 'gpt-4');

    // Expected: (1000/1000 * 0.03) + (500/1000 * 0.06) = 0.03 + 0.03 = 0.06
    expect(cost).toBeCloseTo(0.06, 5);
  });

  it('should correctly identify gpt-4-turbo models (bug fix test)', () => {
    const usage = {
      prompt_tokens: 1000,
      completion_tokens: 1000,
      total_tokens: 2000
    };

    // Test that gpt-4-turbo uses turbo pricing, not base gpt-4 pricing
    const turboCost = calculateCost(usage, 'gpt-4-turbo-preview');
    const expectedTurboCost = (1000/1000 * 0.01) + (1000/1000 * 0.03); // 0.04

    expect(turboCost).toBeCloseTo(expectedTurboCost, 5);
    expect(turboCost).toBeLessThan(0.05); // Should be less than gpt-4 pricing
  });

  it('should correctly identify gpt-4o models', () => {
    const usage = {
      prompt_tokens: 1000,
      completion_tokens: 1000,
      total_tokens: 2000
    };

    // gpt-4o should use gpt-4-turbo pricing
    const gpt4oCost = calculateCost(usage, 'gpt-4o');
    const expectedCost = (1000/1000 * 0.01) + (1000/1000 * 0.03); // 0.04

    expect(gpt4oCost).toBeCloseTo(expectedCost, 5);
  });

  it('should return 0 for null or undefined usage', () => {
    expect(calculateCost(null, 'gpt-4')).toBe(0);
    expect(calculateCost(undefined, 'gpt-4')).toBe(0);
  });

  it('should handle missing token fields gracefully', () => {
    const usage = {};
    const cost = calculateCost(usage, 'gpt-3.5-turbo');
    expect(cost).toBe(0);
  });

  it('should default to gpt-4 pricing for unknown models', () => {
    const usage = {
      prompt_tokens: 1000,
      completion_tokens: 1000,
      total_tokens: 2000
    };

    const cost = calculateCost(usage, 'unknown-model');
    const gpt4Cost = calculateCost(usage, 'gpt-4');

    expect(cost).toBe(gpt4Cost);
  });
});

describe('formatCost', () => {
  it('should format cost with dollar sign by default', () => {
    expect(formatCost(0.12345)).toBe('$0.123');
  });

  it('should format cost without dollar sign when specified', () => {
    expect(formatCost(0.12345, false)).toBe('0.123');
  });

  it('should format small costs correctly', () => {
    expect(formatCost(0.001)).toBe('$0.001');
  });

  it('should format large costs correctly', () => {
    expect(formatCost(5.6789)).toBe('$5.679');
  });

  it('should handle zero cost', () => {
    expect(formatCost(0)).toBe('$0.000');
  });
});

describe('calculateSessionCost', () => {
  it('should calculate cumulative cost across multiple calls', () => {
    const usageHistory = [
      {
        usage: { prompt_tokens: 1000, completion_tokens: 500, total_tokens: 1500 },
        model: 'gpt-3.5-turbo'
      },
      {
        usage: { prompt_tokens: 800, completion_tokens: 400, total_tokens: 1200 },
        model: 'gpt-3.5-turbo'
      }
    ];

    const result = calculateSessionCost(usageHistory);

    // Call 1: (1000/1000 * 0.0005) + (500/1000 * 0.0015) = 0.00125
    // Call 2: (800/1000 * 0.0005) + (400/1000 * 0.0015) = 0.001
    // Total: 0.00225
    expect(result.totalCost).toBeCloseTo(0.00225, 5);
    expect(result.totalInputTokens).toBe(1800);
    expect(result.totalOutputTokens).toBe(900);
    expect(result.totalTokens).toBe(2700);
    expect(result.callCount).toBe(2);
  });

  it('should handle empty usage history', () => {
    const result = calculateSessionCost([]);

    expect(result.totalCost).toBe(0);
    expect(result.totalInputTokens).toBe(0);
    expect(result.totalOutputTokens).toBe(0);
    expect(result.totalTokens).toBe(0);
    expect(result.callCount).toBe(0);
  });

  it('should handle null usage history', () => {
    const result = calculateSessionCost(null);

    expect(result.totalCost).toBe(0);
    expect(result.callCount).toBe(0);
  });

  it('should handle mixed models', () => {
    const usageHistory = [
      {
        usage: { prompt_tokens: 1000, completion_tokens: 1000, total_tokens: 2000 },
        model: 'gpt-3.5-turbo'
      },
      {
        usage: { prompt_tokens: 1000, completion_tokens: 1000, total_tokens: 2000 },
        model: 'gpt-4-turbo'
      }
    ];

    const result = calculateSessionCost(usageHistory);

    // GPT-3.5: (1000/1000 * 0.0005) + (1000/1000 * 0.0015) = 0.002
    // GPT-4 Turbo: (1000/1000 * 0.01) + (1000/1000 * 0.03) = 0.04
    // Total: 0.042
    expect(result.totalCost).toBeCloseTo(0.042, 5);
    expect(result.callCount).toBe(2);
  });
});

describe('checkCostThreshold', () => {
  it('should detect when a threshold is crossed', () => {
    const crossedThreshold = checkCostThreshold(0.05, 0.15, new Set());
    expect(crossedThreshold).toBe(0.10);
  });

  it('should return the first threshold crossed', () => {
    const crossedThreshold = checkCostThreshold(0.00, 0.30, new Set());
    expect(crossedThreshold).toBe(0.10); // Should return first threshold, not 0.25
  });

  it('should not trigger for already-triggered thresholds', () => {
    const triggeredSet = new Set([0.10, 0.25]);
    const crossedThreshold = checkCostThreshold(0.20, 0.30, triggeredSet);
    expect(crossedThreshold).toBeNull(); // 0.25 already triggered
  });

  it('should return null if no threshold is crossed', () => {
    const crossedThreshold = checkCostThreshold(0.05, 0.08, new Set());
    expect(crossedThreshold).toBeNull();
  });

  it('should handle exact threshold crossing', () => {
    const crossedThreshold = checkCostThreshold(0.09, 0.10, new Set());
    expect(crossedThreshold).toBe(0.10);
  });

  it('should work for higher thresholds', () => {
    const triggeredSet = new Set([0.10, 0.25]);
    const crossedThreshold = checkCostThreshold(0.40, 0.60, triggeredSet);
    expect(crossedThreshold).toBe(0.50);
  });
});

describe('getModelPricing', () => {
  it('should return correct pricing for gpt-3.5-turbo', () => {
    const pricing = getModelPricing('gpt-3.5-turbo');
    expect(pricing.input).toBe(0.0005);
    expect(pricing.output).toBe(0.0015);
  });

  it('should return correct pricing for gpt-4-turbo', () => {
    const pricing = getModelPricing('gpt-4-turbo');
    expect(pricing.input).toBe(0.01);
    expect(pricing.output).toBe(0.03);
  });

  it('should return correct pricing for gpt-4', () => {
    const pricing = getModelPricing('gpt-4');
    expect(pricing.input).toBe(0.03);
    expect(pricing.output).toBe(0.06);
  });

  it('should handle model variants correctly', () => {
    const turboPreviewPricing = getModelPricing('gpt-4-turbo-preview');
    expect(turboPreviewPricing.input).toBe(0.01);

    const gpt4oPricing = getModelPricing('gpt-4o');
    expect(gpt4oPricing.input).toBe(0.01);
  });

  it('should default to gpt-4 for unknown models', () => {
    const unknownPricing = getModelPricing('gpt-99');
    const gpt4Pricing = getModelPricing('gpt-4');
    expect(unknownPricing).toEqual(gpt4Pricing);
  });
});

describe('estimateAdventureCost', () => {
  it('should estimate cost for typical adventure', () => {
    const estimate = estimateAdventureCost(15, 'gpt-4');

    expect(estimate.minCost).toBeGreaterThan(0);
    expect(estimate.maxCost).toBeGreaterThan(estimate.minCost);
    expect(estimate.averageCost).toBeCloseTo((estimate.minCost + estimate.maxCost) / 2, 5);
    expect(estimate.perInteraction).toBeGreaterThan(0);
  });

  it('should estimate lower cost for GPT-3.5-turbo', () => {
    const gpt35Estimate = estimateAdventureCost(15, 'gpt-3.5-turbo');
    const gpt4Estimate = estimateAdventureCost(15, 'gpt-4');

    expect(gpt35Estimate.averageCost).toBeLessThan(gpt4Estimate.averageCost);
  });

  it('should scale with interaction count', () => {
    const shortAdventure = estimateAdventureCost(5, 'gpt-4');
    const longAdventure = estimateAdventureCost(20, 'gpt-4');

    expect(longAdventure.averageCost).toBeGreaterThan(shortAdventure.averageCost * 2);
  });
});

describe('COST_THRESHOLDS', () => {
  it('should have expected threshold values', () => {
    expect(COST_THRESHOLDS).toContain(0.10);
    expect(COST_THRESHOLDS).toContain(0.25);
    expect(COST_THRESHOLDS).toContain(0.50);
  });

  it('should be in ascending order', () => {
    for (let i = 1; i < COST_THRESHOLDS.length; i++) {
      expect(COST_THRESHOLDS[i]).toBeGreaterThan(COST_THRESHOLDS[i - 1]);
    }
  });
});
