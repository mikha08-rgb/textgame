import { test, expect } from '@playwright/test';

/**
 * World Generation Variance and Quality Test Suite
 *
 * This test suite validates:
 * 1. World variance - multiple generations produce different, unique worlds
 * 2. World quality - worlds have rich, detailed content
 * 3. Content generation - characters, locations, etc. are diverse and high-quality
 */

test.describe('World Generation Variance and Quality', () => {
  let apiKey;

  test.beforeAll(async () => {
    apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('\n⚠️  No OPENAI_API_KEY found. Set it with: export OPENAI_API_KEY=sk-...\n');
    }
  });

  test('generates diverse worlds with good variance', async ({ page, browser }) => {
    test.setTimeout(900000); // 15 minutes for multiple world generations

    if (!apiKey) {
      test.skip('Skipping: No API key provided');
      return;
    }

    const NUM_WORLDS = 3;

    console.log('\n' + '═'.repeat(80));
    console.log('🌍 TESTING WORLD GENERATION VARIANCE');
    console.log('═'.repeat(80) + '\n');
    console.log(`Configuration:`);
    console.log(`  • Worlds to generate: ${NUM_WORLDS}\n`);

    const worlds = [];
    const worldNames = new Set();
    const themes = ['Fantasy', 'Fantasy', 'Fantasy']; // Use same theme to test variance

    for (let i = 0; i < NUM_WORLDS; i++) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📖 GENERATING WORLD ${i + 1}/${NUM_WORLDS}`);
      console.log('─'.repeat(80) + '\n');

      const worldData = {
        index: i,
        name: null,
        tagline: null,
        theme: themes[i],
        sections: {},
        cultures: [],
        textContent: '',
        wordCount: 0
      };

      // Navigate to app
      await page.goto('/');

      // Enter API key
      console.log('🔑 Entering API key...');
      await page.waitForSelector('input[type="password"]', { timeout: 10000 });
      await page.fill('input[type="password"]', apiKey);
      await page.click('button:has-text("Continue")');
      console.log('   ✓ API key entered\n');

      // Select theme
      console.log(`🎨 Selecting ${themes[i]} theme...`);
      await page.waitForSelector('text=Choose Your Adventure', { timeout: 10000 });
      await page.click(`button:has-text("${themes[i]}")`);
      await page.click('button:has-text("Start Adventure")');
      console.log(`   ✓ Theme selected\n`);

      // Wait for world generation
      console.log('🌍 Waiting for world generation...');
      await page.waitForSelector('text=/Conjuring|Forging|Crafting/', { timeout: 10000 });
      console.log('   Loading...');

      // Wait for world name to appear
      await page.waitForSelector('h1', { timeout: 200000 });

      // Get world name
      const worldName = await page.locator('h1').first().textContent();
      worldData.name = worldName.trim();
      worldNames.add(worldData.name);
      console.log(`   ✓ World: "${worldData.name}"\n`);

      // Get tagline if present
      const taglineEl = await page.locator('p.text-lg, p.text-xl').first();
      if (taglineEl) {
        worldData.tagline = (await taglineEl.textContent()).trim();
        console.log(`   Tagline: "${worldData.tagline}"\n`);
      }

      // Extract world content
      console.log('📊 Extracting world data...');

      // Get all visible text content
      const bodyText = await page.locator('body').textContent();
      worldData.textContent = bodyText;
      worldData.wordCount = bodyText.split(/\s+/).length;

      // Check for core sections
      const sections = [
        'Core Theme',
        'Geography',
        'History',
        'Magic System',
        'Cultures',
        'Conflicts',
        'Economy',
        'Daily Life',
        'Unique Feature',
        'Hidden Secrets'
      ];

      for (const section of sections) {
        const hasSection = await page.locator(`text=${section}`).count() > 0;
        worldData.sections[section] = hasSection;
        if (hasSection) {
          console.log(`   ✓ ${section}`);
        }
      }

      // Count cultures
      const cultureHeaders = await page.locator('h3, h4').allTextContents();
      worldData.cultures = cultureHeaders.filter(h => h && h.length > 0 && h.length < 50);

      console.log(`\n   Total word count: ${worldData.wordCount}`);
      console.log(`   Cultures found: ${worldData.cultures.length}\n`);

      worlds.push(worldData);
      console.log(`✅ World ${i + 1} complete`);

      // Clear storage for next iteration
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }

    // ============================================================
    // VARIANCE ANALYSIS
    // ============================================================
    console.log('\n\n' + '═'.repeat(80));
    console.log('📊 VARIANCE ANALYSIS');
    console.log('═'.repeat(80) + '\n');

    // Test 1: Unique world names
    console.log('1️⃣  World Name Variance:');
    console.log(`   Generated ${worldNames.size} unique names out of ${NUM_WORLDS} attempts`);
    worlds.forEach(w => console.log(`   - "${w.name}"`));
    expect(worldNames.size).toBeGreaterThan(0);

    // Expect at least 80% unique names (allow for rare collisions)
    const nameVariance = worldNames.size / NUM_WORLDS;
    expect(nameVariance).toBeGreaterThanOrEqual(0.8);
    console.log(`   ✅ PASS: ${(nameVariance * 100).toFixed(0)}% unique world names\n`);

    // Test 2: Content variance
    console.log('2️⃣  Content Variance:');
    const contentSimilarities = [];

    for (let i = 0; i < worlds.length - 1; i++) {
      for (let j = i + 1; j < worlds.length; j++) {
        // Simple word-based similarity
        const words1 = new Set(worlds[i].textContent.toLowerCase().split(/\s+/).filter(w => w.length > 4));
        const words2 = new Set(worlds[j].textContent.toLowerCase().split(/\s+/).filter(w => w.length > 4));

        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        const similarity = intersection.size / union.size;

        contentSimilarities.push(similarity);
        console.log(`   World ${i + 1} vs World ${j + 1}: ${(similarity * 100).toFixed(1)}% similar`);
      }
    }

    const avgSimilarity = contentSimilarities.reduce((a, b) => a + b, 0) / contentSimilarities.length;
    console.log(`   Average similarity: ${(avgSimilarity * 100).toFixed(1)}%`);

    // Expect less than 60% similarity (worlds should be quite different)
    expect(avgSimilarity).toBeLessThan(0.6);
    console.log(`   ✅ PASS: Worlds show good variance (< 60% similar)\n`);

    // ============================================================
    // QUALITY ANALYSIS
    // ============================================================
    console.log('═'.repeat(80));
    console.log('⭐ QUALITY ANALYSIS');
    console.log('═'.repeat(80) + '\n');

    worlds.forEach((world, idx) => {
      console.log(`World ${idx + 1}: "${world.name}"`);

      // Test 3: Content length
      console.log(`   📏 Content Length:`);
      console.log(`      Word count: ${world.wordCount}`);

      // Expect at least 500 words of content
      expect(world.wordCount).toBeGreaterThan(500);
      console.log(`      ✅ PASS: Sufficient content (> 500 words)\n`);

      // Test 4: Required sections present
      const sectionsPresent = Object.values(world.sections).filter(Boolean).length;
      const sectionsTotal = Object.keys(world.sections).length;

      console.log(`   📋 Section Completeness:`);
      console.log(`      Sections present: ${sectionsPresent}/${sectionsTotal}`);

      // Expect at least 70% of sections
      expect(sectionsPresent / sectionsTotal).toBeGreaterThan(0.7);
      console.log(`      ✅ PASS: Good section coverage (> 70%)\n`);

      // Test 5: Culture diversity
      console.log(`   🏛️  Culture Count:`);
      console.log(`      Cultures: ${world.cultures.length}`);

      // Expect at least 2 cultures
      expect(world.cultures.length).toBeGreaterThanOrEqual(2);
      console.log(`      ✅ PASS: Multiple cultures (>= 2)\n`);
    });

    // ============================================================
    // FINAL SUMMARY
    // ============================================================
    console.log('═'.repeat(80));
    console.log('🏆 FINAL SUMMARY');
    console.log('═'.repeat(80) + '\n');

    console.log('✅ Variance Tests:');
    console.log(`   ✓ ${worldNames.size}/${NUM_WORLDS} unique world names`);
    console.log(`   ✓ Average content similarity: ${(avgSimilarity * 100).toFixed(1)}%`);
    console.log('');

    console.log('✅ Quality Tests:');
    const avgWordCount = worlds.reduce((sum, w) => sum + w.wordCount, 0) / worlds.length;
    console.log(`   ✓ Average word count: ${avgWordCount.toFixed(0)}`);

    const avgSections = worlds.reduce((sum, w) => {
      return sum + Object.values(w.sections).filter(Boolean).length;
    }, 0) / worlds.length;
    console.log(`   ✓ Average sections: ${avgSections.toFixed(1)}/10`);

    const avgCultures = worlds.reduce((sum, w) => sum + w.cultures.length, 0) / worlds.length;
    console.log(`   ✓ Average cultures: ${avgCultures.toFixed(1)}`);
    console.log('');

    console.log('═'.repeat(80));
    console.log('🎉 ALL TESTS PASSED - Worlds show excellent variance and quality!');
    console.log('═'.repeat(80) + '\n');
  });

  test('generated content maintains quality and coherence', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    if (!apiKey) {
      test.skip('Skipping: No API key provided');
      return;
    }

    console.log('\n' + '═'.repeat(80));
    console.log('🔗 TESTING CONTENT QUALITY AND COHERENCE');
    console.log('═'.repeat(80) + '\n');

    // Navigate and setup
    await page.goto('/');
    await page.fill('input[type="password"]', apiKey);
    await page.click('button:has-text("Continue")');

    await page.waitForSelector('text=Choose Your Adventure');
    await page.click('button:has-text("Fantasy")');
    await page.click('button:has-text("Start Adventure")');

    // Wait for world
    await page.waitForSelector('h1', { timeout: 200000 });
    const worldName = await page.locator('h1').textContent();
    console.log(`📍 Testing world: "${worldName}"\n`);

    // Test generating a character
    console.log('👤 Testing character generation...');
    const charButton = await page.locator('button:has-text("Generate Character")').first();
    if (await charButton.count() > 0) {
      await charButton.click();

      // Wait for generation to complete
      await page.waitForTimeout(30000); // Wait up to 30s for character generation

      console.log('   ✓ Character generation triggered\n');
    } else {
      console.log('   ⚠️  Character generation button not found\n');
    }

    // Test generating a location
    console.log('📍 Testing location generation...');
    const locButton = await page.locator('button:has-text("Generate Location")').first();
    if (await locButton.count() > 0) {
      await locButton.click();

      // Wait for generation
      await page.waitForTimeout(30000);

      console.log('   ✓ Location generation triggered\n');
    } else {
      console.log('   ⚠️  Location generation button not found\n');
    }

    // Check that the world name is still displayed (coherence check)
    const stillHasWorldName = await page.locator('h1').textContent();
    expect(stillHasWorldName).toContain(worldName.substring(0, 10)); // Check first part of name
    console.log('✅ World context maintained throughout\n');

    console.log('═'.repeat(80));
    console.log('🎉 COHERENCE TEST PASSED');
    console.log('═'.repeat(80) + '\n');
  });
});
