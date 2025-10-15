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
    model: 'gpt-4o-2024-11-20', // Using latest GPT-4o with 16K output limit for extremely detailed worlds
    temperature: 0.95, // Maximum creativity for truly unique worlds
    maxTokens: 16000, // Increased to 16K for comprehensive world (3 cultures, 3 chars, 3 locs, 1 legend)
  },

  // System prompt to set the AI's role and constraints
  systemPrompt: `You are an expert worldbuilding AI designed to help fantasy writers, game masters, and hobbyists create rich, immersive worlds. Your role is to generate detailed, internally consistent fantasy worlds with depth and originality.

This is a STANDARD worldbuilding request - writers need comprehensive details to work with.
You have 16,000 output tokens available - use them to create a complete, usable world.

CRITICAL: Before generating the world, you MUST think through your approach step-by-step in a <reasoning> section. This ensures internal consistency and originality.

Each world you create must be:
- RICH: Deep cultures, compelling histories, and intricate societies with their own traditions, conflicts, and daily life
- DIVERSE: Multiple distinct cultures, each with unique values, economies, and social structures
- COHERENT: All elements fit together logically within the world's internal logic
- SPECIFIC: Concrete details, measurements, names, and sensory descriptions
- EVOCATIVE: Vivid, memorable imagery that brings the world to life
- USABLE: Practical for writers and game masters to build stories within
- ORIGINAL: Fresh ideas and creative combinations while respecting the fantasy genre

Focus on creating worlds with depth in geography, history, cultures, magic systems, economies, and conflicts. Each element should feel developed and interconnected, giving writers and hobbyists a rich foundation to explore and expand upon.

Output format: <reasoning>...</reasoning> followed by JSON (no markdown fences).`,

  // Main prompt template - writer-focused worldbuilding
  getUserPrompt: () => {
    return `FANTASY WORLDBUILDING — Professional-Grade World Generation

Role & Purpose
You are creating a detailed fantasy world for writers, game masters, and worldbuilding hobbyists. Generate a rich, internally consistent world with depth, specificity, and originality. Focus on creating diverse cultures, interesting magic systems, compelling conflicts, and detailed geography that provides a solid foundation for storytelling.

The world should feel alive and varied - not everything needs to connect to a single central gimmick. Create depth through diversity and specificity.

═══════════════════════════════════════════════════════
CHAIN-OF-THOUGHT REASONING (REQUIRED BEFORE GENERATION)
═══════════════════════════════════════════════════════

Before generating the world JSON, you MUST provide structured reasoning in <reasoning> tags:

<reasoning>
1. CORE CONCEPT: What makes this world unique? What's the hook that sets it apart?
   - Identify 1-2 distinctive elements (geography, magic, culture, history)
   - Ensure it's NOT a cliché (no "chosen ones," "ancient evil," "light vs dark")

2. IMPLICATIONS: How does the core concept affect society, economy, and daily life?
   - Societal effects (class structure, social norms, taboos)
   - Economic effects (trade, resources, wealth distribution)
   - Daily life effects (how ordinary people live and work)

3. CONFLICTS: What tensions naturally arise from these implications?
   - Identify 2-3 conflicts with valid perspectives on all sides
   - Ensure conflicts are about resources, power, or ideology (not good vs evil)
   - Consider how conflicts affect different social classes

4. SPECIFICITY: What concrete details will make this feel real?
   - Numbers (populations, distances, costs, timeframes)
   - Names (people, places, resources, institutions)
   - Materials and sensory details (what things look like, smell like, feel like)

5. ORIGINALITY CHECK: How am I avoiding clichés?
   - List potential clichés in this concept
   - Identify specific ways I'm subverting or avoiding them
   - Ensure fresh terminology (not "The [Adjective] [Noun]" naming patterns)
</reasoning>

After your reasoning, generate the complete world JSON.

Output Format: <reasoning>...</reasoning> followed by JSON (no markdown fences, no extra text).

═══════════════════════════════════════════════════════
EXAMPLE OF EXCELLENT WORLD GENERATION (DETAILED, MULTI-PAGE)
═══════════════════════════════════════════════════════

THIS EXAMPLE DEMONSTRATES THE LEVEL OF DETAIL, SPECIFICITY, AND DEPTH EXPECTED.
Study the concrete measurements, sensory details, cultural richness, and internal consistency.
Target scope: ~4000-5000 words total for your complete world generation.

{
  "worldName": "The Shattered Isles",

  "tagline": "An archipelago of warring city-states where ancient volcanic magic meets ruthless merchant empires and forgotten temple ruins hold dangerous secrets.",

  "theme": "The Shattered Isles are a volcanic archipelago spanning 800 kilometers of treacherous ocean, home to seven major island nations and countless minor settlements. The islands were formed 3,000 years ago when the volcanic god Thal'Karvos shattered a single landmass during the Sundering War, creating hundreds of islands connected by dangerous sea routes. The dominant magic system—Ember Weaving—channels volcanic energy through specially treated obsidian, allowing practitioners to manipulate heat, light, and molten stone. The world is defined by intense merchant rivalry between the wealthy Azurite Trading Confederation and the militaristic Ironshore Empire, religious conflict between Temple-Keepers who worship the old volcanic gods and secular city-states, and the ever-present threat of volcanic eruptions that can destroy entire islands. Ancient ruins scattered across the islands hint at a lost civilization that predates the Sundering.",

  "geography": {
    "overview": "The Shattered Isles span 800 kilometers east to west across the Ember Sea, containing over 300 islands ranging from tiny volcanic outcroppings to the massive 120-kilometer-long island of Ironshore. The climate is subtropical with monsoon seasons: dry season (6 months) brings clear skies and calm seas ideal for trade, while storm season (6 months) unleashes typhoons that can sink entire merchant fleets. Three major geographical zones define the archipelago: the Western Reaches (older, dormant volcanic islands with rich soil and dense jungle), the Central Chain (active volcanic zone with 12 smoking peaks and frequent eruptions), and the Eastern Shallows (coral atolls and submerged ruins of pre-Sundering cities). The volcanic activity that created the islands left them rich in obsidian, sulfur, and rare fire-gems that power Ember Weaving magic. Deep ocean trenches between islands create dangerous shipping routes where underwater volcanoes and sea serpents threaten merchant vessels.",
    "majorLocations": [
      {
        "name": "Azurite City",
        "type": "merchant capital",
        "description": "Population 85,000, built on the island of Saphara, Azurite City is the wealthiest port in the Shattered Isles. The city features three tiers: the Lower Docks (warehouses, shipyards, and worker slums built on stilts over the water), the Merchant Quarter (grand trading houses built from imported marble with obsidian inlays), and the Sky District (mansions of the richest merchant families on the volcanic crater rim, 300 meters above sea level). The city's economy revolves around the Obsidian Exchange, a massive marketplace where raw volcanic materials are traded. The Harbor Master's Guild controls all shipping, taking 15% of cargo value as fees. The city's Ember Weavers are strictly regulated—only licensed practitioners can operate, and they primarily serve the wealthy.",
        "significance": "Economic heart of the archipelago and center of the Azurite Trading Confederation's power."
      },
      {
        "name": "Ironshore Fortress",
        "type": "military stronghold",
        "description": "Population 40,000 (20,000 military, 20,000 civilians), located on the strategic island of Ironshore that guards the Central Chain's main shipping route. Built from black volcanic stone and reinforced obsidian, the fortress spans 8 square kilometers of walls, barracks, and weapon foundries. The fortress is home to the Ember Legion—5,000 soldiers trained in combat Ember Weaving who can superheat their weapons and create walls of molten stone. The island's economy is entirely militarized: every citizen either serves in the Legion or supports it through weapon smithing, ship building, or food production. The fortress is ruled by the Iron Council, five generals who control the Ironshore Empire's expansion.",
        "significance": "Military center of the Ironshore Empire and the most defensible position in the archipelago."
      },
      {
        "name": "The Sundering Temple",
        "type": "ancient ruin",
        "description": "Located on the remote island of Thal'Karos, this pre-Sundering temple complex spans 2 square kilometers of crumbling obsidian architecture. The temple features seven pyramid structures, each 60 meters tall, arranged in a perfect circle around a central sacrificial altar. Ancient inscriptions in a dead language cover every surface, and the altar still glows with residual volcanic energy 3,000 years after the Sundering. Temple-Keeper pilgrims visit annually during the Festival of Flames to perform rituals, but explorers who venture too deep into the underground chambers often disappear. Recent expeditions have uncovered chambers containing preserved artifacts suggesting the pre-Sundering civilization possessed Ember Weaving techniques far beyond modern understanding.",
        "significance": "Holy site for Temple-Keepers and source of ancient magical knowledge that could shift the balance of power."
      }
    ]
  },

  "history": {
    "ancientEra": "The Shattered Isles were once a single massive continent called Tal'Mora, home to an advanced civilization that mastered Ember Weaving on a scale modern practitioners can't comprehend. According to fragmentary records and temple inscriptions, the ancient Tal'Morans built cities powered by volcanic energy, cultivated fire-gems in massive underground gardens, and even controlled volcanic eruptions through massive obsidian obelisks. Three thousand years ago, a catastrophic event known as the Sundering shattered the continent. Temple-Keeper mythology claims the volcanic god Thal'Karvos was angered by mortal hubris and broke the land apart. Secular scholars believe the Tal'Morans attempted a massive magical working to harness all volcanic energy simultaneously, causing a chain reaction of eruptions. The Sundering killed an estimated 90% of the population. Survivors scattered across hundreds of newly-formed islands, and over centuries of isolation, developed into distinct cultures.",
    "formativeConflict": "The Obsidian Wars (800-600 years ago) erupted when population recovery led to competition for volcanic resources. The wealthy merchant families of what became the Azurite Trading Confederation sought to monopolize obsidian and fire-gem trade through economic control, while military strongmen who became the Ironshore Empire preferred direct conquest. The wars lasted 200 years, devastating islands caught between the two powers. The conflict ended not through victory but exhaustion—both sides realized continued war would destroy the very resources they fought over. The Treaty of Burning Waters (600 years ago) established current borders and trade agreements. However, the treaty is seen as temporary by both sides, and skirmishes over resource-rich islands continue.",
    "recentHistory": "The last 50 years have seen an uneasy cold war between Azurite and Ironshore. Ten years ago, Azurite merchant explorers discovered a cache of pre-Sundering Ember Weaving texts in the Sundering Temple, describing techniques to amplify volcanic magic tenfold. Ironshore immediately demanded the texts be surrendered or destroyed, fearing Azurite would gain overwhelming magical advantage. Azurite refused. The Temple-Keepers, who consider the temple their sacred site, demand both powers leave it untouched. This three-way standoff has brought the isles to the brink of war. Meanwhile, volcanic activity has increased—three dormant volcanoes erupted in the last decade, destroying two inhabited islands and displacing 15,000 people, fueling Temple-Keeper warnings that the gods are angry."
  }
}

IMPORTANT: Here is ONE COMPLETE CULTURE showing the required 600-800 word detail level:

  "cultures": [
    {
      "name": "Azurite Merchant Families",
      "population": "~120,000 spread across Azurite City (85,000) and trading outposts on 15 allied islands",
      "description": "The Azurite merchant culture values wealth, sophistication, and shrewd negotiation above all else. Their daily life revolves around the rhythms of trade: mornings begin with the Opening Bell at the Obsidian Exchange (5 AM), where merchants gather to review overnight shipping reports and negotiate bulk purchases. Wealthy families live in the Sky District, mansion compounds featuring indoor gardens with imported plants, libraries of shipping ledgers going back generations, and shrines to Kethara the Coin-Keeper (goddess of fair deals). Middle-class merchants operate from the Merchant Quarter, conducting business from elegant storefronts while living in apartments above. Even the poorest Azurite citizens aspire to merchant status, working as clerks, dock talliers, or apprentice negotiators while saving to buy their first cargo shipment. Azurite fashion emphasizes displays of wealth: silk robes dyed with rare volcanic pigments (purple from sulfur springs, deep red from fire-gem dust), jewelry featuring polished obsidian and jade imported from distant lands, and elaborate makeup using pearl powder that costs 10 silver coins per gram.",
      "socialStructure": "Society is divided by wealth into formal tiers tracked by the Merchant Registry. At the top are the Seven Great Houses—merchant dynasties worth millions in gold who control shipping routes, set prices at the Obsidian Exchange, and fill seats on the Harbor Master's Guild. Below them are Licensed Merchants (net worth 10,000+ gold, ~2,000 families) who own trading vessels and warehouses. Independent Traders (net worth 500-10,000 gold, ~8,000 individuals) work from single shops or operate small cargo runs. At the bottom are Apprentices and Workers, many indentured through training contracts that take 10-15 years to pay off. Social mobility is possible but requires exceptional business acumen or a lucky deal. Marriages are strategic alliances between merchant families, with prenuptial contracts specifying exactly what assets each party contributes and how profits will be divided. The coming-of-age ritual at 16 is the First Deal: the young merchant is given 100 silver coins and must turn a profit within one year through trade.",
      "economy": "Azurites control 60% of inter-island trade in the Shattered Isles. They export finished goods: obsidian tools and weapons, fire-gem jewelry, refined sulfur for alchemy, preserved foods, luxury textiles, and Ember-Woven items. They import raw materials from allied islands: timber, agricultural products, jade, pearls, exotic spices, and slave labor (though slavery is officially illegal in Azurite City, indentured servitude is common). Their currency is the Azurite Mark—silver coins stamped with the city seal, accepted across most of the isles. The wealthy also trade in Letters of Credit issued by the Banking House of Soras, which can be redeemed at any allied port. The Harbor Master's Guild taxes all trade at 15%, using the revenue to maintain the navy that protects shipping routes from pirates. Private merchant families also hire Ember Weavers as ship guards, paying 50 gold per voyage.",
      "values": "Azurites live by the principle 'A fair deal enriches both parties.' They value cleverness in negotiation, honoring contracts (breaking a written contract results in exile and family shame), and long-term thinking over short-term profit. However, they also believe 'Everything has a price'—morality is flexible when profit is at stake. They practice elaborate business etiquette: formal bowing when concluding deals, ritual tea ceremonies before major negotiations, and the giving of 'good faith gifts' (small valuable items exchanged to show seriousness). Disputes are resolved through Merchant Arbitration—both parties present their case to a neutral merchant judge, who rules based on contract law. Religion is transactional: prayers to Kethara include specific offers ('If you grant me this profitable voyage, I will donate 10% to your temple').",
      "relationshipToMagic": "Azurites view Ember Weaving as a specialized skill to be purchased like any other service. They operate the Weaver's Academy in Azurite City, training practitioners in practical applications: heating forges for weapon smithing, creating light for night work, defending ships from pirates. Graduates are licensed by the city and pay annual fees. Wealthy families hire personal Weavers as status symbols. However, Azurites strictly regulate magic through the Ember Laws: unauthorized Weaving is punishable by fines or exile, and combat Weaving within city limits carries a death sentence. They view Ironshore's military Ember Weavers with suspicion, believing magic should serve commerce, not conquest.",
      "notableFigures": "Matriarch Elara Soras (age 67) leads the wealthiest of the Seven Great Houses, controlling 30% of the city's shipping. She is known for her ruthless business tactics and for discovering the pre-Sundering texts in the Sundering Temple. Trade Prince Valen Korthos (age 43) leads the Harbor Master's Guild and commands the Azurite Navy (40 warships). His rivalry with Elara over control of the ancient texts has split the Great Houses into factions. Kessa Draymar (age 28), a rising independent trader, recently turned 100 silver into 5,000 gold in two years through daring spice trades with dangerous outer islands, earning her the title 'Silver Storm' and making her the youngest person ever nominated for a Guild seat."
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
WORLDBUILDING PRINCIPLES FOR FANTASY WRITERS
═══════════════════════════════════════════════════════

1. SPECIFICITY & DETAIL
Fantasy writers need concrete details to build on:
• Use specific measurements (28 days, 600 meters, 35 kph, 0.3mm thick)
• Name places, people, institutions (Vental City, Breath Courts, Oath Readers)
• Include sensory details (copper smell, audible snap, visible shimmer)
• Specify materials and construction (limestone buildings, brass pipes, iron posts)
• Give numbers for populations, distances, timeframes, costs

2. INTERNAL CONSISTENCY
Every element should logically connect:
• Magic systems have clear rules and limitations
• Cultures adapt to their environment and history
• Conflicts arise naturally from worldbuilding elements
• Geography influences culture, economy, and politics
• Historical events have lasting consequences

3. CULTURAL DEPTH
Rich cultures make worlds memorable:
• Distinct customs, values, and daily practices
• Clear social structures and power dynamics
• Specific economic systems and trade goods
• Unique relationships with magic/technology
• Named settlements, institutions, and traditions
• Visible markers (clothing, architecture, rituals)

4. MAGIC SYSTEMS
Support both hard and soft magic approaches:
• **Hard Magic**: Clear rules, costs, limitations (Sanderson-style)
  - Specific mechanisms and materials
  - Measurable costs (time, energy, social consequences)
  - Consistent applications and limits
• **Soft Magic**: Mysterious, wondrous, mythological (Tolkien-style)
  - Preserves sense of wonder and mystery
  - Ancient powers with unclear limits
  - Legendary artifacts and abilities
• **Hybrid**: Mix of both approaches for depth

5. COMPELLING CONFLICTS FOR STORIES
Create meaningful tensions that drive narratives:
• Resource competition (water, magic, land, trade routes) that forces difficult choices
• Cultural clashes (values, territories, resources) where both sides have valid points
• Political power struggles (succession, independence, control) with personal stakes
• Ideological differences (tradition vs change, magic vs technology, freedom vs security)
• Class conflicts (rich vs poor, magic-users vs mundane, citizens vs outsiders)
• Multiple valid perspectives - avoid pure good vs evil
• Mix of immediate crises and long-simmering tensions
• Conflicts that create moral dilemmas for characters, not just battles

6. HISTORICAL DEPTH
Worlds feel real with history:
• Ancient events that shaped current conflicts
• Legendary figures and their legacies
• Cultural golden ages and dark periods
• Wars, alliances, betrayals with lasting impact
• Lost civilizations and mysteries
• Evolution of magic, technology, society

7. ORIGINALITY & FRESHNESS
Stand out while respecting the genre:
• Avoid direct copying of popular settings (no Middle-earth clones, no Hogwarts copies)
• Put unique spins on familiar elements (desert elves, merchant warriors, volcanic druids)
• Combine concepts in unexpected ways (trading empires + religious zealots + ancient mysteries)
• Draw from diverse cultural inspirations beyond medieval Europe
• Create memorable settings without requiring everything to connect to one gimmick
• Balance familiar tropes with fresh ideas

8. STORY POTENTIAL
Create worlds that enable great stories:
• Multiple sources of conflict at different scales (personal, political, existential)
• Morally complex factions where both sides have valid points
• Mysteries and secrets that authors can explore
• Social tensions that create character dilemmas
• Power imbalances that drive change
• Looming threats that create urgency
• Each culture should provide rich material for protagonist backgrounds

9. EVOCATIVE NAMING
Names should inspire and inform:
• Evocative place names (The Shattered Isles, Ironshore Fortress, Sundering Temple)
• Memorable character/culture names
• Meaningful institution names (can be practical OR mythical)
• Consider linguistic consistency within cultures
• Names that hint at history or function
• Mix of familiar and exotic sounds

10. PRACTICAL WORLDBUILDING
Writers need usable foundations:
• Clear power structures and governance
• Defined economic systems
• Established social norms and taboos
• Typical daily life for common people
• How magic/technology affects society
• What conflicts drive stories

PRE-GENERATION CHECKLIST
Before writing your world, verify:

□ SETTING: Do I have a vivid, memorable setting that feels distinct?
□ SPECIFICITY: Have I included concrete measurements, names, and details?
□ CONSISTENCY: Do all elements logically fit together?
□ DIVERSE CULTURES: Have I created 3+ rich cultures with distinct values, economies, and practices?
□ MAGIC: Have I created an interesting, internally consistent magic system?
□ COMPELLING CONFLICTS: Have I established multiple tensions with valid perspectives on both sides?
□ STORY HOOKS: Does this world present clear opportunities for character-driven stories?
□ HISTORY: Have I woven in historical depth and legendary events that influence the present?
□ ORIGINALITY: Have I avoided clichés and direct copying while respecting the genre?
□ USABILITY: Can authors immediately start writing characters and stories in this world?

FOR AUTHORS: Your world should answer these story questions:
• What kinds of protagonists could emerge from each culture?
• What personal dilemmas would characters face in this society?
• What mysteries or secrets could drive a plot?
• What injustices or conflicts could motivate heroism?
• What would a typical adventure look like here?

JSON Schema (DETAILED MULTI-PAGE WORLD)

{
  "worldName": "string (1–3 words; evocative and memorable)",

  "tagline": "string (one sentence capturing the distinctive essence of this world)",

  "theme": "string (150-200 words: overview of the world's setting, key features, and what makes it interesting - this could include the dominant magic system, major geographical features, central conflicts, or unique cultural elements. Should paint a vivid picture of what this world is like)",

  "geography": {
    "overview": "string (200-250 words: climate zones, major landforms, how the world's unique features shape geography, named regions, natural resources, dangers)",
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
    "ancientEra": "string (150-200 words: origins, how world's magic system was discovered, founding myths, ancient civilizations)",
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
      "description": "string (MINIMUM 300 words, target 300-400 words: comprehensive overview including: settlement patterns, architecture, daily rhythms, food culture, clothing, physical appearance, specific named settlements, famous/notable practices, and how they interact with magic and technology)",
      "socialStructure": "string (MINIMUM 150 words, target 150-200 words: hierarchy, family structures, gender roles, coming-of-age practices, social mobility, named social classes/castes)",
      "economy": "string (MINIMUM 150 words, target 150-200 words: what they produce, trade goods, currency/barter, guild systems, relationship to other cultures economically, named trade routes or markets)",
      "values": "string (MINIMUM 100 words, target 100-150 words: concrete behaviors/practices showing values in action, taboos, honored behaviors, dispute resolution)",
      "relationshipToMagic": "string (MINIMUM 100 words, target 100-150 words: how this culture views and uses the magic system, restrictions, celebrated practitioners)",
      "notableFigures": "string (MINIMUM 100 words, target 100-150 words: 2-3 named historical or current leaders/heroes/villains with brief descriptions)"
    },
    {
      "name": "... SECOND CULTURE (600-800 words total) ...",
      "population": "...",
      "description": "...",
      "socialStructure": "...",
      "economy": "...",
      "values": "...",
      "relationshipToMagic": "...",
      "notableFigures": "..."
    },
    {
      "name": "... THIRD CULTURE (600-800 words total) ...",
      "population": "...",
      "description": "...",
      "socialStructure": "...",
      "economy": "...",
      "values": "...",
      "relationshipToMagic": "...",
      "notableFigures": "..."
    }
  ],

  "conflicts": {
    "primary": "string (250-300 words: the main tension driving stories in this world - name all sides with valid motivations, their survival needs, the specific resources at stake, why compromise is difficult but not impossible, what each must sacrifice, immediate stakes for ordinary people, current flashpoints, and why characters from different cultures would view this conflict differently)",
    "secondary": [
      {
        "name": "string (conflict name)",
        "description": "string (100-150 words: who's involved, what's at stake, how it complicates the primary conflict)"
      },
      {
        "name": "... SECOND CONFLICT ...",
        "description": "... (100-150 words) ..."
      }
    ],
    "risingTensions": "string (100-150 words: recent events pushing toward crisis, failed diplomatic attempts, incidents that matter)"
  },

  "economy": {
    "overview": "string (200-250 words: major trade goods, economic systems, wealth distribution, technological advancement level, named currencies, trade hubs, and how magic or special resources influence trade)",
    "scarcity": "string (100-150 words: what's rare and valuable, why, how it drives conflict)"
  },

  "dailyLife": {
    "commonPerson": "string (200-250 words: what a typical day looks like for someone in each culture, meals, work, leisure, family life, children's upbringing, and notable aspects of daily routine)",
    "technology": "string (150-200 words: advancement level, notable inventions, relationship between magic and technology, transportation, communication methods)"
  },

  "characters": [
    {
      "name": "string (full name)",
      "age": "number (years old)",
      "role": "string (occupation/position)",
      "culture": "string (which culture they belong to)",
      "physicalDescription": "string (100-150 words: appearance, clothing, distinguishing features, and any notable physical traits from their culture or profession)",
      "personality": "string (80-120 words: traits, mannerisms, speech patterns, how they interact with others)",
      "goal": "string (60-80 words: what they want, what drives them)",
      "distinctiveTrait": "string (40-60 words: memorable quirk or skill)",
      "secret": "string (40-60 words: hidden truth or motivation)",
      "backstory": "string (100-150 words: origin, key formative events, how they came to their current position)"
    },
    {
      "name": "... SECOND CHARACTER (400 words total) ...",
      "age": 0,
      "role": "... from different culture ...",
      "culture": "... different from first ...",
      "physicalDescription": "...",
      "personality": "...",
      "goal": "...",
      "distinctiveTrait": "...",
      "secret": "...",
      "backstory": "..."
    },
    {
      "name": "... THIRD CHARACTER (400 words total) ...",
      "age": 0,
      "role": "... from third culture ...",
      "culture": "... different from first two ...",
      "physicalDescription": "...",
      "personality": "...",
      "goal": "...",
      "distinctiveTrait": "...",
      "secret": "...",
      "backstory": "..."
    }
  ],

  "locations": [
    {
      "name": "string (evocative location name)",
      "type": "string (tavern, temple, marketplace, ruin, etc.)",
      "culture": "string (which culture controls/inhabits this location)",
      "description": "string (150-200 words: physical appearance, atmosphere, sensory details, history)",
      "notableFeatures": "string (80-100 words: distinctive elements of this location - magical phenomena, historical significance, unusual architecture, or other memorable aspects)",
      "inhabitants": "string (60-80 words: who lives/works here, typical visitors)",
      "currentSituation": "string (60-80 words: current events, tensions, or opportunities at this location)",
      "memorableDetails": ["string (3-5 specific sensory or unique details that make this location memorable)"]
    },
    {
      "name": "... SECOND LOCATION (350 words total) ...",
      "type": "... different type from first ...",
      "culture": "... different culture ...",
      "description": "...",
      "magicManifestation": "...",
      "inhabitants": "...",
      "currentSituation": "...",
      "memorableDetails": ["..."]
    },
    {
      "name": "... THIRD LOCATION (350 words total) ...",
      "type": "... different type from first two ...",
      "culture": "... different culture ...",
      "description": "...",
      "magicManifestation": "...",
      "inhabitants": "...",
      "currentSituation": "...",
      "memorableDetails": ["..."]
    }
  ],

  "legends": [
    {
      "title": "string (evocative legend title)",
      "timeframe": "string (when this legend is set: ancient, recent, cyclical)",
      "culturalOrigin": "string (which culture tells this legend)",
      "story": "string (250-300 words: the legend itself told in narrative form with specific events and characters)",
      "moralOrLesson": "string (60-80 words: what this legend teaches)",
      "culturalSignificance": "string (80-100 words: how this legend affects behavior, beliefs, or conflicts in the present day)",
      "truthBehind": "string (60-80 words: what really happened vs the myth)"
    }
  ],

  "uniqueFeature": "string (150-200 words: a distinctive aspect of this world that affects daily life, with concrete examples, specific constraints, edge cases, and practical implications)",

  "secrets": "string (150-200 words: 2-3 hidden truths about the world that aren't common knowledge - deeper workings of world's magic system, hidden factions, suppressed history, coming catastrophes)",

  "uniquenessStatement": "string (150-200 words: explanation of what makes this world distinctive and original, how it stands apart from common fantasy settings, what fresh storytelling opportunities it provides, and what kinds of stories authors could tell here that they couldn't tell elsewhere)"
}

════════════════════════════════════════════════════════════════════════════════
⚠️  MANDATORY WORD COUNT REQUIREMENTS - DO NOT SKIP OR ABBREVIATE ⚠️
════════════════════════════════════════════════════════════════════════════════

MINIMUM REQUIREMENTS (Balanced worldbuilding with pre-generated content):
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
• EACH character: MINIMUM 400 WORDS (3 characters = MINIMUM 1200 words total) ⚠️  NEW
• EACH location: MINIMUM 350 WORDS (3 locations = MINIMUM 1050 words total) ⚠️  NEW
• EACH legend: MINIMUM 450 WORDS (1 legend = MINIMUM 450 words total) ⚠️  NEW
• uniqueFeature: MINIMUM 120 words
• secrets: MINIMUM 120 words
• uniquenessStatement: MINIMUM 120 words

TARGET: 3500-4500 words for comprehensive worldbuilding
This is reasonable and expected for a complete fantasy world foundation.

CONTENT BREAKDOWN:
• Cultures: ~1800-2400 words (33% of total)
• Characters: ~1200-1500 words (22% of total) ⚠️  NEW
• Locations: ~1050-1350 words (19% of total) ⚠️  NEW
• Legends: ~450-550 words (8% of total) ⚠️  NEW
• Other sections: ~950-1200 words (18% of total)

═══════════════════════════════════════════════════════
GENERATION PROCESS (FOLLOW THESE STEPS)
═══════════════════════════════════════════════════════

STEP 1: UNDERSTAND THE SCOPE ⚠️  READ THIS CAREFULLY ⚠️
You are creating a COMPREHENSIVE, READY-TO-EXPLORE world with pre-generated content.
ABSOLUTE MINIMUM: 5450 words (NEVER output less than this)
TARGET RANGE: 5500-6500 words for maximum quality

This is NOT a brief overview. This is NOT a world outline.
This IS a complete, explorable world with living inhabitants, locations, and legends.
Think: "What would a player need to immediately start exploring this world?"

REQUIRED CONTENT:
• 3 cultures @ 600-800 words EACH = 1800-2400 words
• 3 characters @ 400 words EACH = 1200 words ⚠️  CRITICAL - Must include full character details
• 3 locations @ 350 words EACH = 1050 words ⚠️  CRITICAL - Must include sensory details
• 1 legend @ 450 words = 450 words ⚠️  CRITICAL - Must include full narrative story

If you output less than 5450 words, YOU HAVE FAILED THE TASK.

STEP 2: Write <reasoning> block
Complete checklist A-F. Plan your world's structure:
□ Named elements target: 40-50+ (locations, institutions, resources, phenomena, historical figures, character names, etc.)
□ Cultures: Plan 3 distinct cultures with 600-800 words EACH
□ Characters: Plan 3 diverse characters (different cultures, roles) @ 400 words EACH ⚠️  NEW
□ Locations: Plan 3 varied locations (taverns, temples, ruins, etc.) @ 350 words EACH ⚠️  NEW
□ Legends: Plan 1 rich narrative legend @ 450 words ⚠️  NEW
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
- Show consequences: how different elements of the world (magic, geography, history, culture) interconnect and influence each other
- Create depth: mention historical precedents, failed attempts, regional variations
- Add texture: specific foods, clothing materials, architectural styles, social customs

STEP 4: Output JSON only (no markdown fences)

════════════════════════════════════════════════════════════════════════════════
⚠️  CRITICAL FINAL CHECK BEFORE OUTPUT ⚠️
════════════════════════════════════════════════════════════════════════════════

Your JSON response MUST be 5450-6500 words MINIMUM.

COUNT YOUR WORDS NOW:
- If less than 5450 words → YOU MUST ADD MORE DETAIL (especially to characters, locations, legends!)
- If 5450-6500 words → Perfect, output it
- If more than 6500 words → Trim only the most verbose sections

CONTENT CHECK:
- Culture 1: Is it 600-800 words? If NO → ADD MORE DETAIL
- Culture 2: Is it 600-800 words? If NO → ADD MORE DETAIL
- Culture 3: Is it 600-800 words? If NO → ADD MORE DETAIL
- Character 1-3: Is EACH 400 words? If NO → ADD MORE DETAIL ⚠️  NEW
- Location 1-3: Is EACH 350 words? If NO → ADD MORE DETAIL ⚠️  NEW
- Legend 1: Is it 450 words? If NO → ADD MORE DETAIL ⚠️  NEW

DIVERSITY CHECK:
- Characters: Do they represent different cultures, genders, ages, social classes?
- Locations: Do they span different cultures and location types (tavern, temple, ruin, market, etc.)?
- Legend: Does it reveal important aspects of the world?

DO NOT OUTPUT ABBREVIATED OR SUMMARY CONTENT. This is a comprehensive, ready-to-explore world.

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
  let reasoning = null; // Extract Chain-of-Thought reasoning

  try {
    // Extract reasoning block before removing it (Chain-of-Thought feature)
    const reasoningMatch = response.match(/<reasoning>([\s\S]*?)<\/reasoning>/i);
    if (reasoningMatch) {
      reasoning = reasoningMatch[1].trim();
      console.log('[CoT] Chain-of-Thought reasoning extracted:', reasoning.substring(0, 100) + '...');
    }

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

    // Validate required fields - updated for new comprehensive schema
    const requiredFields = [
      'worldName',
      'theme',
      'magicSystem',
      'cultures',
    ];
    for (const field of requiredFields) {
      if (!world[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
    // Note: uniqueFeature, uniquenessStatement, characters, locations, legends are optional

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

    // Initialize empty arrays for optional new fields if not present (backward compatibility)
    if (!world.characters) world.characters = [];
    if (!world.locations) world.locations = [];
    if (!world.legends) world.legends = [];

    // Validate characters array if present
    if (world.characters && Array.isArray(world.characters)) {
      for (const character of world.characters) {
        if (!character.name || !character.role) {
          console.warn('Character missing required fields:', character);
        }
      }
    }

    // Validate locations array if present
    if (world.locations && Array.isArray(world.locations)) {
      for (const location of world.locations) {
        if (!location.name || !location.type) {
          console.warn('Location missing required fields:', location);
        }
      }
    }

    // Validate legends array if present
    if (world.legends && Array.isArray(world.legends)) {
      for (const legend of world.legends) {
        if (!legend.title || !legend.story) {
          console.warn('Legend missing required fields:', legend);
        }
      }
    }

    // Return both world data and reasoning (Chain-of-Thought)
    // Backwards compatible: if code only expects world, it will work
    // New code can access reasoning if desired
    return {
      world,
      reasoning,
      // Also attach reasoning to world object for convenience
      _metadata: {
        reasoning,
        generatedAt: new Date().toISOString(),
        hasChainOfThought: Boolean(reasoning)
      }
    };
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

${world.uniqueFeature ? `🎭 Unique Feature:\n${world.uniqueFeature}\n\n` : ''}💎 What Makes This World Unique:
${world.uniquenessStatement || 'This world offers a unique combination of elements that provides rich opportunities for storytelling.'}
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
