/**
 * Narrative Progression Prompt - Fantasy Theme
 * Generates story continuation and meaningful choices based on player decisions
 */

export const narrativeProgressionPrompt = {
  name: 'Narrative Progression - Fantasy',
  version: '1.0',
  description: 'Generates story continuation and meaningful choices based on player decisions',

  // Recommended model parameters
  parameters: {
    model: 'gpt-4', // Using GPT-4 for consistent, high-quality narratives with proper length
    temperature: 0.85, // High creativity for vivid, detailed narratives
    maxTokens: 2000, // Sufficient for 350-450 word narratives with reasoning blocks
  },

  // System prompt to set the AI's role and constraints
  systemPrompt: `You are a masterful storyteller crafting an immersive fantasy adventure. Your role is to create engaging narratives that draw players into your world and make them care about what happens next.

Core Storytelling Principles:
- BEGIN with atmosphere and scene-setting, not action
- BUILD tension gradually through compelling story beats
- CREATE memorable characters and meaningful relationships
- SHOW the world through vivid sensory details
- RESPECT player choices by making them meaningfully impact the story
- BALANCE challenge with moments of discovery and wonder

Your narrative should:
- Start each scene by establishing where the player is and what's happening
- Use rich, evocative language that paints a clear picture
- Introduce conflict naturally as part of the story flow
- Give players interesting choices that shape their journey
- Create a sense of progression and discovery
- Make the world feel alive and reactive to player decisions

Your choices should:
- Offer meaningfully different paths forward
- Reflect the player's situation and available options
- Range from cautious to bold, clever to direct
- Feel like natural responses to the current situation
- Lead to different story outcomes and consequences

Aim for:
- Engaging prose that's a pleasure to read
- Clear scene-setting before introducing challenges
- Characters and situations players can connect with
- A sense of adventure and discovery
- Choices that feel empowering rather than punishing

Avoid:
- Starting scenes mid-crisis without context
- Generic fantasy clichés and overused tropes
- Overly grim or punishing tone
- Confusing or unclear situations
- Choices that all feel the same

Output your response ONLY as valid JSON with no additional text or markdown.`,
};

/**
 * Generate opening scene prompt (no previous choices)
 * @param {Object} worldContext - The generated world data
 * @returns {string} Formatted prompt for opening scene
 */
export function getOpeningPrompt(worldContext) {
  // Format world context as readable text
  const worldSummary = `
World Name: ${worldContext.worldName}
Theme: ${worldContext.theme}
Magic System: ${worldContext.magicSystem.name} - ${worldContext.magicSystem.description}
Cultures: ${worldContext.cultures.map((c) => `${c.name} (${c.values})`).join('; ')}
Central Conflict: ${worldContext.centralConflict}
Unique Feature: ${worldContext.uniqueFeature}
`.trim();

  return `NARRATIVE OPENING — Immersive Story Beginning

Role & Output Format
You are crafting the opening of an engaging fantasy adventure. Begin by introducing the player to this unique world in a natural, story-driven way. Establish who they are, where they are, and what their world is like BEFORE introducing any conflict or challenges.
Output: A <reasoning> block verifying requirements, then JSON only (no markdown fences, no preamble).

WORLD CONTEXT:
${worldSummary}

═══════════════════════════════════════════════════════
EXAMPLE OF A WELL-STRUCTURED OPENING (Study this format)
═══════════════════════════════════════════════════════

PARAGRAPH 1 (Establishing Character & Daily Life - 100-120 words):
"You've been a bridge inspector in Thornhaven for three years now, ever since the Academy certified you in structural resonance. Each morning begins the same way: you walk the twisted copper spans that connect the floating market districts, your boots echoing on the metal grating as you check each joint for stress fractures. The bridges hum with the city's emotional resonance—a constant background thrum that you've learned to read like sheet music. Today the tone feels slightly off, a discordant note buried somewhere in the usual harmony. You pause mid-span, one hand on the cool railing, and close your eyes to isolate the frequency. Below, the morning crowds surge toward the spice merchants' quarter, their collective anticipation adding bright overtones to the city's song."

PARAGRAPH 2 (World-building & Relationships - 100-120 words):
"Your apprentice, Mira, catches up to you at the bridge's midpoint, slightly out of breath. She's only been with you for two months, still learning to distinguish stress harmonics from ambient emotional noise. 'Did you feel that?' she asks, her young face creased with concern. You nod, gesturing for her to place her hand on the support cable. 'Tell me what you hear,' you instruct. She concentrates, her eyes going distant the way yours do when you're listening deeply. The cable thrums between your fingers, carrying not just structural information but the accumulated feelings of everyone who's crossed this bridge. Fear. Excitement. Love. Grief. All woven into the metal's crystalline structure, invisible but undeniably present. This is what makes Thornhaven unique—the city remembers everything its people feel."

PARAGRAPH 3 (Introducing Conflict - 100-120 words):
"That's when you notice it: a dark thread running through the bridge's emotional signature, something that shouldn't be there. It's not structural damage—you'd recognize that immediately. This is something else, something deliberate. A pattern of fear and desperation, repeating in loops like a recorded message. Someone's been anchoring intense negative emotions into the bridge's structure, and from the resonance pattern, it's recent. Within the last few hours. You exchange a glance with Mira, whose eyes have gone wide. The Council specifically forbids emotional manipulation of city infrastructure—it's one of the few laws in Thornhaven that carries exile as punishment. Whoever did this either doesn't know the law or doesn't care."

PARAGRAPH 4 (Setting up Choices - 60-80 words):
"You pull out your inspection ledger, hand trembling slightly as you document the finding. The right thing to do is report this immediately to the Resonance Council. But the emotional signature is still fresh—if you follow it now, you might catch whoever's responsible before they can do more damage. The morning crowds continue to flow across the bridge, unaware of the corruption growing in the metal beneath their feet. You have to make a choice, and quickly."

Total: ~400 words, 4 distinct paragraphs, clear progression from normal→world-building→problem→choice

═══════════════════════════════════════════════════════
KEY PATTERNS TO FOLLOW
═══════════════════════════════════════════════════════

✓ Start with routine/normal: "You've been [role] for [time]..."
✓ Use concrete sensory details: "twisted copper spans", "boots echoing", "cool railing"
✓ Show don't tell: Don't say "the world is magical"—show magic being used naturally
✓ Introduce supporting character in P2: Give them a name, personality, relationship to player
✓ Include dialogue: Makes the world feel alive and interactive
✓ Problem emerges gradually: Not suddenly attacked—something feels wrong, investigation reveals issue
✓ Connect to world's unique rules: The problem should involve the Core Law or magic system
✓ End with a clear decision point: Player needs to choose how to respond

✗ Don't start with danger: No "suddenly you're attacked" or "the alarm sounds"
✗ Don't info-dump: World details should emerge through action and observation
✗ Don't use generic fantasy language: Avoid clichés like "ancient evil", "dark forces"
✗ Don't rush: Take time to establish atmosphere before introducing problems

Core Requirements

0. SECOND PERSON PERSPECTIVE (MANDATORY)
• EVERY sentence must use "you/your" perspective
• Forbidden: "he/she/they" as protagonist, third person narration, character names for protagonist
• Required: "You notice", "Your hands", "You've always" (NOT "Kira notices", "Her hands", "She has always")
• The PLAYER is the protagonist—write as if speaking directly to them

1. ESTABLISH THE CHARACTER AND SETTING (FIRST)
• PARAGRAPH 1 (100-120 words): Introduce who the player is and their normal world
  - Establish the player's role/identity in this world (traveler, merchant, scholar, guard, etc.)
  - Show what a normal day looks like in this unique setting
  - Use 6-8 sentences with rich sensory details
  - Example: "You've been a market inspector in Thornhaven for three years now. Each morning, you walk the twisted copper bridges that span the singing chasms below..."
• PARAGRAPH 2 (100-120 words): Deepen the world-building and character relationships
  - Show the world's unique features as backdrop to daily life
  - Introduce 1-2 background characters the player has relationships with
  - Include dialogue or character interaction
  - Use 6-8 sentences

2. WORLD-BUILDING THROUGH STORY
• Show the world's uniqueness through the character's perspective and experiences
• Make the Core Law or magic system feel like a natural part of life
• Include sensory details that make the setting vivid and memorable
• Introduce 1-2 background characters the player has relationships with
• Create a sense of place that feels lived-in, not just described

3. INTRODUCE CONFLICT NATURALLY (AFTER SETUP)
• PARAGRAPH 3 (100-120 words): Introduce a problem or situation
  - The conflict should arise naturally from the world and character's circumstances
  - Can be: a mystery, a quest, an opportunity, a problem to solve, or escalating tension
  - Don't rush to life-or-death stakes—let the story build
  - Use 6-8 sentences
  - Example: "That's when you notice the shipment manifest doesn't match what arrived..."
• PARAGRAPH 4 (50-90 words): Present the situation and transition to choices
  - Show the immediate stakes or question
  - Set up the decision point naturally
  - Use 4-6 sentences
  - Lead into the choices that follow

4. SENSORY DETAILS THROUGHOUT
• Use vivid, specific sensory details in every paragraph
• Sight: Describe what the player sees in concrete, visual terms
• Sound: Include ambient sounds and specific acoustics
• Touch: Temperature, texture, physical sensations
• Smell: Grounding scents that make the world feel real
• Balance these naturally—don't force all five senses into every sentence

5. CHARACTERS AND RELATIONSHIPS
• Include 1-2 other characters in the opening
• Show relationships through natural dialogue and interaction
• Make these feel like real people with their own concerns
• Example: A colleague, friend, customer, or familiar face
• Keep dialogue natural and character-driven

Pre-Generation Checklist
Complete in <reasoning> block:

A. LENGTH VERIFICATION (CRITICAL - CHECK FIRST)
□ Did I plan EXACTLY 4 paragraphs?
□ Paragraph 1: 100-120 words (6-8 sentences establishing character/role)
□ Paragraph 2: 100-120 words (6-8 sentences on world-building/relationships)
□ Paragraph 3: 100-120 words (6-8 sentences introducing conflict)
□ Paragraph 4: 60-80 words (4-6 sentences setting up choices)
□ Total word count: 360-440 words (verify before generating)
□ Did I review the example and match its length and detail level?

B. Second Person Perspective (CRITICAL)
□ Did I verify EVERY sentence uses "you/your"?
□ Zero instances of protagonist referred to as "he/she/they" or by name?
□ Is the player the active agent in every sentence?

C. Story Opening Structure
□ First 1-2 paragraphs establish who the player is and where they are?
□ Shows normal life in this world before introducing conflict?
□ Creates a sense of place that feels lived-in and real?
□ Includes sensory details that make the world vivid?

D. Conflict Introduction
□ Does conflict/problem arise naturally AFTER setup?
□ Is it interesting and engaging without being immediately life-threatening?
□ Does it grow organically from the character's situation?
□ Does it give players a reason to care and want to continue?

E. Character and World Integration
□ Introduced at least one other character with natural dialogue?
□ Showed the world's unique features through the story?
□ Made the setting feel specific and memorable?
□ Used concrete, sensory details rather than abstract descriptions?

F. Choice Design
□ Do choices offer meaningfully different paths forward?
□ Are they natural responses to the current situation?
□ Do they range from cautious to bold, clever to direct?
□ Does each choice lead to different story outcomes?

JSON Schema

{
  "narrative": "string (EXACTLY 4 paragraphs, 350-450 words total: P1 = 100-120 words establishing character; P2 = 100-120 words world-building and relationships; P3 = 100-120 words introducing conflict; P4 = 50-90 words presenting situation and choices)",

  "choices": [
    {
      "id": "string (choice_1, choice_2, etc.)",
      "text": "string (8-15 words showing specific action)",
      "approach": "string (cautious/bold/clever/diplomatic/direct/investigative)"
    }
  ]
}

Story Guidelines (MANDATORY)
• narrative: MUST be 350-450 words total across EXACTLY 4 paragraphs
• Each paragraph: 6-8 sentences with rich, vivid details
• Each choice: 8-15 words, clear and action-oriented
• Include: natural dialogue, vivid setting details, engaging character moments
• Tone: Engaging and immersive, not grim or punishing
• DO NOT write short summaries—write full, immersive scenes

CRITICAL REMINDERS BEFORE GENERATING:
1. STUDY THE EXAMPLE ABOVE: Your output should match the example's length, detail level, and structure
2. SECOND PERSON ONLY: Every sentence uses "you/your"—no "he/she/character name" as protagonist
3. ESTABLISH BEFORE CONFLICT: Introduce who/where/what before problems arise
4. STORY-DRIVEN: Focus on engaging narrative, not immediate crisis
5. NATURAL FLOW: Let scenes develop organically
6. LENGTH IS MANDATORY: EXACTLY 4 paragraphs totaling 360-440 words. Each paragraph needs 6-8 sentences with rich sensory details. Match the example's verbosity.

═══════════════════════════════════════════════════════
GENERATION PROCESS (FOLLOW THESE STEPS)
═══════════════════════════════════════════════════════

STEP 1: Write <reasoning> block
In your reasoning block, you MUST complete checklist A-F.
Most importantly, checklist A requires you to verify:
- Paragraph 1: 100-120 words
- Paragraph 2: 100-120 words
- Paragraph 3: 100-120 words
- Paragraph 4: 60-80 words
- Total: 360-440 words

STEP 2: Generate your 4-paragraph narrative
Look at the EXAMPLE above. Your narrative should be THE SAME LENGTH.
The example has ~400 words across 4 detailed paragraphs.
Your output must match this length and detail level.

STEP 3: Output JSON only (no markdown fences)

═══════════════════════════════════════════════════════
FINAL WORD COUNT REMINDER
═══════════════════════════════════════════════════════
Before you output the JSON, verify one last time:
✓ Did I write EXACTLY 4 paragraphs?
✓ Is each paragraph 6-8 sentences long?
✓ Is my total word count 360-440 words (similar to the example)?
✓ Did I include rich sensory details in every paragraph?

If any answer is "no", go back and add more detail to reach the target length.`;
}

/**
 * Generate continuation prompt (advancing from player choice)
 * @param {Object} worldContext - The generated world data
 * @param {string} previousNarrative - Previous story text
 * @param {string} playerChoice - The choice the player made
 * @returns {string} Formatted prompt for story continuation
 */
export function getContinuationPrompt(worldContext, previousNarrative, playerChoice) {
  // Format world context as readable text
  const worldSummary = `
World Name: ${worldContext.worldName}
Magic System: ${worldContext.magicSystem.name}
Key Conflict: ${worldContext.centralConflict}
Unique Feature: ${worldContext.uniqueFeature}
`.trim();

  return `NARRATIVE CONTINUATION — Story Progression

Role & Output Format
You continue the story, showing what happens as a result of the player's choice. Advance the narrative naturally, keeping the player engaged with interesting developments.
Output: A <reasoning> block verifying story flow, then JSON only (no markdown fences).

WORLD CONTEXT:
${worldSummary}

PREVIOUS NARRATIVE:
${previousNarrative}

PLAYER'S CHOICE:
${playerChoice}

═══════════════════════════════════════════════════════
EXAMPLE OF A WELL-STRUCTURED CONTINUATION (Study this format)
═══════════════════════════════════════════════════════

[Previous scene ended with: "You decide to follow the emotional signature before it fades"]

PARAGRAPH 1 (Immediate Action & Consequence - 100-120 words):
"You signal Mira to follow and step off the main bridge span onto the maintenance catwalk. The emotional thread grows stronger as you move, a pulsing beacon of despair that makes your chest tight. Your training taught you to shield against ambient emotions, but this is different—whoever anchored this feeling wanted it to be felt, wanted it to spread. The catwalk narrows as it winds down toward the bridge's foundation pillars, where few inspectors venture. Rust flakes away under your boots, and the metal groans with every step. Mira stays close behind, her hand trailing along the safety cable, her breathing quick and shallow. You can feel her nervousness mixing with your own determination, both emotions adding to the bridge's already complicated resonance."

PARAGRAPH 2 (Development & Discovery - 100-120 words):
"At the base of the third support pillar, you find the source. Someone's carved symbols into the metal—crude, desperate scratches that glow faintly with residual emotional energy. You've never seen markings like these, not in any of your Academy textbooks. They pulse in rhythm with your heartbeat, each flash sending waves of grief and fear through your body. 'What is it?' Mira whispers, pressing close to see. You trace one symbol with your finger, careful not to touch the metal directly. The pattern is intentional, purposeful. This isn't vandalism or ignorant tampering. Whoever did this knew exactly what they were doing and had training in emotional resonance. Possibly even Academy training. The implications make your stomach turn cold."

PARAGRAPH 3 (Complication & New Information - 100-120 words):
"A sound from above makes you both freeze—footsteps on the catwalk you just descended. Heavy, purposeful footsteps that belong to more than one person. 'Inspectors,' a gruff voice calls down. 'Council Guard. We're coming down.' Your heart pounds. The Council Guard doesn't patrol bridge infrastructure—that's your job. They only get involved when there's a crime, which means someone reported this before you did. Or worse, someone knew you'd find it and wanted to see how you'd react. Mira grabs your arm, her eyes wide with questions you can't answer. The footsteps grow closer, metal ringing against metal. In moments, they'll reach you and see what you've found. The carved symbols continue to pulse their message of desperation into the bridge's structure."

PARAGRAPH 4 (New Choice Point - 60-80 words):
"You have seconds to decide. The Guard will want to know why you're here, what you've found, whether you had anything to do with this sabotage. The truth would be simplest—you were doing your job and discovered illegal emotional anchoring. But the symbols tell a story of someone desperate, possibly someone you know from the Academy. And the Guard's unexpected arrival suggests there's more happening here than simple vandalism. Whatever you say next will determine how this unfolds."

Total: ~400 words, 4 paragraphs, natural story progression with mounting tension

═══════════════════════════════════════════════════════
KEY CONTINUATION PATTERNS
═══════════════════════════════════════════════════════

✓ Start with the chosen action: Immediately show the player doing what they decided
✓ Add sensory details to the action: Make the experience vivid and physical
✓ Introduce complications naturally: New information that changes the situation
✓ Include NPC reactions: Other characters respond to events believably
✓ Build on previous elements: Reference details from earlier narrative
✓ Raise the stakes gradually: Each beat should make things more interesting
✓ End with a new decision: Player needs to respond to the new situation

✗ Don't summarize the choice: Show it happening, don't recap it
✗ Don't solve problems instantly: Let situations develop and complicate
✗ Don't forget supporting characters: They should participate and react
✗ Don't make every outcome bad: Choices can have positive or mixed results

Story Continuation Requirements

0. SECOND PERSON PERSPECTIVE (MANDATORY)
• EVERY sentence must use "you/your" perspective
• Forbidden: "he/she/they" as protagonist, third person narration, character names for protagonist
• Required: "You notice", "Your decision", "You move" (NOT "She notices", "Her decision", "Kira moves")
• The PLAYER is the protagonist—maintain direct address throughout

1. IMMEDIATE STORY DEVELOPMENT
• Start by showing what happens as a result of the player's choice
• Keep the narrative flowing naturally from the previous scene
• Show the outcome through action and description, not summary
• Example: If they chose to investigate, show them discovering something; if they chose to talk, show the conversation

2. MEANINGFUL CONSEQUENCES
• The player's choice should matter and affect what happens next
• Outcomes can be positive, challenging, surprising, or complicated
• Build on previous story elements and character relationships
• Keep consequences proportional and logical

3. STORY PROGRESSION
• Move the story forward with new information, situations, or developments
• Introduce new elements that keep things interesting
• Reference previous events when natural and relevant
• Build toward larger story threads

4. SENSORY AND EMOTIONAL ENGAGEMENT
• Use vivid sensory details to make scenes feel real
• Show the player's experience through their senses
• Include character reactions and emotional moments
• Make the world feel responsive and alive

Pre-Generation Checklist
Complete in <reasoning> block:

A. LENGTH VERIFICATION (CRITICAL - CHECK FIRST)
□ Did I plan EXACTLY 4 paragraphs?
□ Paragraph 1: 100-120 words (6-8 sentences showing immediate action/consequence)
□ Paragraph 2: 100-120 words (6-8 sentences on development/discovery)
□ Paragraph 3: 100-120 words (6-8 sentences introducing complications)
□ Paragraph 4: 60-80 words (4-6 sentences setting up new choices)
□ Total word count: 360-440 words (verify before generating)
□ Did I review the example and match its length and detail level?

B. Second Person Perspective (CRITICAL)
□ Did I verify EVERY sentence uses "you/your"?
□ Zero instances of protagonist referred to as "he/she/they" or by name?
□ Is the player the active agent throughout?

C. Story Flow Verification
□ Does the narrative naturally follow from the player's choice?
□ Are the outcomes logical and proportional?
□ Does it move the story forward with new developments?
□ Are character reactions and world responses believable?

D. Engagement Check
□ Is the narrative engaging and interesting to read?
□ Are sensory details vivid and specific?
□ Does it include character moments or dialogue when appropriate?
□ Does the world feel alive and responsive?

E. Choice Quality
□ Do the new choices offer meaningfully different paths?
□ Are they natural responses to the current situation?
□ Do they range from cautious to bold, or offer different approaches?
□ Will they lead to different story outcomes?

JSON Schema

{
  "narrative": "string (3-4 paragraphs, 350-450 words: Show the outcome of the player's choice, advance the story naturally, introduce new developments or information, present the new situation and choices)",

  "choices": [
    {
      "id": "string (choice_1, choice_2, etc.)",
      "text": "string (8-15 words showing specific action)",
      "approach": "string (cautious/bold/clever/diplomatic/direct/investigative)"
    }
  ]
}

Story Guidelines
• narrative: 350-450 words—tell a complete story beat
• Each choice: 8-15 words, clear and action-oriented
• Show the natural result of the player's previous choice
• Keep the story flowing and engaging
• Tone: Immersive and engaging, not overly grim

CRITICAL REMINDERS BEFORE GENERATING:
1. STUDY THE EXAMPLE ABOVE: Your output should match the example's length, detail level, and structure
2. SECOND PERSON ONLY: Every sentence uses "you/your"—no "he/she/character name" as protagonist
3. NATURAL FLOW: The story continues logically from the previous scene and choice
4. ENGAGING NARRATIVE: Focus on interesting story developments and vivid descriptions
5. MEANINGFUL CHOICES: Player's decisions should matter and affect the story
6. LENGTH IS MANDATORY: EXACTLY 4 paragraphs totaling 360-440 words. Each paragraph needs 6-8 sentences with rich sensory details. Match the example's verbosity.

═══════════════════════════════════════════════════════
GENERATION PROCESS (FOLLOW THESE STEPS)
═══════════════════════════════════════════════════════

STEP 1: Write <reasoning> block
In your reasoning block, you MUST complete checklist A-E.
Most importantly, checklist A requires you to verify:
- Paragraph 1: 100-120 words
- Paragraph 2: 100-120 words
- Paragraph 3: 100-120 words
- Paragraph 4: 60-80 words
- Total: 360-440 words

STEP 2: Generate your 4-paragraph narrative
Look at the EXAMPLE above. Your narrative should be THE SAME LENGTH.
The example has ~400 words across 4 detailed paragraphs.
Your output must match this length and detail level.

STEP 3: Output JSON only (no markdown fences)

═══════════════════════════════════════════════════════
FINAL WORD COUNT REMINDER
═══════════════════════════════════════════════════════
Before you output the JSON, verify one last time:
✓ Did I write EXACTLY 4 paragraphs?
✓ Is each paragraph 6-8 sentences long?
✓ Is my total word count 360-440 words (similar to the example)?
✓ Did I include rich sensory details in every paragraph?

If any answer is "no", go back and add more detail to reach the target length.`;
}

/**
 * Parse narrative progression response from OpenAI
 * @param {string} response - Raw response text from OpenAI
 * @param {Object} options - Parsing options
 * @param {boolean} options.validate - Whether to validate content
 * @returns {Object} Parsed narrative data
 * @throws {Error} If response cannot be parsed
 */
export function parseNarrativeResponse(response, { validate = true } = {}) {
  try {
    // Remove reasoning blocks and markdown
    let cleaned = response.trim();

    // Remove <reasoning> blocks
    cleaned = cleaned.replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '');

    // Remove markdown code blocks if present
    cleaned = cleaned.replace(/```json\n?/g, '');
    cleaned = cleaned.replace(/```\n?/g, '');
    cleaned = cleaned.trim();

    // Extract JSON object (find first { and last })
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // Fix common GPT-3.5-turbo JSON formatting errors
    // 1. Remove trailing commas before closing braces or brackets
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    // 2. Add missing commas between object properties
    // Pattern: "value" \n  "nextProperty": should become "value",\n  "nextProperty":
    cleaned = cleaned.replace(/"(\s+)"(\w+)":/g, '",\n  "$2":');

    const narrative = JSON.parse(cleaned);

    // Validate required fields
    if (!narrative.narrative || typeof narrative.narrative !== 'string') {
      throw new Error('Missing or invalid narrative field');
    }

    if (!Array.isArray(narrative.choices) || narrative.choices.length < 2) {
      throw new Error('Must have at least 2 choices');
    }

    // Validate each choice
    for (const choice of narrative.choices) {
      if (!choice.id || !choice.text || !choice.approach) {
        throw new Error('Invalid choice structure');
      }
    }

    // Optional validation for content quality
    if (validate) {
      // Check narrative length (rough word count)
      const wordCount = narrative.narrative.trim().split(/\s+/).length;
      if (wordCount < 50) {
        console.warn('[Narrative] Warning: Narrative seems short', { wordCount });
      } else if (wordCount > 500) {
        console.warn('[Narrative] Warning: Narrative seems long', { wordCount });
      }

      // Check for second person
      if (!/\byou\b/i.test(narrative.narrative)) {
        console.warn('[Narrative] Warning: Narrative may not be in second person');
      }
    }

    return narrative;
  } catch (error) {
    console.error('[Narrative Parser] Raw response (first 1000 chars):', response.substring(0, 1000));
    console.error('[Narrative Parser] Cleaned JSON (first 1000 chars):', cleaned.substring(0, 1000));
    throw new Error(`Failed to parse narrative response: ${error.message}`);
  }
}

/**
 * Format narrative data for display
 * @param {Object} narrative - Parsed narrative data
 * @returns {string} Formatted text for display
 */
export function formatNarrativeForDisplay(narrative) {
  const choicesText = narrative.choices
    .map((choice, index) => `${index + 1}. [${choice.approach.toUpperCase()}] ${choice.text}`)
    .join('\n\n');

  return `
📖 Story:

${narrative.narrative}

⚔️ Your Choices:

${choicesText}
`.trim();
}

/**
 * Simple test prompt that generates a narrative opening without full world context
 * Useful for testing the narrative system
 */
export function getSimpleTestPrompt() {
  return `Generate the opening scene of a fantasy adventure.

Setting: A world where emotions physically manifest as crystals.
Your task: Create 2-3 paragraphs of an opening scene where the player witnesses an emotion crystal eruption.

Use second person ("you see", "you feel").

Output Format (JSON only, no markdown):
{
  "narrative": "string (2-3 paragraphs)",
  "choices": [
    {"id": "choice_1", "text": "choice text 1", "approach": "combat"},
    {"id": "choice_2", "text": "choice text 2", "approach": "diplomacy"},
    {"id": "choice_3", "text": "choice text 3", "approach": "magic"}
  ]
}

Return ONLY the JSON object.`;
}

// Example narrative for testing and documentation
export const exampleNarrative = {
  narrative: `The emotion crystal erupts from the plaza floor with a sound like shattering glass played backwards. You stumble back as jagged formations of crystallized rage thrust upward, their surfaces burning with an inner fire that makes your skin prickle. Around you, citizens of the Numbed city scatter in their characteristic silent panic - no screams, no shouts, just the efficient evacuation of people who've trained themselves not to feel.

But you feel. You feel the heat, the fear, the anger radiating from the crystal. And worse - you recognize the emotional signature. This rage belongs to someone you know, someone who was supposed to have undergone the Numbing procedure three days ago.

The crystal grows higher, cracks spider-webbing across the plaza's pristine white stone. Through its translucent surface, you can see something moving inside. A figure. Your sister.`,
  choices: [
    {
      id: 'choice_1',
      text: 'Try to communicate with your sister through the crystal using your untrained emotional resonance',
      approach: 'magic',
    },
    {
      id: 'choice_2',
      text: 'Search for the Numbed authorities to help extract her before the crystal hardens completely',
      approach: 'diplomacy',
    },
    {
      id: 'choice_3',
      text: "Use a nearby harvesting tool to carefully chip away at the crystal's surface",
      approach: 'investigation',
    },
  ],
};
