# Error Handling Improvements

## Overview
Enhanced error handling and user feedback in WorldbuildingStudioSimple.svelte with specific error types, helpful messages, and actionable guidance.

## New Error Types

### 1. API Key Errors (`errorType: 'api-key'`)
**Triggers:**
- 401 Unauthorized: Invalid API key
- 429 Too Many Requests: Rate limit exceeded or quota depleted

**User Feedback:**
- Icon: 🔑
- Title: "API Key Issue"
- Specific message about what went wrong
- Actionable tip with suggestion
- "Update API Key" button that opens API key input

**Example Messages:**
- "Invalid API key. Please check your OpenAI API key and try again."
- "Rate limit exceeded or quota depleted. You may have exceeded your API quota."

### 2. Quality Errors (`errorType: 'quality'`)
**Triggers:**
- Generated world is too short (< 500 characters)
- Quality score is very low (< 40%)
- Quality validation fails after retry attempts

**User Feedback:**
- Icon: ⚠️
- Title: "Quality Warning"
- Shows quality score and specific issues
- Lists detected problems (missing details, vague terms, etc.)
- "Regenerate" button to try again
- "Edit Prompt" button to modify input

**Example Messages:**
- "Generated world is too short. The AI may have encountered an issue."
- "Quality check failed. Generated world has some issues."

**Quality Score Display:**
- Shows exact quality score percentage
- Lists specific issues detected:
  - Theme lacks specific numerical details
  - Magic system lacks detailed cost/limitation
  - Missing sections
  - World lacks sufficient detail

### 3. Parsing Errors (`errorType: 'parsing'`)
**Triggers:**
- Failed to parse JSON response
- Missing required fields (worldName, theme, geography, magicSystem)
- Invalid world structure

**User Feedback:**
- Icon: 📄
- Title: "Generation Error"
- Shows which required fields are missing
- Helpful tip about simplifying prompt
- "Regenerate" button
- "Edit Prompt" button

**Example Messages:**
- "Generated world is missing required fields: worldName, magicSystem"
- "Failed to parse world data: Invalid JSON structure"

### 4. Network Errors (`errorType: 'network'`)
**Triggers:**
- 500/503 Server errors (OpenAI service down)
- Timeout after 3 minutes
- Connection issues

**User Feedback:**
- Icon: 🌐
- Title: "Connection Issue"
- Specific message about the problem
- Helpful tip about waiting or checking connection
- "Retry" button

**Example Messages:**
- "OpenAI service is temporarily unavailable. Please try again in a few moments."
- "Generation timed out after 3 minutes. Try a simpler world concept."

### 5. Generic Errors (`errorType: 'generic'`)
**Triggers:**
- User submits empty prompt
- Unexpected errors

**User Feedback:**
- Icon: ❌
- Title: "Error"
- Error message
- "Try Again" button

## Enhanced Error Display

### Error Card Structure
```
┌─────────────────────────────────────┐
│ [Icon] [Error Title]                │
│ Error message here                  │
│                                     │
│ ┌─────────────────────────────┐   │
│ │ 💡 Tip: Helpful suggestion  │   │
│ └─────────────────────────────┘   │
│                                     │
│ [Quality Score/Missing Fields]      │
│                                     │
│ [Action Button] [Secondary Button]  │
│                                     │
│ ▸ Show debug info                  │
└─────────────────────────────────────┘
```

### Contextual Action Buttons
- **API Key errors:** "Update API Key" button (opens API key dialog)
- **Quality/Parsing errors:** "Regenerate" + "Edit Prompt" buttons
- **Network errors:** "Retry" button
- **Generic errors:** "Try Again" button

### Debug Info Expansion
Collapsed by default, shows:
- Error type
- Full error details JSON
- Browser console reminder

## Automatic Quality Validation

### Multi-Attempt Generation
- Tries up to 2 times to generate a quality world
- Validates each attempt before accepting it
- Uses best result if all attempts fail (with warning)

### Quality Checks
1. **Numerical Details:** Theme should contain at least 3 numbers
2. **Magic Cost:** Should have detailed description (>50 chars)
3. **Content Richness:** World should have >500 words
4. **Required Sections:** All key sections must exist

### Quality Score Penalties
- Missing numerical details: -15%
- Vague magic cost: -20%
- Generic terms without specifics: -10%
- Insufficient detail: -15%
- Missing sections: -10% per section

## Regenerate for Better Quality

### Low Quality Score Warning (<70%)
When a world has quality score below 70%, the sidebar shows:
```
┌─────────────────────────────────┐
│ ✨ Quality Score        65%     │
│                                 │
│ ⚠️ This world could be improved │
│                                 │
│ [🔄 Regenerate for Better Qua...│
│                                 │
│ Tip: Add more specific, unusual │
│ details to your prompt          │
└─────────────────────────────────┘
```

**How it works:**
1. Saves current user input
2. Clears the world
3. Appends "(make it more unique and specific)" to prompt
4. Automatically regenerates

## Chat Error Handling

### Enhanced Chat Errors
- **401 errors:** "Invalid API key. Please update your API key."
- **429 errors:** "Rate limit exceeded. Please wait a moment and try again."
- **Parse errors:** "Could not apply your changes. Try being more specific."

### Visual Error Icons
- 🔑 for API key errors
- ⏱️ for rate limit errors
- ❌ for general errors

### Quality Re-analysis
After successful chat updates, the quality score is recalculated automatically.

## User Benefits

1. **Clear Diagnosis:** Users know exactly what went wrong
2. **Actionable Guidance:** Every error includes a helpful tip
3. **Quick Recovery:** One-click buttons to fix or retry
4. **Quality Awareness:** Users see quality scores and can improve
5. **Transparency:** Debug info available when needed
6. **Progressive Enhancement:** System tries to auto-fix quality issues

## Example User Flows

### Flow 1: Invalid API Key
1. User enters world concept
2. Clicks "Generate World"
3. Gets error: "🔑 API Key Issue - Invalid API key"
4. Sees tip: "Your API key may be incorrect or expired"
5. Clicks "Update API Key" button
6. Updates key and tries again

### Flow 2: Low Quality World
1. System generates world with quality score 65%
2. World appears, but with warning in error box
3. Quality sidebar shows: "⚠️ This world could be improved"
4. User clicks "Regenerate for Better Quality"
5. System tries again with enhanced prompt
6. Gets better result with score 75%+

### Flow 3: Missing Fields
1. AI generates incomplete world (no magic system)
2. Error shows: "📄 Generation Error"
3. Lists: "Missing required fields: magicSystem"
4. Tip: "Try regenerating with a clearer description"
5. User clicks "Regenerate"
6. System tries again automatically

### Flow 4: Network Timeout
1. Generation runs for 3 minutes
2. Request times out
3. Error: "🌐 Connection Issue - Generation timed out"
4. Tip: "Try a simpler world concept"
5. User simplifies prompt and clicks "Retry"

## Technical Implementation

### State Management
```javascript
let error = $state(null);              // Error message
let errorType = $state(null);          // Error category
let errorDetails = $state(null);       // Additional context
```

### Error Setting Pattern
```javascript
error = 'User-friendly message';
errorType = 'api-key' | 'quality' | 'parsing' | 'network' | 'generic';
errorDetails = {
  suggestion: 'Helpful tip for user',
  qualityScore: 65,
  issues: ['list', 'of', 'problems'],
  missingFields: ['field1', 'field2']
};
```

### Regenerate Function
```javascript
function regenerateWorld() {
  error = null;
  errorType = null;
  errorDetails = null;
  generateWorld();
}
```

## Testing Scenarios

To test error handling:

1. **Invalid API Key:** Use wrong key → Should show API key error with update button
2. **Short Response:** Mock API to return <500 chars → Should retry or show quality error
3. **Missing Fields:** Mock parser to fail → Should show parsing error with fields list
4. **Network Error:** Disconnect internet → Should show network error with retry
5. **Low Quality:** Generate very generic world → Should show quality warning with score
6. **Rate Limit:** Exceed quota → Should show rate limit error with helpful message
7. **Chat Error:** Try chat update with bad prompt → Should show inline error in chat

## Future Enhancements

Potential improvements:
1. Add "Copy Error" button for support requests
2. Track error frequency for analytics
3. Add "Report Issue" button for persistent errors
4. Implement exponential backoff for retries
5. Add error recovery suggestions based on error history
6. Show estimated wait time for rate limit errors
7. Add "Safe Mode" that uses simpler prompts
8. Implement offline detection before attempting generation
