/**
 * World Quality Validation Test
 * Ensures generated worlds meet quality standards and justify generation time
 */

import {
  worldGenerationPrompt,
  parseWorldGenerationResponse,
} from './frontend/src/prompts/worldGeneration.js';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ Error: OPENAI_API_KEY environment variable not set');
  process.exit(1);
}

async function callOpenAI(systemPrompt, userPrompt, parameters) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: parameters.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: parameters.temperature,
      max_tokens: parameters.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).length;
}

function analyzeQuality(world) {
  const results = {
    scores: {},
    metrics: {},
    pass: true,
    issues: []
  };

  // 1. Word Count Analysis
  const worldJSON = JSON.stringify(world);
  const totalWords = countWords(worldJSON);
  results.metrics.totalWords = totalWords;
  results.scores.wordCount = totalWords >= 2400 && totalWords <= 3200 ? 100 :
                              totalWords >= 2000 ? 80 : 50;

  if (totalWords < 2400) {
    results.issues.push(`⚠️  Word count could be higher: ${totalWords} (target: 2400-3000)`);
    // Not a hard failure, just a warning
  } else if (totalWords > 3200) {
    results.issues.push(`⚠️  Word count slightly high: ${totalWords} (target: 2400-3000)`);
  }

  // 2. Named Elements Count
  const namedElements = [
    ...new Set([
      ...(worldJSON.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || []),
    ]),
  ].filter((name) => name.length > 3);
  results.metrics.namedElements = namedElements.length;
  results.scores.namedElements = namedElements.length >= 30 ? 100 :
                                  namedElements.length >= 20 ? 70 : 30;

  if (namedElements.length < 30) {
    results.issues.push(`❌ Not enough named elements: ${namedElements.length} (target: 30-40+)`);
    results.pass = false;
  }

  // 3. Section Completeness
  const requiredSections = {
    'worldName': world.worldName,
    'theme': world.theme,
    'geography': world.geography,
    'history': world.history,
    'magicSystem': world.magicSystem,
    'cultures': world.cultures && world.cultures.length >= 3,
    'conflicts': world.conflicts,
    'economy': world.economy,
    'dailyLife': world.dailyLife,
    'uniqueFeature': world.uniqueFeature,
    'secrets': world.secrets,
    'uniquenessStatement': world.uniquenessStatement,
  };

  const completedSections = Object.values(requiredSections).filter(v => v).length;
  const totalSections = Object.keys(requiredSections).length;
  results.metrics.sectionCompleteness = `${completedSections}/${totalSections}`;
  results.scores.completeness = (completedSections / totalSections) * 100;

  Object.entries(requiredSections).forEach(([section, present]) => {
    if (!present) {
      results.issues.push(`❌ Missing section: ${section}`);
      results.pass = false;
    }
  });

  // 4. Culture Quality
  if (world.cultures) {
    results.metrics.cultureCount = world.cultures.length;

    world.cultures.forEach((culture, idx) => {
      const cultureWords = countWords(JSON.stringify(culture));
      if (cultureWords < 250) {
        results.issues.push(`❌ Culture ${idx + 1} (${culture.name}) too brief: ${cultureWords} words (minimum: 250)`);
        results.pass = false;
      } else if (cultureWords < 350) {
        results.issues.push(`⚠️  Culture ${idx + 1} (${culture.name}) could be more detailed: ${cultureWords} words (target: 350-500)`);
      }

      // Check for detailed subsections
      const requiredFields = ['name', 'description', 'socialStructure', 'economy', 'values', 'relationshipToMagic'];
      requiredFields.forEach(field => {
        if (!culture[field]) {
          results.issues.push(`❌ Culture ${idx + 1} (${culture.name}) missing: ${field}`);
          results.pass = false;
        }
      });
    });

    const avgCultureWords = world.cultures.reduce((sum, c) => sum + countWords(JSON.stringify(c)), 0) / world.cultures.length;
    results.scores.cultureQuality = world.cultures.length >= 3 && avgCultureWords >= 350 ? 100 :
                                     world.cultures.length >= 3 && avgCultureWords >= 250 ? 80 : 60;
  } else {
    results.scores.cultureQuality = 0;
  }

  // 5. Magic System Depth
  if (world.magicSystem) {
    const magicWords = countWords(JSON.stringify(world.magicSystem));
    results.metrics.magicSystemWords = magicWords;
    results.scores.magicSystem = magicWords >= 300 ? 100 :
                                  magicWords >= 200 ? 80 : 60;

    if (magicWords < 250) {
      results.issues.push(`⚠️  Magic system could be more detailed: ${magicWords} words (target: 250-400)`);
    }

    // Check for subsections
    if (!world.magicSystem.fundamentals && !world.magicSystem.description) {
      results.issues.push(`❌ Magic system missing fundamentals/description`);
      results.pass = false;
    }
  }

  // 6. Geography Detail
  if (world.geography) {
    const geoWords = countWords(JSON.stringify(world.geography));
    results.metrics.geographyWords = geoWords;

    if (!world.geography.majorLocations || world.geography.majorLocations.length < 3) {
      results.issues.push(`❌ Geography needs 3+ major locations (found: ${world.geography.majorLocations?.length || 0})`);
      results.pass = false;
    }

    results.scores.geography = geoWords >= 300 && world.geography.majorLocations?.length >= 3 ? 100 :
                                geoWords >= 200 && world.geography.majorLocations?.length >= 3 ? 80 : 60;
  }

  // 7. Overall Quality Score
  const avgScore = Object.values(results.scores).reduce((a, b) => a + b, 0) / Object.keys(results.scores).length;
  results.overallScore = Math.round(avgScore);

  return results;
}

async function testWorldQuality() {
  console.log('🎯 WORLD QUALITY VALIDATION TEST');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    const startTime = Date.now();

    console.log(`📖 Generating world with ${worldGenerationPrompt.parameters.model}...`);
    console.log(`   Max tokens: ${worldGenerationPrompt.parameters.maxTokens}`);
    console.log(`   Target: 2400-3000 words\n`);

    const worldPrompt = worldGenerationPrompt.getUserPrompt();
    const worldResponse = await callOpenAI(
      worldGenerationPrompt.systemPrompt,
      worldPrompt,
      worldGenerationPrompt.parameters
    );

    const endTime = Date.now();
    const generationTime = ((endTime - startTime) / 1000).toFixed(1);

    const world = parseWorldGenerationResponse(worldResponse);
    console.log(`✅ World: "${world.worldName}" (generated in ${generationTime}s)\n`);

    // Analyze Quality
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 QUALITY ANALYSIS');
    console.log('═══════════════════════════════════════════════════════\n');

    const quality = analyzeQuality(world);

    console.log('METRICS:');
    Object.entries(quality.metrics).forEach(([metric, value]) => {
      console.log(`  ${metric}: ${value}`);
    });

    console.log('\nSCORES (out of 100):');
    Object.entries(quality.scores).forEach(([category, score]) => {
      const icon = score >= 80 ? '✅' : score >= 60 ? '⚠️ ' : '❌';
      console.log(`  ${icon} ${category}: ${score}`);
    });

    console.log(`\n🎯 OVERALL QUALITY SCORE: ${quality.overallScore}/100`);

    if (quality.issues.length > 0) {
      console.log('\n⚠️  ISSUES FOUND:');
      quality.issues.forEach(issue => console.log(`  ${issue}`));
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('⏱️  TIME VS QUALITY ANALYSIS');
    console.log('═══════════════════════════════════════════════════════\n');

    const wordsPerSecond = (quality.metrics.totalWords / generationTime).toFixed(1);
    console.log(`Generation Time: ${generationTime}s`);
    console.log(`Words Generated: ${quality.metrics.totalWords}`);
    console.log(`Words/Second: ${wordsPerSecond}`);
    console.log(`Quality Score: ${quality.overallScore}/100`);

    // Time efficiency rating
    const timeEfficiency = generationTime < 90 && quality.overallScore >= 80 ? 'Excellent' :
                           generationTime < 120 && quality.overallScore >= 70 ? 'Good' :
                           quality.overallScore >= 60 ? 'Acceptable' : 'Needs Improvement';

    console.log(`\n📈 Time Efficiency: ${timeEfficiency}`);

    if (timeEfficiency === 'Excellent') {
      console.log('   ✅ Fast generation with high quality!');
    } else if (timeEfficiency === 'Good') {
      console.log('   ✅ Reasonable generation time with good quality');
    } else if (timeEfficiency === 'Acceptable') {
      console.log('   ⚠️  Quality could be improved for the time spent');
    } else {
      console.log('   ❌ Quality does not justify generation time');
    }

    console.log('\n═══════════════════════════════════════════════════════');
    if (quality.pass) {
      console.log('✅ WORLD MEETS QUALITY STANDARDS');
    } else {
      console.log('❌ WORLD NEEDS IMPROVEMENT');
    }
    console.log('═══════════════════════════════════════════════════════\n');

    if (!quality.pass) {
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testWorldQuality();
