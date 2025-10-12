<script>
  import NarrativeDisplay from './NarrativeDisplay.svelte';
  import CostDisplay from './CostDisplay.svelte';
  import CostWarningModal from './CostWarningModal.svelte';
  import Settings from './Settings.svelte';
  import { generateText } from '../lib/openai.js';
  import { calculateCost, checkCostThreshold } from '../lib/costCalculation.js';
  import { areCostWarningsEnabled } from '../lib/settingsStorage.js';
  import {
    narrativeProgressionPrompt,
    getContinuationPrompt,
    parseNarrativeResponse
  } from '../prompts/narrativeProgression.js';

  // Props
  let { gameState, apiKey, onGameStateUpdate, onNewGame } = $props();

  // State
  let isGenerating = $state(false);
  let selectedChoiceIndex = $state(null);
  let showHistory = $state(false);
  let showSettings = $state(false);
  let error = $state(null);
  let lastFailedChoice = $state(null);
  let showTimeoutWarning = $state(false);
  let timeoutTimer = null;

  // Cost warning state
  let showCostWarning = $state(false);
  let currentWarningThreshold = $state(null);

  async function handleChoiceClick(choice, index) {
    if (isGenerating) return;

    // Clear previous error state
    error = null;
    lastFailedChoice = null;
    showTimeoutWarning = false;

    try {
      isGenerating = true;
      selectedChoiceIndex = index;

      // Start timeout warning timer (15 seconds)
      timeoutTimer = setTimeout(() => {
        if (isGenerating) {
          showTimeoutWarning = true;
        }
      }, 15000);

      console.log('[Game] Choice selected:', choice);

      // Create history entry for this turn
      const historyEntry = {
        turn: gameState.currentTurn,
        narrative: gameState.currentNarrative,
        choices: gameState.currentChoices,
        selectedChoice: choice
      };

      // Generate next narrative based on choice
      const systemPrompt = narrativeProgressionPrompt.systemPrompt;
      const choiceText = choice.text || choice.title || `Choice ${index + 1}`;
      const userPrompt = getContinuationPrompt(
        gameState.world,
        gameState.currentNarrative,
        choiceText
      );
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

      console.log('[Game] Generating next narrative...');

      const nextResult = await generateText({
        apiKey,
        prompt: fullPrompt,
        model: narrativeProgressionPrompt.parameters.model,
        temperature: narrativeProgressionPrompt.parameters.temperature,
        maxTokens: narrativeProgressionPrompt.parameters.maxTokens,
        timeout: 60000
      });

      console.log('[Game] Narrative generation complete');

      // Parse the response using robust utility
      const parsedNext = parseNarrativeResponse(nextResult.text, { validate: true });

      // Track token usage with model info
      const model = narrativeProgressionPrompt.parameters.model;
      const turnCost = calculateCost(nextResult.usage, model);

      // Update usage history
      const updatedUsageHistory = [
        ...(gameState.usageHistory || []),
        {
          usage: nextResult.usage,
          model: model,
          step: `turn_${gameState.currentTurn + 1}`
        }
      ];

      // Calculate new totals
      const newInputTokens = (gameState.inputTokens || 0) + (nextResult.usage.prompt_tokens || 0);
      const newOutputTokens = (gameState.outputTokens || 0) + (nextResult.usage.completion_tokens || 0);
      const newTotalTokens = (gameState.totalTokens || 0) + nextResult.usage.total_tokens;
      const newEstimatedCost = (gameState.estimatedCost || 0) + turnCost;

      // Create immutable update with new state
      const updatedGameState = {
        ...gameState,
        history: [...gameState.history, historyEntry],
        currentNarrative: parsedNext.narrative || parsedNext.text || '',
        currentChoices: parsedNext.choices || [],
        currentTurn: gameState.currentTurn + 1,
        totalTokens: newTotalTokens,
        inputTokens: newInputTokens,
        outputTokens: newOutputTokens,
        estimatedCost: newEstimatedCost,
        usageHistory: updatedUsageHistory
      };

      console.log('[Game] Game state updated - Turn', updatedGameState.currentTurn);

      // Update parent state
      if (onGameStateUpdate) {
        onGameStateUpdate(updatedGameState);
      }

      // Check for cost threshold warnings (after narrative completes)
      if (areCostWarningsEnabled()) {
        const previousCost = gameState.estimatedCost || 0;
        const triggeredThresholds = new Set(gameState.triggeredThresholds || []);
        const crossedThreshold = checkCostThreshold(previousCost, newEstimatedCost, triggeredThresholds);

        if (crossedThreshold) {
          console.log('[Game] Cost threshold crossed:', crossedThreshold);
          currentWarningThreshold = crossedThreshold;
          showCostWarning = true;

          // Track this threshold so we don't warn again
          const updatedTriggeredThresholds = [...triggeredThresholds, crossedThreshold];
          if (onGameStateUpdate) {
            onGameStateUpdate({
              ...updatedGameState,
              triggeredThresholds: updatedTriggeredThresholds
            });
          }
        }
      }

    } catch (err) {
      console.error('[Game] Error processing choice:', err);
      // Store error state and the failed choice for retry
      error = err.message || 'Failed to generate next narrative';
      lastFailedChoice = { choice, index };
    } finally {
      // Clear timeout timer
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
      isGenerating = false;
      selectedChoiceIndex = null;
      showTimeoutWarning = false;
    }
  }

  function handleRetry() {
    if (lastFailedChoice) {
      handleChoiceClick(lastFailedChoice.choice, lastFailedChoice.index);
    }
  }

  function clearError() {
    error = null;
    lastFailedChoice = null;
  }

  // Cost warning handlers
  function handleCostWarningContinue() {
    showCostWarning = false;
    currentWarningThreshold = null;
  }

  function handleCostWarningEndAdventure() {
    showCostWarning = false;
    currentWarningThreshold = null;
    if (onNewGame) {
      onNewGame();
    }
  }

  // Truncate text for history preview
  function truncateText(text, maxLength = 150) {
    if (!text) return '';
    const firstParagraph = text.split('\n\n')[0];
    if (firstParagraph.length <= maxLength) {
      return firstParagraph;
    }
    return firstParagraph.substring(0, maxLength).trim() + '...';
  }

  // Settings handlers
  function handleSettingsClose(event) {
    showSettings = false;
    // If API key was cleared, notify parent to return to landing
    if (event?.apiKeyCleared && onNewGame) {
      onNewGame();
    }
    // If progress was cleared, notify parent to restart game flow
    if (event?.progressCleared && onNewGame) {
      onNewGame();
    }
  }
</script>

{#if showSettings}
  <Settings
    gameState={gameState}
    onClose={handleSettingsClose}
  />
{:else}
<div class="min-h-screen bg-gray-50 p-6">
  <div class="max-w-3xl mx-auto">
    <!-- Header -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-semibold text-gray-900 mb-1">
              {gameState.world.worldName || 'Your Adventure'}
            </h1>
            <p class="text-xs text-gray-500">
              Turn {gameState.currentTurn + 1} {gameState.history.length > 0 ? `• ${gameState.history.length} ${gameState.history.length === 1 ? 'turn' : 'turns'} completed` : ''}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              onclick={() => showSettings = true}
              class="text-sm p-2 border border-gray-300 hover:border-gray-900 rounded-md transition-colors"
              aria-label="Settings"
              title="Settings"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
            {#if gameState.history.length > 0}
              <button
                onclick={() => showHistory = !showHistory}
                class="text-sm px-3 py-1.5 border border-gray-300 hover:border-gray-900 rounded-md transition-colors"
              >
                {showHistory ? 'Hide History' : 'View History'}
              </button>
            {/if}
            {#if onNewGame}
              <button
                onclick={onNewGame}
                class="text-sm px-3 py-1.5 bg-gray-900 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                New Game
              </button>
            {/if}
          </div>
        </div>

        <!-- Cost Display -->
        <CostDisplay
          totalTokens={gameState.totalTokens || 0}
          inputTokens={gameState.inputTokens || 0}
          outputTokens={gameState.outputTokens || 0}
          estimatedCost={gameState.estimatedCost || 0}
        />
      </div>
    </div>

    <!-- History Panel -->
    {#if showHistory && gameState.history.length > 0}
      <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6 max-h-96 overflow-y-auto">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Previous Turns</h2>
        <div class="space-y-4">
          {#each gameState.history as turn, index}
            <div class="border-l-2 border-gray-300 pl-4 pb-4">
              <div class="text-xs text-gray-500 mb-2">Turn {turn.turn + 1}</div>
              <div class="text-sm text-gray-700 mb-2">
                {truncateText(turn.narrative)}
              </div>
              <div class="text-xs font-medium text-gray-900">
                → {turn.selectedChoice.text || turn.selectedChoice.title || 'Choice made'}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Current Narrative -->
    <div class="bg-white rounded-lg border border-gray-200 p-8 mb-6">
      <NarrativeDisplay narrative={gameState.currentNarrative} isGenerating={isGenerating} />
    </div>

    <!-- Error Message -->
    {#if error}
      <div class="bg-white rounded-lg border-2 border-red-300 p-6 mb-6">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-gray-900 mb-1">
              Failed to Generate Story
            </h3>
            <p class="text-sm text-gray-600 mb-4">
              {error}
            </p>
            <div class="flex gap-2">
              <button
                onclick={handleRetry}
                class="text-sm px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-md transition-colors font-medium"
              >
                Retry
              </button>
              <button
                onclick={clearError}
                class="text-sm px-4 py-2 border border-gray-300 hover:border-gray-900 rounded-md transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Choices -->
    {#if !isGenerating && gameState.currentChoices && gameState.currentChoices.length > 0}
      <div class="space-y-3">
        {#each gameState.currentChoices as choice, index}
          <button
            onclick={() => handleChoiceClick(choice, index)}
            disabled={isGenerating}
            class="w-full bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-900 rounded-lg p-4 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div class="font-medium text-gray-900 mb-1">
              {choice.text || choice.title || `Choice ${index + 1}`}
            </div>
            {#if choice.consequence}
              <div class="text-sm text-gray-600">
                {choice.consequence}
              </div>
            {/if}
          </button>
        {/each}
      </div>
    {:else if isGenerating}
      <!-- Generating next narrative -->
      <div class="bg-white rounded-lg border border-gray-200 p-6 text-center text-sm">
        <div class="flex items-center justify-center text-gray-500 mb-2">
          <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Weaving the next chapter...</span>
        </div>
        {#if showTimeoutWarning}
          <p class="text-xs text-gray-500 mt-2">
            Still working... This may take a moment longer.
          </p>
        {/if}
      </div>
    {:else if !gameState.currentChoices || gameState.currentChoices.length === 0}
      <!-- Game Over Screen -->
      <div class="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div class="mb-6">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <h2 class="text-2xl font-semibold text-gray-900 mb-2">
            Your Story Has Concluded
          </h2>
          <p class="text-gray-600">
            Your adventure through {gameState.world.worldName} has come to an end.
          </p>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h3 class="text-sm font-medium text-gray-900 mb-3">Adventure Summary</h3>
          <div class="space-y-3 text-sm text-gray-600">
            <div class="flex justify-between">
              <span>Turns completed:</span>
              <span class="font-medium text-gray-900">{gameState.currentTurn}</span>
            </div>
            <div class="flex justify-between">
              <span>Choices made:</span>
              <span class="font-medium text-gray-900">{gameState.history.length}</span>
            </div>
          </div>

          <!-- Detailed Cost Display -->
          {#if gameState.totalTokens}
            <div class="mt-4">
              <CostDisplay
                totalTokens={gameState.totalTokens}
                inputTokens={gameState.inputTokens || 0}
                outputTokens={gameState.outputTokens || 0}
                estimatedCost={gameState.estimatedCost}
                detailed={true}
              />
            </div>
          {/if}
        </div>

        <div class="flex gap-3 justify-center">
          {#if gameState.history.length > 0}
            <button
              onclick={() => showHistory = true}
              class="px-4 py-2 border border-gray-300 hover:border-gray-900 rounded-md transition-colors text-sm font-medium"
            >
              Review History
            </button>
          {/if}
          {#if onNewGame}
            <button
              onclick={onNewGame}
              class="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-md transition-colors text-sm font-medium"
            >
              Start New Adventure
            </button>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Cost Warning Modal -->
    {#if showCostWarning}
      <CostWarningModal
        currentCost={gameState.estimatedCost}
        threshold={currentWarningThreshold}
        onContinue={handleCostWarningContinue}
        onEndAdventure={handleCostWarningEndAdventure}
        visible={showCostWarning}
      />
    {/if}
  </div>
</div>
{/if}
