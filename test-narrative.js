/**
 * Test script to validate narrative generation with new prompts
 * Tests that stories properly establish character/setting before conflict
 */

import {
  worldGenerationPrompt,
  parseWorldGenerationResponse,
} from './frontend/src/prompts/worldGeneration.js';
import {
  narrativeProgressionPrompt,
  getOpeningPrompt,
  parseNarrativeResponse,
} from './frontend/src/prompts/narrativeProgression.js';

// Check for OpenAI API key
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ Error: OPENAI_API_KEY environment variable not set');
  console.log('\nUsage: OPENAI_API_KEY=your-key-here node test-narrative.js');
  process.exit(1);
}

console.log('🧪 Testing Narrative Generation System\n');
console.log('═══════════════════════════════════════════════════════\n');

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

async function testNarrativeGeneration() {
  try {
    // Step 1: Generate a world
    console.log('📖 Step 1: Generating fantasy world...');
    const worldPrompt = worldGenerationPrompt.getUserPrompt();
    const worldResponse = await callOpenAI(
      worldGenerationPrompt.systemPrompt,
      worldPrompt,
      worldGenerationPrompt.parameters
    );

    const world = parseWorldGenerationResponse(worldResponse);
    console.log(`✅ Generated world: "${world.worldName}"\n`);

    // Step 2: Generate opening narrative
    console.log('📖 Step 2: Generating opening narrative...');
    const openingPrompt = getOpeningPrompt(world);
    const narrativeResponse = await callOpenAI(
      narrativeProgressionPrompt.systemPrompt,
      openingPrompt,
      narrativeProgressionPrompt.parameters
    );

    const narrative = parseNarrativeResponse(narrativeResponse);
    console.log('✅ Generated opening narrative\n');

    // Step 3: Analyze narrative structure
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 NARRATIVE ANALYSIS');
    console.log('═══════════════════════════════════════════════════════\n');

    const wordCount = narrative.narrative.trim().split(/\s+/).length;
    const paragraphs = narrative.narrative.trim().split(/\n\n+/);
    const hasSecondPerson = /\byou\b/i.test(narrative.narrative);

    console.log(`World: ${world.worldName}`);
    console.log(`Word Count: ${wordCount} words (target: 350-450)`);
    console.log(`Paragraphs: ${paragraphs.length}`);
    console.log(`Second Person: ${hasSecondPerson ? '✅ Yes' : '❌ No'}`);
    console.log(`Choices: ${narrative.choices.length}\n`);

    // Check if narrative follows new structure
    console.log('Structure Validation:');
    const firstParagraph = paragraphs[0] || '';
    const lastParagraph = paragraphs[paragraphs.length - 1] || '';

    // Check for character/setting establishment keywords
    const hasCharacterEstablishment =
      /\byou(?:'ve| have|'re| are)|\byour .+ (role|job|position|life)/i.test(firstParagraph);
    const hasSettingDetails = /\b(market|shop|street|hall|building|bridge|tower|plaza)/i.test(
      firstParagraph
    );
    const hasWorldBuilding =
      /\b(every|each|always|often|daily|morning|evening)/i.test(firstParagraph);

    console.log(
      `  Character Establishment: ${hasCharacterEstablishment ? '✅ Found in P1' : '⚠️  Not clear'}`
    );
    console.log(
      `  Setting Details: ${hasSettingDetails ? '✅ Found in P1' : '⚠️  Not clear'}`
    );
    console.log(
      `  World-building Context: ${hasWorldBuilding ? '✅ Found in P1' : '⚠️  Not clear'}`
    );

    // Display full narrative
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📖 FULL NARRATIVE');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(narrative.narrative);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('⚔️  CHOICES');
    console.log('═══════════════════════════════════════════════════════\n');
    narrative.choices.forEach((choice, index) => {
      console.log(`${index + 1}. [${choice.approach.toUpperCase()}] ${choice.text}`);
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ TEST COMPLETED SUCCESSFULLY');
    console.log('═══════════════════════════════════════════════════════');

    // Summary
    console.log('\n📋 Summary:');
    console.log(`  ✓ World generation: Working (GPT-3.5-turbo)`);
    console.log(`  ✓ Narrative generation: Working (GPT-3.5-turbo)`);
    console.log(`  ✓ Word count: ${wordCount >= 350 && wordCount <= 450 ? 'Within target' : 'Outside target'}`);
    console.log(`  ✓ Second person: ${hasSecondPerson ? 'Correct' : 'Incorrect'}`);
    console.log(`  ✓ Choices generated: ${narrative.choices.length}`);
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
testNarrativeGeneration();
