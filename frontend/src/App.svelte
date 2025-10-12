<script>
  import LandingPage from './components/LandingPage.svelte';
  import ThemeSelection from './components/ThemeSelection.svelte';
  import GameInitializer from './components/GameInitializer.svelte';
  import WorldExplorer from './components/WorldExplorer.svelte';
  import { hasAPIKey, getAPIKey } from './lib/apiKeyStorage.js';

  // State to track user progress
  let apiKeyValidated = $state(hasAPIKey());
  let currentAPIKey = $state(null);
  let selectedTheme = $state(null);
  let worldData = $state(null);

  // Check for existing API key on mount
  $effect(() => {
    if (apiKeyValidated) {
      try {
        currentAPIKey = getAPIKey();
      } catch (error) {
        console.error('Failed to retrieve API key:', error);
        apiKeyValidated = false;
      }
    }
  });

  function handleAPIKeyValidated(apiKey) {
    currentAPIKey = apiKey;
    apiKeyValidated = true;
  }

  function handleThemeSelected(theme) {
    selectedTheme = theme;
    // Clear any existing world when selecting a new theme
    worldData = null;
  }

  function handleWorldGenerated(world) {
    worldData = world;
  }

  function startNewWorld() {
    // Clear current world and go back to theme selection
    selectedTheme = null;
    worldData = null;
    console.log('[App] Starting new world - cleared all data');
  }
</script>

<main>
  {#if !apiKeyValidated}
    <LandingPage onAPIKeyValidated={handleAPIKeyValidated} />
  {:else if !selectedTheme}
    <ThemeSelection onThemeSelected={handleThemeSelected} />
  {:else if !worldData}
    <GameInitializer
      apiKey={currentAPIKey}
      theme={selectedTheme}
      onGameInitialized={handleWorldGenerated}
    />
  {:else}
    <WorldExplorer world={worldData} apiKey={currentAPIKey} onNewWorld={startNewWorld} />
  {/if}
</main>

<style>
  main {
    min-height: 100vh;
  }
</style>
