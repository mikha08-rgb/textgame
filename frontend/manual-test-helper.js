import { chromium } from '@playwright/test';

async function watchValidation() {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });
  const page = await browser.newPage();

  console.log('🔍 API Key Validation Monitor');
  console.log('=' .repeat(60));

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[OpenAI]') || text.includes('[Settings]') || text.includes('validation')) {
      const time = new Date().toLocaleTimeString();
      console.log(`[${time}] ${text}`);
    }
    if (msg.type() === 'error' && !text.includes('DevTools')) {
      console.log(`❌ ERROR: ${text}`);
    }
  });

  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  console.log('\n✋ Browser is now open at http://localhost:5173');
  console.log('📝 Enter your API key and click Continue');
  console.log('👀 I will monitor the console and report results...\n');
  console.log('⏰ You have 60 seconds\n');

  // Wait 60 seconds
  for (let i = 60; i > 0; i -= 10) {
    await page.waitForTimeout(10000);

    // Check status every 10 seconds
    const url = page.url();
    const hasError = await page.locator('.text-red-600, .text-red-700').count() > 0;

    if (url !== 'http://localhost:5173/') {
      console.log(`\n✅ SUCCESS! Moved to: ${url}`);
      break;
    } else if (hasError) {
      const errorText = await page.locator('.text-red-600, .text-red-700').first().textContent();
      console.log(`\n❌ Error shown: ${errorText}`);
    }

    if (i > 10) {
      console.log(`⏳ ${i} seconds remaining...`);
    }
  }

  console.log('\n📸 Taking final screenshot...');
  await page.screenshot({ path: 'validation-result.png', fullPage: true });
  console.log('Screenshot saved to: validation-result.png');

  await page.waitForTimeout(5000);
  await browser.close();
  console.log('\n✅ Test complete');
}

watchValidation();
