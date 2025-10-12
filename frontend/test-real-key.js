import { chromium } from '@playwright/test';

async function testRealKey() {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();

  const allLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    allLogs.push({ type: msg.type(), text });
    console.log(`[${msg.type().toUpperCase()}] ${text}`);
  });

  page.on('pageerror', err => {
    console.error('❌ PAGE ERROR:', err.message);
    allLogs.push({ type: 'pageerror', text: err.message });
  });

  // Capture network requests
  page.on('request', request => {
    if (request.url().includes('openai.com')) {
      console.log('🌐 REQUEST:', request.method(), request.url());
    }
  });

  page.on('response', response => {
    if (response.url().includes('openai.com')) {
      console.log('📥 RESPONSE:', response.status(), response.url());
    }
  });

  try {
    console.log('🔍 Testing with Real API Key\n');

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    console.log('📝 Please enter your API key in the browser window...');
    console.log('⏳ Waiting 30 seconds for you to enter key and click Continue...\n');

    // Wait for user to enter key and click
    await page.waitForTimeout(30000);

    // Check what happened
    const url = page.url();
    console.log('\n📍 Current URL:', url);

    // Check for error messages
    const errorMsg = await page.locator('.text-red-600, .text-red-700, .text-red-500').first().textContent().catch(() => null);
    if (errorMsg) {
      console.log('❌ Error shown:', errorMsg);
    }

    // Check console for specific errors
    console.log('\n📊 Console Log Analysis:');
    const openAILogs = allLogs.filter(l => l.text.includes('[OpenAI]') || l.text.includes('API'));
    console.log(`Found ${openAILogs.length} OpenAI-related logs:\n`);
    openAILogs.forEach(log => {
      console.log(`  [${log.type}] ${log.text}`);
    });

    const errorLogs = allLogs.filter(l => l.type === 'error');
    if (errorLogs.length > 0) {
      console.log(`\n❌ Found ${errorLogs.length} error logs:\n`);
      errorLogs.forEach(log => {
        console.log(`  ${log.text}`);
      });
    }

    console.log('\n⏸️  Browser will stay open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await browser.close();
  }
}

testRealKey();
