/**
 * Simple Node.js script to test world generation
 * Run with: OPENAI_API_KEY="your-key" node test-simple-debug.js
 */

import { worldGenerationPrompt, parseWorldGenerationResponse } from './src/prompts/worldGeneration.js';

const API_KEY = process.env.OPENAI_API_KEY;

async function testWorldGeneration() {
  console.log('🧪 Testing World Generation\n');

  const userConcept = 'A volcanic archipelago where merchants trade obsidian';

  console.log('📝 User Concept:', userConcept);
  console.log('🤖 Model:', worldGenerationPrompt.parameters.model);
  console.log('🎲 Temperature:', worldGenerationPrompt.parameters.temperature);
  console.log('📊 Max Tokens:', worldGenerationPrompt.parameters.maxTokens);
  console.log('\n⏳ Calling OpenAI API...\n');

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: worldGenerationPrompt.parameters.model,
        messages: [
          { role: 'system', content: worldGenerationPrompt.systemPrompt },
          { role: 'user', content: `${worldGenerationPrompt.getUserPrompt()}\n\nUSER'S CONCEPT: ${userConcept}` }
        ],
        temperature: worldGenerationPrompt.parameters.temperature,
        max_tokens: worldGenerationPrompt.parameters.maxTokens,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API error: ${errorData.error?.message}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;

    console.log('✅ API Response Received\n');
    console.log('📏 Response Length:', generatedText.length, 'chars');
    console.log('🎯 Tokens Used:', data.usage);
    console.log('\n📄 First 500 chars:');
    console.log(generatedText.substring(0, 500));
    console.log('\n📄 Last 500 chars:');
    console.log(generatedText.substring(Math.max(0, generatedText.length - 500)));

    // Try to parse
    console.log('\n🔍 Attempting to parse...\n');

    try {
      const parseResult = parseWorldGenerationResponse(generatedText);
      const world = parseResult.world;

      console.log('✅ PARSING SUCCESSFUL!\n');
      console.log('🌍 World Name:', world.worldName);
      console.log('📚 Cultures:', world.cultures?.length || 0);
      console.log('👤 Characters:', world.characters?.length || 0);
      console.log('🏛️ Locations:', world.locations?.length || 0);
      console.log('📜 Legends:', world.legends?.length || 0);

      // Show structure
      console.log('\n📋 World Object Keys:');
      Object.keys(world).forEach(key => {
        const value = world[key];
        const type = Array.isArray(value) ? `Array(${value.length})` : typeof value;
        console.log(`  - ${key}: ${type}`);
      });

    } catch (parseError) {
      console.error('❌ PARSING FAILED:\n');
      console.error(parseError.message);
      console.error('\nStack:', parseError.stack);

      // Try basic JSON parse to see structure
      try {
        const rawJSON = JSON.parse(generatedText);
        console.log('\n📋 Raw JSON Keys:', Object.keys(rawJSON));
        console.log('\nFirst 3 keys with values:');
        Object.keys(rawJSON).slice(0, 3).forEach(key => {
          const val = rawJSON[key];
          console.log(`  ${key}:`, typeof val === 'string' ? val.substring(0, 100) : val);
        });
      } catch (jsonError) {
        console.error('\n❌ Not even valid JSON:', jsonError.message);
      }
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
  }
}

testWorldGeneration();
