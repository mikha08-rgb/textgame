<script>
  import { worldGenerationPromptShort as worldGenerationPrompt, parseWorldGenerationResponse } from '../prompts/worldGenerationShort.js';
  import { detectCliches } from '../lib/clicheDetector.js';

  // Props
  let { apiKey, onClearKey } = $props();

  // Simple state
  let userInput = $state('');
  let world = $state(null);
  let isGenerating = $state(false);
  let error = $state(null);
  let errorType = $state(null); // 'api-key', 'parsing', 'quality', 'network', 'generic'
  let errorDetails = $state(null); // Additional context for the error
  let generationStage = $state(''); // For progress messages

  // Chat state
  let chatMessage = $state('');
  let chatHistory = $state([]);
  let isChatting = $state(false);

  // UI state
  let expandedSections = $state(new Set(['theme', 'geography', 'magic'])); // Default expanded
  let showWelcome = $state(false);
  let progressStage = $state(0); // For animated progress
  let progressInterval = null;
  let welcomeTimeout = null;

  // Quality analysis
  let qualityAnalysis = $state(null);

  // Cleanup on component unmount
  $effect(() => {
    return () => {
      if (progressInterval) clearInterval(progressInterval);
      if (welcomeTimeout) clearTimeout(welcomeTimeout);
    };
  });

  // Example prompts
  const examples = [
    "A volcanic archipelago where merchants trade obsidian and control magic through crystals",
    "Floating islands connected by massive vines that require blood sacrifice to grow",
    "A desert where water is solid crystal and sand flows like liquid rivers",
    "Cities built inside the ribcages of dead colossal titans",
    "A world where spoken words physically manifest as glowing symbols in the air"
  ];

  // Toggle section expand/collapse
  function toggleSection(sectionName) {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionName)) {
      newExpanded.delete(sectionName);
    } else {
      newExpanded.add(sectionName);
    }
    expandedSections = newExpanded;
  }

  // Validate world quality
  function validateWorldQuality(worldData) {
    const issues = [];
    let qualityScore = 100;

    // Check 1: Theme should contain at least 3 numbers (detail indicator)
    const themeText = worldData.theme || '';
    const numberCount = (themeText.match(/\d+/g) || []).length;
    if (numberCount < 3) {
      issues.push('Theme lacks specific numerical details');
      qualityScore -= 15;
    }

    // Check 2: Magic system should have specific costs
    const magicCost = worldData.magicSystem?.cost || '';
    if (!magicCost || magicCost.length < 50) {
      issues.push('Magic system lacks detailed cost/limitation description');
      qualityScore -= 20;
    } else {
      // Check for vague terms in magic cost
      const vagueTerms = ['energy', 'stamina', 'mana', 'power'];
      const hasVagueCost = vagueTerms.some(term =>
        magicCost.toLowerCase().includes(term) &&
        !magicCost.includes('specific') &&
        !magicCost.includes('exactly')
      );
      if (hasVagueCost && magicCost.length < 100) {
        issues.push('Magic cost uses generic terms without specific details');
        qualityScore -= 10;
      }
    }

    // Check 3: Overall content richness
    const worldText = JSON.stringify(worldData);
    const wordCount = worldText.split(/\s+/).length;
    if (wordCount < 500) {
      issues.push('World lacks sufficient detail (too short)');
      qualityScore -= 15;
    }

    // Check 4: Key sections exist
    const requiredSections = ['theme', 'magicSystem', 'geography', 'cultures', 'characters'];
    const missingSections = requiredSections.filter(section => !worldData[section]);
    if (missingSections.length > 0) {
      issues.push(`Missing sections: ${missingSections.join(', ')}`);
      qualityScore -= missingSections.length * 10;
    }

    // Ensure score doesn't go below 0
    qualityScore = Math.max(0, qualityScore);

    return {
      isValid: qualityScore >= 70 && issues.length < 3,
      qualityScore,
      issues
    };
  }

  // Animated progress stages
  const progressStages = [
    { stage: 0, text: '🌍 Designing geography and climate...', percent: 15 },
    { stage: 1, text: '✨ Crafting magic system...', percent: 30 },
    { stage: 2, text: '🏛️ Building cultures and societies...', percent: 50 },
    { stage: 3, text: '👤 Creating characters...', percent: 65 },
    { stage: 4, text: '🗺️ Mapping locations...', percent: 80 },
    { stage: 5, text: '📜 Writing legends and history...', percent: 95 },
  ];

  // Generate world directly - NO INTERVIEW
  async function generateWorld() {
    if (!userInput.trim()) {
      error = 'Please describe your world idea first';
      errorType = 'generic';
      return;
    }

    isGenerating = true;
    error = null;
    errorType = null;
    errorDetails = null;
    progressStage = 0;

    // Simulate progress animation
    progressInterval = setInterval(() => {
      if (progressStage < progressStages.length - 1) {
        progressStage++;
      }
    }, 8000); // Every 8 seconds

    const maxAttempts = 2;
    let bestWorld = null;
    let bestValidation = null;
    let bestQualityAnalysis = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Show retry message on second attempt
        if (attempt === 2) {
          generationStage = '⚠️ Quality check failed, regenerating for better results...';
          console.log('[WorldGen] Retrying generation (attempt 2)');
        }

        // Call OpenAI with streaming to show progress
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 min timeout

        const response = await fetch('/api/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-2024-11-20',
            messages: [
              { role: 'system', content: worldGenerationPrompt.systemPrompt },
              { role: 'user', content: worldGenerationPrompt.getUserPrompt(userInput) }
            ],
            temperature: 0.95,
            max_tokens: 16000,
            response_format: { type: 'json_object' }
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
          const statusCode = response.status;

          // Specific error handling based on status code
          if (statusCode === 401) {
            error = 'Invalid API key. Please check your OpenAI API key and try again.';
            errorType = 'api-key';
            errorDetails = { suggestion: 'Your API key may be incorrect or expired. Click "Change API Key" below to update it.' };
          } else if (statusCode === 429) {
            error = 'Rate limit exceeded or quota depleted.';
            errorType = 'api-key';
            errorDetails = { suggestion: 'You may have exceeded your API quota or rate limit. Check your OpenAI account dashboard or wait a few minutes.' };
          } else if (statusCode === 500 || statusCode === 503) {
            error = 'OpenAI service is temporarily unavailable.';
            errorType = 'network';
            errorDetails = { suggestion: 'This is a temporary issue with OpenAI servers. Please try again in a few moments.' };
          } else {
            error = errorData.error?.message || `API error: ${statusCode}`;
            errorType = 'network';
            errorDetails = { suggestion: 'Check your internet connection and try again.' };
          }

          throw new Error(error);
        }

        generationStage = 'Parsing world data...';

        const data = await response.json();
        const generatedText = data.choices[0].message.content;

        console.log(`[WorldGen] Attempt ${attempt} - Raw response length:`, generatedText.length);
        console.log(`[WorldGen] Attempt ${attempt} - First 500 chars:`, generatedText.substring(0, 500));

        // Check if response is too short
        if (generatedText.length < 500) {
          if (attempt === maxAttempts) {
            error = 'Generated world is too short. The AI may have encountered an issue.';
            errorType = 'quality';
            errorDetails = {
              suggestion: 'Try regenerating with a more detailed description, or try a different world concept.',
              responseLength: generatedText.length
            };
            throw new Error(error);
          } else {
            continue; // Try again
          }
        }

        // Parse the world
        try {
          const parseResult = parseWorldGenerationResponse(generatedText);
          const candidateWorld = parseResult.world;
          console.log(`[WorldGen] Attempt ${attempt} - World parsed:`, candidateWorld.worldName);

          // Validate required fields
          const missingFields = [];
          if (!candidateWorld.worldName) missingFields.push('worldName');
          if (!candidateWorld.theme) missingFields.push('theme');
          if (!candidateWorld.geography) missingFields.push('geography');
          if (!candidateWorld.magicSystem) missingFields.push('magicSystem');

          if (missingFields.length > 0) {
            if (attempt === maxAttempts) {
              error = `Generated world is missing required fields: ${missingFields.join(', ')}`;
              errorType = 'parsing';
              errorDetails = {
                missingFields,
                suggestion: 'The AI didn\'t generate all required elements. Try regenerating with a clearer, more detailed description.'
              };
              throw new Error(error);
            } else {
              continue; // Try again
            }
          }

          // Validate quality
          generationStage = 'Validating world quality...';
          const validation = validateWorldQuality(candidateWorld);
          console.log(`[WorldGen] Attempt ${attempt} - Quality score:`, validation.qualityScore);
          console.log(`[WorldGen] Attempt ${attempt} - Validation issues:`, validation.issues);

          // Analyze cliches
          const worldText = JSON.stringify(candidateWorld);
          const clicheAnalysis = detectCliches(worldText, 'fantasy');

          // Keep track of best world so far
          if (!bestWorld || validation.qualityScore > bestValidation.qualityScore) {
            bestWorld = candidateWorld;
            bestValidation = validation;
            bestQualityAnalysis = clicheAnalysis;
          }

          // If quality is good enough, use this world and stop
          if (validation.isValid) {
            console.log(`[WorldGen] Attempt ${attempt} - Quality check passed!`);
            world = candidateWorld;
            qualityAnalysis = clicheAnalysis;

            // Show welcome message
            showWelcome = true;
            if (welcomeTimeout) clearTimeout(welcomeTimeout);
            welcomeTimeout = setTimeout(() => showWelcome = false, 8000);

            break; // Success! Exit the retry loop
          } else {
            console.log(`[WorldGen] Attempt ${attempt} - Quality check failed:`, validation.issues);
            // If this is not the last attempt, continue to retry
            if (attempt < maxAttempts) {
              continue;
            } else {
              // Last attempt failed - use best result with warning
              console.log('[WorldGen] All attempts completed. Using best result with warning.');
              world = bestWorld;
              qualityAnalysis = bestQualityAnalysis;
              error = `Quality check failed. Generated world has some issues.`;
              errorType = 'quality';
              errorDetails = {
                qualityScore: bestValidation.qualityScore,
                issues: bestValidation.issues,
                suggestion: 'The world was generated but could be improved. You can use it as-is or regenerate for better results.'
              };

              // Show welcome message with warning
              showWelcome = true;
              if (welcomeTimeout) clearTimeout(welcomeTimeout);
              welcomeTimeout = setTimeout(() => showWelcome = false, 10000); // Show longer for warning
            }
          }

        } catch (parseErr) {
          console.error(`[WorldGen] Attempt ${attempt} - Parse error:`, parseErr);
          if (attempt === maxAttempts) {
            // Last attempt and still failing - throw error
            error = `Failed to parse world data: ${parseErr.message}`;
            errorType = 'parsing';
            errorDetails = {
              suggestion: 'The AI generated invalid data. Try simplifying your world concept or regenerating.',
              parseError: parseErr.message
            };
            throw new Error(error);
          }
          // Continue to next attempt
          continue;
        }

      } catch (err) {
        console.error(`[WorldGen] Attempt ${attempt} - Generation error:`, err);
        if (attempt === maxAttempts) {
          // Last attempt - show error (if not already set)
          if (!error) {
            if (err.name === 'AbortError') {
              error = 'Generation timed out after 3 minutes.';
              errorType = 'network';
              errorDetails = { suggestion: 'The request took too long. Try a simpler world concept or check your internet connection.' };
            } else {
              error = err.message || 'Failed to generate world';
              errorType = errorType || 'generic';
            }
          }
          break;
        }
        // Continue to next attempt
        continue;
      }
    }

    // Cleanup
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }

    isGenerating = false;
    progressStage = 0;
    generationStage = '';
  }

  // Export world as JSON
  function exportWorld() {
    if (!world || !world.worldName) {
      console.error('No world to export');
      return;
    }

    const dataStr = JSON.stringify(world, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(world.worldName || 'world').replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Copy world to clipboard
  async function copyWorld(event) {
    if (!world) {
      console.error('No world to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(world, null, 2));
      // Show temporary success message
      const btn = event?.target || event?.currentTarget;
      if (btn) {
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => btn.textContent = originalText, 2000);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  }

  function startOver() {
    // Clean up timers
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
    if (welcomeTimeout) {
      clearTimeout(welcomeTimeout);
      welcomeTimeout = null;
    }

    world = null;
    userInput = '';
    error = null;
    errorType = null;
    errorDetails = null;
    chatHistory = [];
    chatMessage = '';
    showWelcome = false;
    isGenerating = false;
    progressStage = 0;
    qualityAnalysis = null;
  }

  // Regenerate world with the same input
  function regenerateWorld() {
    error = null;
    errorType = null;
    errorDetails = null;
    generateWorld();
  }

  function useExample(example) {
    userInput = example;
  }

  // Send chat message to refine/expand world
  async function sendChatMessage() {
    if (!chatMessage.trim() || isChatting) return;

    const userMsg = chatMessage.trim();
    chatMessage = ''; // Clear input

    // Add user message to history
    chatHistory = [...chatHistory, { role: 'user', content: userMsg }];
    isChatting = true;

    try {
      // Build context: current world + chat history
      const worldContext = `Current world: ${world.worldName}

${JSON.stringify(world, null, 2)}`;

      const messages = [
        {
          role: 'system',
          content: `You are a worldbuilding assistant. The user has a fantasy world and wants to refine or expand it.

CRITICAL: Output ONLY valid JSON with the UPDATED world. Use the same structure as the current world, but with modifications based on the user's request.

If the user asks to:
- ADD something (character, location, culture, etc.) → Add it to the appropriate array
- CHANGE something → Modify that field
- EXPAND something → Add more detail to that section
- REMOVE something → Remove it from the array

Always maintain the same JSON structure. Output ONLY the JSON, nothing else.`
        },
        {
          role: 'user',
          content: worldContext
        },
        ...chatHistory.map(msg => ({ role: msg.role, content: msg.content }))
      ];

      const response = await fetch('/api/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-2024-11-20',
          messages,
          temperature: 0.8,
          max_tokens: 8000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        const statusCode = response.status;

        // Provide helpful error messages
        if (statusCode === 401) {
          throw new Error('Invalid API key. Please update your API key.');
        } else if (statusCode === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else {
          throw new Error(errorData.error?.message || `API error: ${statusCode}`);
        }
      }

      const data = await response.json();
      const aiResponse = data.choices[0].message.content;

      // Parse the updated world
      try {
        const parseResult = parseWorldGenerationResponse(aiResponse);
        const updatedWorld = parseResult.world;

        // Validate that the update makes sense
        if (!updatedWorld.worldName || !updatedWorld.theme) {
          throw new Error('Update resulted in incomplete world data.');
        }

        // Update the world
        world = updatedWorld;

        // Re-analyze quality after update
        const worldText = JSON.stringify(world);
        qualityAnalysis = detectCliches(worldText, 'fantasy');

        // Add AI response to chat
        chatHistory = [...chatHistory, {
          role: 'assistant',
          content: `✅ Updated! I've ${userMsg.toLowerCase().includes('add') ? 'added' : userMsg.toLowerCase().includes('change') ? 'changed' : 'updated'} the world as requested. Check the panels to see the changes.`
        }];

      } catch (parseErr) {
        console.error('Failed to parse updated world:', parseErr);
        throw new Error('Could not apply your changes. Try being more specific about what you want to modify.');
      }

    } catch (err) {
      console.error('Chat error:', err);

      // Provide helpful error message
      let errorMsg = err.message;
      if (err.message.includes('API key')) {
        errorMsg = '🔑 ' + err.message;
      } else if (err.message.includes('Rate limit')) {
        errorMsg = '⏱️ ' + err.message;
      } else {
        errorMsg = '❌ ' + err.message;
      }

      chatHistory = [...chatHistory, {
        role: 'assistant',
        content: errorMsg
      }];
    } finally {
      isChatting = false;
    }
  }
</script>

<!-- INPUT VIEW -->
{#if !world}
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12">
        <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AI Worldbuilding Studio
        </h1>
        <p class="text-xl text-gray-300">
          Describe your world idea. I'll generate a rich, detailed fantasy world in 60 seconds.
        </p>
      </div>

      <!-- Error -->
      {#if error}
        <div class="bg-red-500/20 border border-red-500 rounded-lg p-5 mb-6">
          <!-- Error Icon & Message -->
          <div class="flex items-start gap-3 mb-4">
            <span class="text-3xl">
              {#if errorType === 'api-key'}
                🔑
              {:else if errorType === 'quality'}
                ⚠️
              {:else if errorType === 'parsing'}
                📄
              {:else if errorType === 'network'}
                🌐
              {:else}
                ❌
              {/if}
            </span>
            <div class="flex-1">
              <h3 class="font-bold text-red-100 text-lg mb-1">
                {#if errorType === 'api-key'}
                  API Key Issue
                {:else if errorType === 'quality'}
                  Quality Warning
                {:else if errorType === 'parsing'}
                  Generation Error
                {:else if errorType === 'network'}
                  Connection Issue
                {:else}
                  Error
                {/if}
              </h3>
              <p class="text-red-200">{error}</p>
            </div>
          </div>

          <!-- Helpful Suggestion -->
          {#if errorDetails?.suggestion}
            <div class="bg-red-900/30 rounded-lg p-3 mb-4">
              <p class="text-sm text-red-100">
                <span class="font-semibold">💡 Tip:</span> {errorDetails.suggestion}
              </p>
            </div>
          {/if}

          <!-- Quality Score Details -->
          {#if errorType === 'quality' && errorDetails?.qualityScore}
            <div class="mb-4">
              <p class="text-sm text-red-200 mb-2">
                Quality Score: <span class="font-bold">{errorDetails.qualityScore}%</span>
              </p>
              {#if errorDetails.issues && errorDetails.issues.length > 0}
                <p class="text-xs text-red-300 mb-1">Issues detected:</p>
                <ul class="text-xs text-red-200 list-disc list-inside space-y-1">
                  {#each errorDetails.issues as issue}
                    <li>{issue}</li>
                  {/each}
                </ul>
              {/if}
            </div>
          {/if}

          <!-- Missing Fields Details -->
          {#if errorType === 'parsing' && errorDetails?.missingFields}
            <div class="mb-4">
              <p class="text-sm text-red-200 mb-1">Missing required fields:</p>
              <ul class="text-xs text-red-200 list-disc list-inside">
                {#each errorDetails.missingFields as field}
                  <li>{field}</li>
                {/each}
              </ul>
            </div>
          {/if}

          <!-- Action Buttons -->
          <div class="flex gap-3 flex-wrap">
            {#if errorType === 'api-key'}
              <button
                onclick={onClearKey}
                class="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition-all"
              >
                🔑 Update API Key
              </button>
            {:else if errorType === 'quality' || errorType === 'parsing'}
              <button
                onclick={regenerateWorld}
                class="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition-all"
              >
                🔄 Regenerate
              </button>
              <button
                onclick={() => { error = null; errorType = null; errorDetails = null; }}
                class="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-all"
              >
                ✏️ Edit Prompt
              </button>
            {:else if errorType === 'network'}
              <button
                onclick={regenerateWorld}
                class="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition-all"
              >
                🔄 Retry
              </button>
            {:else}
              <button
                onclick={regenerateWorld}
                class="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-semibold transition-all"
              >
                🔄 Try Again
              </button>
            {/if}
          </div>

          <!-- Debug Info -->
          <details class="mt-4">
            <summary class="text-xs text-red-300 cursor-pointer hover:text-red-100">Show debug info</summary>
            <div class="mt-2 text-xs text-red-200 font-mono bg-red-900/20 p-2 rounded max-h-60 overflow-auto">
              <p>Error Type: {errorType || 'unknown'}</p>
              {#if errorDetails}
                <p class="mt-1">Details: {JSON.stringify(errorDetails, null, 2)}</p>
              {/if}
              <p class="mt-1">Check browser console (F12) for detailed logs</p>
            </div>
          </details>
        </div>
      {/if}

      <!-- Input Box or Progress -->
      {#if !isGenerating}
        <div class="bg-slate-800/50 backdrop-blur rounded-xl p-8 mb-8 border border-slate-700">
          <label class="block text-sm font-medium text-gray-300 mb-3">
            Describe your world concept:
          </label>
          <textarea
            bind:value={userInput}
            placeholder="Example: A world where time flows backwards at midnight..."
            class="w-full h-32 bg-slate-900/50 border border-slate-600 rounded-lg p-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            onkeydown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                generateWorld();
              }
            }}
          ></textarea>
          <div class="flex justify-between items-center mt-4">
            <span class="text-sm text-gray-400">Ctrl+Enter to generate</span>
            <button
              onclick={generateWorld}
              class="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:from-purple-500 hover:to-pink-500 transition-all transform hover:scale-105"
            >
              ✨ Generate World
            </button>
          </div>
        </div>
      {:else}
        <!-- Animated Progress -->
        <div class="bg-slate-800/50 backdrop-blur rounded-xl p-8 mb-8 border border-slate-700">
          <div class="text-center space-y-6">
            <div class="text-2xl font-bold text-purple-400 animate-pulse">
              ✨ Crafting Your World
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                style="width: {progressStages[progressStage].percent}%"
              ></div>
            </div>

            <!-- Current Stage -->
            <div class="text-lg text-gray-300">
              {generationStage || progressStages[progressStage].text}
            </div>

            <div class="text-sm text-gray-500">
              {generationStage.includes('regenerating') ? 'Attempting to improve quality...' : 'This usually takes 30-60 seconds...'}
            </div>

            <!-- Spinning Icon -->
            <div class="flex justify-center">
              <svg class="animate-spin h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </div>
      {/if}

      <!-- Examples -->
      <div class="space-y-3">
        <p class="text-sm font-medium text-gray-400">Or try an example:</p>
        {#each examples as example}
          <button
            onclick={() => useExample(example)}
            disabled={isGenerating}
            class="w-full text-left bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700 rounded-lg p-4 transition-all disabled:opacity-50"
          >
            <p class="text-gray-300">{example}</p>
          </button>
        {/each}
      </div>

      <!-- API Key Button -->
      <div class="mt-8 text-center">
        <button
          onclick={onClearKey}
          class="text-sm text-gray-400 hover:text-gray-300 underline"
        >
          Change API Key
        </button>
      </div>
    </div>
  </div>

<!-- WORLD VIEW -->
{:else}
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
    <!-- Header -->
    <div class="bg-slate-800/50 backdrop-blur border-b border-slate-700 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-8 py-6">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {world.worldName}
            </h1>
            <p class="text-gray-400 text-sm mt-1">{world.tagline || world.theme?.substring(0, 100) + '...'}</p>
          </div>
          <div class="flex gap-2 flex-wrap justify-end">
            <button
              onclick={exportWorld}
              class="px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm transition-all flex items-center gap-2"
              title="Download as JSON"
            >
              📥 Download
            </button>
            <button
              onclick={(e) => copyWorld(e)}
              class="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-all flex items-center gap-2"
              title="Copy to clipboard"
            >
              📋 Copy
            </button>
            <button
              onclick={onClearKey}
              class="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-all"
            >
              🔑 API Key
            </button>
            <button
              onclick={startOver}
              class="px-3 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm transition-all"
            >
              ✨ New World
            </button>
          </div>
        </div>

        <!-- Welcome Message -->
        {#if showWelcome}
          <div class="mt-4 bg-purple-900/30 border border-purple-500 rounded-lg p-4 animate-fade-in">
            <div class="flex items-start gap-3">
              <span class="text-2xl">🎉</span>
              <div class="flex-1">
                <h3 class="font-bold text-purple-300 mb-1">Your world is ready!</h3>
                <p class="text-sm text-gray-300">
                  Scroll down to explore your world. Use the <span class="text-purple-400 font-semibold">chat bar at the bottom</span> to add, change, or expand anything.
                </p>
              </div>
              <button
                onclick={() => showWelcome = false}
                class="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- MAIN COLUMN -->
        <div class="lg:col-span-2 space-y-6">

          <!-- Theme -->
          {#if world.theme}
            <div class="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 overflow-hidden">
              <button
                onclick={() => toggleSection('theme')}
                class="w-full p-6 text-left hover:bg-slate-700/30 transition-all flex justify-between items-center"
              >
                <h2 class="text-2xl font-bold text-purple-400">🌍 World Overview</h2>
                <span class="text-gray-400 text-xl">
                  {expandedSections.has('theme') ? '▼' : '▶'}
                </span>
              </button>
              {#if expandedSections.has('theme')}
                <div class="px-6 pb-6">
                  <p class="text-gray-300 leading-relaxed">{world.theme}</p>
                </div>
              {/if}
            </div>
          {/if}

          <!-- Geography -->
          {#if world.geography}
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h2 class="text-2xl font-bold mb-4 text-purple-400">🗺️ Geography</h2>
              <p class="text-gray-300 leading-relaxed whitespace-pre-wrap">{world.geography.overview || world.geography}</p>

              {#if world.geography.majorLocations && world.geography.majorLocations.length > 0}
                <div class="mt-6 space-y-4">
                  <h3 class="text-lg font-semibold text-purple-300">Major Locations</h3>
                  {#each world.geography.majorLocations as location}
                    <div class="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                      <h4 class="font-bold text-white mb-1">{location.name}</h4>
                      <p class="text-xs text-gray-400 mb-2">{location.type}</p>
                      <p class="text-sm text-gray-300">{location.description}</p>
                      {#if location.significance}
                        <p class="text-xs text-purple-300 mt-2 italic">{location.significance}</p>
                      {/if}
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}

          <!-- Magic System -->
          {#if world.magicSystem}
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h2 class="text-2xl font-bold mb-4 text-purple-400">✨ {world.magicSystem.name}</h2>
              <div class="space-y-4 text-gray-300">
                {#if world.magicSystem.fundamentals}
                  <div>
                    <h3 class="font-semibold text-purple-300 mb-2">How It Works</h3>
                    <p class="text-sm leading-relaxed">{world.magicSystem.fundamentals}</p>
                  </div>
                {/if}
                {#if world.magicSystem.cost}
                  <div>
                    <h3 class="font-semibold text-purple-300 mb-2">Cost & Limitations</h3>
                    <p class="text-sm leading-relaxed">{world.magicSystem.cost}</p>
                  </div>
                {/if}
                {#if world.magicSystem.socialImpact}
                  <div>
                    <h3 class="font-semibold text-purple-300 mb-2">Social Impact</h3>
                    <p class="text-sm leading-relaxed">{world.magicSystem.socialImpact}</p>
                  </div>
                {/if}
                {#if world.magicSystem.description}
                  <p class="text-sm leading-relaxed">{world.magicSystem.description}</p>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Cultures -->
          {#if world.cultures && world.cultures.length > 0}
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h2 class="text-2xl font-bold mb-4 text-purple-400">👥 Cultures</h2>
              <div class="space-y-6">
                {#each world.cultures as culture}
                  <div class="bg-slate-900/50 rounded-lg p-5 border border-slate-600">
                    <h3 class="text-xl font-bold text-white mb-3">{culture.name}</h3>
                    <p class="text-sm text-gray-300 mb-3 leading-relaxed">{culture.description || culture.overview}</p>
                    <div class="flex flex-wrap gap-2">
                      <span class="text-xs text-purple-300 font-medium">Values:</span>
                      {#if typeof culture.values === 'string'}
                        <span class="text-xs text-gray-400">{culture.values}</span>
                      {:else if Array.isArray(culture.values)}
                        {#each culture.values as value}
                          <span class="px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-200">{value}</span>
                        {/each}
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Characters -->
          {#if world.characters && world.characters.length > 0}
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h2 class="text-2xl font-bold mb-4 text-purple-400">👤 Characters</h2>
              <div class="space-y-4">
                {#each world.characters as char}
                  <div class="bg-slate-900/50 rounded-lg p-5 border border-slate-600">
                    <div class="flex justify-between items-start mb-2">
                      <h3 class="text-lg font-bold text-white">{char.name}</h3>
                      <span class="text-xs text-gray-400">{char.culture}</span>
                    </div>
                    <p class="text-xs text-purple-300 mb-2">{char.role} • Age {char.age}</p>
                    <p class="text-sm text-gray-300 mb-2">{char.physicalDescription}</p>
                    <p class="text-sm text-gray-400 italic">{char.goal}</p>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Locations -->
          {#if world.locations && world.locations.length > 0}
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h2 class="text-2xl font-bold mb-4 text-purple-400">🏛️ Notable Locations</h2>
              <div class="space-y-4">
                {#each world.locations as loc}
                  <div class="bg-slate-900/50 rounded-lg p-5 border border-slate-600">
                    <h3 class="text-lg font-bold text-white mb-1">{loc.name}</h3>
                    <p class="text-xs text-gray-400 mb-3">{loc.type}</p>
                    <p class="text-sm text-gray-300">{loc.description}</p>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Legends -->
          {#if world.legends && world.legends.length > 0}
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h2 class="text-2xl font-bold mb-4 text-purple-400">📜 Legends & Myths</h2>
              <div class="space-y-4">
                {#each world.legends as legend}
                  <div class="bg-slate-900/50 rounded-lg p-5 border border-slate-600">
                    <h3 class="text-lg font-bold text-white mb-2">{legend.title}</h3>
                    <p class="text-xs text-gray-400 mb-3">{legend.timeframe} • {legend.culturalOrigin}</p>
                    <p class="text-sm text-gray-300 leading-relaxed">{legend.story}</p>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

        </div>

        <!-- SIDEBAR -->
        <div class="space-y-6">

          <!-- Quality Score -->
          {#if qualityAnalysis}
            {@const score = qualityAnalysis.overallScore}
            {@const scoreColor = score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-orange-400'}
            {@const borderColor = score >= 80 ? 'border-green-500' : score >= 60 ? 'border-yellow-500' : 'border-orange-500'}
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border {borderColor}">
              <div class="flex items-center justify-between mb-3">
                <h2 class="text-xl font-bold text-purple-400">✨ Quality Score</h2>
                <span class="text-3xl font-bold {scoreColor}">{score}%</span>
              </div>
              <div class="space-y-2 text-xs text-gray-300">
                <p class="leading-relaxed">
                  {#if score >= 80}
                    🎉 Excellent! Original worldbuilding with minimal clichés.
                  {:else if score >= 60}
                    👍 Good work! Some opportunities to be more specific and original.
                  {:else}
                    💡 Consider adding more specific details and unique elements.
                  {/if}
                </p>
                {#if qualityAnalysis.issues && qualityAnalysis.issues.length > 0}
                  <details class="mt-2">
                    <summary class="cursor-pointer hover:text-purple-300 font-semibold">
                      {qualityAnalysis.issues.length} clichés detected
                    </summary>
                    <ul class="mt-2 space-y-1 text-xs list-disc list-inside text-gray-400">
                      {#each qualityAnalysis.issues.slice(0, 5) as issue}
                        <li>{issue.match} ({issue.category})</li>
                      {/each}
                      {#if qualityAnalysis.issues.length > 5}
                        <li class="italic">...and {qualityAnalysis.issues.length - 5} more</li>
                      {/if}
                    </ul>
                  </details>
                {/if}

                <!-- Regenerate button for low quality scores -->
                {#if score < 70}
                  <div class="mt-4 pt-3 border-t border-slate-600">
                    <p class="text-xs text-yellow-300 mb-2">
                      ⚠️ This world could be improved. Try regenerating for better results.
                    </p>
                    <button
                      onclick={() => {
                        // Save current input and regenerate with enhanced prompt
                        const savedInput = userInput;
                        startOver();
                        userInput = savedInput + ' (make it more unique and specific)';
                        setTimeout(() => generateWorld(), 100);
                      }}
                      class="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm font-semibold transition-all"
                    >
                      🔄 Regenerate for Better Quality
                    </button>
                    <p class="text-xs text-gray-400 mt-2 italic">
                      Tip: Add more specific, unusual details to your prompt for higher quality.
                    </p>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Conflict -->
          {#if world.conflicts?.primary || world.conflict}
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h2 class="text-xl font-bold mb-3 text-red-400">⚔️ Central Conflict</h2>
              <p class="text-sm text-gray-300 leading-relaxed">{world.conflicts?.primary || world.conflict}</p>
            </div>
          {/if}

          <!-- History -->
          {#if world.history}
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h2 class="text-xl font-bold mb-3 text-yellow-400">📖 History</h2>
              <div class="space-y-3 text-sm text-gray-300">
                {#if world.history.ancientEra}
                  <div>
                    <h3 class="font-semibold text-yellow-300 mb-1">Ancient Era</h3>
                    <p class="text-xs leading-relaxed">{world.history.ancientEra}</p>
                  </div>
                {/if}
                {#if world.history.formativeConflict}
                  <div>
                    <h3 class="font-semibold text-yellow-300 mb-1">Formative Conflict</h3>
                    <p class="text-xs leading-relaxed">{world.history.formativeConflict}</p>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

          <!-- Unique Feature -->
          {#if world.uniqueFeature}
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700">
              <h2 class="text-xl font-bold mb-3 text-green-400">💎 Unique Feature</h2>
              <p class="text-sm text-gray-300 leading-relaxed">{world.uniqueFeature}</p>
            </div>
          {/if}

          <!-- Secrets -->
          {#if world.secrets}
            <div class="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 border-dashed">
              <h2 class="text-xl font-bold mb-3 text-purple-400">🔮 Secrets</h2>
              <p class="text-sm text-gray-400 leading-relaxed italic">{world.secrets}</p>
            </div>
          {/if}

        </div>

      </div>

      <!-- CHAT BAR - Fixed at bottom -->
      <div class="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur border-t border-slate-700 z-20">
        <div class="max-w-7xl mx-auto px-8 py-4">

          <!-- Chat History -->
          {#if chatHistory.length > 0}
            <div class="mb-3 max-h-40 overflow-y-auto space-y-2">
              {#each chatHistory as msg}
                <div class="text-sm {msg.role === 'user' ? 'text-purple-300' : 'text-gray-300'}">
                  <span class="font-semibold">{msg.role === 'user' ? 'You:' : 'AI:'}</span>
                  {msg.content}
                </div>
              {/each}
            </div>
          {/if}

          <!-- Input Bar -->
          <div class="flex gap-3 items-center">
            <div class="flex-1 relative">
              <input
                type="text"
                bind:value={chatMessage}
                disabled={isChatting}
                placeholder="Ask to add, change, or expand anything... (e.g., 'Add a pirate faction' or 'Make the magic system darker')"
                class="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                onkeydown={(e) => {
                  if (e.key === 'Enter' && !isChatting) {
                    sendChatMessage();
                  }
                }}
              />
            </div>
            <button
              onclick={sendChatMessage}
              disabled={isChatting || !chatMessage.trim()}
              class="px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isChatting ? '💭 Thinking...' : '💬 Send'}
            </button>
          </div>

          <!-- Quick Actions -->
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              onclick={() => chatMessage = 'Add another character'}
              disabled={isChatting}
              class="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-gray-300 disabled:opacity-50"
            >
              + Character
            </button>
            <button
              onclick={() => chatMessage = 'Add another location'}
              disabled={isChatting}
              class="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-gray-300 disabled:opacity-50"
            >
              + Location
            </button>
            <button
              onclick={() => chatMessage = 'Add another legend'}
              disabled={isChatting}
              class="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-gray-300 disabled:opacity-50"
            >
              + Legend
            </button>
            <button
              onclick={() => chatMessage = 'Expand on the magic system'}
              disabled={isChatting}
              class="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-gray-300 disabled:opacity-50"
            >
              ⚡ More Magic
            </button>
            <button
              onclick={() => chatMessage = 'Add more conflict and tension'}
              disabled={isChatting}
              class="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-gray-300 disabled:opacity-50"
            >
              ⚔️ More Conflict
            </button>
          </div>
        </div>
      </div>

      <!-- Spacer to prevent content from being hidden under fixed chat bar -->
      <div class="h-48"></div>

    </div>
  </div>
{/if}
