/**
 * Collaborative Worldbuilding System
 *
 * Helps users brainstorm and flesh out vague ideas through
 * intelligent questioning and iterative refinement.
 *
 * Philosophy: The AI is a brainstorming PARTNER, not a generator.
 * - Ask clarifying questions
 * - Help users think deeper
 * - Turn vague ideas into concrete, original details
 */

/**
 * Analyze user's initial concept and generate smart questions
 *
 * @param {string} initialIdea - User's vague world concept
 * @returns {Object} Analysis and questions to ask
 */
export function analyzeConceptAndGenerateQuestions(initialIdea) {
  const lower = initialIdea.toLowerCase();

  // Detect what they mentioned
  const mentions = {
    magic: /magic|power|ability|spell|sorcery|mystical|supernatural/i.test(initialIdea),
    technology: /tech|science|robot|ai|cyber|nano|genetic/i.test(initialIdea),
    geography: /island|mountain|desert|ocean|forest|city|world|planet|realm/i.test(initialIdea),
    culture: /people|culture|society|civilization|tribe|nation|kingdom/i.test(initialIdea),
    conflict: /war|conflict|tension|fight|struggle|against|vs/i.test(initialIdea),
    economy: /trade|economy|resource|valuable|wealth|currency/i.test(initialIdea),
    specific: /\d+|specific|exactly|precisely/i.test(initialIdea), // Did they give specifics?
  };

  // Detect vagueness level (0-10, higher = more vague)
  let vagueness = 5;
  const vagueWords = ['some', 'maybe', 'kind of', 'sort of', 'like', 'similar', 'typical', 'normal', 'basic'];
  vagueWords.forEach(word => {
    if (lower.includes(word)) vagueness += 1;
  });

  const specificWords = ['exactly', 'specifically', 'precisely', 'measured', 'gram', 'meter', 'day', 'year'];
  specificWords.forEach(word => {
    if (lower.includes(word)) vagueness -= 2;
  });
  vagueness = Math.max(0, Math.min(10, vagueness));

  // Generate questions based on what's missing or vague
  const questions = [];

  // Always ask: What makes it UNIQUE?
  questions.push({
    key: 'uniqueHook',
    question: `What makes your world **different** from typical ${mentions.magic ? 'fantasy' : mentions.technology ? 'sci-fi' : 'fictional'} worlds?\n\n💡 **Tip**: Think of ONE specific thing that makes people go "I've never seen that before!"\n\n**Examples**:\n- "Magic users must burn personal memories as fuel"\n- "Gravity reverses at noon every day"\n- "All metal rusts instantly, so everything is organic"\n\nWhat's YOUR unique hook?`,
    isRequired: true,
    category: 'core'
  });

  // Ask about power system (if mentioned)
  if (mentions.magic || mentions.technology) {
    questions.push({
      key: 'powerLimitations',
      question: `You mentioned ${mentions.magic ? 'magic' : 'technology'}. Let's make it **concrete and limited**.\n\n**Give me 2-3 SPECIFIC limitations**:\n\n💡 **Good examples**:\n- "Can only lift 50kg for 5 minutes per gram of copper burned"\n- "Each use ages the caster by 1 day"\n- "Must be within sight of running water"\n\n💡 **Bad examples** (too vague):\n- "It's limited by energy"\n- "It's powerful but tiring"\n- "There are rules"\n\nWhat are the **specific, measurable** limits?`,
      isRequired: true,
      category: 'power'
    });
  }

  // Ask about sensory details (geography)
  if (mentions.geography || vagueness > 6) {
    questions.push({
      key: 'sensoryDetails',
      question: `Let's make your world **feel real**. \n\n**Pick ONE location and describe it with 3 senses**:\n\n**What does it:**\n- **Look like?** (specific colors, textures, scale)\n- **Sound like?** (ambient noises, echoes, silence)\n- **Smell like?** (pleasant, harsh, unusual)\n\n💡 **Example**: \n"The trading port: Bronze-sailed ships (LOOK), constant bell chimes from tide markers (SOUND), salt mixed with burning seaweed fuel (SMELL)"\n\nYour turn:`,
      isRequired: false,
      category: 'immersion'
    });
  }

  // Ask about conflict (if not mentioned)
  if (!mentions.conflict) {
    questions.push({
      key: 'centralTension',
      question: `Every great world has **tension**. What do people **argue about** in your world?\n\n💡 **Be specific about the stakes**:\n\n**Good examples**:\n- "Whether to open ancient vaults that contain both cures and plagues"\n- "Who controls the only river - upstream farmers or downstream cities"\n- "Whether AI should vote (they're 40% of the population)"\n\n**Bad examples** (too generic):\n- "Good vs evil"\n- "There's a war"\n- "Political conflict"\n\nWhat's the **specific** tension with **real stakes**?`,
      isRequired: true,
      category: 'conflict'
    });
  }

  // Ask about daily life (make it grounded)
  questions.push({
    key: 'concreteDetail',
    question: `Let's ground this in **daily life**. Pick ONE and be **specific**:\n\n**Either:**\n1. **What do people eat?** (Not just "fish" - what kind, prepared how, costs what?)\n2. **What's valuable?** (Name the currency/trade good + exact value of common items)\n3. **What's a common profession?** (Describe a typical work day with hours/tasks/pay)\n\n💡 **Example**:\n"Currency: Woven glass beads. 1 blue bead = 1 day's food. 1 red bead = 1 week's rent. Master weavers can make 3 beads per day."\n\nYour answer:`,
    isRequired: false,
    category: 'grounding'
  });

  return {
    vaguenessLevel: vagueness,
    mentions,
    questions: questions,
    totalQuestions: questions.filter(q => q.isRequired).length,
    summary: `I found ${questions.length} areas to explore together to make this world truly original.`
  };
}

/**
 * Build generation context from interview answers
 *
 * @param {string} initialIdea - Original concept
 * @param {Object} answers - User's answers to questions
 * @returns {Object} Context for world generation
 */
export function buildGenerationContext(initialIdea, answers) {
  return {
    originalConcept: initialIdea,
    uniqueHook: answers.uniqueHook || null,
    powerSystem: {
      limitations: answers.powerLimitations || null,
      concrete: !!answers.powerLimitations
    },
    sensoryDetails: answers.sensoryDetails || null,
    conflict: {
      tension: answers.centralTension || null,
      specific: !!answers.centralTension
    },
    dailyLife: answers.concreteDetail || null,
    hasSpecifics: Object.values(answers).filter(a => a).length,
    readyToGenerate: !!answers.uniqueHook && (!!answers.powerLimitations || !!answers.centralTension)
  };
}

/**
 * Create enhanced generation prompt using interview context
 *
 * @param {Object} context - Context from buildGenerationContext
 * @returns {string} Enhanced system prompt
 */
export function createContextualPrompt(context) {
  let prompt = `You are a master worldbuilding partner working with a creative author/designer.

CRITICAL: This world MUST be ORIGINAL and SPECIFIC. The user has given you detailed answers - USE THEM EXACTLY.

# User's Unique Vision

Original Concept: ${context.originalConcept}

UNIQUE HOOK (THE CORE): ${context.uniqueHook}
→ Everything in this world should support this unique element. Make it CENTRAL, not a footnote.

`;

  if (context.powerSystem.limitations) {
    prompt += `# Power/Magic System Limitations
The user specified EXACT limitations: ${context.powerSystem.limitations}

→ Use THESE limitations verbatim. Don't water them down or make them vaguer.
→ Add costs and vulnerabilities that logically follow from these limitations.
→ Show how these specific limits shape society and conflict.

`;
  }

  if (context.sensoryDetails) {
    prompt += `# Sensory Details
The user provided: ${context.sensoryDetails}

→ Use these EXACT details in the world description.
→ Add similar sensory richness to other locations/elements.
→ Make readers FEEL they're in this world.

`;
  }

  if (context.conflict.tension) {
    prompt += `# Central Tension
The user defined: ${context.conflict.tension}

→ This is THE conflict. Not "good vs evil" or generic war.
→ Build factions around THIS specific tension.
→ Show why BOTH sides have valid points.
→ Make the stakes clear and personal.

`;
  }

  if (context.dailyLife) {
    prompt += `# Daily Life / Grounding
The user specified: ${context.dailyLife}

→ Use these EXACT details for economy/trade/life.
→ Show how ordinary people interact with the unique elements.
→ Make it feel lived-in, not just epic and grand.

`;
  }

  prompt += `
# CRITICAL REQUIREMENTS

1. **ORIGINALITY**:
   - NO generic fantasy names ("The Ancient Council", "Dark Lord", "Crystal of Power")
   - NO overused descriptors ("ancient", "mysterious", "powerful" without specifics)
   - CREATE names that reflect the world's unique hook

2. **SPECIFICITY**:
   - Give MEASUREMENTS (50kg, 5 minutes, 1 gram, 3 days)
   - Give NUMBERS (population, distances, costs, quantities)
   - Give CONCRETE EXAMPLES (not "they value honor" but "a warrior who breaks oath must shave their head and serve for 1 year")

3. **INTERNAL CONSISTENCY**:
   - Everything should logically follow from the unique hook
   - Limitations should create interesting problems
   - Society should be shaped by the power system and geography

4. **DEPTH**:
   - Show cause and effect
   - Explain WHY things are the way they are
   - Connect geography → resources → economy → culture → conflict

# Output Format

Generate a world foundation as JSON with these fields:
- worldName: (ORIGINAL name reflecting unique hook, not generic)
- coreHook: (Restate the user's unique hook in an engaging way)
- uniqueAspect: (The ONE thing that makes this world different)
- geography: (150-200 words with SENSORY details, measurements, specific locations)
- magicSystem or technologySystem: (150-200 words with USER'S EXACT limitations + costs + vulnerabilities)
- conflict: (100-150 words using USER'S tension + specific stakes + why both sides are right)
- cultures: [array of 3 cultures, each with]:
  - name: (ORIGINAL, derived from world's unique aspects)
  - overview: (100-150 words with CONCRETE details about daily life, traditions, values)
  - values: (3-5 specific values)
  - concreteExample: (One specific tradition/law/practice that shows their values in action)

REMEMBER: Use the user's specific details EXACTLY as given. Don't make them vaguer. Make the rest of the world match that level of specificity.`;

  return prompt;
}

/**
 * Identify what feels generic in generated output
 *
 * @param {Object} worldData - Generated world
 * @returns {Array} List of potentially generic elements with suggestions
 */
export function identifyGenericElements(worldData) {
  const issues = [];

  // Check for generic naming patterns
  const genericNamePatterns = [
    /^The .+ (Council|Order|Empire|Kingdom|Guild)$/i,
    /^(Ancient|Dark|Crystal|Shadow|Light|Fire|Ice) (Lord|King|Queen|Master|One)$/i,
    /.*(ancient|elder|primordial|eternal|timeless).*/i,
  ];

  if (worldData.name) {
    genericNamePatterns.forEach(pattern => {
      if (pattern.test(worldData.name)) {
        issues.push({
          element: 'World Name',
          value: worldData.name,
          problem: 'Generic naming pattern detected',
          suggestion: 'Consider a name derived from the world\'s unique hook or geography'
        });
      }
    });
  }

  // Check culture names
  if (worldData.cultures) {
    worldData.cultures.forEach(culture => {
      genericNamePatterns.forEach(pattern => {
        if (pattern.test(culture.name)) {
          issues.push({
            element: `Culture: ${culture.name}`,
            value: culture.name,
            problem: 'Generic naming pattern',
            suggestion: 'Create names that reflect their unique traits or environment'
          });
        }
      });
    });
  }

  // Check for vague descriptors
  const vagueDescriptors = ['ancient', 'powerful', 'mysterious', 'mystical', 'magical', 'dark', 'light'];
  const text = JSON.stringify(worldData).toLowerCase();

  vagueDescriptors.forEach(word => {
    const count = (text.match(new RegExp(word, 'g')) || []).length;
    if (count > 3) {
      issues.push({
        element: 'Description Style',
        value: `Overuse of "${word}" (${count} times)`,
        problem: 'Vague descriptor overused',
        suggestion: `Replace with specific, measurable details`
      });
    }
  });

  // Check for missing measurements
  const hasMeasurements = /\d+\s*(kg|gram|meter|mile|km|minute|hour|day|year|second)/i.test(JSON.stringify(worldData));
  if (!hasMeasurements) {
    issues.push({
      element: 'Specificity',
      value: 'No measurements found',
      problem: 'Missing concrete measurements',
      suggestion: 'Add specific numbers: weights, distances, times, costs'
    });
  }

  return issues;
}
