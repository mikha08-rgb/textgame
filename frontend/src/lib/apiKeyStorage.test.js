/**
 * Unit tests for API Key Storage Module
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  setAPIKey,
  getAPIKey,
  removeAPIKey,
  hasAPIKey,
  clearAllData,
  isValidAPIKeyFormat,
  sanitizeAPIKey,
  StorageError,
} from './apiKeyStorage.js';

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

describe('API Key Storage', () => {
  beforeEach(() => {
    // Setup localStorage mock
    global.localStorage = localStorageMock;
    localStorageMock.clear();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorageMock.clear();
  });

  describe('isValidAPIKeyFormat', () => {
    it('should validate correct OpenAI API key format', () => {
      expect(isValidAPIKeyFormat('sk-1234567890abcdefghij')).toBe(true);
      expect(isValidAPIKeyFormat('sk-proj-1234567890abcdefghijklmnopqrstuvwxyz')).toBe(true);
      expect(isValidAPIKeyFormat('sk-1234567890_abcdef-ghij')).toBe(true);
    });

    it('should reject keys without sk- prefix', () => {
      expect(isValidAPIKeyFormat('1234567890abcdefghij')).toBe(false);
      expect(isValidAPIKeyFormat('api-1234567890abcdefghij')).toBe(false);
    });

    it('should reject keys that are too short', () => {
      expect(isValidAPIKeyFormat('sk-short')).toBe(false);
      expect(isValidAPIKeyFormat('sk-123')).toBe(false);
    });

    it('should reject invalid characters', () => {
      expect(isValidAPIKeyFormat('sk-key with spaces')).toBe(false);
      expect(isValidAPIKeyFormat('sk-key@with#special')).toBe(false);
      expect(isValidAPIKeyFormat('sk-key\nwith\nnewlines')).toBe(false);
    });

    it('should reject null, undefined, and non-strings', () => {
      expect(isValidAPIKeyFormat(null)).toBe(false);
      expect(isValidAPIKeyFormat(undefined)).toBe(false);
      expect(isValidAPIKeyFormat(12345)).toBe(false);
      expect(isValidAPIKeyFormat({})).toBe(false);
      expect(isValidAPIKeyFormat('')).toBe(false);
    });
  });

  describe('sanitizeAPIKey', () => {
    it('should trim whitespace from API keys', () => {
      expect(sanitizeAPIKey('  sk-1234567890abcdefghij  ')).toBe('sk-1234567890abcdefghij');
      expect(sanitizeAPIKey('\nsk-1234567890abcdefghij\n')).toBe('sk-1234567890abcdefghij');
      expect(sanitizeAPIKey('\tsk-1234567890abcdefghij\t')).toBe('sk-1234567890abcdefghij');
    });

    it('should handle null and undefined', () => {
      expect(sanitizeAPIKey(null)).toBe('');
      expect(sanitizeAPIKey(undefined)).toBe('');
    });

    it('should handle non-string values', () => {
      expect(sanitizeAPIKey(12345)).toBe('');
      expect(sanitizeAPIKey({})).toBe('');
    });

    it('should not modify already clean keys', () => {
      const key = 'sk-1234567890abcdefghij';
      expect(sanitizeAPIKey(key)).toBe(key);
    });
  });

  describe('setAPIKey', () => {
    it('should store valid API key successfully', () => {
      const validKey = 'sk-1234567890abcdefghijklmnop';

      expect(setAPIKey(validKey)).toBe(true);
      expect(hasAPIKey()).toBe(true);
    });

    it('should sanitize key before storing', () => {
      const keyWithWhitespace = '  sk-1234567890abcdefghijklmnop  ';

      setAPIKey(keyWithWhitespace);

      // Should be able to retrieve the sanitized version
      const retrieved = getAPIKey();
      expect(retrieved).toBe('sk-1234567890abcdefghijklmnop');
    });

    it('should throw StorageError for invalid key format', () => {
      expect(() => setAPIKey('invalid-key')).toThrow(StorageError);
      expect(() => setAPIKey('sk-short')).toThrow(StorageError);
      expect(() => setAPIKey('not-a-key')).toThrow(StorageError);
    });

    it('should throw StorageError for empty or null keys', () => {
      expect(() => setAPIKey('')).toThrow(StorageError);
      expect(() => setAPIKey(null)).toThrow(StorageError);
    });

    it('should obfuscate key in storage', () => {
      const validKey = 'sk-1234567890abcdefghijklmnop';

      setAPIKey(validKey);

      // Check that raw storage doesn't contain the plain key
      const stored = localStorage.getItem('ai_adventure_api_key');
      expect(stored).not.toBe(validKey);
      expect(stored).toContain('aae_v1_'); // Should have obfuscation prefix
    });

    it('should overwrite existing key', () => {
      const key1 = 'sk-1234567890abcdefghijklmnop';
      const key2 = 'sk-0987654321zyxwvutsrqponmlk';

      setAPIKey(key1);
      expect(getAPIKey()).toBe(key1);

      setAPIKey(key2);
      expect(getAPIKey()).toBe(key2);
    });
  });

  describe('getAPIKey', () => {
    it('should retrieve stored API key', () => {
      const validKey = 'sk-1234567890abcdefghijklmnop';

      setAPIKey(validKey);
      const retrieved = getAPIKey();

      expect(retrieved).toBe(validKey);
    });

    it('should return null if no key is stored', () => {
      expect(getAPIKey()).toBe(null);
    });

    it('should handle corrupted data gracefully', () => {
      // Manually set invalid data in storage
      localStorage.setItem('ai_adventure_api_key', 'corrupted_data');

      const result = getAPIKey();

      // Should return null and clear the corrupted data
      expect(result).toBe(null);
      expect(hasAPIKey()).toBe(false);
    });

    it('should deobfuscate stored key correctly', () => {
      const key1 = 'sk-1234567890abcdefghijklmnop';
      const key2 = 'sk-abcdefghijklmnopqrstuvwxyz1234567890';

      setAPIKey(key1);
      expect(getAPIKey()).toBe(key1);

      setAPIKey(key2);
      expect(getAPIKey()).toBe(key2);
    });
  });

  describe('removeAPIKey', () => {
    it('should remove stored API key', () => {
      const validKey = 'sk-1234567890abcdefghijklmnop';

      setAPIKey(validKey);
      expect(hasAPIKey()).toBe(true);

      removeAPIKey();
      expect(hasAPIKey()).toBe(false);
      expect(getAPIKey()).toBe(null);
    });

    it('should return true when successfully removed', () => {
      const validKey = 'sk-1234567890abcdefghijklmnop';

      setAPIKey(validKey);
      expect(removeAPIKey()).toBe(true);
    });

    it('should handle removing when no key exists', () => {
      expect(hasAPIKey()).toBe(false);
      expect(removeAPIKey()).toBe(true); // Should not throw error
    });
  });

  describe('hasAPIKey', () => {
    it('should return true when key is stored', () => {
      const validKey = 'sk-1234567890abcdefghijklmnop';

      setAPIKey(validKey);
      expect(hasAPIKey()).toBe(true);
    });

    it('should return false when no key is stored', () => {
      expect(hasAPIKey()).toBe(false);
    });

    it('should return false after key is removed', () => {
      const validKey = 'sk-1234567890abcdefghijklmnop';

      setAPIKey(validKey);
      expect(hasAPIKey()).toBe(true);

      removeAPIKey();
      expect(hasAPIKey()).toBe(false);
    });
  });

  describe('clearAllData', () => {
    it('should remove all application data', () => {
      const validKey = 'sk-1234567890abcdefghijklmnop';

      setAPIKey(validKey);
      expect(hasAPIKey()).toBe(true);

      clearAllData();
      expect(hasAPIKey()).toBe(false);
    });

    it('should return true when successfully cleared', () => {
      const validKey = 'sk-1234567890abcdefghijklmnop';

      setAPIKey(validKey);
      expect(clearAllData()).toBe(true);
    });
  });

  describe('localStorage unavailability', () => {
    it('should throw StorageError when localStorage is unavailable (setAPIKey)', () => {
      // Mock localStorage as unavailable
      const originalLocalStorage = global.localStorage;
      delete global.localStorage;

      expect(() => setAPIKey('sk-1234567890abcdefghijklmnop')).toThrow(StorageError);
      expect(() => setAPIKey('sk-1234567890abcdefghijklmnop')).toThrow(
        /localStorage is not available/
      );

      // Restore
      global.localStorage = originalLocalStorage;
    });

    it('should throw StorageError when localStorage is unavailable (getAPIKey)', () => {
      const originalLocalStorage = global.localStorage;
      delete global.localStorage;

      expect(() => getAPIKey()).toThrow(StorageError);

      global.localStorage = originalLocalStorage;
    });

    it('should handle localStorage unavailable gracefully (hasAPIKey)', () => {
      const originalLocalStorage = global.localStorage;
      delete global.localStorage;

      expect(hasAPIKey()).toBe(false);

      global.localStorage = originalLocalStorage;
    });

    it('should handle localStorage unavailable gracefully (removeAPIKey)', () => {
      const originalLocalStorage = global.localStorage;
      delete global.localStorage;

      expect(removeAPIKey()).toBe(false);

      global.localStorage = originalLocalStorage;
    });
  });

  describe('Error handling', () => {
    it('should create proper StorageError instances', () => {
      const error = new StorageError('Test message');

      expect(error.name).toBe('StorageError');
      expect(error.message).toBe('Test message');
      expect(error instanceof Error).toBe(true);
    });

    it('should include cause in StorageError', () => {
      const originalError = new Error('Original error');
      const storageError = new StorageError('Wrapper error', originalError);

      expect(storageError.cause).toBe(originalError);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle multiple set/get cycles', () => {
      const keys = [
        'sk-1111111111aaaaaaaaaabbbbbbbbbb',
        'sk-2222222222ccccccccccdddddddddd',
        'sk-3333333333eeeeeeeeeeffffffffff',
      ];

      keys.forEach((key) => {
        setAPIKey(key);
        expect(getAPIKey()).toBe(key);
      });
    });

    it('should maintain data integrity across operations', () => {
      const originalKey = 'sk-1234567890abcdefghijklmnop';

      // Set key
      setAPIKey(originalKey);

      // Check multiple times
      expect(getAPIKey()).toBe(originalKey);
      expect(getAPIKey()).toBe(originalKey);
      expect(hasAPIKey()).toBe(true);

      // Remove and verify
      removeAPIKey();
      expect(getAPIKey()).toBe(null);
      expect(hasAPIKey()).toBe(false);
    });

    it('should handle special characters in valid keys', () => {
      const keyWithSpecialChars = 'sk-1234567890_abcd-efgh_ijkl-mnop';

      setAPIKey(keyWithSpecialChars);
      expect(getAPIKey()).toBe(keyWithSpecialChars);
    });
  });
});
