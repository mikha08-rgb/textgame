import { chromium } from '@playwright/test';

async function quickDebug() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push(`PAGE ERROR: ${err.message}`);
  });

  try {
    console.log('Testing Landing Page...');
    await page.goto('http://localhost:5173', { timeout: 10000 });

    // Test 1: Invalid format
    console.log('\n1. Testing button with invalid API key format:');
    const input = page.locator('input[type="password"]').first();
    await input.fill('sk-short');
    await page.waitForTimeout(200);

    const button = page.locator('button:has-text("Continue")');
    console.log('   Button disabled:', await button.isDisabled());

    // Test 2: Valid format
    console.log('\n2. Testing button with valid API key format:');
    await input.fill('sk-' + 'x'.repeat(40));
    await page.waitForTimeout(200);
    console.log('   Button disabled:', await button.isDisabled());

    // Test 3: Check Settings button
    console.log('\n3. Checking Settings button:');
    const settingsBtn = page.locator('button[aria-label="Settings"]');
    console.log('   Settings button exists:', await settingsBtn.count() > 0);

    if (await settingsBtn.count() > 0) {
      await settingsBtn.click();
      await page.waitForTimeout(500);
      const settingsTitle = await page.locator('h1:has-text("Settings")').count();
      console.log('   Settings screen opened:', settingsTitle > 0);

      if (settingsTitle > 0) {
        // Check if we can see the Change API Key button
        const changeBtn = page.locator('button:has-text("Change API Key")');
        console.log('   Change API Key button exists:', await changeBtn.count() > 0);
      }
    }

    // Check for errors
    console.log('\n4. Error check:');
    console.log('   Errors captured:', errors.length);
    if (errors.length > 0) {
      console.log('   Errors:');
      errors.forEach(e => console.log('   -', e));
    }

    // Check localStorage
    const storage = await page.evaluate(() => ({
      apiKey: localStorage.getItem('ai_adventure_api_key'),
      settings: localStorage.getItem('ai_adventure_settings'),
    }));
    console.log('\n5. LocalStorage:');
    console.log('   API key stored:', !!storage.apiKey);
    console.log('   Settings stored:', !!storage.settings);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

quickDebug();
