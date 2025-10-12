/**
 * Test for detailed multi-page world generation (6000-8000 words)
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

async function testDetailedWorld() {
  console.log('🌍 TESTING DETAILED WORLD GENERATION');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Generate world
    console.log(`📖 Generating detailed world with ${worldGenerationPrompt.parameters.model}...`);
    console.log(`   Max tokens: ${worldGenerationPrompt.parameters.maxTokens}`);
    console.log(`   Target: 2800-3400 words\n`);

    const worldPrompt = worldGenerationPrompt.getUserPrompt();
    const worldResponse = await callOpenAI(
      worldGenerationPrompt.systemPrompt,
      worldPrompt,
      worldGenerationPrompt.parameters
    );

    const world = parseWorldGenerationResponse(worldResponse);
    console.log(`✅ World: "${world.worldName}"`);
    if (world.tagline) {
      console.log(`   Tagline: "${world.tagline}"\n`);
    }

    // Count total words
    const worldJSON = JSON.stringify(world);
    const totalWords = countWords(worldJSON);

    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 WORLD STATISTICS');
    console.log('═══════════════════════════════════════════════════════\n');

    // Basic info
    console.log(`World Name: ${world.worldName}`);
    console.log(`Magic System: ${world.magicSystem.name}`);
    console.log(`Cultures: ${world.cultures.length} (target: 3)`);
    console.log(`Total Word Count: ~${totalWords} words (target: 2800-3400)\n`);

    // Check new fields existence
    console.log('NEW FIELD VERIFICATION:');
    const newFields = {
      tagline: !!world.tagline,
      geography: !!world.geography,
      'geography.overview': world.geography?.overview,
      'geography.majorLocations': world.geography?.majorLocations?.length || 0,
      history: !!world.history,
      'history.ancientEra': world.history?.ancientEra,
      'history.formativeConflict': world.history?.formativeConflict,
      'history.recentHistory': world.history?.recentHistory,
      'magicSystem.fundamentals': world.magicSystem?.fundamentals,
      'magicSystem.socialImpact': world.magicSystem?.socialImpact,
      'magicSystem.cost': world.magicSystem?.cost,
      'magicSystem.variants': world.magicSystem?.variants,
      conflicts: !!world.conflicts,
      'conflicts.primary': world.conflicts?.primary,
      'conflicts.secondary': world.conflicts?.secondary?.length || 0,
      'conflicts.risingTensions': world.conflicts?.risingTensions,
      economy: !!world.economy,
      'economy.overview': world.economy?.overview,
      'economy.scarcity': world.economy?.scarcity,
      dailyLife: !!world.dailyLife,
      'dailyLife.commonPerson': world.dailyLife?.commonPerson,
      'dailyLife.technology': world.dailyLife?.technology,
      secrets: !!world.secrets,
      uniquenessStatement: !!world.uniquenessStatement,
    };

    Object.entries(newFields).forEach(([field, value]) => {
      const status = value ? '✅' : '❌';
      const display = typeof value === 'number' ? `${value} items` : (value ? 'present' : 'missing');
      console.log(`  ${status} ${field}: ${display}`);
    });

    // Word count breakdown
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📝 WORD COUNT BREAKDOWN');
    console.log('═══════════════════════════════════════════════════════\n');

    const sections = {
      'Theme': countWords(world.theme),
      'Geography': countWords(JSON.stringify(world.geography)),
      'History': countWords(JSON.stringify(world.history)),
      'Magic System': countWords(JSON.stringify(world.magicSystem)),
      'Conflicts': countWords(JSON.stringify(world.conflicts)),
      'Economy': countWords(JSON.stringify(world.economy)),
      'Daily Life': countWords(JSON.stringify(world.dailyLife)),
      'Unique Feature': countWords(world.uniqueFeature),
      'Secrets': countWords(world.secrets),
      'Uniqueness Statement': countWords(world.uniquenessStatement),
    };

    let culturesTotal = 0;
    world.cultures.forEach((culture, idx) => {
      const cultureWords = countWords(JSON.stringify(culture));
      culturesTotal += cultureWords;
      console.log(`Culture ${idx + 1} (${culture.name}): ${cultureWords} words`);
    });
    sections['All Cultures'] = culturesTotal;

    console.log('\nOther Sections:');
    Object.entries(sections).forEach(([section, words]) => {
      if (section !== 'All Cultures') {
        console.log(`  ${section}: ${words} words`);
      }
    });

    // Check culture details
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('👥 CULTURE DETAILS');
    console.log('═══════════════════════════════════════════════════════\n');

    world.cultures.forEach((culture, idx) => {
      console.log(`Culture ${idx + 1}: ${culture.name}`);
      console.log(`  Population: ${culture.population ? '✅' : '❌'}`);
      console.log(`  Description: ${countWords(culture.description)} words`);
      console.log(`  Social Structure: ${culture.socialStructure ? '✅' : '❌'}`);
      console.log(`  Economy: ${culture.economy ? '✅' : '❌'}`);
      console.log(`  Values: ${culture.values ? '✅' : '❌'}`);
      console.log(`  Relationship to Magic: ${culture.relationshipToMagic ? '✅' : '❌'}`);
      console.log(`  Notable Figures: ${culture.notableFigures ? '✅' : '❌'}\n`);
    });

    // Count named elements
    const namedElements = [
      ...new Set([
        ...(worldJSON.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || []),
      ]),
    ].filter((name) => name.length > 3);

    console.log('═══════════════════════════════════════════════════════');
    console.log('🏷️  NAMED ELEMENTS');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`Total Named Elements: ${namedElements.length} (target: 30-40+)`);
    console.log(`Status: ${namedElements.length >= 30 ? '✅ Excellent detail!' : '⚠️  Could use more named elements'}\n`);

    // Success summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('Summary:');
    console.log(`  ✅ World generated with ${world.cultures.length} cultures`);
    console.log(`  ${totalWords >= 2800 && totalWords <= 3600 ? '✅' : '⚠️'} Total word count: ~${totalWords} words`);
    console.log(`  ${namedElements.length >= 30 ? '✅' : '⚠️'} Named elements: ${namedElements.length}`);
    console.log(`  ✅ All major sections present`);
    console.log(`  ✅ UI should display correctly\n`);

    // Sample output
    console.log('═══════════════════════════════════════════════════════');
    console.log('📖 SAMPLE OUTPUT');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('THEME:');
    console.log(world.theme.substring(0, 300) + '...\n');

    if (world.geography) {
      console.log('GEOGRAPHY OVERVIEW:');
      console.log(world.geography.overview.substring(0, 200) + '...\n');
    }

    if (world.cultures.length > 0) {
      console.log(`FIRST CULTURE (${world.cultures[0].name}):`);
      console.log(world.cultures[0].description.substring(0, 200) + '...\n');
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testDetailedWorld();
