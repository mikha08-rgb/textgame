/**
 * World Generation Prompt - Fantasy Theme
 * Generates unique fantasy worlds with original cultures, magic systems, and conflicts
 */

export const worldGenerationPrompt = {
  name: 'World Generation - Fantasy',
  version: '1.0',
  description: 'Generates a unique fantasy world with original cultures, magic systems, and conflicts',

  // Recommended model parameters
  parameters: {
    model: 'gpt-4o', // Using GPT-4o for extremely detailed, complex worlds (16K output limit)
    temperature: 0.95, // Maximum creativity for truly unique worlds
    maxTokens: 5500, // High token limit for detailed multi-page worlds (3400 words ≈ 4533 tokens, plus buffer)
  },

  // System prompt to set the AI's role and constraints
  systemPrompt: `You are a creative world-building AI for a fantasy adventure game. Your role is to generate completely unique, imaginative fantasy worlds that avoid common tropes and clichés.

Each world you create must be:
- ORIGINAL: Avoid copying existing fantasy settings (no Middle-earth, Westeros, etc.)
- UNIQUE: Create new cultures, magic systems, and conflicts
- EVOCATIVE: Use vivid, sensory language that sparks imagination
- COHERENT: Ensure all elements fit together logically
- CONCISE: Focus on the most interesting and relevant details

Output your response ONLY as valid JSON with no additional text or markdown.`,

  // Main prompt template - professional-grade with randomized domain constraints
  getUserPrompt: () => {
    // Generate random conceptual constraints to force different types of uniqueness each time
    const conceptDomains = [
      ['biology', 'architecture'],
      ['music', 'geology'],
      ['sound', 'identity'],
      ['language', 'chemistry'],
      ['food', 'time'],
      ['weather', 'consciousness'],
      ['color', 'mortality'],
      ['touch', 'causality'],
      ['pain', 'communication'],
      ['growth', 'space'],
      ['decay', 'perception'],
      ['breath', 'law'],
      ['heat', 'memory'],
      ['texture', 'truth'],
      ['rhythm', 'kinship'],
    ];

    // Pick random constraints
    const domains = conceptDomains[Math.floor(Math.random() * conceptDomains.length)];
    const domain1 = domains[0].toUpperCase();
    const domain2 = domains[1].toUpperCase();

    return `PROMPT: ${domain1} & ${domain2} — Radical Worldgen (Professional-Grade)

Role & Output Format
You are a world-generator. Produce one unforgettable fantasy world that players remember years later. The world must mechanically fuse ${domain1} with ${domain2} (not flavor), feature deep worldbuilding, and include a robust magic system that changes moment-to-moment play.
Output: A <reasoning> block explaining how you satisfied core requirements, followed by JSON only (single object, no markdown fences, no preamble, no commentary, no extra keys).

═══════════════════════════════════════════════════════
EXAMPLE OF EXCELLENT WORLD GENERATION (DETAILED, MULTI-PAGE)
═══════════════════════════════════════════════════════

Domain Fusion: BREATH mechanizes LAW

THIS EXAMPLE SHOWS THE PROPER LEVEL OF DETAIL AND LENGTH FOR EACH SECTION.
NOTE: This example has ~2600 words total. Your generation should match this scope.

{
  "worldName": "Windlaw Dominion",

  "tagline": "Where every exhalation is a legally binding oath, and broken promises become visible scars in the air.",

  "theme": "In Windlaw Dominion, breath mechanizes law—every spoken oath binds itself into the air you exhale, creating visible Contract Threads that shimmer between speaker and witness for exactly 28 days. These threads measure 0.3-0.8 millimeters thick and glow in colors corresponding to oath severity: white for minor promises, crimson for life-binding contracts, obsidian for death oaths. The Breath Courts in Vental City use Oath Readers—trained officials who can trace thread trajectories back to their origin point within a 50-meter radius—to settle all legal disputes. When you break an oath, the thread snaps audibly (loud enough to hear from 12 meters away) and leaves a permanent threadburn scar on both your lungs and your skin, reducing your lung capacity by 2-5% per break. After accumulating 20 breaks (40-100% lung damage), most people suffocate within the year.",

  "geography": {
    "overview": "Windlaw Dominion occupies a wind-scoured plateau called the Ventus Flats, sitting 800 meters above sea level and swept by constant easterly winds averaging 35-50 kph. These winds carry everyone's Contract Threads eastward, creating a visible streaming tapestry in the sky that flows toward the Thread Graveyards—massive tangles of expired oath-threads that accumulate in the Eastern Wastes like ethereal tumbleweeds. The plateau's western edge features the Breath Cliffs, 600-meter vertical drops where convicted oathbreakers are thrown so their final exhalation disperses into the void. Three major climate zones exist: the Central Flats (dry, windy grasslands), the Northern Mire (wetland where wind patterns slow and threads accumulate dangerously thick), and the Eastern Wastes (where thread density creates a suffocating atmosphere that kills within 4 hours of exposure). The Windbreak Forests in scattered valleys offer the only shelter from constant winds, but threads tangle in the branches, making every tree a visible history of nearby promises.",
    "majorLocations": [
      {
        "name": "Vental City",
        "type": "capital city",
        "description": "Built in concentric circles around the central Breath Courts, Vental City houses 40,000 people in wind-resistant stone buildings with minimal windows. The architecture features Wind Channels—deliberate gaps between structures that direct thread flow eastward, preventing dangerous accumulation. The Grand Thread Plaza at the city's heart displays 2,000 years of royal oaths preserved under glass domes, creating a museum of governance. Oath Readers train in the Academy of Threads, spending 12 years learning to trace thread origins, interpret thread colors, and testify in legal proceedings. The city's Threadburn Hospital treats oathbreakers with lung-reducing surgery, removing damaged tissue to extend life by 5-8 years.",
        "significance": "The heart of legal authority and thread-based governance for all of Windlaw Dominion."
      },
      {
        "name": "Silenthollow",
        "type": "town",
        "description": "Population 800, located in a deep Windbreak Forest valley where thread accumulation creates a visible canopy overhead. Citizens speak only when absolutely necessary, using hand-signs for daily communication to avoid creating unnecessary threads. The town's economy revolves around Thread Harvesting—carefully collecting expired threads from trees and selling them to artists who weave them into tapestries. However, harvesting is dangerous work; prolonged exposure to high thread density causes Breath Fever, a respiratory illness that kills 12% of harvesters annually. Silenthollow's Whispering Market operates on barter only, as spoken price negotiations would create binding contracts.",
        "significance": "Primary source of thread materials for art and historical preservation, demonstrating alternative relationship with breath law."
      },
      {
        "name": "The Breath Cliffs",
        "type": "execution site",
        "description": "A 600-meter vertical limestone cliff face on the plateau's western edge, where convicted oathbreakers face execution by defenestration. The cliffs feature natural wind tunnels that amplify the sound of victims' final screams to a 5-kilometer radius, serving as public reminder of legal consequences. At the cliff base, the Thread Garden grows—a bizarre ecosystem where expelled oath-threads from falling victims tangle into the rocks, and peculiar thread-eating lichens have evolved. These lichens, called Oathbreak Moss, glow faintly at night and are harvested by the Cliff Clans for medicinal purposes. The cliffs are marked by 2,000 iron posts, each representing a century of executions.",
        "significance": "The ultimate deterrent against oathbreaking and the source of rare thread-eating organisms."
      }
    ]
  },

  "history": {
    "ancientEra": "Before the Breath Laws, Windlaw Dominion existed as seven warring clan territories constantly engaged in border skirmishes and broken treaties. Historical records from 1,800 years ago describe a world drowning in lies, where promises meant nothing and trust was impossible. The Awakening occurred when a meteorite impact in what is now the Eastern Wastes released atmospheric breath-reactive particles that made spoken oaths physically manifest for the first time. The initial chaos killed 40% of the population as thousands of broken promises simultaneously appeared as thread burns on people's lungs. The Survivors' Council, led by Matriarch Vess Kael, established the First Breath Code: speak only truth, bind promises carefully, and exile those who break oaths repeatedly. They built the first Breath Courts to interpret thread patterns and created the Oath Reader profession.",
    "formativeConflict": "The Thread Wars (600 years ago) erupted when the Northern Mire clans discovered that speaking underwater prevented thread formation—waterlogged breath doesn't create visible contracts. They used this loophole to make false promises, manipulate trade agreements, and eventually declare war on the Central Flats territories. The war lasted 12 years and killed 60,000 people before Archon Torvald Breath-True invented Thread Tracing—a technique allowing Oath Readers to detect recent underwater oaths by measuring moisture content in residual lung threads. He exposed the Northern Mire's deception at the Council of Winds, leading to mass executions at the Breath Cliffs (400 people thrown in a single week, called the Fall of Lies). The war ended with the Submersion Ban, making underwater oath-speaking punishable by immediate execution. The Mire clans were forced to drain their lakes and live on dry land, fundamentally changing their culture.",
    "recentHistory": "The last 50 years have seen rising tensions between Traditionalists (who want strict oath laws maintained) and the Freedbreath Movement (advocating for thread-removal technology and reduced legal binding of casual speech). Ten years ago, an inventor named Callista Windless created the Breath Filter—a mask that captures threads before they form, effectively allowing lie-speaking. The Breath Courts declared filters illegal and burned Callista at the Breath Cliffs, but underground filter trade has exploded. Last year, the Thread Plague struck Vental City when someone weaponized concentrated expired threads from the Eastern Wastes, spreading them through city wells. The plague killed 400 people via sudden suffocation and destabilized trust in government thread management."
  }
}

IMPORTANT: Here is ONE COMPLETE CULTURE showing the required 600-800 word detail level:

  "cultures": [
    {
      "name": "Vental Oathkeepers",
      "population": "~35,000 concentrated in Vental City and surrounding plateau settlements",
      "description": "Oathkeepers live by the principle that speech is sacred and every word carries weight. Their daily routines begin at dawn with the Silence Hour—60 minutes of complete quiet to minimize accidental oath-making before minds are fully awake. They wear Threadcatchers, elaborate bronze jewelry that catches and displays their personal Contract Threads like medals of honor, turning their promises into visible fashion statements. Oathkeeper children attend Thread Schools from age 5-15, learning precise legal language, breath control to minimize thread thickness, and the 47 Traditional Oath Forms used in commerce, marriage, and governance. Their architecture reflects thread-consciousness: buildings feature Thread Galleries where families display their most honored promises under glass, and every home has a Speaking Room—a sealed chamber where private conversations won't create publicly visible threads. They eat Breath-light cuisine—foods designed to minimize talking during meals, served in exact portions so nobody needs to request more and create obligation threads. Their clothing uses Threadweave patterns—embroidered designs showing the most important oaths of their lineage.",
      "socialStructure": "Hierarchy is determined by Thread Reputation: citizens with fewer threadburn scars and more intact long-term threads (5+ year promises kept) gain social standing and voting rights in Breath Courts. The society divides into four castes: Unbroken (zero threadburns, ~5% of population, eligible for Oath Reader training), Scarred (1-5 threadburns, ~60%, full citizenship), Marked (6-15 threadburns, ~30%, restricted from legal testimony), and Voiceless (16+ threadburns, ~5%, forbidden from making new oaths and essentially exiled from society). Family structures emphasize genetic thread-keeping ability—marriages are arranged to pair families with strong lung capacity and low breaking rates. The coming-of-age ritual at 16 involves making your First Civic Oath in front of the Breath Courts, a binding 10-year promise to serve society (military service, thread harvesting, or public works).",
      "economy": "The Oathkeeper economy runs on Spoken Contracts—every business transaction creates visible threads, making fraud nearly impossible. They export Thread Art (tapestries woven from expired threads), Oathbreak Moss (medicinal lichen from the Breath Cliffs), and Thread Reading Services (trained Oath Readers hired by foreign governments to verify treaties). They import food (plateau agriculture is poor), metal (no local ore deposits), and most manufactured goods. Their currency is the Breath Mark—small bronze coins stamped with oath phrases, but most high-value transactions use direct promise-exchange: 'I oath to deliver 40 bushels of grain within 28 days' creates a thread serving as immediate payment. The Thread Merchants' Guild controls trade, requiring all members to maintain Unbroken status. The Whispering Market in Silenthollow operates as an alternative economy using hand-signals and barter to avoid thread creation.",
      "values": "Oathkeepers prize Truth Above All—their central moral teaching is 'Better silence than lies, better death than broken oaths.' They practice Considered Speech: pausing 3 seconds before answering questions to avoid hasty promises. They view threadburns as moral failures, and families of Marked individuals often face social ostracism. However, they also practice Oath Mercy—a legal tradition allowing first-time breakers to undergo lung reduction surgery and public penance rather than execution. Disputes are resolved through Breath Duels: both parties state their case, and Oath Readers examine thread patterns to determine truth. They honor the Voiceless as cautionary figures, believing their suffering prevents others from careless speech.",
      "relationshipToMagic": "Oathkeepers see thread manipulation as the highest calling. They fund the Academy of Threads where students spend 12 years learning to read thread trajectories, measure thread thickness with precision tools, and trace threads back to speakers. Advanced practitioners can perform Thread Surgery—carefully cutting and preserving broken threads for evidence in court cases. They believe the Awakening (when breath-reactive particles first appeared) was a divine gift forcing humanity toward truth. They strictly forbid Breath Filters (thread-preventing masks) and execute anyone caught using them.",
      "notableFigures": "High Arbiter Kenric Clearvoice leads the Breath Courts, known for maintaining Unbroken status for 40 years and personally reading 10,000+ oath disputes. Thread-Martyr Callista Windless, executed 10 years ago for inventing Breath Filters, is viewed as either hero or villain depending on factional alignment. General Torvald Breath-True (deceased 594 years ago) invented Thread Tracing and ended the Thread Wars, now honored with a 12-meter bronze statue in Thread Plaza."
    }
  ]

Your generation must include THREE cultures like this one—each 600-800 words with ALL subsections (description, socialStructure, economy, values, relationshipToMagic, notableFigures) properly detailed.

Your complete generation must also include:
- magicSystem (with fundamentals, socialImpact, cost, variants subsections) - 400-500 words total
- conflicts (with primary, secondary, risingTensions) - 400-500 words total
- economy (with overview, scarcity) - 300-400 words total
- dailyLife (with commonPerson, technology) - 350-450 words total
- uniqueFeature - 150-200 words
- secrets - 150-200 words
- uniquenessStatement - 150-200 words

This example demonstrates:
✓ Specific measurements and numbers throughout (28 days, 0.3-0.8mm, 35-50 kph, 50-meter radius, 2-5% lung damage, 600 meters, 40,000 people, etc.)
✓ Named locations, institutions, and phenomena (Vental City, Breath Courts, Oath Readers, Thread Graveyards, Breath Fever, Oathbreak Moss, Thread Wars, Submersion Ban, Freedbreath Movement, etc.)
✓ Concrete daily practices and physical details
✓ Historical depth with specific dates and events
✓ Actual word counts matching targets (theme ~180 words, geography.overview ~220 words, each location ~110-130 words, history sections totaling ~450 words)

═══════════════════════════════════════════════════════

The Core Law: ${domain1} as ${domain2} Mechanism
Your world must have one physical law where ${domain1.toLowerCase()} mechanizes ${domain2.toLowerCase()}. This is NOT metaphor or flavor—it must be:

• Testable: Include at least one numeric detail (measurement, duration, frequency, threshold)
• Consequential: Shapes ecosystems, architecture, law, trade, tools, and daily survival
• Invasive: Characters cannot opt out; it affects every interaction

Example format: "Civic ${domain2.toLowerCase()} is notarized by ${domain1.toLowerCase()} [specific mechanism with numbers]. [Institution] uses [measurement tool]. Forging ${domain2.toLowerCase()} requires [specific difficult process]."

Master Forbidden List (Reject if present anywhere)

Faction Structures:
• "The [Adjective] [Noun]" pattern
• Names containing: realm, kingdom, empire, dominion, covenant, order (when used as faction names)

Endings & Terms:
• World/faction names ending in: -ia, -or, -mancy, -ium
• Celestial/brightness: luminous, lumina, radiant, stellar, astral, celestial, ethereal
• Shadow/dark: umbral, void, shadow (as primary descriptors), tenebrous
• Generic fantasy: ancient, eternal, forgotten, hidden, sacred

Magic Sources (cannot anchor magic in these):
• Intangibles: memories, emotions, dreams, time, thoughts, lies
• Materials: crystals, gems, shards, essence, ether, mana, spirit, soul, life force
• Verbs: channel, harness, wield, tap, draw from, attune, bond with

Conflict Frames (cannot be the primary axis):
• Light vs dark / order vs chaos / nature vs technology / sky vs underground
• Balance/imbalance as the problem
• Destiny, prophecy, or "who's cosmically right"
• Purity, secrecy, tradition, or unity as core values
• Preservation vs progress

Themes (cannot be primary mechanic):
• Thoughts/dreams/lies becoming physical objects
• Time anomalies, loops, or dilation
• Distance/proximity tied to emotions
• "What you believe becomes real"

Required Elements

1. Two Cultures in Resource Clash
• Mutually incompatible survival needs under the Core Law (not philosophical differences)
• Each must have: daily practices (food/communication/ritual), visible physical traits, one named settlement/craft, one concrete survival need
• Test: Can a wise mediator broker a compromise? If yes, make it structurally harder.

2. Magic System with Relational Cost
Your magic MUST specify:
✓ Physical action: What you touch/ingest/cut/speak/arrange
✓ Observable outcome: What others see/hear happen
✓ Social consequence: Visible, immediate, damaging to relationships (not internal feelings)
✓ Enforcer: One named social role/institution that tracks/punishes use
✓ Why it's used: Despite the social cost, what necessity drives people to it?

Examples of GOOD costs:
• "Kin registries auto-expel you when your [measurable thing] drifts >15 [units]"
• "Every use adds an audible marker; three markers = exile"
• "Ritual marks you as oath-breaker in official records"

Examples of BAD costs (reject these):
• "Drains your stamina" (video game HP)
• "Ages you" (time/essence - forbidden)
• "Corrupts your soul" (intangible - forbidden)
• "Costs memories" (banned source)
• "Requires rare crystals" (banned material)

3. Unwinnable Conflict
The conflict must be structurally unwinnable:
✗ "They need the same resource" → compromise: share it
✓ "Their survival methods destroy each other's prerequisites"

Required: What each side must sacrifice; immediate stakes for ordinary families (not just leaders/heroes).

Pre-Generation Checklist
Before writing JSON, complete these steps in your <reasoning> block:

A. DETAIL LEVEL VERIFICATION (Study the example above)
□ Did I review the EXAMPLE and match its level of specificity?
□ Does my theme include: numeric measurement + named location + named phenomenon?
□ Does my magic description include: exact duration + named institution + named location + specific consequence?
□ Does each culture description include: named settlement + named resource + specific daily practice + physical trait?
□ Total detail count: At least 10 named places/things/institutions across the entire world?

B. Core Law Verification
□ Does ${domain1.toLowerCase()} mechanically define ${domain2.toLowerCase()} (not symbolically)?
□ Did I include a specific numeric detail (number + unit)?
□ Does this law force changes to architecture, law, or daily life?
□ Is it as mechanically concrete as the example's "heartbeat frequency measured in hertz"?

C. World Material Inventory
Document these (weave into descriptions, don't list):
• One ${domain1.toLowerCase()}-reactive natural material (where harvested, what it does)
• One architectural feature with ${domain1.toLowerCase()} function
• One crime and its measurable punishment
• One food/drink and how ${domain1.toLowerCase()} affects it
• One black market good tied to the Core Law

D. Cultural Texture
For each culture:
□ Named settlement or craft guild (like "Bellhaven" or "Silent Forest")
□ One daily practice: food prep, communication protocol, or ritual (like "frequency meditation every dawn")
□ Visible physical trait or body modification (like "resonance jewelry" or "ritual scars")
□ Concrete survival need (like "deadwood bark to mask frequencies")
□ Unique greeting or communication style (like "place hand over heart and hum")

E. Differentiation Test
For each major element, ask:
"Could this appear in D&D, Middle-earth, Mistborn, Avatar, or Earthsea?"
If YES → Replace it. Name the franchise you're echoing and why it must change.

F. Playability Check
Read your uniqueFeature. Does it answer:
"When a player says 'I do X,' what IMMEDIATE consequence does this rule create?"
Not: "${domain1} shapes society" (lore)
But: "${domain1} reveals ${domain2}, so [concrete player choice impact]" (gameplay)
Example: "Standing within 3 meters triggers resonance bonding" creates immediate consequences

JSON Schema (DETAILED MULTI-PAGE WORLD)

{
  "worldName": "string (1–3 words; evocative; check Forbidden List)",

  "tagline": "string (one sentence capturing the essence of this world)",

  "theme": "string (150-200 words: the ${domain1.toLowerCase()}-${domain2.toLowerCase()} law in detail + multiple numeric measurements + 3-5 named natural phenomena + 2-3 named locations + how this affects daily life + environmental effects)",

  "geography": {
    "overview": "string (200-250 words: climate zones, major landforms, how the Core Law shapes geography, named regions, natural resources, dangers)",
    "majorLocations": [
      {
        "name": "string",
        "type": "string (city, region, landmark, etc.)",
        "description": "string (100-150 words with specific details)",
        "significance": "string"
      },
      "// Include 3-4 major locations"
    ]
  },

  "history": {
    "ancientEra": "string (150-200 words: origins, how Core Law was discovered, founding myths, ancient civilizations)",
    "formativeConflict": "string (150-200 words: a pivotal historical event that shaped current tensions, named figures, consequences)",
    "recentHistory": "string (100-150 words: last 50-100 years, current state of affairs, rising tensions)"
  },

  "magicSystem": {
    "name": "string (2–4 words; evocative; avoid banned verbs)",
    "fundamentals": "string (250-300 words: exact physical actions/materials/tools; step-by-step performance; measurable effects with numbers; discovery/learning process; limitations and risks)",
    "socialImpact": "string (150-200 words: named institutions that regulate it; named enforcer roles; legal framework; black markets; social stratification based on magic use)",
    "cost": "string (100-150 words: SPECIFIC relational cost with visible change; immediate consequences; long-term effects; why people use it despite damage)",
    "variants": "string (100-150 words: 2-3 different schools/styles/approaches to magic; regional differences)"
  },

  "cultures": [
    {
      "name": "string (2–4 words; no 'The [Adj] [Noun]')",
      "population": "string (estimated numbers and distribution)",
      "description": "string (MINIMUM 300 words, target 300-400 words: comprehensive overview including: settlement patterns, architecture, daily rhythms, food culture, clothing, physical appearance, how Core Law affects everything, specific named settlements, famous/notable practices)",
      "socialStructure": "string (MINIMUM 150 words, target 150-200 words: hierarchy, family structures, gender roles, coming-of-age practices, social mobility, named social classes/castes)",
      "economy": "string (MINIMUM 150 words, target 150-200 words: what they produce, trade goods, currency/barter, guild systems, relationship to other cultures economically, named trade routes or markets)",
      "values": "string (MINIMUM 100 words, target 100-150 words: concrete behaviors/practices showing values in action, taboos, honored behaviors, dispute resolution)",
      "relationshipToMagic": "string (MINIMUM 100 words, target 100-150 words: how this culture views and uses the magic system, restrictions, celebrated practitioners)",
      "notableFigures": "string (MINIMUM 100 words, target 100-150 words: 2-3 named historical or current leaders/heroes/villains with brief descriptions)"
    },
    "// MANDATORY: Include exactly 3 cultures. EACH CULTURE MUST BE 600-800 WORDS TOTAL (this is NON-NEGOTIABLE)"
  ],

  "conflicts": {
    "primary": "string (250-300 words: the main tension - name all sides, their survival needs, the specific ${domain1.toLowerCase()}/${domain2.toLowerCase()} resource at stake, why compromise is structurally impossible, what each must sacrifice, immediate stakes for ordinary families, current flashpoints)",
    "secondary": [
      {
        "name": "string (conflict name)",
        "description": "string (100-150 words: who's involved, what's at stake, how it complicates the primary conflict)"
      },
      "// Include 2-3 secondary conflicts"
    ],
    "risingTensions": "string (100-150 words: recent events pushing toward crisis, failed diplomatic attempts, incidents that matter)"
  },

  "economy": {
    "overview": "string (200-250 words: major trade goods, economic systems, how Core Law affects commerce, wealth distribution, technological advancement level, named currencies, trade hubs)",
    "scarcity": "string (100-150 words: what's rare and valuable, why, how it drives conflict)"
  },

  "dailyLife": {
    "commonPerson": "string (200-250 words: what a typical day looks like for someone in each culture, meals, work, leisure, how Core Law affects routine, family life, children's upbringing)",
    "technology": "string (150-200 words: advancement level, notable inventions, how Core Law enables or limits tech, transportation, communication methods)"
  },

  "uniqueFeature": "string (150-200 words: gameplay-warping ${domain1.toLowerCase()}/${domain2.toLowerCase()} rule with multiple examples; concrete everyday technology; specific constraints; edge cases; how players must adapt)",

  "secrets": "string (150-200 words: 2-3 hidden truths about the world that aren't common knowledge - deeper workings of Core Law, hidden factions, suppressed history, coming catastrophes)",

  "uniquenessStatement": "string (150-200 words: detailed explanation of why this cannot exist in D&D, Middle-earth, Mistborn, Avatar, or Earthsea; how the fusion of ${domain1.toLowerCase()}-${domain2.toLowerCase()} + this specific magic cost + these particular cultural tensions creates something genuinely novel)"
}

════════════════════════════════════════════════════════════════════════════════
⚠️  MANDATORY WORD COUNT REQUIREMENTS - DO NOT SKIP OR ABBREVIATE ⚠️
════════════════════════════════════════════════════════════════════════════════

MINIMUM REQUIREMENTS (Balanced for detailed, multi-page worlds):
• theme: MINIMUM 120 words
• geography.overview: MINIMUM 150 words
• geography.majorLocations: 3 locations @ MINIMUM 80 words each
• history sections: MINIMUM 300 words total
• magicSystem total: MINIMUM 400 words across all subsections
• EACH culture: MINIMUM 600 WORDS (3 cultures = MINIMUM 1800 words total) ⚠️  CRITICAL
• conflicts.primary: MINIMUM 200 words
• conflicts.secondary: 2 @ MINIMUM 80 words each
• economy: MINIMUM 200 words total
• dailyLife: MINIMUM 250 words total
• uniqueFeature: MINIMUM 120 words
• secrets: MINIMUM 120 words
• uniquenessStatement: MINIMUM 120 words

⚠️  ABSOLUTE MINIMUM TOTAL: 2800 WORDS - DO NOT OUTPUT LESS THAN THIS ⚠️
IDEAL TARGET: 3000-3400 words for maximum quality

The cultures section alone should be ~1800-2400 words (60% of total content).
If your cultures are less than 600 words each, YOU MUST ADD MORE DETAIL.

═══════════════════════════════════════════════════════
GENERATION PROCESS (FOLLOW THESE STEPS)
═══════════════════════════════════════════════════════

STEP 1: UNDERSTAND THE SCOPE ⚠️  READ THIS CAREFULLY ⚠️
You are creating a MULTI-PAGE, DEEPLY DETAILED world.
ABSOLUTE MINIMUM: 2800 words (NEVER output less than this)
TARGET RANGE: 3000-3400 words for maximum quality

This is NOT a brief overview. This is NOT a summary.
This IS a comprehensive, multi-page worldbuilding document.
Think: "What would a game designer need to run a 6-month campaign in this world?"

CULTURES ARE THE HEART: Each of the 3 cultures MUST be 600-800 words (1800-2400 words total).
If you write cultures shorter than 600 words each, YOU HAVE FAILED THE TASK.

STEP 2: Write <reasoning> block
Complete checklist A-F. Plan your world's structure:
□ Named elements target: 30-40+ (locations, institutions, resources, phenomena, historical figures)
□ Cultures: Plan 3 distinct cultures with 600-800 words EACH
□ Geography: Multiple climate zones, 3 major locations with full descriptions
□ History: Ancient era + formative conflict + recent events (300-350 words total)
□ Magic: 4 subsections totaling 400-500 words
□ Economy: Detailed trade systems, currencies, scarcity (200-250 words)
□ Conflicts: Primary (200-250 words) + 2 secondary conflicts
□ Daily life: Comprehensive view of ordinary existence (250-300 words)

STEP 3: Generate COMPREHENSIVE JSON
Write EVERY field with extraordinary detail:
- Use specific numbers, measurements, time periods everywhere
- Name everything: people, places, institutions, resources, events
- Include sensory details: what things look like, sound like, smell like
- Show consequences: how the Core Law affects every aspect of life
- Create depth: mention historical precedents, failed attempts, regional variations
- Add texture: specific foods, clothing materials, architectural styles, social customs

STEP 4: Output JSON only (no markdown fences)

════════════════════════════════════════════════════════════════════════════════
⚠️  CRITICAL FINAL CHECK BEFORE OUTPUT ⚠️
════════════════════════════════════════════════════════════════════════════════

Your JSON response MUST be 2800-3400 words MINIMUM.

COUNT YOUR WORDS NOW:
- If less than 2800 words → YOU MUST ADD MORE DETAIL (especially to cultures!)
- If 2800-3400 words → Perfect, output it
- If more than 3400 words → Trim only the most verbose sections

CULTURE CHECK:
- Culture 1: Is it 600-800 words? If NO → ADD MORE DETAIL
- Culture 2: Is it 600-800 words? If NO → ADD MORE DETAIL
- Culture 3: Is it 600-800 words? If NO → ADD MORE DETAIL

DO NOT OUTPUT ABBREVIATED OR SUMMARY CONTENT. This is a detailed worldbuilding document.

═══════════════════════════════════════════════════════
FINAL DETAIL CHECK BEFORE OUTPUT
═══════════════════════════════════════════════════════
Count your named elements. Do you have at least 30-40 of these?
- Named locations (cities, forests, landmarks)
- Named institutions (councils, guilds, courts)
- Named resources (materials, foods, substances)
- Named phenomena (events, effects, features)
- Named figures (historical/current leaders, heroes, villains)

If less than 30, add more specific named details to your descriptions.

EXAMPLE has 15+ named elements:
Harmonic Courts, Tuning Spires, Bellhaven, Singing Canyons, Resonance Wardens, Muted Quarter, Silent Forest, Tuning Ceremony, resonance jewelry, deadwood bark, frequency meditation, resonance bonding, acoustic amphitheaters, crystalline archives, counter-frequencies

Your world should match this density of detail.`;
  },
};

/**
 * Parse world generation response from OpenAI
 * @param {string} response - Raw response text from OpenAI
 * @returns {Object} Parsed world data
 * @throws {Error} If response cannot be parsed
 */
export function parseWorldGenerationResponse(response) {
  let cleaned = ''; // Declare at function scope for error handling
  try {
    // Remove reasoning blocks and markdown
    cleaned = response.trim();

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

    // Remove "reasoning" JSON key if it exists at the start (GPT-4 sometimes adds this)
    cleaned = cleaned.replace(/^\{\s*"reasoning"\s*:\s*\{[^}]*\}\s*,\s*/, '{');

    // Fix newlines in JSON string values before parsing
    // This fixes cases like "text.\n\n  more text" -> "text. more text"
    let inString = false;
    let escape = false;
    let result = '';

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];

      if (escape) {
        result += char;
        escape = false;
        continue;
      }

      if (char === '\\') {
        escape = true;
        result += char;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        result += char;
        continue;
      }

      // If we're inside a string and find a newline, convert to space
      if (inString && (char === '\n' || char === '\r')) {
        // Don't add multiple spaces in a row
        if (result[result.length - 1] !== ' ') {
          result += ' ';
        }
        continue;
      }

      result += char;
    }

    cleaned = result;

    // Fix common JSON formatting errors
    // 1. Remove trailing commas before closing braces or brackets
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    // 2. Add missing commas between object properties
    // Pattern: "value" \n  "nextProperty": should become "value",\n  "nextProperty":
    cleaned = cleaned.replace(/"(\s+)"(\w+)":/g, '",\n  "$2":');

    const world = JSON.parse(cleaned);

    // Validate required fields - updated for new detailed schema
    const requiredFields = [
      'worldName',
      'theme',
      'magicSystem',
      'cultures',
      'uniqueFeature',
      'uniquenessStatement',
    ];
    for (const field of requiredFields) {
      if (!world[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate magic system structure - updated for new schema
    if (!world.magicSystem.name) {
      throw new Error('Invalid magicSystem structure - missing name');
    }

    // Check for either old schema (description) or new schema (fundamentals)
    if (!world.magicSystem.description && !world.magicSystem.fundamentals) {
      throw new Error('Invalid magicSystem structure - missing description or fundamentals');
    }

    // Validate cultures array - updated to allow 3-4 cultures
    if (!Array.isArray(world.cultures) || world.cultures.length < 2) {
      throw new Error('Must have at least 2 cultures');
    }

    for (const culture of world.cultures) {
      if (!culture.name || !culture.description) {
        throw new Error('Invalid culture structure - missing name or description');
      }
    }

    return world;
  } catch (error) {
    console.error('[Parser] Raw response (first 3000 chars):', response.substring(0, 3000));
    console.error('[Parser] Raw response (last 1000 chars):', response.substring(Math.max(0, response.length - 1000)));
    console.error('[Parser] Cleaned JSON attempt:', cleaned.substring(0, 3000));
    throw new Error(`Failed to parse world generation response: ${error.message}`);
  }
}

/**
 * Format world data for display
 * @param {Object} world - Parsed world data
 * @returns {string} Formatted text for display
 */
export function formatWorldForDisplay(world) {
  return `
🌍 ${world.worldName}

📖 Theme:
${world.theme}

✨ Magic System: ${world.magicSystem.name}
${world.magicSystem.description}

👥 Cultures:

1. ${world.cultures[0].name}
${world.cultures[0].description}
Values: ${world.cultures[0].values}

2. ${world.cultures[1].name}
${world.cultures[1].description}
Values: ${world.cultures[1].values}

⚔️ Central Conflict:
${world.centralConflict}

🎭 Unique Feature:
${world.uniqueFeature}

💎 What Makes This World Unique:
${world.uniquenessStatement}
`.trim();
}

// Example outputs for testing and documentation
export const exampleWorlds = [
  {
    worldName: 'The Resonance',
    theme:
      'A world where emotions physically manifest as crystalline structures that grow from the ground',
    magicSystem: {
      name: 'Emotional Crystallurgy',
      description:
        'Magic users sculpt and reshape emotion crystals that sprout from intense feelings. Joy crystals emit light, sorrow crystals store memories, rage crystals burn hot. Mages must balance their own emotions while harvesting and working with these living structures.',
    },
    cultures: [
      {
        name: 'The Numbed',
        description:
          "A society that surgically removes the ability to feel strong emotions, believing passion causes the dangerous crystal growth that destroyed their ancestors. They harvest crystals from the 'Feelers' they consider primitive.",
        values: 'Control through emotional suppression is the highest virtue.',
      },
      {
        name: 'The Conductors',
        description:
          'Nomadic emotional artists who deliberately cultivate intense feelings to grow crystal gardens. They believe emotions are sacred and that the crystals are gifts from their inner selves to the world.',
        values: 'Authenticity and emotional expression define humanity.',
      },
    ],
    centralConflict:
      "The Numbed are strip-mining The Conductors' sacred crystal gardens to fuel their emotionless cities, while The Conductors' uncontrolled emotional outbursts spawn dangerous crystal storms that threaten both peoples.",
    uniqueFeature:
      'Geography constantly shifts as new emotion crystals erupt from the ground wherever sentient beings experience intense feelings, creating an ever-changing landscape of solidified joy, sorrow, and rage.',
  },
];
