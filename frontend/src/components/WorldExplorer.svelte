<script>
  import { formatWorldForDisplay } from '../prompts/worldGeneration.js';
  import {
    worldExpansionPrompt,
    getCultureExpansionPrompt,
    getCharacterGenerationPrompt,
    getLocationGenerationPrompt,
    getLegendGenerationPrompt,
    getHistoricalEventPrompt,
    getFreeformQuestionPrompt,
    parseExpansionResponse,
  } from '../prompts/worldExpansion.js';
  import ChatInterface from './ChatInterface.svelte';

  // Props
  let { world, apiKey, onNewWorld } = $props();

  // State
  let isGenerating = $state(false);
  let error = $state(null);
  let expansions = $state({
    cultureDetails: {},
    characters: [],
    locations: [],
    legends: [],
    historicalEvents: [],
    freeformAnswers: [],
  });
  let freeformQuestion = $state('');
  let expandedCultures = $state(new Set()); // Track which cultures are expanded

  // Call OpenAI API
  async function callOpenAI(systemPrompt, userPrompt, parameters) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: parameters.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: parameters.temperature,
        max_tokens: parameters.maxTokens,
        response_format: { type: 'json_object' }, // Enforce JSON mode
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Toggle culture expansion
  function toggleCulture(cultureName) {
    const newExpanded = new Set(expandedCultures);
    if (newExpanded.has(cultureName)) {
      newExpanded.delete(cultureName);
    } else {
      newExpanded.add(cultureName);
      // If not already loaded, fetch the expansion
      if (!expansions.cultureDetails[cultureName]) {
        expandCulture(cultureName);
      }
    }
    expandedCultures = newExpanded;
  }

  // Expand on a culture
  async function expandCulture(cultureName) {
    isGenerating = true;
    error = null;

    try {
      const prompt = getCultureExpansionPrompt(world, cultureName);
      const response = await callOpenAI(
        worldExpansionPrompt.systemPrompt,
        prompt,
        worldExpansionPrompt.parameters
      );
      const expansion = parseExpansionResponse(response);
      expansions.cultureDetails[cultureName] = expansion;
    } catch (err) {
      error = `Failed to expand culture: ${err.message}`;
      console.error(err);
    } finally {
      isGenerating = false;
    }
  }

  // Generate a character
  async function generateCharacter(cultureName = null) {
    isGenerating = true;
    error = null;

    try {
      const prompt = getCharacterGenerationPrompt(world, cultureName);
      const response = await callOpenAI(
        worldExpansionPrompt.systemPrompt,
        prompt,
        worldExpansionPrompt.parameters
      );
      const character = parseExpansionResponse(response);
      character.culture = cultureName || world.cultures[0].name;
      expansions.characters = [...expansions.characters, character];

      // Scroll to characters section
      setTimeout(() => {
        document.getElementById('characters-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      error = `Failed to generate character: ${err.message}`;
      console.error(err);
    } finally {
      isGenerating = false;
    }
  }

  // Generate a location
  async function generateLocation() {
    isGenerating = true;
    error = null;

    try {
      const prompt = getLocationGenerationPrompt(world);
      const response = await callOpenAI(
        worldExpansionPrompt.systemPrompt,
        prompt,
        worldExpansionPrompt.parameters
      );
      const location = parseExpansionResponse(response);
      expansions.locations = [...expansions.locations, location];

      setTimeout(() => {
        document.getElementById('locations-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      error = `Failed to generate location: ${err.message}`;
      console.error(err);
    } finally {
      isGenerating = false;
    }
  }

  // Generate a legend
  async function generateLegend() {
    isGenerating = true;
    error = null;

    try {
      const prompt = getLegendGenerationPrompt(world);
      const response = await callOpenAI(
        worldExpansionPrompt.systemPrompt,
        prompt,
        worldExpansionPrompt.parameters
      );
      const legend = parseExpansionResponse(response);
      expansions.legends = [...expansions.legends, legend];

      setTimeout(() => {
        document.getElementById('legends-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      error = `Failed to generate legend: ${err.message}`;
      console.error(err);
    } finally {
      isGenerating = false;
    }
  }

  // Generate a historical event
  async function generateHistoricalEvent() {
    isGenerating = true;
    error = null;

    try {
      const prompt = getHistoricalEventPrompt(world);
      const response = await callOpenAI(
        worldExpansionPrompt.systemPrompt,
        prompt,
        worldExpansionPrompt.parameters
      );
      const event = parseExpansionResponse(response);
      expansions.historicalEvents = [...expansions.historicalEvents, event];
    } catch (err) {
      error = `Failed to generate historical event: ${err.message}`;
      console.error(err);
    } finally {
      isGenerating = false;
    }
  }

  // Ask a freeform question
  async function askQuestion() {
    if (!freeformQuestion.trim()) return;

    isGenerating = true;
    error = null;

    try {
      const prompt = getFreeformQuestionPrompt(world, freeformQuestion);
      const response = await callOpenAI(
        worldExpansionPrompt.systemPrompt,
        prompt,
        worldExpansionPrompt.parameters
      );
      const answer = parseExpansionResponse(response);
      answer.question = freeformQuestion;
      expansions.freeformAnswers = [...expansions.freeformAnswers, answer];
      freeformQuestion = '';
    } catch (err) {
      error = `Failed to answer question: ${err.message}`;
      console.error(err);
    } finally {
      isGenerating = false;
    }
  }

  // Export world as JSON
  function exportAsJSON() {
    const exportData = {
      world,
      expansions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${world.worldName.replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export world as Markdown
  function exportAsMarkdown() {
    let md = `# ${world.worldName}\n\n`;

    if (world.tagline) {
      md += `*${world.tagline}*\n\n`;
    }

    md += `---\n\n`;
    md += `## Core Theme\n\n${world.theme}\n\n`;

    // Geography
    if (world.geography) {
      md += `## Geography\n\n${world.geography.overview}\n\n`;
      if (world.geography.majorLocations && world.geography.majorLocations.length > 0) {
        md += `### Major Locations\n\n`;
        world.geography.majorLocations.forEach((loc) => {
          md += `#### ${loc.name}\n**Type:** ${loc.type}\n\n${loc.description}\n\n*${loc.significance}*\n\n`;
        });
      }
    }

    // History
    if (world.history) {
      md += `## History\n\n`;
      md += `### Ancient Era\n\n${world.history.ancientEra}\n\n`;
      md += `### Formative Conflict\n\n${world.history.formativeConflict}\n\n`;
      md += `### Recent History\n\n${world.history.recentHistory}\n\n`;
    }

    // Magic System
    md += `## Magic System: ${world.magicSystem.name}\n\n`;
    if (world.magicSystem.fundamentals) {
      md += `### Fundamentals\n\n${world.magicSystem.fundamentals}\n\n`;
      if (world.magicSystem.socialImpact) {
        md += `### Social Impact\n\n${world.magicSystem.socialImpact}\n\n`;
      }
      if (world.magicSystem.cost) {
        md += `### Cost & Limitations\n\n${world.magicSystem.cost}\n\n`;
      }
      if (world.magicSystem.variants) {
        md += `### Variants & Traditions\n\n${world.magicSystem.variants}\n\n`;
      }
    } else if (world.magicSystem.description) {
      md += `${world.magicSystem.description}\n\n`;
    }

    // Cultures
    md += `## Cultures\n\n`;
    world.cultures.forEach((culture) => {
      md += `### ${culture.name}\n\n`;
      if (culture.population) {
        md += `**Population:** ${culture.population}\n\n`;
      }
      md += `${culture.description}\n\n`;

      if (culture.socialStructure) {
        md += `**Social Structure:** ${culture.socialStructure}\n\n`;
      }
      if (culture.economy) {
        md += `**Economy:** ${culture.economy}\n\n`;
      }
      if (culture.values) {
        md += `**Values:** ${culture.values}\n\n`;
      }
      if (culture.relationshipToMagic) {
        md += `**Relationship to Magic:** ${culture.relationshipToMagic}\n\n`;
      }
      if (culture.notableFigures) {
        md += `**Notable Figures:** ${culture.notableFigures}\n\n`;
      }

      // Expansions
      if (expansions.cultureDetails[culture.name]) {
        const details = expansions.cultureDetails[culture.name];
        md += `#### Expanded Details\n\n`;
        md += `**Daily Life:**\n${details.dailyLife}\n\n`;
        if (details.notableFigures && details.notableFigures.length > 0) {
          md += `**Notable Figures:**\n`;
          details.notableFigures.forEach((fig) => {
            md += `- **${fig.name}** (${fig.role}): ${fig.description}\n`;
          });
          md += `\n`;
        }
        if (details.locations && details.locations.length > 0) {
          md += `**Locations:**\n`;
          details.locations.forEach((loc) => {
            md += `- **${loc.name}** (${loc.type}): ${loc.description}\n`;
          });
          md += `\n`;
        }
      }
    });

    // Conflicts
    if (world.conflicts) {
      md += `## Conflicts & Tensions\n\n`;
      md += `### Primary Conflict\n\n${world.conflicts.primary}\n\n`;
      if (world.conflicts.secondary && world.conflicts.secondary.length > 0) {
        md += `### Secondary Conflicts\n\n`;
        world.conflicts.secondary.forEach((c) => {
          md += `#### ${c.name}\n\n${c.description}\n\n`;
        });
      }
      if (world.conflicts.risingTensions) {
        md += `### Rising Tensions\n\n${world.conflicts.risingTensions}\n\n`;
      }
    } else if (world.centralConflict) {
      md += `## Central Conflict\n\n${world.centralConflict}\n\n`;
    }

    // Economy
    if (world.economy) {
      md += `## Economy & Trade\n\n${world.economy.overview}\n\n`;
      if (world.economy.scarcity) {
        md += `**Scarcity & Resources:** ${world.economy.scarcity}\n\n`;
      }
    }

    // Daily Life
    if (world.dailyLife) {
      md += `## Daily Life\n\n`;
      md += `### The Common Person\n\n${world.dailyLife.commonPerson}\n\n`;
      if (world.dailyLife.technology) {
        md += `### Technology & Tools\n\n${world.dailyLife.technology}\n\n`;
      }
    }

    // Unique Feature
    if (world.uniqueFeature) {
      md += `## Unique Feature\n\n${world.uniqueFeature}\n\n`;
    }

    // Secrets
    if (world.secrets) {
      md += `## Hidden Secrets\n\n${world.secrets}\n\n`;
    }

    // Uniqueness Statement
    if (world.uniquenessStatement) {
      md += `## What Makes This World Unique\n\n${world.uniquenessStatement}\n\n`;
    }

    // Generated characters
    if (expansions.characters.length > 0) {
      md += `---\n\n## Generated Characters\n\n`;
      expansions.characters.forEach((char) => {
        md += `### ${char.name}\n`;
        md += `**Age:** ${char.age} | **Role:** ${char.role} | **Culture:** ${char.culture}\n\n`;
        md += `${char.physicalDescription}\n\n`;
        md += `${char.personality}\n\n`;
        md += `**Goal:** ${char.goal}\n\n`;
        md += `**Distinctive Trait:** ${char.distinctiveTrait}\n\n`;
        md += `**Secret:** ${char.secret}\n\n`;
      });
    }

    // Generated locations
    if (expansions.locations.length > 0) {
      md += `## Generated Locations\n\n`;
      expansions.locations.forEach((loc) => {
        md += `### ${loc.name}\n`;
        md += `**Type:** ${loc.type}\n\n`;
        md += `${loc.description}\n\n`;
        if (loc.notableFeatures || loc.coreLawManifestation) {
          md += `**Notable Features:** ${loc.notableFeatures || loc.coreLawManifestation}\n\n`;
        }
        md += `**Inhabitants:** ${loc.inhabitants}\n\n`;
        md += `**Current Situation:** ${loc.currentSituation}\n\n`;
      });
    }

    // Legends
    if (expansions.legends.length > 0) {
      md += `## Legends & Myths\n\n`;
      expansions.legends.forEach((legend) => {
        md += `### ${legend.title}\n`;
        md += `*${legend.timeframe}*\n\n`;
        md += `${legend.story}\n\n`;
        md += `**Moral:** ${legend.moralOrLesson}\n\n`;
        md += `**Cultural Significance:** ${legend.culturalSignificance}\n\n`;
      });
    }

    // Historical events
    if (expansions.historicalEvents.length > 0) {
      md += `## Historical Events\n\n`;
      expansions.historicalEvents.forEach((event) => {
        md += `### ${event.name}\n`;
        md += `*${event.timeframe}*\n\n`;
        md += `${event.description}\n\n`;
        md += `**Consequences:** ${event.consequences}\n\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${world.worldName.replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Handle content updates from chat
  function handleChatContentUpdate(structuredData) {
    if (!structuredData || !structuredData.type) return;

    switch (structuredData.type) {
      case 'character':
        expansions.characters = [...expansions.characters, structuredData.data];
        setTimeout(() => {
          document.getElementById('characters-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        break;

      case 'location':
        expansions.locations = [...expansions.locations, structuredData.data];
        setTimeout(() => {
          document.getElementById('locations-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        break;

      case 'legend':
        expansions.legends = [...expansions.legends, structuredData.data];
        setTimeout(() => {
          document.getElementById('legends-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        break;

      default:
        console.warn('Unknown content type:', structuredData.type);
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-3 md:p-6 pb-20">
  <div class="max-w-6xl mx-auto mb-32">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-4xl font-bold text-gray-900 mb-2">{world.worldName}</h1>
          {#if world.tagline}
            <p class="text-base md:text-lg text-purple-600 italic mb-2">{world.tagline}</p>
          {/if}
          <p class="text-sm md:text-base text-gray-600">Explore and expand this unique fantasy world</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            onclick={() => exportAsJSON()}
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
          >
            Export JSON
          </button>
          <button
            onclick={() => exportAsMarkdown()}
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm whitespace-nowrap"
          >
            Export Markdown
          </button>
          <button
            onclick={onNewWorld}
            class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm whitespace-nowrap"
          >
            Generate New World
          </button>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    {#if error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p class="text-red-800">{error}</p>
      </div>
    {/if}

    <!-- Loading Indicator -->
    {#if isGenerating}
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div class="flex items-center gap-3">
          <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <p class="text-blue-800">Generating content...</p>
        </div>
      </div>
    {/if}

    <!-- Worldbuilding Progress Dashboard -->
    <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-md p-6 text-white mb-6">
      <h2 class="text-2xl font-bold mb-4">📚 Your Worldbuilding Journey</h2>

      <div class="grid md:grid-cols-3 gap-4">
        <!-- Foundation -->
        <div class="bg-white/10 backdrop-blur rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <svg class="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <h3 class="font-semibold">Foundation</h3>
          </div>
          <ul class="text-sm space-y-1 text-white/90">
            <li>✓ Core Concept</li>
            <li>✓ Geography</li>
            <li>✓ Magic System</li>
            <li>✓ {world.cultures.length} Culture{world.cultures.length !== 1 ? 's' : ''}</li>
          </ul>
        </div>

        <!-- World Depth -->
        <div class="bg-white/10 backdrop-blur rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-5 h-5 rounded-full border-2 border-white/60 flex items-center justify-center text-xs">
              {expansions.historicalEvents.length}
            </div>
            <h3 class="font-semibold">World Depth</h3>
          </div>
          <ul class="text-sm space-y-1 text-white/90">
            <li>{Object.keys(expansions.cultureDetails).length} expanded culture{Object.keys(expansions.cultureDetails).length !== 1 ? 's' : ''}</li>
            <li>{expansions.historicalEvents.length} historical event{expansions.historicalEvents.length !== 1 ? 's' : ''}</li>
          </ul>
        </div>

        <!-- Story Elements -->
        <div class="bg-white/10 backdrop-blur rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-5 h-5 rounded-full border-2 border-white/60 flex items-center justify-center text-xs">
              {(world.characters?.length || 0) + expansions.characters.length + expansions.locations.length + expansions.legends.length}
            </div>
            <h3 class="font-semibold">Story Seeds</h3>
          </div>
          <ul class="text-sm space-y-1 text-white/90">
            <li>{(world.characters?.length || 0) + expansions.characters.length} character{((world.characters?.length || 0) + expansions.characters.length) !== 1 ? 's' : ''}</li>
            <li>{(world.locations?.length || 0) + expansions.locations.length} location{((world.locations?.length || 0) + expansions.locations.length) !== 1 ? 's' : ''}</li>
            <li>{(world.legends?.length || 0) + expansions.legends.length} legend{((world.legends?.length || 0) + expansions.legends.length) !== 1 ? 's' : ''}</li>
          </ul>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-white/20">
        <p class="text-sm text-white/80">
          💡 <strong>Next Steps:</strong> Expand cultures for daily life details, or generate story elements like characters and locations to bring your world to life.
        </p>
      </div>
    </div>

    <!-- World Content - Single Page Scroll -->
    <div class="space-y-6">

      <!-- SECTION: Foundation -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center gap-3 mb-6 border-b-2 border-purple-200 pb-3">
          <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
          </svg>
          <h2 class="text-3xl font-bold text-gray-900">Foundation: Your World's Core</h2>
        </div>

        <div class="space-y-6">
          <!-- Theme -->
          <div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Setting</h3>
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">{world.theme}</p>
          </div>

          <!-- Geography (if exists) -->
          {#if world.geography}
            <div class="bg-green-50 rounded-lg p-4">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Geography</h3>
              <p class="text-gray-700 leading-relaxed whitespace-pre-line mb-4">{world.geography.overview}</p>
            </div>
          {/if}

          <!-- Magic System -->
          <div class="bg-purple-50 rounded-lg p-4">
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Magic: {world.magicSystem.name}</h3>
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">
              {world.magicSystem.fundamentals || world.magicSystem.description}
            </p>
          </div>

          <!-- Conflicts (if exists) -->
          {#if world.conflicts}
            <div class="bg-red-50 rounded-lg p-4">
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Main Conflict</h3>
              <p class="text-gray-700 leading-relaxed whitespace-pre-line">{world.conflicts.primary}</p>
            </div>
          {/if}
        </div>
      </div>

      <!-- SECTION: Cultures & Peoples -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center gap-3 mb-6 border-b-2 border-purple-200 pb-3">
          <svg class="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
          </svg>
          <h2 class="text-3xl font-bold text-gray-900">Cultures & Peoples</h2>
        </div>
        <p class="text-gray-600 mb-4">Click any culture to expand and see more details. Use "Load More Details" to generate daily life, notable figures, and specific locations.</p>

        <div class="space-y-4">
          {#each world.cultures as culture}
            <div class="border-2 border-gray-200 rounded-lg overflow-hidden">
              <!-- Culture Header (always visible) -->
              <button
                onclick={() => toggleCulture(culture.name)}
                class="w-full p-4 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-2xl font-semibold text-gray-900">{culture.name}</h3>
                    {#if culture.population}
                      <p class="text-sm text-gray-600">Population: {culture.population}</p>
                    {/if}
                  </div>
                  <svg
                    class="w-6 h-6 text-gray-600 transform transition-transform {expandedCultures.has(culture.name) ? 'rotate-180' : ''}"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </button>

              <!-- Culture Content (collapsible) -->
              {#if expandedCultures.has(culture.name)}
                <div class="p-4 border-t-2 border-gray-200">
                  <p class="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">{culture.description}</p>

                  <div class="grid md:grid-cols-2 gap-4 mt-4">
                    {#if culture.values}
                      <div class="bg-gray-50 rounded p-3">
                        <h4 class="font-semibold text-gray-900 text-sm mb-2">Values</h4>
                        <p class="text-gray-700 text-sm">{culture.values}</p>
                      </div>
                    {/if}
                    {#if culture.economy}
                      <div class="bg-gray-50 rounded p-3">
                        <h4 class="font-semibold text-gray-900 text-sm mb-2">Economy</h4>
                        <p class="text-gray-700 text-sm">{culture.economy}</p>
                      </div>
                    {/if}
                  </div>

                  <!-- Show expanded details if loaded -->
                  {#if expansions.cultureDetails[culture.name]}
                    {@const details = expansions.cultureDetails[culture.name]}
                    <div class="mt-4 pt-4 border-t-2 border-gray-200">
                      <h4 class="font-semibold text-gray-900 mb-2">Daily Life</h4>
                      <p class="text-gray-700 text-sm mb-4 whitespace-pre-line">{details.dailyLife}</p>

                      {#if details.notableFigures && details.notableFigures.length > 0}
                        <h4 class="font-semibold text-gray-900 mb-2">Notable Figures</h4>
                        <div class="grid md:grid-cols-2 gap-3">
                          {#each details.notableFigures as figure}
                            <div class="bg-purple-50 rounded p-3">
                              <p class="font-semibold text-sm">{figure.name}</p>
                              <p class="text-xs text-gray-600">{figure.role}</p>
                              <p class="text-xs text-gray-700 mt-1">{figure.description}</p>
                            </div>
                          {/each}
                        </div>
                      {/if}
                    </div>
                  {:else if !isGenerating}
                    <button
                      onclick={() => expandCulture(culture.name)}
                      class="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                    >
                      Load More Details
                    </button>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>

      <!-- SECTION: Deepen Your World -->
      <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg shadow-md p-6 border-2 border-blue-200">
        <h2 class="text-2xl font-bold text-gray-900 mb-3">🎨 Deepen Your World</h2>
        <p class="text-gray-700 mb-4">
          Your foundation is complete! Now it's time to add the details that make your world feel alive.
          Choose what matters most to your story.
        </p>

        <div class="grid md:grid-cols-2 gap-3">
          <button
            onclick={() => generateHistoricalEvent()}
            disabled={isGenerating}
            class="px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-400 font-medium text-left flex items-center gap-3"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
            </svg>
            <div>
              <div class="font-semibold">Add Historical Event</div>
              <div class="text-xs text-white/80">Deepen the timeline</div>
            </div>
          </button>

          <button
            onclick={askQuestion}
            disabled={isGenerating || !freeformQuestion.trim()}
            class="px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 font-medium text-left flex items-center gap-3"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
            </svg>
            <div>
              <div class="font-semibold">Ask About Your World</div>
              <div class="text-xs text-white/80">Use chat to explore</div>
            </div>
          </button>
        </div>
      </div>

      <!-- SECTION: Story Seeds - Characters -->
      {#if world.characters?.length > 0 || expansions.characters.length > 0}
        <div id="characters-section" class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-6 border-b-2 border-green-200 pb-3">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
              <h2 class="text-3xl font-bold text-gray-900">Story Seeds: Characters</h2>
            </div>
            <button
              onclick={() => generateCharacter()}
              disabled={isGenerating}
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 text-sm"
            >
              Generate More
            </button>
          </div>

          <div class="grid md:grid-cols-2 gap-4">
            {#each [...(world.characters || []), ...expansions.characters] as character}
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-xl font-bold text-gray-900">{character.name}</h3>
                <p class="text-sm text-gray-600 mb-3">{character.age} years • {character.role} • {character.culture}</p>
                <p class="text-gray-700 text-sm mb-2">{character.physicalDescription}</p>
                <div class="text-xs text-gray-600 mt-2">
                  <strong>Goal:</strong> {character.goal}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- SECTION: Story Seeds - Locations -->
      {#if world.locations?.length > 0 || expansions.locations.length > 0}
        <div id="locations-section" class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-6 border-b-2 border-green-200 pb-3">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
              <h2 class="text-3xl font-bold text-gray-900">Story Seeds: Locations</h2>
            </div>
            <button
              onclick={() => generateLocation()}
              disabled={isGenerating}
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 text-sm"
            >
              Generate More
            </button>
          </div>

          <div class="space-y-4">
            {#each [...(world.locations || []), ...expansions.locations] as location}
              <div class="border border-gray-200 rounded-lg p-4">
                <h3 class="text-xl font-bold text-gray-900">{location.name}</h3>
                <p class="text-sm text-gray-600 mb-3">{location.type}</p>
                <p class="text-gray-700">{location.description}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- SECTION: Story Seeds - Legends -->
      {#if world.legends?.length > 0 || expansions.legends.length > 0}
        <div id="legends-section" class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center justify-between mb-6 border-b-2 border-yellow-200 pb-3">
            <div class="flex items-center gap-3">
              <svg class="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
              <h2 class="text-3xl font-bold text-gray-900">Story Seeds: Legends</h2>
            </div>
            <button
              onclick={() => generateLegend()}
              disabled={isGenerating}
              class="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors disabled:bg-gray-400 text-sm"
            >
              Generate More
            </button>
          </div>

          <div class="space-y-4">
            {#each [...(world.legends || []), ...expansions.legends] as legend}
              <div class="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-yellow-50 to-orange-50">
                <h3 class="text-xl font-bold text-gray-900 mb-2">{legend.title}</h3>
                <p class="text-sm text-gray-600 italic mb-3">{legend.timeframe}</p>
                <p class="text-gray-800 leading-relaxed whitespace-pre-line">{legend.story}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Story Seeds: Generate Starter Content (if no content generated yet) -->
      {#if !world.characters?.length && !expansions.characters.length && !world.locations?.length && !expansions.locations.length}
        <div class="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg shadow-md p-6 border-2 border-green-200">
          <div class="flex items-center gap-3 mb-4">
            <svg class="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clip-rule="evenodd"/>
            </svg>
            <h2 class="text-2xl font-bold text-gray-900">🌱 Plant Your Story Seeds</h2>
          </div>
          <p class="text-gray-700 mb-4">
            Your world's foundation is ready! Now create story elements - characters to follow, places to explore, and legends to discover.
          </p>
          <div class="grid md:grid-cols-3 gap-3">
            <button
              onclick={() => generateCharacter()}
              disabled={isGenerating}
              class="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-medium flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
              </svg>
              Generate Character
            </button>
            <button
              onclick={() => generateLocation()}
              disabled={isGenerating}
              class="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 font-medium flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
              Generate Location
            </button>
            <button
              onclick={() => generateLegend()}
              disabled={isGenerating}
              class="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:bg-gray-400 font-medium flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
              </svg>
              Generate Legend
            </button>
          </div>
        </div>
      {/if}

    </div>
  </div>

  <!-- Chat Interface -->
  <ChatInterface
    {world}
    {apiKey}
    onContentUpdate={handleChatContentUpdate}
  />
</div>
