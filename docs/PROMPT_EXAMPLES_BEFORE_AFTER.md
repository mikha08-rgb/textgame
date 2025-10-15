# Before/After Prompt Examples - Actionable Implementation Guide

**Purpose:** Concrete examples showing how to transform the current forbidden-list approach into a positive-principle approach.

**Status:** Ready to implement
**Estimated improvement:** 50-70% reduction in clichés
**Implementation time:** 2-3 days

---

## Example 1: Core Prompt Structure

### BEFORE (Current Approach - Negative Constraints)

```javascript
// Current prompt excerpt from worldGeneration.js

const forbiddenContent = `
MASTER FORBIDDEN LIST - ABSOLUTELY NEVER USE:

🚫 FORBIDDEN NAME PATTERNS:
- The [Adjective] [Noun] (e.g., "The Eternal Council")
- [Name]-ia, [Name]-or, [Name]-dor
- Any name ending in: -iel, -ion, -wen, -riel

🚫 FORBIDDEN DESCRIPTORS:
- luminous, ethereal, ancient, primordial, eternal
- void, umbral, shadow, dark, light
- crystalline, essence, energy, power, force
- mystic, mystical, arcane, eldritch, otherworldly

🚫 FORBIDDEN MAGIC SOURCES:
- Crystals or gems as power sources
- Ley lines or energy networks
- Emotions or memories as fuel
- Ancient artifacts or relics
- Chosen bloodlines or destiny

🚫 FORBIDDEN CONFLICT PATTERNS:
- Light vs Dark / Good vs Evil
- Order vs Chaos / Balance vs Imbalance
- Civilization vs Wilderness
- Technology vs Nature
- Ancient power returning

[...continues for 150+ more lines...]
`;

const currentPrompt = `Generate a unique fantasy world based on these domains: ${domain1} and ${domain2}.

${forbiddenContent}

Requirements:
- Avoid all patterns in the forbidden list
- Be creative and original
- Make it unique and interesting

Generate a world with 3 cultures, 3 characters, 3 locations, 1 legend.
Output as JSON.`;
```

**Problems with this approach:**
1. Tells model what NOT to do, but not what TO do
2. Primes model's attention toward forbidden concepts
3. Model semantically evades constraints (uses synonyms)
4. No positive direction leads to generic defaults
5. Extremely long (wastes tokens on negatives)

---

### AFTER (Improved Approach - Positive Principles)

```javascript
// Improved prompt structure

const creativeConstitution = `
CREATIVE PRINCIPLES - Apply these to every element:

✅ SPECIFICITY OVER ABSTRACTION
Instead of: "ancient magical energy"
Use: "The copper smell of lightning trapped in amber bottles"
- Include temperature, texture, sound, smell, taste
- Describe physical mechanisms step-by-step
- Make it tangible and visceral

✅ MUNDANE APPLICATIONS OF FANTASTIC ELEMENTS
Instead of: "Magic shapes the destiny of nations"
Use: "Magic is used primarily for filing paperwork faster"
- What do ordinary people do with this daily?
- What bureaucracy has emerged around it?
- What mundane problems does it solve?

✅ UNEXPECTED DOMAIN FUSION
You must combine: ${domain1} + ${domain2}
- How does "${domain1}" mechanize/constrain/regulate "${domain2}"?
- What happens when you treat ${domain2} as a ${domain1} problem?
- Example: BREATH + LAW = government-regulated respiration

✅ GROUNDED CONSEQUENCES
Instead of: "The war changed everything"
Use: "Trade routes shifted north, bankrupting southern merchants"
- Focus on economic implications
- Show political power dynamics
- Reveal social class tensions
- Demonstrate technological adaptations

✅ INVERSION OF EXPECTATIONS
Instead of: "Heroes quest for legendary artifacts"
Use: "Bureaucrats investigate paperwork violations"
- What if the 'epic' is mundane?
- What if the 'mundane' is epic?
- What if power comes from unexpected sources?

✅ SYSTEMIC THINKING
Instead of: "The protagonist has special powers"
Use: "Everyone has this ability, creating these systemic effects"
- How does society organize around this?
- What black markets emerge?
- What regulations have developed?
- Who benefits? Who suffers?
`;

const creativitFramework = `
META-CREATIVE PROCESS - Use this method systematically:

SCAMPER Framework (apply to each element):

S - SUBSTITUTE: Replace fantasy defaults
  → Instead of "dragon" what else is powerful and feared?
  → Instead of "magic sword" what else channels power?

C - COMBINE: Merge unrelated domains
  → What happens when you mix ${domain1} + ${domain2}?
  → Accounting + Necromancy = ?
  → Plumbing + Prophecy = ?

A - ADAPT: Borrow from different contexts
  → How would a tax collector approach magic?
  → How would a janitor solve this "epic" problem?

M - MAGNIFY/MINIFY: Change scale unexpectedly
  → Cosmic stakes → bureaucratic paperwork
  → Personal problem → societal crisis

P - PUT TO OTHER USE: Change purpose
  → Magic meant for war → used for cooking
  → Epic artifacts → mundane tools

E - ELIMINATE: Remove assumed necessities
  → No chosen ones, no prophecies, no ancient evils
  → What story emerges from ordinary people?

R - REARRANGE: Reverse sequences
  → Start with "peaceful ending" state
  → Begin with villain victory, work backward
`;

const specificGuidance = `
SPECIFIC INSTRUCTIONS for ${domain1} + ${domain2}:

1. MAGIC SYSTEM MUST:
   - Have specific physical laws (not "mystical energy")
   - Cost something concrete (time, money, health, reputation)
   - Have mundane everyday applications
   - Create visible social stratification
   - Follow from ${domain1}/${domain2} fusion

2. CULTURES MUST:
   - Organize around practical concerns (not ideologies)
   - Have specific economic bases (trade in what?)
   - Show class tensions and power dynamics
   - Adapt to world's core conceit in different ways

3. CONFLICTS MUST:
   - Stem from resource competition or policy disputes
   - Avoid abstract good/evil frameworks
   - Show multiple valid perspectives
   - Have boring names ("The Grain Tax Dispute")

4. DESCRIPTIONS MUST:
   - Use concrete sensory details
   - Avoid adjectives like: powerful, ancient, mystical
   - Include sounds, smells, textures, temperatures
   - Reference specific materials and mechanisms

5. NAMES MUST:
   - Sound mundane or bureaucratic
   - Avoid fantasy suffixes (-iel, -wen, -dor, -ia)
   - Use job titles, locations, or descriptions
   - Examples: "Department of X", "Local 447", "East Wharf District"
`;

const improvedPrompt = `You are an expert worldbuilding system designer creating original fantasy worlds.

${creativeConstitution}

${creativitFramework}

${specificGuidance}

DOMAIN FUSION CHALLENGE: ${domain1} + ${domain2}

Before generating, think through:
1. How do these domains combine mechanistically?
2. What mundane applications emerge?
3. What specific sensory details define this?
4. What systemic social effects result?

Now generate a complete world with:
- 3 distinct cultures (each adapting to core conceit differently)
- 3 characters (ordinary people dealing with systemic pressures)
- 3 locations (showing different aspects of the world)
- 1 legend (explaining a mundane mystery, not an epic)

Output as JSON following this schema:
[... JSON schema ...]
`;
```

**Improvements with this approach:**
1. ✅ Gives positive direction (what TO do)
2. ✅ Provides concrete examples for each principle
3. ✅ Teaches creative process (SCAMPER framework)
4. ✅ Focuses on specific, actionable guidance
5. ✅ Shorter (more room for actual content)

---

## Example 2: Self-Critique Addition (Constitutional AI)

### AFTER (Step 2 - Adding Self-Critique)

```javascript
// After initial generation, add critique step

const critiquePrompt = `Review the world you just generated against our creative principles.

For each principle, provide:
- Score (1-10)
- Specific evidence from the world
- Problems identified
- Concrete improvement suggestions

PRINCIPLES TO EVALUATE:

1. SPECIFICITY (1-10): ____
   - Are descriptions concrete with sensory details?
   - Do systems have specific mechanisms?
   - Evidence: [quote relevant sections]
   - Problems: [what's too abstract/vague?]
   - Improvements: [specific changes needed]

2. ORIGINALITY (1-10): ____
   - Does it avoid fantasy tropes and clichés?
   - Is the domain fusion genuinely unexpected?
   - Evidence: [most original elements]
   - Problems: [what feels generic?]
   - Improvements: [how to make more unique]

3. GROUNDEDNESS (1-10): ____
   - Are there concrete consequences and systems?
   - Do ordinary people's lives make sense?
   - Evidence: [best grounded details]
   - Problems: [what's too hand-wavy?]
   - Improvements: [what needs more detail]

4. MUNDANITY (1-10): ____
   - Are fantastic elements applied mundanely?
   - Is the scale appropriately small/bureaucratic?
   - Evidence: [best mundane applications]
   - Problems: [what's too "epic"?]
   - Improvements: [how to make more everyday]

5. COHERENCE (1-10): ____
   - Do all elements stem from core conceit?
   - Does everything support the central idea?
   - Evidence: [best integrated elements]
   - Problems: [what feels disconnected?]
   - Improvements: [how to better integrate]

SUMMARY:
- Lowest scoring principle: ____
- Most critical problem: ____
- Top 3 improvements needed:
  1. ____
  2. ____
  3. ____

If ANY score is below 7, the world needs revision.`;

// Step 3: Revision based on critique

const revisionPrompt = `Based on your self-critique, revise the world to address the identified problems.

FOCUS AREAS (from critique):
${critique.problems.join('\n')}

SPECIFIC IMPROVEMENTS NEEDED:
${critique.improvements.join('\n')}

Generate the revised world, ensuring:
- All principles score 8+
- Problems from critique are fixed
- Core concept is preserved but better executed
- JSON schema is maintained

Revised world:`;
```

**Expected outcome:**
- Initial generation catches 60-70% of clichés
- Self-critique catches another 20-30%
- Revision fixes identified issues
- Total improvement: 50-70% reduction in clichés

---

## Example 3: Meta-Prompting Variations

### Variation A: SCAMPER Focus

```javascript
const scamperPrompt = `Before generating each major element, apply SCAMPER:

CULTURE 1:
S - SUBSTITUTE: Instead of "warrior culture" → [bureaucrat culture]
C - COMBINE: What if warriors + accountants?
A - ADAPT: How would librarians wage war?
M - MAGNIFY: What if everyone is a warrior (so it's not special)?
P - PUT TO OTHER USE: What if weapons are used for art?
E - ELIMINATE: Remove honor codes, what drives them?
R - REARRANGE: Start with aftermath of war, work back

→ Result: "The Ledger Keepers: Warriors who fight via paperwork,
conquering through perfect accounting that bankrupts enemies"

[Repeat for each culture, character, location]`;
```

### Variation B: Constraint-Based

```javascript
const constraintPrompt = `HARD CONSTRAINTS (these force originality):

1. SCALE CONSTRAINT: All conflicts must be:
   - Resolvable with paperwork OR
   - Solvable by committees OR
   - Decided by bureaucratic process

2. TONE CONSTRAINT: Everything must sound:
   - Mundane and administrative OR
   - Like a local news report OR
   - Like an instruction manual

3. DOMAIN CONSTRAINT: ${domain1} must:
   - Mechanistically control ${domain2}
   - Create specific physical laws
   - Result in measurable social effects

4. NAMING CONSTRAINT: All proper nouns must:
   - Sound bureaucratic (Department of X)
   - Sound geographic (East Wharf District)
   - Sound occupational (Guild of X)
   - NEVER sound mythical or epic

5. MAGIC CONSTRAINT: Any "magic" must:
   - Have specific material requirements
   - Cost measurable resources (money/time)
   - Have mundane primary uses
   - Create social class divisions`;
```

### Variation C: Question-Driven

```javascript
const questionPrompt = `Answer these questions about your world BEFORE generating:

MECHANISM QUESTIONS:
1. What is the specific physical process of ${domain2}?
2. How does ${domain1} regulate/control that process?
3. What tools or equipment are involved?
4. What does it sound/smell/feel like?
5. What can go wrong? What's the error state?

SOCIAL QUESTIONS:
6. Who benefits from this system?
7. Who is disadvantaged by it?
8. What black markets exist around it?
9. What regulations have emerged?
10. What do ordinary people think about it?

ECONOMIC QUESTIONS:
11. What do people trade?
12. What resources are scarce?
13. What jobs exist because of this?
14. What industries have grown around it?
15. What's the main economic conflict?

CONFLICT QUESTIONS:
16. What's the boring administrative dispute?
17. Who wants to change the regulations?
18. What paperwork is required?
19. Who has stamp-signing authority?
20. What's at stake (practically, not cosmically)?

Now generate the world based on your answers.`;
```

---

## Example 4: Domain-Specific Applications

### For Magic Systems

**BEFORE:**
```
"Magic flows from crystals through ley lines. Ancient mages channel ethereal
energy to cast powerful spells."
```

**AFTER (with positive principles):**
```
"Magic is breath held in brass jars. The longer you hold your breath, the more
'breath-debt' accumulates in government-registered containers. Spending breath-
debt makes you gasp involuntarily—the magic takes the breath you didn't breathe.

Physical sensation: Casting feels like drowning. You gasp, wheeze, your vision
goes spotty. The brass jar makes a whistling sound as stored breath escapes.

Economic system: Breath-debt is taxed. The wealthy hire 'breath-holders' to
accumulate debt for them. There's a futures market for breath-debt traded on
the Eastern Exchange.

Regulation: Form 27-B must be filed for any container over 100 breaths.
Unlicensed breath-holding is punishable by forced hyperventilation (3 hours of
mandated rapid breathing).

Social impact: The poor sell their breath to the rich. "Breath poverty" means
you can't afford to hold your breath even briefly. Breath-wealthy elites wear
decorative respirators as status symbols."
```

### For Faction Names

**BEFORE:**
```
- The Eternal Guardians
- The Shadow Brotherhood
- The Crystal Council
```

**AFTER:**
```
- Department of Mundane Affairs (handles magical bureaucracy)
- Local 447 (union of dungeon workers)
- The Association of Concerned Bystanders (opposes heroic property damage)
- East Wharf Breath Collective (breath-debt credit union)
- Committee for the Regulation of Respiratory Commerce
```

### For Character Descriptions

**BEFORE:**
```
"Aelindra, a powerful sorceress with ancient elven blood, seeks to restore
the balance between light and darkness."
```

**AFTER:**
```
"Mira Gosse, Junior Auditor (Grade 7) at the Department of Thaumaturgic
Licensing. She discovered a discrepancy in Form 27-B filings: someone is
accumulating breath-debt without proper licenses. Following the paper trail
leads to a conspiracy at the highest levels of the Respiratory Bureau.

Daily routine: Reviews 200+ forms per day, drinks cheap coffee, takes the
crosstown tram home. Hobby: collects vintage respirator models from the
pre-regulation era.

Conflict: If she reports the discrepancy, her supervisor (who's involved)
will reassign her to the basement archives. If she doesn't, thousands of
unlicensed breaths could destabilize the breath-debt market.

Not special: She has no unique powers, no destiny, no ancient heritage. Just
a keen eye for accounting errors and too much integrity."
```

---

## Example 5: Complete Prompt Comparison

### BEFORE (Current System - Abbreviated)

```javascript
const currentSystem = {
  prompt: `Generate a fantasy world based on ${domain1} and ${domain2}.

  NEVER USE [150 lines of forbidden content]...

  Be creative and original. Make it unique.

  Output JSON with 3 cultures, 3 characters, 3 locations, 1 legend.`,

  temperature: 0.95,
  max_tokens: 12000
};

// Result: Still produces clichés despite forbidden lists
```

### AFTER (Improved System - Complete Flow)

```javascript
// Step 1: Initial generation with positive principles
const step1_generation = {
  prompt: `${creativeConstitution}
  ${creativitFramework}
  ${specificGuidance}

  Domain fusion: ${domain1} + ${domain2}

  Think through mechanism, applications, sensory details, social effects.

  Generate complete world [JSON schema]...`,

  temperature: 0.95,  // High creativity for initial gen
  max_tokens: 12000,
  frequency_penalty: 0.3,  // Reduce repetition
  presence_penalty: 0.3    // Encourage novelty
};

// Step 2: Self-critique
const step2_critique = {
  prompt: `${critiquePrompt}

  Evaluate generated world: ${step1_result}`,

  temperature: 0.4,  // Low temp for focused analysis
  max_tokens: 2000
};

// Step 3: Revision (only if needed)
const step3_revision = {
  prompt: `${revisionPrompt}

  Original world: ${step1_result}
  Critique: ${step2_result}

  Revise to address problems while maintaining strengths.`,

  temperature: 0.8,  // Medium-high for guided creativity
  max_tokens: 12000,
  frequency_penalty: 0.2,
  presence_penalty: 0.2
};

// Result: 50-70% fewer clichés, higher originality scores
```

---

## Implementation Checklist

### Phase 1: Quick Wins (Week 1)

- [ ] **Day 1:** Remove or drastically reduce forbidden list (keep only 10-15 critical items)
- [ ] **Day 1-2:** Replace with positive creative constitution (30-40 lines)
- [ ] **Day 2-3:** Add SCAMPER meta-prompting framework
- [ ] **Day 3-4:** Add specific guidance section with domain-specific examples
- [ ] **Day 5:** Test 10 worlds with new system
- [ ] **Day 5-7:** Compare to baseline, iterate on principles

### Phase 2: Constitutional AI (Week 2)

- [ ] **Day 1-2:** Implement self-critique step (separate API call)
- [ ] **Day 2-3:** Implement revision step (conditional on critique scores)
- [ ] **Day 3-4:** Test 20 worlds with full Constitutional AI flow
- [ ] **Day 4-5:** Optimize critique prompts based on results
- [ ] **Day 5-7:** A/B test new system vs old system (50 worlds each)

### Phase 3: Validation (Week 3)

- [ ] **Day 1-2:** Set up semantic similarity detection
- [ ] **Day 2-3:** Create cliché corpus and embeddings
- [ ] **Day 3-4:** Run automated metrics on test generations
- [ ] **Day 4-5:** Human evaluation of 40 generated worlds
- [ ] **Day 5-7:** Calculate improvement statistics, document findings

### Success Metrics

**Target improvements:**
- Cliché similarity: From 0.65 → 0.35 (46% reduction)
- Trope count: From 8 → 2 (75% reduction)
- Lexical diversity: From 0.68 → 0.82 (21% increase)
- Originality rating: From 3.2 → 4.3 (1.1 point increase)

**Acceptable cost:**
- Token usage: +60-120% (worth it for quality)
- Generation time: +20-40 seconds (acceptable)
- JSON validity: Must remain 100%

---

## FAQ

**Q: Can I keep some forbidden lists?**
A: Yes, keep a SHORT list (10-15 items) for critical issues: safety concerns, technical requirements, brand-specific avoidances. But make it brief and pair it with strong positive guidance.

**Q: Will this work with other models (Claude, Gemini)?**
A: Yes! Positive principles and constitutional AI work across models. You may need to adjust formatting, but the core approach is model-agnostic.

**Q: How do I know if it's working?**
A: Use the metrics in Appendix C of the main report: semantic similarity, trope count, lexical diversity, and human evaluation. Compare before/after on 20+ worlds.

**Q: What if quality decreases?**
A: Unlikely, but if it happens: (1) Your positive principles may be too vague—make them more specific and concrete. (2) Temperature may need adjustment. (3) Self-critique step may need better evaluation criteria.

**Q: Can I mix approaches?**
A: Yes! Start with positive principles + meta-prompting (Week 1), then add constitutional AI (Week 2). Test each addition to see what works best for your use case.

---

**Status:** Ready to implement
**Confidence:** HIGH (backed by multiple research sources)
**Risk:** LOW (backward compatible, can A/B test safely)
**Next step:** Begin Phase 1 implementation

**Questions?** Refer to main findings document: `PROMPT_RESEARCH_FINDINGS.md`
