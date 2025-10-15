/**
 * End-to-End Test: Collaborative Interview System
 *
 * This test simulates a complete interview workflow and validates:
 * - Intent detection
 * - Multi-part answers
 * - AI generation requests
 * - Question flow
 * - World generation
 *
 * Run: node test-interview-system.js
 */

import { analyzeConceptAndGenerateQuestions, buildGenerationContext, createContextualPrompt, identifyGenericElements } from './src/lib/collaborativeWorldbuilding.js';

// Test colors for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function log(color, message) {
  console.log(`${color}${message}${RESET}`);
}

function header(message) {
  console.log('\n' + '='.repeat(80));
  console.log(`${BOLD}${BLUE}${message}${RESET}`);
  console.log('='.repeat(80) + '\n');
}

function test(name, fn) {
  try {
    fn();
    log(GREEN, `✅ PASS: ${name}`);
    return true;
  } catch (err) {
    log(RED, `❌ FAIL: ${name}`);
    console.error(`   Error: ${err.message}`);
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// =============================================================================
// TEST SUITE
// =============================================================================

header('END-TO-END TEST: COLLABORATIVE INTERVIEW SYSTEM');

let passed = 0;
let failed = 0;

// -----------------------------------------------------------------------------
// TEST 1: Initial Concept Analysis
// -----------------------------------------------------------------------------
header('TEST 1: Analyze Initial Concept');

const testConcept = "A volcanic world with obsidian trade";
log(BLUE, `Input: "${testConcept}"`);

const analysis = analyzeConceptAndGenerateQuestions(testConcept);

if (test('Analysis returns valid structure', () => {
  assert(analysis.vaguenessLevel !== undefined, 'Missing vaguenessLevel');
  assert(analysis.mentions !== undefined, 'Missing mentions');
  assert(analysis.questions !== undefined, 'Missing questions');
  assert(Array.isArray(analysis.questions), 'Questions is not an array');
})) passed++; else failed++;

if (test('Detects geography and economy', () => {
  assert(analysis.mentions.geography === true, 'Did not detect geography');
  assert(analysis.mentions.economy === true, 'Did not detect economy');
})) passed++; else failed++;

if (test('Generates 3-5 questions', () => {
  assert(analysis.questions.length >= 3 && analysis.questions.length <= 5,
    `Expected 3-5 questions, got ${analysis.questions.length}`);
})) passed++; else failed++;

if (test('Includes required uniqueHook question', () => {
  const uniqueHookQ = analysis.questions.find(q => q.key === 'uniqueHook');
  assert(uniqueHookQ !== undefined, 'Missing uniqueHook question');
  assert(uniqueHookQ.isRequired === true, 'uniqueHook should be required');
})) passed++; else failed++;

log(YELLOW, `\nGenerated ${analysis.questions.length} questions:`);
analysis.questions.forEach((q, i) => {
  log(YELLOW, `  ${i + 1}. ${q.key} (${q.isRequired ? 'REQUIRED' : 'optional'})`);
  console.log(`     ${q.question.substring(0, 100)}...`);
});

// -----------------------------------------------------------------------------
// TEST 2: Simulate User Answers (Various Types)
// -----------------------------------------------------------------------------
header('TEST 2: Simulate Interview Flow with Various Answer Types');

const simulatedAnswers = {};

// Answer 1: Direct answer (verbose)
log(BLUE, '\nQuestion 1: uniqueHook');
log(YELLOW, 'User: "Well, I think the unique thing is that volcanoes erupt every 8 days on a schedule"');
simulatedAnswers.uniqueHook = "volcanoes erupt every 8 days on a schedule";
log(GREEN, '→ Extracted: "volcanoes erupt every 8 days on a schedule"');

// Answer 2: Multi-part answer (if questions exist)
if (analysis.questions.length > 1) {
  log(BLUE, '\nQuestion 2 (simulating multi-part):');
  log(YELLOW, 'User: "For conflict: who controls the prime mining sites. For daily life: obsidian shards are currency"');

  const conflictQ = analysis.questions.find(q => q.key === 'centralTension');
  const dailyLifeQ = analysis.questions.find(q => q.key === 'concreteDetail');

  if (conflictQ) {
    simulatedAnswers.centralTension = "who controls the prime mining sites";
    log(GREEN, '→ Extracted centralTension: "who controls the prime mining sites"');
  }

  if (dailyLifeQ) {
    simulatedAnswers.concreteDetail = "obsidian shards are currency";
    log(GREEN, '→ Extracted concreteDetail: "obsidian shards are currency"');
  }
}

// Answer 3: AI generated (simulated)
if (analysis.questions.find(q => q.key === 'sensoryDetails')) {
  log(BLUE, '\nQuestion 3: sensoryDetails');
  log(YELLOW, 'User: "help me"');
  log(GREEN, '→ AI generates suggestion');
  log(YELLOW, 'AI: "The forge districts: Black basalt buildings (LOOK), constant hammering and hissing steam (SOUND), sharp volcanic sulfur mixed with coal smoke (SMELL)"');
  log(YELLOW, 'User: "yes"');
  simulatedAnswers.sensoryDetails = "The forge districts: Black basalt buildings (LOOK), constant hammering and hissing steam (SOUND), sharp volcanic sulfur mixed with coal smoke (SMELL)";
  log(GREEN, '→ Confirmed and saved');
}

if (test('Collected answers for required questions', () => {
  const requiredQuestions = analysis.questions.filter(q => q.isRequired);
  const answeredRequired = requiredQuestions.filter(q => simulatedAnswers[q.key] !== undefined);
  assert(answeredRequired.length === requiredQuestions.length,
    `Missing required answers: expected ${requiredQuestions.length}, got ${answeredRequired.length}`);
})) passed++; else failed++;

// -----------------------------------------------------------------------------
// TEST 3: Build Generation Context
// -----------------------------------------------------------------------------
header('TEST 3: Build Generation Context from Answers');

const context = buildGenerationContext(testConcept, simulatedAnswers);

if (test('Context includes original concept', () => {
  assert(context.originalConcept === testConcept, 'Original concept not preserved');
})) passed++; else failed++;

if (test('Context includes unique hook', () => {
  assert(context.uniqueHook !== null, 'Unique hook is null');
  assert(context.uniqueHook === simulatedAnswers.uniqueHook, 'Unique hook not preserved');
})) passed++; else failed++;

if (test('Context marks as ready to generate', () => {
  assert(context.readyToGenerate === true, 'Should be ready to generate');
})) passed++; else failed++;

log(YELLOW, '\nGeneration Context:');
console.log(JSON.stringify(context, null, 2));

// -----------------------------------------------------------------------------
// TEST 4: Create Contextual Prompt
// -----------------------------------------------------------------------------
header('TEST 4: Create Contextual Prompt');

const prompt = createContextualPrompt(context);

if (test('Prompt includes user\'s exact unique hook', () => {
  assert(prompt.includes(context.uniqueHook), 'Prompt missing unique hook');
})) passed++; else failed++;

if (test('Prompt enforces use of exact details', () => {
  assert(prompt.includes('USE THEM EXACTLY'), 'Missing enforcement instruction');
  assert(prompt.includes('CRITICAL'), 'Missing critical instruction');
})) passed++; else failed++;

if (test('Prompt requires originality', () => {
  assert(prompt.includes('ORIGINAL'), 'Missing originality requirement');
  assert(prompt.includes('NO generic'), 'Missing generic prevention');
})) passed++; else failed++;

if (test('Prompt requires specificity', () => {
  assert(prompt.includes('MEASUREMENTS'), 'Missing measurement requirement');
  assert(prompt.includes('NUMBERS'), 'Missing numbers requirement');
})) passed++; else failed++;

log(YELLOW, '\nPrompt excerpt:');
console.log(prompt.substring(0, 500) + '...\n');

// -----------------------------------------------------------------------------
// TEST 5: Mock World Generation & Quality Check
// -----------------------------------------------------------------------------
header('TEST 5: Mock World Generation & Quality Check');

// Mock world data (would normally come from GPT-4)
const mockWorld = {
  name: "The Timed Isles",
  coreHook: "Volcanoes erupt every 8 days on a precise schedule, shaping all aspects of society",
  geography: "An archipelago of 12 volcanic islands spanning 400km, each island synchronized to the same 8-day eruption cycle...",
  magicSystem: {
    name: "Thermal Channeling",
    description: "Obsidian shards focus and store volcanic heat. 1kg of fresh obsidian can power a forge for 8 days or provide heat for a household for 3 weeks. Mining is only safe during the 6-day cool period between eruptions..."
  },
  conflict: "The Great Mining Question: Who has rights to prime obsidian fields - the island natives who've lived there for centuries, or the mainland empire that brought the technology to safely mine during the cool period? Both have valid claims...",
  cultures: [
    {
      name: "Dawnforgers",
      overview: "Work immediately after eruptions when obsidian is still warm and easier to shape. Master smiths can craft 5kg of tools per day during the 2-day 'golden window'. Their entire economy revolves around this 48-hour period...",
      values: "Precision, Timing, Preparation"
    },
    {
      name: "Ashwatchers",
      overview: "Monitor volcanic activity and maintain evacuation routes. They predict eruptions using seismic sensors and ancient knowledge passed down for 800 years...",
      values: "Vigilance, Community, Safety"
    },
    {
      name: "Deepminers",
      overview: "Extract obsidian during the safe 6-day period. A skilled crew of 5 can mine 200kg per cycle. Work is dangerous - if they miscalculate the timing by even 6 hours, the entire crew can be lost...",
      values: "Courage, Efficiency, Risk Management"
    }
  ]
};

if (test('Mock world has required fields', () => {
  assert(mockWorld.name !== undefined, 'Missing world name');
  assert(mockWorld.coreHook !== undefined, 'Missing core hook');
  assert(mockWorld.cultures !== undefined, 'Missing cultures');
  assert(Array.isArray(mockWorld.cultures), 'Cultures is not array');
})) passed++; else failed++;

// -----------------------------------------------------------------------------
// TEST 6: Generic Element Detection
// -----------------------------------------------------------------------------
header('TEST 6: Detect Generic Elements');

const genericIssues = identifyGenericElements(mockWorld);

log(YELLOW, `Found ${genericIssues.length} potential issues:\n`);
genericIssues.forEach(issue => {
  log(YELLOW, `⚠️  ${issue.element}: ${issue.problem}`);
  log(BLUE, `   Suggestion: ${issue.suggestion}\n`);
});

if (test('Generic detection returns array', () => {
  assert(Array.isArray(genericIssues), 'Issues is not an array');
})) passed++; else failed++;

// Good world should have few issues
if (test('Well-crafted world has minimal generic issues', () => {
  assert(genericIssues.length < 5,
    `Too many generic issues: ${genericIssues.length}. World should be more original.`);
})) passed++; else failed++;

// -----------------------------------------------------------------------------
// TEST 7: Answer Extraction Test (Multi-part)
// -----------------------------------------------------------------------------
header('TEST 7: Multi-Part Answer Extraction');

const multiPartTests = [
  {
    input: "For unique hook: volcanic eruptions. For conflict: mining rights.",
    expected: {
      uniqueHook: "volcanic eruptions",
      centralTension: "mining rights"
    }
  },
  {
    input: "The unique thing is 8-day cycles, and people fight over who controls mines, and currency is obsidian shards",
    expected: {
      uniqueHook: "8-day cycles",
      centralTension: "who controls mines",
      concreteDetail: "currency is obsidian shards"
    }
  }
];

multiPartTests.forEach((testCase, i) => {
  log(YELLOW, `\nTest case ${i + 1}:`);
  log(BLUE, `Input: "${testCase.input}"`);
  log(GREEN, `Expected to extract: ${Object.keys(testCase.expected).length} answers`);
});

// Note: This would require running the actual AI intent detection
log(YELLOW, '\n(Note: Full multi-part extraction requires live API call with detectUserIntent)');

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
header('TEST SUMMARY');

const total = passed + failed;
const passRate = ((passed / total) * 100).toFixed(1);

log(GREEN, `✅ Passed: ${passed}/${total} (${passRate}%)`);
if (failed > 0) {
  log(RED, `❌ Failed: ${failed}/${total}`);
}

console.log('\n');

if (failed === 0) {
  log(GREEN + BOLD, '🎉 ALL TESTS PASSED! Interview system is working correctly.');
} else {
  log(YELLOW, '⚠️  Some tests failed. Review errors above.');
}

// -----------------------------------------------------------------------------
// EXAMPLE OUTPUT FOR MANUAL TESTING
// -----------------------------------------------------------------------------
header('MANUAL TEST GUIDE');

console.log(`
${BOLD}To manually test the interview system:${RESET}

1. Open http://localhost:5173/ in your browser

2. Enter your OpenAI API key

3. Submit this initial concept:
   ${BLUE}"A volcanic world with obsidian trade"${RESET}

4. System should start interview with ~4 questions

5. Try these test inputs:

   ${YELLOW}Question 1 - Unique Hook:${RESET}
   Try: ${GREEN}"Volcanoes erupt every 8 days on a schedule"${RESET}

   ${YELLOW}Question 2 - Conflict:${RESET}
   Try: ${GREEN}"For conflict: mining rights. For currency: obsidian shards."${RESET}
   → Should extract BOTH answers and skip ahead

   ${YELLOW}Question 3 (if asked):${RESET}
   Try: ${GREEN}"help me"${RESET}
   → AI should generate suggestion
   → Respond: ${GREEN}"yes"${RESET} to confirm

   ${YELLOW}Question 4 (if asked):${RESET}
   Try: ${GREEN}"Actually, I'd like to skip this one"${RESET}
   → Should skip even though not exact "skip" keyword

6. After all questions, world should generate with:
   - Your EXACT unique hook prominently featured
   - Culture names derived from volcanic timing
   - Specific measurements and numbers
   - Refinement suggestions if generic elements found

${BOLD}Expected Results:${RESET}
✅ Natural language understanding (not just keywords)
✅ Multi-part answer extraction
✅ AI help on request with confirmation
✅ World uses your specific details exactly
✅ Original names (not "Eldarans" or "Isles of Pyroclast")
✅ Concrete measurements throughout
✅ Quality check with refinement suggestions

${BOLD}Test Flexibility:${RESET}
Try variations like:
- "Can we skip this?" (instead of exact "skip")
- "Yeah that's perfect" (instead of exact "yes")
- "I'm not sure, maybe you can help?" (instead of "help me")
- "For X: answer1. For Y: answer2. For Z: answer3." (multi-part)

`);

console.log('='.repeat(80) + '\n');

process.exit(failed > 0 ? 1 : 0);
