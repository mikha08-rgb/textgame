# Progressive Generation Quick Reference

**For:** Frontend developers integrating the progressive generation backend
**Files:** `progressiveGeneration.js`, `worldExpansion.js`

---

## Quick Start

### 1. Import Functions

```javascript
// New progressive generation prompts
import {
  quickWorldPrompt,
  expandCulture,
  generateCharacter,
  generateLocation,
  generateLegend,
  exploreMagicSystem,
  exploreConflict,
  parseQuickWorld,
  parseCultureExpansion,
  parseCharacter,
  parseLocation,
  parseLegend,
  parseMagicSystemExpansion,
  parseConflictExpansion
} from './prompts/progressiveGeneration.js';

// Existing expansion prompts (updated for progressive strategy)
import {
  getCultureExpansionPrompt,
  getCharacterGenerationPrompt,
  getLocationGenerationPrompt,
  getLegendGenerationPrompt,
  parseExpansionResponse
} from './prompts/worldExpansion.js';
```

---

## Generation Workflow

### Step 1: Quick Initial World (30-40 seconds)

```javascript
// Generate quick world foundation
const userPrompt = quickWorldPrompt.getUserPrompt(userRequest);

const response = await callOpenAI([
  { role: 'system', content: quickWorldPrompt.systemPrompt },
  { role: 'user', content: userPrompt }
], true, 4000, 120000); // JSON mode, 4K tokens, 2min timeout

const world = parseQuickWorld(response);

// Result structure:
{
  worldName: "string",
  tagline: "string",
  coreHook: "string",
  geography: {
    overview: "string",
    majorLocations: [...]
  },
  magicSystem: {
    name: "string",
    mechanism: "string",
    cost: "string",
    example: "string"
  },
  cultures: [
    {
      name: "string",
      coreValues: "string",
      socialStructure: "string",
      relationshipToMagic: "string"
    }
  ],
  conflict: {
    name: "string",
    factions: ["string"],
    stakes: "string",
    whyNoCompromise: "string",
    impactOnCommonPeople: "string"
  }
}
```

### Step 2: User-Directed Expansions

#### Culture Expansion (600-800 words, 20-30 seconds)

```javascript
// Option A: Use progressiveGeneration.js (returns prompt object)
const { systemPrompt, userPrompt } = expandCulture(world, cultureName);
const response = await callOpenAI([
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userPrompt }
], true, 3000);
const expanded = parseCultureExpansion(response);

// Option B: Use worldExpansion.js (returns prompt string)
const prompt = getCultureExpansionPrompt(world, cultureName);
const response = await callOpenAI([
  { role: 'system', content: worldExpansionPrompt.systemPrompt },
  { role: 'user', content: prompt }
], true, 3000);
const expanded = parseExpansionResponse(response);

// Result structure:
{
  cultureName: "string",
  dailyLife: "string (200-250 words)",
  economy: "string (150-200 words)",
  governance: "string (100-150 words)",
  artsAndTraditions: "string (80-120 words)",
  notableFigures: [
    {
      name: "string",
      age: number,
      role: "string",
      description: "string",
      personality: "string",
      currentActions: "string"
    }
  ]
}
```

#### Character Generation (400 words, 15-25 seconds)

```javascript
const { systemPrompt, userPrompt } = generateCharacter(world, cultureName);
const response = await callOpenAI([
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userPrompt }
], true, 1500);
const character = parseCharacter(response);

// Result structure:
{
  name: "string",
  age: number,
  occupation: "string",
  culture: "string",
  physicalDescription: "string",
  personality: "string (100-120 words)",
  goal: "string (80-100 words)",
  worldElementInteraction: "string (80-100 words)",
  secret: "string (40-60 words)",
  backstory: "string (40-60 words)",
  distinctiveTrait: "string"
}
```

#### Location Generation (350 words, 15-20 seconds)

```javascript
const { systemPrompt, userPrompt } = generateLocation(world, cultureName);
const response = await callOpenAI([
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userPrompt }
], true, 1500);
const location = parseLocation(response);

// Result structure:
{
  name: "string",
  type: "string",
  location: "string",
  size: "string",
  description: "string (120-150 words)",
  uniqueElementManifestation: "string",
  inhabitants: "string (80-100 words)",
  currentSituation: "string (60-80 words)",
  memorableDetails: ["string", "string", "string", ...]
}
```

#### Legend Generation (450 words, 20-25 seconds)

```javascript
const { systemPrompt, userPrompt } = generateLegend(world);
const response = await callOpenAI([
  { role: 'system', content: systemPrompt },
  { role: 'user', content: userPrompt }
], true, 2000);
const legend = parseLegend(response);

// Result structure:
{
  title: "string",
  timeframe: "string",
  culturalOrigin: "string",
  knownAsTruthOrMyth: "string",
  story: "string (250-300 words)",
  moralOrLesson: "string (50-70 words)",
  culturalSignificance: "string (60-80 words)",
  truthBehindMyth: "string (40-60 words)"
}
```

---

## Error Handling

All parsers include robust error handling:

```javascript
try {
  const world = parseQuickWorld(response);
  // Use world data
} catch (error) {
  console.error('Failed to parse:', error.message);
  // Show user-friendly error
  // error.message includes context about what failed
}
```

Common issues handled automatically:
- Markdown code blocks (```json)
- Reasoning blocks (<reasoning>...</reasoning>)
- Trailing commas in JSON
- Newlines in string values
- Missing optional fields

---

## Token Budget Reference

| Operation | Input Tokens | Output Tokens | Total | Cost (GPT-4o) |
|-----------|-------------|---------------|-------|---------------|
| Quick World | ~1,200 | ~1,200-1,600 | ~2,400-2,800 | ~$0.03-0.04 |
| Culture Expansion | ~800-1,000 | ~1,200-1,600 | ~2,000-2,600 | ~$0.02-0.03 |
| Character | ~600-800 | ~800-1,000 | ~1,400-1,800 | ~$0.015-0.022 |
| Location | ~600-800 | ~700-900 | ~1,300-1,700 | ~$0.015-0.020 |
| Legend | ~700-900 | ~900-1,100 | ~1,600-2,000 | ~$0.018-0.024 |

**Total for typical session:**
- Initial world: $0.03
- 2 culture expansions: $0.05
- 1 character: $0.02
- 1 location: $0.02
- **Total: ~$0.12** (vs. $0.50-1.00 for old system)

---

## Performance Targets

| Operation | Target Time | Word Count |
|-----------|-------------|------------|
| Quick World | 30-40 seconds | 600-1000 words |
| Culture Expansion | 20-30 seconds | 600-800 words |
| Character | 15-25 seconds | 400 words |
| Location | 15-20 seconds | 350 words |
| Legend | 20-25 seconds | 450 words |
| Magic System | 20-30 seconds | 500-600 words |
| Conflict | 20-25 seconds | 400-500 words |

---

## World Data Structure

### Minimal Context (for expansions)

```javascript
const minimalWorld = {
  worldName: "string",
  coreHook: "string", // or tagline or theme
  magicSystem: {
    name: "string",
    mechanism: "string" // or description
  },
  cultures: [
    {
      name: "string",
      coreValues: "string", // or values
      socialStructure: "string", // optional
      relationshipToMagic: "string" // optional
    }
  ],
  conflict: {
    name: "string" // optional
  }
};
```

All expansion functions use optional chaining (`?.`) to handle both quick and full world objects.

---

## Common Patterns

### Pattern 1: Sequential Exploration

```javascript
// 1. Generate quick world
const world = await generateQuickWorld(userRequest);

// 2. User explores culture
const culture = await expandSpecificCulture(world, cultureName);

// 3. User generates character from that culture
const character = await generateCharacterFromCulture(world, cultureName);
```

### Pattern 2: Parallel Generation

```javascript
// Generate multiple elements simultaneously
const [char1, char2, location] = await Promise.all([
  generateCharacter(world, "Culture A"),
  generateCharacter(world, "Culture B"),
  generateLocation(world)
]);
```

### Pattern 3: Progressive Enrichment

```javascript
// Start with quick world
let world = await generateQuickWorld(userRequest);

// Track expansions
world.expansions = {
  cultures: {},
  characters: [],
  locations: [],
  legends: []
};

// Expand as user requests
world.expansions.cultures[cultureName] = await expandCulture(world, cultureName);
world.expansions.characters.push(await generateCharacter(world));
```

---

## UI Integration Tips

### Loading States

```svelte
{#if isGenerating}
  <div class="loading">
    {#if currentOperation === 'quick-world'}
      Generating world foundation... (~30s)
    {:else if currentOperation === 'expand-culture'}
      Expanding {cultureName}... (~25s)
    {:else if currentOperation === 'generate-character'}
      Creating character... (~20s)
    {/if}
  </div>
{/if}
```

### Track Expansion State

```javascript
const worldData = {
  // Core data
  name: null,
  coreHook: '',
  cultures: [],

  // Expansion tracking
  expandedCultures: new Set(), // Track which cultures are expanded
  generatedCharacters: [],
  generatedLocations: [],
  generatedLegends: []
};
```

### Conditional Rendering

```svelte
{#each worldData.cultures as culture}
  <div class="culture-card">
    <h3>{culture.name}</h3>
    <p>{culture.coreValues}</p>

    {#if expandedCultures.has(culture.name)}
      <!-- Show full details -->
      <div class="expanded">
        <p>{culture.fullDetail.dailyLife}</p>
        <!-- ... -->
      </div>
    {:else}
      <!-- Show expand button -->
      <button on:click={() => expandCulture(culture.name)}>
        Explore {culture.name}
      </button>
    {/if}
  </div>
{/each}
```

---

## Debugging

### Enable Detailed Logging

```javascript
// In parser functions, errors already log context:
// - Error message
// - First 500 chars of response
// - Cleaned JSON attempt

// Add your own logging:
console.log('[World Gen] Starting quick generation');
console.log('[World Gen] Response length:', response.length);
console.log('[World Gen] Parsed world:', world.worldName);
```

### Test Parsers Independently

```javascript
import { parseQuickWorld } from './prompts/progressiveGeneration.js';

const testResponse = `{
  "worldName": "Test World",
  "coreHook": "A test world",
  ...
}`;

try {
  const parsed = parseQuickWorld(testResponse);
  console.log('✓ Parser works:', parsed);
} catch (error) {
  console.error('✗ Parser failed:', error.message);
}
```

---

## Best Practices

### 1. Always Use Try-Catch

```javascript
try {
  const world = parseQuickWorld(response);
  // Success path
} catch (error) {
  // Handle error gracefully
  showError('Failed to generate world. Please try again.');
  console.error(error);
}
```

### 2. Show Progress Feedback

```javascript
setStatus('Generating world...');
const world = await generateQuickWorld(userRequest);
setStatus('World created! Choose what to explore.');
```

### 3. Validate Before Expansion

```javascript
if (!world || !world.cultures || world.cultures.length === 0) {
  throw new Error('World must be generated before expanding cultures');
}
```

### 4. Handle Missing Optional Fields

```javascript
// Use optional chaining and fallbacks
const description = culture?.fullDetail?.dailyLife || 'Not yet expanded';
const cultureName = culture?.name || 'Unknown Culture';
```

---

## Troubleshooting

### Problem: "Culture not found"
**Solution:** Ensure culture name matches exactly (case-sensitive)

### Problem: "Missing required field"
**Solution:** Check that quick world generation completed successfully

### Problem: JSON parse error
**Solution:** Parser should handle this automatically. If persists, check response format

### Problem: Slow generation times
**Solution:** Verify token limits aren't too high. Check network latency.

### Problem: Generic/clichéd output
**Solution:** Prompts include anti-cliché principles. May need higher temperature.

---

## Advanced Usage

### Custom Expansion Context

```javascript
// Add custom context to expansion
const customWorld = {
  ...world,
  additionalContext: "User wants steampunk aesthetic",
  tonePreference: "dark and gritty"
};

const character = await generateCharacter(customWorld, cultureName);
```

### Streaming Support (Future)

```javascript
// For future streaming implementation
async function* streamExpansion(world, cultureName) {
  const response = await callOpenAIStream(/* ... */);

  for await (const chunk of response) {
    yield parsePartialJSON(chunk);
  }
}
```

---

## Reference Links

- **Main documentation:** `/PROGRESSIVE_GENERATION_BACKEND.md`
- **Research findings:** `/docs/PROMPT_RESEARCH_FINDINGS.md`
- **Prompt improvements:** `/docs/PROMPT_IMPROVEMENTS_V3.md`
- **Testing guide:** `/docs/TESTING_GUIDE.md`

---

## Support

**Issues with backend prompts?**
1. Check console for parser error messages
2. Verify world object structure
3. Ensure required fields are present
4. Test with minimal example first

**Need help integrating?**
- See usage examples above
- Check WorldbuildingStudio.svelte for reference implementation
- Review error messages in console
