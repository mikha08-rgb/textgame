import { test, expect } from '@playwright/test';

test.describe('Simple World Generation Debug', () => {
  test('should generate world and capture logs', async ({ page }) => {
    // Listen to console logs
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      console.log(`[Browser Console] ${text}`);
    });

    // Navigate to app
    await page.goto('http://localhost:5173');

    // Enter API key
    const apiKeyInput = page.locator('input[type="password"]');
    await apiKeyInput.fill(process.env.OPENAI_API_KEY);
    await page.click('button:has-text("Continue")');

    // Wait for main interface
    await page.waitForSelector('textarea', { timeout: 5000 });

    // Enter a simple world concept
    await page.fill('textarea', 'A volcanic archipelago where merchants trade obsidian');

    // Click generate
    await page.click('button:has-text("Generate World")');

    // Wait for generation to complete or error (3 minutes max)
    await page.waitForSelector('div:has-text("Failed"):visible, h1.text-3xl:visible', {
      timeout: 180000
    });

    // Check if error occurred
    const errorVisible = await page.locator('div.bg-red-500\\/20').isVisible().catch(() => false);

    if (errorVisible) {
      console.log('\n❌ ERROR OCCURRED');
      const errorText = await page.locator('div.bg-red-500\\/20 p').first().textContent();
      console.log('Error message:', errorText);

      // Look for WorldGen logs
      const worldGenLogs = logs.filter(log => log.includes('[WorldGen]'));
      console.log('\n📋 WorldGen Logs:');
      worldGenLogs.forEach(log => console.log(log));

      // Try to find the response in logs
      const responseLog = logs.find(log => log.includes('[WorldGen] Full response:'));
      if (responseLog) {
        console.log('\n📄 Full AI Response:');
        console.log(responseLog);
      }

      // Fail the test with useful info
      throw new Error(`Generation failed: ${errorText}\n\nCheck logs above for AI response.`);
    } else {
      console.log('\n✅ SUCCESS - World generated');

      // Check what's visible
      const worldName = await page.locator('h1.text-3xl').textContent();
      console.log('World Name:', worldName);

      // Count sections
      const sections = await page.locator('h2').count();
      console.log('Sections visible:', sections);

      // Take screenshot
      await page.screenshot({ path: 'test-results/successful-generation.png', fullPage: true });
    }

    // Print all WorldGen logs regardless
    console.log('\n📊 All Console Logs:');
    logs.forEach(log => {
      if (log.includes('[WorldGen]') || log.includes('[Parser]')) {
        console.log(log);
      }
    });
  });

  test('should show what the AI actually returns', async ({ page }) => {
    // Intercept the OpenAI API call
    let apiResponse = null;

    page.on('response', async (response) => {
      if (response.url().includes('api.openai.com/v1/chat/completions')) {
        try {
          const json = await response.json();
          apiResponse = json.choices[0].message.content;

          console.log('\n🤖 RAW AI RESPONSE:');
          console.log('Length:', apiResponse.length);
          console.log('First 1000 chars:', apiResponse.substring(0, 1000));
          console.log('Last 1000 chars:', apiResponse.substring(Math.max(0, apiResponse.length - 1000)));

          // Try to detect if it's valid JSON
          try {
            const parsed = JSON.parse(apiResponse);
            console.log('\n✅ Valid JSON');
            console.log('Top-level keys:', Object.keys(parsed));
          } catch (e) {
            console.log('\n❌ INVALID JSON:', e.message);

            // Check for common issues
            if (apiResponse.includes('<reasoning>')) {
              console.log('⚠️  Contains <reasoning> tags');
            }
            if (apiResponse.includes('```json')) {
              console.log('⚠️  Contains markdown code fences');
            }
            if (!apiResponse.includes('worldName')) {
              console.log('⚠️  Missing "worldName" field');
            }
          }
        } catch (e) {
          console.error('Failed to parse API response:', e);
        }
      }
    });

    // Navigate to app
    await page.goto('http://localhost:5173');

    // Enter API key
    const apiKeyInput = page.locator('input[type="password"]');
    await apiKeyInput.fill(process.env.OPENAI_API_KEY);
    await page.click('button:has-text("Continue")');

    // Wait for main interface
    await page.waitForSelector('textarea', { timeout: 5000 });

    // Enter a simple world concept
    await page.fill('textarea', 'A desert where water is solid crystal');

    // Click generate
    await page.click('button:has-text("Generate World")');

    // Wait for completion
    await page.waitForTimeout(90000); // Wait 90 seconds for generation

    // The response should have been captured by now
    if (apiResponse) {
      console.log('\n✅ Captured AI response successfully');
    } else {
      console.log('\n❌ Failed to capture AI response');
    }
  });
});
