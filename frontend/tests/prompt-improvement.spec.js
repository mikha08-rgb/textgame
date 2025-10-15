import { test, expect } from '@playwright/test';

/**
 * Prompt Improvement Test
 *
 * Tests the new positive-principles approach vs old forbidden-list approach:
 * - Absence of clichés and fantasy tropes
 * - Presence of specific numbers and measurements
 * - Mundane/bureaucratic naming patterns
 * - Concrete sensory details
 * - Grounded consequences and conflicts
 *
 * Based on research findings in docs/PROMPT_RESEARCH_FINDINGS.md
 */

test.describe('Prompt Improvement Validation', () => {
  let apiKey;

  test.beforeAll(async () => {
    apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('\n⚠️  No OPENAI_API_KEY found. Set it with: export OPENAI_API_KEY=sk-...\n');
    }
  });

  test('validates improved prompt eliminates clichés', async ({ page }) => {
    test.setTimeout(600000); // 10 minutes - longer prompt needs more time

    if (!apiKey) {
      test.skip('Skipping: No API key provided');
      return;
    }

    console.log('\n' + '═'.repeat(80));
    console.log('🎯 TESTING IMPROVED PROMPT SYSTEM');
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

    // Get all body text for analysis
    const bodyText = await page.locator('body').textContent();
    const lowerText = bodyText.toLowerCase();

    // ============================================================
    // CLICHÉ DETECTION - Should NOT be present
    // ============================================================
    console.log('🚫 Step 4: Checking for absence of clichés...\n');

    const clicheChecks = {
      passed: [],
      failed: [],
      warnings: []
    };

    // Check 1: "The [Adjective] [Noun]" pattern
    console.log('   Checking faction name patterns...');
    const theAdjNounPattern = /\bThe\s+\w+\s+(Council|Order|Brotherhood|Covenant|Kingdom|Empire|Dominion|Guild)\b/gi;
    const matches = bodyText.match(theAdjNounPattern);
    if (!matches || matches.length === 0) {
      clicheChecks.passed.push('✓ No "The [Adjective] [Noun]" faction names');
      console.log('      ✓ PASS: No generic faction names like "The Eternal Council"');
    } else {
      clicheChecks.failed.push(`✗ Found generic faction names: ${matches.join(', ')}`);
      console.log(`      ✗ FAIL: Found: ${matches.join(', ')}`);
    }

    // Check 2: Generic fantasy descriptors
    console.log('   Checking for generic fantasy descriptors...');
    const genericDescriptors = ['luminous', 'ethereal', 'ancient power', 'mystical energy', 'sacred', 'eternal'];
    const foundDescriptors = genericDescriptors.filter(d => lowerText.includes(d));
    if (foundDescriptors.length === 0) {
      clicheChecks.passed.push('✓ No generic fantasy descriptors (luminous, ethereal, etc.)');
      console.log('      ✓ PASS: No generic descriptors found');
    } else {
      clicheChecks.warnings.push(`⚠ Found some generic descriptors: ${foundDescriptors.join(', ')}`);
      console.log(`      ⚠ WARNING: Found: ${foundDescriptors.join(', ')}`);
    }

    // Check 3: Forbidden magic sources
    console.log('   Checking for forbidden magic sources...');
    const forbiddenSources = ['crystal power', 'mana', 'essence', 'life force', 'soul energy', 'ether'];
    const foundSources = forbiddenSources.filter(s => lowerText.includes(s));
    if (foundSources.length === 0) {
      clicheChecks.passed.push('✓ No forbidden magic sources (crystals, mana, essence)');
      console.log('      ✓ PASS: No forbidden magic sources');
    } else {
      clicheChecks.failed.push(`✗ Found forbidden magic sources: ${foundSources.join(', ')}`);
      console.log(`      ✗ FAIL: Found: ${foundSources.join(', ')}`);
    }

    // Check 4: Light vs Dark conflict
    console.log('   Checking for light vs dark conflicts...');
    const lightDarkPattern = /(light\s+(?:vs|versus|against)\s+dark|darkness\s+(?:vs|versus|against)\s+light|forces\s+of\s+(?:light|darkness))/gi;
    const lightDarkMatches = bodyText.match(lightDarkPattern);
    if (!lightDarkMatches) {
      clicheChecks.passed.push('✓ No light vs dark conflict pattern');
      console.log('      ✓ PASS: No light vs dark conflicts');
    } else {
      clicheChecks.failed.push('✗ Found light vs dark conflict pattern');
      console.log('      ✗ FAIL: Found light vs dark pattern');
    }

    // Check 5: Chosen one / prophecy
    console.log('   Checking for chosen one/prophecy tropes...');
    const chosenPattern = /(chosen one|prophesied|prophecy|destined hero|foretold)/gi;
    const chosenMatches = bodyText.match(chosenPattern);
    if (!chosenMatches || chosenMatches.length === 0) {
      clicheChecks.passed.push('✓ No chosen one/prophecy tropes');
      console.log('      ✓ PASS: No chosen one/prophecy tropes');
    } else {
      clicheChecks.failed.push(`✗ Found chosen one/prophecy: ${chosenMatches.join(', ')}`);
      console.log(`      ✗ FAIL: Found: ${chosenMatches.join(', ')}`);
    }

    console.log('');

    // ============================================================
    // POSITIVE PRINCIPLE CHECKS - Should BE present
    // ============================================================
    console.log('✅ Step 5: Checking for positive principles...\n');

    const principleChecks = {
      passed: [],
      failed: [],
      warnings: []
    };

    // Check 1: Specific numbers and measurements
    console.log('   Checking for specific numbers and measurements...');
    const numberPattern = /\b\d+\s*(?:meters|km|hours|days|years|percent|degrees|units|liters|grams|people|individuals)\b/gi;
    const numberMatches = bodyText.match(numberPattern) || [];
    if (numberMatches.length >= 5) {
      principleChecks.passed.push(`✓ Has specific measurements (${numberMatches.length} found)`);
      console.log(`      ✓ PASS: Found ${numberMatches.length} specific measurements`);
      console.log(`         Examples: ${numberMatches.slice(0, 3).join(', ')}`);
    } else {
      principleChecks.warnings.push(`⚠ Only ${numberMatches.length} specific measurements (target: 5+)`);
      console.log(`      ⚠ WARNING: Only ${numberMatches.length} measurements found (target: 5+)`);
    }

    // Check 2: Mundane/bureaucratic naming
    console.log('   Checking for mundane/bureaucratic names...');
    const mundanePattern = /\b(?:Department|Bureau|Committee|Ministry|Office|Local|District|Association|Guild|Union|Agency)\b/gi;
    const mundaneMatches = bodyText.match(mundanePattern) || [];
    if (mundaneMatches.length >= 1) {
      principleChecks.passed.push(`✓ Has mundane/bureaucratic names (${mundaneMatches.length} found)`);
      console.log(`      ✓ PASS: Found ${mundaneMatches.length} mundane/bureaucratic names`);
      console.log(`         Examples: ${[...new Set(mundaneMatches)].slice(0, 3).join(', ')}`);
    } else {
      principleChecks.warnings.push('⚠ No mundane/bureaucratic names found');
      console.log('      ⚠ WARNING: No mundane/bureaucratic names found');
    }

    // Check 3: Concrete sensory details
    console.log('   Checking for sensory details...');
    const sensoryWords = [
      'smell', 'sound', 'texture', 'taste', 'feel', 'touch',
      'warm', 'cold', 'hot', 'cool', 'rough', 'smooth',
      'loud', 'quiet', 'bitter', 'sweet', 'metallic',
      'copper', 'iron', 'brass', 'stone', 'wood'
    ];
    const foundSensory = sensoryWords.filter(w => lowerText.includes(w));
    if (foundSensory.length >= 5) {
      principleChecks.passed.push(`✓ Has sensory details (${foundSensory.length} sensory words)`);
      console.log(`      ✓ PASS: Found ${foundSensory.length} sensory details`);
      console.log(`         Examples: ${foundSensory.slice(0, 5).join(', ')}`);
    } else {
      principleChecks.warnings.push(`⚠ Only ${foundSensory.length} sensory words (target: 5+)`);
      console.log(`      ⚠ WARNING: Only ${foundSensory.length} sensory words (target: 5+)`);
    }

    // Check 4: Economic/practical terms
    console.log('   Checking for grounded economic/practical terms...');
    const economicTerms = [
      'trade', 'currency', 'tax', 'regulation', 'license', 'permit',
      'economy', 'market', 'guild', 'merchant', 'cost', 'price',
      'bureaucracy', 'paperwork', 'form', 'law', 'policy'
    ];
    const foundEconomic = economicTerms.filter(t => lowerText.includes(t));
    if (foundEconomic.length >= 3) {
      principleChecks.passed.push(`✓ Has economic/practical terms (${foundEconomic.length} found)`);
      console.log(`      ✓ PASS: Found ${foundEconomic.length} economic/practical terms`);
      console.log(`         Examples: ${foundEconomic.slice(0, 3).join(', ')}`);
    } else {
      principleChecks.warnings.push(`⚠ Only ${foundEconomic.length} economic terms (target: 3+)`);
      console.log(`      ⚠ WARNING: Only ${foundEconomic.length} economic terms (target: 3+)`);
    }

    // Check 5: Named institutions
    console.log('   Checking for named institutions...');
    const institutionPattern = /\b[A-Z][a-z]+\s+(?:of|for)\s+[A-Z][a-z]+/g;
    const institutionMatches = bodyText.match(institutionPattern) || [];
    const uniqueInstitutions = [...new Set(institutionMatches)];
    if (uniqueInstitutions.length >= 3) {
      principleChecks.passed.push(`✓ Has named institutions (${uniqueInstitutions.length} found)`);
      console.log(`      ✓ PASS: Found ${uniqueInstitutions.length} named institutions`);
      console.log(`         Examples: ${uniqueInstitutions.slice(0, 3).join(', ')}`);
    } else {
      principleChecks.warnings.push(`⚠ Only ${uniqueInstitutions.length} named institutions (target: 3+)`);
      console.log(`      ⚠ WARNING: Only ${uniqueInstitutions.length} named institutions (target: 3+)`);
    }

    console.log('');

    // ============================================================
    // SUMMARY & SCORING
    // ============================================================
    console.log('═'.repeat(80));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('═'.repeat(80) + '\n');

    console.log(`World: "${worldName}"\n`);

    // Cliché checks (failures are bad)
    console.log('🚫 Cliché Elimination (Must Pass):');
    clicheChecks.passed.forEach(p => console.log(`   ${p}`));
    clicheChecks.warnings.forEach(w => console.log(`   ${w}`));
    clicheChecks.failed.forEach(f => console.log(`   ${f}`));

    const clicheScore = clicheChecks.passed.length / (clicheChecks.passed.length + clicheChecks.failed.length);
    console.log(`   Cliché Elimination Score: ${(clicheScore * 100).toFixed(0)}% (${clicheChecks.passed.length}/${clicheChecks.passed.length + clicheChecks.failed.length} checks passed)\n`);

    // Positive principle checks (should be present)
    console.log('✅ Positive Principles (Target 80%+):');
    principleChecks.passed.forEach(p => console.log(`   ${p}`));
    principleChecks.warnings.forEach(w => console.log(`   ${w}`));
    principleChecks.failed.forEach(f => console.log(`   ${f}`));

    const principleScore = principleChecks.passed.length / (principleChecks.passed.length + principleChecks.warnings.length + principleChecks.failed.length);
    console.log(`   Positive Principle Score: ${(principleScore * 100).toFixed(0)}% (${principleChecks.passed.length}/${principleChecks.passed.length + principleChecks.warnings.length + principleChecks.failed.length} checks passed)\n`);

    // Overall assessment
    const overallScore = (clicheScore + principleScore) / 2;
    console.log('═'.repeat(80));
    console.log(`🎯 OVERALL IMPROVEMENT SCORE: ${(overallScore * 100).toFixed(0)}%`);
    console.log('═'.repeat(80) + '\n');

    // Assertions
    console.log('Running assertions...\n');

    // Critical: Must pass cliché elimination
    expect(clicheChecks.failed.length).toBe(0);
    console.log('✓ Assertion 1: No critical clichés found');

    // Should have at least 60% positive principles
    expect(principleScore).toBeGreaterThanOrEqual(0.6);
    console.log('✓ Assertion 2: At least 60% positive principles present');

    // Overall improvement score should be 70%+
    expect(overallScore).toBeGreaterThanOrEqual(0.7);
    console.log('✓ Assertion 3: Overall improvement score >= 70%');

    console.log('\n' + '═'.repeat(80));
    console.log('🎉 PROMPT IMPROVEMENT TEST PASSED!');
    console.log('═'.repeat(80) + '\n');

    // Log recommendations
    if (principleChecks.warnings.length > 0) {
      console.log('💡 RECOMMENDATIONS FOR FURTHER IMPROVEMENT:\n');
      principleChecks.warnings.forEach(w => console.log(`   ${w}`));
      console.log('\n   Consider adding more specific examples in the prompt for these areas.\n');
    }
  });

  test('compares 3 worlds for originality variance', async ({ page, context }) => {
    test.setTimeout(1800000); // 30 minutes for 3 worlds - comprehensive prompt is slower

    if (!apiKey) {
      test.skip('Skipping: No API key provided');
      return;
    }

    console.log('\n' + '═'.repeat(80));
    console.log('🎲 TESTING ORIGINALITY VARIANCE (3 WORLDS)');
    console.log('═'.repeat(80) + '\n');

    const worlds = [];

    for (let i = 0; i < 3; i++) {
      console.log(`\n📖 Generating World ${i + 1}/3...\n`);

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

      // Wait for world - increased timeout for comprehensive prompt
      await testPage.waitForSelector('h1', { timeout: 400000 }); // 6.6 minutes per world

      const worldName = await testPage.locator('h1').textContent();
      const bodyText = await testPage.locator('body').textContent();

      // Extract key elements for comparison
      const numbers = bodyText.match(/\d+/g) || [];
      const uniqueWords = new Set(
        bodyText.toLowerCase()
          .split(/\s+/)
          .filter(w => w.length > 5)
      );

      worlds.push({
        name: worldName.trim(),
        text: bodyText,
        numbers: numbers,
        uniqueWords: uniqueWords,
        wordCount: bodyText.split(/\s+/).length
      });

      console.log(`✓ World ${i + 1}: "${worlds[i].name}"`);
      console.log(`   Word count: ${worlds[i].wordCount}`);
      console.log(`   Unique numbers used: ${new Set(worlds[i].numbers).size}`);

      await testPage.close();
    }

    // Variance analysis
    console.log('\n' + '═'.repeat(80));
    console.log('📊 ORIGINALITY VARIANCE ANALYSIS');
    console.log('═'.repeat(80) + '\n');

    // Check name uniqueness
    console.log('World Names:');
    worlds.forEach((w, i) => console.log(`   ${i + 1}. "${w.name}"`));

    const uniqueNames = new Set(worlds.map(w => w.name));
    console.log(`\n✓ Unique names: ${uniqueNames.size}/3`);
    expect(uniqueNames.size).toBe(3);

    // Calculate pairwise similarity
    console.log('\nPairwise Similarity:');
    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < worlds.length; i++) {
      for (let j = i + 1; j < worlds.length; j++) {
        const intersection = new Set([...worlds[i].uniqueWords].filter(x => worlds[j].uniqueWords.has(x)));
        const union = new Set([...worlds[i].uniqueWords, ...worlds[j].uniqueWords]);
        const similarity = intersection.size / union.size;

        console.log(`   World ${i + 1} vs World ${j + 1}: ${(similarity * 100).toFixed(1)}% similar`);
        totalSimilarity += similarity;
        comparisons++;
      }
    }

    const avgSimilarity = totalSimilarity / comparisons;
    console.log(`\nAverage similarity: ${(avgSimilarity * 100).toFixed(1)}%`);
    console.log(`Target: < 60% (more different = better)`);

    // Originality metric: lower similarity = more original
    const originalityScore = 1 - avgSimilarity;
    console.log(`\n🎯 Originality Score: ${(originalityScore * 100).toFixed(0)}%`);

    // Assertions
    expect(avgSimilarity).toBeLessThan(0.7); // Worlds should be < 70% similar
    expect(uniqueNames.size).toBe(3); // All names should be unique

    console.log('\n' + '═'.repeat(80));
    if (avgSimilarity < 0.5) {
      console.log('🌟 EXCELLENT: Worlds are highly original and diverse!');
    } else if (avgSimilarity < 0.6) {
      console.log('✅ GOOD: Worlds show good originality and variance!');
    } else {
      console.log('⚠️  ACCEPTABLE: Worlds pass but could be more diverse.');
    }
    console.log('═'.repeat(80) + '\n');
  });
});
