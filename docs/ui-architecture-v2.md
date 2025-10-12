# AI Worldbuilding Engine - Frontend Architecture Document

**Version:** 2.0
**Last Updated:** 2025-10-11
**Project:** AI Worldbuilding Engine
**Document Owner:** Architect

---

## Table of Contents

1. [Framework Selection](#framework-selection)
2. [Frontend Tech Stack](#frontend-tech-stack)
3. [Project Structure](#project-structure)
4. [Component Standards](#component-standards)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Styling Guidelines](#styling-guidelines)
8. [Testing Requirements](#testing-requirements)

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-11 | 2.0 | Updated for worldbuilding engine (pivot from game) | Architect |
| 2025-10-11 | 1.0 | Initial frontend architecture (archived - v1 game concept) | Architect |

---

## Framework Selection

### Decision: Svelte 5 + JavaScript

**Selected Stack:**
- **Framework:** Svelte 5.x
- **Language:** JavaScript (ES2020+)
- **Build Tool:** Vite 7.x
- **CSS:** Tailwind CSS 4.x

### Rationale

**Why Svelte:**
- Minimal boilerplate compared to React/Vue
- Compiled framework (no runtime overhead)
- Perfect for AI-assisted development
- Excellent for solo developer with tight timeline

**Why JavaScript (not TypeScript):**
- Faster development for MVP
- Less complexity for solo developer
- AI outputs are unpredictable anyway (TS provides limited value here)

---

## Frontend Tech Stack

### Core Dependencies

**Framework & Build:**
- `svelte@^5.39.6` - UI framework
- `vite@^7.1.7` - Build tool and dev server
- `@sveltejs/vite-plugin-svelte@^6.2.1` - Svelte integration

**Styling:**
- `tailwindcss@^4.1.14` - Utility-first CSS
- `@tailwindcss/postcss@^4.1.14` - PostCSS plugin
- `autoprefixer@^10.4.21` - CSS vendor prefixing

**Development:**
- `eslint@^9.37.0` - Code linting
- `prettier@^3.6.2` - Code formatting
- `vitest@^3.2.4` - Unit testing
- `@playwright/test@^1.56.0` - E2E testing (optional)

---

## Project Structure

```
/frontend
  /src
    /components          # Svelte components
      LandingPage.svelte
      ThemeSelection.svelte
      GameInitializer.svelte       # World generator
      WorldExplorer.svelte         # Main exploration interface
      CostDisplay.svelte
      CostWarningModal.svelte
      Settings.svelte
      TestHarness.svelte           # Development/testing tool
    /lib                 # Utility functions
      apiKeyStorage.js           # localStorage wrapper
      openai.js                  # OpenAI API integration
      costTracking.js            # Usage and cost calculation
    /prompts             # AI prompt templates
      worldGeneration.js         # World generation prompts
      worldExpansion.js          # Expansion prompts (characters, locations, etc.)
    /assets              # Static files (minimal)
    app.css              # Global styles + Tailwind
    App.svelte           # Root component (router)
    main.js              # Application entry point
  /public                # Static assets served as-is
  /tests                 # Test files
  package.json
  vite.config.js
  tailwind.config.js
  eslint.config.js
```

---

## Component Standards

### Component Organization

**Single Responsibility:** Each component does one thing well
- LandingPage: API key input only
- WorldExplorer: Display and expand generated worlds
- GameInitializer: World generation process

**Prop Types:** Use JSDoc comments for prop documentation

```javascript
/**
 * @component WorldExplorer
 * @prop {Object} world - Generated world data
 * @prop {string} apiKey - User's OpenAI API key
 * @prop {Function} onNewWorld - Callback to start new world
 */
```

### Svelte 5 Runes

**State Management:**
- `$state()` - Component-local reactive state
- `$derived()` - Computed values
- `$effect()` - Side effects (like onMount)
- `$props()` - Component props

**Example:**
```javascript
let worldData = $state(null);
let isGenerating = $state(false);
let generatedCount = $derived(worldData ? 1 : 0);

$effect(() => {
  console.log('World generated:', worldData);
});
```

---

## State Management

### Application State

**Client-Side Only (No Global Store):**
- App.svelte manages top-level state:
  - `apiKeyValidated` - Boolean
  - `currentAPIKey` - String
  - `selectedTheme` - String | null
  - `worldData` - Object | null

**Component State:**
- WorldExplorer manages expansion state:
  - `expansions` - Object with arrays of generated content
  - `activeSection` - String (current tab)
  - `isGenerating` - Boolean
  - `error` - String | null

**Persistence:**
- API keys: localStorage (persistent across sessions)
- World data: Component state only (session-based)
- No backend, no database

---

## API Integration

### OpenAI Integration

**Direct Client-Side Calls:**
```javascript
async function callOpenAI(systemPrompt, userPrompt, params) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: params.temperature,
      max_tokens: params.maxTokens
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
```

**Error Handling:**
- Network errors: Retry with exponential backoff
- Rate limits: Clear user message, suggest waiting
- Invalid API key: Prompt to re-enter
- Malformed responses: Parse errors, retry once

**Cost Tracking:**
- Track tokens per request (from API response)
- Calculate costs based on current OpenAI pricing
- Warn users at $1, $5, $10 thresholds

---

## Styling Guidelines

### Tailwind CSS Best Practices

**Utility-First:**
- Use Tailwind utilities directly in components
- Extract repeated patterns to components, not CSS classes

**Responsive Design:**
```svelte
<div class="p-3 md:p-6 lg:p-8">
  <!-- Mobile: p-3, Tablet: p-6, Desktop: p-8 -->
</div>
```

**Color Palette:**
- Primary: `purple-600`, `purple-700`
- Secondary: `blue-600`, `blue-700`
- Success: `green-600`, `green-700`
- Warning: `yellow-600`, `yellow-700`
- Error: `red-600`, `red-700`

---

## Testing Requirements

### Unit Tests (Vitest)

**Critical Paths:**
- API key validation
- Export functions (JSON, Markdown)
- Cost calculations
- Prompt template generation

**Example:**
```javascript
import { describe, it, expect } from 'vitest';
import { validateAPIKey } from './lib/apiKeyStorage.js';

describe('API Key Validation', () => {
  it('validates correct format', () => {
    expect(validateAPIKey('sk-proj-...')).toBe(true);
  });

  it('rejects invalid format', () => {
    expect(validateAPIKey('invalid')).toBe(false);
  });
});
```

### Manual Testing

**World Quality:**
- Generate 10+ worlds, verify coherence
- Check for repetition across generations
- Ensure cultures/conflicts feel distinct
- Verify magic systems make sense

**Export Functionality:**
- Export JSON, verify structure
- Export Markdown, verify formatting
- Import to Notion, check compatibility

---

## Development Workflow

### Local Development

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run unit tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Deployment

**Vercel (Current):**
- Push to `main` branch
- Auto-deploy via GitHub integration
- Build command: `cd frontend && npm run build`
- Output directory: `frontend/dist`

---

## Performance Considerations

**Bundle Size:**
- Target: <200KB gzipped
- Current: ~52KB gzipped ✅
- Monitor with `vite build --report`

**Loading Performance:**
- Code splitting by route (if needed post-MVP)
- Lazy load non-critical components
- Optimize images (minimal for MVP)

**Runtime Performance:**
- Svelte compiles to vanilla JS (fast!)
- Minimal runtime overhead
- Use `$derived` instead of manual reactive statements

---

## Security Considerations

**API Key Storage:**
- localStorage only (never transmitted to our servers)
- Clear on logout
- Warn users about browser extensions accessing localStorage

**Content Security:**
- No user-generated content stored server-side
- Client-side only = minimal attack surface
- HTTPS required (enforced by Vercel)

---

## Next Steps

1. Monitor performance in production
2. Gather user feedback on UX
3. Optimize prompts based on world quality feedback
4. Consider adding service worker for offline support (post-MVP)

---

**Status:** Active - Reflects implemented architecture

**Built with Claude Code** 🤖
