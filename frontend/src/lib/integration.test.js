/**
 * Integration tests for Storage + OpenAI modules
 * Tests how the API key storage works with OpenAI API calls
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setAPIKey, getAPIKey, removeAPIKey, hasAPIKey } from './apiKeyStorage.js';
import { generateText, InvalidAPIKeyError } from './openai.js';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock global fetch
global.fetch = vi.fn();

describe('Storage + OpenAI Integration', () => {
  beforeEach(() => {
    // Setup localStorage mock
    global.localStorage = localStorageMock;
    localStorageMock.clear();

    // Clear all mocks
    vi.clearAllMocks();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorageMock.clear();
  });

  it('should store API key and use it for OpenAI calls', async () => {
    const apiKey = 'sk-1234567890abcdefghijklmnop';

    // Store the API key
    setAPIKey(apiKey);
    expect(hasAPIKey()).toBe(true);

    // Retrieve and use with OpenAI
    const storedKey = getAPIKey();
    expect(storedKey).toBe(apiKey);

    // Mock successful API response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Test response' } }],
        usage: { total_tokens: 10 },
      }),
    });

    // Use stored key with OpenAI
    const result = await generateText({
      apiKey: storedKey,
      prompt: 'Test prompt',
    });

    expect(result).toBe('Test response');
    expect(fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${apiKey}`,
        }),
      })
    );
  });

  it('should handle workflow: store → retrieve → API call → remove', async () => {
    const apiKey = 'sk-testkey1234567890abcdefg';

    // Step 1: Store key
    setAPIKey(apiKey);
    expect(hasAPIKey()).toBe(true);

    // Step 2: Retrieve key
    const retrievedKey = getAPIKey();
    expect(retrievedKey).toBe(apiKey);

    // Step 3: Make API call
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Success' } }],
        usage: { total_tokens: 5 },
      }),
    });

    await generateText({
      apiKey: retrievedKey,
      prompt: 'Test',
    });

    // Step 4: Remove key
    removeAPIKey();
    expect(hasAPIKey()).toBe(false);
    expect(getAPIKey()).toBe(null);
  });

  it('should fail OpenAI call with invalid stored key', async () => {
    // This test validates that even if we bypass storage validation,
    // the OpenAI API will catch invalid keys
    const invalidKey = 'sk-invalidkey1234567890abc';

    // Store key (it passes format validation)
    setAPIKey(invalidKey);

    // But OpenAI rejects it
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        error: { message: 'Invalid API key' },
      }),
    });

    const storedKey = getAPIKey();

    await expect(
      generateText({
        apiKey: storedKey,
        prompt: 'Test',
      })
    ).rejects.toThrow(InvalidAPIKeyError);
  });

  it('should handle user workflow: update key and retry', async () => {
    const oldKey = 'sk-oldkey1234567890abcdefgh';
    const newKey = 'sk-newkey0987654321zyxwvuts';

    // Store old key
    setAPIKey(oldKey);

    // First call fails with old key
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({
        error: { message: 'Invalid API key' },
      }),
    });

    await expect(
      generateText({
        apiKey: getAPIKey(),
        prompt: 'Test',
      })
    ).rejects.toThrow(InvalidAPIKeyError);

    // User updates to new key
    setAPIKey(newKey);
    expect(getAPIKey()).toBe(newKey);

    // Second call succeeds with new key
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Success with new key' } }],
        usage: { total_tokens: 10 },
      }),
    });

    const result = await generateText({
      apiKey: getAPIKey(),
      prompt: 'Test',
    });

    expect(result).toBe('Success with new key');
  });

  it('should maintain key across multiple API calls', async () => {
    const apiKey = 'sk-persistent1234567890abcd';

    setAPIKey(apiKey);

    // Make multiple calls with the same stored key
    const calls = 3;

    for (let i = 0; i < calls; i++) {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: `Response ${i + 1}` } }],
          usage: { total_tokens: 10 },
        }),
      });

      const result = await generateText({
        apiKey: getAPIKey(),
        prompt: `Prompt ${i + 1}`,
      });

      expect(result).toBe(`Response ${i + 1}`);
      expect(hasAPIKey()).toBe(true);
    }

    expect(fetch).toHaveBeenCalledTimes(calls);
  });
});
