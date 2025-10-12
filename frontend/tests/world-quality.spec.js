import { test, expect } from '@playwright/test';

/**
 * World Quality Test
 *
 * Tests single world generation for quality metrics:
 * - Content richness
 * - Section completeness
 * - Culture diversity
 * - Generated content quality
 */

test.describe('World Generation Quality', () => {
  let apiKey;

  test.beforeAll(async () => {
    apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('\n⚠️  No OPENAI_API_KEY found. Set it with: export OPENAI_API_KEY=sk-...\n');
    }
  });

  test('generates high-quality world with rich content', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    if (!apiKey) {
      test.skip('Skipping: No API key provided');
      return;
    }

    console.log('\n' + '═'.repeat(80));
    console.log('⭐ TESTING WORLD GENERATION QUALITY');
    console.log('═'.repeat(80) + '\n');

    // Navigate to app
    await page.goto('/');

    // Enter API key
    console.log('🔑 Step 1: Entering API key...');
    await page.waitForSelector('input[type="password"]', { timeout: 10000 });
    await page.fill('input[type="password"]', apiKey);
    await page.click('button:has-text("Continue")');
    console.log('   ✓ API key entered\n');

    // Select Fantasy theme
    console.log('🎨 Step 2: Selecting Fantasy theme...');
    await page.waitForSelector('text=Choose Your Adventure', { timeout: 10000 });
    await page.click('button:has-text("Fantasy")');
    await page.click('button:has-text("Start Adventure")');
    console.log('   ✓ Theme selected\n');

    // Wait for world generation
    console.log('🌍 Step 3: Waiting for world generation...');
    await page.waitForSelector('text=/Conjuring|Forging|Crafting/', { timeout: 10000 });
    console.log('   Loading indicator visible...');

    // Wait for world to load
    await page.waitForSelector('h1', { timeout: 200000 });

    // Get world name
    const worldName = await page.locator('h1').first().textContent();
    console.log(`   ✓ World generated: "${worldName}"\n`);

    // ============================================================
    // QUALITY CHECKS
    // ============================================================
    console.log('📊 Step 4: Analyzing world quality...\n');

    const qualityMetrics = {
      worldName: false,
      tagline: false,
      coreTheme: false,
      geography: false,
      history: false,
      magicSystem: false,
      cultures: false,
      conflicts: false,
      economy: false,
      dailyLife: false,
      uniqueFeature: false,
      secrets: false,
      wordCount: 0,
      cultureCount: 0
    };

    // Check world name
    expect(worldName).toBeTruthy();
    expect(worldName.length).toBeGreaterThan(0);
    qualityMetrics.worldName = true;
    console.log(`✓ World Name: "${worldName}"`);

    // Check for tagline
    const taglines = await page.locator('p').allTextContents();
    const potentialTagline = taglines.find(t => t.length > 20 && t.length < 200);
    if (potentialTagline) {
      qualityMetrics.tagline = true;
      console.log(`✓ Tagline: "${potentialTagline.substring(0, 60)}..."`);
    }

    // Check for required sections
    const requiredSections = {
      'Core Theme': 'coreTheme',
      'Geography': 'geography',
      'History': 'history',
      'Magic System': 'magicSystem',
      'Cultures': 'cultures',
      'Conflicts': 'conflicts',
      'Economy': 'economy',
      'Daily Life': 'dailyLife',
      'Unique Feature': 'uniqueFeature',
      'Hidden Secrets': 'secrets'
    };

    console.log('\n📋 Section Analysis:');
    for (const [sectionName, key] of Object.entries(requiredSections)) {
      const count = await page.locator(`text=${sectionName}`).count();
      if (count > 0) {
        qualityMetrics[key] = true;
        console.log(`   ✓ ${sectionName}`);
      } else {
        console.log(`   ✗ ${sectionName} (missing)`);
      }
    }

    // Calculate section completeness
    const sectionsPresent = Object.keys(requiredSections).filter(
      s => qualityMetrics[requiredSections[s]]
    ).length;
    const sectionCompleteness = sectionsPresent / Object.keys(requiredSections).length;

    console.log(`\n   Section completeness: ${sectionsPresent}/10 (${(sectionCompleteness * 100).toFixed(0)}%)`);
    expect(sectionCompleteness).toBeGreaterThan(0.7); // At least 70% sections present

    // Get total word count
    const bodyText = await page.locator('body').textContent();
    const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
    qualityMetrics.wordCount = wordCount;

    console.log(`\n📝 Content Analysis:`);
    console.log(`   Total word count: ${wordCount}`);
    expect(wordCount).toBeGreaterThan(500); // At least 500 words
    console.log(`   ✓ Sufficient content (> 500 words)`);

    // Count cultures
    const allText = await page.locator('body').textContent();
    // Look for culture-related content
    const cultureMatches = allText.match(/culture|society|people|tribe|nation|kingdom|clan/gi) || [];
    qualityMetrics.cultureCount = Math.min(cultureMatches.length, 10); // Cap at reasonable number

    console.log(`   Cultural references: ${qualityMetrics.cultureCount}`);
    expect(qualityMetrics.cultureCount).toBeGreaterThan(0);
    console.log(`   ✓ Cultures present`);

    // Check for export functionality
    console.log(`\n🔧 Feature Analysis:`);
    const exportJSON = await page.locator('button:has-text("Export JSON")').count();
    const exportMD = await page.locator('button:has-text("Export Markdown")').count();

    if (exportJSON > 0) console.log(`   ✓ Export JSON available`);
    if (exportMD > 0) console.log(`   ✓ Export Markdown available`);

    // Check for generation buttons
    const genCharacter = await page.locator('button:has-text("Generate Character")').count();
    const genLocation = await page.locator('button:has-text("Generate Location")').count();
    const genLegend = await page.locator('button:has-text("Generate Legend")').count();
    const genHistory = await page.locator('button:has-text("Generate Historical Event")').count();

    if (genCharacter > 0) console.log(`   ✓ Character generation available`);
    if (genLocation > 0) console.log(`   ✓ Location generation available`);
    if (genLegend > 0) console.log(`   ✓ Legend generation available`);
    if (genHistory > 0) console.log(`   ✓ Historical event generation available`);

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('\n\n' + '═'.repeat(80));
    console.log('📊 QUALITY SUMMARY');
    console.log('═'.repeat(80) + '\n');

    console.log(`World: "${worldName}"`);
    console.log(`\nQuality Metrics:`);
    console.log(`   ✓ Section Completeness: ${(sectionCompleteness * 100).toFixed(0)}%`);
    console.log(`   ✓ Word Count: ${wordCount}`);
    console.log(`   ✓ Has World Name: ${qualityMetrics.worldName ? 'Yes' : 'No'}`);
    console.log(`   ✓ Has Cultures: ${qualityMetrics.cultureCount > 0 ? 'Yes' : 'No'}`);

    console.log('\n' + '═'.repeat(80));
    console.log('🎉 QUALITY TEST PASSED - World meets all quality standards!');
    console.log('═'.repeat(80) + '\n');
  });

  test('generated content has good variance between runs', async ({ page, context }) => {
    test.setTimeout(600000); // 10 minutes for 2 worlds

    if (!apiKey) {
      test.skip('Skipping: No API key provided');
      return;
    }

    console.log('\n' + '═'.repeat(80));
    console.log('🎲 TESTING WORLD VARIANCE (2 WORLDS)');
    console.log('═'.repeat(80) + '\n');

    const worlds = [];

    for (let i = 0; i < 2; i++) {
      console.log(`\n📖 Generating World ${i + 1}/2...\n`);

      // Create fresh page for each world
      const testPage = await context.newPage();
      await testPage.goto('/');

      // Enter API key
      await testPage.fill('input[type="password"]', apiKey);
      await testPage.click('button:has-text("Continue")');

      // Select Fantasy theme
      await testPage.waitForSelector('text=Choose Your Adventure');
      await testPage.click('button:has-text("Fantasy")');
      await testPage.click('button:has-text("Start Adventure")');

      // Wait for world
      await testPage.waitForSelector('h1', { timeout: 200000 });

      const worldName = await testPage.locator('h1').textContent();
      const bodyText = await testPage.locator('body').textContent();

      worlds.push({
        name: worldName.trim(),
        text: bodyText,
        words: new Set(bodyText.toLowerCase().split(/\s+/).filter(w => w.length > 4))
      });

      console.log(`✓ World ${i + 1}: "${worlds[i].name}"`);
      console.log(`   Word count: ${worlds[i].text.split(/\s+/).length}`);

      await testPage.close();
    }

    // Variance analysis
    console.log('\n' + '─'.repeat(80));
    console.log('📊 Variance Analysis:\n');

    console.log(`World 1: "${worlds[0].name}"`);
    console.log(`World 2: "${worlds[1].name}"`);

    // Check if names are different
    const namesAreDifferent = worlds[0].name !== worlds[1].name;
    console.log(`\nNames are different: ${namesAreDifferent ? '✓ Yes' : '✗ No'}`);
    expect(namesAreDifferent).toBe(true);

    // Calculate content similarity
    const intersection = new Set([...worlds[0].words].filter(x => worlds[1].words.has(x)));
    const union = new Set([...worlds[0].words, ...worlds[1].words]);
    const similarity = intersection.size / union.size;

    console.log(`Content similarity: ${(similarity * 100).toFixed(1)}%`);
    console.log(`\nVariance check: ${similarity < 0.7 ? '✓ PASS' : '✗ FAIL'} (< 70% similar)`);
    expect(similarity).toBeLessThan(0.7);

    console.log('\n' + '═'.repeat(80));
    console.log('🎉 VARIANCE TEST PASSED - Worlds are sufficiently different!');
    console.log('═'.repeat(80) + '\n');
  });
});
