# Prompt System Documentation

**Last Updated**: 2025-10-13 (Phase 1 Complete)

This directory contains all active prompt configurations for the AI Worldbuilding Engine.

## Active Prompt Files

### 🌍 `worldGeneration.js`
**Purpose**: Core world generation prompt with Constitutional AI integration
**Used By**: `GameInitializer.svelte`, `WorldExplorer.svelte`
**Features**:
- Chain-of-Thought reasoning (Phase 1, Task 1.1)
- Constitutional AI self-critique loop
- Quality principles (originality, specificity, implications, consistency, mundane grounding)
- JSON schema validation

**Key Functions**:
```javascript
worldGenerationPrompt.systemPrompt  // Base system prompt
worldGenerationPrompt.getUserPrompt(concept)  // Generate user prompt
```

---

### 🎨 `genreAwareGeneration.js`
**Purpose**: Genre-specific enhancements + Sanderson's Laws (Phase 1, Tasks 1.3 & 1.4)
**Used By**: Will be integrated with main UI in production
**Features**:
- 8-genre support (Fantasy, Sci-Fi, Horror, Contemporary, Historical, Dystopian, Cyberpunk, Steampunk)
- Auto-detection of genre from user input
- Genre-specific quality weights and clichés
- Sanderson's Laws (hard/soft magic detection)
- Multi-genre blending support

**Key Functions**:
```javascript
getGenreAwarePrompt(concept, genre)  // Complete genre-enhanced prompt
getGenreQualityWeights(genre)  // For Constitutional AI scoring
validateMagicInWorld(world, userInput)  // Sanderson's Laws validation
```

**Integration Status**: ✅ Complete, pending UI integration

---

### 🔭 `worldExpansion.js`
**Purpose**: Expand existing worlds with new elements (locations, characters, factions)
**Used By**: `WorldExplorer.svelte` (exploration mode)
**Features**:
- Context-aware expansion (uses existing world state)
- Consistency checking with established lore
- Progressive detail generation

**Key Functions**:
```javascript
worldExpansionPrompt.systemPrompt
worldExpansionPrompt.getUserPrompt(world, focus)
```

---

### 📖 `narrativeProgression.js`
**Purpose**: Story progression and narrative generation
**Used By**: `WorldExplorer.svelte` (narrative mode)
**Features**:
- Story beat generation
- Character development
- Plot progression
- Consequence tracking

**Key Functions**:
```javascript
narrativeProgressionPrompt.systemPrompt
narrativeProgressionPrompt.getUserPrompt(context, action)
```

---

## Prompt Enhancement Layers

The prompt system uses a layered approach:

```
Base Prompt (worldGeneration.js)
    ↓
+ Genre Enhancement (genreAwareGeneration.js)
    ↓
+ Sanderson's Laws (hard/soft magic)
    ↓
+ Constitutional AI Critique
    ↓
Final Output
```

## Quality Systems Integration

### 1. Chain-of-Thought Reasoning
**Location**: All prompts
**Purpose**: Structured reasoning before generation
**Format**: `<reasoning>...</reasoning>` tags with 5 steps

### 2. Constitutional AI
**Location**: `worldGeneration.js`, integrated via `src/lib/constitutionalAI.js`
**Purpose**: Self-critique and revision loop
**Principles**: Originality, Specificity, Implications, Consistency, Mundane Grounding

### 3. Cliché Detection
**Location**: `src/lib/clicheDetector.js`
**Purpose**: Pattern-based detection of 80+ clichés
**Integration**: Runs in parallel with AI critique

### 4. Genre System
**Location**: `src/lib/genreSystem.js`
**Purpose**: 8-genre detection and configuration
**Features**: Auto-detection, quality weights, genre-specific clichés

### 5. Sanderson's Laws
**Location**: `src/lib/sandersonLaws.js`
**Purpose**: Magic/power system validation
**Frameworks**:
- Second Law (hard magic): 4 limitation types required
- First Law (soft magic): Mystery preservation, no Deus Ex Machina

## Archived Prompts

Unused/experimental prompts are archived in: `docs/archive/prompts/`

See: `docs/archive/prompts/README.md` for details

## Development Guidelines

### Adding New Prompts

1. **Create new `.js` file** in this directory
2. **Export prompt object** with structure:
```javascript
export const myPrompt = {
  name: "Prompt Name",
  description: "What it does",
  systemPrompt: "System instructions...",
  getUserPrompt: (params) => `User prompt with ${params}...`
};
```

3. **Add Chain-of-Thought** reasoning section
4. **Include quality principles** if applicable
5. **Document in this README**
6. **Write tests** in `frontend/tests/`

### Modifying Existing Prompts

1. **Test first**: Run existing tests to establish baseline
2. **Modify prompt**: Update system/user prompt text
3. **Test again**: Verify improvements, no regressions
4. **Document changes**: Update this README and relevant docs
5. **Version control**: Commit with descriptive message

### Best Practices

- ✅ Use Chain-of-Thought reasoning for complex tasks
- ✅ Include specific examples in prompts
- ✅ Define clear output format (JSON schema, etc.)
- ✅ Test with edge cases
- ✅ Keep prompts modular and composable
- ❌ Avoid overly long prompts (>5000 words)
- ❌ Don't hardcode user-specific content
- ❌ Never include API keys or secrets

## Testing

Test files for prompts are in: `frontend/tests/`

**Test Coverage** (Phase 1 Complete):
- ✅ `cliche-detector.spec.js` - Cliché detection (7 tests)
- ✅ `genre-detection.spec.js` - Genre system (14 tests)
- ✅ `sanderson-laws.spec.js` - Sanderson's Laws (17 tests)
- ✅ `constitutional-ai.spec.js` - Constitutional AI integration
- ✅ `smoke-test.spec.js` - End-to-end smoke tests

Run all tests:
```bash
npm test
```

Run specific test:
```bash
npx playwright test tests/cliche-detector.spec.js
```

## Phase 1 Quality Enhancements

**Completed** (2025-10-13):
- ✅ Task 1.0: Secure API Key Input
- ✅ Task 1.1: Chain-of-Thought Integration
- ✅ Task 1.2: Cliché Detection (80+ patterns)
- ✅ Task 1.3: Genre Selection System (8 genres)
- ✅ Task 1.4: Sanderson Limitation Enforcement (hard + soft magic)
- ✅ Task 1.5: Code Cleanup

**Expected Impact**: +30-40% quality improvement through targeted guidance

## Additional Resources

- **Implementation Plan**: `docs/MASTER_QUALITY_IMPLEMENTATION_PLAN.md`
- **Task Summaries**: `TASK_1.2_CLICHE_DETECTION_COMPLETE.md`, `TASK_1.3_GENRE_SYSTEM_COMPLETE.md`, `TASK_1.4_SANDERSON_LAWS_COMPLETE.md`
- **Genre System**: `docs/prd-v3.md`
- **Constitutional AI**: `docs/CONSTITUTIONAL_AI_SYSTEM.md`

---

**Maintained by**: Claude Code
**Version**: Phase 1 Complete (v1.5)
