<script>
  import { formatCost } from '../lib/costCalculation.js';

  // Props
  let { totalTokens = 0, inputTokens = 0, outputTokens = 0, estimatedCost = 0, detailed = false } = $props();
</script>

<div class="bg-gray-50 rounded-md border border-gray-200 px-3 py-2 text-xs">
  <div class="flex items-center justify-between gap-4">
    <!-- Cost Display -->
    <div class="flex items-center gap-1.5">
      <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <div>
        <span class="font-semibold text-gray-900">{formatCost(estimatedCost)}</span>
        <span class="text-gray-500 ml-1">estimated</span>
      </div>
    </div>

    <!-- Token Count -->
    {#if totalTokens > 0}
      <div class="flex items-center gap-1.5 text-gray-600">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
        </svg>
        <span>{totalTokens.toLocaleString()} tokens</span>
      </div>
    {/if}
  </div>

  <!-- Detailed View -->
  {#if detailed && (inputTokens > 0 || outputTokens > 0)}
    <div class="mt-2 pt-2 border-t border-gray-200 flex gap-4 text-gray-600">
      <div>
        <span class="text-gray-500">Input:</span>
        <span class="font-medium ml-1">{inputTokens.toLocaleString()}</span>
      </div>
      <div>
        <span class="text-gray-500">Output:</span>
        <span class="font-medium ml-1">{outputTokens.toLocaleString()}</span>
      </div>
    </div>
  {/if}

  <!-- Disclaimer -->
  <div class="mt-1.5 text-gray-500 italic">
    Based on current OpenAI pricing. Actual charges may vary.
  </div>
</div>
