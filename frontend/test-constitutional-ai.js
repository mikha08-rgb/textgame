/**
 * Test script for Constitutional AI system
 *
 * Tests the generate → critique → revise loop
 */

import {
  WORLDBUILDING_PRINCIPLES,
  getCritiquePrompt,
  getRevisionPrompt,
  parseCritique,
  generateWithConstitutionalAI
} from './src/lib/constitutionalAI.js';

// Test 1: Verify principles are properly defined
function testPrinciples() {
  console.log('Test 1: Verifying principles...');

  const expectedPrinciples = ['specificity', 'implications', 'originality', 'consistency', 'mundaneGrounding'];
  const actualPrinciples = Object.keys(WORLDBUILDING_PRINCIPLES);

  if (actualPrinciples.length !== expectedPrinciples.length) {
    console.error('❌ Wrong number of principles');
    return false;
  }

  for (const principle of expectedPrinciples) {
    if (!WORLDBUILDING_PRINCIPLES[principle]) {
      console.error(`❌ Missing principle: ${principle}`);
      return false;
    }

    const p = WORLDBUILDING_PRINCIPLES[principle];
    if (!p.name || !p.description || !p.weight || !p.examples) {
      console.error(`❌ Principle ${principle} missing required fields`);
      return false;
    }
  }

  // Verify weights sum to 1.0
  const totalWeight = Object.values(WORLDBUILDING_PRINCIPLES)
    .reduce((sum, p) => sum + p.weight, 0);

  if (Math.abs(totalWeight - 1.0) > 0.01) {
    console.error(`❌ Weights sum to ${totalWeight}, expected 1.0`);
    return false;
  }

  console.log('✅ All principles properly defined');
  return true;
}

// Test 2: Verify critique prompt generation
function testCritiquePrompt() {
  console.log('\nTest 2: Verifying critique prompt...');

  const sampleContent = 'A magical world with dragons and wizards';
  const prompt = getCritiquePrompt(sampleContent, 'test world');

  if (!prompt.includes(sampleContent)) {
    console.error('❌ Prompt does not include content to critique');
    return false;
  }

  if (!prompt.includes('specificity') || !prompt.includes('Specificity')) {
    console.error('❌ Prompt missing specificity principle');
    return false;
  }

  if (!prompt.includes('JSON')) {
    console.error('❌ Prompt does not request JSON output');
    return false;
  }

  console.log('✅ Critique prompt properly formatted');
  return true;
}

// Test 3: Verify revision prompt generation
function testRevisionPrompt() {
  console.log('\nTest 3: Verifying revision prompt...');

  const originalContent = 'A magical world';
  const mockCritique = {
    overallScore: 6.5,
    principleScores: {
      specificity: {
        score: 5,
        strengths: ['Has a theme'],
        weaknesses: ['No concrete details', 'No measurements'],
        examples: ['"magical world" is too vague']
      },
      implications: {
        score: 6,
        strengths: [],
        weaknesses: ['No societal impact shown'],
        examples: []
      }
    },
    criticalIssues: ['Lacks specificity', 'No implications'],
    suggestedImprovements: [
      {
        issue: 'Too vague',
        suggestion: 'Add concrete measurements and details',
        priority: 'high'
      },
      {
        issue: 'No daily life',
        suggestion: 'Show how magic affects society',
        priority: 'medium'
      }
    ]
  };

  const prompt = getRevisionPrompt(originalContent, mockCritique, 'test world');

  if (!prompt.includes(originalContent)) {
    console.error('❌ Revision prompt does not include original content');
    return false;
  }

  if (!prompt.includes('6.5')) {
    console.error('❌ Revision prompt does not include overall score');
    return false;
  }

  if (!prompt.includes('high') || !prompt.includes('medium')) {
    console.error('❌ Revision prompt does not include priority improvements');
    return false;
  }

  console.log('✅ Revision prompt properly formatted');
  return true;
}

// Test 4: Verify critique parsing
function testCritiqueParsing() {
  console.log('\nTest 4: Verifying critique parsing...');

  // Test valid JSON
  const validResponse = `{
    "overallScore": 7.5,
    "principleScores": {
      "specificity": {
        "score": 8,
        "strengths": ["Good details"],
        "weaknesses": ["Could be more specific"],
        "examples": ["Example quote"]
      }
    },
    "criticalIssues": ["Issue 1"],
    "suggestedImprovements": [
      {
        "issue": "Something",
        "suggestion": "Fix it",
        "priority": "high"
      }
    ],
    "shouldRevise": false
  }`;

  try {
    const critique = parseCritique(validResponse);

    if (critique.overallScore !== 7.5) {
      console.error('❌ Failed to parse overall score');
      return false;
    }

    if (!critique.principleScores.specificity) {
      console.error('❌ Failed to parse principle scores');
      return false;
    }

    console.log('✅ Critique parsing works correctly');
  } catch (error) {
    console.error('❌ Failed to parse valid critique:', error.message);
    return false;
  }

  // Test JSON with markdown fences
  const markdownResponse = '```json\n' + validResponse + '\n```';

  try {
    const critique = parseCritique(markdownResponse);
    if (critique.overallScore !== 7.5) {
      console.error('❌ Failed to parse critique with markdown fences');
      return false;
    }
    console.log('✅ Markdown fence removal works');
  } catch (error) {
    console.error('❌ Failed to parse critique with markdown:', error.message);
    return false;
  }

  return true;
}

// Test 5: Test mock Constitutional AI flow
async function testConstitutionalAIFlow() {
  console.log('\nTest 5: Testing Constitutional AI flow...');

  let generateCalled = false;
  let critiqueCalled = false;
  let reviseCalled = false;

  // Mock generate function
  const mockGenerate = async () => {
    generateCalled = true;
    return 'Original content';
  };

  // Mock API call function
  const mockApiCall = async (messages, forceJSON) => {
    const systemMessage = messages[0].content || '';

    // Check if this is a critique request
    if (systemMessage.includes('quality critic')) {
      critiqueCalled = true;
      return JSON.stringify({
        overallScore: 7.0,
        principleScores: {
          specificity: { score: 7, strengths: [], weaknesses: [], examples: [] },
          implications: { score: 7, strengths: [], weaknesses: [], examples: [] },
          originality: { score: 7, strengths: [], weaknesses: [], examples: [] },
          consistency: { score: 7, strengths: [], weaknesses: [], examples: [] },
          mundaneGrounding: { score: 7, strengths: [], weaknesses: [], examples: [] }
        },
        criticalIssues: ['Needs improvement'],
        suggestedImprovements: [
          { issue: 'Test issue', suggestion: 'Test suggestion', priority: 'high' }
        ],
        shouldRevise: true
      });
    }

    // Check if this is a revision request
    if (systemMessage.includes('making revisions')) {
      reviseCalled = true;
      return 'Revised content';
    }

    return 'Unknown request';
  };

  try {
    const result = await generateWithConstitutionalAI(
      mockGenerate,
      mockApiCall,
      'test',
      {
        qualityThreshold: 8.0,
        maxRevisions: 1
      }
    );

    if (!generateCalled) {
      console.error('❌ Generate function was not called');
      return false;
    }

    if (!critiqueCalled) {
      console.error('❌ Critique was not called');
      return false;
    }

    if (!reviseCalled) {
      console.error('❌ Revise was not called (score was 7.0 < 8.0 threshold)');
      return false;
    }

    if (result.finalContent !== 'Revised content') {
      console.error('❌ Final content is not the revised version');
      return false;
    }

    if (!result.revised) {
      console.error('❌ Result should indicate content was revised');
      return false;
    }

    if (result.revisionCount !== 1) {
      console.error('❌ Revision count should be 1');
      return false;
    }

    console.log('✅ Constitutional AI flow works correctly');
    return true;

  } catch (error) {
    console.error('❌ Constitutional AI flow failed:', error.message);
    return false;
  }
}

// Test 6: Test skip revision when quality is good
async function testSkipRevision() {
  console.log('\nTest 6: Testing skip revision for high-quality content...');

  let reviseCalled = false;

  const mockGenerate = async () => 'High quality content';

  const mockApiCall = async (messages) => {
    const systemMessage = messages[0].content || '';

    if (systemMessage.includes('quality critic')) {
      // Return high score (no revision needed)
      return JSON.stringify({
        overallScore: 9.0,
        principleScores: {
          specificity: { score: 9, strengths: [], weaknesses: [], examples: [] },
          implications: { score: 9, strengths: [], weaknesses: [], examples: [] },
          originality: { score: 9, strengths: [], weaknesses: [], examples: [] },
          consistency: { score: 9, strengths: [], weaknesses: [], examples: [] },
          mundaneGrounding: { score: 9, strengths: [], weaknesses: [], examples: [] }
        },
        criticalIssues: [],
        suggestedImprovements: [],
        shouldRevise: false
      });
    }

    if (systemMessage.includes('making revisions')) {
      reviseCalled = true;
      return 'Should not be called';
    }

    return 'Unknown';
  };

  try {
    const result = await generateWithConstitutionalAI(
      mockGenerate,
      mockApiCall,
      'test',
      { qualityThreshold: 8.0, maxRevisions: 1 }
    );

    if (reviseCalled) {
      console.error('❌ Revision was called even though quality was high');
      return false;
    }

    if (result.revised) {
      console.error('❌ Result incorrectly indicates revision occurred');
      return false;
    }

    if (result.finalContent !== 'High quality content') {
      console.error('❌ Final content should be original (no revision)');
      return false;
    }

    console.log('✅ Correctly skips revision for high-quality content');
    return true;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('=================================');
  console.log('Constitutional AI System Tests');
  console.log('=================================\n');

  const results = [
    testPrinciples(),
    testCritiquePrompt(),
    testRevisionPrompt(),
    testCritiqueParsing(),
    await testConstitutionalAIFlow(),
    await testSkipRevision()
  ];

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n=================================');
  console.log(`Results: ${passed}/${total} tests passed`);
  console.log('=================================\n');

  if (passed === total) {
    console.log('✅ All tests passed! Constitutional AI system is working correctly.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please review the output above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
