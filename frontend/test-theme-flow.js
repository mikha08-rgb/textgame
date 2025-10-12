import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Step 1: Navigate to landing page...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 10000 });

    // Clear any existing localStorage
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    console.log('✓ Landing page loaded');
    await page.screenshot({ path: '/home/mishk/codingprojects/textgamea/step1-landing.png' });

    console.log('\nStep 2: Set API key in localStorage (simulating validation)...');
    // Simulate having a validated API key by setting it in localStorage
    await page.evaluate(() => {
      const testKey = 'sk-test1234567890123456789012345678901234567890';
      const encoded = btoa(testKey);
      localStorage.setItem('ai_adventure_api_key', 'aae_v1_' + encoded);
    });

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    console.log('✓ Reloaded with API key');
    await page.screenshot({ path: '/home/mishk/codingprojects/textgamea/step2-theme-selection.png' });

    // Check what's on the page
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('\nVisible text:\n', bodyText.substring(0, 300));

    // Check for theme selection elements
    const hasThemeSelection = await page.locator('text=Choose Your Adventure').count();
    const hasFantasyTheme = await page.locator('text=Fantasy').count();

    console.log('\n=== THEME SELECTION CHECK ===');
    console.log('Theme selection page found:', hasThemeSelection > 0);
    console.log('Fantasy theme found:', hasFantasyTheme > 0);

    if (hasFantasyTheme > 0) {
      console.log('\nStep 3: Click Fantasy theme...');
      await page.click('text=Fantasy');
      await page.waitForTimeout(1000);

      console.log('✓ Fantasy theme selected');
      await page.screenshot({ path: '/home/mishk/codingprojects/textgamea/step3-theme-selected.png' });

      console.log('\nStep 4: Click Start Adventure button...');
      const startButton = page.locator('text=Start Adventure');
      await startButton.click();
      await page.waitForTimeout(2000);

      console.log('✓ Clicked Start Adventure');
      await page.screenshot({ path: '/home/mishk/codingprojects/textgamea/step4-game-started.png' });

      // Check final page
      const finalText = await page.evaluate(() => document.body.innerText.substring(0, 300));
      console.log('\nFinal page text:\n', finalText);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
})();
