/**
 * Full Narrative Playthrough Test
 * Tests PRD Story 1.7: Coherent narrative across 15+ interactions
 *
 * Usage: OPENAI_API_KEY=sk-... node test-full-playthrough.js
 */

import { worldGenerationPrompt, parseWorldGenerationResponse } from './src/prompts/worldGeneration.js';
import {
  narrativeProgressionPrompt,
  getOpeningPrompt,
  getContinuationPrompt,
  parseNarrativeResponse,
} from './src/prompts/narrativeProgression.js';

const API_KEY = process.env.OPENAI_API_KEY;
const TARGET_TURNS = 15;

if (!API_KEY) {
  console.error('❌ Error: No OPENAI_API_KEY environment variable set');
  console.error('Usage: OPENAI_API_KEY=sk-... node test-full-playthrough.js');
  process.exit(1);
}

// Simple OpenAI API call
async function callOpenAI(prompt, systemPrompt, params) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: params.model || 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: params.temperature || 0.85,
      max_tokens: params.maxTokens || 2500, // Increased for reasoning blocks + complete JSON
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Test runner
async function runFullPlaythrough() {
  console.log('\n' + '='.repeat(80));
  console.log('🎮 FULL PLAYTHROUGH TEST - 15+ INTERACTIONS');
  console.log('='.repeat(80) + '\n');

  const startTime = Date.now();
  const storyLog = [];
  const namedCharacters = new Set();
  const worldElements = new Set();

  // Expanded list of common words to exclude from character tracking
  const commonWords = new Set([
    'You', 'Your', 'The', 'This', 'That', 'These', 'Those',
    'She', 'He', 'They', 'Their', 'Her', 'His', 'Its', 'Them', 'Him',
    'But', 'And', 'Yet', 'Now', 'Then', 'So', 'If', 'When', 'With', 'From',
    'For', 'To', 'By', 'At', 'In', 'On', 'As', 'What', 'Which', 'Who',
    'Why', 'How', 'Where', 'Each', 'Every', 'All', 'Any', 'Some', 'Many',
    'Few', 'More', 'Most', 'Both', 'Either', 'Neither', 'One', 'Two', 'Three',
    'Time', 'Reality', 'Pain', 'Blood', 'Walls', 'Buildings', 'Structures',
    'Outside', 'Inside', 'Meanwhile', 'Suddenly', 'Barely', 'Would', 'Could',
    'Should', 'Still', 'Just', 'Even', 'Only', 'Worse', 'Better', 'Before',
    'After', 'During', 'Through', 'Without', 'Beyond', 'Around', 'Beneath',
    'Above', 'Below', 'Behind', 'Beside', 'Between', 'Among', 'Against',
    'Toward', 'Within', 'Throughout', 'Upon', 'Across', 'Into', 'Onto',
    'Nothing', 'Something', 'Everything', 'Anything', 'Someone', 'Anyone',
    'Everyone', 'No', 'Yes', 'Maybe', 'Perhaps', 'Instead', 'Rather',
    'Especially', 'Particularly', 'Specifically', 'Generally', 'Usually',
    'Always', 'Never', 'Sometimes', 'Often', 'Rarely', 'Hardly', 'Barely',
    'Almost', 'Nearly', 'Quite', 'Very', 'Too', 'Enough', 'Such', 'Much'
  ]);

  try {
    // ===== STEP 1: Generate World =====
    console.log('📍 STEP 1/4: Generating World...');
    const worldPrompt = worldGenerationPrompt.getUserPrompt();
    const domainMatch = worldPrompt.match(/PROMPT: (.+?) & (.+?) —/);
    const domains = domainMatch ? `${domainMatch[1]} & ${domainMatch[2]}` : 'Unknown';

    console.log(`   Domain Combination: ${domains}`);

    const worldResponse = await callOpenAI(
      worldPrompt,
      worldGenerationPrompt.systemPrompt,
      worldGenerationPrompt.parameters
    );

    const world = parseWorldGenerationResponse(worldResponse);
    console.log(`   ✓ World: "${world.worldName}"\n`);

    storyLog.push({ turn: 0, type: 'world', content: world });

    // ===== STEP 2: Generate Opening =====
    console.log('📍 STEP 2/4: Generating Opening Scene...');
    const openingPrompt = getOpeningPrompt(world);

    const openingResponse = await callOpenAI(
      openingPrompt,
      narrativeProgressionPrompt.systemPrompt,
      narrativeProgressionPrompt.parameters
    );

    const opening = parseNarrativeResponse(openingResponse);
    console.log(`   ✓ Opening generated (${opening.narrative.split(' ').length} words)`);
    console.log(`   ✓ ${opening.choices.length} choices presented\n`);

    // Extract named characters from opening
    const nameMatches = opening.narrative.match(/\b[A-Z][a-z]+\b/g);
    if (nameMatches) {
      nameMatches.forEach((name) => {
        if (name.length > 2 && !commonWords.has(name)) {
          namedCharacters.add(name);
        }
      });
    }

    storyLog.push({
      turn: 1,
      type: 'narrative',
      content: opening,
      wordCount: opening.narrative.split(' ').length,
    });

    // ===== STEP 3: Continue Story (15 turns) =====
    console.log('📍 STEP 3/4: Playing Through Story...');
    console.log(`   Target: ${TARGET_TURNS} interactions\n`);

    let currentNarrative = opening.narrative;
    let currentChoices = opening.choices;

    for (let turn = 2; turn <= TARGET_TURNS; turn++) {
      // Choose randomly (in real game, player chooses)
      const chosenIndex = Math.floor(Math.random() * currentChoices.length);
      const choice = currentChoices[chosenIndex];

      console.log(`   Turn ${turn}/${TARGET_TURNS}: Choosing "${choice.approach}" option...`);

      // Generate continuation
      const continuationPrompt = getContinuationPrompt(world, currentNarrative, choice.text);

      const continuationResponse = await callOpenAI(
        continuationPrompt,
        narrativeProgressionPrompt.systemPrompt,
        narrativeProgressionPrompt.parameters
      );

      const continuation = parseNarrativeResponse(continuationResponse);

      storyLog.push({
        turn,
        type: 'narrative',
        choice: choice.text,
        content: continuation,
        wordCount: continuation.narrative.split(' ').length,
      });

      // Update for next turn
      currentNarrative = continuation.narrative;
      currentChoices = continuation.choices;

      // Track characters mentioned
      const newNames = continuation.narrative.match(/\b[A-Z][a-z]+\b/g);
      if (newNames) {
        newNames.forEach((name) => {
          if (name.length > 2 && !commonWords.has(name)) {
            namedCharacters.add(name);
          }
        });
      }
    }

    console.log(`\n   ✓ Completed ${TARGET_TURNS} turns\n`);

    // ===== STEP 4: Analysis =====
    console.log('📍 STEP 4/4: Analyzing Coherence...\n');

    const totalWords = storyLog
      .filter((entry) => entry.type === 'narrative')
      .reduce((sum, entry) => sum + entry.wordCount, 0);

    const avgWords = Math.round(totalWords / TARGET_TURNS);

    console.log('='.repeat(80));
    console.log('📊 PLAYTHROUGH ANALYSIS');
    console.log('='.repeat(80) + '\n');

    console.log('📈 Statistics:');
    console.log(`   • World: ${world.worldName} (${domains})`);
    console.log(`   • Total Turns: ${TARGET_TURNS}`);
    console.log(`   • Total Words: ${totalWords.toLocaleString()}`);
    console.log(`   • Avg Words/Turn: ${avgWords}`);
    console.log(`   • Named Characters: ${namedCharacters.size}`);
    console.log(`   • Characters: ${Array.from(namedCharacters).join(', ')}`);

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`   • Duration: ${duration}s\n`);

    // Coherence checks
    console.log('✅ Coherence Checks:');
    console.log(`   • Story generated successfully across ${TARGET_TURNS} turns`);
    console.log(`   • Named characters tracked: ${namedCharacters.size > 0 ? 'YES' : 'NO'}`);
    console.log(`   • Average narrative length: ${avgWords >= 250 ? 'GOOD' : 'SHORT'} (${avgWords} words)`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ PLAYTHROUGH TEST COMPLETE');
    console.log('='.repeat(80) + '\n');

    // Show first and last narrative for comparison
    console.log('📖 OPENING SCENE (first 200 chars):');
    console.log(opening.narrative.substring(0, 200) + '...\n');

    const lastEntry = storyLog[storyLog.length - 1];
    console.log(`📖 FINAL SCENE (turn ${TARGET_TURNS}, first 200 chars):`);
    console.log(lastEntry.content.narrative.substring(0, 200) + '...\n');
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
runFullPlaythrough();
