<script>
  // Props
  let { onThemeSelected } = $props();

  // Available themes
  const themes = [
    {
      id: 'fantasy',
      name: 'Fantasy',
      description: 'Magic, dragons, and ancient prophecies',
      icon: '⚔️',
      available: true
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk',
      description: 'Neon cities and digital conspiracies',
      icon: '🌆',
      available: false,
      comingSoon: true
    },
    {
      id: 'steampunk',
      name: 'Steampunk',
      description: 'Victorian technology and airships',
      icon: '⚙️',
      available: false,
      comingSoon: true
    }
  ];

  // State
  let selectedTheme = $state(null);

  function handleThemeClick(theme) {
    if (theme.available) {
      selectedTheme = theme.id;
    }
  }

  function handleContinue() {
    if (selectedTheme && onThemeSelected) {
      onThemeSelected(selectedTheme);
    }
  }
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
  <div class="max-w-2xl w-full">
    <!-- Header -->
    <div class="text-center mb-10">
      <h1 class="text-3xl font-semibold text-gray-900 mb-3">
        Choose Your Adventure
      </h1>
      <p class="text-gray-600">
        Select a theme to begin your story
      </p>
    </div>

    <!-- Theme Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {#each themes as theme}
        <button
          onclick={() => handleThemeClick(theme)}
          disabled={!theme.available}
          class="relative bg-white rounded-lg border-2 p-6 text-left transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          class:border-black={selectedTheme === theme.id}
          class:border-gray-200={selectedTheme !== theme.id}
          class:hover:border-gray-400={theme.available && selectedTheme !== theme.id}
        >
          <!-- Coming Soon Badge -->
          {#if theme.comingSoon}
            <div class="absolute top-3 right-3 bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">
              Soon
            </div>
          {/if}

          <!-- Theme Icon -->
          <div class="text-4xl mb-3">
            {theme.icon}
          </div>

          <!-- Theme Info -->
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {theme.name}
          </h3>
          <p class="text-sm text-gray-600">
            {theme.description}
          </p>

          <!-- Selected Indicator -->
          {#if selectedTheme === theme.id}
            <div class="absolute top-3 left-3 w-5 h-5 bg-black rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
            </div>
          {/if}
        </button>
      {/each}
    </div>

    <!-- Continue Button -->
    <div class="flex justify-center">
      <button
        onclick={handleContinue}
        disabled={!selectedTheme}
        class="bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-md transition-colors"
      >
        Start Adventure
      </button>
    </div>
  </div>
</div>
