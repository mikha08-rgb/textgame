<script>
  // Props
  let { world, apiKey, onContentUpdate } = $props();

  // State
  let isExpanded = $state(false);
  let isGenerating = $state(false);
  let message = $state('');
  let chatHistory = $state([]);
  let error = $state(null);

  // Suggested prompts
  const suggestedPrompts = [
    "Tell me about daily life in [Culture]",
    "Create an interesting character for me",
    "Generate a dangerous or mysterious location",
    "Tell me a legend from this world",
    "How does the magic system work in practice?",
    "What drives conflict in this world?"
  ];

  // Call OpenAI API
  async function callOpenAI(messages) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Send message
  async function sendMessage() {
    if (!message.trim() || isGenerating) return;

    const userMessage = message.trim();
    message = '';
    error = null;

    // Add user message to history
    chatHistory = [...chatHistory, { role: 'user', content: userMessage }];

    isGenerating = true;

    try {
      // Build context for AI
      const systemPrompt = `You are a worldbuilding assistant for Story World Studio. You help users explore and expand their fantasy worlds through natural, engaging conversation.

You have access to the user's world (provided in context). Your role is to:
1. Answer questions about the world using the provided context
2. Generate new content (characters, locations, legends) when requested
3. Expand existing content with more detail
4. Maintain consistency with established lore

IMPORTANT RESPONSE FORMAT:
- ALWAYS respond conversationally and naturally first
- When creating new content, describe it in prose that's engaging to read
- THEN, at the very end, include the structured JSON data in a code block
- The user will only see your conversational response - the JSON is extracted automatically

When generating content, describe it naturally, then include JSON at the end. Use this format:

For characters:
\`\`\`json
{
  "type": "character",
  "data": {
    "name": "Character Name",
    "age": 30,
    "role": "Their occupation",
    "culture": "Culture they belong to",
    "physicalDescription": "Detailed appearance...",
    "personality": "Personality traits...",
    "goal": "What they want...",
    "distinctiveTrait": "Memorable quirk...",
    "secret": "Hidden truth...",
    "backstory": "Their history..."
  }
}
\`\`\`

For locations:
\`\`\`json
{
  "type": "location",
  "data": {
    "name": "Location Name",
    "type": "tavern/temple/ruin/etc",
    "culture": "Culture that controls it",
    "description": "Physical description with sensory details...",
    "notableFeatures": "Distinctive aspects - magical phenomena, historical significance, unusual architecture...",
    "inhabitants": "Who lives/works here...",
    "currentSituation": "Current events...",
    "memorableDetails": ["Detail 1", "Detail 2", "Detail 3"]
  }
}
\`\`\`

For legends:
\`\`\`json
{
  "type": "legend",
  "data": {
    "title": "Legend Title",
    "timeframe": "When it's set",
    "culturalOrigin": "Which culture tells it",
    "story": "The full narrative...",
    "moralOrLesson": "What it teaches...",
    "culturalSignificance": "How it affects present day...",
    "truthBehind": "What really happened..."
  }
}
\`\`\`

For questions or general responses, just reply conversationally without JSON.

EXAMPLE RESPONSE (for generating a location):
"I've created a dangerous location for you - the Stormcloaked Abyss. This treacherous rift lies hidden in the uncharted territories, shrouded in perpetual storms and swirling with dark clouds and lightning. Ancient runes carved into the sheer cliffs hint at forgotten civilizations. The chaotic magical energy here makes spells unpredictable and dangerous, with winds turning hostile without warning.

Aetherial wraiths are said to haunt the depths, and brave explorers occasionally spot elusive skybeasts adapted to the harsh environment. Recent disturbances have drawn scholars and treasure hunters, though many have gone missing..."

\`\`\`json
{
  "type": "location",
  "data": {
    "name": "Stormcloaked Abyss",
    ...
  }
}
\`\`\`

WORLD CONTEXT:
${JSON.stringify(world, null, 2)}`;

      const messages = [
        { role: 'system', content: systemPrompt },
        // Include last 5 messages for context
        ...chatHistory.slice(-5),
        { role: 'user', content: userMessage }
      ];

      const aiResponse = await callOpenAI(messages);

      // Check if response contains structured data and extract it
      let displayContent = aiResponse;
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);

      if (jsonMatch) {
        // Remove the JSON block from display content
        displayContent = aiResponse.replace(/```json\n[\s\S]*?\n```/, '').trim();

        try {
          const structuredData = JSON.parse(jsonMatch[1]);
          // Notify parent component about new content
          if (onContentUpdate) {
            onContentUpdate(structuredData);
          }
        } catch (e) {
          console.error('Failed to parse structured data:', e);
        }
      }

      // Add cleaned response to history (without JSON)
      chatHistory = [...chatHistory, { role: 'assistant', content: displayContent }];

      // Auto-scroll to bottom
      setTimeout(() => {
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }, 100);

    } catch (err) {
      error = `Failed to send message: ${err.message}`;
      console.error(err);
      chatHistory = [...chatHistory, { role: 'error', content: error }];
    } finally {
      isGenerating = false;
    }
  }

  // Use suggested prompt
  function useSuggestedPrompt(prompt) {
    // Replace placeholders with actual culture names if available
    let finalPrompt = prompt;
    if (world && world.cultures && world.cultures.length > 0) {
      finalPrompt = prompt.replace('[Culture]', world.cultures[0].name);
    }
    message = finalPrompt;
  }

  // Handle Enter key
  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }
</script>

<!-- Chat Interface -->
<div class="chat-interface fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 {isExpanded ? 'h-2/3' : 'h-16'}">
  <!-- Header / Collapse Bar -->
  <button
    onclick={() => isExpanded = !isExpanded}
    class="w-full bg-purple-600 text-white px-6 py-4 flex items-center justify-between hover:bg-purple-700 transition-colors shadow-lg"
  >
    <div class="flex items-center gap-3">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      <span class="font-semibold text-lg">
        {#if chatHistory.length === 0}
          Ask about your world...
        {:else}
          Chat with Your World ({chatHistory.filter(m => m.role !== 'system').length} messages)
        {/if}
      </span>
    </div>
    <svg
      class="w-5 h-5 transition-transform duration-300 {isExpanded ? 'rotate-180' : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if isExpanded}
    <!-- Chat Content -->
    <div class="bg-white border-t-4 border-purple-600 flex flex-col h-[calc(100%-4rem)] shadow-2xl">
      <!-- Messages Area -->
      <div class="chat-messages flex-1 overflow-y-auto p-4 space-y-4">
        {#if chatHistory.length === 0}
          <!-- Suggested Prompts -->
          <div class="space-y-3">
            <p class="text-gray-600 text-center mb-4">
              What would you like to explore in your world?
            </p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              {#each suggestedPrompts as prompt}
                <button
                  onclick={() => useSuggestedPrompt(prompt)}
                  class="px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors text-left text-sm border border-purple-200"
                >
                  {prompt}
                </button>
              {/each}
            </div>
          </div>
        {:else}
          <!-- Chat History -->
          {#each chatHistory as msg}
            {#if msg.role === 'user'}
              <div class="flex justify-end">
                <div class="bg-purple-600 text-white px-4 py-2 rounded-lg max-w-3xl">
                  <p class="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            {:else if msg.role === 'assistant'}
              <div class="flex justify-start">
                <div class="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg max-w-3xl">
                  <p class="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            {:else if msg.role === 'error'}
              <div class="flex justify-center">
                <div class="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg">
                  <p class="text-sm">{msg.content}</p>
                </div>
              </div>
            {/if}
          {/each}

          <!-- Typing Indicator -->
          {#if isGenerating}
            <div class="flex justify-start">
              <div class="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="flex gap-1">
                    <div class="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                  </div>
                  <span class="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            </div>
          {/if}
        {/if}
      </div>

      <!-- Input Area -->
      <div class="border-t bg-gray-50 p-4">
        {#if error}
          <div class="mb-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
            <p class="text-red-800 text-sm">{error}</p>
          </div>
        {/if}

        <div class="flex gap-3">
          <input
            type="text"
            bind:value={message}
            onkeypress={handleKeyPress}
            placeholder="Ask a question or request new content..."
            disabled={isGenerating}
            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onclick={sendMessage}
            disabled={isGenerating || !message.trim()}
            class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {#if isGenerating}
              <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            {:else}
              Send
            {/if}
          </button>
        </div>

        <p class="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .chat-messages::-webkit-scrollbar {
    width: 8px;
  }

  .chat-messages::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .chat-messages::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  .chat-messages::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>
