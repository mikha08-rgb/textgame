import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Collect errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  try {
    console.log('Navigating to http://localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 10000 });

    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);

    // Take a screenshot
    await page.screenshot({ path: '/home/mishk/codingprojects/textgamea/site-screenshot.png', fullPage: true });
    console.log('Screenshot saved to site-screenshot.png');

    // Get the page title
    const title = await page.title();
    console.log('\n=== PAGE INFO ===');
    console.log('Title:', title);

    // Get visible text content
    const bodyText = await page.evaluate(() => {
      return document.body.innerText.substring(0, 500);
    });
    console.log('\nVisible text on page (first 500 chars):\n', bodyText);

    // Check for specific elements
    console.log('\n=== ELEMENT CHECK ===');
    const landingPageExists = await page.locator('text=AI Adventure Engine').count();
    console.log('Landing page title found:', landingPageExists > 0);

    const testHarnessExists = await page.locator('text=Prompt Testing Harness').count();
    console.log('Test Harness title found:', testHarnessExists > 0);

    // Check localStorage
    const localStorageKeys = await page.evaluate(() => {
      return Object.keys(localStorage);
    });
    console.log('\nLocalStorage keys:', localStorageKeys);

    // Print console messages
    console.log('\n=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => console.log(msg));

    // Print errors
    if (errors.length > 0) {
      console.log('\n=== PAGE ERRORS ===');
      errors.forEach(err => console.log(err));
    } else {
      console.log('\nNo JavaScript errors detected');
    }

  } catch (error) {
    console.error('Error during page inspection:', error.message);
  }

  await browser.close();
})();
