# Error Messages Quick Reference

## Error Display Examples

### 1. API Key Error (401)

```
┌────────────────────────────────────────────────────────┐
│  🔑  API Key Issue                                     │
│                                                        │
│  Invalid API key. Please check your OpenAI API        │
│  key and try again.                                    │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 💡 Tip: Your API key may be incorrect or     │    │
│  │ expired. Click "Change API Key" below to      │    │
│  │ update it.                                    │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  [ 🔑 Update API Key ]                                │
│                                                        │
│  ▸ Show debug info                                    │
└────────────────────────────────────────────────────────┘
```

### 2. Rate Limit Error (429)

```
┌────────────────────────────────────────────────────────┐
│  🔑  API Key Issue                                     │
│                                                        │
│  Rate limit exceeded or quota depleted.                │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 💡 Tip: You may have exceeded your API       │    │
│  │ quota or rate limit. Check your OpenAI       │    │
│  │ account dashboard or wait a few minutes.     │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  [ 🔑 Update API Key ]                                │
│                                                        │
│  ▸ Show debug info                                    │
└────────────────────────────────────────────────────────┘
```

### 3. Quality Warning (Low Score)

```
┌────────────────────────────────────────────────────────┐
│  ⚠️   Quality Warning                                  │
│                                                        │
│  Quality check failed. Generated world has some        │
│  issues.                                               │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 💡 Tip: The world was generated but could be  │    │
│  │ improved. You can use it as-is or regenerate  │    │
│  │ for better results.                           │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  Quality Score: 65%                                    │
│                                                        │
│  Issues detected:                                      │
│  • Theme lacks specific numerical details              │
│  • Magic system lacks detailed cost/limitation         │
│  • World lacks sufficient detail (too short)           │
│                                                        │
│  [ 🔄 Regenerate ]  [ ✏️ Edit Prompt ]                │
│                                                        │
│  ▸ Show debug info                                    │
└────────────────────────────────────────────────────────┘
```

### 4. Parsing Error (Missing Fields)

```
┌────────────────────────────────────────────────────────┐
│  📄  Generation Error                                  │
│                                                        │
│  Generated world is missing required fields:           │
│  worldName, magicSystem                                │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 💡 Tip: The AI didn't generate all required  │    │
│  │ elements. Try regenerating with a clearer,    │    │
│  │ more detailed description.                    │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  Missing required fields:                              │
│  • worldName                                           │
│  • magicSystem                                         │
│                                                        │
│  [ 🔄 Regenerate ]  [ ✏️ Edit Prompt ]                │
│                                                        │
│  ▸ Show debug info                                    │
└────────────────────────────────────────────────────────┘
```

### 5. Network Error (Timeout)

```
┌────────────────────────────────────────────────────────┐
│  🌐  Connection Issue                                  │
│                                                        │
│  Generation timed out after 3 minutes.                 │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 💡 Tip: The request took too long. Try a     │    │
│  │ simpler world concept or check your internet  │    │
│  │ connection.                                   │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  [ 🔄 Retry ]                                         │
│                                                        │
│  ▸ Show debug info                                    │
└────────────────────────────────────────────────────────┘
```

### 6. Network Error (Service Unavailable)

```
┌────────────────────────────────────────────────────────┐
│  🌐  Connection Issue                                  │
│                                                        │
│  OpenAI service is temporarily unavailable.            │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 💡 Tip: This is a temporary issue with       │    │
│  │ OpenAI servers. Please try again in a few    │    │
│  │ moments.                                      │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  [ 🔄 Retry ]                                         │
│                                                        │
│  ▸ Show debug info                                    │
└────────────────────────────────────────────────────────┘
```

### 7. Quality Error (Too Short)

```
┌────────────────────────────────────────────────────────┐
│  ⚠️   Quality Warning                                  │
│                                                        │
│  Generated world is too short. The AI may have         │
│  encountered an issue.                                 │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │ 💡 Tip: Try regenerating with a more         │    │
│  │ detailed description, or try a different      │    │
│  │ world concept.                                │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
│  [ 🔄 Regenerate ]  [ ✏️ Edit Prompt ]                │
│                                                        │
│  ▸ Show debug info                                    │
└────────────────────────────────────────────────────────┘
```

## Quality Score Sidebar (Low Score < 70%)

```
┌────────────────────────────────────┐
│ ✨ Quality Score           65%     │
│                                    │
│ 💡 Consider adding more specific   │
│ details and unique elements.       │
│                                    │
│ ▸ 12 clichés detected              │
│   • chosen one (Character Tropes)  │
│   • ancient prophecy (Plot)        │
│   • dark lord (Villain Types)      │
│   • magical artifact (Objects)     │
│   • hidden village (Locations)     │
│   ...and 7 more                    │
│                                    │
│ ─────────────────────────────────  │
│                                    │
│ ⚠️ This world could be improved.   │
│ Try regenerating for better        │
│ results.                           │
│                                    │
│ [ 🔄 Regenerate for Better Quality]│
│                                    │
│ Tip: Add more specific, unusual    │
│ details to your prompt for higher  │
│ quality.                           │
└────────────────────────────────────┘
```

## Chat Error Messages

### API Key Error in Chat
```
You: Add a dragon character
AI: 🔑 Invalid API key. Please update your API key.
```

### Rate Limit Error in Chat
```
You: Add another location
AI: ⏱️ Rate limit exceeded. Please wait a moment and try again.
```

### Parse Error in Chat
```
You: Change the magic system completely
AI: ❌ Could not apply your changes. Try being more specific about what you want to modify.
```

## Error Type Summary

| Icon | Error Type | Trigger | Action Button |
|------|-----------|---------|---------------|
| 🔑 | API Key | 401, 429 | Update API Key |
| ⚠️ | Quality | Low score, too short | Regenerate / Edit Prompt |
| 📄 | Parsing | Missing fields, invalid JSON | Regenerate / Edit Prompt |
| 🌐 | Network | Timeout, 500, 503 | Retry |
| ❌ | Generic | Other errors | Try Again |

## User-Friendly Tips by Error Type

### API Key Errors
- "Your API key may be incorrect or expired. Click 'Change API Key' below to update it."
- "You may have exceeded your API quota or rate limit. Check your OpenAI account dashboard or wait a few minutes."

### Quality Errors
- "The world was generated but could be improved. You can use it as-is or regenerate for better results."
- "Try regenerating with a more detailed description, or try a different world concept."
- "Add more specific, unusual details to your prompt for higher quality."

### Parsing Errors
- "The AI didn't generate all required elements. Try regenerating with a clearer, more detailed description."
- "The AI generated invalid data. Try simplifying your world concept or regenerating."

### Network Errors
- "This is a temporary issue with OpenAI servers. Please try again in a few moments."
- "The request took too long. Try a simpler world concept or check your internet connection."
- "Check your internet connection and try again."

## Automatic Recovery Features

### 1. Auto-Retry on Quality Failure
- First attempt fails quality check
- System shows: "⚠️ Quality check failed, regenerating for better results..."
- Automatically tries again (up to 2 attempts)
- Uses best result if all attempts fail

### 2. Quality Score Warning
- If score < 70%, shows regenerate button in sidebar
- One-click regeneration with enhanced prompt
- Appends "(make it more unique and specific)" to user's input

### 3. Field Validation
- Checks for required fields before accepting world
- Retries automatically if fields missing (first attempt)
- Shows specific missing fields to user (second attempt)

### 4. Length Validation
- Checks if response is too short (< 500 chars)
- Retries automatically if too short (first attempt)
- Shows error with suggestion (second attempt)

## Debug Information

When user expands "Show debug info":

```
Error Type: quality
Details: {
  "qualityScore": 65,
  "issues": [
    "Theme lacks specific numerical details",
    "Magic system lacks detailed cost/limitation"
  ],
  "suggestion": "The world was generated but could be improved..."
}
Check browser console (F12) for detailed logs
```
