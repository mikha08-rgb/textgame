<script>
  import { getAPIKey, setAPIKey, removeAPIKey, isValidAPIKeyFormat } from '../lib/apiKeyStorage.js';
  import { getSettings, updateSetting } from '../lib/settingsStorage.js';
  import { validateAPIKey } from '../lib/openai.js';

  // Props
  let { onClose, gameState = null } = $props();

  // State
  let settings = $state(getSettings());
  let currentAPIKey = $state(null);
  let maskedAPIKey = $state('');
  let showChangeAPIKey = $state(false);
  let showClearConfirmation = $state(false);
  let showClearProgressConfirmation = $state(false);
  let showCostExplanation = $state(false);
  let newAPIKeyInput = $state('');
  let isValidatingKey = $state(false);
  let validationError = $state(null);
  let validationSuccess = $state(null);

  // Load current API key on mount
  $effect(() => {
    try {
      const key = getAPIKey();
      if (key) {
        currentAPIKey = key;
        maskedAPIKey = maskAPIKey(key);
      }
    } catch (error) {
      console.error('[Settings] Failed to load API key:', error);
    }
  });

  /**
   * Mask API key for display
   * Shows: sk-...abc123
   */
  function maskAPIKey(key) {
    if (!key || key.length < 10) return 'sk-...';
    const prefix = key.substring(0, 3); // 'sk-'
    const suffix = key.substring(key.length - 6); // last 6 chars
    return `${prefix}...${suffix}`;
  }

  /**
   * Handle cost warnings toggle
   */
  function handleCostWarningsToggle(event) {
    const enabled = event.target.checked;
    updateSetting('costWarningsEnabled', enabled);
    settings = getSettings();
    console.log('[Settings] Cost warnings:', enabled ? 'enabled' : 'disabled');
  }

  /**
   * Handle Change API Key
   */
  async function handleChangeAPIKey() {
    validationError = null;
    validationSuccess = null;

    const trimmedKey = newAPIKeyInput.trim();

    if (!trimmedKey) {
      validationError = 'Please enter an API key';
      return;
    }

    if (!isValidAPIKeyFormat(trimmedKey)) {
      validationError = 'Invalid API key format. OpenAI keys should start with "sk-" and be at least 20 characters.';
      return;
    }

    try {
      isValidatingKey = true;
      console.log('[Settings] Validating API key...');

      // Validate with OpenAI API
      await validateAPIKey(trimmedKey);

      console.log('[Settings] API key validated successfully');

      // Save the new key
      setAPIKey(trimmedKey);
      currentAPIKey = trimmedKey;
      maskedAPIKey = maskAPIKey(trimmedKey);

      validationSuccess = 'API key updated successfully!';
      newAPIKeyInput = '';

      // Auto-hide success message and close form after 2 seconds
      setTimeout(() => {
        validationSuccess = null;
        showChangeAPIKey = false;
      }, 2000);

    } catch (error) {
      console.error('[Settings] API key validation failed:', error);

      // Extract user-friendly error message
      let errorMsg = error.message || 'Failed to validate API key. Please try again.';

      // Handle specific error types
      if (error.name === 'InvalidAPIKeyError') {
        errorMsg = 'Invalid API key. Please check your key and try again.';
      } else if (error.name === 'NetworkError' || error.message.includes('Network')) {
        errorMsg = 'Could not connect to OpenAI. Please check your internet connection.';
      } else if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
        errorMsg = 'Request timed out. Please try again.';
      } else if (error.name === 'RateLimitError' || error.message.includes('quota') || error.message.includes('billing')) {
        errorMsg = 'OpenAI quota exceeded. Please add billing at platform.openai.com/account/billing';
      }

      validationError = errorMsg;
    } finally {
      isValidatingKey = false;
    }
  }

  /**
   * Handle Clear API Key
   */
  function handleClearAPIKey() {
    removeAPIKey();
    currentAPIKey = null;
    maskedAPIKey = '';
    showClearConfirmation = false;

    // Notify parent to return to landing page
    if (onClose) {
      onClose({ apiKeyCleared: true });
    }
  }

  /**
   * Handle Clear Progress & Start Fresh
   */
  function handleClearProgress() {
    // Clear game state and theme from localStorage
    localStorage.removeItem('ai_adventure_game_state');
    localStorage.removeItem('ai_adventure_theme');

    showClearProgressConfirmation = false;

    console.log('[Settings] Cleared all game progress');

    // Notify parent to restart game flow
    if (onClose) {
      onClose({ progressCleared: true });
    }
  }

  /**
   * Cancel change API key
   */
  function cancelChangeAPIKey() {
    showChangeAPIKey = false;
    newAPIKeyInput = '';
    validationError = null;
    validationSuccess = null;
  }

  /**
   * Get session statistics
   */
  function getSessionStats() {
    if (!gameState) {
      return {
        cost: 0,
        interactions: 0,
        turns: 0
      };
    }

    return {
      cost: gameState.estimatedCost || 0,
      interactions: gameState.history?.length || 0,
      turns: gameState.currentTurn || 0
    };
  }

  const stats = $derived(getSessionStats());
</script>

<div class="min-h-screen bg-gray-50 p-6">
  <div class="max-w-2xl mx-auto">
    <!-- Header -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-semibold text-gray-900">Settings</h1>
        <button
          onclick={() => onClose && onClose({})}
          class="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close settings"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- API Key Section -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">API Key</h2>

      <div class="space-y-4">
        <!-- Current API Key Display -->
        <div>
          <div class="block text-sm font-medium text-gray-700 mb-2">
            Current API Key
          </div>
          <div class="flex items-center gap-3">
            <code class="flex-1 bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-sm font-mono text-gray-900">
              {maskedAPIKey || 'No API key set'}
            </code>
          </div>
        </div>

        <!-- Change API Key Section -->
        {#if !showChangeAPIKey}
          <div class="flex gap-3">
            <button
              onclick={() => showChangeAPIKey = true}
              class="px-4 py-2 border border-gray-300 hover:border-gray-900 rounded-md transition-colors text-sm font-medium"
            >
              Change API Key
            </button>
            <button
              onclick={() => showClearConfirmation = true}
              class="px-4 py-2 border border-red-300 hover:border-red-600 text-red-600 hover:text-red-700 rounded-md transition-colors text-sm font-medium"
            >
              Clear API Key
            </button>
          </div>
        {:else}
          <div class="border border-gray-300 rounded-md p-4 bg-gray-50">
            <label for="new-api-key-input" class="block text-sm font-medium text-gray-700 mb-2">
              New API Key
            </label>
            <input
              id="new-api-key-input"
              type="password"
              bind:value={newAPIKeyInput}
              placeholder="sk-..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent mb-3"
            />

            {#if validationError}
              <div class="mb-3 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {validationError}
              </div>
            {/if}

            {#if validationSuccess}
              <div class="mb-3 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
                {validationSuccess}
              </div>
            {/if}

            <div class="flex gap-3">
              <button
                onclick={handleChangeAPIKey}
                disabled={isValidatingKey}
                class="px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidatingKey ? 'Validating...' : 'Update Key'}
              </button>
              <button
                onclick={cancelChangeAPIKey}
                disabled={isValidatingKey}
                class="px-4 py-2 border border-gray-300 hover:border-gray-900 rounded-md transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Session Statistics (if in active game) -->
    {#if gameState}
      <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Current Session</h2>

        <div class="space-y-3 mb-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Estimated Cost:</span>
            <span class="text-sm font-semibold text-gray-900">${stats.cost.toFixed(3)}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Turns Completed:</span>
            <span class="text-sm font-semibold text-gray-900">{stats.turns}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Choices Made:</span>
            <span class="text-sm font-semibold text-gray-900">{stats.interactions}</span>
          </div>
          {#if gameState.totalTokens}
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Total Tokens:</span>
              <span class="text-sm font-semibold text-gray-900">{gameState.totalTokens.toLocaleString()}</span>
            </div>
          {/if}
        </div>

        <!-- Clear Progress Button -->
        <div class="border-t border-gray-200 pt-4">
          <button
            onclick={() => showClearProgressConfirmation = true}
            class="w-full px-4 py-2 border border-orange-300 hover:border-orange-600 text-orange-600 hover:text-orange-700 rounded-md transition-colors text-sm font-medium"
          >
            Clear Progress & Start Fresh
          </button>
          <p class="text-xs text-gray-500 mt-2 text-center">
            Start a new adventure from the beginning (keeps your API key)
          </p>
        </div>
      </div>
    {/if}

    <!-- Preferences Section -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>

      <div class="space-y-4">
        <!-- Cost Warnings Toggle -->
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <label for="cost-warnings-toggle" class="text-sm font-medium text-gray-900">
              Enable Cost Warnings
            </label>
            <p class="text-xs text-gray-600 mt-1">
              Get notified when your session costs reach certain thresholds ($0.10, $0.25, $0.50, etc.)
            </p>
          </div>
          <input
            id="cost-warnings-toggle"
            type="checkbox"
            checked={settings.costWarningsEnabled}
            onchange={handleCostWarningsToggle}
            class="w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-2 focus:ring-gray-900 cursor-pointer"
          />
        </div>

        <!-- How API Costs Work -->
        <div class="border-t border-gray-200 pt-4">
          <button
            onclick={() => showCostExplanation = !showCostExplanation}
            class="flex items-center justify-between w-full text-left"
          >
            <span class="text-sm font-medium text-gray-900">How API Costs Work</span>
            <svg
              class="w-5 h-5 text-gray-400 transition-transform {showCostExplanation ? 'rotate-180' : ''}"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          {#if showCostExplanation}
            <div class="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-700 space-y-3">
              <p>
                AI Adventure Engine uses your OpenAI API key to generate stories. You're charged directly by OpenAI based on token usage.
              </p>

              <div class="space-y-2">
                <p class="font-medium text-gray-900">Pricing (as of January 2025):</p>
                <ul class="list-disc list-inside space-y-1 text-xs">
                  <li><strong>GPT-3.5 Turbo:</strong> $0.0005 per 1K input tokens, $0.0015 per 1K output tokens</li>
                  <li><strong>GPT-4 Turbo:</strong> $0.01 per 1K input tokens, $0.03 per 1K output tokens</li>
                </ul>
              </div>

              <p class="text-xs">
                <strong>Typical adventure cost:</strong> A 15-20 turn adventure typically costs $0.10-$0.30 with GPT-3.5 Turbo, or $2-$6 with GPT-4 Turbo.
              </p>

              <p class="text-xs text-gray-600 italic">
                Note: Costs shown are estimates. Actual charges from OpenAI may vary. Check your OpenAI account for precise usage.
              </p>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Back Button -->
    <div class="flex justify-center">
      <button
        onclick={() => onClose && onClose({})}
        class="px-6 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-md transition-colors font-medium"
      >
        {gameState ? 'Back to Adventure' : 'Close'}
      </button>
    </div>
  </div>
</div>

<!-- Clear API Key Confirmation Modal -->
{#if showClearConfirmation}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Clear API Key?</h3>
      <p class="text-sm text-gray-600 mb-6">
        Are you sure you want to remove your API key? You'll need to enter it again to play.
      </p>
      <div class="flex gap-3 justify-end">
        <button
          onclick={() => showClearConfirmation = false}
          class="px-4 py-2 border border-gray-300 hover:border-gray-900 rounded-md transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onclick={handleClearAPIKey}
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors text-sm font-medium"
        >
          Clear Key
        </button>
      </div>
    </div>
  </div>
{/if}

<!-- Clear Progress Confirmation Modal -->
{#if showClearProgressConfirmation}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Clear Progress & Start Fresh?</h3>
      <p class="text-sm text-gray-600 mb-4">
        This will:
      </p>
      <ul class="text-sm text-gray-600 mb-6 space-y-2 list-disc list-inside">
        <li>Delete your current adventure progress</li>
        <li>Clear your saved game state</li>
        <li>Return you to theme selection</li>
        <li><strong>Keep your API key saved</strong></li>
      </ul>
      <p class="text-sm text-orange-600 font-medium mb-6">
        This action cannot be undone!
      </p>
      <div class="flex gap-3 justify-end">
        <button
          onclick={() => showClearProgressConfirmation = false}
          class="px-4 py-2 border border-gray-300 hover:border-gray-900 rounded-md transition-colors text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onclick={handleClearProgress}
          class="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors text-sm font-medium"
        >
          Clear Progress
        </button>
      </div>
    </div>
  </div>
{/if}
