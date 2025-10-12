<script>
  import { setAPIKey, isValidAPIKeyFormat } from '../lib/apiKeyStorage.js';
  import { testAPIKey } from '../lib/openai.js';
  import { estimateAdventureCost, formatCost } from '../lib/costCalculation.js';
  import Settings from './Settings.svelte';

  // Props
  let { onAPIKeyValidated } = $props();

  // State
  let apiKey = $state('');
  let isValidating = $state(false);
  let error = $state('');
  let showInstructions = $state(false);
  let showSettings = $state(false);
  let touched = $state(false);

  // Computed validation state
  let formatValid = $derived(isValidAPIKeyFormat(apiKey));
  let showFormatError = $derived(touched && apiKey.length > 0 && !formatValid);

  function handleInput() {
    // Clear errors when user starts typing
    if (error) {
      error = '';
    }
  }

  function handleBlur() {
    touched = true;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    touched = true;

    // Validate format first
    if (!formatValid) {
      error = 'Please enter a valid OpenAI API key starting with "sk-"';
      return;
    }

    isValidating = true;
    error = '';

    try {
      // Test the API key with OpenAI
      const isValid = await testAPIKey(apiKey);

      if (isValid) {
        // Store the key
        setAPIKey(apiKey);

        // Call success callback
        if (onAPIKeyValidated) {
          onAPIKeyValidated(apiKey);
        }
      } else {
        error = 'Invalid API key. Please check your key and try again.';
      }
    } catch (err) {
      console.error('API key validation error:', err);

      // Provide helpful error messages based on error type
      if (err.name === 'NetworkError' || err.name === 'TimeoutError') {
        error = 'Could not connect to OpenAI. Please check your internet connection.';
      } else if (err.name === 'InvalidAPIKeyError') {
        error = 'Invalid API key. Please check your key and try again.';
      } else if (err.name === 'RateLimitError' || err.message?.includes('quota') || err.message?.includes('billing')) {
        error = 'OpenAI quota exceeded. Please check your billing at platform.openai.com/account/billing';
      } else {
        error = err.message || 'Could not validate API key. Please try again.';
      }
    } finally {
      isValidating = false;
    }
  }

  function toggleInstructions() {
    showInstructions = !showInstructions;
  }

  function handleSettingsClose(event) {
    showSettings = false;
    // If API key was cleared and then re-entered via settings, handle it
    if (event?.apiKeyCleared) {
      // Reset the form
      apiKey = '';
      error = '';
      touched = false;
    }
  }

  // Calculate typical adventure cost estimate
  const costEstimate = estimateAdventureCost(15, 'gpt-4');
</script>

{#if showSettings}
  <Settings
    onClose={handleSettingsClose}
  />
{:else}
<div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
  <!-- Settings Button (top-right) -->
  <div class="absolute top-6 right-6">
    <button
      onclick={() => showSettings = true}
      class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
      aria-label="Settings"
      title="Settings"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    </button>
  </div>

  <div class="max-w-md w-full">
    <!-- Hero Section -->
    <div class="text-center mb-10">
      <h1 class="text-3xl font-semibold text-gray-900 mb-3">
        AI Adventure Engine
      </h1>
      <p class="text-gray-600">
        Enter your API key to begin
      </p>
    </div>

    <!-- API Key Form Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">

      <form onsubmit={handleSubmit} class="space-y-5">
        <!-- API Key Input -->
        <div>
          <label for="api-key" class="block text-sm font-medium text-gray-700 mb-2">
            OpenAI API Key
          </label>
          <input
            id="api-key"
            type="password"
            bind:value={apiKey}
            oninput={handleInput}
            onblur={handleBlur}
            placeholder="sk-..."
            disabled={isValidating}
            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed transition-all font-mono text-sm"
            class:border-red-500={showFormatError || error}
            autocomplete="off"
          />

          <!-- Error messages only -->
          {#if showFormatError}
            <p class="mt-2 text-sm text-red-600">
              Invalid format. Keys start with "sk-"
            </p>
          {/if}

          {#if error}
            <p class="mt-2 text-sm text-red-600">
              {error}
            </p>
          {/if}
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          disabled={!formatValid || isValidating}
          class="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-md transition-colors"
        >
          {#if isValidating}
            <span class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Validating...
            </span>
          {:else}
            Continue
          {/if}
        </button>
      </form>
    </div>

    <!-- Help Link -->
    <div class="text-center">
      <button
        onclick={toggleInstructions}
        class="text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        {showInstructions ? 'Hide' : 'Need an API key?'}
      </button>

      {#if showInstructions}
        <div class="mt-4 text-left bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-sm text-gray-600">
          <ol class="list-decimal list-inside space-y-2">
            <li>
              Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" class="text-black hover:underline">platform.openai.com/api-keys</a>
            </li>
            <li>Sign in or create an account</li>
            <li>Click "Create new secret key"</li>
            <li>Copy and paste it above</li>
          </ol>
          <p class="mt-4 text-xs text-gray-500">
            Your key is stored locally in your browser and never sent to our servers.
          </p>
          <div class="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p class="text-xs font-medium text-amber-900 mb-1">
              Typical Adventure Cost
            </p>
            <p class="text-xs text-amber-800">
              A typical 15-20 turn adventure costs approximately <span class="font-semibold">{formatCost(costEstimate.minCost)} - {formatCost(costEstimate.maxCost)}</span> in API fees.
            </p>
            <p class="text-xs text-amber-700 mt-1">
              You'll see cost warnings at $0.10, $0.25, and $0.50.
            </p>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>
{/if}

