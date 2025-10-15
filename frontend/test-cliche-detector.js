/**
 * Test Suite for Cliché Detector
 *
 * Run with: node test-cliche-detector.js
 */

import { detectCliches, formatDetectionResult, getClicheBreakdown } from './src/lib/clicheDetector.js';

// ============================================================================
// TEST DATA
// ============================================================================

const testCases = [
  {
    name: 'Heavy Clichés - Fantasy',
    text: `The Ancient Order of the Mystic Circle guards the Sacred Crystal of Eternity.
           The chosen one must fulfill the prophecy foretold by the ancient wizards.
           Light vs. darkness, good versus evil, the dark lord rises.
           The mysterious prophecy speaks of an orphan boy who will save the kingdom.`,
    genre: 'fantasy',
    expectedScore: '<5',
    expectedCliches: '>10'
  },
  {
    name: 'Highly Original - Fantasy',
    text: `The Copper Alloyers Guild controls tin production through strict licensing.
           Their magic drains 2 years of lifespan per casting. Salt water disrupts all effects.
           The kingdom of Valdris trades bronze ingots with the northern highlands.
           Three moons orbit the planet, each causing different tidal patterns.`,
    genre: 'fantasy',
    expectedScore: '>9',
    expectedCliches: '0',
    note: 'Highly specific content with concrete details should score very high'
  },
  {
    name: 'Original Content - Fantasy',
    text: `Membrane weavers manipulate the barriers between quantum states, but each fold
           requires 127 grams of deuterium and causes permanent cellular damage. The practice
           is banned in 14 of 19 city-states. In Khellvost, licensed weavers pay 40% taxes.
           The Guild of Boundary Dancers maintains genealogical records dating back 347 years.`,
    genre: 'fantasy',
    expectedScore: '>9',
    expectedCliches: '0'
  },
  {
    name: 'Heavy Clichés - Sci-Fi',
    text: `The evil AI launched a robot uprising. Time travel paradox threatens reality.
           Faster than light warp drive enables distant planet exploration.
           The alien invasion begins on a dystopian future Earth.
           Teleportation and force fields protect the space station.`,
    genre: 'scifi',
    expectedScore: '<5',
    expectedCliches: '>8'
  },
  {
    name: 'Original Content - Sci-Fi',
    text: `Neural substrate mining requires 40 petaflops per extraction cycle. The Kepler-7
           colony exports 2.3 million tons of processed cortex matrices annually. Transit
           through compressed spacetime costs 14,000 credits per light-year, paid in
           blockchain-verified quantum tokens. Only 7 corporations hold mining licenses.`,
    genre: 'scifi',
    expectedScore: '>9',
    expectedCliches: '0-1'
  },
  {
    name: 'Heavy Clichés - Horror',
    text: `The ancient evil lurks in the haunted mansion built on an Indian burial ground.
           A dark and stormy night brings teenagers alone to investigate strange noises.
           The cursed object causes demonic possession. Blood sacrifice required.
           They split up to search the abandoned asylum.`,
    genre: 'horror',
    expectedScore: '<4',
    expectedCliches: '>10'
  },
  {
    name: 'Descriptor Repetition Test',
    text: `The ancient castle held ancient secrets. Ancient wizards left ancient runes.
           The ancient prophecy spoke of ancient times. Ancient evil from ancient days.`,
    genre: 'fantasy',
    expectedScore: '<6',
    expectedCliches: '>6',
    note: 'Should detect "ancient" repeated 8 times'
  }
];

// ============================================================================
// TEST RUNNER
// ============================================================================

function runTest(testCase, index) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`TEST ${index + 1}: ${testCase.name}`);
  console.log('='.repeat(70));

  console.log(`\nInput Text (${testCase.text.length} chars):`);
  console.log(testCase.text.substring(0, 150) + '...');

  console.log(`\nGenre: ${testCase.genre}`);
  console.log(`Expected Score: ${testCase.expectedScore}`);
  console.log(`Expected Clichés: ${testCase.expectedCliches}`);

  if (testCase.note) {
    console.log(`Note: ${testCase.note}`);
  }

  // Run detection
  const result = detectCliches(testCase.text, testCase.genre);

  console.log(`\n${'─'.repeat(70)}`);
  console.log('RESULTS:');
  console.log('─'.repeat(70));

  console.log(formatDetectionResult(result));

  console.log(`\n${'─'.repeat(70)}`);
  console.log('DETAILED BREAKDOWN:');
  console.log('─'.repeat(70));

  const breakdown = getClicheBreakdown(result);

  for (const [category, data] of Object.entries(breakdown)) {
    console.log(`\n${category.toUpperCase()} (${data.count} matches, weight: ${data.weight}):`);
    for (const example of data.examples) {
      console.log(`  - "${example.text}"${example.repetitionCount > 1 ? ` (${example.repetitionCount}x)` : ''}`);
    }
  }

  // Validation
  console.log(`\n${'─'.repeat(70)}`);
  console.log('VALIDATION:');
  console.log('─'.repeat(70));

  let passed = true;

  // Validate score range
  if (testCase.expectedScore.includes('<')) {
    const threshold = parseFloat(testCase.expectedScore.replace('<', ''));
    if (result.score >= threshold) {
      console.log(`❌ FAIL: Score ${result.score} should be < ${threshold}`);
      passed = false;
    } else {
      console.log(`✅ PASS: Score ${result.score} is < ${threshold}`);
    }
  } else if (testCase.expectedScore.includes('>')) {
    const threshold = parseFloat(testCase.expectedScore.replace('>', ''));
    if (result.score <= threshold) {
      console.log(`❌ FAIL: Score ${result.score} should be > ${threshold}`);
      passed = false;
    } else {
      console.log(`✅ PASS: Score ${result.score} is > ${threshold}`);
    }
  } else if (testCase.expectedScore.includes('-')) {
    const [min, max] = testCase.expectedScore.split('-').map(parseFloat);
    if (result.score < min || result.score > max) {
      console.log(`❌ FAIL: Score ${result.score} should be between ${min}-${max}`);
      passed = false;
    } else {
      console.log(`✅ PASS: Score ${result.score} is between ${min}-${max}`);
    }
  }

  // Validate cliché count
  if (testCase.expectedCliches.includes('<')) {
    const threshold = parseInt(testCase.expectedCliches.replace('<', ''));
    if (result.summary.total >= threshold) {
      console.log(`❌ FAIL: ${result.summary.total} clichés found, should be < ${threshold}`);
      passed = false;
    } else {
      console.log(`✅ PASS: ${result.summary.total} clichés found (< ${threshold})`);
    }
  } else if (testCase.expectedCliches.includes('>')) {
    const threshold = parseInt(testCase.expectedCliches.replace('>', ''));
    if (result.summary.total <= threshold) {
      console.log(`❌ FAIL: ${result.summary.total} clichés found, should be > ${threshold}`);
      passed = false;
    } else {
      console.log(`✅ PASS: ${result.summary.total} clichés found (> ${threshold})`);
    }
  } else if (testCase.expectedCliches.includes('-')) {
    const [min, max] = testCase.expectedCliches.split('-').map(parseInt);
    if (result.summary.total < min || result.summary.total > max) {
      console.log(`❌ FAIL: ${result.summary.total} clichés found, should be between ${min}-${max}`);
      passed = false;
    } else {
      console.log(`✅ PASS: ${result.summary.total} clichés found (${min}-${max})`);
    }
  } else if (testCase.expectedCliches === '0') {
    if (result.summary.total !== 0) {
      console.log(`❌ FAIL: ${result.summary.total} clichés found, expected 0`);
      passed = false;
    } else {
      console.log(`✅ PASS: No clichés found`);
    }
  }

  console.log(`\n${passed ? '✅' : '❌'} Test ${passed ? 'PASSED' : 'FAILED'}`);

  return passed;
}

// ============================================================================
// MAIN
// ============================================================================

console.log('\n' + '='.repeat(70));
console.log('CLICHÉ DETECTOR TEST SUITE');
console.log('='.repeat(70));

const results = testCases.map((testCase, index) => runTest(testCase, index));

console.log('\n\n' + '='.repeat(70));
console.log('TEST SUMMARY');
console.log('='.repeat(70));

const passed = results.filter(r => r).length;
const failed = results.filter(r => !r).length;

console.log(`Total Tests: ${results.length}`);
console.log(`Passed: ${passed} ✅`);
console.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`);
console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All tests passed!');
} else {
  console.log('\n⚠️ Some tests failed. Review output above.');
}

console.log('\n');

// Exit with appropriate code
process.exit(failed === 0 ? 0 : 1);
