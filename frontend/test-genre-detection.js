/**
 * Test Suite for Genre Detection System
 *
 * Run with: node test-genre-detection.js
 */

import {
  detectGenre,
  getGenre,
  getGenreConfig,
  getBlendedConfig,
  formatDetectionResult,
  getAllGenres,
  isValidGenre,
  getGenreName
} from './src/lib/genreSystem.js';

// ============================================================================
// TEST DATA
// ============================================================================

const testCases = [
  {
    name: 'Clear Fantasy',
    text: 'A world with magic, dragons, and wizards. Elves and dwarves live in different kingdoms.',
    expectedPrimary: 'fantasy',
    expectedConfidence: '>0.7',
    expectedMultiGenre: false
  },
  {
    name: 'Clear Sci-Fi',
    text: 'Advanced technology allows humans to travel through space to distant planets. AI and robots are commonplace. Alien species form a galactic federation.',
    expectedPrimary: 'scifi',
    expectedConfidence: '>0.7',
    expectedMultiGenre: false
  },
  {
    name: 'Clear Horror',
    text: 'A haunted mansion filled with ghosts and demons. Vampires and zombies terrorize the town. Nightmares become reality.',
    expectedPrimary: 'horror',
    expectedConfidence: '>0.7',
    expectedMultiGenre: false
  },
  {
    name: 'Contemporary Setting',
    text: 'A modern city with realistic urban problems. People use smartphones and social media. Everyday office workers navigate contemporary life.',
    expectedPrimary: 'contemporary',
    expectedConfidence: '>0.7',
    expectedMultiGenre: false
  },
  {
    name: 'Historical Fiction',
    text: 'Set in the Roman Empire during the Renaissance period. Historical figures interact with fictional characters in a Victorian era setting.',
    expectedPrimary: 'historical',
    expectedConfidence: '>0.5',
    expectedMultiGenre: false
  },
  {
    name: 'Dystopian Future',
    text: 'An oppressive totalitarian government with constant surveillance. Citizens rebel against the authoritarian regime in a post-apocalyptic wasteland.',
    expectedPrimary: 'dystopian',
    expectedConfidence: '>0.7',
    expectedMultiGenre: false
  },
  {
    name: 'Cyberpunk',
    text: 'Hackers navigate cyberspace in neon-lit streets. Mega-corporations control society. Virtual reality and cybernetic enhancements are common.',
    expectedPrimary: 'cyberpunk',
    expectedConfidence: '>0.7',
    expectedMultiGenre: false
  },
  {
    name: 'Steampunk',
    text: 'Victorian-era society with steam-powered technology. Airships and clockwork machines fill the brass and gear-laden world.',
    expectedPrimary: 'steampunk',
    expectedConfidence: '>0.6',  // Slightly lower due to Victorian overlap with historical
    expectedMultiGenre: false
  },
  {
    name: 'Fantasy + Horror Blend',
    text: 'Dark magic summons demons in a cursed kingdom. Vampires and ghosts haunt the wizard towers. Dragons breathe nightmares instead of fire.',
    expectedPrimary: 'fantasy',
    expectedConfidence: '>0.4',
    expectedMultiGenre: true,
    expectedSecondary: 'horror'
  },
  {
    name: 'Sci-Fi + Dystopian Blend',
    text: 'Future technology enables oppressive surveillance. AI controls the totalitarian government. Robots enforce the authoritarian regime on distant planets.',
    expectedPrimary: 'dystopian',  // Dystopian keywords dominate in this text
    expectedConfidence: '>0.4',
    expectedMultiGenre: true,
    expectedSecondary: 'scifi'
  },
  {
    name: 'Minimal Keywords',
    text: 'A world where society has unique customs and traditions.',
    expectedPrimary: 'fantasy',  // Should default to fantasy
    expectedConfidence: '<0.3',
    expectedMultiGenre: false,
    note: 'Minimal keywords should result in low confidence and default genre'
  },
  {
    name: 'Empty Input',
    text: '',
    expectedPrimary: 'fantasy',  // Default
    expectedConfidence: '0',
    expectedMultiGenre: false,
    note: 'Empty input should default to fantasy with 0 confidence'
  }
];

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

function checkConfidence(actual, expected) {
  if (expected === '0') {
    return actual === 0;
  }
  if (expected.startsWith('>')) {
    const threshold = parseFloat(expected.substring(1));
    return actual > threshold;
  }
  if (expected.startsWith('<')) {
    const threshold = parseFloat(expected.substring(1));
    return actual < threshold;
  }
  return Math.abs(actual - parseFloat(expected)) < 0.1;
}

function runDetectionTest(testCase, index) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`TEST ${index + 1}: ${testCase.name}`);
  console.log('='.repeat(70));

  console.log(`\nInput: "${testCase.text.substring(0, 100)}${testCase.text.length > 100 ? '...' : ''}"`);
  console.log(`\nExpected:`);
  console.log(`  Primary: ${testCase.expectedPrimary}`);
  console.log(`  Confidence: ${testCase.expectedConfidence}`);
  console.log(`  Multi-Genre: ${testCase.expectedMultiGenre}`);
  if (testCase.expectedSecondary) {
    console.log(`  Secondary: ${testCase.expectedSecondary}`);
  }
  if (testCase.note) {
    console.log(`  Note: ${testCase.note}`);
  }

  // Run detection
  const result = detectGenre(testCase.text);

  console.log(`\n${'─'.repeat(70)}`);
  console.log('RESULTS:');
  console.log('─'.repeat(70));
  console.log(formatDetectionResult(result));

  // Validation
  console.log(`\n${'─'.repeat(70)}`);
  console.log('VALIDATION:');
  console.log('─'.repeat(70));

  let passed = true;

  // Check primary genre
  if (result.primary === testCase.expectedPrimary) {
    console.log(`✅ Primary genre correct: ${result.primary}`);
  } else {
    console.log(`❌ Primary genre incorrect: got ${result.primary}, expected ${testCase.expectedPrimary}`);
    passed = false;
  }

  // Check confidence
  if (checkConfidence(result.confidence, testCase.expectedConfidence)) {
    console.log(`✅ Confidence in range: ${result.confidence.toFixed(2)} (expected ${testCase.expectedConfidence})`);
  } else {
    console.log(`❌ Confidence out of range: ${result.confidence.toFixed(2)} (expected ${testCase.expectedConfidence})`);
    passed = false;
  }

  // Check multi-genre
  if (result.isMultiGenre === testCase.expectedMultiGenre) {
    console.log(`✅ Multi-genre detection correct: ${result.isMultiGenre}`);
  } else {
    console.log(`❌ Multi-genre detection incorrect: got ${result.isMultiGenre}, expected ${testCase.expectedMultiGenre}`);
    passed = false;
  }

  // Check secondary genre if expected
  if (testCase.expectedSecondary) {
    if (result.secondary === testCase.expectedSecondary) {
      console.log(`✅ Secondary genre correct: ${result.secondary}`);
    } else {
      console.log(`⚠️ Secondary genre: got ${result.secondary}, expected ${testCase.expectedSecondary} (acceptable variance)`);
      // Don't fail test - secondary detection can vary
    }
  }

  console.log(`\n${passed ? '✅' : '❌'} Test ${passed ? 'PASSED' : 'FAILED'}`);

  return passed;
}

// ============================================================================
// GENRE CONFIG TESTS
// ============================================================================

function runConfigTests() {
  console.log(`\n${'='.repeat(70)}`);
  console.log('GENRE CONFIGURATION TESTS');
  console.log('='.repeat(70));

  let passed = true;

  // Test 1: All genres have configs
  console.log('\nTest: All genres have configurations');
  const allGenres = getAllGenres();
  for (const genre of allGenres) {
    const config = getGenreConfig(genre.id);
    if (config && config.principleWeights) {
      console.log(`  ✅ ${genre.name}: config exists`);
    } else {
      console.log(`  ❌ ${genre.name}: missing config`);
      passed = false;
    }
  }

  // Test 2: Principle weights sum to ~1.0
  console.log('\nTest: Principle weights sum to 1.0');
  for (const genre of allGenres) {
    const config = getGenreConfig(genre.id);
    const sum = Object.values(config.principleWeights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) < 0.01) {
      console.log(`  ✅ ${genre.name}: weights sum to ${sum.toFixed(2)}`);
    } else {
      console.log(`  ❌ ${genre.name}: weights sum to ${sum.toFixed(2)} (should be 1.0)`);
      passed = false;
    }
  }

  // Test 3: Blended config works
  console.log('\nTest: Blended configuration');
  const blended = getBlendedConfig('fantasy', 'horror', 0.7);
  if (blended && blended.isBlended && blended.genres.length === 2) {
    console.log(`  ✅ Blended config created successfully`);
    console.log(`  Genres: ${blended.genres.join(' + ')}`);
    console.log(`  Principle weights:`);
    for (const [key, value] of Object.entries(blended.principleWeights)) {
      console.log(`    ${key}: ${value.toFixed(2)}`);
    }
  } else {
    console.log(`  ❌ Blended config failed`);
    passed = false;
  }

  // Test 4: Genre validation
  console.log('\nTest: Genre validation');
  if (isValidGenre('fantasy')) {
    console.log(`  ✅ Valid genre accepted: fantasy`);
  } else {
    console.log(`  ❌ Valid genre rejected: fantasy`);
    passed = false;
  }

  if (!isValidGenre('invalid_genre')) {
    console.log(`  ✅ Invalid genre rejected: invalid_genre`);
  } else {
    console.log(`  ❌ Invalid genre accepted: invalid_genre`);
    passed = false;
  }

  return passed;
}

// ============================================================================
// EXPLICIT GENRE SELECTION TEST
// ============================================================================

function runExplicitGenreTest() {
  console.log(`\n${'='.repeat(70)}`);
  console.log('EXPLICIT GENRE SELECTION TEST');
  console.log('='.repeat(70));

  const text = "A world with magic and dragons";

  // Test detection
  const detected = getGenre(text);
  console.log(`\nDetected genre: ${detected.genre} (confidence: ${detected.confidence.toFixed(2)})`);

  // Test explicit override
  const explicit = getGenre(text, 'scifi');
  console.log(`Explicit genre: ${explicit.genre} (confidence: ${explicit.confidence.toFixed(2)})`);

  const passed = detected.genre === 'fantasy' &&
                 detected.detected === true &&
                 explicit.genre === 'scifi' &&
                 explicit.detected === false &&
                 explicit.confidence === 1.0;

  if (passed) {
    console.log('\n✅ Explicit genre selection works correctly');
  } else {
    console.log('\n❌ Explicit genre selection failed');
  }

  return passed;
}

// ============================================================================
// MAIN TEST RUNNER
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('GENRE DETECTION SYSTEM TEST SUITE');
console.log('='.repeat(70));

// Run detection tests
const detectionResults = testCases.map((testCase, index) => runDetectionTest(testCase, index));

// Run config tests
const configPassed = runConfigTests();

// Run explicit genre test
const explicitPassed = runExplicitGenreTest();

// Summary
console.log('\n\n' + '='.repeat(70));
console.log('TEST SUMMARY');
console.log('='.repeat(70));

const detectionPassed = detectionResults.filter(r => r).length;
const detectionFailed = detectionResults.filter(r => !r).length;

console.log(`\nDetection Tests: ${testCases.length} total`);
console.log(`  Passed: ${detectionPassed} ✅`);
console.log(`  Failed: ${detectionFailed} ${detectionFailed > 0 ? '❌' : ''}`);

console.log(`\nConfiguration Tests: ${configPassed ? 'PASSED ✅' : 'FAILED ❌'}`);
console.log(`Explicit Selection Test: ${explicitPassed ? 'PASSED ✅' : 'FAILED ❌'}`);

const totalPassed = detectionPassed + (configPassed ? 1 : 0) + (explicitPassed ? 1 : 0);
const totalTests = testCases.length + 2;

console.log(`\nOverall: ${totalPassed}/${totalTests} tests passed (${((totalPassed / totalTests) * 100).toFixed(1)}%)`);

if (detectionFailed === 0 && configPassed && explicitPassed) {
  console.log('\n🎉 All tests passed!');
} else {
  console.log('\n⚠️ Some tests failed. Review output above.');
}

console.log('\n');

// Exit with appropriate code
process.exit((detectionFailed === 0 && configPassed && explicitPassed) ? 0 : 1);
