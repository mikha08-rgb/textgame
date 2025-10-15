<script>
  /**
   * Genre Selector Component
   *
   * Allows users to:
   * - Select genre manually
   * - View auto-detected genre
   * - See genre-specific focus areas and examples
   *
   * Part of Phase 1: Quick Wins (Task 1.3)
   */

  import { getAllGenres, detectGenre, getGenreConfig } from '../lib/genreSystem.js';

  // Props (Svelte 5 runes mode: use $props() instead of export let)
  let {
    selectedGenre = 'fantasy',
    userInput = '',
    onGenreChange = (genre) => {},
    showDetection = true,
    showDetails = true
  } = $props();

  // Internal state
  let detectedGenre = $state(null);
  let allGenres = $state(getAllGenres());
  let mode = $state('manual'); // 'manual' or 'auto'

  // Reactive detection
  $effect(() => {
    if (mode === 'auto' && userInput && userInput.length > 10) {
      const detection = detectGenre(userInput);
      detectedGenre = detection;

      if (detection.confidence > 0.5) {
        // Notify parent of genre change (parent will update selectedGenre prop)
        onGenreChange(detection.primary);
      }
    }
  });

  // Handle manual selection
  function handleManualSelect(genreId) {
    mode = 'manual';
    // Notify parent of genre change (parent will update selectedGenre prop)
    onGenreChange(genreId);
  }

  // Toggle auto-detection
  function toggleAutoDetect() {
    if (mode === 'auto') {
      mode = 'manual';
    } else {
      mode = 'auto';
      if (userInput && userInput.length > 10) {
        const detection = detectGenre(userInput);
        detectedGenre = detection;
        if (detection.confidence > 0.5) {
          selectedGenre = detection.primary;
          onGenreChange(detection.primary);
        }
      }
    }
  }

  // Get current genre config for display
  let currentConfig = $derived(getGenreConfig(selectedGenre));
</script>

<div class="genre-selector">
  <div class="selector-header">
    <h3>Select Genre</h3>

    {#if showDetection}
      <button
        class="auto-detect-toggle"
        class:active={mode === 'auto'}
        onclick={toggleAutoDetect}
        title={mode === 'auto' ? 'Disable auto-detection' : 'Enable auto-detection'}
      >
        {mode === 'auto' ? '🔮 Auto-Detect: ON' : '👆 Manual Selection'}
      </button>
    {/if}
  </div>

  <!-- Genre Detection Info (when in auto mode) -->
  {#if mode === 'auto' && detectedGenre && detectedGenre.confidence > 0}
    <div class="detection-info" class:low-confidence={detectedGenre.confidence < 0.5}>
      <div class="detection-header">
        <span class="label">Detected:</span>
        <span class="detected-genre">
          {allGenres.find(g => g.id === detectedGenre.primary)?.name || 'Unknown'}
        </span>
        <span class="confidence" class:high={detectedGenre.confidence > 0.7}>
          {(detectedGenre.confidence * 100).toFixed(0)}% confidence
        </span>
      </div>

      {#if detectedGenre.isMultiGenre && detectedGenre.secondary}
        <div class="secondary-genre">
          + {allGenres.find(g => g.id === detectedGenre.secondary)?.name || 'Unknown'}
        </div>
      {/if}

      {#if detectedGenre.confidence < 0.5}
        <div class="low-confidence-notice">
          ⚠️ Low confidence - consider selecting manually
        </div>
      {/if}
    </div>
  {/if}

  <!-- Genre Grid -->
  <div class="genre-grid">
    {#each allGenres as genre}
      <button
        class="genre-card"
        class:selected={selectedGenre === genre.id}
        class:detected={mode === 'auto' && detectedGenre && detectedGenre.primary === genre.id}
        onclick={() => handleManualSelect(genre.id)}
        style="--genre-color: {genre.color}"
      >
        <div class="genre-icon">{genre.icon}</div>
        <div class="genre-name">{genre.name}</div>
        <div class="genre-description">{genre.description}</div>
      </button>
    {/each}
  </div>

  <!-- Genre Details (for selected genre) -->
  {#if showDetails && currentConfig}
    <div class="genre-details">
      <h4>Focus Areas for {allGenres.find(g => g.id === selectedGenre)?.name}</h4>

      <div class="focus-areas">
        {#each currentConfig.focusAreas as area}
          <div class="focus-area-chip">
            {area}
          </div>
        {/each}
      </div>

      {#if currentConfig.examplePrompts && currentConfig.examplePrompts.length > 0}
        <div class="example-prompts">
          <h5>Example Prompts:</h5>
          <ul>
            {#each currentConfig.examplePrompts as example}
              <li>{example}</li>
            {/each}
          </ul>
        </div>
      {/if}

      {#if currentConfig.emphasizeLimitations}
        <div class="limitation-emphasis">
          💡 This genre emphasizes clear rules and limitations
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .genre-selector {
    width: 100%;
    margin-bottom: 2rem;
  }

  .selector-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .selector-header h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .auto-detect-toggle {
    padding: 0.5rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 6px;
    background: white;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .auto-detect-toggle:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .auto-detect-toggle.active {
    border-color: #3b82f6;
    background: #3b82f6;
    color: white;
  }

  .detection-info {
    padding: 1rem;
    border: 2px solid #3b82f6;
    border-radius: 8px;
    background: #eff6ff;
    margin-bottom: 1rem;
  }

  .detection-info.low-confidence {
    border-color: #f59e0b;
    background: #fffbeb;
  }

  .detection-header {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .detection-header .label {
    font-weight: 500;
    color: #6b7280;
  }

  .detection-header .detected-genre {
    font-weight: 600;
    color: #1f2937;
  }

  .detection-header .confidence {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: #e5e7eb;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .detection-header .confidence.high {
    background: #10b981;
    color: white;
  }

  .secondary-genre {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .low-confidence-notice {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    color: #d97706;
    font-weight: 500;
  }

  .genre-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .genre-card {
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .genre-card:hover {
    border-color: var(--genre-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .genre-card.selected {
    border-color: var(--genre-color);
    background: var(--genre-color);
    color: white;
  }

  .genre-card.detected {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .genre-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .genre-name {
    font-weight: 600;
    margin-bottom: 0.25rem;
    font-size: 1rem;
  }

  .genre-description {
    font-size: 0.75rem;
    opacity: 0.8;
    line-height: 1.3;
  }

  .genre-card.selected .genre-description {
    opacity: 0.9;
  }

  .genre-details {
    padding: 1.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
  }

  .genre-details h4 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
  }

  .focus-areas {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .focus-area-chip {
    padding: 0.5rem 0.75rem;
    border-radius: 6px;
    background: white;
    border: 1px solid #d1d5db;
    font-size: 0.875rem;
    color: #374151;
  }

  .example-prompts {
    margin-top: 1rem;
  }

  .example-prompts h5 {
    margin: 0 0 0.5rem 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #6b7280;
  }

  .example-prompts ul {
    margin: 0;
    padding-left: 1.5rem;
    list-style-type: disc;
  }

  .example-prompts li {
    font-size: 0.875rem;
    color: #4b5563;
    margin-bottom: 0.25rem;
    line-height: 1.5;
  }

  .limitation-emphasis {
    margin-top: 1rem;
    padding: 0.75rem;
    border-left: 4px solid #3b82f6;
    background: white;
    font-size: 0.875rem;
    color: #1f2937;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .genre-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 0.75rem;
    }

    .genre-card {
      padding: 0.75rem;
    }

    .genre-icon {
      font-size: 1.5rem;
    }

    .genre-name {
      font-size: 0.875rem;
    }

    .genre-description {
      font-size: 0.7rem;
    }

    .selector-header {
      flex-direction: column;
      gap: 0.5rem;
      align-items: flex-start;
    }

    .auto-detect-toggle {
      width: 100%;
    }
  }
</style>
