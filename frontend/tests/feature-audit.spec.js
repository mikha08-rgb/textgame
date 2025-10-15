/**
 * Comprehensive Feature Audit
 * Tests all worldbuilding features to identify issues
 */

import { test, expect } from '@playwright/test';

const API_KEY = process.env.OPENAI_API_KEY;

test.describe('Feature Audit - Story World Studio', () => {
  let page;
  let worldGenerated = false;

  test.beforeAll(async ({ browser }) => {
    if (!API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable required for testing');
    }
  });

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    await page.goto('http://localhost:5173');
  });

  test('1. World Generation - Quality Check', async () => {
    console.log('\n📝 Testing: World Generation');

    // Enter API key
    await page.fill('input[type="password"]', API_KEY);
    await page.click('button:has-text("Continue")');

    // Select theme
    await page.click('button:has-text("Fantasy")');
    await page.click('button:has-text("Start Adventure")');

    // Wait for generation (up to 3 minutes)
    console.log('  ⏳ Waiting for world generation (this takes 1-2 minutes)...');
    await page.waitForSelector('text=/World/', { timeout: 180000 });

    worldGenerated = true;

    // Check if world has all expected sections
    const sections = [
      'Core Theme',
      'Geography',
      'History',
      'Magic System',
      'Cultures',
      'Conflicts',
      'Economy',
      'Daily Life',
      'Unique Feature',
      'Hidden Secrets'
    ];

    const missingSections = [];
    for (const section of sections) {
      const found = await page.locator(`text=${section}`).count() > 0;
      if (!found) {
        missingSections.push(section);
      }
    }

    if (missingSections.length > 0) {
      console.log(`  ⚠️  Missing sections: ${missingSections.join(', ')}`);
    } else {
      console.log('  ✅ All 10 sections present');
    }

    // Check content quality
    const bodyText = await page.textContent('body');
    if (bodyText.length < 1000) {
      console.log('  ❌ World content seems too short');
    } else {
      console.log('  ✅ World has substantial content');
    }
  });

  test('2. Culture Expansion', async () => {
    test.skip(!worldGenerated, 'World not generated yet');
    console.log('\n📝 Testing: Culture Expansion');

    // Find and click first "Explore Culture" button
    const exploreButton = page.locator('button:has-text("Explore")').first();
    if (await exploreButton.count() === 0) {
      console.log('  ❌ No "Explore Culture" buttons found');
      return;
    }

    await exploreButton.click();
    console.log('  ⏳ Generating culture expansion...');

    // Wait for expansion (30 seconds)
    try {
      await page.waitForSelector('text=/Daily Life|Notable Figures/', { timeout: 60000 });
      console.log('  ✅ Culture expansion generated');
    } catch (error) {
      console.log('  ❌ Culture expansion failed or timed out');
    }
  });

  test('3. Character Generation', async () => {
    test.skip(!worldGenerated, 'World not generated yet');
    console.log('\n📝 Testing: Character Generation');

    // Find "Generate Character" button
    const charButton = page.locator('button:has-text("Generate Character")');
    if (await charButton.count() === 0) {
      console.log('  ❌ "Generate Character" button not found');
      return;
    }

    await charButton.click();
    console.log('  ⏳ Generating character...');

    try {
      await page.waitForSelector('text=/Age:|Role:|Physical Description/', { timeout: 60000 });
      console.log('  ✅ Character generated');

      // Check if character has required fields
      const charText = await page.textContent('body');
      const hasAge = charText.includes('Age:');
      const hasRole = charText.includes('Role:');
      const hasGoal = charText.includes('Goal:');

      if (!hasAge || !hasRole || !hasGoal) {
        console.log('  ⚠️  Character missing some fields');
      }
    } catch (error) {
      console.log('  ❌ Character generation failed or timed out');
    }
  });

  test('4. Location Generation', async () => {
    test.skip(!worldGenerated, 'World not generated yet');
    console.log('\n📝 Testing: Location Generation');

    const locButton = page.locator('button:has-text("Generate Location")');
    if (await locButton.count() === 0) {
      console.log('  ❌ "Generate Location" button not found');
      return;
    }

    await locButton.click();
    console.log('  ⏳ Generating location...');

    try {
      await page.waitForSelector('text=/Type:|Inhabitants:|Description/', { timeout: 60000 });
      console.log('  ✅ Location generated');
    } catch (error) {
      console.log('  ❌ Location generation failed or timed out');
    }
  });

  test('5. Legend Generation', async () => {
    test.skip(!worldGenerated, 'World not generated yet');
    console.log('\n📝 Testing: Legend Generation');

    const legendButton = page.locator('button:has-text("Generate Legend")');
    if (await legendButton.count() === 0) {
      console.log('  ❌ "Generate Legend" button not found');
      return;
    }

    await legendButton.click();
    console.log('  ⏳ Generating legend...');

    try {
      await page.waitForSelector('text=/Timeframe:|Cultural Significance/', { timeout: 60000 });
      console.log('  ✅ Legend generated');
    } catch (error) {
      console.log('  ❌ Legend generation failed or timed out');
    }
  });

  test('6. Historical Event Generation', async () => {
    test.skip(!worldGenerated, 'World not generated yet');
    console.log('\n📝 Testing: Historical Event Generation');

    const eventButton = page.locator('button:has-text("Generate Historical Event")');
    if (await eventButton.count() === 0) {
      console.log('  ❌ "Generate Historical Event" button not found');
      return;
    }

    await eventButton.click();
    console.log('  ⏳ Generating historical event...');

    try {
      await page.waitForSelector('text=/Timeframe:|Key Figures:|Consequences/', { timeout: 60000 });
      console.log('  ✅ Historical event generated');
    } catch (error) {
      console.log('  ❌ Historical event generation failed or timed out');
    }
  });

  test('7. Freeform Questions', async () => {
    test.skip(!worldGenerated, 'World not generated yet');
    console.log('\n📝 Testing: Freeform Questions');

    // Navigate to Questions tab if exists
    const questionsTab = page.locator('button:has-text("Ask Questions")');
    if (await questionsTab.count() > 0) {
      await questionsTab.click();
    }

    // Find question input
    const questionInput = page.locator('input[placeholder*="What would you like"]');
    if (await questionInput.count() === 0) {
      console.log('  ❌ Question input field not found');
      return;
    }

    await questionInput.fill('What do people eat in this world?');
    await page.click('button:has-text("Ask Question")');
    console.log('  ⏳ Asking question...');

    try {
      await page.waitForFunction(() => {
        const body = document.body.textContent;
        return body.includes('What do people eat') && body.length > 2000;
      }, { timeout: 60000 });
      console.log('  ✅ Question answered');
    } catch (error) {
      console.log('  ❌ Question feature failed or timed out');
    }
  });

  test('8. Export Functionality', async () => {
    test.skip(!worldGenerated, 'World not generated yet');
    console.log('\n📝 Testing: Export Functionality');

    // Test JSON export
    const jsonButton = page.locator('button:has-text("Export JSON")');
    if (await jsonButton.count() === 0) {
      console.log('  ❌ "Export JSON" button not found');
    } else {
      console.log('  ✅ Export JSON button present');
    }

    // Test Markdown export
    const mdButton = page.locator('button:has-text("Export Markdown")');
    if (await mdButton.count() === 0) {
      console.log('  ❌ "Export Markdown" button not found');
    } else {
      console.log('  ✅ Export Markdown button present');
    }

    // Note: Can't easily test actual download without browser download handling
    console.log('  ⚠️  Actual export download not tested (requires manual verification)');
  });
});
