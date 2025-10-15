# Progressive Generation UI Component Guide

## Layout Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Worldbuilding Studio                         │
│           Quick foundation → Explore what interests you         │
├──────────────────────────┬──────────────────────────────────────┤
│                          │                                      │
│   CHAT PANEL (Left)      │    WORLD PREVIEW PANEL (Right)      │
│                          │                                      │
│   [Chat messages]        │   [World Name]                       │
│   [User/AI messages]     │   [Core Hook]                        │
│   [Loading indicator]    │                                      │
│                          │   📍 Geography                       │
│                          │   ✨ Magic System                    │
│   ┌──────────────────┐   │   ⚔️  Central Conflict              │
│   │ Input field      │   │                                      │
│   │ [Send]           │   │   👥 Cultures                        │
│   └──────────────────┘   │   ┌─────────────────────────┐       │
│                          │   │ Culture A        [Explore]│       │
│                          │   │ Overview...              │       │
│                          │   │ Values: X, Y, Z          │       │
│                          │   └─────────────────────────┘       │
│                          │                                      │
│                          │   🎯 Quick Actions                   │
│                          │   [👤 Character] [🏛️ Location]      │
│                          │   [📜 Legend] [⚔️ Conflict]          │
│                          │                                      │
└──────────────────────────┴──────────────────────────────────────┘
```

## Component Breakdown

### 1. Chat Panel (Left Side)

#### Welcome State (Before Generation)
```svelte
<div class="welcome-section">
  <div class="welcome-icon">✨</div>
  <h2>Let's Build Your World</h2>
  <p>I'll create a quick foundation, then you can explore...</p>

  <!-- Starter Prompts -->
  <button class="starter-prompt-btn">
    I want a fantasy world with floating islands
  </button>
  <!-- ... more prompts ... -->
</div>
```

#### Chat Messages (During/After Generation)
```svelte
<!-- User Message -->
<div class="user-message">
  Create a dark gothic world
</div>

<!-- AI Response -->
<div class="assistant-message">
  # The Shadow Realms
  **Core Hook:** A world where sunlight is deadly...

  ## Geography
  Underground cavern networks...
</div>

<!-- Loading Indicator -->
<div class="assistant-message">
  <div class="loading-dots">●●●</div>
  <span>Expanding culture...</span>
</div>
```

#### Input Area
```svelte
<div class="chat-input-area">
  <!-- Error Display -->
  {#if error}
    <div class="error-banner">{error}</div>
  {/if}

  <!-- Input -->
  <input
    placeholder="Ask about the world, expand elements..."
    disabled={isGenerating}
  />
  <button disabled={isGenerating || !message.trim()}>
    Send
  </button>
</div>
```

### 2. World Preview Panel (Right Side)

#### Header with Export
```svelte
<div class="world-header">
  <h2>{worldData.name}</h2>
  <p>{worldData.coreHook}</p>
  <button class="export-button">
    📥 Export World
  </button>
</div>
```

#### Core World Sections
```svelte
<!-- Geography -->
<div class="world-section">
  <h3 class="section-title">🌍 Geography</h3>
  <p>{worldData.geography}</p>
</div>

<!-- Magic System -->
<div class="world-section">
  <h3 class="section-title">✨ {worldData.magicSystem.name}</h3>
  <p>{worldData.magicSystem.description}</p>
</div>

<!-- Conflict -->
<div class="world-section">
  <h3 class="section-title">⚔️ Central Conflict</h3>
  <p>{worldData.conflict}</p>
</div>
```

#### Culture Cards (The Key Component)
```svelte
<div class="world-section">
  <h3 class="section-title">👥 Cultures</h3>

  {#each worldData.cultures as culture}
    <div class="element-card">
      <!-- Header with Expand Button -->
      <div class="card-header">
        <h4>{culture.name}</h4>
        {#if !culture.expanded}
          <button
            onclick={() => expandCulture(culture.name)}
            disabled={isGenerating}
            class="expand-button"
          >
            📖 Explore
          </button>
        {:else}
          <span class="badge-expanded">✓ Expanded</span>
        {/if}
      </div>

      <!-- Summary (Always Visible) -->
      <p class="culture-overview">{culture.overview}</p>
      <p class="culture-values">Values: {culture.values}</p>

      <!-- Expanded Content (Only After Expansion) -->
      {#if culture.expanded && culture.fullDetail}
        <div class="expanded-content">
          <!-- Daily Life -->
          <div class="expansion-section">
            <h5>Daily Life</h5>
            <p>{culture.fullDetail.dailyLife}</p>
          </div>

          <!-- Notable Figures -->
          <div class="expansion-section">
            <h5>Notable Figures</h5>
            {#each culture.fullDetail.notableFigures as figure}
              <div class="figure-item">
                <p class="figure-name">{figure.name} - {figure.role}</p>
                <p class="figure-desc">{figure.description}</p>
              </div>
            {/each}
          </div>

          <!-- Key Locations -->
          <div class="expansion-section">
            <h5>Key Locations</h5>
            {#each culture.fullDetail.locations as location}
              <div class="location-item">
                <p class="location-name">{location.name} ({location.type})</p>
                <p class="location-desc">{location.description}</p>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/each}
</div>
```

#### Quick Actions Panel
```svelte
<div class="world-section">
  <h3 class="section-title">🎯 Quick Actions</h3>
  <div class="action-grid">
    <button
      onclick={() => generateCharacter()}
      disabled={isGenerating}
      class="action-button"
    >
      👤 Create Character
    </button>

    <button
      onclick={generateLocation}
      disabled={isGenerating}
      class="action-button"
    >
      🏛️ Add Location
    </button>

    <button
      onclick={generateLegend}
      disabled={isGenerating}
      class="action-button"
    >
      📜 Generate Legend
    </button>

    <button
      onclick={() => message = "Tell me more about the conflict"}
      disabled={isGenerating}
      class="action-button"
    >
      ⚔️ Explore Conflict
    </button>
  </div>
</div>
```

#### Generated Content Summary
```svelte
{#if worldData.characters.length > 0 || worldData.locations.length > 0 || worldData.legends.length > 0}
  <div class="world-section">
    <h3 class="section-title">📚 Generated Content</h3>
    <div class="content-summary">
      {#if worldData.characters.length > 0}
        <p>👤 <strong>{worldData.characters.length}</strong> Character(s)</p>
      {/if}
      {#if worldData.locations.length > 0}
        <p>🏛️ <strong>{worldData.locations.length}</strong> Location(s)</p>
      {/if}
      {#if worldData.legends.length > 0}
        <p>📜 <strong>{worldData.legends.length}</strong> Legend(s)</p>
      {/if}
    </div>
  </div>
{/if}
```

#### Empty State (Before Generation)
```svelte
<div class="empty-preview">
  <div class="icon">🌍</div>
  <h3>Your World Will Appear Here</h3>
  <p>Quick foundation → Explore what interests you</p>
  <div class="benefits">
    <p>✨ Fast initial generation (30 seconds)</p>
    <p>📖 Expand cultures on demand</p>
    <p>👤 Generate characters as needed</p>
    <p>🏛️ Add locations when you want them</p>
  </div>
</div>
```

## Visual States

### 1. Culture Card States

#### Collapsed (Default)
```
┌───────────────────────────────────────┐
│ Culture Name            [📖 Explore]  │
│                                       │
│ Brief overview text about this        │
│ culture and their way of life...      │
│                                       │
│ Values: Honor, Tradition, Community   │
└───────────────────────────────────────┘
```

#### Expanded
```
┌───────────────────────────────────────┐
│ Culture Name            ✓ Expanded    │
│                                       │
│ Brief overview text about this        │
│ culture and their way of life...      │
│                                       │
│ Values: Honor, Tradition, Community   │
│ ─────────────────────────────────────│
│ Daily Life                            │
│ Detailed description of daily         │
│ activities, rituals, food, housing... │
│                                       │
│ Notable Figures                       │
│ • Aria Stormcaller - High Priestess  │
│   Description of her role...          │
│ • Kael the Wise - Elder Council      │
│   Description of his influence...     │
│                                       │
│ Key Locations                         │
│ • The Crystal Sanctum (temple)       │
│   Detailed description with          │
│   sensory details...                  │
│ • Market of Whispers (marketplace)   │
│   Description of the location...      │
└───────────────────────────────────────┘
```

### 2. Loading States

#### Initial Generation
```
Chat Panel:
┌────────────────────────────────┐
│ AI: Creating your world's      │
│     foundation... This will    │
│     be quick!                  │
│                                │
│ [●●●] Building...              │
└────────────────────────────────┘
```

#### Culture Expansion
```
Chat Panel:
┌────────────────────────────────┐
│ AI: 📖 Expanding on Shadow     │
│     Walkers... Generating      │
│     detailed information...    │
│                                │
│ [●●●] Expanding culture...     │
└────────────────────────────────┘
```

#### Character Generation
```
Chat Panel:
┌────────────────────────────────┐
│ AI: 👤 Creating a character    │
│     from Shadow Walkers...     │
│                                │
│ [●●●] Creating character...    │
└────────────────────────────────┘
```

## Color Scheme

### Primary Colors
- **Purple Primary**: `#7c3aed` (buttons, titles)
- **Purple Light**: `#c4b5fd` (borders, backgrounds)
- **Purple Dark**: `#5b21b6` (headers)

### Semantic Colors
- **Success**: `#10b981` (export button, expanded badge)
- **Error**: `#991b1b` (error messages)
- **Gray**: `#6b7280` (text, borders)

### Gradients
- **Header**: `linear-gradient(135deg, #7c3aed, #6366f1)`
- **Cards**: `linear-gradient(135deg, #faf5ff, #f9fafb)`
- **Buttons**: Various purple gradients

## Responsive Behavior

### Desktop (> 1024px)
```
┌─────────────────────────────────────┐
│   Chat (50%)   │   Preview (50%)   │
└─────────────────────────────────────┘
```

### Mobile/Tablet (< 1024px)
```
┌─────────────────┐
│   Chat (50%)    │
├─────────────────┤
│   Preview (50%) │
└─────────────────┘
```

## Animation Details

### Expand Animation
```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.expanded-content {
  animation: slideDown 0.3s ease-out;
}
```

### Button Hover
```css
.expand-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
```

### Loading Dots
```css
.animate-bounce {
  animation: bounce 1s infinite;
}

/* Staggered delays */
- Dot 1: delay 0ms
- Dot 2: delay 150ms
- Dot 3: delay 300ms
```

## Accessibility Features

### Keyboard Navigation
- Tab through all interactive elements
- Enter key submits chat input
- Space/Enter activates buttons

### Screen Reader Support
- Semantic HTML (nav, main, section)
- ARIA labels on buttons
- Alt text on loading indicators
- Status announcements for state changes

### Focus Indicators
- Visible focus ring on all interactive elements
- Color contrast meets WCAG AA standards

## Usage Examples

### Example 1: Expand Culture via Button
1. User clicks "📖 Explore" on culture card
2. Button changes to "✓ Expanded" badge
3. Expanded content slides down
4. Chat shows expansion details

### Example 2: Generate Character via Chat
1. User types "Create a character from Shadow Walkers"
2. Intent detected → `generateCharacter("Shadow Walkers")` called
3. Loading indicator: "Creating character..."
4. Character details appear in chat
5. "Generated Content" counter updates

### Example 3: Quick Action Button
1. User clicks "👤 Create Character" button
2. Generates character from first culture
3. Loading indicator shows
4. Character appears in chat
5. Summary panel updates

## Best Practices

### When to Use Buttons
- Quick, common actions
- Visual discoverability
- Single-click operations

### When to Use Chat
- Natural language queries
- Contextual requests
- Exploratory questions

### When to Show Loading States
- Always during API calls
- Show what's being generated
- Disable controls during generation

### When to Update UI
- Immediately on user action
- After successful API response
- Smooth animations for transitions
