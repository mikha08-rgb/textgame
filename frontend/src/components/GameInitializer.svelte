<script>
  import { generateText } from '../lib/openai.js';
  import { calculateCost } from '../lib/costCalculation.js';
  import { worldGenerationPrompt } from '../prompts/worldGeneration.js';
  import { onMount } from 'svelte';

  // Props
  let { apiKey, theme, onGameInitialized } = $props();

  // State
  let status = $state('initializing'); // initializing, generating, error, complete
  let loadingMessage = $state('Preparing your world...');
  let error = $state(null);

  const loadingMessages = [
    'Conjuring magical realms...',
    'Forging ancient histories...',
    'Crafting unique cultures...',
    'Designing intricate magic systems...',
    'Weaving geographical wonders...',
    'Creating economic systems...',
    'Building a living, breathing world...'
  ];

  let messageIndex = 0;
  let messageInterval = null;

  function startLoadingAnimation() {
    messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      loadingMessage = loadingMessages[messageIndex];
    }, 2000);
  }

  function stopLoadingAnimation() {
    if (messageInterval) {
      clearInterval(messageInterval);
      messageInterval = null;
    }
  }

  async function initializeGame() {
    try {
      status = 'generating';
      startLoadingAnimation();

      console.log('[GameInit] Starting world generation with theme:', theme);

      // Generate the world using the world generation prompt
      const systemPrompt = worldGenerationPrompt.systemPrompt;
      const userPrompt = worldGenerationPrompt.getUserPrompt();

      console.log('[GameInit] Calling OpenAI...');

      const worldResult = await generateText({
        apiKey,
        systemPrompt,
        prompt: userPrompt,
        model: worldGenerationPrompt.parameters.model,
        temperature: worldGenerationPrompt.parameters.temperature,
        maxTokens: worldGenerationPrompt.parameters.maxTokens,
        timeout: 180000, // 180 seconds (3 minutes) for world generation
        forceJSON: true // Enforce JSON mode to prevent "I'm sorry" responses
      });

      console.log('[GameInit] World generation complete');

      // Track token usage with model info
      const worldModel = worldGenerationPrompt.parameters.model;
      const worldCost = calculateCost(worldResult.usage, worldModel);

      let usageHistory = [{
        usage: worldResult.usage,
        model: worldModel,
        step: 'world_generation'
      }];

      // Parse the JSON response using the robust parser from worldGeneration.js
      let parsedWorld, reasoning;
      try {
        // Import the parser
        const { parseWorldGenerationResponse } = await import('../prompts/worldGeneration.js');
        const parseResult = parseWorldGenerationResponse(worldResult.text);

        // Extract world and Chain-of-Thought reasoning
        parsedWorld = parseResult.world;
        reasoning = parseResult.reasoning;

        if (reasoning) {
          console.log('[GameInit] Chain-of-Thought reasoning received:', reasoning.substring(0, 200) + '...');
        }
      } catch (parseError) {
        console.error('[GameInit] Failed to parse world data:', parseError);
        throw new Error(`Generated world data was not in valid format: ${parseError.message}`);
      }

      status = 'complete';
      stopLoadingAnimation();

      // Return just the world (no narrative needed for worldbuilding tool)
      const gameState = parsedWorld;

      if (onGameInitialized) {
        onGameInitialized(gameState);
      }

    } catch (err) {
      console.error('[GameInit] Error:', err);
      stopLoadingAnimation();
      status = 'error';
      error = err.message || 'Failed to initialize game';
    }
  }

  onMount(() => {
    // Start initialization when component mounts
    initializeGame();

    // Cleanup interval on unmount
    return () => {
      stopLoadingAnimation();
    };
  });
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
  <div class="max-w-md w-full text-center">
    {#if status === 'generating' || status === 'initializing'}
      <!-- Loading State -->
      <div class="space-y-6">
        <!-- Spinner -->
        <div class="flex justify-center">
          <svg class="animate-spin h-12 w-12 text-gray-900" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Loading Message -->
        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">
            {loadingMessage}
          </h2>
          <p class="text-sm text-gray-600">
            This may take a moment
          </p>
        </div>
      </div>

    {:else if status === 'error'}
      <!-- Error State -->
      <div class="bg-white rounded-lg border border-red-200 p-8 space-y-4">
        <div class="text-red-600">
          <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>

        <div>
          <h2 class="text-xl font-semibold text-gray-900 mb-2">
            Initialization Failed
          </h2>
          <p class="text-sm text-gray-600 mb-4">
            {error}
          </p>
        </div>

        <button
          onclick={initializeGame}
          class="bg-black hover:bg-gray-800 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    {/if}
  </div>
</div>
