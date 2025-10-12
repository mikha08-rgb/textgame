/**
 * Debug API Key Validation Issues
 * This test will help identify what's going wrong with API key validation
 */

import { chromium } from '@playwright/test';

async function debugAPIKeyValidation() {
  console.log('🔍 Starting API Key Validation Debug...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });
    console.log(`[${msg.type().toUpperCase()}] ${text}`);
  });

  // Collect errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
    console.error('❌ PAGE ERROR:', error.message);
  });

  try {
    // Test 1: Landing Page API Key Validation
    console.log('\n📋 Test 1: Landing Page API Key Validation');
    console.log('=' .repeat(60));

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Check if page loaded correctly
    const title = await page.title();
    console.log('✓ Page loaded:', title);

    // Check if API key input exists
    const apiKeyInput = await page.locator('input[type="password"]').first();
    const inputExists = await apiKeyInput.count() > 0;
    console.log('✓ API key input found:', inputExists);

    if (inputExists) {
      // Try with invalid format
      console.log('\n🧪 Testing invalid format (too short)...');
      await apiKeyInput.fill('sk-test');
      await page.waitForTimeout(500);

      // Check if button is disabled
      const continueButton = page.locator('button:has-text("Continue")');
      const isDisabledForInvalid = await continueButton.isDisabled();
      console.log('✓ Continue button disabled for invalid format:', isDisabledForInvalid);

      // Check for error message
      const errorText = await page.locator('.text-red-600, .text-red-700, [class*="error"]').first().textContent().catch(() => null);
      if (errorText) {
        console.log('✓ Format validation error shown:', errorText);
      }

      // Try with valid format but fake key
      console.log('\n🧪 Testing valid format but fake key...');
      await apiKeyInput.fill('sk-fakekeythatdoesnotexist1234567890abcdefghijklmnop');
      await page.waitForTimeout(500);

      // Check if button is enabled now
      const isDisabledForValid = await continueButton.isDisabled();
      console.log('✓ Continue button disabled for valid format:', isDisabledForValid);

      if (!isDisabledForValid) {
        console.log('🔄 Clicking Continue to test validation...');
        await continueButton.click();

        // Wait and check for "Validating..." state
        await page.waitForTimeout(500);
        let buttonText = await continueButton.textContent();
        console.log('Button text during validation:', buttonText.trim());

        // Wait for validation to complete
        await page.waitForTimeout(5000);

        buttonText = await continueButton.textContent();
        console.log('Button text after validation:', buttonText.trim());

        // Check for validation error
        const validationError = await page.locator('.text-red-600, .text-red-700').first().textContent().catch(() => null);
        if (validationError) {
          console.log('✓ Validation error shown:', validationError);
        } else {
          console.log('⚠️  No validation error message shown');
        }
      } else {
        console.log('⚠️  Button still disabled even with valid format!');
      }
    }

    // Test 2: Check if Settings icon exists
    console.log('\n\n📋 Test 2: Settings Screen Access');
    console.log('=' .repeat(60));

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    const settingsButton = page.locator('button[aria-label="Settings"], button[title="Settings"]');
    const settingsExists = await settingsButton.count() > 0;
    console.log('✓ Settings button found:', settingsExists);

    if (settingsExists) {
      console.log('🔄 Clicking Settings button...');
      await settingsButton.click();
      await page.waitForTimeout(1000);

      // Check if Settings screen opened
      const settingsTitle = await page.locator('h1:has-text("Settings")').count();
      console.log('✓ Settings screen opened:', settingsTitle > 0);

      if (settingsTitle > 0) {
        // Check for API key display
        const apiKeyDisplay = await page.locator('code').filter({ hasText: 'sk-' }).textContent().catch(() => 'No API key set');
        console.log('✓ Current API key display:', apiKeyDisplay);

        // Test Change API Key
        console.log('\n🧪 Testing Change API Key...');
        const changeButton = page.locator('button:has-text("Change API Key")');
        const changeButtonExists = await changeButton.count() > 0;
        console.log('✓ Change API Key button found:', changeButtonExists);

        if (changeButtonExists) {
          await changeButton.click();
          await page.waitForTimeout(500);

          // Check if form appeared
          const newKeyInput = page.locator('input[placeholder="sk-..."]');
          const formVisible = await newKeyInput.count() > 0;
          console.log('✓ Change API Key form visible:', formVisible);

          if (formVisible) {
            // Try to change key
            console.log('🔄 Testing API key change with invalid format...');
            await newKeyInput.fill('invalid-key');
            await page.locator('button:has-text("Update Key")').click();
            await page.waitForTimeout(1000);

            const changeError = await page.locator('.text-red-700, .text-red-600, [class*="error"]').first().textContent().catch(() => null);
            if (changeError) {
              console.log('✓ Change validation error shown:', changeError);
            } else {
              console.log('⚠️  No error shown for invalid format in change');
            }

            // Try with valid format
            console.log('\n🔄 Testing API key change with valid format...');
            await newKeyInput.fill('sk-fakekeythatdoesnotexist1234567890abcdefghijklmnop');
            await page.locator('button:has-text("Update Key")').click();

            // Wait for validation
            await page.waitForTimeout(5000);

            // Check for success or error
            const successMsg = await page.locator('.text-green-700, .text-green-600, [class*="success"]').textContent().catch(() => null);
            const errorMsg = await page.locator('.text-red-700, .text-red-600, [class*="error"]').textContent().catch(() => null);

            if (successMsg) {
              console.log('✓ Success message:', successMsg);
            } else if (errorMsg) {
              console.log('✓ Error message:', errorMsg);
            } else {
              console.log('⚠️  No feedback shown after validation attempt');
            }
          }
        }
      }
    }

    // Test 3: Check localStorage
    console.log('\n\n📋 Test 3: LocalStorage Check');
    console.log('=' .repeat(60));

    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
      }
      return data;
    });

    console.log('LocalStorage keys:', Object.keys(localStorageData));
    if (localStorageData['ai_adventure_api_key']) {
      console.log('✓ API key in storage: [present, value hidden]');
    } else {
      console.log('⚠️  No API key in storage');
    }

    if (localStorageData['ai_adventure_settings']) {
      const settings = JSON.parse(localStorageData['ai_adventure_settings']);
      console.log('✓ Settings in storage:', settings);
    }

    // Summary
    console.log('\n\n📊 Debug Summary');
    console.log('=' .repeat(60));
    console.log(`Console messages captured: ${consoleMessages.length}`);
    console.log(`Page errors captured: ${pageErrors.length}`);

    if (pageErrors.length > 0) {
      console.log('\n❌ Page Errors:');
      pageErrors.forEach((err, i) => {
        console.log(`  ${i + 1}. ${err}`);
      });
    }

    // Check for specific error patterns
    console.log('\n🔍 Error Analysis:');
    const hasNetworkError = consoleMessages.some(m => m.text.includes('Network') || m.text.includes('network'));
    const hasValidationError = consoleMessages.some(m => m.text.includes('validation') || m.text.includes('Invalid'));
    const hasTimeoutError = consoleMessages.some(m => m.text.includes('timeout') || m.text.includes('Timeout'));

    console.log('Network errors detected:', hasNetworkError);
    console.log('Validation errors detected:', hasValidationError);
    console.log('Timeout errors detected:', hasTimeoutError);

    // Wait a bit to see the final state
    console.log('\n⏸️  Pausing for 3 seconds to review...');
    await page.waitForTimeout(3000);

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Debug session complete\n');
  }
}

// Run the debug
debugAPIKeyValidation().catch(console.error);
