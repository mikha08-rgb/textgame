<script>
  import { formatCost } from '../lib/costCalculation.js';

  // Props
  let { currentCost, threshold, onContinue, onEndAdventure, visible = true } = $props();

  function handleContinue() {
    if (onContinue) onContinue();
  }

  function handleEndAdventure() {
    if (onEndAdventure) onEndAdventure();
  }
</script>

{#if visible}
  <!-- Modal Overlay -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <!-- Modal Content -->
    <div class="bg-white rounded-lg border border-gray-300 shadow-xl max-w-md w-full p-6">
      <!-- Icon -->
      <div class="flex justify-center mb-4">
        <div class="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
      </div>

      <!-- Title -->
      <h2 class="text-xl font-semibold text-gray-900 text-center mb-2">
        API Cost Notice
      </h2>

      <!-- Message -->
      <div class="text-center mb-6">
        <p class="text-gray-700 mb-3">
          Just a heads-up about your API costs!
        </p>
        <p class="text-gray-600 text-sm mb-2">
          You've spent approximately <span class="font-semibold text-gray-900">{formatCost(currentCost)}</span> this session.
        </p>
        <p class="text-gray-500 text-xs">
          Would you like to continue your adventure?
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          onclick={handleEndAdventure}
          class="flex-1 px-4 py-2 border border-gray-300 hover:border-gray-900 text-gray-700 rounded-md transition-colors text-sm font-medium"
        >
          End Adventure
        </button>
        <button
          onclick={handleContinue}
          class="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-700 text-white rounded-md transition-colors text-sm font-medium"
        >
          Continue Playing
        </button>
      </div>

      <!-- Help Text -->
      <p class="text-xs text-gray-500 text-center mt-4">
        You can disable these warnings in settings
      </p>
    </div>
  </div>
{/if}
