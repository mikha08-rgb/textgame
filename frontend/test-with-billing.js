import { chromium } from '@playwright/test';

async function testWithBilling() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  const allLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    allLogs.push({ type, text });

    // Log relevant messages
    if (type === 'log' && (text.includes('[OpenAI]') || text.includes('[Settings]') || text.includes('validation'))) {
      console.log(`✓ ${text}`);
    } else if (type === 'error') {
      console.log(`❌ ${text}`);
    }
  });

  try {
    console.log('🔍 Testing API Key Validation with Billing Setup\n');
    console.log('Instructions: Enter your API key when prompted\n');

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Fill in the API key
    const input = page.locator('input[type="password"]').first();
    await input.click();

    console.log('📝 Waiting for you to enter your API key...');
    console.log('⏳ You have 15 seconds to paste your key and click Continue\n');

    // Wait for user to enter key
    await page.waitForTimeout(15000);

    // Check if we're still on landing page or moved forward
    const currentUrl = page.url();
    console.log('\n📍 Current URL:', currentUrl);

    // Check for any error messages
    const errorMsg = await page.locator('.text-red-600, .text-red-700').first().textContent().catch(() => null);
    const successIndicator = !currentUrl.includes('localhost:5173/') || currentUrl !== 'http://localhost:5173/';

    if (errorMsg) {
      console.log('\n❌ Error Message:', errorMsg);
    } else if (successIndicator) {
      console.log('\n✅ Validation appears successful - moved to next screen!');
    } else {
      console.log('\n⚠️  Still on landing page - check what happened');
    }

    // Check console logs
    console.log('\n📊 Console Analysis:');

    const openAILogs = allLogs.filter(l =>
      l.text.includes('[OpenAI]') ||
      l.text.includes('API call') ||
      l.text.includes('validation')
    );

    if (openAILogs.length > 0) {
      console.log('\nAPI Call Logs:');
      openAILogs.forEach(log => {
        const icon = log.type === 'error' ? '❌' : '✓';
        console.log(`  ${icon} ${log.text}`);
      });
    }

    const quotaErrors = allLogs.filter(l =>
      l.text.includes('quota') ||
      l.text.includes('billing') ||
      l.text.includes('429')
    );

    if (quotaErrors.length > 0) {
      console.log('\n⚠️  Still seeing quota/billing errors:');
      quotaErrors.forEach(log => console.log(`  - ${log.text}`));
    }

    const success = allLogs.filter(l =>
      l.text.includes('success') ||
      l.text.includes('validated')
    );

    if (success.length > 0) {
      console.log('\n✅ Success indicators:');
      success.forEach(log => console.log(`  - ${log.text}`));
    }

    console.log('\n⏸️  Browser will stay open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await browser.close();
    console.log('\n✅ Test complete');
  }
}

testWithBilling();
