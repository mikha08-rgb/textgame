import { chromium } from '@playwright/test';

async function testValidationFlow() {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();

  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(text);
    if (msg.type() === 'log' && (text.includes('[Settings]') || text.includes('[OpenAI]') || text.includes('validation'))) {
      console.log(`[CONSOLE] ${text}`);
    }
    if (msg.type() === 'error') {
      console.log(`[ERROR] ${text}`);
    }
  });

  try {
    console.log('🔍 Testing API Key Validation Flow\n');

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // Go to Settings
    console.log('1. Opening Settings...');
    await page.locator('button[aria-label="Settings"]').click();
    await page.waitForTimeout(500);
    console.log('   ✓ Settings opened\n');

    // Click Change API Key
    console.log('2. Clicking Change API Key...');
    await page.locator('button:has-text("Change API Key")').click();
    await page.waitForTimeout(300);
    console.log('   ✓ Form displayed\n');

    // Enter a fake but valid-format key
    console.log('3. Entering fake API key...');
    const fakeKey = 'sk-' + 'test1234567890'.repeat(3); // Valid format
    await page.locator('input[placeholder="sk-..."]').fill(fakeKey);
    console.log(`   ✓ Key entered: ${fakeKey.substring(0, 10)}...\n`);

    // Click Update
    console.log('4. Clicking Update Key...');
    const updateButton = page.locator('button:has-text("Update Key")');
    await updateButton.click();

    // Wait a bit and check button state
    await page.waitForTimeout(500);
    const buttonText = await updateButton.textContent();
    console.log(`   Button shows: "${buttonText.trim()}"\n`);

    // Wait for validation (max 15 seconds)
    console.log('5. Waiting for validation (max 15s)...');
    let timeWaited = 0;
    const maxWait = 15000;
    const checkInterval = 500;

    while (timeWaited < maxWait) {
      await page.waitForTimeout(checkInterval);
      timeWaited += checkInterval;

      // Check for error message
      const errorMsg = await page.locator('.text-red-700, .text-red-600, .bg-red-50').textContent().catch(() => null);
      if (errorMsg && errorMsg.trim().length > 0) {
        console.log(`   ✓ Error message appeared after ${timeWaited / 1000}s:`);
        console.log(`   "${errorMsg.trim()}"\n`);
        break;
      }

      // Check for success message
      const successMsg = await page.locator('.text-green-700, .text-green-600, .bg-green-50').textContent().catch(() => null);
      if (successMsg && successMsg.trim().length > 0) {
        console.log(`   ✓ Success message appeared after ${timeWaited / 1000}s:`);
        console.log(`   "${successMsg.trim()}"\n`);
        break;
      }

      // Check if button is back to normal (not showing "Validating...")
      const currentButtonText = await updateButton.textContent();
      if (currentButtonText.includes('Update Key')) {
        const stillDisabled = await updateButton.isDisabled();
        if (!stillDisabled) {
          console.log(`   Button returned to normal after ${timeWaited / 1000}s\n`);
          break;
        }
      }
    }

    if (timeWaited >= maxWait) {
      console.log('   ⚠️  Validation took longer than 15 seconds\n');
    }

    // Check final state
    console.log('6. Final state check:');
    const finalError = await page.locator('.text-red-700, .text-red-600').first().textContent().catch(() => 'None');
    const finalSuccess = await page.locator('.text-green-700, .text-green-600').first().textContent().catch(() => 'None');
    console.log(`   Error message: ${finalError}`);
    console.log(`   Success message: ${finalSuccess}\n`);

    // Check console logs related to validation
    console.log('7. Console logs analysis:');
    const validationLogs = consoleMessages.filter(m =>
      m.includes('validation') ||
      m.includes('Validating') ||
      m.includes('[OpenAI]') ||
      m.includes('[Settings]')
    );
    console.log(`   Found ${validationLogs.length} relevant logs\n`);

    console.log('\n✅ Test complete. Browser will stay open for 5 seconds...');
    await page.waitForTimeout(5000);

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
  } finally {
    await browser.close();
  }
}

testValidationFlow();
