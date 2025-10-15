# Progressive Generation Testing Guide

## Overview
This guide walks through testing the new progressive generation frontend for the worldbuilding engine.

## Prerequisites
- Frontend dev server running: `cd frontend && npm run dev`
- Valid OpenAI API key configured
- Modern browser (Chrome, Firefox, Safari, Edge)

## Test Suite

### Test 1: Initial World Generation (Quick Foundation)

**Objective:** Verify fast initial generation produces structured foundation

**Steps:**
1. Open the worldbuilding studio
2. Click starter prompt OR type: "Create a fantasy world with floating islands"
3. Click "Send"

**Expected Results:**
- ✅ Loading indicator appears: "Building..."
- ✅ Generation completes in ~30-45 seconds (vs 2-3 minutes in v2)
- ✅ Chat displays structured world with:
  - World name as heading
  - Core hook (50-100 words)
  - Geography section
  - Magic system section
  - Central conflict section
  - 3 culture summaries
- ✅ Right panel displays:
  - World name at top
  - Export button
  - Geography section
  - Magic system section
  - Conflict section
  - 3 culture cards with "📖 Explore" buttons
  - Quick Actions panel (4 buttons)
- ✅ Chat shows follow-up suggestions:
  - "Expand on [Culture A]"
  - "Expand on [Culture B]"
  - "Expand on [Culture C]"
  - "Create a character"
  - etc.

**Success Criteria:**
- [ ] Generation time < 60 seconds
- [ ] All sections populated with content
- [ ] 3 cultures generated
- [ ] No errors in console
- [ ] Right panel updates reactively

---

### Test 2: Culture Expansion (Button Click)

**Objective:** Verify culture expansion via UI button

**Steps:**
1. Complete Test 1
2. In right panel, click "📖 Explore" on first culture card

**Expected Results:**
- ✅ Button changes to "✓ Expanded" badge
- ✅ Loading indicator: "Expanding culture..."
- ✅ Generation completes in ~20-30 seconds
- ✅ Chat displays detailed expansion with:
  - "## [Culture Name] - Detailed Expansion" heading
  - Daily Life section (200-250 words)
  - Economy & Trade section (150-200 words)
  - Governance & Law section (100-150 words)
  - Arts & Traditions section (80-120 words)
  - Notable Figures (2-3 named individuals with ages)
- ✅ Right panel culture card expands to show:
  - Daily Life
  - Economy & Trade
  - Governance
  - Notable Figures with names and roles
  - Smooth slideDown animation
- ✅ Chat shows follow-up suggestions

**Success Criteria:**
- [ ] Expansion time < 45 seconds
- [ ] Culture card animates smoothly
- [ ] All new fields populated
- [ ] "Expanded" badge shows
- [ ] Can't click "Explore" again (button disabled)

---

### Test 3: Culture Expansion (Natural Language)

**Objective:** Verify culture expansion via chat command

**Steps:**
1. Complete Test 1
2. Type in chat: "Expand on [Second Culture Name]"
3. Press Enter

**Expected Results:**
- ✅ Same results as Test 2
- ✅ Intent detected correctly
- ✅ Second culture card expands
- ✅ First culture remains in previous state

**Success Criteria:**
- [ ] Natural language understood
- [ ] Correct culture expanded
- [ ] No interference with other cultures

---

### Test 4: Character Generation (Button)

**Objective:** Verify character generation via Quick Actions

**Steps:**
1. Complete Test 1
2. In right panel, click "👤 Create Character" button

**Expected Results:**
- ✅ Loading indicator: "Creating character..."
- ✅ Generation completes in ~15-25 seconds
- ✅ Chat displays character with:
  - Name as heading
  - Age and Role
  - Appearance section
  - Personality section
  - Goal section
  - Connection to the World section
  - Distinctive Trait
  - Secret
- ✅ "Generated Content" section appears in right panel:
  - "👤 **1** Character"

**Success Criteria:**
- [ ] Character generated < 30 seconds
- [ ] All character fields populated
- [ ] Character added to worldData.characters array
- [ ] Counter updates in right panel

---

### Test 5: Character Generation (Natural Language with Culture)

**Objective:** Verify character generation from specific culture

**Steps:**
1. Complete Test 1
2. Type: "Create a character from [First Culture Name]"
3. Press Enter

**Expected Results:**
- ✅ Same as Test 4
- ✅ Character should reflect cultural values and traits
- ✅ Character's culture should be mentioned in context

**Success Criteria:**
- [ ] Correct culture detected
- [ ] Character fits cultural context
- [ ] Counter increments to "👤 **2** Characters"

---

### Test 6: Location Generation

**Objective:** Verify location generation

**Steps:**
1. Complete Test 1
2. Click "🏛️ Add Location" button

**Expected Results:**
- ✅ Loading indicator: "Generating location..."
- ✅ Generation completes in ~15-20 seconds
- ✅ Chat displays location with:
  - Name and type
  - Physical description
  - How world's magic manifests here
  - Inhabitants section
  - Current Situation
  - Memorable Details (bulleted list)
- ✅ "Generated Content" section updates:
  - "🏛️ **1** Location"

**Success Criteria:**
- [ ] Location generated < 30 seconds
- [ ] Rich sensory details included
- [ ] Location fits world context
- [ ] Counter updates

---

### Test 7: Legend Generation

**Objective:** Verify legend/myth generation

**Steps:**
1. Complete Test 1
2. Click "📜 Generate Legend" button

**Expected Results:**
- ✅ Loading indicator: "Weaving legend..."
- ✅ Generation completes in ~20-25 seconds
- ✅ Chat displays legend with:
  - Title and timeframe
  - Full story (250-300 words in mythic style)
  - Moral or Lesson
  - Cultural Significance
- ✅ "Generated Content" section updates:
  - "📜 **1** Legend"

**Success Criteria:**
- [ ] Legend generated < 35 seconds
- [ ] Story is coherent and mythic in tone
- [ ] Fits world's established lore
- [ ] Counter updates

---

### Test 8: Multiple Expansions

**Objective:** Verify multiple elements can be generated

**Steps:**
1. Complete Test 1
2. Expand all 3 cultures
3. Generate 2 characters
4. Generate 2 locations
5. Generate 1 legend

**Expected Results:**
- ✅ All 3 cultures show "✓ Expanded"
- ✅ All 3 culture cards show expanded content
- ✅ "Generated Content" shows:
  - "👤 **2** Characters"
  - "🏛️ **2** Locations"
  - "📜 **1** Legend"
- ✅ Chat history contains all generations
- ✅ No performance degradation
- ✅ Scrolling works smoothly

**Success Criteria:**
- [ ] All elements generated successfully
- [ ] No conflicts or errors
- [ ] UI remains responsive
- [ ] Memory usage reasonable

---

### Test 9: Export Functionality

**Objective:** Verify complete world export

**Steps:**
1. Complete Test 8 (or generate partial content)
2. Click "📥 Export World" button

**Expected Results:**
- ✅ Markdown file downloads immediately
- ✅ Filename: `[World-Name].md`
- ✅ File contains:
  - World name as H1
  - Core hook
  - Geography section
  - Magic system section
  - Conflict section
  - All cultures (with expanded details if expanded)
  - All generated characters
  - All generated locations
  - All generated legends
- ✅ Formatting is clean and readable
- ✅ All sections properly organized

**Success Criteria:**
- [ ] Export happens instantly
- [ ] File structure is correct
- [ ] All generated content included
- [ ] Markdown renders correctly when viewed

---

### Test 10: Conversational Worldbuilding

**Objective:** Verify general conversational questions work

**Steps:**
1. Complete Test 1
2. Type: "What do people eat in this world?"
3. Type: "How does magic work in daily life?"
4. Type: "Tell me more about the conflict"

**Expected Results:**
- ✅ Each question gets a thoughtful response
- ✅ Responses reference established world facts
- ✅ Responses maintain consistency
- ✅ Responses are specific to THIS world (not generic)

**Success Criteria:**
- [ ] Natural language understood
- [ ] Responses are coherent
- [ ] Consistency maintained
- [ ] No hallucinations or contradictions

---

### Test 11: Error Handling

**Objective:** Verify graceful error handling

**Test 11a: API Key Invalid**
1. Clear API key or use invalid key
2. Try to generate world

**Expected Results:**
- ✅ Error message appears in chat
- ✅ Error is clear and actionable
- ✅ UI doesn't break

**Test 11b: Network Timeout**
1. Simulate slow connection (browser DevTools)
2. Try to generate world

**Expected Results:**
- ✅ Timeout message after 2 minutes
- ✅ User can retry
- ✅ No broken state

**Test 11c: Invalid JSON Response**
1. (Hard to simulate, but check error logs if it occurs)

**Expected Results:**
- ✅ Parse error caught
- ✅ Helpful error message
- ✅ User can retry

**Success Criteria:**
- [ ] All errors handled gracefully
- [ ] No blank screens or crashes
- [ ] Clear error messages
- [ ] Can recover from errors

---

### Test 12: Loading States

**Objective:** Verify loading indicators are clear

**Steps:**
1. During each generation type, observe loading indicator

**Expected Results:**
- ✅ Initial generation: "Building..."
- ✅ Culture expansion: "Expanding culture..."
- ✅ Character: "Creating character..."
- ✅ Location: "Generating location..."
- ✅ Legend: "Weaving legend..."
- ✅ All controls disabled during generation
- ✅ Animated dots bounce smoothly

**Success Criteria:**
- [ ] Loading states are distinct
- [ ] User knows what's happening
- [ ] Can't trigger multiple operations
- [ ] Visual feedback is smooth

---

### Test 13: Responsive Design

**Objective:** Verify layout works on different screen sizes

**Steps:**
1. Complete Test 1
2. Resize browser window to:
   - Desktop (> 1400px)
   - Laptop (1024px - 1400px)
   - Tablet (768px - 1024px)
   - Mobile (< 768px)

**Expected Results:**
- ✅ Desktop: Side-by-side layout
- ✅ Tablet: Side-by-side or stacked
- ✅ Mobile: Stacked layout
- ✅ All content readable at all sizes
- ✅ Buttons remain clickable
- ✅ No horizontal scrolling
- ✅ Text doesn't overflow

**Success Criteria:**
- [ ] Responsive breakpoints work
- [ ] Layout adapts smoothly
- [ ] No UI breaks
- [ ] Touch targets adequate on mobile

---

### Test 14: Accessibility

**Objective:** Verify keyboard navigation and screen reader support

**Steps:**
1. Use only keyboard (Tab, Enter, Space)
2. Navigate through entire interface
3. Trigger all actions

**Expected Results:**
- ✅ Can tab to all interactive elements
- ✅ Focus indicator visible on all elements
- ✅ Enter key submits chat input
- ✅ Space/Enter activates buttons
- ✅ Can navigate without mouse

**Success Criteria:**
- [ ] Full keyboard accessibility
- [ ] Visible focus indicators
- [ ] Logical tab order
- [ ] No keyboard traps

---

### Test 15: Performance & Memory

**Objective:** Verify no memory leaks or performance issues

**Steps:**
1. Generate 5 complete worlds (with expansions)
2. Monitor browser memory usage
3. Check for memory leaks

**Expected Results:**
- ✅ Memory usage stays reasonable (< 200MB)
- ✅ No memory leaks when generating new worlds
- ✅ UI remains responsive
- ✅ No slowdown after multiple generations

**Success Criteria:**
- [ ] Memory stable
- [ ] No leaks detected
- [ ] Performance consistent
- [ ] Can generate multiple worlds

---

## Test Results Template

Copy and fill out for each test session:

```markdown
## Test Session: [Date]
**Tester:** [Name]
**Browser:** [Browser Name & Version]
**Environment:** [Development/Production]

### Test Results Summary
- Tests Passed: __/15
- Tests Failed: __/15
- Blockers Found: [None/List]

### Failed Tests Details
1. Test #: [Description of failure]
2. Test #: [Description of failure]

### Notes
- [Any observations]
- [Performance notes]
- [UX feedback]

### Screenshots
- [Attach screenshots of any issues]
```

---

## Automated Testing (Future)

While manual testing is comprehensive, consider adding:

1. **Unit Tests**
   - Test expansion function intent detection
   - Test JSON parsing
   - Test export markdown generation

2. **Integration Tests**
   - Mock API responses
   - Test full generation flow
   - Test error scenarios

3. **E2E Tests (Playwright)**
   - Automate Tests 1-15
   - Run before each deployment
   - Visual regression testing

---

## Known Limitations to Document

1. **No undo**: Once generated, content cannot be undone
2. **Single expansion**: Each culture can only be expanded once
3. **No editing**: Generated content cannot be modified in UI
4. **Browser storage**: Worlds are not persisted (refresh loses work)
5. **API costs**: Each operation costs tokens

---

## Success Metrics

### User Experience Goals
- ⏱️ Time to first world: < 60 seconds
- 🎯 User completes expansion: > 70%
- 😊 User satisfaction: > 8/10
- 🐛 Error rate: < 5%

### Technical Goals
- 🚀 Initial load time: < 2 seconds
- 💾 Memory usage: < 200MB
- 📱 Mobile responsiveness: 100%
- ♿ Accessibility score: > 95%

---

## Bug Report Template

When reporting bugs, include:

```markdown
**Title:** [Brief description]

**Environment:**
- Browser: [Name & Version]
- OS: [Operating System]
- Viewport: [Dimensions]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**Screenshots/Videos:**
[Attach if available]

**Console Errors:**
[Copy any errors from browser console]

**Additional Context:**
[Any other relevant information]
```

---

## Next Steps After Testing

1. **Document Issues**: Create issues for any bugs found
2. **Prioritize Fixes**: Critical → High → Medium → Low
3. **User Feedback**: Get feedback from target users
4. **Performance Optimization**: Profile and optimize bottlenecks
5. **Feature Iteration**: Based on user feedback, consider:
   - Inline editing
   - Save/load functionality
   - Templates
   - Sharing
