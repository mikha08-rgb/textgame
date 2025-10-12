# AI Adventure Engine - Frontend Architecture Document

**Version:** 1.0
**Last Updated:** 2025-10-11
**Project:** AI Adventure Engine
**Document Owner:** Architect (Winston)

---

## Table of Contents

1. [Framework Selection](#framework-selection)
2. [Frontend Tech Stack](#frontend-tech-stack)
3. [Project Structure](#project-structure)
4. [Component Standards](#component-standards)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Routing](#routing)
8. [Styling Guidelines](#styling-guidelines)
9. [Testing Requirements](#testing-requirements)
10. [Environment Configuration](#environment-configuration)
11. [Developer Standards](#developer-standards)

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-11 | 1.0 | Initial frontend architecture document | Winston (Architect) |

---

## Framework Selection

### Decision: Svelte + TypeScript

**Selected Stack:**
- **Framework:** Svelte 4.x
- **Language:** TypeScript 5.x
- **Build Tool:** Vite 5.x
- **CSS:** Tailwind CSS 3.x

### Rationale

**Why Svelte:**
- ✅ Minimal boilerplate compared to React/Vue
- ✅ Compiled framework (no runtime overhead)
- ✅ Perfect for AI-assisted development with Claude 4.5
- ✅ Excellent for solo developer with tight 6-8 week timeline
- ✅ Simple reactive system (no complex hooks like React)
- ✅ Ideal for single-page applications

**Why TypeScript (Updated from JavaScript):**
- ✅ Type safety catches AI generation errors
- ✅ Better IDE autocomplete for Claude-assisted coding
- ✅ Prevents runtime bugs with OpenAI API responses
- ✅ Self-documenting code (types serve as inline documentation)
- ✅ Easier refactoring as project grows
- ✅ Claude 4.5 generates excellent TypeScript code
- ⚠️ 2-3 day learning curve if new to TypeScript (acceptable for 6-8 week project)

**Why Vite:**
- ✅ Lightning-fast hot module replacement (HMR)
- ✅ Zero configuration for Svelte
- ✅ Production optimizations built-in
- ✅ PRD specifies Vite

**Why Tailwind CSS:**
- ✅ PRD requirement
- ✅ Rapid UI development (saves 1-2 weeks vs custom CSS)
- ✅ Perfect for implementing UX spec's design system
- ✅ Theme switching via CSS classes

### Project Initialization

```bash
# Create Svelte + TypeScript project with Vite
npm create vite@latest frontend -- --template svelte-ts

cd frontend

# Install dependencies
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Install development dependencies
npm install -D @types/node vitest @testing-library/svelte @testing-library/jest-dom eslint prettier
```

---

## Frontend Tech Stack

### Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| **Framework** | Svelte | 4.x (latest) | Component framework and reactivity system | Minimal boilerplate, compiled framework (no runtime overhead), perfect for AI-assisted development with Claude. Excellent for solo dev with tight timeline. |
| **Build Tool** | Vite | 5.x | Development server, bundling, HMR | Lightning-fast HMR, zero config for Svelte, production optimizations built-in. PRD specifies Vite. |
| **Language** | TypeScript | 5.x | Development language with type safety | Type safety catches AI generation errors, better IDE support for Claude-assisted coding, prevents runtime bugs with OpenAI responses. |
| **CSS Framework** | Tailwind CSS | 3.x | Utility-first styling | PRD specifies Tailwind. Rapid UI development, saves 1-2 weeks vs custom CSS. Perfect for theme switching. |
| **State Management** | Svelte Stores | Built-in | Global game state management | Native Svelte solution. No extra dependencies. Perfect for game state (worldContext, narrative beats, choices). |
| **Routing** | None (Single Page) | N/A | Navigation | No routing needed - single story display view with conditional rendering. Saves complexity. |
| **HTTP Client** | Fetch API + Wrapper | Native | OpenAI API calls | Native fetch with custom wrapper (`apiClient.ts`). Zero dependencies, centralized error handling, timeout logic. |
| **Testing** | Vitest | 1.x | Unit testing framework | Seamless Vite integration, fast, Jest-compatible API. PRD specifies Vitest/Jest, 40-50% coverage target. |
| **Component Library** | Custom (10 components) | N/A | UI components from UX spec | Build custom per UX spec. No external library needed (keeps bundle small <200KB). |
| **Form Handling** | Native Svelte bindings | Built-in | API key input, settings | Svelte's `bind:` directive sufficient. No library needed for 2-3 simple forms. |
| **Animation** | Svelte Transitions | Built-in | Story beats, loading states, theme transitions | Native Svelte transitions/animations. No external library. Lightweight, performant. |
| **Dev Tools** | ESLint + Prettier | Latest | Code quality, formatting | PRD specifies ESLint/Prettier. Consistent code for AI-assisted development. |

### Bundle Size Target

- **Target:** <200KB JavaScript bundle (per PRD NFR2)
- **Expected:** ~150KB with this stack (Svelte compiles to small bundles)
- **No heavy dependencies:** All choices minimize bundle impact

---

## Project Structure

```
textgamea/
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── apiClient.ts           # OpenAI API wrapper with error handling
│   │   │   ├── storage.ts             # localStorage utilities (API key management)
│   │   │   ├── costCalculator.ts      # Token tracking and cost estimation
│   │   │   ├── gameService.ts         # High-level game orchestration
│   │   │   └── types.ts               # TypeScript interfaces and types
│   │   │
│   │   ├── stores/
│   │   │   ├── gameState.ts           # Game state store (world, narrative, choices)
│   │   │   ├── uiState.ts             # UI state (currentView, loading, errors)
│   │   │   └── apiKey.ts              # API key store (persisted to localStorage)
│   │   │
│   │   ├── components/
│   │   │   ├── Button.svelte          # Primary, Secondary, Destructive variants
│   │   │   ├── Card.svelte            # Standard, Interactive, Elevated
│   │   │   ├── InputField.svelte      # API key input with validation
│   │   │   ├── LoadingIndicator.svelte  # Spinner + multi-step progress
│   │   │   ├── Modal.svelte           # Settings, warnings, confirmations
│   │   │   ├── StoryBeat.svelte       # Story text container
│   │   │   ├── ChoiceButton.svelte    # Specialized choice buttons
│   │   │   ├── Badge.svelte           # Cost display, status indicators
│   │   │   ├── ContextIndicator.svelte  # "Fantasy • Turn 12"
│   │   │   └── ErrorMessage.svelte    # Inline and banner errors
│   │   │
│   │   ├── views/
│   │   │   ├── Landing.svelte         # API key input, intro
│   │   │   ├── ThemeSelection.svelte  # Fantasy/Cyberpunk/Steampunk cards
│   │   │   ├── Loading.svelte         # World generation loading screen
│   │   │   ├── StoryDisplay.svelte    # Main gameplay view
│   │   │   └── Settings.svelte        # API key management, preferences
│   │   │
│   │   ├── prompts/
│   │   │   ├── fantasy/
│   │   │   │   ├── world.yaml         # World generation prompt
│   │   │   │   ├── narrative-start.yaml  # Opening scene prompt
│   │   │   │   ├── choices.yaml       # Choice generation prompt
│   │   │   │   └── continue.yaml      # Narrative progression prompt
│   │   │   ├── cyberpunk/             # (Future - stretch goal)
│   │   │   └── steampunk/             # (Future - post-MVP)
│   │   │
│   │   ├── styles/
│   │   │   ├── app.css                # Global styles, Tailwind imports
│   │   │   ├── themes.css             # Theme-specific CSS variables
│   │   │   └── transitions.css        # Svelte transition styles
│   │   │
│   │   ├── utils/
│   │   │   ├── prompts.ts             # Prompt loading and variable injection
│   │   │   ├── contextManager.ts      # Context summarization for 15+ interactions
│   │   │   └── validators.ts          # API key format validation
│   │   │
│   │   ├── App.svelte                 # Root component (view routing logic)
│   │   ├── main.ts                    # Entry point
│   │   └── vite-env.d.ts              # Vite TypeScript types
│   │
│   ├── public/
│   │   └── favicon.ico
│   │
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── apiClient.test.ts      # API wrapper tests
│   │   │   ├── storage.test.ts        # localStorage utilities tests
│   │   │   ├── costCalculator.test.ts # Cost calculation tests
│   │   │   └── gameState.test.ts      # Store tests
│   │   └── setup.ts                   # Vitest configuration
│   │
│   ├── .eslintrc.cjs                  # ESLint config
│   ├── .prettierrc                    # Prettier config
│   ├── index.html                     # HTML entry point
│   ├── package.json                   # Dependencies
│   ├── postcss.config.js              # PostCSS for Tailwind
│   ├── svelte.config.js               # Svelte configuration
│   ├── tailwind.config.js             # Tailwind + custom theme colors
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── vite.config.ts                 # Vite configuration
│   └── README.md                      # Setup instructions
│
├── docs/                              # Project documentation
└── .bmad-core/                        # BMAD framework
```

### Folder Structure Rationale

**`/lib`** - Core infrastructure (API client, storage, types)
**`/utils`** - Application-specific helpers (prompt management, validators)
**`/components`** - Reusable UI components (buttons, cards, modals)
**`/views`** - Page-level components (Landing, StoryDisplay, Settings)
**`/prompts`** - YAML prompt templates organized by theme
**`/stores`** - State management (gameState, uiState, apiKey)
**`/styles`** - Global CSS and theme variables
**`/tests`** - Unit tests for critical paths

---

## Component Standards

### Component Template (Svelte + TypeScript)

```svelte
<script lang="ts">
  // 1. IMPORTS
  import { createEventDispatcher } from 'svelte';
  import type { ComponentType } from './types';

  // 2. COMPONENT PROPS (with TypeScript types)
  export let variant: 'primary' | 'secondary' | 'destructive' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled: boolean = false;
  export let ariaLabel: string | undefined = undefined;

  // 3. LOCAL STATE
  let isHovered = false;

  // 4. REACTIVE DECLARATIONS
  $: buttonClasses = `btn btn-${variant} btn-${size}`;

  // 5. EVENT DISPATCHER (for custom events)
  const dispatch = createEventDispatcher<{
    click: MouseEvent;
  }>();

  // 6. EVENT HANDLERS
  function handleClick(event: MouseEvent) {
    if (!disabled) {
      dispatch('click', event);
    }
  }
</script>

<!-- 7. MARKUP -->
<button
  class={buttonClasses}
  {disabled}
  aria-label={ariaLabel}
  on:click={handleClick}
>
  <slot />
</button>

<!-- 8. COMPONENT-SCOPED STYLES -->
<style>
  .btn {
    @apply px-6 py-3 rounded-lg font-medium transition-all duration-200;
  }

  .btn-primary {
    @apply bg-primary text-white hover:bg-primary-light;
  }
</style>
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| **Components** | PascalCase.svelte | `Button.svelte`, `StoryBeat.svelte` |
| **Views** | PascalCase.svelte | `Landing.svelte`, `StoryDisplay.svelte` |
| **Stores** | camelCase.ts | `gameState.ts`, `uiState.ts` |
| **Utilities** | camelCase.ts | `apiClient.ts`, `prompts.ts` |
| **Tests** | matchSource.test.ts | `apiClient.test.ts` |
| **Props** | camelCase | `variant`, `isDisabled` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_TOKENS`, `API_TIMEOUT_MS` |
| **Types/Interfaces** | PascalCase | `GameState`, `OpenAIResponse` |

### TypeScript Type Definitions

**`src/lib/types.ts`**

```typescript
// Game State Types
export interface NarrativeBeat {
  id: string;
  text: string;
  timestamp: number;
}

export interface Choice {
  id: string;
  text: string;
}

export interface GameState {
  worldContext: string;
  narrativeBeats: NarrativeBeat[];
  currentChoices: Choice[];
  choiceHistory: string[];
  interactionCount: number;
  sessionCost: number;
  tokenUsage: {
    input: number;
    output: number;
  };
}

// UI State Types
export type ViewType = 'landing' | 'theme-selection' | 'loading' | 'story' | 'settings';
export type Theme = 'fantasy' | 'cyberpunk' | 'steampunk';

export interface UIState {
  currentView: ViewType;
  isLoading: boolean;
  error: string | null;
  selectedTheme: Theme | null;
}

// OpenAI API Types
export interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}

export interface OpenAIResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Component Prop Types
export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
```

---

## State Management

### Store Architecture (Svelte Stores)

Svelte's built-in stores provide all state management needs. Three separate stores for clear separation of concerns:

1. **`gameState`** - Game data (world, narrative, choices, cost)
2. **`uiState`** - UI state (current view, loading, errors)
3. **`apiKey`** - Persisted API key (localStorage)

### Game State Store (Optimized)

**`src/stores/gameState.ts`**

```typescript
import { writable, derived } from 'svelte/store';
import type { GameState, NarrativeBeat, Choice } from '../lib/types';

const initialGameState: GameState = {
  worldContext: '',
  narrativeBeats: [],
  currentChoices: [],
  choiceHistory: [],
  interactionCount: 0,
  sessionCost: 0,
  tokenUsage: { input: 0, output: 0 },
};

function createGameState() {
  const { subscribe, set, update } = writable<GameState>(initialGameState);

  return {
    subscribe,

    // Batched update: Handle complete AI response in one transaction
    handleAIResponse: (response: {
      text: string;
      choices: Choice[];
      inputTokens: number;
      outputTokens: number;
    }) => {
      update(state => {
        const newBeat: NarrativeBeat = {
          id: crypto.randomUUID(),
          text: response.text,
          timestamp: Date.now(),
        };

        const inputCost = (response.inputTokens / 1000) * 0.0015;
        const outputCost = (response.outputTokens / 1000) * 0.002;

        return {
          ...state,
          narrativeBeats: [...state.narrativeBeats, newBeat],
          currentChoices: response.choices,
          interactionCount: state.interactionCount + 1,
          sessionCost: state.sessionCost + inputCost + outputCost,
          tokenUsage: {
            input: state.tokenUsage.input + response.inputTokens,
            output: state.tokenUsage.output + response.outputTokens,
          },
        };
      });
    },

    setWorldContext: (context: string) => update(state => ({ ...state, worldContext: context })),
    recordChoice: (choice: string) => update(state => ({ ...state, choiceHistory: [...state.choiceHistory, choice] })),
    reset: () => set(initialGameState),
  };
}

export const gameState = createGameState();

// Derived stores for shared computations (performance optimization)
export const formattedCost = derived(gameState, $state => `$${$state.sessionCost.toFixed(2)}`);
export const totalTokens = derived(gameState, $state => $state.tokenUsage.input + $state.tokenUsage.output);
export const currentBeat = derived(gameState, $state => $state.narrativeBeats[$state.narrativeBeats.length - 1]);
export const recentBeats = derived(gameState, $state => $state.narrativeBeats.slice(-5));
export const hasChoices = derived(gameState, $state => $state.currentChoices.length > 0);
```

### UI State Store

**`src/stores/uiState.ts`**

```typescript
import { writable, derived } from 'svelte/store';
import type { UIState, ViewType, Theme } from '../lib/types';

const initialUIState: UIState = {
  currentView: 'landing',
  isLoading: false,
  error: null,
  selectedTheme: null,
};

function createUIState() {
  const { subscribe, set, update } = writable<UIState>(initialUIState);

  return {
    subscribe,
    navigateTo: (view: ViewType) => update(state => ({ ...state, currentView: view, error: null })),
    setTheme: (theme: Theme) => update(state => ({ ...state, selectedTheme: theme })),
    setLoading: (isLoading: boolean) => update(state => ({ ...state, isLoading })),
    setError: (error: string | null) => update(state => ({ ...state, error, isLoading: false })),
    clearError: () => update(state => ({ ...state, error: null })),
    reset: () => set(initialUIState),
  };
}

export const uiState = createUIState();
```

### Performance Best Practices

**Use Derived Stores for Shared Computations:**
```typescript
// ✅ GOOD: Computed once, shared across components
export const formattedCost = derived(gameState, $state => `$${$state.sessionCost.toFixed(2)}`);

// ❌ BAD: Recalculated in every component
<p>Cost: ${$gameState.sessionCost.toFixed(2)}</p>
```

**Batch Multiple Updates:**
```typescript
// ✅ GOOD: Single update, components re-render once
gameState.handleAIResponse({ text, choices, inputTokens, outputTokens });

// ❌ BAD: Multiple updates, components re-render 3 times
gameState.addNarrativeBeat(text);
gameState.setChoices(choices);
gameState.updateCost(inputTokens, outputTokens);
```

---

## API Integration

### OpenAI API Client

**`src/lib/apiClient.ts`**

Complete API client with error handling, timeout, and retry logic:

```typescript
import type { OpenAIRequest, OpenAIResponse } from './types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_TIMEOUT_MS = 30000; // 30 seconds per PRD
const DEFAULT_MODEL = 'gpt-3.5-turbo';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public type?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

class OpenAIClient {
  private apiKey: string;
  private model: string;
  private timeout: number;

  constructor(config: { apiKey: string; model?: string; timeout?: number }) {
    this.apiKey = config.apiKey;
    this.model = config.model || DEFAULT_MODEL;
    this.timeout = config.timeout || DEFAULT_TIMEOUT_MS;
  }

  async generateResponse(prompt: string, systemPrompt?: string): Promise<OpenAIResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const messages = [];
    if (systemPrompt) messages.push({ role: 'system' as const, content: systemPrompt });
    messages.push({ role: 'user' as const, content: prompt });

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 500,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleHTTPError(response);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError(`Request timed out after ${this.timeout / 1000} seconds`);
      }
      throw error;
    }
  }

  private async handleHTTPError(response: Response): Promise<never> {
    const status = response.status;
    let message = `API request failed with status ${status}`;

    try {
      const errorData = await response.json();
      message = errorData.error?.message || message;
    } catch {}

    switch (status) {
      case 401:
        throw new APIError('Invalid API key. Please check your OpenAI API key.', 401);
      case 429:
        throw new APIError('Rate limit exceeded. Please wait and try again.', 429);
      case 500:
      case 502:
      case 503:
        throw new APIError('OpenAI service temporarily unavailable.', status);
      default:
        throw new APIError(message, status);
    }
  }

  extractText(response: OpenAIResponse): string {
    return response.choices[0].message.content.trim();
  }

  extractUsage(response: OpenAIResponse) {
    return {
      input: response.usage.prompt_tokens,
      output: response.usage.completion_tokens,
      total: response.usage.total_tokens,
    };
  }

  static validateKeyFormat(key: string): boolean {
    return key.startsWith('sk-') && key.length > 20;
  }
}

let clientInstance: OpenAIClient | null = null;

export function createAPIClient(config: { apiKey: string }): OpenAIClient {
  clientInstance = new OpenAIClient(config);
  return clientInstance;
}

export function getAPIClient(): OpenAIClient {
  if (!clientInstance) {
    throw new Error('API client not initialized. Call createAPIClient first.');
  }
  return clientInstance;
}

export { OpenAIClient };
```

### Context Management for 15+ Interaction Coherence

**Strategy: Sliding Window (MVP)**

**`src/utils/contextManager.ts`**

```typescript
interface ContextConfig {
  maxRecentBeats: number;      // Default: 5
  maxChoiceHistory: number;     // Default: 10
}

const DEFAULT_CONFIG: ContextConfig = {
  maxRecentBeats: 5,
  maxChoiceHistory: 10,
};

export function buildContextSlidingWindow(
  worldContext: string,
  narrativeBeats: Array<{ text: string }>,
  choiceHistory: string[],
  config: ContextConfig = DEFAULT_CONFIG
): string {
  // Always include full world context (never summarized)
  const worldSection = `=== WORLD CONTEXT ===\n${worldContext}\n`;

  // Include only recent beats (sliding window)
  const recentBeats = narrativeBeats.slice(-config.maxRecentBeats);
  const narrativeSection = `=== STORY SO FAR ===\n${recentBeats.map(b => b.text).join('\n\n')}\n`;

  // Include recent choices
  const recentChoices = choiceHistory.slice(-config.maxChoiceHistory);
  const choicesSection = `=== PLAYER CHOICES ===\n${recentChoices.join(' → ')}\n`;

  return `${worldSection}\n${narrativeSection}\n${choicesSection}`;
}

export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4); // 1 token ≈ 4 characters
}
```

**Why This Works:**
- ✅ Keeps world context (never loses core world facts)
- ✅ Keeps last 5 beats (~1,250 tokens)
- ✅ Stays under 3,000 token limit (75% of 4,096)
- ✅ Simple to implement and debug
- ✅ Works well for 15-20 interactions (PRD goal)

---

## Routing

### Decision: Conditional Rendering (No Routing Library)

**Implementation:** State-based view switching via `uiState` store

**Main App Component: `src/App.svelte`**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { uiState } from './stores/uiState';
  import { apiKey } from './stores/apiKey';
  import { createAPIClient } from './lib/apiClient';

  import Landing from './views/Landing.svelte';
  import ThemeSelection from './views/ThemeSelection.svelte';
  import Loading from './views/Loading.svelte';
  import StoryDisplay from './views/StoryDisplay.svelte';
  import Settings from './views/Settings.svelte';

  $: currentView = $uiState.currentView;
  $: selectedTheme = $uiState.selectedTheme;

  onMount(() => {
    if ($apiKey && $apiKey.length > 0) {
      createAPIClient({ apiKey: $apiKey });
      uiState.navigateTo('theme-selection');
    } else {
      uiState.navigateTo('landing');
    }
  });

  $: if (selectedTheme) {
    document.documentElement.classList.remove('theme-fantasy', 'theme-cyberpunk', 'theme-steampunk');
    document.documentElement.classList.add(`theme-${selectedTheme}`);
  }
</script>

<div class="app-container">
  {#if currentView === 'landing'}
    <Landing />
  {:else if currentView === 'theme-selection'}
    <ThemeSelection />
  {:else if currentView === 'loading'}
    <Loading />
  {:else if currentView === 'story'}
    <StoryDisplay />
  {:else if currentView === 'settings'}
    <Settings />
  {/if}
</div>
```

**Navigation Pattern:**

```typescript
// Navigate between views
uiState.navigateTo('theme-selection');
uiState.navigateTo('story');
uiState.navigateTo('settings');
```

**Why No Router:**
- ✅ Only 5 views in linear flow
- ✅ Saves 5-10KB bundle size
- ✅ Simpler for AI-assisted development
- ✅ No URL persistence needed (session-only game)
- ✅ Easier to test (no router mocks)

---

## Styling Guidelines

### Tailwind Configuration

**`tailwind.config.js`**

```javascript
export default {
  content: ['./index.html', './src/**/*.{svelte,js,ts}'],
  theme: {
    extend: {
      fontFamily: {
        primary: ['Lora', 'Georgia', 'serif'],
        secondary: ['Cinzel', 'Times New Roman', 'serif'],
      },
      colors: {
        primary: 'var(--color-primary)',
        'primary-light': 'var(--color-primary-light)',
        'primary-dark': 'var(--color-primary-dark)',
        secondary: 'var(--color-secondary)',
        'bg-tint': 'var(--color-bg-tint)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error: 'var(--color-error)',
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
      },
      maxWidth: {
        story: '700px',
        page: '1200px',
      },
    },
  },
};
```

### Theme Variables

**`src/styles/themes.css`**

```css
/* Fantasy Theme (Default) */
.theme-fantasy {
  --color-primary: #8b6f47;
  --color-primary-light: #c4a374;
  --color-primary-dark: #5a4730;
  --color-secondary: #6b5d8c;
  --color-bg-tint: #faf8f3;
  --color-success: #4a7c59;
  --color-warning: #c9905e;
  --color-error: #a64d4d;

  --font-family-primary: 'Lora', 'Georgia', serif;
  --font-family-secondary: 'Cinzel', 'Times New Roman', serif;
}

/* Cyberpunk Theme */
.theme-cyberpunk {
  --color-primary: #00d9ff;
  --color-primary-light: #5be4ff;
  --color-primary-dark: #0099cc;
  --color-secondary: #ff006e;
  --color-bg-tint: #0a0e1a;
  --color-success: #00ff88;
  --color-warning: #ffaa00;
  --color-error: #ff0055;
}

/* Steampunk Theme */
.theme-steampunk {
  --color-primary: #b87333;
  --color-primary-light: #d4a05a;
  --color-primary-dark: #8b5a2b;
  --color-secondary: #d4af37;
  --color-bg-tint: #2b2520;
}
```

### Global Styles

**`src/styles/app.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import './themes.css';

@layer base {
  @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600&family=Cinzel:wght@400;500;600&display=swap');

  body {
    @apply font-primary text-neutral-900 bg-white;
  }

  h1, h2, h3 {
    @apply font-secondary;
  }
}

@layer components {
  .btn {
    @apply px-6 py-3 rounded-lg font-medium transition-all duration-200;
    min-height: 48px;
  }

  .btn-primary {
    @apply bg-primary text-white hover:bg-primary-light;
  }

  .story-beat {
    @apply bg-bg-tint rounded-lg p-lg shadow-lg max-w-story mx-auto mb-lg;
    border-left: 4px solid var(--color-primary);
  }
}
```

---

## Testing Requirements

### Vitest Configuration

**`vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      lines: 45,
      functions: 40,
      branches: 40,
      statements: 45,
    },
  },
});
```

### Test Coverage Targets (Per PRD)

| Category | Target | Priority |
|----------|--------|----------|
| **API Client** | 60-70% | High |
| **Storage** | 80%+ | High |
| **Cost Calculator** | 90%+ | High |
| **Stores** | 50-60% | Medium |
| **Components** | 30-40% | Low |
| **Overall** | 40-50% | Per PRD |

### Example Tests

**API Client Test:**

```typescript
import { describe, it, expect, vi } from 'vitest';
import { OpenAIClient } from '../../src/lib/apiClient';

global.fetch = vi.fn();

describe('OpenAI API Client', () => {
  it('should validate API key format', () => {
    expect(OpenAIClient.validateKeyFormat('sk-1234567890abcdef')).toBe(true);
    expect(OpenAIClient.validateKeyFormat('invalid')).toBe(false);
  });

  it('should make successful API call', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Response' } }],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
      }),
    });

    const client = new OpenAIClient({ apiKey: 'sk-test' });
    const result = await client.generateResponse('Test');

    expect(result.choices[0].message.content).toBe('Response');
  });
});
```

### Manual Testing

**Critical test cases:**
- Name consistency across 20 turns
- World rules persistence
- Consequence tracking
- Cross-browser compatibility
- Accessibility (keyboard, screen reader)

---

## Environment Configuration

**`.env.example`**

```bash
# Development mode
VITE_DEV_MODE=true

# API Configuration
VITE_OPENAI_API_URL=https://api.openai.com/v1/chat/completions
VITE_DEFAULT_MODEL=gpt-3.5-turbo
VITE_API_TIMEOUT_MS=30000

# Cost calculation
VITE_COST_INPUT_PER_1K=0.0015
VITE_COST_OUTPUT_PER_1K=0.002

# Feature flags
VITE_ENABLE_DEBUG_MODE=true
```

**Note:** No secrets in `.env` - users provide API keys via UI

---

## Developer Standards

### Critical Coding Rules

**For AI-Assisted Development (Claude 4.5):**

1. **Always use TypeScript types**
   ```typescript
   // ✅ GOOD
   function handleChoice(choice: Choice): void { }

   // ❌ BAD
   function handleChoice(choice) { }
   ```

2. **Use Svelte auto-subscriptions**
   ```svelte
   <!-- ✅ GOOD -->
   <p>{$gameState.interactionCount}</p>

   <!-- ❌ BAD -->
   <script>
   let count;
   gameState.subscribe(s => count = s.interactionCount);
   </script>
   ```

3. **Update stores through methods**
   ```typescript
   // ✅ GOOD
   gameState.addNarrativeBeat(text);

   // ❌ BAD
   gameState.update(s => { s.narrativeBeats.push(beat); return s; });
   ```

4. **Always provide keys in `{#each}`**
   ```svelte
   <!-- ✅ GOOD -->
   {#each beats as beat (beat.id)}

   <!-- ❌ BAD -->
   {#each beats as beat}
   ```

5. **Use Tailwind over custom CSS**
   ```svelte
   <!-- ✅ GOOD -->
   <div class="flex items-center p-4">

   <!-- ❌ BAD -->
   <style>.container { display: flex; }</style>
   ```

### Quick Reference

**Commands:**
```bash
npm run dev              # Start dev server
npm run build            # Build for production
npm test                 # Run tests
npm run test:coverage    # Coverage report
```

**Key Imports:**
```typescript
import { gameState } from './stores/gameState';
import { uiState } from './stores/uiState';
import Button from './components/Button.svelte';
import { createAPIClient } from './lib/apiClient';
import type { Theme, ViewType } from './lib/types';
```

---

## Summary

This frontend architecture provides:

✅ **Svelte + TypeScript** for AI-assisted development
✅ **Minimal dependencies** (<200KB bundle target)
✅ **Clear separation of concerns** (stores, components, views)
✅ **Performance optimized** (derived stores, batched updates)
✅ **Context management** for 15+ interaction coherence
✅ **Theme switching** via CSS variables
✅ **40-50% test coverage** per PRD
✅ **Accessibility** (WCAG AA compliance)

**Next Steps:**
1. Initialize Svelte + TypeScript project with Vite
2. Set up Tailwind CSS configuration
3. Implement core stores (gameState, uiState, apiKey)
4. Build API client with error handling
5. Create 10 core components from UX spec
6. Implement 5 main views
7. Add unit tests for critical paths

---

**Document Status:** ✅ Complete and Ready for Development

**Handoff:** Ready for development team to begin Epic 1 (Foundation & API Integration)
