<script>
  import { onMount } from 'svelte';
  import { getAPIKey, setAPIKey, removeAPIKey, hasAPIKey } from '../lib/apiKeyStorage.js';
  import { generateText } from '../lib/openai.js';
  import {
    worldGenerationPrompt,
    parseWorldGenerationResponse,
    formatWorldForDisplay,
  } from '../prompts/worldGeneration.js';

  // State management
  let apiKey = $state('');
  let hasStoredKey = $state(false);
  let showApiKey = $state(false);

  // Prompt testing state
  let prompt = $state('');
  let model = $state('gpt-3.5-turbo');
  let maxTokens = $state(500);
  let temperature = $state(0.7);

  // Response state
  let response = $state('');
  let error = $state('');
  let isLoading = $state(false);
  let lastRequestTime = $state(0);

  // Load API key on mount
  onMount(() => {
    try {
      hasStoredKey = hasAPIKey();
      if (hasStoredKey) {
        apiKey = getAPIKey() || '';
      }
    } catch (err) {
      error = 'Failed to load stored API key: ' + err.message;
    }
  });

  // Handle API key save
  function handleSaveKey() {
    try {
      setAPIKey(apiKey);
      hasStoredKey = true;
      error = '';
      response = '✓ API key saved successfully!';
    } catch (err) {
      error = 'Failed to save API key: ' + err.message;
    }
  }

  // Handle API key removal
  function handleRemoveKey() {
    removeAPIKey();
    apiKey = '';
    hasStoredKey = false;
    response = 'API key removed from storage';
    error = '';
  }

  // Handle prompt test
  async function handleTestPrompt() {
    if (!apiKey) {
      error = 'Please enter an API key first';
      return;
    }

    if (!prompt.trim()) {
      error = 'Please enter a prompt';
      return;
    }

    isLoading = true;
    error = '';
    response = '';
    const startTime = Date.now();

    try {
      const result = await generateText({
        apiKey,
        prompt,
        model,
        maxTokens,
        temperature,
      });

      // Try to parse and format world generation responses
      try {
        const worldData = parseWorldGenerationResponse(result);
        response = formatWorldForDisplay(worldData);
      } catch (parseError) {
        // If parsing fails, just show the raw response
        response = result;
      }

      lastRequestTime = Date.now() - startTime;
      error = '';
    } catch (err) {
      error = `Error: ${err.message}`;
      response = '';
    } finally {
      isLoading = false;
    }
  }

  // Preset prompts for quick testing
  const presets = [
    {
      name: 'Simple Test',
      prompt: 'Say "Hello, I am working!" and nothing else.',
      params: { model: 'gpt-3.5-turbo', temperature: 0.7, maxTokens: 50 },
    },
    {
      name: 'World Generation (Full)',
      prompt: worldGenerationPrompt.getUserPrompt(),
      params: worldGenerationPrompt.parameters,
    },
    {
      name: 'World Generation (Quick)',
      prompt:
        'Create a brief fantasy world setting with one unique feature. Keep it under 100 words.',
      params: { model: 'gpt-3.5-turbo', temperature: 0.9, maxTokens: 200 },
    },
    {
      name: 'Narrative Test',
      prompt:
        'Write the opening paragraph of a fantasy adventure. Include a protagonist and immediate conflict.',
      params: { model: 'gpt-3.5-turbo', temperature: 0.8, maxTokens: 300 },
    },
  ];

  function loadPreset(preset) {
    prompt = preset.prompt;
    if (preset.params) {
      model = preset.params.model || model;
      temperature = preset.params.temperature || temperature;
      maxTokens = preset.params.maxTokens || maxTokens;
    }
  }
</script>

<div class="test-harness">
  <h1>AI Adventure Engine - Test Harness</h1>
  <p class="subtitle">Test your OpenAI API integration and experiment with prompts</p>

  <!-- API Key Management Section -->
  <section class="card">
    <h2>API Key Management</h2>

    <div class="key-status">
      {#if hasStoredKey}
        <span class="status-badge success">✓ Key Stored</span>
      {:else}
        <span class="status-badge warning">⚠ No Key Stored</span>
      {/if}
    </div>

    <div class="form-group">
      <label for="api-key">
        OpenAI API Key
        <span class="help-text">
          Get your key at
          <a href="https://platform.openai.com/api-keys" target="_blank">
            platform.openai.com/api-keys
          </a>
        </span>
      </label>
      <div class="key-input-group">
        <input
          id="api-key"
          type={showApiKey ? 'text' : 'password'}
          bind:value={apiKey}
          placeholder="sk-..."
          class="key-input"
        />
        <button
          type="button"
          onclick={() => (showApiKey = !showApiKey)}
          class="btn-secondary"
        >
          {showApiKey ? '🙈 Hide' : '👁️ Show'}
        </button>
      </div>
    </div>

    <div class="button-group">
      <button onclick={handleSaveKey} class="btn-primary" disabled={!apiKey}>
        💾 Save Key
      </button>
      <button onclick={handleRemoveKey} class="btn-danger" disabled={!hasStoredKey}>
        🗑️ Remove Key
      </button>
    </div>
  </section>

  <!-- Prompt Testing Section -->
  <section class="card">
    <h2>Prompt Testing</h2>

    <div class="presets">
      <label>Quick Presets:</label>
      <div class="preset-buttons">
        {#each presets as preset}
          <button onclick={() => loadPreset(preset)} class="btn-preset">
            {preset.name}
          </button>
        {/each}
      </div>
    </div>

    <div class="form-group">
      <label for="prompt">Prompt</label>
      <textarea
        id="prompt"
        bind:value={prompt}
        placeholder="Enter your prompt here..."
        rows="6"
      ></textarea>
    </div>

    <div class="params-grid">
      <div class="form-group">
        <label for="model">Model</label>
        <select id="model" bind:value={model}>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster, Cheaper)</option>
          <option value="gpt-4">GPT-4 (Better, More Expensive)</option>
          <option value="gpt-4-turbo">GPT-4 Turbo</option>
        </select>
      </div>

      <div class="form-group">
        <label for="max-tokens">
          Max Tokens: <span class="param-value">{maxTokens}</span>
        </label>
        <input
          id="max-tokens"
          type="range"
          bind:value={maxTokens}
          min="50"
          max="2000"
          step="50"
        />
      </div>

      <div class="form-group">
        <label for="temperature">
          Temperature: <span class="param-value">{temperature}</span>
        </label>
        <input
          id="temperature"
          type="range"
          bind:value={temperature}
          min="0"
          max="1"
          step="0.1"
        />
        <span class="help-text">Lower = focused, Higher = creative</span>
      </div>
    </div>

    <button onclick={handleTestPrompt} class="btn-primary btn-large" disabled={isLoading || !apiKey}>
      {#if isLoading}
        ⏳ Generating...
      {:else}
        🚀 Test Prompt
      {/if}
    </button>
  </section>

  <!-- Response Display Section -->
  {#if response || error || isLoading}
    <section class="card">
      <h2>Response</h2>

      {#if isLoading}
        <div class="loading">
          <div class="spinner"></div>
          <p>Waiting for OpenAI response...</p>
        </div>
      {/if}

      {#if error}
        <div class="error-box">
          <strong>Error:</strong>
          {error}
        </div>
      {/if}

      {#if response && !error}
        <div class="response-box">
          <div class="response-header">
            <strong>Generated Response:</strong>
            {#if lastRequestTime}
              <span class="response-time">{lastRequestTime}ms</span>
            {/if}
          </div>
          <div class="response-content">{response}</div>
        </div>
      {/if}
    </section>
  {/if}
</div>

<style>
  .test-harness {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  h1 {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #1a1a1a;
  }

  .subtitle {
    color: #666;
    margin-bottom: 2rem;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #333;
  }

  .card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  .key-status {
    margin-bottom: 1rem;
  }

  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .status-badge.success {
    background: #d4edda;
    color: #155724;
  }

  .status-badge.warning {
    background: #fff3cd;
    color: #856404;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: #333;
  }

  .help-text {
    display: block;
    font-size: 0.875rem;
    font-weight: normal;
    color: #666;
    margin-top: 0.25rem;
  }

  .help-text a {
    color: #0066cc;
    text-decoration: none;
  }

  .help-text a:hover {
    text-decoration: underline;
  }

  .key-input-group {
    display: flex;
    gap: 0.5rem;
  }

  .key-input {
    flex: 1;
  }

  input[type='text'],
  input[type='password'],
  textarea,
  select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
    font-family: inherit;
  }

  textarea {
    resize: vertical;
    font-family: monospace;
  }

  input[type='range'] {
    width: 100%;
  }

  .param-value {
    font-weight: bold;
    color: #0066cc;
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: #0066cc;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #0052a3;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #5a6268;
  }

  .btn-danger {
    background: #dc3545;
    color: white;
  }

  .btn-danger:hover:not(:disabled) {
    background: #c82333;
  }

  .btn-preset {
    background: #f8f9fa;
    color: #333;
    border: 1px solid #dee2e6;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .btn-preset:hover {
    background: #e9ecef;
  }

  .btn-large {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 1.125rem;
  }

  .presets {
    margin-bottom: 1rem;
  }

  .preset-buttons {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  .params-grid {
    display: grid;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .loading {
    text-align: center;
    padding: 2rem;
    color: #666;
  }

  .spinner {
    border: 3px solid #f3f3f3;
    border-top: 3px solid #0066cc;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .error-box {
    background: #f8d7da;
    border: 1px solid #f5c6cb;
    color: #721c24;
    padding: 1rem;
    border-radius: 4px;
  }

  .response-box {
    background: #d4edda;
    border: 1px solid #c3e6cb;
    border-radius: 4px;
    overflow: hidden;
  }

  .response-header {
    background: #c3e6cb;
    padding: 0.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .response-time {
    font-size: 0.875rem;
    color: #155724;
  }

  .response-content {
    padding: 1rem;
    color: #155724;
    white-space: pre-wrap;
    font-family: 'Georgia', serif;
    line-height: 1.6;
  }
</style>
