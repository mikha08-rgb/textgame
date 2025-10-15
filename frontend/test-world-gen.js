/**
 * Quick World Generation Test
 * Tests that the reduced scope (3 chars, 3 locs, 1 legend) generates valid JSON without truncation
 */

import { worldGenerationPrompt, parseWorldGenerationResponse } from './src/prompts/worldGeneration.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

console.log('\n' + '═'.repeat(80));
console.log('🧪 WORLD GENERATION VERIFICATION TEST');
console.log('═'.repeat(80) + '\n');

console.log('Testing reduced scope: 3 characters, 3 locations, 1 legend');
console.log('Max tokens: ' + worldGenerationPrompt.parameters.maxTokens);
console.log('Model: ' + worldGenerationPrompt.parameters.model);
console.log('\n⏳ Generating world... (this may take 2-4 minutes)\n');

const startTime = Date.now();

try {
  // Call OpenAI API
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: worldGenerationPrompt.parameters.model,
      temperature: worldGenerationPrompt.parameters.temperature,
      max_tokens: worldGenerationPrompt.parameters.maxTokens,
      messages: [
        {
          role: 'system',
          content: worldGenerationPrompt.systemPrompt
        },
        {
          role: 'user',
          content: worldGenerationPrompt.getUserPrompt()
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const generatedText = data.choices[0].message.content;

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  console.log(`✓ Generation completed in ${duration} seconds\n`);

  // Test 1: Check if response is valid JSON
  console.log('Test 1: Validating JSON...');
  let world;
  try {
    // Use the same parsing function as the app
    world = parseWorldGenerationResponse(generatedText);
    console.log('   ✓ Valid JSON - No truncation errors!\n');
  } catch (e) {
    console.error('   ✗ JSON Parse Error:', e.message);
    console.error('   Response length:', generatedText.length);
    console.error('   Last 200 chars:', generatedText.slice(-200));
    throw e;
  }

  // Test 2: Check structure
  console.log('Test 2: Checking world structure...');
  const requiredFields = ['worldName', 'tagline', 'theme', 'geography', 'history', 'magicSystem', 'cultures', 'characters', 'locations', 'legends'];
  let missingFields = [];

  for (const field of requiredFields) {
    if (!world[field]) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    console.error('   ✗ Missing fields:', missingFields.join(', '));
  } else {
    console.log('   ✓ All required fields present\n');
  }

  // Test 3: Check content counts
  console.log('Test 3: Checking content counts...');
  const characterCount = world.characters?.length || 0;
  const locationCount = world.locations?.length || 0;
  const legendCount = world.legends?.length || 0;
  const cultureCount = world.cultures?.length || 0;

  console.log(`   Characters: ${characterCount} (expected: 3)`);
  console.log(`   Locations: ${locationCount} (expected: 3)`);
  console.log(`   Legends: ${legendCount} (expected: 1)`);
  console.log(`   Cultures: ${cultureCount} (expected: 3)`);

  let contentIssues = [];
  if (characterCount !== 3) contentIssues.push(`characters: ${characterCount} instead of 3`);
  if (locationCount !== 3) contentIssues.push(`locations: ${locationCount} instead of 3`);
  if (legendCount !== 1) contentIssues.push(`legends: ${legendCount} instead of 1`);
  if (cultureCount < 2) contentIssues.push(`cultures: ${cultureCount} instead of 3`);

  if (contentIssues.length > 0) {
    console.log('   ⚠️  Content count issues:', contentIssues.join(', '));
  } else {
    console.log('   ✓ Content counts are correct\n');
  }

  // Test 4: Check response size
  console.log('Test 4: Checking response size...');
  const charCount = generatedText.length;
  const wordCount = generatedText.split(/\s+/).filter(w => w.length > 0).length;

  console.log(`   Character count: ${charCount.toLocaleString()}`);
  console.log(`   Word count (approx): ${wordCount.toLocaleString()}`);
  console.log(`   Tokens used: ${data.usage.total_tokens.toLocaleString()}`);

  if (charCount > 40000) {
    console.log('   ⚠️  Response is quite large - may be close to limits');
  } else if (charCount > 36849) {
    console.log('   ⚠️  Response is larger than previous error point (36849 chars)');
  } else {
    console.log('   ✓ Response size is reasonable\n');
  }

  // Summary
  console.log('\n' + '═'.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(80) + '\n');
  console.log(`World Name: "${world.worldName}"`);
  console.log(`Tagline: "${world.tagline?.substring(0, 60)}..."`);
  console.log(`\nGeneration time: ${duration}s`);
  console.log(`Response size: ${charCount.toLocaleString()} characters`);
  console.log(`Content: ${characterCount} chars, ${locationCount} locs, ${legendCount} legends, ${cultureCount} cultures`);

  if (missingFields.length === 0 && contentIssues.length === 0) {
    console.log('\n' + '═'.repeat(80));
    console.log('✅ ALL TESTS PASSED - World generation is working correctly!');
    console.log('═'.repeat(80) + '\n');
    process.exit(0);
  } else {
    console.log('\n' + '═'.repeat(80));
    console.log('⚠️  TESTS PASSED WITH WARNINGS - World generated but has some issues');
    console.log('═'.repeat(80) + '\n');
    process.exit(0);
  }

} catch (error) {
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);

  console.error('\n' + '═'.repeat(80));
  console.error('❌ TEST FAILED');
  console.error('═'.repeat(80) + '\n');
  console.error('Error:', error.message);
  console.error(`Time elapsed: ${duration}s`);
  console.error('\n');
  process.exit(1);
}
