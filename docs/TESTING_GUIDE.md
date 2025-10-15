# Testing Guide - Prompt Improvements

**Status:** Ready to test
**Implementation:** Complete
**Test Duration:** ~5 minutes per world (15 minutes for full suite)

---

## Quick Start

### Option 1: Automated Playwright Test (Recommended)

```bash
cd frontend
export OPENAI_API_KEY='sk-...'  # Your API key
./test-prompt-improvements.sh
```

This will:
- Generate 1-3 worlds automatically
- Check for clichés (should be absent)
- Check for positive principles (should be present)
- Calculate originality scores
- Provide detailed pass/fail report

### Option 2: Manual Testing

```bash
cd frontend
npm run dev
```

Then:
1. Open browser to http://localhost:5173
2. Enter your API key
3. Select Fantasy theme
4. Generate 3-5 worlds
5. Manually check for improvements (see checklist below)

---

## What the Test Checks

### 🚫 Cliché Elimination (Must Pass)

The test validates these clichés are **ABSENT**:

1. **"The [Adjective] [Noun]" faction names**
   - ❌ Bad: "The Eternal Council", "The Shadow Brotherhood"
   - ✅ Good: "Department of Mundane Affairs", "Local 447"

2. **Generic fantasy descriptors**
   - ❌ Bad: luminous, ethereal, ancient power, mystical energy
   - ✅ Good: Specific materials, concrete sensory details

3. **Forbidden magic sources**
   - ❌ Bad: crystals, mana, essence, life force, soul energy
   - ✅ Good: Specific physical mechanisms with measurements

4. **Light vs Dark conflicts**
   - ❌ Bad: forces of light vs forces of darkness
   - ✅ Good: Economic/resource conflicts with multiple perspectives

5. **Chosen one / Prophecy tropes**
   - ❌ Bad: prophesied hero, destined one, ancient prophecy
   - ✅ Good: Ordinary people dealing with systemic problems

### ✅ Positive Principles (Target 80%+)

The test validates these are **PRESENT**:

1. **Specific numbers and measurements** (target: 5+ instances)
   - ✅ "28 days", "0.3 millimeters", "600 meters", "40,000 people"

2. **Mundane/bureaucratic names** (target: 1+ instances)
   - ✅ Department, Bureau, Committee, Local [number], District

3. **Concrete sensory details** (target: 5+ sensory words)
   - ✅ smell, sound, texture, temperature, taste
   - ✅ copper, brass, stone, metallic, rough, smooth

4. **Economic/practical terms** (target: 3+ instances)
   - ✅ trade, tax, regulation, license, currency, market, bureaucracy

5. **Named institutions** (target: 3+ unique names)
   - ✅ "Bureau of X", "Department of Y", "Committee for Z"

---

## Manual Checklist

If testing manually, check each generated world for:

### Clichés to AVOID ❌

- [ ] No "The [Adjective] [Noun]" faction names
- [ ] No generic descriptors (luminous, ethereal, ancient, mystical)
- [ ] No crystal/mana/essence magic sources
- [ ] No light vs dark conflicts
- [ ] No chosen ones or prophecies
- [ ] No world names ending in -ia, -dor, -mancy

### Improvements to LOOK FOR ✅

- [ ] At least 5 specific numbers/measurements
- [ ] At least 1 mundane/bureaucratic name
- [ ] At least 5 sensory details (smell, sound, texture)
- [ ] At least 3 economic/practical terms
- [ ] At least 3 named institutions
- [ ] Conflicts are resource-based, not ideological
- [ ] Magic has concrete mechanisms (not vague energy)

### Quality Markers

**Excellent world (90%+ score):**
- No clichés whatsoever
- Abundant specific numbers (10+)
- Multiple bureaucratic names (3+)
- Rich sensory language (10+ sensory words)
- Grounded economic conflicts
- Unique and memorable concept

**Good world (70-89% score):**
- Few or no clichés
- Some specific numbers (5-9)
- At least 1 bureaucratic name
- Some sensory details (5-9)
- Resource-based conflicts
- Original concept

**Needs improvement (<70% score):**
- Some clichés present
- Few specific numbers (<5)
- Generic fantasy names
- Vague descriptions
- Ideological conflicts
- Derivative concept

---

## Test Output Examples

### Successful Test Output

```
═══════════════════════════════════════════════════════════════
🎯 TESTING IMPROVED PROMPT SYSTEM
═══════════════════════════════════════════════════════════════

🔑 Step 1: Entering API key...
   ✓ API key entered

🎨 Step 2: Selecting Fantasy theme...
   ✓ Theme selected

🌍 Step 3: Waiting for world generation...
   Loading indicator visible...
   ✓ World generated: "Windlaw Dominion"

🚫 Step 4: Checking for absence of clichés...

   Checking faction name patterns...
      ✓ PASS: No generic faction names like "The Eternal Council"
   Checking for generic fantasy descriptors...
      ✓ PASS: No generic descriptors found
   Checking for forbidden magic sources...
      ✓ PASS: No forbidden magic sources
   Checking for light vs dark conflicts...
      ✓ PASS: No light vs dark conflicts
   Checking for chosen one/prophecy tropes...
      ✓ PASS: No chosen one/prophecy tropes

✅ Step 5: Checking for positive principles...

   Checking for specific numbers and measurements...
      ✓ PASS: Found 47 specific measurements
         Examples: 28 days, 0.3mm, 35 kph
   Checking for mundane/bureaucratic names...
      ✓ PASS: Found 8 mundane/bureaucratic names
         Examples: Bureau, Department, Local
   Checking for sensory details...
      ✓ PASS: Found 23 sensory details
         Examples: copper, sound, texture, brass, smell
   Checking for grounded economic/practical terms...
      ✓ PASS: Found 12 economic/practical terms
         Examples: trade, tax, regulation
   Checking for named institutions...
      ✓ PASS: Found 6 named institutions
         Examples: Bureau of Thaumaturgic Licensing

═══════════════════════════════════════════════════════════════
📊 TEST RESULTS SUMMARY
═══════════════════════════════════════════════════════════════

World: "Windlaw Dominion"

🚫 Cliché Elimination (Must Pass):
   ✓ No "The [Adjective] [Noun]" faction names
   ✓ No generic fantasy descriptors (luminous, ethereal, etc.)
   ✓ No forbidden magic sources (crystals, mana, essence)
   ✓ No light vs dark conflict pattern
   ✓ No chosen one/prophecy tropes
   Cliché Elimination Score: 100% (5/5 checks passed)

✅ Positive Principles (Target 80%+):
   ✓ Has specific measurements (47 found)
   ✓ Has mundane/bureaucratic names (8 found)
   ✓ Has sensory details (23 sensory words)
   ✓ Has economic/practical terms (12 found)
   ✓ Has named institutions (6 found)
   Positive Principle Score: 100% (5/5 checks passed)

═══════════════════════════════════════════════════════════════
🎯 OVERALL IMPROVEMENT SCORE: 100%
═══════════════════════════════════════════════════════════════

Running assertions...

✓ Assertion 1: No critical clichés found
✓ Assertion 2: At least 60% positive principles present
✓ Assertion 3: Overall improvement score >= 70%

═══════════════════════════════════════════════════════════════
🎉 PROMPT IMPROVEMENT TEST PASSED!
═══════════════════════════════════════════════════════════════
```

### Failed Test Example

```
🚫 Step 4: Checking for absence of clichés...

   Checking faction name patterns...
      ✗ FAIL: Found: The Eternal Council, The Shadow Order
   Checking for generic fantasy descriptors...
      ⚠ WARNING: Found: luminous, ethereal
   ...

═══════════════════════════════════════════════════════════════
🎯 OVERALL IMPROVEMENT SCORE: 45%
═══════════════════════════════════════════════════════════════

Running assertions...

✗ Assertion 1 FAILED: Critical clichés found
   Found: The Eternal Council, The Shadow Order

💡 RECOMMENDATIONS FOR FURTHER IMPROVEMENT:

   ⚠ Found generic faction names - strengthen Principle 5 (Inversion)
   ⚠ Found generic descriptors - strengthen Principle 1 (Specificity)
   ⚠ Only 3 measurements found - add more numerical examples

   Consider making the SCAMPER framework more explicit in the prompt.
```

---

## Interpreting Results

### Score Ranges

| Score | Meaning | Action |
|-------|---------|--------|
| 90-100% | Excellent! | Document successes, move to Week 2 |
| 70-89% | Good | Minor tweaks, test 5 more worlds |
| 50-69% | Acceptable | Adjust specific principles, retest |
| <50% | Needs work | Review prompt, strengthen examples |

### Common Issues & Fixes

**Issue: Generic faction names still appearing**
- Fix: Strengthen Principle 5 examples
- Add more bureaucratic name examples to SCAMPER section

**Issue: Few specific measurements**
- Fix: Strengthen Principle 1 examples
- Add more numerical examples in the prompt

**Issue: Vague magic descriptions**
- Fix: Strengthen "MAGIC SYSTEMS MUST" section
- Add more concrete mechanism examples

**Issue: Light vs dark conflicts**
- Fix: Strengthen "CONFLICTS MUST" section
- Add more resource-based conflict examples

**Issue: Low sensory details**
- Fix: Strengthen Principle 1 "sensory details" requirement
- Add specific sensory words to examples

---

## Next Steps Based on Results

### If Test Passes (70%+ score)

**Immediate (Today):**
1. Generate 5-10 more worlds manually
2. Review them for quality and consistency
3. Document any edge cases or issues

**Week 2 (Next 1-2 weeks):**
1. Implement Constitutional AI (self-critique)
2. Add semantic similarity detection
3. Run A/B testing (20 old vs 20 new worlds)

**Week 3-4:**
1. Parameter optimization
2. Active prompting (if needed)
3. Continuous monitoring setup

### If Test Partially Passes (50-69% score)

**Immediate:**
1. Review failed checks in test output
2. Strengthen specific principles that failed
3. Add more concrete examples to those sections
4. Rerun test

**This Week:**
1. Iterate on prompt improvements
2. Test 5 worlds after each iteration
3. Track improvements over iterations

**Next Week:**
1. Once passing at 70%+, proceed to Week 2

### If Test Fails (<50% score)

**Immediate:**
1. Review all failure points carefully
2. Check if prompt file saved correctly
3. Verify changes are in the right section
4. Read the specific failure messages

**Debug Steps:**
1. Open `frontend/src/prompts/worldGeneration.js`
2. Verify positive principles section is present (lines 153-328)
3. Verify SCAMPER framework is present
4. Check for syntax errors in JavaScript
5. Restart dev server to reload changes

**Get Help:**
1. Share test output for analysis
2. Review `docs/PROMPT_RESEARCH_FINDINGS.md` for principles
3. Review `docs/PROMPT_EXAMPLES_BEFORE_AFTER.md` for examples

---

## Advanced Testing

### A/B Comparison Test

To compare old vs new system:

1. **Backup current prompt:**
   ```bash
   cp frontend/src/prompts/worldGeneration.js frontend/src/prompts/worldGeneration.NEW.js
   ```

2. **Restore old prompt from git:**
   ```bash
   git checkout HEAD~1 frontend/src/prompts/worldGeneration.js
   ```

3. **Generate 5 worlds with old system** (document results)

4. **Restore new prompt:**
   ```bash
   cp frontend/src/prompts/worldGeneration.NEW.js frontend/src/prompts/worldGeneration.js
   ```

5. **Generate 5 worlds with new system** (document results)

6. **Compare:**
   - Cliché count (old vs new)
   - Specific measurements (old vs new)
   - Sensory details (old vs new)
   - Overall originality (subjective rating)

### Performance Testing

```bash
cd frontend

# Run test suite including performance metrics
npx playwright test prompt-improvement.spec.js --reporter=html

# View detailed report
npx playwright show-report
```

### Continuous Testing

Add to your workflow:

```bash
# Run before committing changes to prompts
./test-prompt-improvements.sh

# Or add as pre-commit hook
echo "./frontend/test-prompt-improvements.sh" >> .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## Test Files Reference

- **Test spec:** `frontend/tests/prompt-improvement.spec.js`
- **Test runner:** `frontend/test-prompt-improvements.sh`
- **Prompt file:** `frontend/src/prompts/worldGeneration.js`
- **Research:** `docs/PROMPT_RESEARCH_FINDINGS.md`
- **Examples:** `docs/PROMPT_EXAMPLES_BEFORE_AFTER.md`

---

## FAQ

**Q: Test says "No API key" but I set it?**
A: Try: `export OPENAI_API_KEY='sk-...'` in the same terminal before running the test.

**Q: Test times out during world generation?**
A: This is normal for first run. Increase timeout in the test if needed (currently 5 min).

**Q: How do I test just one check?**
A: Modify the test file to comment out other checks, or read the detailed output for specific sections.

**Q: Can I run this in CI/CD?**
A: Yes! Set `OPENAI_API_KEY` as environment variable in your CI system.

**Q: What if all tests pass but worlds still feel generic?**
A: The tests catch obvious clichés. Manual review is still important. Consider:
- Increasing numeric measurement requirements
- Adding more specific principle examples
- Implementing Week 2 improvements (Constitutional AI)

---

**Ready to test?** Run `./frontend/test-prompt-improvements.sh` and see your results!
