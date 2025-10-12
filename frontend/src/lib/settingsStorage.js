/**
 * Settings Storage Utility
 * Manages user preferences in localStorage
 */

const SETTINGS_KEY = 'ai_adventure_settings';

/**
 * Default settings
 */
const DEFAULT_SETTINGS = {
  costWarningsEnabled: true,
};

/**
 * Get all settings
 * @returns {Object} Settings object
 */
export function getSettings() {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('[Settings] Failed to load settings:', error);
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Save settings
 * @param {Object} settings - Settings to save
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('[Settings] Failed to save settings:', error);
  }
}

/**
 * Get a specific setting
 * @param {string} key - Setting key
 * @returns {*} Setting value
 */
export function getSetting(key) {
  const settings = getSettings();
  return settings[key];
}

/**
 * Update a specific setting
 * @param {string} key - Setting key
 * @param {*} value - Setting value
 */
export function updateSetting(key, value) {
  const settings = getSettings();
  settings[key] = value;
  saveSettings(settings);
}

/**
 * Check if cost warnings are enabled
 * @returns {boolean} True if cost warnings are enabled
 */
export function areCostWarningsEnabled() {
  return getSetting('costWarningsEnabled') !== false;
}

/**
 * Toggle cost warnings
 * @param {boolean} enabled - Whether to enable cost warnings
 */
export function setCostWarningsEnabled(enabled) {
  updateSetting('costWarningsEnabled', enabled);
}
