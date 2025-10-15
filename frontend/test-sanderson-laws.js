/**
 * Test Suite for Sanderson's Laws Implementation
 *
 * Run with: node test-sanderson-laws.js
 */

import {
  detectMagicStyle,
  validateHardMagic,
  validateSoftMagic,
  getMagicGuidance,
  SANDERSON_FIRST_LAW,
  SANDERSON_SECOND_LAW
} from './src/lib/sandersonLaws.js';

// ============================================================================
// TEST DATA
// ============================================================================

const detectionTests = [
  {
    name: 'Explicit Hard Magic Request',
    input: 'A world with hard magic system with clear rules and limitations',
    expectedStyle: 'hard',
    expectedConfidence: '>0.7'
  },
  {
    name: 'Explicit Soft Magic Request',
    input: 'A world with soft magic, mysterious and unexplained like Tolkien',
    expectedStyle: 'soft',
    expectedConfidence: '>0.7'
  },
  {
    name: 'Sanderson Style',
    input: 'Create a Sanderson-style magic system with costs and constraints',
    expectedStyle: 'hard',
    expectedConfidence: '>0.7'
  },
  {
    name: 'Tolkien Style',
    input: 'Tolkien-style mysterious magic with ancient power',
    expectedStyle: 'soft',
    expectedConfidence: '>0.7'
  },
  {
    name: 'No Magic Mentioned',
    input: 'A world with diverse cultures and interesting geography',
    expectedStyle: 'hard', // Default
    expectedConfidence: '0.5'
  },
  {
    name: 'Atmospheric Magic',
    input: 'A world where ancient, enigmatic forces shape reality in unknowable ways',
    expectedStyle: 'soft',
    expectedConfidence: '>0.5'
  },
  {
    name: 'System with Rules',
    input: 'A magic system where users must follow specific rules and pay costs',
    expectedStyle: 'hard',
    expectedConfidence: '>0.7'
  }
];

const hardMagicValidationTests = [
  {
    name: 'Complete Hard Magic System',
    magicSystem: {
      name: 'Allomancy',
      constraints: [
        'Only works on metals',
        'Cannot affect living minds directly'
      ],
      costs: 'Requires 1 gram of metal per 5 minutes of use',
      vulnerabilities: ['Aluminum blocks all effects', 'Salt water disrupts'],
      socialRestrictions: ['Guild licensing required (500 gold)', 'Nobility only']
    },
    expectedValid: true,
    expectedScore: '>8'
  },
  {
    name: 'Missing Costs',
    magicSystem: {
      constraints: ['Cannot affect minds', 'Limited range'],
      vulnerabilities: ['Iron nullifies'],
      socialRestrictions: ['Government controlled']
    },
    expectedValid: false,
    expectedMissing: ['costs']
  },
  {
    name: 'Missing Social Restrictions',
    magicSystem: {
      constraints: ['Cannot create matter', 'Only works on sight'],
      costs: 'Drains 1 year of lifespan per use',
      vulnerabilities: ['Darkness blocks it']
    },
    expectedValid: false,
    expectedMissing: ['social restrictions']
  },
  {
    name: 'Costs Without Numbers',
    magicSystem: {
      constraints: ['Limited to metals', 'Cannot affect organic matter'],
      costs: 'Requires energy',
      vulnerabilities: ['Aluminum blocks'],
      socialRestrictions: ['Licensed only']
    },
    expectedValid: false,
    expectedMissing: ['costs need specific measurements']
  },
  {
    name: 'Only One Constraint',
    magicSystem: {
      constraints: ['Cannot affect minds'],
      costs: 'Uses 50 energy units per cast',
      vulnerabilities: ['Iron disrupts'],
      socialRestrictions: ['Registered practitioners only']
    },
    expectedValid: false,
    expectedMissing: ['constraints (need 2+)']
  }
];

const softMagicValidationTests = [
  {
    name: 'Good Soft Magic (Mysterious)',
    magicSystem: {
      name: 'The Old Ways',
      description: 'Ancient, mysterious forces that stir in forgotten places. The old magic responds to need, not command, and its ways are unknowable to mortals.'
    },
    expectedValid: true,
    expectedIssues: 0
  },
  {
    name: 'Bad Soft Magic (Too Specific)',
    magicSystem: {
      name: 'Mystical Power',
      description: 'Magic that costs 100 energy per use and has rule-based limitations',
      costs: 100,
      rules: ['Cannot work on Tuesdays', 'Limited to 50 meters']
    },
    expectedValid: false,
    expectedIssues: '>1'  // At least 2 issues expected
  },
  {
    name: 'Deus Ex Machina Violation',
    magicSystem: {
      name: 'Divine Intervention',
      description: 'Ancient magic that solves conflicts and saves the day when heroes are in trouble'
    },
    expectedValid: false,
    expectedIssues: '>0'
  },
  {
    name: 'Good Atmospheric Magic',
    magicSystem: {
      name: 'The Weaving',
      description: 'Enigmatic forces of wonder and terror that ancient wizards wielded in ways we can no longer fathom. The magic feels alive, dangerous, unknowable.'
    },
    expectedValid: true,
    expectedIssues: 0
  }
];

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

function testDetection(testCase, index) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`DETECTION TEST ${index + 1}: ${testCase.name}`);
  console.log('='.repeat(70));

  console.log(`\nInput: "${testCase.input}"`);
  console.log(`Expected Style: ${testCase.expectedStyle}`);
  console.log(`Expected Confidence: ${testCase.expectedConfidence}`);

  const result = detectMagicStyle(testCase.input);

  console.log(`\n${'─'.repeat(70)}`);
  console.log('RESULT:');
  console.log('─'.repeat(70));
  console.log(`Style: ${result.style}`);
  console.log(`Confidence: ${result.confidence.toFixed(2)}`);
  console.log(`Detected: ${result.detected}`);
  console.log(`Reason: ${result.reason}`);

  // Validation
  console.log(`\n${'─'.repeat(70)}`);
  console.log('VALIDATION:');
  console.log('─'.repeat(70));

  let passed = true;

  // Check style
  if (result.style === testCase.expectedStyle) {
    console.log(`✅ Style correct: ${result.style}`);
  } else {
    console.log(`❌ Style incorrect: got ${result.style}, expected ${testCase.expectedStyle}`);
    passed = false;
  }

  // Check confidence
  if (testCase.expectedConfidence.startsWith('>')) {
    const threshold = parseFloat(testCase.expectedConfidence.substring(1));
    if (result.confidence > threshold) {
      console.log(`✅ Confidence in range: ${result.confidence.toFixed(2)} > ${threshold}`);
    } else {
      console.log(`❌ Confidence too low: ${result.confidence.toFixed(2)} (expected > ${threshold})`);
      passed = false;
    }
  } else {
    const expected = parseFloat(testCase.expectedConfidence);
    if (Math.abs(result.confidence - expected) < 0.1) {
      console.log(`✅ Confidence matches: ${result.confidence.toFixed(2)}`);
    } else {
      console.log(`❌ Confidence incorrect: ${result.confidence.toFixed(2)} (expected ${expected})`);
      passed = false;
    }
  }

  console.log(`\n${passed ? '✅' : '❌'} Test ${passed ? 'PASSED' : 'FAILED'}`);
  return passed;
}

function testHardMagicValidation(testCase, index) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`HARD MAGIC VALIDATION TEST ${index + 1}: ${testCase.name}`);
  console.log('='.repeat(70));

  console.log(`\nMagic System:`);
  console.log(JSON.stringify(testCase.magicSystem, null, 2));

  const result = validateHardMagic(testCase.magicSystem);

  console.log(`\n${'─'.repeat(70)}`);
  console.log('RESULT:');
  console.log('─'.repeat(70));
  console.log(`Valid: ${result.valid}`);
  console.log(`Score: ${result.score}/10`);
  if (result.missing.length > 0) {
    console.log(`Missing: ${result.missing.join(', ')}`);
  }

  // Validation
  console.log(`\n${'─'.repeat(70)}`);
  console.log('VALIDATION:');
  console.log('─'.repeat(70));

  let passed = true;

  // Check validity
  if (result.valid === testCase.expectedValid) {
    console.log(`✅ Validity correct: ${result.valid}`);
  } else {
    console.log(`❌ Validity incorrect: got ${result.valid}, expected ${testCase.expectedValid}`);
    passed = false;
  }

  // Check score if expected
  if (testCase.expectedScore) {
    if (testCase.expectedScore.startsWith('>')) {
      const threshold = parseFloat(testCase.expectedScore.substring(1));
      if (result.score > threshold) {
        console.log(`✅ Score in range: ${result.score} > ${threshold}`);
      } else {
        console.log(`❌ Score too low: ${result.score} (expected > ${threshold})`);
        passed = false;
      }
    }
  }

  // Check missing items
  if (testCase.expectedMissing) {
    const allFound = testCase.expectedMissing.every(item =>
      result.missing.some(m => m.includes(item))
    );
    if (allFound) {
      console.log(`✅ Missing items correctly identified: ${testCase.expectedMissing.join(', ')}`);
    } else {
      console.log(`❌ Missing items not identified correctly`);
      console.log(`   Expected to find: ${testCase.expectedMissing.join(', ')}`);
      console.log(`   Actually missing: ${result.missing.join(', ')}`);
      passed = false;
    }
  }

  console.log(`\n${passed ? '✅' : '❌'} Test ${passed ? 'PASSED' : 'FAILED'}`);
  return passed;
}

function testSoftMagicValidation(testCase, index) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`SOFT MAGIC VALIDATION TEST ${index + 1}: ${testCase.name}`);
  console.log('='.repeat(70));

  console.log(`\nMagic System:`);
  console.log(JSON.stringify(testCase.magicSystem, null, 2));

  const result = validateSoftMagic(testCase.magicSystem);

  console.log(`\n${'─'.repeat(70)}`);
  console.log('RESULT:');
  console.log('─'.repeat(70));
  console.log(`Valid: ${result.valid}`);
  console.log(`Score: ${result.score}/10`);
  if (result.issues.length > 0) {
    console.log(`Issues:`);
    result.issues.forEach(issue => console.log(`  - ${issue}`));
  }

  // Validation
  console.log(`\n${'─'.repeat(70)}`);
  console.log('VALIDATION:');
  console.log('─'.repeat(70));

  let passed = true;

  // Check validity
  if (result.valid === testCase.expectedValid) {
    console.log(`✅ Validity correct: ${result.valid}`);
  } else {
    console.log(`❌ Validity incorrect: got ${result.valid}, expected ${testCase.expectedValid}`);
    passed = false;
  }

  // Check issue count
  if (testCase.expectedIssues !== undefined) {
    if (typeof testCase.expectedIssues === 'number') {
      if (result.issues.length === testCase.expectedIssues) {
        console.log(`✅ Issue count correct: ${result.issues.length}`);
      } else {
        console.log(`❌ Issue count incorrect: got ${result.issues.length}, expected ${testCase.expectedIssues}`);
        passed = false;
      }
    } else if (testCase.expectedIssues.startsWith('>')) {
      const threshold = parseInt(testCase.expectedIssues.substring(1));
      if (result.issues.length > threshold) {
        console.log(`✅ Issue count in range: ${result.issues.length} > ${threshold}`);
      } else {
        console.log(`❌ Issue count too low: ${result.issues.length} (expected > ${threshold})`);
        passed = false;
      }
    }
  }

  console.log(`\n${passed ? '✅' : '❌'} Test ${passed ? 'PASSED' : 'FAILED'}`);
  return passed;
}

// ============================================================================
// HELPER FUNCTION TESTS
// ============================================================================

function testHelperFunctions() {
  console.log(`\n${'='.repeat(70)}`);
  console.log('HELPER FUNCTION TESTS');
  console.log('='.repeat(70));

  let passed = true;

  // Test getMagicGuidance with hard magic
  console.log('\nTest: getMagicGuidance (hard magic)');
  const hardGuidance = getMagicGuidance('A world with magic system and clear rules');
  if (hardGuidance.style === 'hard' && hardGuidance.guidance.includes('SANDERSON\'S SECOND LAW')) {
    console.log('  ✅ Hard magic guidance generated correctly');
  } else {
    console.log('  ❌ Hard magic guidance failed');
    passed = false;
  }

  // Test getMagicGuidance with soft magic
  console.log('\nTest: getMagicGuidance (soft magic)');
  const softGuidance = getMagicGuidance('A world with soft magic and mystery');
  if (softGuidance.style === 'soft' && softGuidance.guidance.includes('SANDERSON\'S FIRST LAW')) {
    console.log('  ✅ Soft magic guidance generated correctly');
  } else {
    console.log('  ❌ Soft magic guidance failed');
    passed = false;
  }

  // Test constant definitions
  console.log('\nTest: Sanderson\'s Laws constants');
  if (SANDERSON_FIRST_LAW && SANDERSON_FIRST_LAW.name) {
    console.log('  ✅ First Law constant defined');
  } else {
    console.log('  ❌ First Law constant missing');
    passed = false;
  }

  if (SANDERSON_SECOND_LAW && SANDERSON_SECOND_LAW.limitationTypes) {
    console.log('  ✅ Second Law constant defined');
    console.log(`     Has ${Object.keys(SANDERSON_SECOND_LAW.limitationTypes).length} limitation types`);
  } else {
    console.log('  ❌ Second Law constant missing');
    passed = false;
  }

  return passed;
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('SANDERSON\'S LAWS IMPLEMENTATION TEST SUITE');
console.log('='.repeat(70));

// Run detection tests
console.log('\n\n' + '█'.repeat(70));
console.log('MAGIC STYLE DETECTION TESTS');
console.log('█'.repeat(70));
const detectionResults = detectionTests.map((test, i) => testDetection(test, i));

// Run hard magic validation tests
console.log('\n\n' + '█'.repeat(70));
console.log('HARD MAGIC VALIDATION TESTS');
console.log('█'.repeat(70));
const hardResults = hardMagicValidationTests.map((test, i) => testHardMagicValidation(test, i));

// Run soft magic validation tests
console.log('\n\n' + '█'.repeat(70));
console.log('SOFT MAGIC VALIDATION TESTS');
console.log('█'.repeat(70));
const softResults = softMagicValidationTests.map((test, i) => testSoftMagicValidation(test, i));

// Run helper function tests
console.log('\n\n' + '█'.repeat(70));
console.log('HELPER FUNCTION TESTS');
console.log('█'.repeat(70));
const helperPassed = testHelperFunctions();

// Summary
console.log('\n\n' + '='.repeat(70));
console.log('TEST SUMMARY');
console.log('='.repeat(70));

const detectionPassed = detectionResults.filter(r => r).length;
const detectionFailed = detectionResults.filter(r => !r).length;

const hardPassed = hardResults.filter(r => r).length;
const hardFailed = hardResults.filter(r => !r).length;

const softPassed = softResults.filter(r => r).length;
const softFailed = softResults.filter(r => !r).length;

console.log(`\nDetection Tests: ${detectionTests.length} total`);
console.log(`  Passed: ${detectionPassed} ✅`);
console.log(`  Failed: ${detectionFailed} ${detectionFailed > 0 ? '❌' : ''}`);

console.log(`\nHard Magic Validation: ${hardMagicValidationTests.length} total`);
console.log(`  Passed: ${hardPassed} ✅`);
console.log(`  Failed: ${hardFailed} ${hardFailed > 0 ? '❌' : ''}`);

console.log(`\nSoft Magic Validation: ${softMagicValidationTests.length} total`);
console.log(`  Passed: ${softPassed} ✅`);
console.log(`  Failed: ${softFailed} ${softFailed > 0 ? '❌' : ''}`);

console.log(`\nHelper Functions: ${helperPassed ? 'PASSED ✅' : 'FAILED ❌'}`);

const totalPassed = detectionPassed + hardPassed + softPassed + (helperPassed ? 1 : 0);
const totalTests = detectionTests.length + hardMagicValidationTests.length +
                   softMagicValidationTests.length + 1;

console.log(`\nOverall: ${totalPassed}/${totalTests} tests passed (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);

if (totalPassed === totalTests) {
  console.log('\n🎉 All tests passed!');
} else {
  console.log('\n⚠️ Some tests failed. Review output above.');
}

console.log('\n');

// Exit with appropriate code
process.exit(totalPassed === totalTests ? 0 : 1);
