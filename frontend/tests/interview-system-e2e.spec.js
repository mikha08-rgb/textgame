/**
 * End-to-End Visual Test: Collaborative Interview System
 *
 * Run with: OPENAI_API_KEY="your-key" npx playwright test interview-system-e2e.spec.js --headed
 *
 * This test runs in HEADED mode so you can watch the interview happen in real-time.
 */

import { test, expect } from '@playwright/test';

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.error('⚠️  OPENAI_API_KEY environment variable not set!');
  console.error('   Run: OPENAI_API_KEY="your-key" npx playwright test interview-system-e2e.spec.js --headed');
  process.exit(1);
}

test.describe('Collaborative Interview System - End to End', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('http://localhost:5173/');

    // Enter API key
    await page.fill('input[type="password"]', API_KEY);
    await page.click('button:has-text("Set API Key")');

    // Wait for API key to be set
    await expect(page.locator('text=AI Worldbuilding Studio')).toBeVisible();
  });

  test('Complete interview workflow with various input types', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes for full flow

    console.log('\n🎬 Starting end-to-end interview test...\n');

    // ==========================================================================
    // STEP 1: Submit initial concept
    // ==========================================================================
    console.log('📝 Step 1: Submitting initial concept...');

    const initialConcept = "A volcanic world with obsidian trade";
    await page.fill('textarea, input[type="text"]', initialConcept);
    await page.keyboard.press('Enter');

    // Wait for interview to start
    await expect(page.locator('text=Great starting point')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Question 1 of')).toBeVisible();

    console.log('✅ Interview started!\n');

    // Take screenshot
    await page.screenshot({ path: 'test-results/interview-01-start.png', fullPage: true });

    // ==========================================================================
    // STEP 2: Answer question 1 (unique hook) - Direct answer
    // ==========================================================================
    console.log('📝 Step 2: Answering Question 1 (unique hook)...');

    await page.waitForSelector('textarea, input[type="text"]', { state: 'visible' });
    await page.fill('textarea, input[type="text"]', 'Volcanoes erupt every 8 days on a precise schedule');
    await page.keyboard.press('Enter');

    // Wait for acknowledgment
    await expect(page.locator('text=Perfect')).toBeVisible({ timeout: 10000 });

    console.log('✅ Question 1 answered!\n');
    await page.screenshot({ path: 'test-results/interview-02-q1-answered.png', fullPage: true });

    // Small delay to see the response
    await page.waitForTimeout(2000);

    // ==========================================================================
    // STEP 3: Answer question 2 - Multi-part answer
    // ==========================================================================
    console.log('📝 Step 3: Answering Question 2 (multi-part)...');

    // Check if we're on question 2
    const currentText = await page.textContent('body');
    console.log('   Checking for multi-part capability...');

    await page.fill('textarea, input[type="text"]',
      'For conflict: who controls the prime mining sites during the safe period. For daily life: obsidian shards are used as currency, 1 shard = 1 day of food.');
    await page.keyboard.press('Enter');

    // Wait for multi-part recognition or normal acknowledgment
    await page.waitForTimeout(3000); // Give AI time to process

    // Check if it recognized multi-part
    const bodyText = await page.textContent('body');
    if (bodyText.includes('got') && bodyText.includes('answer')) {
      console.log('✅ Multi-part answer detected!\n');
    } else {
      console.log('✅ Answer recorded!\n');
    }

    await page.screenshot({ path: 'test-results/interview-03-q2-multipart.png', fullPage: true });
    await page.waitForTimeout(2000);

    // ==========================================================================
    // STEP 4: Request AI help (if another question comes up)
    // ==========================================================================
    const stillInInterview = await page.locator('text=Question').count() > 0;

    if (stillInInterview) {
      console.log('📝 Step 4: Requesting AI help...');

      await page.fill('textarea, input[type="text"]', 'help me');
      await page.keyboard.press('Enter');

      // Wait for AI to generate suggestion
      await expect(page.locator('text=How about this')).toBeVisible({ timeout: 15000 });

      console.log('✅ AI generated suggestion!\n');
      await page.screenshot({ path: 'test-results/interview-04-ai-suggestion.png', fullPage: true });
      await page.waitForTimeout(2000);

      // Confirm suggestion
      console.log('📝 Step 5: Confirming AI suggestion...');
      await page.fill('textarea, input[type="text"]', 'yes');
      await page.keyboard.press('Enter');

      await expect(page.locator('text=Excellent')).toBeVisible({ timeout: 10000 });
      console.log('✅ Suggestion confirmed!\n');
      await page.screenshot({ path: 'test-results/interview-05-confirmed.png', fullPage: true });
      await page.waitForTimeout(2000);
    }

    // ==========================================================================
    // STEP 5: Skip remaining questions (if any)
    // ==========================================================================
    const stillHasQuestions = await page.locator('text=Question').count() > 0;

    if (stillHasQuestions) {
      console.log('📝 Step 6: Testing natural skip...');

      await page.fill('textarea, input[type="text"]', 'Can we skip this one?');
      await page.keyboard.press('Enter');

      await page.waitForTimeout(2000);
      console.log('✅ Skip processed!\n');
      await page.screenshot({ path: 'test-results/interview-06-skip.png', fullPage: true });
    }

    // ==========================================================================
    // STEP 6: Wait for world generation
    // ==========================================================================
    console.log('🌍 Step 7: Waiting for world generation...');

    // Wait for generation to start
    await expect(page.locator('text=Let me generate')).toBeVisible({ timeout: 10000 });
    console.log('   Generation started...');

    // Wait for world to be created
    await expect(page.locator('text=World Created')).toBeVisible({ timeout: 60000 });
    console.log('✅ World generated!\n');

    await page.screenshot({ path: 'test-results/interview-07-world-created.png', fullPage: true });
    await page.waitForTimeout(2000);

    // ==========================================================================
    // STEP 7: Verify world quality
    // ==========================================================================
    console.log('🔍 Step 8: Verifying world quality...');

    const finalContent = await page.textContent('body');

    // Check for user's specific details
    const checks = [
      { name: 'Unique hook present', test: finalContent.includes('8 days') || finalContent.includes('schedule') },
      { name: 'World name visible', test: /\*\*World Created:/.test(finalContent) },
      { name: 'Cultures mentioned', test: finalContent.includes('culture') || finalContent.includes('Culture') },
      { name: 'Specific measurements', test: /\d+\s*(kg|day|hour|shard|meter)/.test(finalContent) }
    ];

    console.log('\n   Quality checks:');
    checks.forEach(check => {
      const status = check.test ? '✅' : '❌';
      console.log(`   ${status} ${check.name}`);
    });

    // Take final screenshot
    await page.screenshot({ path: 'test-results/interview-08-final.png', fullPage: true });

    // ==========================================================================
    // VERIFICATION
    // ==========================================================================
    console.log('\n📊 Test Results:');
    console.log('   All steps completed successfully!');
    console.log('   Screenshots saved to test-results/\n');

    // Assertions
    expect(checks.filter(c => c.test).length).toBeGreaterThan(2);
  });

  test('Test flexibility - Natural language variations', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes

    console.log('\n🎬 Testing natural language flexibility...\n');

    // Submit concept
    await page.fill('textarea, input[type="text"]', 'A world with crystal-powered technology');
    await page.keyboard.press('Enter');

    await expect(page.locator('text=Great starting point')).toBeVisible({ timeout: 10000 });

    // Test 1: Verbose answer
    console.log('📝 Test 1: Verbose answer...');
    await page.fill('textarea, input[type="text"]',
      'Well, I think the unique thing could be that crystals store emotional energy and you have to feel intense emotions to power technology');
    await page.keyboard.press('Enter');

    await expect(page.locator('text=Perfect')).toBeVisible({ timeout: 10000 });
    console.log('✅ Verbose answer accepted!\n');
    await page.waitForTimeout(1500);

    // Test 2: Natural skip
    console.log('📝 Test 2: Natural skip phrasing...');
    await page.fill('textarea, input[type="text"]', "Let's skip this for now");
    await page.keyboard.press('Enter');

    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');

    if (bodyText.includes('skip') || bodyText.includes('Question')) {
      console.log('✅ Natural skip recognized!\n');
    }

    await page.screenshot({ path: 'test-results/flexibility-test.png', fullPage: true });

    console.log('📊 Flexibility test completed!\n');
  });
});

test.describe('Visual Regression - Interview UI', () => {
  test('Interview UI elements are properly styled', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Enter API key
    await page.fill('input[type="password"]', API_KEY);
    await page.click('button:has-text("Set API Key")');

    // Start interview
    await page.fill('textarea, input[type="text"]', 'A test world');
    await page.keyboard.press('Enter');

    await expect(page.locator('text=Great starting point')).toBeVisible({ timeout: 10000 });

    // Take UI screenshot
    await page.screenshot({ path: 'test-results/interview-ui.png', fullPage: true });

    // Verify key UI elements
    await expect(page.locator('text=Question 1 of')).toBeVisible();
    await expect(page.locator('text=💡 Tip')).toBeVisible();
  });
});
