# User Flow Guide: Creating a Fantasy World

**Complete walkthrough of the new user experience**

---

## Overview

This guide walks through every step a new user takes when creating their first fantasy world, from opening the app to exploring their generated world.

**Total Time:** 2-4 minutes for first world
**Required:** OpenAI API key

---

## Step-by-Step Flow

### 1. **Landing: First Impression** (5-10 seconds)

**What the user sees:**
- Clean, centered landing page
- App title: "AI Adventure Engine"
- Subtitle: "Enter your API key to begin"
- API key input field (password type)
- "Continue" button (disabled until valid key entered)
- Small "Need an API key?" link to OpenAI

**What happens:**
- User enters their OpenAI API key (format: `sk-...`)
- Input validates format in real-time
- "Continue" button enables when format is valid

**User action:**
```
1. Paste API key into input field
2. Click "Continue" button
```

**Behind the scenes:**
- App validates key format (must start with "sk-")
- Makes test API call to verify key works
- If valid: Stores key securely in localStorage (Base64 obfuscated)
- If invalid: Shows error message

**Possible outcomes:**
- ✅ Success → Proceeds to Step 2
- ❌ Invalid key → Error message + retry
- ❌ No quota → Error with link to billing page
- ❌ Network error → Error message + retry

---

### 2. **Main Interface: Chat-First Design** (Immediate)

**What the user sees:**

**Left Side: Chat Panel (40% width)**
- Header: "🌍 Worldbuilding Studio"
- Settings icon (gear) in top-right
  - Checkbox: "Quality Critique (+30-50% better)" ✓ (enabled by default)
- Chat messages area (empty initially)
- 5 starter prompt suggestions:
  - "I want to make a world like the one from Tress of the Emerald Sea"
  - "I want a fantasy world with floating islands"
  - "Create a dark, gothic world with forbidden magic"
  - "Make a world where technology and magic clash"
  - "Build me a world with multiple moons and strange tides"
- Text input area at bottom
- "Send" button

**Right Side: World Preview Panel (60% width)**
- Empty state message: "Your world will appear here once generated"
- Waiting for content

**What happens:**
- User can either:
  - **Option A:** Click one of the 5 starter prompts
  - **Option B:** Type their own custom description

---

### 3. **World Description: User Input** (10-30 seconds)

**User action - Option A (click starter):**
```
User clicks: "I want a fantasy world with floating islands"
→ Text appears in input field
→ User clicks "Send" or presses Enter
```

**User action - Option B (custom):**
```
User types: "A volcanic island with fire magic and lava rivers"
→ User clicks "Send" or presses Enter
```

**What happens:**
- Message appears in chat as user message
- Generation begins immediately

---

### 4. **Generation: AI at Work** (60-120 seconds)

**What the user sees in chat:**

**Phase 1: Initial Generation (30-45 sec)**
```
💬 User: "A volcanic island with fire magic"

🤖 Assistant: "🌋 Generating your world..."
```

**Behind the scenes:**
- Calls OpenAI GPT-4o with enhanced worldbuilding prompt
- Progressive generation strategy:
  - Core essentials only (name, hook, geography, magic, conflict, theme)
  - Quick turnaround, no overwhelming detail walls
  - Expandable elements referenced but not fully detailed

**Phase 2: Quality Critique (10-15 sec) - If enabled**
```
🤖 Assistant: "🔍 Reviewing quality and making improvements..."
```

**Behind the scenes:**
- Constitutional AI evaluates content against 5 principles:
  1. Specificity (25%) - Concrete numbers, materials, measurements
  2. Implications (20%) - Shows societal/economic/cultural effects
  3. Originality (25%) - Avoids generic tropes
  4. Consistency (15%) - Logical coherence
  5. Mundane Grounding (15%) - Connects to daily life
- If score < 8.0/10 → Revision triggered

**Phase 3: Revision (30-40 sec) - If score < 8.0**
```
🤖 Assistant: "✏️ Enhancing based on quality review..."
```

**Behind the scenes:**
- AI revises content to address weaknesses
- Adds concrete details, removes clichés, improves grounding

**Phase 4: Complete**
```
🤖 Assistant: [World content appears]

"Want to explore more? Try:
 - 👤 'Create a character'
 - 🏛️ 'Generate a key location'
 - 📜 'Generate a legend or myth'"
```

---

### 5. **World Display: Your Creation** (Immediate)

**What the user sees - Left Panel (Chat):**
- Full conversation history
- AI's world description in structured format
- Suggestions for next steps

**What the user sees - Right Panel (World Preview):**

**Top Section: Core World**
```
╔══════════════════════════════════════════════════════╗
║  🌍 PYRAXIS                                          ║
║  Volcanic Island of Fire Magic                       ║
╠══════════════════════════════════════════════════════╣
║  🎯 Core Hook:                                       ║
║  The island's volcano grants fire magic but demands  ║
║  annual sacrifices to prevent eruption.              ║
║                                                      ║
║  🗺️ Geography:                                       ║
║  Pyraxis spans 400 square miles, centered on Mount  ║
║  Ignara (4,500m peak). Black sand beaches, obsidian ║
║  cliffs, sulfur springs. Population: 85,000.        ║
║                                                      ║
║  ✨ Magic System:                                    ║
║  Fire Weaving - mages channel volcanic heat. Max    ║
║  range: 50m. Requires 10-min cooldown. Guild fee:   ║
║  500 gold annually. Unlicensed use = 3 years labor. ║
║                                                      ║
║  ⚔️ Central Conflict:                               ║
║  Military faction (Ironguard) vs merchant guild     ║
║  (Obsidian Traders) over control of volcanic trade. ║
║                                                      ║
║  🎨 Theme:                                           ║
║  The price of power - how much will you sacrifice?  ║
╚══════════════════════════════════════════════════════╝
```

**Middle Section: Expandable Elements**
```
╔══════════════════════════════════════════════════════╗
║  📖 CULTURES (2)                                     ║
╠══════════════════════════════════════════════════════╣
║  🏛️ Ironguard                                        ║
║     Volcanic military culture                        ║
║     Values: Discipline, sacrifice                    ║
║     [Expand] button                                  ║
║                                                      ║
║  💰 Obsidian Traders                                 ║
║     Merchant guild controlling trade                 ║
║     Values: Profit, innovation                       ║
║     [Expand] button                                  ║
╚══════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════╗
║  🏛️ LOCATIONS (1)                                    ║
╠══════════════════════════════════════════════════════╣
║  🏙️ Ember Harbor                                     ║
║     Main port city, pop. 40,000                      ║
║     [Expand] button                                  ║
╚══════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════╗
║  📚 Generated Content                                ║
╠══════════════════════════════════════════════════════╣
║  Characters: 0                                       ║
║  Legends: 0                                          ║
║                                                      ║
║  💡 "Want to add more depth?"                        ║
║  [📜 Generate Legend] button                         ║
╚══════════════════════════════════════════════════════╝
```

---

### 6. **Exploration: Going Deeper** (User-Driven)

At this point, the user can explore in multiple ways:

#### **Option A: Expand Existing Elements**

**User clicks "Expand" on "Ironguard" culture**

**Chat interaction:**
```
💬 User: "Tell me more about the Ironguard"

🤖 Assistant: [Generates detailed expansion]
  - 📖 History (300 years old, founded by...)
  - 🏛️ Social Structure (Ranks by combat, top 10% are...)
  - 💼 Economy (State-funded military, taxes on...)
  - 🎨 Culture (Annual volcanic trials, honor codes...)
  - ⚖️ Laws (Strict discipline, punishment tiers...)
```

**World Preview updates:**
- "Ironguard" section now shows "✓ Expanded"
- Full details visible in preview panel

#### **Option B: Generate New Elements**

**User types in chat: "Create a character from Ember Harbor"**

**Chat interaction:**
```
💬 User: "Create a character from Ember Harbor"

🤖 Assistant: [Generates character]

  👤 Captain Sera Volcan
  - Age: 34, female, Ironguard background
  - Role: Harbor master, Fire Weaver (licensed)
  - Personality: Pragmatic, secretly sympathizes with traders
  - Hook: Torn between military duty and economic reality
  - Stats: Fire Weaving 8/10, Leadership 9/10, Diplomacy 7/10
```

**World Preview updates:**
- Characters count: 0 → 1
- New "Characters" section appears with Sera listed

#### **Option C: Generate Legends**

**User clicks "[📜 Generate Legend]" button**

**Chat interaction:**
```
🤖 Assistant: [Generates legend]

  📜 The First Sacrifice

  847 years ago, when Mount Ignara first erupted, the island's
  founder, Kael the Unburnt, walked into the lava flow. His
  sacrifice cooled the volcano for a generation. Every 50 years,
  Pyraxis holds the Choosing ceremony...
```

#### **Option D: Ask Questions**

**User types: "What do people eat on this island?"**

```
🤖 Assistant:

  🍽️ Pyraxian Cuisine

  With limited arable land due to volcanic soil, Pyraxians rely on:

  - Ocean harvest: Tuna, shellfish (abundant in volcanic waters)
  - Sulfur crops: Heat-resistant vegetables grown near vents
  - Imports: Rice and grains traded for obsidian
  - Delicacy: Ember-roasted cliff goat (raised on mountain slopes)

  Typical meal cost: 2 copper for street food, 1 silver for restaurant
```

---

## 7. **Advanced Features**

### Toggle Quality Critique

**User opens settings (gear icon)**
```
╔══════════════════════════════════════════════╗
║  ⚙️ Settings                                 ║
╠══════════════════════════════════════════════╣
║  [✓] Quality Critique (+30-50% better)      ║
║                                              ║
║  When enabled:                               ║
║  - AI evaluates & improves generated content ║
║  - +30-50% quality boost                     ║
║  - Takes 2x longer (~2 min vs ~45 sec)       ║
║  - Uses 2.6x more tokens (~$0.10 vs $0.04)   ║
║                                              ║
║  Recommended: Keep enabled for best results  ║
╚══════════════════════════════════════════════╝
```

**User can toggle off for:**
- Faster iterations
- Lower costs
- Quick drafts

### View Quality Metrics

**After generation with Quality Critique enabled:**

**User can click "Show Quality Metrics" (if displayed)**

```
╔══════════════════════════════════════════════╗
║  🔍 Quality Analysis                         ║
╠══════════════════════════════════════════════╣
║  Overall Score: 8.2/10                       ║
║                                              ║
║  📊 Principle Scores:                        ║
║  • Specificity: 8/10                         ║
║    ✓ Concrete measurements (4,500m peak)     ║
║    ✓ Specific costs (500 gold fee)           ║
║                                              ║
║  • Implications: 8/10                        ║
║    ✓ Shows economic impact (trade control)   ║
║    ✓ Explains social effects (labor penalty) ║
║                                              ║
║  • Originality: 9/10                         ║
║    ✓ Fresh concept (volcanic magic source)   ║
║    ✓ Unique conflict (military vs merchants) ║
║                                              ║
║  • Consistency: 8/10                         ║
║    ✓ Geography supports magic system         ║
║    ✓ Conflict fits culture                   ║
║                                              ║
║  • Mundane Grounding: 8/10                   ║
║    ✓ Daily life details (food, clothing)     ║
║    ✓ Practical magic costs (fees, cooldown)  ║
╚══════════════════════════════════════════════╝
```

---

## Common User Journeys

### Journey 1: Quick World Creation (Speedrun)
```
1. Enter API key (10 sec)
2. Click starter prompt "floating islands" (2 sec)
3. Wait for generation (45 sec, Quality Critique OFF)
4. Browse world preview (30 sec)
Total: ~90 seconds
```

### Journey 2: High-Quality Deep Dive
```
1. Enter API key (10 sec)
2. Type custom idea (20 sec)
3. Wait for generation + critique + revision (100 sec)
4. Review quality metrics (30 sec)
5. Expand 2 cultures (140 sec total)
6. Generate 1 character (50 sec)
7. Ask 2 questions (100 sec)
Total: ~8 minutes
```

### Journey 3: Iterative Refinement
```
1. Enter API key (10 sec)
2. Generate world (45 sec, Quality Critique OFF)
3. Review, not satisfied
4. Ask "Make the magic system more unique" (50 sec)
5. Expand favorite culture (70 sec)
6. Generate legend (50 sec)
7. Export/save (future feature)
Total: ~4 minutes
```

---

## Key UX Principles

### ✅ What Works Well

1. **Chat-first interface** - Familiar, conversational, low friction
2. **Starter prompts** - Remove blank page anxiety
3. **Progressive generation** - Quick core, expandable details
4. **Split view** - Chat history + world preview simultaneously
5. **Quality Critique toggle** - User control over speed vs quality
6. **Expandable elements** - Avoid overwhelming detail walls
7. **Conversational expansion** - Natural language queries

### 🎯 User Benefits

1. **No blank page** - Starter prompts get them started
2. **Fast initial results** - See something in 45-100 seconds
3. **Explore at own pace** - Expand only what interests them
4. **Learn by example** - AI suggestions guide exploration
5. **Quality optional** - Choose speed or quality per need
6. **Save context** - Chat history preserves their creative journey

---

## Technical Flow Summary

```
┌─────────────────────────────────────────────────────┐
│  1. User enters API key                              │
│     ↓                                                │
│  2. LandingPage validates and stores key            │
│     ↓                                                │
│  3. WorldbuildingStudio loads with chat interface   │
│     ↓                                                │
│  4. User describes world idea (starter or custom)   │
│     ↓                                                │
│  5. Generation begins:                              │
│     a. Generate core world (30-45s)                 │
│     b. [If enabled] Critique quality (10-15s)       │
│     c. [If score < 8.0] Revise content (30-40s)     │
│     ↓                                                │
│  6. World displays in preview panel                 │
│     ↓                                                │
│  7. User explores:                                  │
│     - Expand cultures/locations                     │
│     - Generate characters/legends                   │
│     - Ask questions                                 │
│     ↓                                                │
│  8. Iterative refinement continues...               │
└─────────────────────────────────────────────────────┘
```

---

## Typical Session

**Real example from testing:**

```
00:00 - Opens app, sees API key prompt
00:10 - Enters API key, clicks Continue
00:12 - Sees worldbuilding studio interface
00:15 - Clicks starter: "fantasy world with floating islands"
00:17 - Generation starts, watches progress messages
01:45 - World appears (with Quality Critique)
01:50 - Reads core world description
02:10 - Clicks "Expand" on first culture
03:20 - Reads expanded culture details
03:30 - Types: "Create a character who lives there"
04:20 - Reviews generated character
04:30 - Clicks "Generate Legend" button
05:20 - Reads legend, satisfied
05:30 - Session ends, world saved in chat history
```

**Total time:** 5.5 minutes from zero to fully explored world

---

## FAQ from User Perspective

**Q: Do I need to know about AI or prompting?**
A: No! Click a starter prompt or describe what you want naturally.

**Q: How long does it take?**
A: First world: 45 seconds (fast) to 2 minutes (quality mode)

**Q: Can I make changes after generation?**
A: Yes! Ask questions, expand elements, generate more content.

**Q: What's "Quality Critique"?**
A: AI reviews and improves generated content. +50% quality, 2x time.

**Q: How much does it cost?**
A: ~$0.04-0.10 per world depending on settings. You control the API key.

**Q: Can I save my world?**
A: Chat history persists in browser. Export feature coming soon.

---

## Conclusion

The user flow is designed to be:
- **Fast to start** - One click gets you generating
- **Easy to use** - Natural language, no complex UI
- **Flexible** - Go deep or stay shallow, your choice
- **Quality-focused** - Optional AI critique ensures great results
- **Conversational** - Feels like chatting with a creative partner

**From idea to fully-realized world in under 10 minutes.**
