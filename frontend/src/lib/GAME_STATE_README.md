# Game State Management System

## Overview

The game state management system tracks the entire adventure state, including:
- World context (generated world data)
- Story beats (narrative history)
- Player choices
- Context window management (keeps last 5 beats for AI prompts)

## Usage Example

```javascript
import {
  createGameState,
  addStoryBeat,
  recordPlayerChoice,
  getContextWindow,
  getCurrentBeat,
  canPlayerChoose,
  needsNextBeat,
} from './gameState.js';

// 1. Start a new game with generated world
const worldData = await generateWorld(); // Your world generation
let gameState = createGameState(worldData);

// 2. Generate opening scene
const openingPrompt = getOpeningPrompt(worldData);
const openingResponse = await generateText({ prompt: openingPrompt });
const opening = parseNarrativeResponse(openingResponse);

// 3. Add first story beat
gameState = addStoryBeat(gameState, opening.narrative, opening.choices);

// 4. Display narrative and choices to player
displayNarrative(opening.narrative);
displayChoices(opening.choices);

// 5. Player makes a choice
const playerChoice = opening.choices[0]; // Player selected first choice
gameState = recordPlayerChoice(gameState, playerChoice);

// 6. Generate next beat using context
if (needsNextBeat(gameState)) {
  const context = getContextWindow(gameState);
  const continuePrompt = getContinuationPrompt(
    context.world,
    context.recentNarrative,
    playerChoice.text
  );

  const continueResponse = await generateText({ prompt: continuePrompt });
  const nextBeat = parseNarrativeResponse(continueResponse);

  gameState = addStoryBeat(gameState, nextBeat.narrative, nextBeat.choices);
}

// 7. Continue the loop...
```

## Key Functions

### `createGameState(worldContext)`
Creates a new game state with world data.

### `addStoryBeat(state, narrative, choices)`
Adds a new narrative beat to the story history.

### `recordPlayerChoice(state, choice)`
Records which choice the player made for the current beat.

### `getContextWindow(state, maxBeats = 5)`
Gets the context for AI prompts (world + last N beats).

Returns:
```javascript
{
  world: {...},           // World context
  recentNarrative: "...", // Last 5 beats formatted as text
  beatCount: 10,          // Total beats so far
  totalInteractions: 9    // Choices made
}
```

### `getCurrentBeat(state)`
Gets the current story beat object.

### `canPlayerChoose(state)`
Returns `true` if the player hasn't made a choice yet for the current beat.

### `needsNextBeat(state)`
Returns `true` if the player made a choice and game needs to generate the next beat.

### `checkGameHealth(state)`
Checks if the game state is healthy (no issues, not too long).

## Context Management

The system keeps the **last 5 story beats** in the context window to stay within token limits. Older beats are summarized if needed.

- **Full context**: Last 5 beats with full narrative text
- **Summary**: Beats 6+ are condensed to key events
- **Max beats**: Game warns at 50 beats (very long session)

## Example Game Loop

```javascript
let gameState = createGameState(worldData);

// Add opening
gameState = addStoryBeat(gameState, opening.narrative, opening.choices);

// Game loop
while (beatCount < 20) {
  // Display current beat
  const currentBeat = getCurrentBeat(gameState);
  displayNarrative(currentBeat.narrative);
  displayChoices(currentBeat.choices);

  // Wait for player choice
  const choice = await waitForPlayerChoice();
  gameState = recordPlayerChoice(gameState, choice);

  // Generate next beat
  if (needsNextBeat(gameState)) {
    const context = getContextWindow(gameState);
    const nextNarrative = await generateNextBeat(context, choice);
    gameState = addStoryBeat(gameState, nextNarrative.narrative, nextNarrative.choices);
  }
}
```

## Saving/Loading

```javascript
// Save game
const saveData = serializeGameState(gameState);
localStorage.setItem('currentGame', saveData);

// Load game
const loadedData = localStorage.getItem('currentGame');
const gameState = deserializeGameState(loadedData);
```

## Health Monitoring

```javascript
const health = checkGameHealth(gameState);

if (!health.healthy) {
  console.warn('Game issues:', health.issues);
}

console.log('Game stats:', health.stats);
// {
//   beatCount: 12,
//   interactionCount: 11,
//   gameDuration: 600000, // ms
//   avgTimePerBeat: 50000
// }
```

## Token Management

The context window system automatically:
1. Keeps world context (always included)
2. Keeps last 5 beats (most recent narrative)
3. Provides summary of older beats if needed
4. Warns when approaching token limits

This keeps AI prompts under ~2000 tokens while maintaining story coherence.
