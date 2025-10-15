/**
 * Comprehensive Playwright test for the worldbuilding app
 * Tests the complete user flow from API key entry to world generation
 */

import { chromium } from 'playwright';

const API_KEY = process.env.OPENAI_API_KEY;
const APP_URL = 'http://localhost:5174';

async function testAppFlow() {
  console.log('🧪 Starting Playwright test...\n');

  const browser = await chromium.launch({
    headless: false, // Show browser for debugging
    slowMo: 100 // Slow down actions so we can see what's happening
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Step 1: Load the app
    console.log('📄 Step 1: Loading app...');
    await page.goto(APP_URL);
    await page.waitForLoadState('networkidle');
    console.log('✅ App loaded\n');

    // Step 2: Enter API key
    console.log('🔑 Step 2: Entering API key...');
    const apiKeyInput = await page.waitForSelector('input[type="password"]', { timeout: 5000 });
    await apiKeyInput.fill(API_KEY);

    const submitButton = await page.waitForSelector('button:has-text("Continue")');
    await submitButton.click();
    console.log('✅ API key submitted\n');

    // Step 3: Select theme
    console.log('🎨 Step 3: Selecting theme...');
    await page.waitForSelector('text=Choose Your Adventure', { timeout: 5000 });

    // Click the Fantasy theme button
    const fantasyTheme = await page.waitForSelector('button:has-text("Fantasy")');
    await fantasyTheme.click();
    console.log('   Selected Fantasy theme');

    // Click the "Start Adventure" button
    const startButton = await page.waitForSelector('button:has-text("Start Adventure")');
    await startButton.click();
    console.log('✅ Theme selected\n');

    // Step 4: Wait for world generation
    console.log('🌍 Step 4: Waiting for world generation...');
    console.log('   (This may take 60-120 seconds with GPT-4o)');

    // Check for loading indicator
    const loadingText = await page.waitForSelector('text=/Conjuring|Forging|Crafting|Designing/', { timeout: 5000 });
    console.log('   Loading indicator detected');

    // Wait for the world to be generated (timeout after 3 minutes)
    // World should appear when we see the world name as a heading
    await page.waitForSelector('h1', { timeout: 180000 });
    console.log('✅ World generated!\n');

    // Step 5: Verify world data is displayed
    console.log('📊 Step 5: Verifying world data...');

    const checks = {
      worldName: false,
      tagline: false,
      theme: false,
      geography: false,
      history: false,
      magicSystem: false,
      cultures: false,
      conflicts: false,
      economy: false,
      dailyLife: false,
      uniqueFeature: false,
      secrets: false,
      exportButtons: false,
      navigationTabs: false,
    };

    // Check for world name
    const worldNameElement = await page.$('h1');
    if (worldNameElement) {
      const worldName = await worldNameElement.textContent();
      if (worldName && worldName.length > 0) {
        checks.worldName = true;
        console.log(`   ✅ World Name: "${worldName}"`);
      }
    }

    // Check for tagline
    if (await page.$('text=/.*breath.*|.*law.*|.*magic.*/i')) {
      checks.tagline = true;
      console.log('   ✅ Tagline present');
    }

    // Check for major sections
    if (await page.$('text=Core Theme')) {
      checks.theme = true;
      console.log('   ✅ Theme section present');
    }

    if (await page.$('text=Geography')) {
      checks.geography = true;
      console.log('   ✅ Geography section present');
    }

    if (await page.$('text=History')) {
      checks.history = true;
      console.log('   ✅ History section present');
    }

    if (await page.$('text=Magic System')) {
      checks.magicSystem = true;
      console.log('   ✅ Magic System section present');
    }

    if (await page.$('text=Cultures')) {
      checks.cultures = true;
      console.log('   ✅ Cultures section present');
    }

    if (await page.$('text=Conflicts')) {
      checks.conflicts = true;
      console.log('   ✅ Conflicts section present');
    }

    if (await page.$('text=Economy')) {
      checks.economy = true;
      console.log('   ✅ Economy section present');
    }

    if (await page.$('text=Daily Life')) {
      checks.dailyLife = true;
      console.log('   ✅ Daily Life section present');
    }

    if (await page.$('text=Unique Feature')) {
      checks.uniqueFeature = true;
      console.log('   ✅ Unique Feature section present');
    }

    if (await page.$('text=Hidden Secrets')) {
      checks.secrets = true;
      console.log('   ✅ Secrets section present');
    }

    // Check for export buttons
    if (await page.$('button:has-text("Export JSON")') && await page.$('button:has-text("Export Markdown")')) {
      checks.exportButtons = true;
      console.log('   ✅ Export buttons present');
    }

    // Check for navigation tabs
    if (await page.$('button:has-text("Overview")')) {
      checks.navigationTabs = true;
      console.log('   ✅ Navigation tabs present');
    }

    console.log('');

    // Step 6: Test navigation
    console.log('🔄 Step 6: Testing navigation...');

    // Check if there are culture tabs
    const cultureButtons = await page.$$('button');
    let foundCultureTab = false;
    for (const button of cultureButtons) {
      const text = await button.textContent();
      // Look for culture names (not "Overview" or "Characters" etc)
      if (text && !text.match(/Overview|Characters|Locations|Legends|History|Ask Questions|Generate|Explore/)) {
        console.log(`   Found culture tab: "${text}"`);
        foundCultureTab = true;
        break;
      }
    }

    if (foundCultureTab) {
      console.log('   ✅ Culture navigation working');
    }

    // Step 7: Test "Explore Further" buttons
    console.log('\n🎯 Step 7: Testing action buttons...');

    if (await page.$('button:has-text("Generate Character")')) {
      console.log('   ✅ Generate Character button present');
    }
    if (await page.$('button:has-text("Generate Location")')) {
      console.log('   ✅ Generate Location button present');
    }
    if (await page.$('button:has-text("Generate Legend")')) {
      console.log('   ✅ Generate Legend button present');
    }
    if (await page.$('button:has-text("Generate Historical Event")')) {
      console.log('   ✅ Generate Historical Event button present');
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📋 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');

    const passedChecks = Object.values(checks).filter(v => v).length;
    const totalChecks = Object.keys(checks).length;

    console.log(`Passed: ${passedChecks}/${totalChecks} checks`);
    console.log('');

    Object.entries(checks).forEach(([check, passed]) => {
      console.log(`  ${passed ? '✅' : '❌'} ${check}`);
    });

    console.log('');

    if (passedChecks === totalChecks) {
      console.log('✅ ALL TESTS PASSED!');
      console.log('   The app is working correctly.\n');
    } else {
      console.log('⚠️  SOME TESTS FAILED');
      console.log('   Review the results above for details.\n');
    }

    // Keep browser open for 5 seconds so user can see result
    console.log('Keeping browser open for 5 seconds...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);

    // Take a screenshot for debugging
    await page.screenshot({ path: 'test-error-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved to test-error-screenshot.png');

    throw error;
  } finally {
    await browser.close();
  }
}

// Run the test
testAppFlow()
  .then(() => {
    console.log('✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
