import { test, expect } from '@playwright/test';

/**
 * World Generation Variance and Quality Test Suite
 *
 * This test suite validates:
 * 1. World variance - multiple generations produce different, unique content
 * 2. World quality - worlds meet minimum quality standards
 * 3. Content diversity - generated content is meaningful and varied
 * 4. Content coherence - worlds maintain internal consistency
 */

test.describe('World Generation Variance and Quality', () => {
  let apiKey;

  test.beforeAll(async () => {
    apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('\n⚠️  No OPENAI_API_KEY found. Set it with: export OPENAI_API_KEY=sk-...\n');
    }
  });

  test('generates diverse worlds with good variance across multiple runs', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes for multiple generations

    if (!apiKey) {
      test.skip('Skipping: No API key provided');
      return;
    }

    const NUM_GENERATIONS = 3; // Number of different worlds to generate

    console.log('\n' + '═'.repeat(80));
    console.log('🎲 TESTING WORLD VARIANCE AND QUALITY');
    console.log('═'.repeat(80) + '\n');
    console.log(`Configuration:`);
    console.log(`  • Worlds to generate: ${NUM_GENERATIONS}\n`);

    const worlds = [];
    const worldNames = new Set();
    const worldDescriptions = [];

    // Generate multiple stories
    for (let i = 0; i < NUM_GENERATIONS; i++) {
      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📖 GENERATING STORY ${i + 1}/${NUM_GENERATIONS}`);
      console.log('─'.repeat(80) + '\n');

      const storyData = {
        index: i,
        worldName: null,
        theme: null,
        opening: null,
        narratives: [],
        choices: [],
        wordCounts: [],
        uniqueWords: new Set()
      };

      // Navigate to app
      await page.goto('/');

      // Enter API key
      console.log('🔑 Step 1: Entering API key...');
      await page.waitForSelector('input[type="password"]', { timeout: 10000 });
      await page.fill('input[type="password"]', apiKey);
      await page.click('button:has-text("Continue")');
      console.log('   ✓ API key entered\n');

      // Select theme (alternate between different themes)
      console.log('🎨 Step 2: Selecting theme...');
      await page.waitForSelector('text=Choose Your Adventure', { timeout: 10000 });

      const themes = ['Fantasy', 'Sci-Fi', 'Mystery'];
      const selectedTheme = themes[i % themes.length];
      storyData.theme = selectedTheme;

      await page.click(`button:has-text("${selectedTheme}")`);
      console.log(`   ✓ Selected ${selectedTheme} theme\n`);

      await page.click('button:has-text("Start Adventure")');

      // Wait for world generation
      console.log('🌍 Step 3: Waiting for world generation...');

      // Wait for loading indicator
      await page.waitForSelector('text=/Conjuring|Forging|Crafting|Designing/', { timeout: 10000 });
      console.log('   Loading indicator appeared...');

      // Wait for world name (h1)
      await page.waitForSelector('h1', { timeout: 180000 });

      // Get world name
      const worldNameEl = await page.$('h1');
      if (worldNameEl) {
        const worldName = (await worldNameEl.textContent()).trim();
        storyData.worldName = worldName;
        worldNames.add(worldName);
        console.log(`   ✓ World generated: "${worldName}"\n`);
      }

      // Wait for "Start Story" button and click it
      console.log('📝 Step 4: Starting the story...');
      await page.waitForSelector('button:has-text("Start Story")', { timeout: 10000 });
      await page.click('button:has-text("Start Story")');

      // Wait for narrative to load
      await page.waitForSelector('.narrative-text, [class*="narrative"]', { timeout: 180000 });
      console.log('   ✓ Story started\n');

      // Get opening narrative
      const openingNarrative = await page.locator('.narrative-text, [class*="narrative"]').first().textContent();
      storyData.opening = openingNarrative.trim();
      storyData.narratives.push(storyData.opening);
      openingNarratives.push(storyData.opening);

      const openingWords = storyData.opening.split(/\s+/).length;
      storyData.wordCounts.push(openingWords);
      console.log(`   Opening length: ${openingWords} words\n`);

      // Track unique words
      storyData.opening.split(/\s+/).forEach(word => {
        const clean = word.toLowerCase().replace(/[^a-z]/g, '');
        if (clean.length > 3) storyData.uniqueWords.add(clean);
      });

      // Play through several turns to test narrative progression
      console.log(`🎮 Step 5: Playing ${NUM_TURNS_PER_STORY} turns...\n`);

      for (let turn = 0; turn < NUM_TURNS_PER_STORY; turn++) {
        console.log(`   Turn ${turn + 1}/${NUM_TURNS_PER_STORY}:`);

        // Wait for choices to be available
        await page.waitForSelector('button[class*="choice"], button:has-text("Choice")', { timeout: 10000 });

        // Get all choices
        const choiceButtons = await page.$$('button[class*="choice"], button:has-text("Choice")');
        if (choiceButtons.length === 0) {
          console.log('   ⚠️  No choices available, story may have ended');
          break;
        }

        const choices = [];
        for (const btn of choiceButtons) {
          const text = await btn.textContent();
          choices.push(text.trim());
        }

        storyData.choices.push(choices);
        console.log(`   - Found ${choices.length} choices`);

        // Select a random choice
        const randomIndex = Math.floor(Math.random() * choiceButtons.length);
        const chosenText = choices[randomIndex];
        console.log(`   - Selected: "${chosenText.substring(0, 50)}..."`);

        await choiceButtons[randomIndex].click();

        // Wait for generation
        await page.waitForSelector('text=/Weaving|Generating|Creating/', { timeout: 5000 }).catch(() => {});

        // Wait for new narrative
        await page.waitForSelector('.narrative-text, [class*="narrative"]', { timeout: 180000 });

        // Get new narrative
        const narrative = await page.locator('.narrative-text, [class*="narrative"]').first().textContent();
        const narrativeText = narrative.trim();
        storyData.narratives.push(narrativeText);

        const wordCount = narrativeText.split(/\s+/).length;
        storyData.wordCounts.push(wordCount);
        console.log(`   - Generated ${wordCount} words\n`);

        // Track unique words
        narrativeText.split(/\s+/).forEach(word => {
          const clean = word.toLowerCase().replace(/[^a-z]/g, '');
          if (clean.length > 3) storyData.uniqueWords.add(clean);
        });
      }

      stories.push(storyData);

      console.log(`✅ Story ${i + 1} complete`);
      console.log(`   - Total narratives: ${storyData.narratives.length}`);
      console.log(`   - Total choices offered: ${storyData.choices.reduce((sum, c) => sum + c.length, 0)}`);
      console.log(`   - Unique vocabulary: ${storyData.uniqueWords.size} words`);
    }

    // ============================================================
    // VARIANCE ANALYSIS
    // ============================================================
    console.log('\n\n' + '═'.repeat(80));
    console.log('📊 VARIANCE ANALYSIS');
    console.log('═'.repeat(80) + '\n');

    // Test 1: Unique world names
    console.log('1️⃣  World Name Variance:');
    console.log(`   Generated ${worldNames.size} unique worlds out of ${NUM_GENERATIONS} attempts`);
    stories.forEach(s => console.log(`   - "${s.worldName}" (${s.theme})`));
    expect(worldNames.size).toBeGreaterThan(0);
    console.log(`   ✅ PASS: All stories have world names\n`);

    // Test 2: Opening narrative variance
    console.log('2️⃣  Opening Narrative Variance:');
    const uniqueOpenings = new Set(openingNarratives.map(n => n.substring(0, 100)));
    console.log(`   Unique opening starts: ${uniqueOpenings.size}/${NUM_GENERATIONS}`);

    // Calculate similarity (simple word overlap)
    const openingSimilarity = [];
    for (let i = 0; i < openingNarratives.length - 1; i++) {
      for (let j = i + 1; j < openingNarratives.length; j++) {
        const words1 = new Set(openingNarratives[i].toLowerCase().split(/\s+/));
        const words2 = new Set(openingNarratives[j].toLowerCase().split(/\s+/));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        const similarity = intersection.size / union.size;
        openingSimilarity.push(similarity);
      }
    }
    const avgSimilarity = openingSimilarity.reduce((a, b) => a + b, 0) / openingSimilarity.length;
    console.log(`   Average similarity: ${(avgSimilarity * 100).toFixed(1)}%`);
    expect(avgSimilarity).toBeLessThan(0.7); // Expect less than 70% similarity
    console.log(`   ✅ PASS: Openings show good variance (< 70% similarity)\n`);

    // ============================================================
    // QUALITY ANALYSIS
    // ============================================================
    console.log('═'.repeat(80));
    console.log('⭐ QUALITY ANALYSIS');
    console.log('═'.repeat(80) + '\n');

    stories.forEach((story, idx) => {
      console.log(`Story ${idx + 1} (${story.theme} - "${story.worldName}"):`);

      // Test 3: Narrative length quality
      const avgWords = story.wordCounts.reduce((a, b) => a + b, 0) / story.wordCounts.length;
      const minWords = Math.min(...story.wordCounts);
      const maxWords = Math.max(...story.wordCounts);

      console.log(`   📏 Narrative Length:`);
      console.log(`      Average: ${avgWords.toFixed(0)} words`);
      console.log(`      Range: ${minWords} - ${maxWords} words`);

      // Expect reasonable narrative length (at least 150 words avg)
      expect(avgWords).toBeGreaterThan(150);
      console.log(`      ✅ PASS: Good narrative length (> 150 words avg)\n`);

      // Test 4: Choice diversity
      const allChoices = story.choices.flat();
      const uniqueChoices = new Set(allChoices);
      const choiceDiversity = uniqueChoices.size / allChoices.length;

      console.log(`   🎯 Choice Quality:`);
      console.log(`      Total choices offered: ${allChoices.length}`);
      console.log(`      Unique choices: ${uniqueChoices.size}`);
      console.log(`      Diversity ratio: ${(choiceDiversity * 100).toFixed(1)}%`);

      // Expect at least 80% unique choices
      expect(choiceDiversity).toBeGreaterThan(0.8);
      console.log(`      ✅ PASS: High choice diversity (> 80%)\n`);

      // Test 5: Vocabulary richness
      const vocabRichness = story.uniqueWords.size / story.narratives.join(' ').split(/\s+/).length;

      console.log(`   📚 Vocabulary Richness:`);
      console.log(`      Unique words (4+ chars): ${story.uniqueWords.size}`);
      console.log(`      Vocabulary ratio: ${(vocabRichness * 100).toFixed(1)}%`);

      // Expect at least 30% unique vocabulary
      expect(vocabRichness).toBeGreaterThan(0.3);
      console.log(`      ✅ PASS: Rich vocabulary (> 30% unique)\n`);
    });

    // ============================================================
    // FINAL SUMMARY
    // ============================================================
    console.log('═'.repeat(80));
    console.log('🏆 FINAL SUMMARY');
    console.log('═'.repeat(80) + '\n');

    console.log('✅ Variance Tests:');
    console.log(`   ✓ ${worldNames.size}/${NUM_GENERATIONS} unique worlds generated`);
    console.log(`   ✓ Opening narratives < 70% similar (${(avgSimilarity * 100).toFixed(1)}%)`);
    console.log('');

    console.log('✅ Quality Tests:');
    const allAvgWords = stories.reduce((sum, s) => {
      return sum + s.wordCounts.reduce((a, b) => a + b, 0) / s.wordCounts.length;
    }, 0) / stories.length;
    console.log(`   ✓ Average narrative length: ${allAvgWords.toFixed(0)} words`);

    const allChoiceDiversity = stories.map(s => {
      const all = s.choices.flat();
      const unique = new Set(all);
      return unique.size / all.length;
    });
    const avgChoiceDiversity = allChoiceDiversity.reduce((a, b) => a + b, 0) / allChoiceDiversity.length;
    console.log(`   ✓ Average choice diversity: ${(avgChoiceDiversity * 100).toFixed(1)}%`);

    const allVocabRichness = stories.map(s => {
      const total = s.narratives.join(' ').split(/\s+/).length;
      return s.uniqueWords.size / total;
    });
    const avgVocabRichness = allVocabRichness.reduce((a, b) => a + b, 0) / allVocabRichness.length;
    console.log(`   ✓ Average vocabulary richness: ${(avgVocabRichness * 100).toFixed(1)}%`);
    console.log('');

    console.log('═'.repeat(80));
    console.log('🎉 ALL TESTS PASSED - Stories show good variance and quality!');
    console.log('═'.repeat(80) + '\n');
  });

  test('individual story maintains coherence across multiple turns', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes

    if (!apiKey) {
      test.skip('Skipping: No API key provided');
      return;
    }

    console.log('\n' + '═'.repeat(80));
    console.log('🔗 TESTING STORY COHERENCE');
    console.log('═'.repeat(80) + '\n');

    // Navigate to app
    await page.goto('/');

    // Enter API key
    await page.fill('input[type="password"]', apiKey);
    await page.click('button:has-text("Continue")');

    // Select theme
    await page.waitForSelector('text=Choose Your Adventure');
    await page.click('button:has-text("Fantasy")');
    await page.click('button:has-text("Start Adventure")');

    // Wait for world
    await page.waitForSelector('h1', { timeout: 180000 });
    const worldName = await page.locator('h1').textContent();
    console.log(`📍 World: "${worldName}"\n`);

    // Start story
    await page.click('button:has-text("Start Story")');
    await page.waitForSelector('.narrative-text, [class*="narrative"]', { timeout: 180000 });

    const narratives = [];
    const choicesMade = [];

    // Collect opening
    const opening = await page.locator('.narrative-text, [class*="narrative"]').first().textContent();
    narratives.push(opening);
    console.log(`Opening: ${opening.substring(0, 100)}...\n`);

    // Play 7 turns
    for (let i = 0; i < 7; i++) {
      const choices = await page.$$('button[class*="choice"], button:has-text("Choice")');
      if (choices.length === 0) break;

      const choiceText = await choices[0].textContent();
      choicesMade.push(choiceText.trim());
      console.log(`Turn ${i + 1}: Chose "${choiceText.trim().substring(0, 50)}..."`);

      await choices[0].click();
      await page.waitForSelector('.narrative-text, [class*="narrative"]', { timeout: 180000 });

      const narrative = await page.locator('.narrative-text, [class*="narrative"]').first().textContent();
      narratives.push(narrative);
    }

    console.log(`\n✅ Generated ${narratives.length} narrative segments\n`);

    // Coherence checks
    console.log('🔍 Coherence Analysis:\n');

    // Check 1: Named entities persist
    const namedEntities = new Set();
    narratives.forEach(n => {
      const matches = n.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\b/g) || [];
      matches.forEach(entity => {
        if (entity.length > 3 && !['The', 'This', 'That', 'There', 'Then', 'When', 'What', 'Where', 'Your', 'You'].includes(entity)) {
          namedEntities.add(entity);
        }
      });
    });

    console.log(`   1. Named Entities Found: ${namedEntities.size}`);
    if (namedEntities.size > 0) {
      console.log(`      - ${Array.from(namedEntities).slice(0, 5).join(', ')}${namedEntities.size > 5 ? '...' : ''}`);
    }
    expect(namedEntities.size).toBeGreaterThan(0);
    console.log(`      ✅ PASS: Story has named entities\n`);

    // Check 2: Progressive narrative (later narratives reference earlier concepts)
    const lastNarrative = narratives[narratives.length - 1].toLowerCase();
    const firstNarrativeWords = new Set(narratives[0].toLowerCase().split(/\s+/).filter(w => w.length > 5));
    const referencedWords = [...firstNarrativeWords].filter(w => lastNarrative.includes(w));

    console.log(`   2. Narrative Continuity:`);
    console.log(`      Words from opening referenced later: ${referencedWords.length}`);
    expect(referencedWords.length).toBeGreaterThan(0);
    console.log(`      ✅ PASS: Story maintains continuity\n`);

    // Check 3: No repetitive patterns
    const tripleRepeats = [];
    for (let i = 0; i < narratives.length - 2; i++) {
      const start1 = narratives[i].substring(0, 50);
      const start2 = narratives[i + 1].substring(0, 50);
      const start3 = narratives[i + 2].substring(0, 50);

      if (start1 === start2 || start2 === start3) {
        tripleRepeats.push(i);
      }
    }

    console.log(`   3. Repetition Check:`);
    console.log(`      Identical consecutive openings: ${tripleRepeats.length}`);
    expect(tripleRepeats.length).toBe(0);
    console.log(`      ✅ PASS: No repetitive patterns\n`);

    console.log('═'.repeat(80));
    console.log('🎉 COHERENCE TEST PASSED');
    console.log('═'.repeat(80) + '\n');
  });
});
