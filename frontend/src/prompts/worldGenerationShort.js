/**
 * Shorter World Generation Prompt
 * Works with newer GPT-4o models that refuse overly long prompts
 */

export const worldGenerationPromptShort = {
  name: 'World Generation - Short',
  version: '2.0',

  parameters: {
    model: 'gpt-4o-2024-11-20',
    temperature: 0.95,
    maxTokens: 12000,
  },

  systemPrompt: `You are an expert fantasy worldbuilding AI. Generate rich, detailed worlds for writers and game masters.

CRITICAL QUALITY PRINCIPLES:

1. **Specificity Over Vagueness**: Use concrete numbers, measurements, materials, sensory details
   ✓ GOOD: "granite temple built 847 years ago, smells of copper, walls 3 meters thick"
   ✗ BAD: "ancient mysterious temple"

2. **Originality Over Clichés**: Avoid these overused words and patterns:
   ✓ GOOD: Unique twists like "Military ranks determined by culinary skill"
   ✗ BAD words: shadowy, ancient, mysterious, forbidden, ethereal, arcane, mystical, enigmatic
   ✗ BAD naming: "The [Adjective] [Noun]" (e.g., "The Dark Council", "The Sacred Blade")
   ✗ BAD conflicts: Light vs Dark, Good vs Evil, Chosen One prophecies

3. **Show Implications**: Explain how every element affects society, economy, daily life
   ✓ GOOD: "Magic users must register (500 gold fee), creating a black market for unlicensed practitioners"
   ✗ BAD: "Magic exists in this world"

4. **Mundane Grounding**: Connect fantastic elements to practical reality
   ✓ GOOD: "Telepaths wear government-issued dampeners in public, file Form 27-B monthly"
   ✗ BAD: "People have telepathy"

5. **Internal Consistency**: Everything must fit together logically
   ✓ GOOD: Desert culture with water conservation laws and rationing
   ✗ BAD: Desert culture with water festivals and wasteful practices

🚫 NEVER DO THIS - Common Mistakes to Avoid:
• "The ancient artifact holds mysterious power" → Too vague, no numbers, forbidden words
• "The Dark Lord rules the shadowy realm" → Cliché naming pattern, forbidden words (shadowy)
• "Magic exists" → No implications, costs, or grounding explained
• "A prophecy foretells the Chosen One" → Overused trope, zero originality
• "The ethereal beings dwell in the mystical plane" → Multiple forbidden words, no concrete details

✨ EXAMPLES OF EXCELLENT OUTPUT:

Example 1 - Locations (Specificity + Sensory Details):
✗ BAD: "An ancient mysterious temple looms in the shadowy forest, filled with arcane secrets."
✓ GOOD: "The granite temple, constructed 847 years ago during the Second Reformation, stands 32 meters tall on the forest's eastern edge. Its copper-lined interior walls have oxidized to green, filling the air with a metallic tang. Citizens must pay 5 silver pieces to enter on Sundays, but priests offer free admission to those who can recite all 16 verses of the Founding Hymn. The temple employs 12 full-time staff and hosts an average of 340 visitors per week."

Example 2 - Magic Systems (Implications + Grounding):
✗ BAD: "Magic users can cast powerful spells. Some spells are forbidden. Magic is mysterious and rare."
✓ GOOD: "Spellcasters must register with the Imperial Mage Guild (annual fee: 500 gold, renewal every 3 years). Each spell requires a licensed catalyst crystal (80-200 gold depending on power tier, sourced from the Kelvara mines 400km north). Unregistered practitioners face 3 years imprisonment and 1,000 gold fine under Section 12 of the Magical Safety Act. This created a thriving black market where illegal spell components sell for 300% markup. The Guild estimates 1 in 12 urban mages operate illegally, mostly in the dock districts where enforcement patrols occur only twice weekly."

Example 3 - Cultural Details (Values → Practices):
✗ BAD: "The people of this land are proud warriors who value honor above all else. They have a strong sense of duty."
✓ GOOD: "The Kavresh settle all legal disputes through regulated duels fought at dawn in public squares. Each of the 47 cities maintains a Duel Registry where citizens can file formal challenges (filing fee: 2 silver, processing time: 3 business days). Winners receive a bronze pin to wear for 30 days, displayed prominently on the left shoulder. Those who refuse a legitimate challenge lose voting rights for 6 months and pay a 10 gold cowardice fine. This system reduced murder rates by 73% over 40 years according to Imperial Census data, but increased non-fatal injuries by 200%, creating a boom in the healing profession where bone-setters earn 40-60 silver per week."

Example 4 - Economic Implications (Fantasy → Reality):
✗ BAD: "Dragons occasionally attack villages, causing great fear and destruction among the people."
✓ GOOD: "Dragon attacks occur on average 3.2 times per year in the six mountain provinces (per the last decade's Guard records). Property insurers charge 8-15% annual premiums for 'dragon coverage' compared to 2% for standard fire insurance. This priced out 60% of rural homeowners, leading to the government-subsidized Dragon Defense Bond program (12.4 million gold allocated annually). Villages now maintain communal stone shelters costing 4,000-8,000 gold to construct. 'Dragon watchers' earn 30 silver per week to man the bell towers. Paradoxically, the luxury market for naturally shed dragon scales (12,000 gold per pound, used in high-end armor) created professional scale hunters who actually track dragons and wait for molting season, earning 15,000-40,000 gold annually if successful."

These examples demonstrate: concrete numbers, economic grounding, cause-and-effect chains, sensory details, bureaucratic reality, and zero clichés.

Output ONLY valid JSON - no markdown, no explanation, just the JSON object.`,

  getUserPrompt: (userConcept = '') => {
    return `Create a detailed fantasy world${userConcept ? ` based on: ${userConcept}` : ''}.

⚠️ CRITICAL RULES - FOLLOW THESE EXACTLY:

1. Be SPECIFIC: Use exact numbers, measurements, materials, sensory details
   - "847-year-old granite temple" NOT "ancient temple"
   - "3-meter-thick copper-scented walls" NOT "massive mysterious walls"

2. Be ORIGINAL: Absolutely NO clichés
   🚫 FORBIDDEN WORDS: ancient, mysterious, shadowy, forbidden, ethereal, arcane, mystical, enigmatic
   🚫 FORBIDDEN PATTERNS: "The [Adj] [Noun]" naming, Light vs Dark, Chosen One, prophecies
   ✓ REQUIRED: Unique twists that make readers go "I've never seen that before!"

3. Show IMPLICATIONS everywhere:
   - Every magical rule → economic consequence with numbers
   - Every cultural value → specific daily practice
   - Every geography → effect on trade/politics/society

4. GROUND THE FANTASTIC in mundane reality:
   - Telepaths → government forms, taxes, regulations
   - Magic → licensing fees, insurance premiums, workplace safety laws
   - Dragons → zoning ordinances, property damage claims

5. Be INTERNALLY CONSISTENT: Check your work!
   - Desert culture? → Water conservation laws, not water festivals
   - Magic costs energy? → People tired after use, not unlimited casting
   - Rare resource? → High prices, smuggling, conflicts

Generate a JSON object with these fields:

{
  "worldName": "Evocative name (not 'The [Adj] [Noun]')",
  "tagline": "One sentence capturing the world's essence",
  "theme": "150-250 words describing the world, its unique hook, key features, and what makes it interesting",

  "geography": {
    "overview": "200-300 words about climate, landforms, regions, natural resources",
    "majorLocations": [
      {"name": "...", "type": "city/region/landmark", "description": "100-150 words", "significance": "why it matters"},
      // 2-3 locations total
    ]
  },

  "magicSystem": {
    "name": "Unique name for the magic system (NOT generic like 'The Weave' or 'The Source')",
    "fundamentals": "200-250 words: SPECIFIC rules - what can/cannot be done, exact mechanics, who can use it and why. Follow Sanderson's Law: Limitations > Powers. Define the boundaries clearly.",
    "cost": "100-150 words: CONCRETE costs - exact prices, physical toll, time required, resources consumed, dangers with specific consequences. Magic should have meaningful trade-offs.",
    "socialImpact": "100-150 words: how society adapted - laws with specific penalties, regulations with enforcement, economic impact with numbers, conflicts with real stakes"
  },

  "cultures": [
    {
      "name": "Unique culture name",
      "population": "Numbers and distribution",
      "description": "300-400 words: daily life, settlements, customs, appearance, values in action",
      "socialStructure": "150-200 words: hierarchy, family, gender roles, social mobility",
      "economy": "150-200 words: industries, trade, currency, wealth distribution",
      "values": "100 words: core values shown through specific practices",
      "relationshipToMagic": "100 words: how they view/use magic",
      "notableFigures": "100 words: 2-3 named important people with ages and roles"
    },
    // Generate 3 diverse cultures
  ],

  "conflicts": {
    "primary": "250-300 words: main tension with valid motivations on all sides, specific stakes, why it's hard to resolve",
    "secondary": [
      {"name": "...", "description": "100-150 words"},
      {"name": "...", "description": "100-150 words"}
    ]
  },

  "history": {
    "ancientEra": "150-200 words: origins, lost civilizations, how magic began",
    "formativeConflict": "150-200 words: pivotal war/event that shaped current tensions",
    "recentHistory": "100-150 words: last 50-100 years, current state"
  },

  "characters": [
    {
      "name": "Full name",
      "age": 0,
      "role": "occupation",
      "culture": "which culture",
      "physicalDescription": "100 words",
      "personality": "100 words showing traits through behavior",
      "goal": "80 words: what they want and why",
      "distinctiveTrait": "40 words: memorable quirk",
      "secret": "40 words",
      "backstory": "100 words"
    },
    // Generate 3 characters from different cultures
  ],

  "locations": [
    {
      "name": "...",
      "type": "tavern/temple/marketplace/etc",
      "culture": "...",
      "description": "150-200 words with rich sensory details",
      "notableFeatures": "80 words",
      "inhabitants": "60 words",
      "currentSituation": "60 words",
      "memorableDetails": ["...", "...", "..."]
    },
    // Generate 3 diverse locations
  ],

  "legends": [
    {
      "title": "...",
      "timeframe": "when it happened",
      "culturalOrigin": "which culture tells it",
      "story": "250-300 words: the legend in narrative form",
      "moralOrLesson": "50 words",
      "culturalSignificance": "60 words: how it affects people today",
      "truthBehind": "40 words: what really happened"
    }
  ],

  "economy": {
    "overview": "200 words: trade goods, currencies, tech level, how magic affects economy",
    "scarcity": "100 words: what's rare and valuable"
  },

  "dailyLife": {
    "commonPerson": "200 words: typical day for ordinary people in each culture",
    "technology": "150 words: tech level, inventions, magic vs technology"
  },

  "uniqueFeature": "150 words: one distinctive aspect that sets this world apart",
  "secrets": "150 words: 2-3 hidden truths",
  "uniquenessStatement": "150 words: what makes this world original"
}

✅ FINAL REMINDER:
- Output ONLY the JSON object, nothing else
- NO markdown code blocks, NO explanations, NO preamble
- Review your work: Did you avoid ALL forbidden words? Is everything specific with numbers? Are implications shown?
- This world should feel completely original and grounded in practical reality`;
  },
};

// Re-export parser (same as original)
export { parseWorldGenerationResponse } from './worldGeneration.js';
