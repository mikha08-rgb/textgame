/**
 * Quality Check Script
 * Tests world generation and analyzes output quality
 */

import { worldGenerationPromptShort as worldGenerationPrompt, parseWorldGenerationResponse } from './src/prompts/worldGenerationShort.js';
import { detectCliches } from './src/lib/clicheDetector.js';

const API_KEY = process.env.OPENAI_API_KEY;

async function testQuality() {
  console.log('🧪 Testing World Generation Quality\n');

  const testConcept = 'A volcanic archipelago where merchants trade obsidian';

  console.log('📝 Concept:', testConcept);
  console.log('⏳ Generating world...\n');

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
          { role: 'user', content: worldGenerationPrompt.getUserPrompt(testConcept) }
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

    console.log('✅ Generation complete');
    console.log('📊 Tokens used:', data.usage);
    console.log('📏 Output length:', generatedText.length, 'chars\n');

    // Parse
    const parseResult = parseWorldGenerationResponse(generatedText);
    const world = parseResult.world;

    console.log('🌍 World Name:', world.worldName);
    console.log('📖 Tagline:', world.tagline);
    console.log('\n🔍 QUALITY ANALYSIS:\n');

    // Check for common issues
    const issues = [];

    // 1. Check world name for clichés
    if (world.worldName.match(/^The\s+/i)) {
      issues.push('❌ World name starts with "The" (cliché pattern)');
    }
    if (world.worldName.match(/ancient|dark|shadow|mystic|forbidden|eternal/i)) {
      issues.push('❌ World name contains overused adjective');
    }

    // 2. Check theme for specificity
    const themeWordCount = world.theme.split(/\s+/).length;
    console.log(`Theme length: ${themeWordCount} words`);
    if (themeWordCount < 100) {
      issues.push(`⚠️  Theme too short (${themeWordCount} words, should be 150-250)`);
    }

    // Check for vague words
    const vagueWords = ['mysterious', 'ancient', 'shadowy', 'forbidden', 'ethereal', 'arcane', 'mystical'];
    const foundVague = vagueWords.filter(word =>
      world.theme.toLowerCase().includes(word)
    );
    if (foundVague.length > 0) {
      issues.push(`❌ Theme contains vague words: ${foundVague.join(', ')}`);
    }

    // 3. Check for specific numbers
    const hasNumbers = /\d+/.test(world.theme);
    if (!hasNumbers) {
      issues.push('⚠️  Theme lacks specific numbers/measurements');
    }

    // 4. Check magic system
    if (world.magicSystem) {
      console.log(`\nMagic System: ${world.magicSystem.name}`);

      if (world.magicSystem.name.match(/^The\s+/i)) {
        issues.push('❌ Magic system name starts with "The"');
      }

      if (world.magicSystem.name.match(/weave|source|power|force|essence|energy/i)) {
        issues.push(`❌ Generic magic name: "${world.magicSystem.name}"`);
      }

      // Check for specific costs
      if (world.magicSystem.cost && !world.magicSystem.cost.match(/\d+/)) {
        issues.push('⚠️  Magic costs lack specific numbers');
      }
    }

    // 5. Check characters
    if (world.characters && world.characters.length > 0) {
      console.log(`\nCharacters: ${world.characters.length}`);
      world.characters.forEach(char => {
        if (!char.age || char.age === 0) {
          issues.push(`⚠️  Character "${char.name}" has no age`);
        }
      });
    }

    // 6. Run cliché detector
    const clicheAnalysis = detectCliches(JSON.stringify(world), 'fantasy');
    console.log(`\n✨ Overall Quality Score: ${clicheAnalysis.overallScore}%`);
    console.log(`📋 Clichés detected: ${clicheAnalysis.issues?.length || 0}`);

    if (clicheAnalysis.issues && clicheAnalysis.issues.length > 0) {
      console.log('\nTop clichés:');
      clicheAnalysis.issues.slice(0, 5).forEach(issue => {
        console.log(`  - "${issue.match}" (${issue.category})`);
      });
    }

    // Print all issues
    if (issues.length > 0) {
      console.log('\n⚠️  QUALITY ISSUES FOUND:\n');
      issues.forEach(issue => console.log(issue));
    } else {
      console.log('\n✅ No major quality issues detected!');
    }

    // Grade
    console.log('\n📊 FINAL GRADE:');
    if (clicheAnalysis.overallScore >= 80 && issues.length === 0) {
      console.log('🎉 EXCELLENT - MVP Ready!');
    } else if (clicheAnalysis.overallScore >= 60 && issues.length <= 3) {
      console.log('👍 GOOD - Minor improvements needed');
    } else {
      console.log('❌ NEEDS WORK - Not MVP ready');
      console.log('\nRECOMMENDATIONS:');
      console.log('1. Strengthen prompt to forbid specific patterns');
      console.log('2. Add few-shot examples of high-quality output');
      console.log('3. Implement validation and auto-retry on low quality');
    }

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
  }
}

testQuality();
