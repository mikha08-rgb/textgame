/**
 * Test script to verify world generation randomization
 * Generates 5 prompts and extracts domain combinations
 */

import { worldGenerationPrompt } from './src/prompts/worldGeneration.js';

console.log('Testing World Generation Randomization\n');
console.log('=' .repeat(60));

const prompts = [];
const domainCombinations = [];

// Generate 5 prompts
for (let i = 0; i < 5; i++) {
  const prompt = worldGenerationPrompt.getUserPrompt();
  prompts.push(prompt);

  // Extract domain combination from the prompt
  const match = prompt.match(/PROMPT: (.+?) & (.+?) —/);
  if (match) {
    const domain1 = match[1];
    const domain2 = match[2];
    domainCombinations.push(`${domain1} & ${domain2}`);
  }
}

// Display results
console.log('\nGenerated Domain Combinations:\n');
domainCombinations.forEach((combo, i) => {
  console.log(`${i + 1}. ${combo}`);
});

// Check for uniqueness
const unique = new Set(domainCombinations);
console.log('\n' + '='.repeat(60));
console.log(`\nTotal generated: ${domainCombinations.length}`);
console.log(`Unique combinations: ${unique.size}`);

if (unique.size === domainCombinations.length) {
  console.log('\n✅ SUCCESS: All domain combinations are unique!');
} else {
  console.log('\n⚠️  WARNING: Some domain combinations repeated');
  console.log('This is statistically possible but check if randomization is working');
}

// Show if we got good variety
console.log('\nDomain variety check:');
const allDomains = domainCombinations.flatMap(c => c.split(' & '));
const uniqueDomains = new Set(allDomains);
console.log(`Total unique domains used: ${uniqueDomains.size} out of ${allDomains.length} slots`);
console.log('Domains seen:', Array.from(uniqueDomains).sort().join(', '));
