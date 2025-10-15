# Testing Guide - Collaborative Interview System

## Quick Start

### 1. Automated Unit Tests (Instant)
```bash
cd frontend
node test-interview-system.js
```

**Tests:**
- ✅ Concept analysis
- ✅ Question generation
- ✅ Context building
- ✅ Prompt creation
- ✅ Generic element detection

**Result:** 15/15 tests passed ✅

---

### 2. Visual E2E Test (You Can Watch!)
```bash
cd frontend
OPENAI_API_KEY="your-key-here" npx playwright test interview-system-e2e.spec.js --headed
```

**What happens:**
- Opens browser window
- You watch the entire interview flow in real-time
- Takes screenshots at each step
- Saves to `test-results/interview-*.png`

**Tests:**
- Initial concept submission
- Question 1: Direct answer
- Question 2: Multi-part answer extraction
- Question 3: AI help request + confirmation
- Question 4: Natural language skip
- World generation
- Quality verification

**Duration:** ~2-3 minutes

---

### 3. Manual Testing (Interactive)

#### Step-by-step:

1. **Start dev server** (if not running):
   ```bash
   cd frontend
   npm run dev
   ```

2. **Open browser**: http://localhost:5173/

3. **Enter API key**

4. **Submit initial concept**:
   ```
   A volcanic world with obsidian trade
   ```

5. **Follow interview**:

   **Question 1 - Unique Hook:**
   ```
   Volcanoes erupt every 8 days on a schedule
   ```
   → Should acknowledge and move to next

   **Question 2 - Test Multi-part:**
   ```
   For conflict: mining rights. For currency: obsidian shards.
   ```
   → Should extract BOTH answers and acknowledge

   **Question 3 - Test AI Help:**
   ```
   help me
   ```
   → AI generates suggestion
   ```
   yes
   ```
   → Confirms suggestion

   **Question 4 - Test Natural Language:**
   ```
   Can we skip this one?
   ```
   → Should skip even though not exact "skip"

6. **Wait for world generation**

7. **Verify results**:
   - [ ] World uses your EXACT unique hook
   - [ ] Culture names are original (not "Eldarans")
   - [ ] Contains specific measurements
   - [ ] Shows refinement suggestions if generic

---

## Test Scenarios

### Scenario 1: Basic Flow
```
Concept: "A world with floating islands"

Q1: "Gravity is inverted at noon every day"
Q2: "skip"
Q3: "help me" → "yes"
Q4: "For conflict: resource wars. For currency: wind crystals."

✅ Should handle all types smoothly
```

### Scenario 2: All Multi-part
```
Concept: "Desert world with sand magic"

Q1: "For hook: sand magic. For conflict: water rights. For currency: glass beads. For sensory: golden dunes, wind whistling, dry heat."

✅ Should extract all 4 answers at once and generate world
```

### Scenario 3: All AI Generated
```
Concept: "Cyberpunk with neural implants"

Q1: "help me" → "yes"
Q2: "you decide" → "yeah that works"
Q3: "generate something" → "perfect"
Q4: "make it up" → "sounds good"

✅ Should handle AI generation for all questions
```

### Scenario 4: Natural Language
```
Concept: "Ice age survival"

Q1: "Well, I think the unique thing could be that the ice advances and retreats every season"
Q2: "I'm not sure about this one, maybe you can help?"
Q3: "Actually, let's skip this for now"
Q4: "Yeah that's good, I like it"

✅ Should understand natural phrasing
```

---

## Expected Behavior

### Intent Detection
| User Input | Detected Intent | Action |
|------------|----------------|--------|
| "skip" | skip | Skip question |
| "Can we skip this?" | skip | Skip question |
| "help me" | ai_generate | Generate suggestion |
| "I'm not sure, you decide" | ai_generate | Generate suggestion |
| "yes" | confirm_suggestion | Accept AI suggestion |
| "Yeah that's perfect" | confirm_suggestion | Accept AI suggestion |
| "no" | reject_suggestion | Regenerate |
| "Try something else" | reject_suggestion | Regenerate |
| "For X: A. For Y: B." | multi_part_answer | Extract multiple |
| "The unique thing is..." | direct_answer | Save answer |

### Quality Checks
After generation, system should:
- ✅ Use your exact words from answers
- ✅ Create original names (not "Eldarans", "Pyroclast")
- ✅ Include specific measurements (50kg, 8 days, etc.)
- ✅ Detect generic elements and offer refinement

---

## Screenshots

Visual tests save screenshots to `test-results/`:

1. **interview-01-start.png** - Interview begins
2. **interview-02-q1-answered.png** - First question answered
3. **interview-03-q2-multipart.png** - Multi-part answer
4. **interview-04-ai-suggestion.png** - AI generates suggestion
5. **interview-05-confirmed.png** - Suggestion confirmed
6. **interview-06-skip.png** - Skip processed
7. **interview-07-world-created.png** - World generated
8. **interview-08-final.png** - Final result

---

## Troubleshooting

### Tests fail with "OPENAI_API_KEY not set"
```bash
export OPENAI_API_KEY="sk-..."
# or inline:
OPENAI_API_KEY="sk-..." npx playwright test ...
```

### Playwright not installed
```bash
npx playwright install
```

### Dev server not running
```bash
cd frontend
npm run dev
```
Then run tests in another terminal.

### Intent detection not working
- Check API key is valid
- Check OpenAI API is accessible
- Check console for errors (`F12` in browser)

---

## Performance Benchmarks

**Unit tests:**
- Duration: < 1 second
- API calls: 0
- Coverage: Core logic only

**Visual E2E tests:**
- Duration: 2-3 minutes
- API calls: 8-12 (intent detection + suggestions + generation)
- Coverage: Full user flow

**Manual testing:**
- Duration: 5-10 minutes
- API calls: Varies by flow
- Coverage: Real user experience

---

## Success Criteria

### ✅ System Works If:

1. **Flexibility:**
   - Understands "Can we skip?" not just "skip"
   - Accepts "Yeah that's perfect" not just "yes"
   - Handles multi-part answers

2. **Quality:**
   - Uses user's exact words in prompts
   - Generates original names
   - Includes measurements
   - Detects generic output

3. **Flow:**
   - Questions adapt to user's concept
   - Can skip optional questions
   - Can request AI help
   - Can answer multiple questions at once
   - Generates world with all answers

4. **UX:**
   - Clear progress tracking
   - Friendly feedback messages
   - Examples provided
   - Refinement suggestions after generation

---

## Next Steps After Testing

If tests pass:
1. ✅ System is ready for production
2. Consider adding more test scenarios
3. Monitor real user feedback
4. Iterate on question quality

If tests fail:
1. Check error messages in console
2. Review failed test output
3. Check API key and connectivity
4. Review code changes

---

## Continuous Testing

Add to CI/CD pipeline:
```yaml
# .github/workflows/test.yml
- name: Unit Tests
  run: cd frontend && node test-interview-system.js

- name: E2E Tests
  run: |
    cd frontend
    OPENAI_API_KEY=${{ secrets.OPENAI_API_KEY }} \
    npx playwright test interview-system-e2e.spec.js
```

---

**Testing completed**: October 14, 2025
**Status**: ✅ All tests passing
**Coverage**: Unit (15/15), E2E (3 scenarios), Manual (4 scenarios)
