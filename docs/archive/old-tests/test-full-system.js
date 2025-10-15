/**
 * Comprehensive test of hybrid system (GPT-3.5 worlds + GPT-4 narratives)
 */

import {
  worldGenerationPrompt,
  parseWorldGenerationResponse,
  formatWorldForDisplay,
} from './frontend/src/prompts/worldGeneration.js';
import {
  narrativeProgressionPrompt,
  getOpeningPrompt,
  parseNarrativeResponse,
} from './frontend/src/prompts/narrativeProgression.js';

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

async function testFullSystem() {
  console.log('🎮 TESTING COMPLETE HYBRID SYSTEM');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    // Step 1: Generate world with GPT-3.5-turbo
    console.log(`📖 Step 1: Generating world with ${worldGenerationPrompt.parameters.model}...`);
    const worldPrompt = worldGenerationPrompt.getUserPrompt();
    const worldResponse = await callOpenAI(
      worldGenerationPrompt.systemPrompt,
      worldPrompt,
      worldGenerationPrompt.parameters
    );
    const world = parseWorldGenerationResponse(worldResponse);
    console.log(`✅ World: "${world.worldName}"\n`);

    // Analyze world detail level
    const worldText = JSON.stringify(world);
    const namedElements = [
      ...new Set([
        ...(worldText.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || []),
      ]),
    ].filter((name) => name.length > 3 && name !== 'Core' && name !== 'Law');

    console.log('═══════════════════════════════════════════════════════');
    console.log('🌍 WORLD DETAIL ANALYSIS');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`World Name: ${world.worldName}`);
    console.log(`Magic System: ${world.magicSystem.name}`);
    console.log(`Cultures: ${world.cultures.map((c) => c.name).join(', ')}`);
    console.log(`\nNamed Elements Found: ${namedElements.length}`);
    console.log(
      `Target: 10+ named places/institutions/resources\n`
    );

    console.log(formatWorldForDisplay(world));

    // Step 2: Generate narrative with GPT-4
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`📖 Step 2: Generating narrative with ${narrativeProgressionPrompt.parameters.model}...`);
    const openingPrompt = getOpeningPrompt(world);
    const narrativeResponse = await callOpenAI(
      narrativeProgressionPrompt.systemPrompt,
      openingPrompt,
      narrativeProgressionPrompt.parameters
    );
    const narrative = parseNarrativeResponse(narrativeResponse);
    console.log('✅ Generated opening narrative\n');

    // Analyze narrative structure
    const wordCount = narrative.narrative.trim().split(/\s+/).length;
    const paragraphs = narrative.narrative.trim().split(/\n\n+/);

    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 NARRATIVE ANALYSIS');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`Model Used: ${narrativeProgressionPrompt.parameters.model}`);
    console.log(`Word Count: ${wordCount} words (target: 350-450)`);
    console.log(`Paragraphs: ${paragraphs.length} (target: 4)`);
    console.log(
      `Word Count Status: ${wordCount >= 350 && wordCount <= 450 ? '✅ Within target' : '⚠️  Outside target'}`
    );
    console.log(
      `Paragraph Count Status: ${paragraphs.length === 4 ? '✅ Correct' : '⚠️  Should be 4'}`
    );

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📖 OPENING NARRATIVE');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(narrative.narrative);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('⚔️  CHOICES');
    console.log('═══════════════════════════════════════════════════════\n');
    narrative.choices.forEach((choice, index) => {
      console.log(`${index + 1}. [${choice.approach.toUpperCase()}] ${choice.text}`);
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ HYBRID SYSTEM TEST COMPLETED');
    console.log('═══════════════════════════════════════════════════════\n');

    console.log('📋 Summary:');
    console.log(`  World Generation: ${worldGenerationPrompt.parameters.model}`);
    console.log(`  Narrative Generation: ${narrativeProgressionPrompt.parameters.model}`);
    console.log(`  Named World Elements: ${namedElements.length >= 10 ? '✅' : '⚠️'} ${namedElements.length} found`);
    console.log(
      `  Narrative Length: ${wordCount >= 350 && wordCount <= 450 ? '✅' : '⚠️'} ${wordCount} words`
    );
    console.log(
      `  Narrative Structure: ${paragraphs.length === 4 ? '✅' : '⚠️'} ${paragraphs.length} paragraphs`
    );
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

testFullSystem();
