/**
 * API Key Storage Module
 * Handles secure storage and retrieval of OpenAI API keys in browser localStorage
 *
 * SECURITY NOTE:
 * - Keys are stored in browser localStorage with basic obfuscation
 * - This is NOT encryption - it only prevents casual viewing
 * - Keys remain accessible to JavaScript and browser extensions
 * - This is acceptable for client-side apps where users provide their own keys
 * - Never store API keys on a server or in version control
 */

const STORAGE_KEY = 'ai_adventure_api_key';
const OBFUSCATION_PREFIX = 'aae_v1_';

/**
 * Custom error for storage-related failures
 */
export class StorageError extends Error {
  constructor(message, cause = null) {
    super(message);
    this.name = 'StorageError';
    this.cause = cause;
  }
}

/**
 * Check if localStorage is available and functional
 * @returns {boolean} True if localStorage is available
 */
function isLocalStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Simple obfuscation using Base64 encoding
 * NOT encryption - just prevents casual viewing in DevTools
 * @param {string} text - Text to obfuscate
 * @returns {string} Obfuscated text with prefix
 */
function obfuscate(text) {
  try {
    const encoded = btoa(text);
    return OBFUSCATION_PREFIX + encoded;
  } catch (error) {
    throw new StorageError('Failed to obfuscate data', error);
  }
}

/**
 * Deobfuscate Base64 encoded text
 * @param {string} obfuscated - Obfuscated text with prefix
 * @returns {string} Original text
 */
function deobfuscate(obfuscated) {
  try {
    if (!obfuscated.startsWith(OBFUSCATION_PREFIX)) {
      throw new Error('Invalid obfuscation format');
    }
    const encoded = obfuscated.slice(OBFUSCATION_PREFIX.length);
    return atob(encoded);
  } catch (error) {
    throw new StorageError('Failed to deobfuscate data', error);
  }
}

/**
 * Validate API key format
 * OpenAI keys typically start with 'sk-' and are alphanumeric with some special chars
 * @param {string} apiKey - API key to validate
 * @returns {boolean} True if key appears valid
 */
export function isValidAPIKeyFormat(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  const trimmed = apiKey.trim();

  // Check minimum length (OpenAI keys are typically 40+ characters)
  if (trimmed.length < 20) {
    return false;
  }

  // Check if it starts with 'sk-' (OpenAI format)
  if (!trimmed.startsWith('sk-')) {
    return false;
  }

  // Check if it contains only valid characters (alphanumeric, hyphens, underscores)
  const validCharsRegex = /^sk-[A-Za-z0-9_-]+$/;
  if (!validCharsRegex.test(trimmed)) {
    return false;
  }

  return true;
}

/**
 * Sanitize API key by trimming whitespace
 * @param {string} apiKey - API key to sanitize
 * @returns {string} Sanitized API key
 */
export function sanitizeAPIKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return '';
  }
  return apiKey.trim();
}

/**
 * Store API key in localStorage with obfuscation
 * @param {string} apiKey - OpenAI API key to store
 * @throws {StorageError} If storage is unavailable or key is invalid
 * @returns {boolean} True if successfully stored
 */
export function setAPIKey(apiKey) {
  // Check localStorage availability
  if (!isLocalStorageAvailable()) {
    throw new StorageError(
      'localStorage is not available. Please enable cookies/storage in your browser.'
    );
  }

  // Sanitize input
  const sanitized = sanitizeAPIKey(apiKey);

  // Validate format
  if (!isValidAPIKeyFormat(sanitized)) {
    throw new StorageError(
      'Invalid API key format. OpenAI keys should start with "sk-" and be at least 20 characters.'
    );
  }

  try {
    // Obfuscate and store
    const obfuscated = obfuscate(sanitized);
    localStorage.setItem(STORAGE_KEY, obfuscated);
    console.log('[Storage] API key stored successfully');
    return true;
  } catch (error) {
    if (error instanceof StorageError) {
      throw error;
    }
    throw new StorageError('Failed to store API key', error);
  }
}

/**
 * Retrieve API key from localStorage
 * @returns {string|null} API key if found, null otherwise
 * @throws {StorageError} If storage is unavailable or data is corrupted
 */
export function getAPIKey() {
  // Check localStorage availability
  if (!isLocalStorageAvailable()) {
    throw new StorageError(
      'localStorage is not available. Please enable cookies/storage in your browser.'
    );
  }

  try {
    const obfuscated = localStorage.getItem(STORAGE_KEY);

    if (!obfuscated) {
      return null;
    }

    // Deobfuscate and return
    const apiKey = deobfuscate(obfuscated);
    console.log('[Storage] API key retrieved successfully');
    return apiKey;
  } catch (error) {
    if (error instanceof StorageError) {
      // Data corruption - remove invalid data
      console.error('[Storage] Corrupted data detected, clearing storage');
      removeAPIKey();
      return null;
    }
    throw new StorageError('Failed to retrieve API key', error);
  }
}

/**
 * Remove API key from localStorage
 * @returns {boolean} True if successfully removed
 */
export function removeAPIKey() {
  // Check localStorage availability (non-critical for removal)
  if (!isLocalStorageAvailable()) {
    console.warn('[Storage] localStorage not available, nothing to remove');
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('[Storage] API key removed successfully');
    return true;
  } catch (error) {
    console.error('[Storage] Failed to remove API key', error);
    return false;
  }
}

/**
 * Check if an API key is stored
 * @returns {boolean} True if a key exists in storage
 */
export function hasAPIKey() {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value !== null && value !== undefined;
  } catch (error) {
    console.error('[Storage] Failed to check for API key', error);
    return false;
  }
}

/**
 * Clear all application data from localStorage
 * Currently only removes API key, but can be extended for other data
 * @returns {boolean} True if successfully cleared
 */
export function clearAllData() {
  console.log('[Storage] Clearing all application data');
  return removeAPIKey();
}
