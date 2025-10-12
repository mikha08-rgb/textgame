<script>
  // Props
  let { narrative, isGenerating = false } = $props();
</script>

<div class="narrative-container">
  {#if isGenerating}
    <!-- Loading state -->
    <div class="flex items-center justify-center py-12 text-gray-500">
      <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-sm">Weaving your story...</span>
    </div>
  {:else if narrative}
    <!-- Narrative text -->
    <div class="narrative-text prose prose-gray max-w-none">
      {#each narrative.split('\n\n') as paragraph}
        <p class="mb-4 leading-relaxed">
          {paragraph}
        </p>
      {/each}
    </div>
  {/if}
</div>

<style>
  .narrative-container {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  }

  .narrative-text {
    font-size: 1.0625rem;
    line-height: 1.75;
    color: #1f2937;
  }

  .narrative-text p {
    margin-bottom: 1.25rem;
  }

  .narrative-text p:last-child {
    margin-bottom: 0;
  }
</style>
