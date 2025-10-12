import { test, expect } from '@playwright/test';

/**
 * Production Readiness Checks
 *
 * Validates:
 * - Console errors/warnings
 * - Error handling
 * - Edge cases
 * - Security concerns
 * - Performance
 */

test.describe('Production Readiness', () => {
  let consoleErrors = [];
  let consoleWarnings = [];
  let apiKey;

  test.beforeAll(() => {
    apiKey = process.env.OPENAI_API_KEY;
  });

  test.beforeEach(({ page }) => {
    // Capture console messages
    consoleErrors = [];
    consoleWarnings = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      consoleErrors.push(`PAGE ERROR: ${error.message}`);
    });
  });

  test('app loads without console errors', async ({ page }) => {
    console.log('\n' + '═'.repeat(80));
    console.log('🔍 CHECKING FOR CONSOLE ERRORS');
    console.log('═'.repeat(80) + '\n');

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log(`Console Errors: ${consoleErrors.length}`);
    console.log(`Console Warnings: ${consoleWarnings.length}\n`);

    if (consoleErrors.length > 0) {
      console.log('❌ Console Errors Found:');
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    } else {
      console.log('✅ No console errors\n');
    }

    if (consoleWarnings.length > 0) {
      console.log('⚠️  Console Warnings:');
      consoleWarnings.forEach(warn => console.log(`  - ${warn}`));
    }

    expect(consoleErrors.length).toBe(0);
  });

  test('handles invalid API key gracefully', async ({ page }) => {
    console.log('\n' + '═'.repeat(80));
    console.log('🔐 TESTING INVALID API KEY HANDLING');
    console.log('═'.repeat(80) + '\n');

    await page.goto('/');

    // Try invalid API key
    await page.fill('input[type="password"]', 'sk-invalid-key-123');
    await page.click('button:has-text("Continue")');

    // Should show error message
    const error = await page.waitForSelector('text=/Invalid|Could not validate|error/i', { timeout: 10000 });
    expect(error).toBeTruthy();

    const errorText = await error.textContent();
    console.log(`✅ Error message shown: "${errorText}"\n`);
  });

  test('handles empty API key input', async ({ page }) => {
    console.log('\n' + '═'.repeat(80));
    console.log('📝 TESTING EMPTY INPUT VALIDATION');
    console.log('═'.repeat(80) + '\n');

    await page.goto('/');

    // Try to submit empty
    const continueButton = page.locator('button:has-text("Continue")');

    // Should be disabled or show error
    const isDisabled = await continueButton.isDisabled();
    console.log(`Continue button disabled: ${isDisabled}\n`);

    if (!isDisabled) {
      await continueButton.click();
      await page.waitForTimeout(1000);

      // Should show validation error
      const hasError = await page.locator('text=/required|enter|provide/i').count() > 0;
      console.log(`Validation error shown: ${hasError}\n`);
      expect(hasError).toBe(true);
    } else {
      console.log('✅ Submit prevented when empty\n');
    }
  });

  test('handles network errors gracefully', async ({ page }) => {
    if (!apiKey) {
      test.skip('No API key provided');
      return;
    }

    console.log('\n' + '═'.repeat(80));
    console.log('🌐 TESTING NETWORK ERROR HANDLING');
    console.log('═'.repeat(80) + '\n');

    await page.goto('/');

    // Block OpenAI API requests to simulate network error
    await page.route('https://api.openai.com/**', route => {
      route.abort('failed');
    });

    await page.fill('input[type="password"]', apiKey);
    await page.click('button:has-text("Continue")');

    // Should show error about network/connection
    const error = await page.waitForSelector('text=/connection|network|try again/i', { timeout: 10000 });
    expect(error).toBeTruthy();

    const errorText = await error.textContent();
    console.log(`✅ Network error handled: "${errorText}"\n`);

    // Unblock for other tests
    await page.unroute('https://api.openai.com/**');
  });

  test('localStorage persists API key correctly', async ({ page, context }) => {
    if (!apiKey) {
      test.skip('No API key provided');
      return;
    }

    console.log('\n' + '═'.repeat(80));
    console.log('💾 TESTING LOCALSTORAGE PERSISTENCE');
    console.log('═'.repeat(80) + '\n');

    await page.goto('/');

    // Enter API key
    await page.fill('input[type="password"]', apiKey);
    await page.click('button:has-text("Continue")');

    // Wait for theme selection (confirms API key was stored)
    await page.waitForSelector('text=Choose Your Adventure', { timeout: 10000 });
    console.log('✅ API key accepted and stored\n');

    // Check localStorage
    const storedKey = await page.evaluate(() => {
      return localStorage.getItem('openai_api_key');
    });

    expect(storedKey).toBeTruthy();
    console.log('✅ API key found in localStorage\n');

    // Create new page in same context (should preserve storage)
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Should skip API key entry and go straight to theme selection
    const hasThemeSelection = await newPage.waitForSelector('text=Choose Your Adventure', { timeout: 5000 });
    expect(hasThemeSelection).toBeTruthy();
    console.log('✅ API key persisted across page loads\n');

    await newPage.close();
  });

  test('handles quota exceeded error', async ({ page }) => {
    console.log('\n' + '═'.repeat(80));
    console.log('💰 TESTING QUOTA ERROR HANDLING');
    console.log('═'.repeat(80) + '\n');

    await page.goto('/');

    // Mock quota exceeded response
    await page.route('https://api.openai.com/**', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            message: 'You exceeded your current quota',
            type: 'insufficient_quota',
            code: 'insufficient_quota'
          }
        })
      });
    });

    await page.fill('input[type="password"]', 'sk-test123456789012345678901234567890123456789012');
    await page.click('button:has-text("Continue")');

    // Should show quota error
    const error = await page.waitForSelector('text=/quota|billing/i', { timeout: 10000 });
    expect(error).toBeTruthy();

    const errorText = await error.textContent();
    console.log(`✅ Quota error handled: "${errorText}"\n`);

    await page.unroute('https://api.openai.com/**');
  });

  test('app is responsive on mobile viewport', async ({ page }) => {
    console.log('\n' + '═'.repeat(80));
    console.log('📱 TESTING MOBILE RESPONSIVENESS');
    console.log('═'.repeat(80) + '\n');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    console.log('Testing iPhone SE viewport (375x667)...\n');

    // Check that main elements are visible
    const heading = await page.locator('h1').first();
    expect(await heading.isVisible()).toBe(true);
    console.log('✅ Heading visible\n');

    const input = await page.locator('input[type="password"]');
    expect(await input.isVisible()).toBe(true);
    console.log('✅ Input field visible\n');

    const button = await page.locator('button:has-text("Continue")');
    expect(await button.isVisible()).toBe(true);
    console.log('✅ Button visible\n');

    // Check for horizontal scrolling (bad UX)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    console.log(`Body width: ${bodyWidth}px`);
    console.log(`Viewport width: ${viewportWidth}px\n`);

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // Allow 5px tolerance
    console.log('✅ No horizontal scroll\n');
  });

  test('export buttons work correctly', async ({ page }) => {
    if (!apiKey) {
      test.skip('No API key provided');
      return;
    }

    test.setTimeout(300000); // 5 minutes

    console.log('\n' + '═'.repeat(80));
    console.log('📤 TESTING EXPORT FUNCTIONALITY');
    console.log('═'.repeat(80) + '\n');

    await page.goto('/');

    // Login and generate world
    await page.fill('input[type="password"]', apiKey);
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text=Choose Your Adventure');
    await page.click('button:has-text("Fantasy")');
    await page.click('button:has-text("Start Adventure")');
    await page.waitForSelector('h1', { timeout: 200000 });

    console.log('World generated, testing exports...\n');

    // Test JSON export
    const [jsonDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Export JSON")')
    ]);

    const jsonFilename = jsonDownload.suggestedFilename();
    console.log(`✅ JSON export triggered: ${jsonFilename}`);
    expect(jsonFilename).toMatch(/\.json$/);

    // Test Markdown export
    const [mdDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Export Markdown")')
    ]);

    const mdFilename = mdDownload.suggestedFilename();
    console.log(`✅ Markdown export triggered: ${mdFilename}\n`);
    expect(mdFilename).toMatch(/\.md$/);
  });

  test('settings can be accessed and closed', async ({ page }) => {
    if (!apiKey) {
      test.skip('No API key provided');
      return;
    }

    test.setTimeout(300000);

    console.log('\n' + '═'.repeat(80));
    console.log('⚙️  TESTING SETTINGS FUNCTIONALITY');
    console.log('═'.repeat(80) + '\n');

    await page.goto('/');
    await page.fill('input[type="password"]', apiKey);
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text=Choose Your Adventure');
    await page.click('button:has-text("Fantasy")');
    await page.click('button:has-text("Start Adventure")');
    await page.waitForSelector('h1', { timeout: 200000 });

    // Open settings
    const settingsButton = page.locator('button[aria-label="Settings"]');
    await settingsButton.click();
    await page.waitForTimeout(500);

    // Check settings modal is visible
    const settingsModal = await page.locator('text=Settings').count();
    expect(settingsModal).toBeGreaterThan(0);
    console.log('✅ Settings modal opened\n');

    // Close settings
    const closeButton = page.locator('button:has-text("Close")');
    await closeButton.click();
    await page.waitForTimeout(500);

    // Settings should be closed
    const stillVisible = await page.locator('text=API Key Management').count();
    expect(stillVisible).toBe(0);
    console.log('✅ Settings modal closed\n');
  });

  test('app handles long generation times', async ({ page }) => {
    if (!apiKey) {
      test.skip('No API key provided');
      return;
    }

    test.setTimeout(300000);

    console.log('\n' + '═'.repeat(80));
    console.log('⏱️  TESTING LOADING STATES');
    console.log('═'.repeat(80) + '\n');

    await page.goto('/');
    await page.fill('input[type="password"]', apiKey);
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text=Choose Your Adventure');
    await page.click('button:has-text("Fantasy")');
    await page.click('button:has-text("Start Adventure")');

    // Check for loading indicator
    const loadingText = await page.waitForSelector('text=/Conjuring|Forging|Crafting/', { timeout: 10000 });
    expect(loadingText).toBeTruthy();
    console.log('✅ Loading indicator shown during generation\n');

    // Wait for completion
    await page.waitForSelector('h1', { timeout: 200000 });
    console.log('✅ World generated successfully\n');

    // Loading indicator should be gone
    const stillLoading = await page.locator('text=/Conjuring|Forging|Crafting/').count();
    expect(stillLoading).toBe(0);
    console.log('✅ Loading indicator removed after completion\n');
  });
});
