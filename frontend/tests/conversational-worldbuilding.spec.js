import { test, expect } from '@playwright/test';

/**
 * End-to-End Test: Conversational Worldbuilding Studio
 *
 * This test verifies the new chat-first worldbuilding flow:
 * 1. User enters API key
 * 2. User describes a world in chat
 * 3. AI generates complete world
 * 4. User iterates and adds content
 * 5. World updates live in preview panel
 */

test.describe('Conversational Worldbuilding Studio', () => {
  test.beforeEach(async ({ page }) => {
    // Start from home page
    await page.goto('http://localhost:5173/');

    // Clear any existing API key from localStorage
    await page.evaluate(() => localStorage.clear());
  });

  test('should complete full worldbuilding flow', async ({ page }) => {
    // Step 1: Enter API key
    await test.step('Enter API key', async () => {
      await page.waitForSelector('#api-key', { timeout: 5000 });

      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OPENAI_API_KEY environment variable is required for this test');
      }

      await page.fill('#api-key', apiKey);

      // Wait for Continue button to be enabled (format validation)
      await page.waitForSelector('button:has-text("Continue"):not([disabled])', { timeout: 5000 });
      await page.click('button:has-text("Continue")');

      // Wait for API validation to complete and chat interface to appear
      // This may take a few seconds as it tests the API key with OpenAI
      await page.waitForSelector('.studio-layout', { timeout: 30000 });
    });

    // Step 2: Verify initial state
    await test.step('Verify chat interface loaded', async () => {
      // Check for chat header
      const header = await page.textContent('h1');
      expect(header).toContain('Worldbuilding Studio');

      // Check for starter prompts
      const starterPrompts = await page.$$('.starter-prompt-btn');
      expect(starterPrompts.length).toBeGreaterThan(0);

      // Check for empty preview
      const emptyPreview = await page.textContent('.empty-preview');
      expect(emptyPreview).toContain('Your World Will Appear Here');
    });

    // Step 3: Create a world
    await test.step('Create world from chat message', async () => {
      // Type world request
      const inputField = await page.waitForSelector('input[placeholder*="Describe the world"]', { timeout: 5000 });
      await inputField.fill('I want a fantasy world with floating islands');

      // Send message
      await page.click('button:has-text("Send")');

      // Wait for AI to start generating
      await page.waitForSelector('.assistant-message', { timeout: 3000 });

      // Wait for world generation to complete (up to 60 seconds)
      await page.waitForFunction(
        () => {
          const messages = document.querySelectorAll('.assistant-message');
          return messages.length >= 2; // Initial "creating" message + actual world
        },
        { timeout: 60000 }
      );
    });

    // Step 4: Verify world was created
    await test.step('Verify world appears in preview', async () => {
      // Check that preview panel now shows world name
      await page.waitForSelector('.world-content h2', { timeout: 5000 });
      const worldName = await page.textContent('.world-content h2');
      expect(worldName).toBeTruthy();
      expect(worldName.length).toBeGreaterThan(0);

      // Check that world description exists
      const worldDescription = await page.textContent('.world-description');
      expect(worldDescription).toBeTruthy();
      expect(worldDescription.length).toBeGreaterThan(50); // Should be substantial

      // Verify description contains key worldbuilding elements
      const descLowerCase = worldDescription.toLowerCase();
      expect(
        descLowerCase.includes('island') ||
        descLowerCase.includes('float') ||
        descLowerCase.includes('culture') ||
        descLowerCase.includes('magic')
      ).toBeTruthy();
    });

    // Step 5: Test iteration - add more content
    await test.step('Iterate on world by adding content', async () => {
      // Type refinement request
      const inputField = await page.waitForSelector('input[placeholder*="Refine your world"]', { timeout: 5000 });
      await inputField.fill('Create a character');

      // Send message
      await page.click('button:has-text("Send")');

      // Wait for AI response
      await page.waitForFunction(
        () => {
          const messages = document.querySelectorAll('.assistant-message');
          // Should have: initial world + follow-up suggestions + character response
          return messages.length >= 3;
        },
        { timeout: 60000 }
      );

      // Verify new content was added to chat
      const lastMessage = await page.locator('.assistant-message').last().textContent();
      expect(lastMessage.length).toBeGreaterThan(20);
    });

    // Step 6: Test export functionality
    await test.step('Export world', async () => {
      // Click export button
      const exportButton = await page.waitForSelector('button:has-text("Export World")', { timeout: 5000 });

      // Set up download listener
      const downloadPromise = page.waitForEvent('download');
      await exportButton.click();
      const download = await downloadPromise;

      // Verify download
      expect(download.suggestedFilename()).toMatch(/\.md$/); // Should be markdown file
    });
  });

  test('should handle invalid API key error', async ({ page }) => {
    // Enter invalid API key
    await page.waitForSelector('#api-key', { timeout: 5000 });
    await page.fill('#api-key', 'sk-invalid123');
    await page.click('button:has-text("Continue")');

    // Wait for error message from API key validation
    await page.waitForSelector('text=Invalid API key', { timeout: 10000 });
    const errorText = await page.textContent('.text-red-600');
    expect(errorText).toContain('Invalid');
  });

  test('should use starter prompts', async ({ page }) => {
    // Enter API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      test.skip();
      return;
    }

    await page.waitForSelector('#api-key', { timeout: 5000 });
    await page.fill('#api-key', apiKey);
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('.studio-layout', { timeout: 10000 });

    // Click a starter prompt
    const firstPrompt = await page.locator('.starter-prompt-btn').first();
    const promptText = await firstPrompt.textContent();
    await firstPrompt.click();

    // Verify prompt was filled into input
    const inputValue = await page.inputValue('input[placeholder*="Describe the world"]');
    expect(inputValue).toBe(promptText);
  });

  test('should maintain chat history', async ({ page }) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      test.skip();
      return;
    }

    // Setup
    await page.waitForSelector('#api-key', { timeout: 5000 });
    await page.fill('#api-key', apiKey);
    await page.click('button:has-text("Continue")');
    await page.waitForSelector('.studio-layout', { timeout: 10000 });

    // Send first message
    await page.fill('input[placeholder*="Describe the world"]', 'Message 1');
    await page.click('button:has-text("Send")');

    // Wait for response
    await page.waitForSelector('.user-message', { timeout: 5000 });

    // Send second message
    await page.fill('input[placeholder*="Describe the world"]', 'Message 2');
    await page.click('button:has-text("Send")');

    // Verify both messages are in chat
    const userMessages = await page.$$('.user-message');
    expect(userMessages.length).toBeGreaterThanOrEqual(2);
  });
});
