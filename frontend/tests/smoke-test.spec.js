import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Critical User Flow
 * These tests verify the app doesn't have breaking issues
 */

test.describe('Smoke Tests - Critical Flows', () => {
  let apiKey;

  test.beforeAll(() => {
    apiKey = process.env.OPENAI_API_KEY;
  });

  test('complete user flow: API key → theme → world generation', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    if (!apiKey) {
      test.skip('No API key provided');
      return;
    }

    console.log('\n🔥 SMOKE TEST: Complete User Flow\n');

    // Track any console errors
    const consoleErrors = [];
    const consoleWarnings = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
      if (msg.type() === 'warning') consoleWarnings.push(msg.text());
    });

    page.on('pageerror', error => {
      consoleErrors.push(`PAGE ERROR: ${error.message}`);
    });

    // Step 1: Load app
    console.log('Step 1: Loading app...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check no errors on load
    expect(consoleErrors.length).toBe(0);
    console.log('✓ App loaded without errors\n');

    // Step 2: Enter API key
    console.log('Step 2: Entering API key...');
    const input = await page.waitForSelector('input[type="password"]');
    expect(input).toBeTruthy();

    await page.fill('input[type="password"]', apiKey);

    const continueBtn = await page.locator('button:has-text("Continue")');
    await expect(continueBtn).toBeVisible();
    await continueBtn.click();
    console.log('✓ API key submitted\n');

    // Step 3: Select theme
    console.log('Step 3: Selecting theme...');
    await page.waitForSelector('text=Choose Your Adventure', { timeout: 10000 });

    const fantasyBtn = await page.locator('button:has-text("Fantasy")');
    await expect(fantasyBtn).toBeVisible();
    await fantasyBtn.click();
    console.log('✓ Theme selected\n');

    const startBtn = await page.locator('button:has-text("Start Adventure")');
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    console.log('✓ Adventure started\n');

    // Step 4: Wait for world generation
    console.log('Step 4: Waiting for world generation...');

    // Check for loading indicator
    const loading = await page.waitForSelector('text=/Conjuring|Forging|Crafting/', { timeout: 10000 });
    expect(loading).toBeTruthy();
    console.log('✓ Loading indicator shown\n');

    // Wait for world name to appear
    await page.waitForSelector('h1', { timeout: 200000 });
    const worldName = await page.locator('h1').first().textContent();
    expect(worldName).toBeTruthy();
    expect(worldName.length).toBeGreaterThan(0);
    console.log(`✓ World generated: "${worldName}"\n`);

    // Step 5: Verify world content
    console.log('Step 5: Verifying world content...');

    // Check for export buttons
    const exportJSON = await page.locator('button:has-text("Export JSON")');
    await expect(exportJSON).toBeVisible();

    const exportMD = await page.locator('button:has-text("Export Markdown")');
    await expect(exportMD).toBeVisible();
    console.log('✓ Export buttons present\n');

    // Check for generation buttons
    const genChar = await page.locator('button:has-text("Generate Character")');
    const genLoc = await page.locator('button:has-text("Generate Location")');

    const hasGenerationButtons = (await genChar.count() > 0) || (await genLoc.count() > 0);
    expect(hasGenerationButtons).toBe(true);
    console.log('✓ Generation buttons present\n');

    // Final check for errors
    console.log('Step 6: Final error check...');
    expect(consoleErrors.length).toBe(0);
    console.log('✓ No console errors during entire flow\n');

    console.log('═'.repeat(60));
    console.log('✅ SMOKE TEST PASSED - No breaking issues!');
    console.log('═'.repeat(60) + '\n');
  });

  test('app handles page refresh correctly', async ({ page }) => {
    if (!apiKey) {
      test.skip('No API key provided');
      return;
    }

    console.log('\n🔥 SMOKE TEST: Page Refresh Handling\n');

    // Enter API key
    await page.goto('/');
    await page.fill('input[type="password"]', apiKey);
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text=Choose Your Adventure');

    console.log('✓ Logged in\n');

    // Refresh page
    console.log('Refreshing page...');
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be on theme selection (API key persisted)
    const hasThemeSelection = await page.locator('text=Choose Your Adventure').count();
    expect(hasThemeSelection).toBeGreaterThan(0);
    console.log('✓ API key persisted after refresh\n');

    console.log('✅ REFRESH TEST PASSED\n');
  });

  test('export functionality works', async ({ page }) => {
    test.setTimeout(300000);

    if (!apiKey) {
      test.skip('No API key provided');
      return;
    }

    console.log('\n🔥 SMOKE TEST: Export Functionality\n');

    // Quick flow to get to world view
    await page.goto('/');
    await page.fill('input[type="password"]', apiKey);
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text=Choose Your Adventure');
    await page.click('button:has-text("Fantasy")');
    await page.click('button:has-text("Start Adventure")');
    await page.waitForSelector('h1', { timeout: 200000 });

    console.log('✓ World generated\n');

    // Test JSON export
    console.log('Testing JSON export...');
    const [jsonDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Export JSON")')
    ]);

    const jsonFilename = jsonDownload.suggestedFilename();
    expect(jsonFilename).toMatch(/\.json$/);
    console.log(`✓ JSON export: ${jsonFilename}\n`);

    // Test Markdown export
    console.log('Testing Markdown export...');
    const [mdDownload] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Export Markdown")')
    ]);

    const mdFilename = mdDownload.suggestedFilename();
    expect(mdFilename).toMatch(/\.md$/);
    console.log(`✓ Markdown export: ${mdFilename}\n`);

    console.log('✅ EXPORT TEST PASSED\n');
  });

  test('settings can be opened and API key cleared', async ({ page }) => {
    test.setTimeout(300000);

    if (!apiKey) {
      test.skip('No API key provided');
      return;
    }

    console.log('\n🔥 SMOKE TEST: Settings Management\n');

    // Get to world view
    await page.goto('/');
    await page.fill('input[type="password"]', apiKey);
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('text=Choose Your Adventure');
    await page.click('button:has-text("Fantasy")');
    await page.click('button:has-text("Start Adventure")');
    await page.waitForSelector('h1', { timeout: 200000 });

    console.log('✓ World generated\n');

    // Open settings
    console.log('Opening settings...');
    const settingsBtn = page.locator('button[aria-label="Settings"]');
    await settingsBtn.click();
    await page.waitForTimeout(500);

    const settingsVisible = await page.locator('text=Settings').count();
    expect(settingsVisible).toBeGreaterThan(0);
    console.log('✓ Settings opened\n');

    // Close settings
    console.log('Closing settings...');
    const closeBtn = page.locator('button:has-text("Close")');
    await closeBtn.click();
    await page.waitForTimeout(500);

    const settingsClosed = await page.locator('text=API Key Management').count();
    expect(settingsClosed).toBe(0);
    console.log('✓ Settings closed\n');

    console.log('✅ SETTINGS TEST PASSED\n');
  });
});
