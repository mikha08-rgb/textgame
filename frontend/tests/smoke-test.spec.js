import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - New Chat-First Interface
 * These tests verify basic UI loads without making actual API calls
 */

test.describe('Smoke Tests - UI Loading', () => {
  test('should load landing page with API key input', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Check page loaded
    await expect(page).toHaveTitle(/frontend/);

    // Check for main heading
    await expect(page.locator('h1')).toContainText('AI Adventure Engine');

    // Check for API key input
    await expect(page.locator('#api-key')).toBeVisible();

    // Check for Continue button
    await expect(page.locator('button:has-text("Continue")')).toBeVisible();

    console.log('✅ Landing page loads correctly');
  });

  test('should enable Continue button with valid API key format', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Initially button should be disabled
    await expect(page.locator('button:has-text("Continue")')).toBeDisabled();

    // Enter a validly formatted API key
    await page.fill('#api-key', 'sk-test123456789012345678901234567890123456789012345678');

    // Button should now be enabled
    await expect(page.locator('button:has-text("Continue"):not([disabled])')).toBeVisible();

    console.log('✅ API key format validation works');
  });

  test('should show worldbuilding studio with valid API key in localStorage', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Pre-populate localStorage with a test API key using the correct format
    // The app uses 'ai_adventure_api_key' with Base64 obfuscation
    await page.evaluate(() => {
      const testKey = 'sk-test123456789012345678901234567890';
      const obfuscated = 'aae_v1_' + btoa(testKey); // Match apiKeyStorage.js format
      localStorage.setItem('ai_adventure_api_key', obfuscated);
    });

    // Reload to pick up the stored key
    await page.reload();

    // Should now show the worldbuilding studio
    await expect(page.locator('.studio-layout')).toBeVisible({ timeout: 5000 });

    // Check for chat header
    await expect(page.locator('h1')).toContainText('Worldbuilding Studio');

    console.log('✅ Chat interface loads with stored API key');
  });

  test('should display welcome message and starter prompts', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    await page.evaluate(() => {
      const testKey = 'sk-test123456789012345678901234567890';
      const obfuscated = 'aae_v1_' + btoa(testKey);
      localStorage.setItem('ai_adventure_api_key', obfuscated);
    });

    await page.reload();
    await expect(page.locator('.studio-layout')).toBeVisible({ timeout: 5000 });

    // Check for welcome section
    await expect(page.locator('.welcome-section')).toBeVisible();
    await expect(page.locator('text=Let\'s Build Your World')).toBeVisible();

    // Check for starter prompts
    const starterPrompts = await page.locator('.starter-prompt-btn').count();
    expect(starterPrompts).toBeGreaterThan(0);

    console.log(`✅ Welcome section shows ${starterPrompts} starter prompts`);
  });

  test('should have functional chat input and send button', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    await page.evaluate(() => {
      const testKey = 'sk-test123456789012345678901234567890';
      const obfuscated = 'aae_v1_' + btoa(testKey);
      localStorage.setItem('ai_adventure_api_key', obfuscated);
    });

    await page.reload();
    await expect(page.locator('.studio-layout')).toBeVisible({ timeout: 5000 });

    // Check for chat input
    const input = page.locator('input[placeholder*="Describe"]');
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();

    // Type into input
    await input.fill('Test message');
    const inputValue = await input.inputValue();
    expect(inputValue).toBe('Test message');

    // Check send button appears and is enabled
    await expect(page.locator('button:has-text("Send")')).toBeEnabled();

    console.log('✅ Chat input and send button functional');
  });

  test('should show empty world preview initially', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    await page.evaluate(() => {
      const testKey = 'sk-test123456789012345678901234567890';
      const obfuscated = 'aae_v1_' + btoa(testKey);
      localStorage.setItem('ai_adventure_api_key', obfuscated);
    });

    await page.reload();
    await expect(page.locator('.studio-layout')).toBeVisible({ timeout: 5000 });

    // Check for empty preview
    await expect(page.locator('.empty-preview')).toBeVisible();
    await expect(page.locator('text=Your World Will Appear Here')).toBeVisible();

    console.log('✅ Empty world preview displays correctly');
  });

  test('should have proper split-screen layout', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    await page.evaluate(() => {
      const testKey = 'sk-test123456789012345678901234567890';
      const obfuscated = 'aae_v1_' + btoa(testKey);
      localStorage.setItem('ai_adventure_api_key', obfuscated);
    });

    await page.reload();
    await expect(page.locator('.studio-layout')).toBeVisible({ timeout: 5000 });

    // Check for chat panel
    await expect(page.locator('.chat-panel')).toBeVisible();

    // Check for world preview panel
    await expect(page.locator('.world-preview-panel')).toBeVisible();

    console.log('✅ Split-screen layout renders correctly');
  });

  test('should allow clicking starter prompts to fill input', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    await page.evaluate(() => {
      const testKey = 'sk-test123456789012345678901234567890';
      const obfuscated = 'aae_v1_' + btoa(testKey);
      localStorage.setItem('ai_adventure_api_key', obfuscated);
    });

    await page.reload();
    await expect(page.locator('.studio-layout')).toBeVisible({ timeout: 5000 });

    // Click first starter prompt
    const firstPrompt = page.locator('.starter-prompt-btn').first();
    const promptText = await firstPrompt.textContent();
    await firstPrompt.click();

    // Check input was filled
    const inputValue = await page.locator('input[placeholder*="Describe"]').inputValue();
    expect(inputValue).toBe(promptText);

    console.log('✅ Starter prompts fill chat input correctly');
  });
});

test.describe('Smoke Tests - Settings', () => {
  test('should open settings modal', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Click settings button
    await page.click('button[aria-label="Settings"]');

    // Wait for settings modal
    await page.waitForTimeout(500);

    // Check settings content is visible
    const settingsVisible = await page.locator('text=Settings').count();
    expect(settingsVisible).toBeGreaterThan(0);

    console.log('✅ Settings modal opens');
  });
});

console.log('\n' + '='.repeat(60));
console.log('SMOKE TESTS SUMMARY');
console.log('='.repeat(60));
console.log('These tests verify the new chat-first UI loads correctly.');
console.log('They do NOT test actual AI worldbuilding (requires valid API key).');
console.log('='.repeat(60) + '\n');
