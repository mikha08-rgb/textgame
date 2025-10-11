/**
 * Game State Management Module
 * Manages adventure state, narrative history, and context window for AI prompts
 */

/**
 * Story beat structure
 * @typedef {Object} StoryBeat
 * @property {string} narrative - The narrative text for this beat
 * @property {Array<Object>} choices - The choices presented to the player
 * @property {Object|null} chosenAction - The choice the player made (null if current beat)
 * @property {number} timestamp - When this beat was created
 */

/**
 * Game state structure
 * @typedef {Object} GameState
 * @property {Object|null} world - The generated world context
 * @property {Array<StoryBeat>} storyBeats - Full narrative history
 * @property {number} currentBeatIndex - Current position in story
 * @property {string} gameId - Unique identifier for this game session
 * @property {number} startTime - When the game started
 * @property {number} totalInteractions - Count of player choices made
 */

const MAX_CONTEXT_BEATS = 5; // Keep last 5 beats in context window
const MAX_TOTAL_BEATS = 50; // Maximum story beats before requiring new game

/**
 * Create a new game state
 * @param {Object} worldContext - The generated world data
 * @returns {GameState} New game state object
 */
export function createGameState(worldContext) {
  return {
    world: worldContext,
    storyBeats: [],
    currentBeatIndex: -1,
    gameId: generateGameId(),
    startTime: Date.now(),
    totalInteractions: 0,
  };
}

/**
 * Add a new story beat to the game state
 * @param {GameState} state - Current game state
 * @param {string} narrative - The narrative text
 * @param {Array<Object>} choices - Available choices for the player
 * @returns {GameState} Updated game state
 */
export function addStoryBeat(state, narrative, choices) {
  const newBeat = {
    narrative,
    choices,
    chosenAction: null,
    timestamp: Date.now(),
  };

  const updatedBeats = [...state.storyBeats, newBeat];

  return {
    ...state,
    storyBeats: updatedBeats,
    currentBeatIndex: updatedBeats.length - 1,
  };
}

/**
 * Record a player's choice for the current beat
 * @param {GameState} state - Current game state
 * @param {Object} choice - The choice the player made
 * @returns {GameState} Updated game state
 */
export function recordPlayerChoice(state, choice) {
  if (state.currentBeatIndex < 0 || state.currentBeatIndex >= state.storyBeats.length) {
    throw new Error('Invalid current beat index');
  }

  const updatedBeats = [...state.storyBeats];
  updatedBeats[state.currentBeatIndex] = {
    ...updatedBeats[state.currentBeatIndex],
    chosenAction: choice,
  };

  return {
    ...state,
    storyBeats: updatedBeats,
    totalInteractions: state.totalInteractions + 1,
  };
}

/**
 * Get the context window for AI prompts
 * Returns world summary + last N story beats to stay within token limits
 * @param {GameState} state - Current game state
 * @param {number} maxBeats - Maximum number of recent beats to include
 * @returns {Object} Context object with world and recent narrative
 */
export function getContextWindow(state, maxBeats = MAX_CONTEXT_BEATS) {
  const recentBeats = state.storyBeats.slice(-maxBeats);

  // Build narrative summary from recent beats
  const narrativeSummary = recentBeats
    .map((beat, index) => {
      const beatText = beat.narrative;
      const choiceText = beat.chosenAction
        ? `\n[Player chose: ${beat.chosenAction.text}]`
        : '';
      return `${beatText}${choiceText}`;
    })
    .join('\n\n---\n\n');

  return {
    world: state.world,
    recentNarrative: narrativeSummary,
    beatCount: state.storyBeats.length,
    totalInteractions: state.totalInteractions,
  };
}

/**
 * Get a summary of older story beats for context
 * This creates a condensed version of beats outside the main context window
 * @param {GameState} state - Current game state
 * @param {number} keepRecentBeats - Number of recent beats to exclude from summary
 * @returns {string} Condensed summary of older events
 */
export function getOlderBeatsSummary(state, keepRecentBeats = MAX_CONTEXT_BEATS) {
  const olderBeats = state.storyBeats.slice(0, -keepRecentBeats);

  if (olderBeats.length === 0) {
    return '';
  }

  // Extract key events and choices from older beats
  const keyEvents = olderBeats
    .filter(beat => beat.chosenAction)
    .map(beat => {
      // Extract first sentence or key phrase from narrative
      const firstSentence = beat.narrative.split(/[.!?]/)[0];
      const choice = beat.chosenAction.text;
      return `Event: ${firstSentence.trim()}. Action taken: ${choice}`;
    });

  if (keyEvents.length === 0) {
    return '';
  }

  return `Earlier in the story:\n${keyEvents.join('\n')}`;
}

/**
 * Check if game state is healthy
 * @param {GameState} state - Current game state
 * @returns {Object} Health check result
 */
export function checkGameHealth(state) {
  const issues = [];

  if (!state.world) {
    issues.push('No world context');
  }

  if (state.storyBeats.length >= MAX_TOTAL_BEATS) {
    issues.push(`Story too long (${state.storyBeats.length} beats, max ${MAX_TOTAL_BEATS})`);
  }

  if (state.currentBeatIndex >= 0 && state.storyBeats.length > 0) {
    const currentBeat = state.storyBeats[state.currentBeatIndex];
    if (!currentBeat.choices || currentBeat.choices.length === 0) {
      issues.push('Current beat has no choices');
    }
  }

  const gameLength = Date.now() - state.startTime;
  const avgTimePerBeat = state.storyBeats.length > 0
    ? gameLength / state.storyBeats.length
    : 0;

  return {
    healthy: issues.length === 0,
    issues,
    stats: {
      beatCount: state.storyBeats.length,
      interactionCount: state.totalInteractions,
      gameDuration: gameLength,
      avgTimePerBeat,
    },
  };
}

/**
 * Serialize game state to JSON (for saving)
 * @param {GameState} state - Game state to serialize
 * @returns {string} JSON string
 */
export function serializeGameState(state) {
  return JSON.stringify(state);
}

/**
 * Deserialize game state from JSON (for loading)
 * @param {string} json - JSON string
 * @returns {GameState} Deserialized game state
 */
export function deserializeGameState(json) {
  try {
    const state = JSON.parse(json);

    // Validate structure
    if (!state.world || !Array.isArray(state.storyBeats)) {
      throw new Error('Invalid game state structure');
    }

    return state;
  } catch (error) {
    throw new Error(`Failed to deserialize game state: ${error.message}`);
  }
}

/**
 * Generate a unique game ID
 * @returns {string} Unique game identifier
 */
function generateGameId() {
  return `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Get current beat information
 * @param {GameState} state - Current game state
 * @returns {StoryBeat|null} Current story beat or null
 */
export function getCurrentBeat(state) {
  if (state.currentBeatIndex < 0 || state.currentBeatIndex >= state.storyBeats.length) {
    return null;
  }
  return state.storyBeats[state.currentBeatIndex];
}

/**
 * Check if player can continue (hasn't made choice yet)
 * @param {GameState} state - Current game state
 * @returns {boolean} True if player can make a choice
 */
export function canPlayerChoose(state) {
  const currentBeat = getCurrentBeat(state);
  return currentBeat !== null && currentBeat.chosenAction === null;
}

/**
 * Check if game needs new beat (player made choice)
 * @param {GameState} state - Current game state
 * @returns {boolean} True if game needs to generate next beat
 */
export function needsNextBeat(state) {
  const currentBeat = getCurrentBeat(state);
  return currentBeat !== null && currentBeat.chosenAction !== null;
}

/**
 * Get game progress percentage
 * @param {GameState} state - Current game state
 * @returns {number} Progress as percentage (0-100)
 */
export function getGameProgress(state) {
  return Math.min(100, (state.storyBeats.length / MAX_TOTAL_BEATS) * 100);
}
