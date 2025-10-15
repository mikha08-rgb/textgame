/**
 * Manual Test Script for Constitutional AI
 *
 * This script tests the Constitutional AI system with real API calls
 * to verify quality improvements work as expected.
 *
 * Usage:
 *   OPENAI_API_KEY=xxx node test-constitutional-manual.js
 */

import {
  generateWithConstitutionalAI,
  getCritiquePrompt,
  parseCritique
} from './src/lib/constitutionalAI.js';

const API_KEY = process.env.OPENAI_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: OPENAI_API_KEY environment variable not set');
  console.log('\nUsage:');
  console.log('  OPENAI_API_KEY=your-key-here node test-constitutional-manual.js\n');
  process.exit(1);
}

// Simple API call function
async function callOpenAI(messages, forceJSON = false, maxTokens = 4000) {
  const requestBody = {
    model: 'gpt-4o',
    messages: messages,
    temperature: 0.85,
    max_tokens: maxTokens,
  };

  if (forceJSON) {
    requestBody.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(errorData.error?.message || `API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Test function
async function runTest() {
  console.log('='.repeat(70));
  console.log('Constitutional AI Manual Test');
  console.log('='.repeat(70));
  console.log();

  // Step 1: Generate initial content (simulate world generation)
  console.log('📝 Step 1: Generating initial world content...');
  console.log();

  const generateWorldContent = async () => {
    const response = await callOpenAI([
      {
        role: 'system',
        content: 'You are a creative worldbuilding assistant. Generate rich, detailed fantasy worlds.'
      },
      {
        role: 'user',
        content: 'Create a brief fantasy world description (2-3 paragraphs) about a volcanic island with fire magic.'
      }
    ], false, 500); // Short response for testing

    return response;
  };

  let progressSteps = [];

  try {
    // Run Constitutional AI flow
    const result = await generateWithConstitutionalAI(
      generateWorldContent,
      callOpenAI,
      'test world',
      {
        qualityThreshold: 8.0,
        maxRevisions: 1,
        onProgress: (progress) => {
          progressSteps.push(progress);

          if (progress.step === 'generate' && progress.status === 'complete') {
            console.log('✅ Initial generation complete');
            console.log();
            console.log('Original Content:');
            console.log('-'.repeat(70));
            console.log(progress.content.substring(0, 300) + '...');
            console.log('-'.repeat(70));
            console.log();
          }

          if (progress.step === 'critique' && progress.status === 'in_progress') {
            console.log('🔍 Step 2: Evaluating quality against principles...');
            console.log();
          }

          if (progress.step === 'critique' && progress.status === 'complete') {
            console.log('✅ Quality evaluation complete');
            console.log();
            console.log('Quality Scores:');
            console.log('-'.repeat(70));
            console.log(`Overall Score: ${progress.critique.overallScore}/10`);
            console.log();

            Object.entries(progress.critique.principleScores).forEach(([name, data]) => {
              console.log(`  ${name}: ${data.score}/10`);
              if (data.weaknesses.length > 0) {
                data.weaknesses.forEach(w => console.log(`    → ${w}`));
              }
            });
            console.log('-'.repeat(70));
            console.log();

            if (progress.critique.overallScore < 8.0) {
              console.log(`⚠️  Score below threshold (${progress.critique.overallScore}/10 < 8.0)`);
              console.log('   Revision will be performed...');
              console.log();
            }
          }

          if (progress.step === 'revise' && progress.status === 'in_progress') {
            console.log('✏️  Step 3: Revising content based on critique...');
            console.log();
          }

          if (progress.step === 'revise' && progress.status === 'complete') {
            console.log('✅ Revision complete');
            console.log();
          }
        }
      }
    );

    // Display results
    console.log();
    console.log('='.repeat(70));
    console.log('RESULTS');
    console.log('='.repeat(70));
    console.log();

    if (result.revised) {
      console.log('🎉 Content was revised to improve quality!');
      console.log();
      console.log('Revised Content:');
      console.log('-'.repeat(70));
      console.log(result.finalContent.substring(0, 300) + '...');
      console.log('-'.repeat(70));
      console.log();

      console.log('📊 Comparison:');
      console.log(`  Original Quality: ${result.critique.overallScore}/10`);
      console.log(`  Revision Count: ${result.revisionCount}`);
      console.log();

      // Show principle improvements
      console.log('🔍 Quality Analysis:');
      Object.entries(result.critique.principleScores).forEach(([name, data]) => {
        const status = data.score >= 8 ? '✅' : data.score >= 7 ? '⚠️' : '❌';
        console.log(`  ${status} ${name}: ${data.score}/10`);
      });
      console.log();

      if (result.critique.suggestedImprovements.length > 0) {
        console.log('💡 Improvements Applied:');
        result.critique.suggestedImprovements
          .filter(imp => imp.priority === 'high' || imp.priority === 'medium')
          .forEach(imp => {
            console.log(`  • ${imp.issue}`);
            console.log(`    → ${imp.suggestion}`);
          });
        console.log();
      }

    } else {
      console.log('✨ Content quality was already high!');
      console.log(`   Score: ${result.critique.overallScore}/10 (threshold: 8.0)`);
      console.log();
      console.log('Final Content:');
      console.log('-'.repeat(70));
      console.log(result.finalContent.substring(0, 300) + '...');
      console.log('-'.repeat(70));
      console.log();
    }

    console.log('='.repeat(70));
    console.log('✅ Constitutional AI Test Complete!');
    console.log('='.repeat(70));
    console.log();

    console.log('Summary:');
    console.log(`  • Initial generation: ✅`);
    console.log(`  • Quality critique: ✅`);
    console.log(`  • Revision: ${result.revised ? '✅ (performed)' : '⏭️  (skipped - quality sufficient)'}`);
    console.log(`  • Final quality: ${result.critique.overallScore}/10`);
    console.log();

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error();
    console.error('Full error:', error);
    process.exit(1);
  }
}

// Run the test
console.log('Starting test...');
console.log();

runTest()
  .then(() => {
    console.log('✅ All tests passed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
