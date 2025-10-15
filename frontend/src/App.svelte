<script>
  import ApiKeyInput from './components/ApiKeyInput.svelte';
  import WorldbuildingStudioSimple from './components/WorldbuildingStudioSimple.svelte';

  // SECURE KEY MANAGEMENT:
  // - API key stored ONLY in memory (component state)
  // - Never persisted to localStorage or sessionStorage
  // - Cleared when browser tab closes
  // - User must re-enter key each session (security tradeoff)

  let apiKey = $state('');
  let keyValidated = $state(false);

  function handleKeySet(key) {
    apiKey = key;
    keyValidated = true;
    console.log('[App] API key validated and stored in memory');
  }

  function handleClearKey() {
    apiKey = '';
    keyValidated = false;
    console.log('[App] API key cleared from memory');
  }
</script>

<main>
  {#if !keyValidated}
    <!-- Show secure key input -->
    <div class="landing-container">
      <div class="header">
        <h1 class="title">🌍 AI Worldbuilding Studio</h1>
        <p class="subtitle">
          Create master-crafted fictional worlds in minutes
        </p>
      </div>

      <ApiKeyInput onKeySet={handleKeySet} />

      <footer class="footer">
        <p class="text-sm text-gray-600">
          Built with Svelte + OpenAI GPT-4 • Open Source
        </p>
      </footer>
    </div>
  {:else}
    <!-- Main worldbuilding interface -->
    <WorldbuildingStudioSimple
      apiKey={apiKey}
      onClearKey={handleClearKey}
    />
  {/if}
</main>

<style>
  main {
    min-height: 100vh;
    background: #fafafa;
  }

  .landing-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
  }

  .header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin: 0 0 1rem 0;
  }

  .subtitle {
    font-size: 1.125rem;
    color: #666;
    margin: 0;
  }

  .footer {
    margin-top: 3rem;
    text-align: center;
  }

  @media (max-width: 640px) {
    .title {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 1rem;
    }
  }
</style>
