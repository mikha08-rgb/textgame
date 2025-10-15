<script>
  import {
    getCultureExpansionPrompt,
    getCharacterGenerationPrompt,
    getLocationGenerationPrompt,
    getLegendGenerationPrompt,
    parseExpansionResponse,
    worldExpansionPrompt
  } from '../prompts/worldExpansion.js';
  import { generateWithConstitutionalAI } from '../lib/constitutionalAI.js';
  import { getGenreAwarePrompt } from '../prompts/genreAwareGeneration.js';
  import { detectGenre, getGenreName } from '../lib/genreSystem.js';
  import { detectCliches } from '../lib/clicheDetector.js';
  import { detectMagicStyle, validateMagicSystem } from '../lib/sandersonLaws.js';
  import {
    analyzeConceptAndGenerateQuestions,
    buildGenerationContext,
    createContextualPrompt,
    identifyGenericElements
  } from '../lib/collaborativeWorldbuilding.js';

  // Props
  let { apiKey, onClearKey } = $props();

  // Enhanced state for progressive generation
  let worldData = $state({
    // Core world (quick generation)
    name: null,
    coreHook: '',
    geography: '',
    magicSystem: null,
    conflict: '',
    theme: '',

    // Expandable elements (track what's been generated)
    cultures: [], // [{name, overview, values, expanded: false, fullDetail: null}, ...]
    characters: [],
    locations: [],
    legends: [],

    // Full description for reference
    fullDescription: '',
  });

  let chatHistory = $state([]);
  let message = $state('');
  let isGenerating = $state(false);
  let error = $state(null);
  let currentlyExpanding = $state(null); // Track which element is being expanded
  let streamingContent = $state(''); // For real-time streaming display
  let scrollInterval = null; // For auto-scroll during streaming

  // Constitutional AI settings
  let enableQualityCritique = $state(true); // Toggle for Constitutional AI
  let showQualityMetrics = $state(false); // Show quality scores in UI
  let qualityMetrics = $state(null); // Store critique results

  // Phase 1 enhancements
  let detectedGenre = $state(null); // Auto-detected genre from user input
  let detectedMagicStyle = $state(null); // Auto-detected magic style
  let clicheAnalysis = $state(null); // Cliché detection results
  let magicValidation = $state(null); // Magic system validation results

  // Collaborative Brainstorming (NEW)
  let interviewMode = $state(false); // Are we in interview/questioning mode?
  let interviewQuestions = $state([]); // Questions to ask
  let currentQuestionIndex = $state(0); // Which question are we on?
  let interviewAnswers = $state({}); // User's answers
  let initialConcept = $state(''); // User's original vague idea

  // Initial suggestions - AVOID CLICHÉS
  const starterPrompts = [
    "A volcanic archipelago where obsidian trade fuels merchant empires",
    "Floating islands connected by massive living vines that require sacrifice to grow",
    "A desert where water is solid and sand flows like liquid",
    "Cities built inside the ribcages of dead titans",
    "A world where music physically shapes matter and silence is lethal",
  ];

  // Call OpenAI API (non-streaming)
  async function callOpenAI(messages, forceJSON = false, maxTokens = 12000, timeout = 300000) {
    const requestBody = {
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.85,
      max_tokens: maxTokens,
    };

    if (forceJSON) {
      requestBody.response_format = { type: 'json_object' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout / 1000} seconds. Please try again.`);
      }
      throw err;
    }
  }

  // Call OpenAI API with streaming support
  async function callOpenAIStreaming(messages, forceJSON = false, maxTokens = 12000, timeout = 300000, onChunk = null) {
    const requestBody = {
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.85,
      max_tokens: maxTokens,
      stream: true, // Enable streaming
    };

    if (forceJSON) {
      requestBody.response_format = { type: 'json_object' };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      // Read streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      // Start auto-scroll interval
      if (onChunk && !scrollInterval) {
        scrollInterval = setInterval(() => {
          const chatMessages = document.querySelector('.chat-messages');
          if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
          }
        }, 100);
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                if (onChunk) {
                  onChunk(content, fullContent); // Call callback with new chunk and full content so far
                }
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

      // Clear auto-scroll interval
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }

      return fullContent;
    } catch (err) {
      clearTimeout(timeoutId);
      // Clear auto-scroll interval on error
      if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
      }
      if (err.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout / 1000} seconds. Please try again.`);
      }
      throw err;
    }
  }

  // Send message
  async function sendMessage() {
    if (!message.trim() || isGenerating) return;

    const userMessage = message.trim();
    message = '';
    error = null;

    chatHistory = [...chatHistory, { role: 'user', content: userMessage }];
    isGenerating = true;

    try {
      // CASE 1: Initial concept (no world exists, not in interview yet)
      const isInitialConcept = !worldData.name && !interviewMode && chatHistory.filter(m => m.role === 'user').length === 1;

      if (isInitialConcept) {
        await startInterview(userMessage);
      }
      // CASE 2: In interview mode (collecting answers)
      else if (interviewMode) {
        await collectInterviewAnswer(userMessage);
      }
      // CASE 3: World exists - normal conversation
      else {
        await handleConversation(userMessage);
      }

      setTimeout(() => {
        const chatMessages = document.querySelector('.chat-messages');
        if (chatMessages) {
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }, 100);

    } catch (err) {
      error = `Failed to process message: ${err.message}`;
      console.error(err);
      chatHistory = [...chatHistory, { role: 'error', content: error }];
    } finally {
      isGenerating = false;
    }
  }

  // Detect user intent with AI (FLEXIBLE understanding)
  async function detectUserIntent(userMessage, currentQuestion, existingAnswers) {
    const lowerMsg = userMessage.toLowerCase().trim();

    // Fast path: Simple cases with keyword matching
    if (lowerMsg === 'skip' || lowerMsg === 'pass' || lowerMsg === 'next') {
      return { type: 'skip' };
    }

    if (lowerMsg === 'yes' || lowerMsg === 'ok' || lowerMsg === 'sure' || lowerMsg === 'yeah' ||
        lowerMsg === 'yep' || lowerMsg === 'sounds good' || lowerMsg === 'that works') {
      return { type: 'confirm_suggestion' };
    }

    if (lowerMsg === 'no' || lowerMsg === 'nope' || lowerMsg === 'try again' ||
        lowerMsg === 'different' || lowerMsg === 'another') {
      return { type: 'reject_suggestion' };
    }

    // Complex cases: Use AI to understand intent
    const allQuestions = interviewQuestions.map(q => `${q.key}: ${q.question.substring(0, 100)}...`).join('\n');
    const context = `I'm conducting an interview to gather details for worldbuilding.

Current question being asked: ${currentQuestion.key}
"${currentQuestion.question}"

All interview questions:
${allQuestions}

User's response: "${userMessage}"

Analyze the user's intent and respond with ONLY a JSON object (no markdown, no explanation):

{
  "type": "skip|ai_generate|confirm_suggestion|reject_suggestion|multi_part_answer|clarification_needed|direct_answer",
  "extractedAnswer": "if direct_answer, extract the core answer",
  "answers": {if multi_part_answer, map of questionKey to answer},
  "message": "if clarification_needed, what to ask"
}

Examples:
- "I want you to decide" → {"type": "ai_generate"}
- "Yes that's perfect" → {"type": "confirm_suggestion"}
- "No try something else" → {"type": "reject_suggestion"}
- "Can we skip this?" → {"type": "skip"}
- "For unique hook: volcanic eruptions. For conflict: resource wars" → {"type": "multi_part_answer", "answers": {"uniqueHook": "volcanic eruptions", "centralTension": "resource wars"}}
- "The unique thing is volcanoes erupt every 8 days" → {"type": "direct_answer", "extractedAnswer": "Volcanoes erupt every 8 days"}
- "huh?" → {"type": "clarification_needed", "message": "Could you clarify..."}`;

    try {
      const response = await callOpenAI([
        { role: 'system', content: 'You are an intent classifier. Output ONLY valid JSON, no markdown or explanation.' },
        { role: 'user', content: context }
      ], false, 300);

      // Parse JSON response
      let cleaned = response.trim();
      // Remove markdown fences if present
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const intent = JSON.parse(cleaned);

      return intent;
    } catch (err) {
      console.error('Intent detection failed:', err);
      // Fallback: treat as direct answer
      return { type: 'direct_answer', extractedAnswer: userMessage };
    }
  }

  // Generate an AI answer for a specific question
  async function generateAnswerForQuestion(question, concept, existingAnswers) {
    // Build context from what we know so far
    const context = `I'm helping someone build a world based on this concept: "${concept}"

So far, they've answered:
${Object.entries(existingAnswers).filter(([k]) => !k.includes('_pending')).map(([key, val]) => `- ${key}: ${val}`).join('\n')}

Now I need to help them answer this question: ${question.question}

Generate a SHORT, SPECIFIC, ORIGINAL answer (1-2 sentences) that:
1. Fits with their existing answers
2. Is concrete and measurable (include numbers, examples, specifics)
3. Avoids clichés
4. Feels unique to their concept

Just give the answer directly, no explanation or preamble.`;

    try {
      const response = await callOpenAI([
        { role: 'system', content: 'You are a creative worldbuilding partner helping users flesh out unique ideas. Give SHORT, SPECIFIC answers.' },
        { role: 'user', content: context }
      ], false, 150); // Short response

      return response.trim();
    } catch (err) {
      throw new Error('Failed to generate suggestion');
    }
  }

  // Start interview with user's vague concept
  async function startInterview(userConcept) {
    initialConcept = userConcept;

    // Analyze concept and generate questions
    const analysis = analyzeConceptAndGenerateQuestions(userConcept);
    interviewQuestions = analysis.questions;
    interviewMode = true;
    currentQuestionIndex = 0;

    // Friendly introduction
    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: `Great starting point! 🌟

I love working collaboratively to build truly original worlds. Instead of generating something generic right away, let's **flesh out your idea together** through a few quick questions.

${analysis.summary} This will only take a few minutes, and the result will be **much more unique and detailed**.

**Question 1 of ${analysis.questions.length}:**

${analysis.questions[0].question}

*💡 Tip: You can type "skip" to pass, or say "help me" / "you decide" if you want me to generate something for this part!*`
    }];

    isGenerating = false;
  }

  // Collect answer to current interview question (FLEXIBLE VERSION)
  async function collectInterviewAnswer(userAnswer) {
    const currentQ = interviewQuestions[currentQuestionIndex];
    const lowerAnswer = userAnswer.toLowerCase().trim();

    // FLEXIBLE INTENT DETECTION: Use AI to understand what user wants
    const intent = await detectUserIntent(userAnswer, currentQ, interviewAnswers);

    // Handle based on detected intent
    switch (intent.type) {
      case 'skip':
        if (!currentQ.isRequired) {
          chatHistory = [...chatHistory, {
            role: 'assistant',
            content: `No problem, we'll skip that one! ⏭️`
          }];
        } else {
          chatHistory = [...chatHistory, {
            role: 'assistant',
            content: `This one's important for creating a unique world - I need an answer to continue. Give it your best shot! 💪\n\n${currentQ.question}`
          }];
          isGenerating = false;
          return;
        }
        break;

      case 'ai_generate':
        chatHistory = [...chatHistory, {
          role: 'assistant',
          content: `Got it! I'll create something original for this part. Let me think... 🤔`
        }];

        try {
          const aiAnswer = await generateAnswerForQuestion(currentQ, initialConcept, interviewAnswers);

          chatHistory = [...chatHistory, {
            role: 'assistant',
            content: `How about this:\n\n**${aiAnswer}**\n\nDoes that work for you, or would you like me to try something else?`
          }];

          interviewAnswers[`${currentQ.key}_pending`] = aiAnswer;
          isGenerating = false;
          return;
        } catch (err) {
          console.error('Failed to generate answer:', err);
          chatHistory = [...chatHistory, {
            role: 'assistant',
            content: `Hmm, I'm having trouble generating that. Could you give me a rough idea to work with?`
          }];
          isGenerating = false;
          return;
        }

      case 'confirm_suggestion':
        if (interviewAnswers[`${currentQ.key}_pending`]) {
          interviewAnswers[currentQ.key] = interviewAnswers[`${currentQ.key}_pending`];
          delete interviewAnswers[`${currentQ.key}_pending`];

          chatHistory = [...chatHistory, {
            role: 'assistant',
            content: `Excellent! ✅ Let's continue.`
          }];
        } else {
          // No pending suggestion, treat as answer
          interviewAnswers[currentQ.key] = userAnswer;
          chatHistory = [...chatHistory, {
            role: 'assistant',
            content: `Perfect! ✅ That gives me something concrete to work with.`
          }];
        }
        break;

      case 'reject_suggestion':
        if (interviewAnswers[`${currentQ.key}_pending`]) {
          delete interviewAnswers[`${currentQ.key}_pending`];

          chatHistory = [...chatHistory, {
            role: 'assistant',
            content: `No problem! Let me try again. 🤔`
          }];

          // Regenerate
          try {
            const aiAnswer = await generateAnswerForQuestion(currentQ, initialConcept, interviewAnswers);
            chatHistory = [...chatHistory, {
              role: 'assistant',
              content: `How about this instead:\n\n**${aiAnswer}**\n\nBetter?`
            }];
            interviewAnswers[`${currentQ.key}_pending`] = aiAnswer;
            isGenerating = false;
            return;
          } catch (err) {
            chatHistory = [...chatHistory, {
              role: 'assistant',
              content: `Or just tell me what you want and I'll use that!`
            }];
            isGenerating = false;
            return;
          }
        } else {
          // Treat as answer
          interviewAnswers[currentQ.key] = userAnswer;
          chatHistory = [...chatHistory, {
            role: 'assistant',
            content: `Got it! ✅`
          }];
        }
        break;

      case 'multi_part_answer':
        // User answered multiple questions at once
        // intent.answers = { questionKey: answer, ... }
        let answeredCurrent = false;
        for (const [key, answer] of Object.entries(intent.answers)) {
          interviewAnswers[key] = answer;
          if (key === currentQ.key) answeredCurrent = true;
        }

        const answeredCount = Object.keys(intent.answers).length;
        chatHistory = [...chatHistory, {
          role: 'assistant',
          content: `Great! I got ${answeredCount} answer${answeredCount > 1 ? 's' : ''} from that. ✅\n\n${Object.entries(intent.answers).map(([k, v]) => `- ${k}: "${v.substring(0, 60)}${v.length > 60 ? '...' : ''}"`).join('\n')}`
        }];

        // Skip ahead if they answered future questions
        if (answeredCurrent) {
          // Move to next unanswered question
          while (currentQuestionIndex < interviewQuestions.length - 1 &&
                 interviewAnswers[interviewQuestions[currentQuestionIndex].key]) {
            currentQuestionIndex++;
          }
        }
        break;

      case 'clarification_needed':
        chatHistory = [...chatHistory, {
          role: 'assistant',
          content: intent.message || `I'm not quite sure what you mean. Could you clarify?\n\nTo help: ${currentQ.question.substring(0, 200)}...`
        }];
        isGenerating = false;
        return;

      case 'direct_answer':
      default:
        // Clear any pending suggestion
        if (interviewAnswers[`${currentQ.key}_pending`]) {
          delete interviewAnswers[`${currentQ.key}_pending`];
        }

        // Use extracted answer if available, otherwise use raw input
        const finalAnswer = intent.extractedAnswer || userAnswer;
        interviewAnswers[currentQ.key] = finalAnswer;

        chatHistory = [...chatHistory, {
          role: 'assistant',
          content: `Perfect! ✅ That gives me something concrete to work with.`
        }];
        break;
    }

    // Move to next question
    currentQuestionIndex++;

    // More questions?
    if (currentQuestionIndex < interviewQuestions.length) {
      const nextQ = interviewQuestions[currentQuestionIndex];

      chatHistory = [...chatHistory, {
        role: 'assistant',
        content: `**Question ${currentQuestionIndex + 1} of ${interviewQuestions.length}:**

${nextQ.question}

${!nextQ.isRequired ? '*Type "skip" to pass, or say "help me" if you want me to generate something!*' : '*Say "help me" or "you decide" if you want me to generate something for this!*'}`
      }];
      isGenerating = false;
    } else {
      // Interview complete - generate world!
      chatHistory = [...chatHistory, {
        role: 'assistant',
        content: `🎉 Excellent! I now have everything I need to create something truly original.

Let me generate your world using **your specific ideas**...`
      }];

      await generateWorldFromInterview();
    }
  }

  // Generate world using interview context
  async function generateWorldFromInterview() {
    // Build context from answers
    const context = buildGenerationContext(initialConcept, interviewAnswers);

    // Detect genre and magic style
    const genreDetection = detectGenre(initialConcept);
    detectedGenre = genreDetection.primary;
    const genreName = getGenreName(detectedGenre);

    const magicDetection = detectMagicStyle(initialConcept);
    detectedMagicStyle = magicDetection.style;

    // Add a streaming message placeholder
    const streamingMessageIndex = chatHistory.length;
    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: '',
      isStreaming: true
    }];

    streamingContent = ''; // Reset

    // Use FULL world generation prompt with interview context integrated
    const { worldGenerationPrompt } = await import('../prompts/worldGeneration.js');

    // Enhance the system prompt with interview context
    const baseSystemPrompt = worldGenerationPrompt.systemPrompt;
    const enhancedSystemPrompt = `${baseSystemPrompt}

# USER-PROVIDED CONTEXT FROM INTERVIEW

You gathered the following specific details from the user. INTEGRATE THESE EXACTLY into your world generation:

${context}

These are the user's ideas - treat them as sacred. Build the world around these specific details.`;

    const userPrompt = worldGenerationPrompt.getUserPrompt();

    // Use streaming version with FULL 16K token budget
    const response = await callOpenAIStreaming([
      { role: 'system', content: enhancedSystemPrompt },
      { role: 'user', content: userPrompt }
    ], true, 16000, 180000, (chunk, fullContentSoFar) => {
      // Update streaming message in real-time
      streamingContent = fullContentSoFar;
      chatHistory[streamingMessageIndex].content = fullContentSoFar;
      chatHistory = [...chatHistory]; // Trigger reactivity
    });

    // Remove streaming flag when done
    chatHistory[streamingMessageIndex].isStreaming = false;
    chatHistory = [...chatHistory]; // Trigger reactivity

    // NEW: Apply Constitutional AI critique if enabled
    let finalResponse = response;
    qualityMetrics = null;

    if (enableQualityCritique) {
      chatHistory = [...chatHistory, {
        role: 'assistant',
        content: '🔍 Reviewing quality and making improvements...'
      }];

      try {
        const result = await generateWithConstitutionalAI(
          async () => response,
          callOpenAI, // Non-streaming for critique/revision
          'initial world',
          {
            qualityThreshold: 8.0,
            maxRevisions: 1,
            onProgress: (progress) => {
              // Update chat with progress
              const lastMsg = chatHistory[chatHistory.length - 1];
              if (progress.step === 'critique') {
                lastMsg.content = '🔍 Evaluating quality...';
              } else if (progress.step === 'revise' && progress.status === 'in_progress') {
                lastMsg.content = '✨ Improving based on critique...';
              }
              chatHistory = [...chatHistory];
            }
          }
        );

        finalResponse = result.finalContent;
        qualityMetrics = result.critique;

        if (result.revised) {
          chatHistory[chatHistory.length - 1].content = `✅ Quality improved! Score: ${result.critique.overallScore.toFixed(1)}/10`;
        } else {
          chatHistory[chatHistory.length - 1].content = `✅ Quality check passed! Score: ${result.critique.overallScore.toFixed(1)}/10`;
        }
      } catch (err) {
        console.error('Quality check failed:', err);
        // Continue with original response if critique fails
        chatHistory[chatHistory.length - 1].content = '⚠️ Quality check skipped (error occurred)';
      }
    }

    // Parse final response using robust world generation parser
    let worldFoundation;
    try {
      // Use the same parser as GameInitializer for consistency
      const { parseWorldGenerationResponse } = await import('../prompts/worldGeneration.js');
      const parseResult = parseWorldGenerationResponse(finalResponse);

      worldFoundation = parseResult.world;

      console.log('[Interview JSON Parse] Successfully parsed world:', worldFoundation.worldName);

      // ✅ FIX: Remove the raw JSON streaming message now that we've parsed it successfully
      // Only keep the formatted display version
      chatHistory.splice(streamingMessageIndex, 1);
      chatHistory = [...chatHistory]; // Trigger reactivity

    } catch (parseError) {
      console.error('[Interview JSON Parse] Parsing failed:', parseError);
      console.error('[Interview JSON Parse] Full response length:', finalResponse.length);
      console.error('[Interview JSON Parse] Response preview (first 1000 chars):', finalResponse.substring(0, 1000));
      console.error('[Interview JSON Parse] Response end (last 500 chars):', finalResponse.substring(finalResponse.length - 500));

      error = `Failed to parse world data. The AI generated invalid JSON. Please try again.\n\nError: ${parseError.message}`;
      isGenerating = false;
      interviewMode = false; // Reset interview state
      return;
    }

    // Store in worldData - now includes ALL generated content
    worldData.name = worldFoundation.worldName;
    worldData.coreHook = worldFoundation.tagline || worldFoundation.coreHook;
    worldData.theme = worldFoundation.theme;
    worldData.geography = worldFoundation.geography;
    worldData.magicSystem = worldFoundation.magicSystem;
    worldData.conflict = worldFoundation.conflicts?.primary || worldFoundation.conflict;
    worldData.history = worldFoundation.history;
    worldData.economy = worldFoundation.economy;
    worldData.dailyLife = worldFoundation.dailyLife;
    worldData.uniqueFeature = worldFoundation.uniqueFeature;
    worldData.secrets = worldFoundation.secrets;

    // Cultures - mark as already generated with full details
    worldData.cultures = worldFoundation.cultures.map(c => ({
      ...c,
      expanded: true, // Already fully detailed from initial generation
      fullDetail: c, // Store the full culture data
      description: c.description, // Needed for expansion API
      overview: c.description // Backward compatibility
    }));

    // Characters - already generated!
    worldData.characters = worldFoundation.characters || [];

    // Locations - already generated!
    worldData.locations = worldFoundation.locations || [];

    // Legends - already generated!
    worldData.legends = worldFoundation.legends || [];

    // Phase 1: Run cliché detection on generated content
    try {
      const worldText = finalResponse; // Use final response for detection
      clicheAnalysis = detectCliches(worldText, detectedGenre);

      if (clicheAnalysis.clicheCount > 0) {
        console.log(`[Cliché Detection] Found ${clicheAnalysis.clicheCount} clichés (score: ${clicheAnalysis.originalityScore}/10)`);
      }
    } catch (err) {
      console.error('[Cliché Detection] Error:', err);
    }

    // Phase 1: Validate magic system
    try {
      if (worldData.magicSystem) {
        magicValidation = validateMagicSystem(worldData.magicSystem, detectedMagicStyle);
        console.log(`[Magic Validation] Style: ${detectedMagicStyle}, Valid: ${magicValidation.valid}, Score: ${magicValidation.score}/10`);
      }
    } catch (err) {
      console.error('[Magic Validation] Error:', err);
    }

    // Check for generic elements and offer refinement
    const genericIssues = identifyGenericElements(worldData);

    // Add success message and interactive suggestions
    let successMessage = `---

✨ **World Created: "${worldData.name}"** ✨

**👉 Check out your world details on the right side!**

You can now:
${worldData.cultures.map(c => `- 📖 "Expand on ${c.name}" - Deep dive into their culture`).join('\n')}
- 👤 "Create a character" - Generate a detailed NPC
- 🏛️ "Generate a location" - Add cities, landmarks, ruins
- 📜 "Create a legend" - Add myths and folklore
- 💬 Or ask anything! Example: "What do people eat?", "How does trade work?"`;

    // Add refinement suggestions if issues found
    if (genericIssues.length > 0) {
      successMessage += `\n\n---

⚠️ **I noticed a few things that might feel generic:**

${genericIssues.slice(0, 3).map(issue => `- **${issue.element}**: ${issue.problem} - ${issue.suggestion}`).join('\n')}

Would you like me to improve any of these?`;
    }

    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: successMessage
    }];

    // Exit interview mode
    interviewMode = false;
    isGenerating = false;
  }

  // Generate initial world - QUICK VERSION (core only)
  async function generateInitialWorld(userPrompt) {
    // Phase 1: Detect genre and magic style from user input
    const genreDetection = detectGenre(userPrompt);
    detectedGenre = genreDetection.primary;
    const genreName = getGenreName(detectedGenre);

    const magicDetection = detectMagicStyle(userPrompt);
    detectedMagicStyle = magicDetection.style;

    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: `Creating your ${genreName.toLowerCase()} world's foundation... This will be quick!${genreDetection.confidence > 0.7 ? ` (Detected: ${genreName}${magicDetection.detected ? `, ${magicDetection.style} magic` : ''})` : ''}`
    }];

    // Add a streaming message placeholder
    const streamingMessageIndex = chatHistory.length;
    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: '',
      isStreaming: true
    }];

    streamingContent = ''; // Reset

    // Use genre-aware prompt system (Phase 1 integration)
    const genrePrompt = getGenreAwarePrompt(userPrompt, detectedGenre);

    // Combine genre-aware system prompt with quick foundation instruction
    const systemPrompt = `${genrePrompt.systemPrompt}

MISSION: Generate the CORE ESSENTIALS only - just enough to spark imagination and allow user-directed expansion.

Generate a world foundation with:
1. **World Name**: Evocative, memorable (avoid "The" prefix)
2. **Core Hook** (50-100 words): The ONE thing that makes this world unique
3. **Geography Overview** (100-150 words): Physical setting with specific distances, populations, climate patterns
4. **Magic/Power System** (100-150 words): Core rules, specific costs, measurable limitations, who regulates it
5. **Central Conflict** (75-100 words): Complex tension with valid perspectives on both sides (not good vs evil)
6. **Culture Summaries** (3 cultures, 75-100 words each): Brief overview with specific customs, named settlements, core values

OUTPUT AS VALID JSON (critical - must be parseable):
{
  "worldName": "string",
  "coreHook": "string (50-100 words)",
  "geography": "string (100-150 words with specific numbers)",
  "magicSystem": {
    "name": "string (avoid generic names)",
    "description": "string (100-150 words with costs and limits)"
  },
  "conflict": "string (75-100 words with nuanced perspectives)",
  "cultures": [
    {
      "name": "string (specific, not 'The [Adj] [Noun]')",
      "overview": "string (75-100 words with concrete details)",
      "values": "string (3-5 key values)"
    }
  ]
}

CRITICAL:
- Keep it BRIEF but SPECIFIC
- Output ONLY valid JSON with proper quotes and commas
- NO markdown fences (no code blocks)
- Ensure all quotes are closed and all braces matched`;

    // Use streaming version with callback
    const response = await callOpenAIStreaming([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], true, 4000, 120000, (chunk, fullContentSoFar) => {
      // Update streaming message in real-time
      streamingContent = fullContentSoFar;
      chatHistory[streamingMessageIndex].content = fullContentSoFar;
      chatHistory = [...chatHistory]; // Trigger reactivity
    });

    // Remove streaming flag when done
    chatHistory[streamingMessageIndex].isStreaming = false;
    chatHistory = [...chatHistory]; // Trigger reactivity

    // NEW: Apply Constitutional AI critique if enabled
    let finalResponse = response;
    qualityMetrics = null;

    if (enableQualityCritique) {
      chatHistory = [...chatHistory, {
        role: 'assistant',
        content: '🔍 Reviewing quality and making improvements...'
      }];

      try {
        const result = await generateWithConstitutionalAI(
          async () => response,
          callOpenAI, // Non-streaming for critique/revision
          'initial world',
          {
            qualityThreshold: 8.0,
            maxRevisions: 1,
            onProgress: (progress) => {
              // Update chat with progress
              const lastMsg = chatHistory[chatHistory.length - 1];
              if (progress.step === 'critique') {
                lastMsg.content = '🔍 Evaluating quality...';
              } else if (progress.step === 'revise' && progress.status === 'in_progress') {
                lastMsg.content = '✨ Improving based on critique...';
              }
              chatHistory = [...chatHistory];
            }
          }
        );

        finalResponse = result.finalContent;
        qualityMetrics = result.critique;

        if (result.revised) {
          chatHistory[chatHistory.length - 1].content = `✅ Quality improved! Score: ${result.critique.overallScore.toFixed(1)}/10`;
        } else {
          chatHistory[chatHistory.length - 1].content = `✅ Quality check passed! Score: ${result.critique.overallScore.toFixed(1)}/10`;
        }
      } catch (err) {
        console.error('Quality check failed:', err);
        // Continue with original response if critique fails
        chatHistory[chatHistory.length - 1].content = '⚠️ Quality check skipped (error occurred)';
      }
    }

    // Parse final response with robust error handling
    let worldFoundation;
    try {
      // Clean up common JSON formatting issues
      let cleanedJSON = finalResponse.trim();

      // Remove markdown fences if present
      cleanedJSON = cleanedJSON.replace(/```json\n?/g, '');
      cleanedJSON = cleanedJSON.replace(/```\n?/g, '');
      cleanedJSON = cleanedJSON.replace(/^json\n?/i, ''); // Sometimes they just write "json" at the start

      // Find the actual JSON object (look for outermost braces)
      const firstBrace = cleanedJSON.indexOf('{');
      const lastBrace = cleanedJSON.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanedJSON = cleanedJSON.substring(firstBrace, lastBrace + 1);
      }

      // Fix common issues: trailing commas
      cleanedJSON = cleanedJSON.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas

      // Fix unescaped newlines in strings (replace literal newlines with \n)
      // This is a heuristic - won't catch all cases but helps with common issues
      cleanedJSON = cleanedJSON.replace(/:\s*"([^"]*)\n([^"]*)"(\s*[,}])/g, (match, before, after, end) => {
        return `: "${before}\\n${after}"${end}`;
      });

      console.log('[Quick Gen JSON Parse] Attempting to parse cleaned JSON (first 500 chars):', cleanedJSON.substring(0, 500));

      // Try to parse
      worldFoundation = JSON.parse(cleanedJSON);

      // Normalize field names (fix "Name" → "worldName" etc)
      if (worldFoundation.Name && !worldFoundation.worldName) {
        worldFoundation.worldName = worldFoundation.Name;
        delete worldFoundation.Name;
      }

      // Validate required fields
      if (!worldFoundation.worldName || !worldFoundation.cultures || worldFoundation.cultures.length === 0) {
        throw new Error('Missing required fields in world data');
      }

      console.log('[Quick Gen JSON Parse] Successfully parsed world:', worldFoundation.worldName);

      // ✅ FIX: Remove the raw JSON streaming message now that we've parsed it successfully
      // Only keep the formatted display version
      chatHistory.splice(streamingMessageIndex, 1);
      chatHistory = [...chatHistory]; // Trigger reactivity

    } catch (parseError) {
      console.error('[Quick Gen JSON Parse] Parsing failed:', parseError);
      console.error('[Quick Gen JSON Parse] Full response length:', finalResponse.length);
      console.error('[Quick Gen JSON Parse] Response preview (first 1000 chars):', finalResponse.substring(0, 1000));
      console.error('[Quick Gen JSON Parse] Response end (last 500 chars):', finalResponse.substring(finalResponse.length - 500));

      error = `Failed to parse world data. The AI generated invalid JSON. Please try again.\n\nError: ${parseError.message}`;
      isGenerating = false;
      return;
    }

    // Store in worldData
    worldData.name = worldFoundation.worldName;
    worldData.coreHook = worldFoundation.coreHook;
    worldData.geography = worldFoundation.geography;
    worldData.magicSystem = worldFoundation.magicSystem;
    worldData.conflict = worldFoundation.conflict;
    worldData.theme = worldFoundation.coreHook; // For expansion prompts
    worldData.cultures = worldFoundation.cultures.map(c => ({
      ...c,
      expanded: false,
      fullDetail: null,
      description: c.overview // Needed for expansion API
    }));

    // Phase 1: Run cliché detection on generated content
    try {
      const worldText = finalResponse; // Use final response for detection
      clicheAnalysis = detectCliches(worldText, detectedGenre);

      if (clicheAnalysis.clicheCount > 0) {
        console.log(`[Cliché Detection] Found ${clicheAnalysis.clicheCount} clichés (score: ${clicheAnalysis.originalityScore}/10)`);
      }
    } catch (err) {
      console.error('[Cliché Detection] Error:', err);
    }

    // Phase 1: Validate magic system
    try {
      if (worldData.magicSystem) {
        magicValidation = validateMagicSystem(worldData.magicSystem, detectedMagicStyle);
        console.log(`[Magic Validation] Style: ${detectedMagicStyle}, Valid: ${magicValidation.valid}, Score: ${magicValidation.score}/10`);
      }
    } catch (err) {
      console.error('[Magic Validation] Error:', err);
    }

    // ✅ FIX: Don't duplicate world in chat - it's already shown in right panel!
    // Just add a success message pointing user to the right side

    // Add success message and interactive suggestions
    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: `---

✨ **World Created: "${worldData.name}"** ✨

**👉 Check out your world details on the right side!**

You can now:
${worldData.cultures.map(c => `- 📖 "Expand on ${c.name}" - Deep dive into their culture`).join('\n')}
- 👤 "Create a character" - Generate a detailed NPC
- 🏛️ "Generate a location" - Add cities, landmarks, ruins
- 📜 "Create a legend" - Add myths and folklore
- 💬 Or ask anything! Example: "What do people eat?", "How does trade work?"`
    }];
  }

  // Expand a specific culture
  async function expandCulture(cultureName) {
    if (isGenerating) return;

    isGenerating = true;
    currentlyExpanding = `culture:${cultureName}`;
    error = null;

    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: `📖 Expanding on **${cultureName}**... Generating detailed information about their daily life, notable figures, and places.`
    }];

    // Add a streaming message placeholder
    const streamingMessageIndex = chatHistory.length;
    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: '',
      isStreaming: true
    }];

    streamingContent = ''; // Reset

    try {
      // Build world context for expansion
      const worldContext = {
        worldName: worldData.name,
        theme: worldData.coreHook,
        magicSystem: worldData.magicSystem,
        cultures: worldData.cultures
      };

      const prompt = getCultureExpansionPrompt(worldContext, cultureName);

      // Use streaming version with callback
      const response = await callOpenAIStreaming([
        { role: 'system', content: worldExpansionPrompt.systemPrompt },
        { role: 'user', content: prompt }
      ], true, 2000, 120000, (chunk, fullContentSoFar) => {
        // Update streaming message in real-time
        streamingContent = fullContentSoFar;
        chatHistory[streamingMessageIndex].content = fullContentSoFar;
        chatHistory = [...chatHistory]; // Trigger reactivity
      });

      // Remove streaming flag when done
      chatHistory[streamingMessageIndex].isStreaming = false;
      chatHistory = [...chatHistory]; // Trigger reactivity

      const expansion = parseExpansionResponse(response);

      // Update culture with full details
      const cultureIndex = worldData.cultures.findIndex(c => c.name === cultureName);
      worldData.cultures[cultureIndex].expanded = true;
      worldData.cultures[cultureIndex].fullDetail = expansion;

      // Format for chat display (handle both old and new response formats)
      const displayMessage = `## ${cultureName} - Detailed Expansion

### Daily Life
${expansion.dailyLife}

${expansion.economy ? `### Economy & Trade
${expansion.economy}

` : ''}${expansion.governance ? `### Governance & Law
${expansion.governance}

` : ''}${expansion.artsAndTraditions ? `### Arts & Traditions
${expansion.artsAndTraditions}

` : ''}### Notable Figures
${expansion.notableFigures.map(fig => `
**${fig.name}**${fig.age ? ` (Age ${fig.age})` : ''} - *${fig.role}*
${fig.description}
${fig.personality ? `*${fig.personality}*` : ''}
${fig.currentActions ? `Currently: ${fig.currentActions}` : ''}
`).join('\n')}${expansion.locations ? `

### Key Locations
${expansion.locations.map(loc => `
**${loc.name}** (${loc.type})
${loc.description}
*Significance: ${loc.significance}*
`).join('\n')}` : ''}`;

      chatHistory = [...chatHistory, {
        role: 'assistant',
        content: displayMessage
      }];

      chatHistory = [...chatHistory, {
        role: 'assistant',
        content: `Want to explore more? Try:\n- 👤 "Create a character from ${cultureName}"\n- 🏛️ "Generate another location"\n- 📖 Expand another culture\n- 📜 "Generate a legend about ${cultureName}"`
      }];

    } catch (err) {
      error = `Failed to expand culture: ${err.message}`;
      console.error(err);
      chatHistory = [...chatHistory, { role: 'error', content: error }];
    } finally {
      isGenerating = false;
      currentlyExpanding = null;
    }
  }

  // Generate a character
  async function generateCharacter(cultureName = null) {
    if (isGenerating) return;

    isGenerating = true;
    currentlyExpanding = 'character';
    error = null;

    const targetCulture = cultureName || worldData.cultures[0]?.name || 'the world';

    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: `👤 Creating a character from **${targetCulture}**...`
    }];

    // Add a streaming message placeholder
    const streamingMessageIndex = chatHistory.length;
    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: '',
      isStreaming: true
    }];

    streamingContent = ''; // Reset

    try {
      const worldContext = {
        worldName: worldData.name,
        theme: worldData.coreHook,
        magicSystem: worldData.magicSystem,
        cultures: worldData.cultures
      };

      const prompt = getCharacterGenerationPrompt(worldContext, cultureName);

      // Use streaming version with callback
      const response = await callOpenAIStreaming([
        { role: 'system', content: worldExpansionPrompt.systemPrompt },
        { role: 'user', content: prompt }
      ], true, 1500, 90000, (chunk, fullContentSoFar) => {
        // Update streaming message in real-time
        streamingContent = fullContentSoFar;
        chatHistory[streamingMessageIndex].content = fullContentSoFar;
        chatHistory = [...chatHistory]; // Trigger reactivity
      });

      // Remove streaming flag when done
      chatHistory[streamingMessageIndex].isStreaming = false;
      chatHistory = [...chatHistory]; // Trigger reactivity

      const character = parseExpansionResponse(response);

      // Add to worldData
      worldData.characters.push(character);

      // Format for display
      const displayMessage = `## ${character.name}

**Age:** ${character.age} | **Role:** ${character.role}

### Appearance
${character.physicalDescription}

### Personality
${character.personality}

### Goal
${character.goal}

### Connection to the World
${character.coreLayInteraction || character.coreLawInteraction || 'A unique individual shaped by their world.'}

### Distinctive Trait
${character.distinctiveTrait}

### Secret
${character.secret}`;

      chatHistory = [...chatHistory, {
        role: 'assistant',
        content: displayMessage
      }];

    } catch (err) {
      error = `Failed to generate character: ${err.message}`;
      console.error(err);
      chatHistory = [...chatHistory, { role: 'error', content: error }];
    } finally {
      isGenerating = false;
      currentlyExpanding = null;
    }
  }

  // Generate a location
  async function generateLocation() {
    if (isGenerating) return;

    isGenerating = true;
    currentlyExpanding = 'location';
    error = null;

    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: `🏛️ Creating a unique location...`
    }];

    // Add a streaming message placeholder
    const streamingMessageIndex = chatHistory.length;
    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: '',
      isStreaming: true
    }];

    streamingContent = ''; // Reset

    try {
      const worldContext = {
        worldName: worldData.name,
        theme: worldData.coreHook,
        magicSystem: worldData.magicSystem,
        centralConflict: worldData.conflict,
        cultures: worldData.cultures
      };

      const prompt = getLocationGenerationPrompt(worldContext);

      // Use streaming version with callback
      const response = await callOpenAIStreaming([
        { role: 'system', content: worldExpansionPrompt.systemPrompt },
        { role: 'user', content: prompt }
      ], true, 1500, 90000, (chunk, fullContentSoFar) => {
        // Update streaming message in real-time
        streamingContent = fullContentSoFar;
        chatHistory[streamingMessageIndex].content = fullContentSoFar;
        chatHistory = [...chatHistory]; // Trigger reactivity
      });

      // Remove streaming flag when done
      chatHistory[streamingMessageIndex].isStreaming = false;
      chatHistory = [...chatHistory]; // Trigger reactivity

      const location = parseExpansionResponse(response);

      // Add to worldData
      worldData.locations.push(location);

      // Format for display
      const displayMessage = `## ${location.name}
*${location.type}*

${location.description}

### How the World's Magic Manifests Here
${location.coreLawManifestation || location.magicManifestation || 'Magic subtly influences this place.'}

### Inhabitants
${location.inhabitants}

### Current Situation
${location.currentSituation}

### Memorable Details
${location.memorableDetails.map(d => `- ${d}`).join('\n')}`;

      chatHistory = [...chatHistory, {
        role: 'assistant',
        content: displayMessage
      }];

    } catch (err) {
      error = `Failed to generate location: ${err.message}`;
      console.error(err);
      chatHistory = [...chatHistory, { role: 'error', content: error }];
    } finally {
      isGenerating = false;
      currentlyExpanding = null;
    }
  }

  // Generate a legend
  async function generateLegend() {
    if (isGenerating) return;

    isGenerating = true;
    currentlyExpanding = 'legend';
    error = null;

    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: `📜 Generating a legend from **${worldData.name}**...`
    }];

    // Add a streaming message placeholder
    const streamingMessageIndex = chatHistory.length;
    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: '',
      isStreaming: true
    }];

    streamingContent = ''; // Reset

    try {
      const worldContext = {
        worldName: worldData.name,
        theme: worldData.coreHook,
        magicSystem: worldData.magicSystem,
        cultures: worldData.cultures,
        centralConflict: worldData.conflict
      };

      const prompt = getLegendGenerationPrompt(worldContext);

      // Use streaming version with callback
      const response = await callOpenAIStreaming([
        { role: 'system', content: worldExpansionPrompt.systemPrompt },
        { role: 'user', content: prompt }
      ], true, 2000, 90000, (chunk, fullContentSoFar) => {
        // Update streaming message in real-time
        streamingContent = fullContentSoFar;
        chatHistory[streamingMessageIndex].content = fullContentSoFar;
        chatHistory = [...chatHistory]; // Trigger reactivity
      });

      // Remove streaming flag when done
      chatHistory[streamingMessageIndex].isStreaming = false;
      chatHistory = [...chatHistory]; // Trigger reactivity

      const legend = parseExpansionResponse(response);

      // Add to worldData
      worldData.legends.push(legend);

      // Format for display
      const displayMessage = `## ${legend.title}
*${legend.timeframe}*

${legend.story}

### Moral or Lesson
${legend.moralOrLesson}

### Cultural Significance
${legend.culturalSignificance}`;

      chatHistory = [...chatHistory, {
        role: 'assistant',
        content: displayMessage
      }];

    } catch (err) {
      error = `Failed to generate legend: ${err.message}`;
      console.error(err);
      chatHistory = [...chatHistory, { role: 'error', content: error }];
    } finally {
      isGenerating = false;
      currentlyExpanding = null;
    }
  }

  // Handle ongoing conversation (conversational worldbuilding)
  async function handleConversation(userPrompt) {
    // Check for expansion keywords
    const lowerPrompt = userPrompt.toLowerCase();

    // Culture expansion
    for (const culture of worldData.cultures) {
      if (lowerPrompt.includes(culture.name.toLowerCase()) &&
          (lowerPrompt.includes('expand') || lowerPrompt.includes('more about') || lowerPrompt.includes('tell me about'))) {
        await expandCulture(culture.name);
        return;
      }
    }

    // Quick actions
    if (lowerPrompt.includes('character') || lowerPrompt.includes('person') || lowerPrompt.includes('npc')) {
      // Check if they specified a culture
      let cultureName = null;
      for (const culture of worldData.cultures) {
        if (lowerPrompt.includes(culture.name.toLowerCase())) {
          cultureName = culture.name;
          break;
        }
      }
      await generateCharacter(cultureName);
      return;
    }

    if (lowerPrompt.includes('location') || lowerPrompt.includes('place') || lowerPrompt.includes('city') || lowerPrompt.includes('village')) {
      await generateLocation();
      return;
    }

    if (lowerPrompt.includes('legend') || lowerPrompt.includes('myth') || lowerPrompt.includes('story') || lowerPrompt.includes('tale')) {
      await generateLegend();
      return;
    }

    // Otherwise, general conversational response
    const systemPrompt = `You are an expert worldbuilding assistant helping refine and expand a world.

CURRENT WORLD:
Name: ${worldData.name}
Core Hook: ${worldData.coreHook}
Geography: ${worldData.geography}
Magic: ${worldData.magicSystem.name} - ${worldData.magicSystem.description}
Conflict: ${worldData.conflict}
Cultures: ${worldData.cultures.map(c => c.name).join(', ')}

PRINCIPLES:
✅ Maintain consistency with established facts
✅ Add specific, concrete details
✅ Show how elements affect daily life
✅ Stay original, avoid generic fantasy tropes

Respond conversationally and helpfully. If the user asks about an element, provide rich details. If they want modifications, explain what you're changing and why.`;

    // Add a streaming message placeholder
    const streamingMessageIndex = chatHistory.length;
    chatHistory = [...chatHistory, {
      role: 'assistant',
      content: '',
      isStreaming: true
    }];

    streamingContent = ''; // Reset

    // Use streaming version with callback
    const response = await callOpenAIStreaming([
      { role: 'system', content: systemPrompt },
      ...chatHistory.slice(-8, -1), // Get recent history, excluding the streaming placeholder
      { role: 'user', content: userPrompt }
    ], false, 2000, 90000, (chunk, fullContentSoFar) => {
      // Update streaming message in real-time
      streamingContent = fullContentSoFar;
      chatHistory[streamingMessageIndex].content = fullContentSoFar;
      chatHistory = [...chatHistory]; // Trigger reactivity
    });

    // Remove streaming flag when done
    chatHistory[streamingMessageIndex].isStreaming = false;
    chatHistory = [...chatHistory]; // Trigger reactivity
  }

  // Use starter prompt
  function useStarterPrompt(prompt) {
    message = prompt;
  }

  // Handle Enter key
  function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  // Export world
  function exportWorld() {
    let markdown = `# ${worldData.name}\n\n`;
    markdown += `**${worldData.coreHook}**\n\n`;
    markdown += `## Geography\n${worldData.geography}\n\n`;
    markdown += `## Magic System: ${worldData.magicSystem.name}\n${worldData.magicSystem.description}\n\n`;
    markdown += `## Central Conflict\n${worldData.conflict}\n\n`;

    markdown += `## Cultures\n\n`;
    worldData.cultures.forEach(culture => {
      markdown += `### ${culture.name}\n`;
      markdown += `${culture.overview}\n`;
      markdown += `*Core Values: ${culture.values}*\n\n`;

      if (culture.expanded && culture.fullDetail) {
        markdown += `#### Daily Life\n${culture.fullDetail.dailyLife}\n\n`;

        if (culture.fullDetail.economy) {
          markdown += `#### Economy & Trade\n${culture.fullDetail.economy}\n\n`;
        }

        if (culture.fullDetail.governance) {
          markdown += `#### Governance & Law\n${culture.fullDetail.governance}\n\n`;
        }

        if (culture.fullDetail.artsAndTraditions) {
          markdown += `#### Arts & Traditions\n${culture.fullDetail.artsAndTraditions}\n\n`;
        }

        markdown += `#### Notable Figures\n`;
        culture.fullDetail.notableFigures.forEach(fig => {
          markdown += `**${fig.name}**${fig.age ? ` (Age ${fig.age})` : ''} - ${fig.role}\n`;
          markdown += `${fig.description}\n`;
          if (fig.personality) markdown += `${fig.personality}\n`;
          if (fig.currentActions) markdown += `*Currently: ${fig.currentActions}*\n`;
          markdown += `\n`;
        });

        if (culture.fullDetail.locations) {
          markdown += `#### Key Locations\n`;
          culture.fullDetail.locations.forEach(loc => {
            markdown += `**${loc.name}** (${loc.type})\n${loc.description}\n*Significance: ${loc.significance}*\n\n`;
          });
        }
      }
    });

    if (worldData.characters.length > 0) {
      markdown += `## Characters\n\n`;
      worldData.characters.forEach(char => {
        markdown += `### ${char.name}\n`;
        markdown += `**Age:** ${char.age} | **Role:** ${char.role}\n\n`;
        markdown += `${char.physicalDescription}\n\n`;
        markdown += `${char.personality}\n\n`;
        markdown += `**Goal:** ${char.goal}\n\n`;
        markdown += `**Secret:** ${char.secret}\n\n`;
      });
    }

    if (worldData.locations.length > 0) {
      markdown += `## Locations\n\n`;
      worldData.locations.forEach(loc => {
        markdown += `### ${loc.name}\n`;
        markdown += `*${loc.type}*\n\n`;
        markdown += `${loc.description}\n\n`;
        markdown += `**Inhabitants:** ${loc.inhabitants}\n\n`;
        markdown += `**Current Situation:** ${loc.currentSituation}\n\n`;
      });
    }

    if (worldData.legends.length > 0) {
      markdown += `## Legends & Myths\n\n`;
      worldData.legends.forEach(legend => {
        markdown += `### ${legend.title}\n`;
        markdown += `*${legend.timeframe}*\n\n`;
        markdown += `${legend.story}\n\n`;
        markdown += `**Moral:** ${legend.moralOrLesson}\n\n`;
      });
    }

    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${worldData.name.replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="studio-layout">
  <!-- Left Side: Chat -->
  <div class="chat-panel">
    <div class="chat-header">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl font-bold text-white">🌍 Worldbuilding Studio</h1>
          <p class="text-purple-200 text-sm">Quick foundation → Explore what interests you</p>
        </div>
        <div class="settings-panel">
          <label class="settings-toggle">
            <input
              type="checkbox"
              bind:checked={enableQualityCritique}
              class="form-checkbox"
            />
            <span class="text-purple-100 text-xs">Quality Critique (+30-50% better)</span>
          </label>
        </div>
      </div>
    </div>

    <div class="chat-messages">
      {#if chatHistory.length === 0}
        <!-- Welcome Message -->
        <div class="welcome-section">
          <div class="welcome-icon">✨</div>
          <h2 class="text-2xl font-bold text-gray-800 mb-2">Let's Build Your World</h2>
          <p class="text-gray-600 mb-6">
            I'll create a quick foundation, then you can explore whatever interests you most.
            Expand cultures, create characters, generate locations - your choice!
          </p>

          <div class="space-y-2">
            <p class="text-sm font-semibold text-gray-700">Try one of these:</p>
            {#each starterPrompts as prompt}
              <button
                onclick={() => useStarterPrompt(prompt)}
                class="starter-prompt-btn"
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
            <div class="flex justify-end mb-4">
              <div class="user-message">
                <p class="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          {:else if msg.role === 'assistant'}
            <div class="flex justify-start mb-4">
              <div class="assistant-message">
                <p class="whitespace-pre-wrap">{@html msg.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/^### (.*?)$/gm, '<h3 style="font-size: 1.1em; font-weight: 700; margin-top: 1rem; margin-bottom: 0.5rem; color: #7c3aed;">$1</h3>')
                  .replace(/^## (.*?)$/gm, '<h2 style="font-size: 1.25em; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #5b21b6;">$1</h2>')
                  .replace(/^# (.*?)$/gm, '<h1 style="font-size: 1.5em; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: #4c1d95;">$1</h1>')
                  .replace(/^- (.*?)$/gm, '<li style="margin-left: 1.5rem;">$1</li>')
                }</p>
                {#if msg.isStreaming}
                  <span class="streaming-cursor"></span>
                {/if}
              </div>
            </div>
          {:else if msg.role === 'error'}
            <div class="flex justify-center mb-4">
              <div class="error-message">
                <p class="text-sm">{msg.content}</p>
              </div>
            </div>
          {/if}
        {/each}

        <!-- Loading Indicator with Status -->
        {#if isGenerating}
          <div class="flex justify-start mb-4">
            <div class="assistant-message">
              <div class="flex items-center gap-2">
                <div class="flex gap-1">
                  <div class="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                  <div class="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                  <div class="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
                <span class="text-sm text-gray-600">
                  {#if currentlyExpanding}
                    {currentlyExpanding.includes('culture') ? 'Expanding culture...' :
                     currentlyExpanding === 'character' ? 'Creating character...' :
                     currentlyExpanding === 'location' ? 'Generating location...' :
                     currentlyExpanding === 'legend' ? 'Weaving legend...' : 'Building...'}
                  {:else}
                    Building...
                  {/if}
                </span>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>

    <!-- Input Area -->
    <div class="chat-input-area">
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
          placeholder={worldData.name ? "Ask about the world, expand elements, or generate content..." : "Describe the world you want to create..."}
          disabled={isGenerating}
          class="input-field"
        />
        <button
          onclick={sendMessage}
          disabled={isGenerating || !message.trim()}
          class="send-button"
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
    </div>
  </div>

  <!-- Right Side: World Preview with Progressive Expansion -->
  <div class="world-preview-panel">
    {#if worldData.name}
      <div class="world-content">
        <!-- Header with Export -->
        <div class="mb-6 pb-4 border-b-2 border-purple-200">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">{worldData.name}</h2>
          <p class="text-gray-600 text-sm mb-3">{worldData.coreHook}</p>
          <div class="flex gap-3">
            <button
              onclick={exportWorld}
              class="export-button"
            >
              📥 Export World
            </button>
            {#if qualityMetrics}
              <button
                onclick={() => showQualityMetrics = !showQualityMetrics}
                class="quality-toggle-button"
              >
                {showQualityMetrics ? '📊 Hide' : '📊 Show'} Quality Metrics
              </button>
            {/if}
          </div>
        </div>

        <!-- Quality Metrics Display -->
        {#if qualityMetrics && showQualityMetrics}
          <div class="quality-metrics-panel">
            <h3 class="text-lg font-bold text-purple-800 mb-3">Quality Analysis</h3>

            <div class="overall-score-display">
              <span class="score-label">Overall Quality:</span>
              <span class="score-value">{qualityMetrics.overallScore.toFixed(1)}/10</span>
              <div class="score-bar">
                <div class="score-fill" style="width: {qualityMetrics.overallScore * 10}%"></div>
              </div>
            </div>

            <div class="metrics-grid">
              {#each Object.entries(qualityMetrics.principleScores) as [principle, data]}
                <div class="metric-card">
                  <div class="metric-header">
                    <span class="metric-name">{principle}</span>
                    <span class="metric-score" class:high={data.score >= 8} class:medium={data.score >= 6 && data.score < 8} class:low={data.score < 6}>
                      {data.score}/10
                    </span>
                  </div>
                  <div class="metric-bar">
                    <div class="metric-fill" style="width: {data.score * 10}%"></div>
                  </div>
                  {#if data.strengths && data.strengths.length > 0}
                    <div class="metric-strengths">
                      <p class="text-xs font-semibold text-green-700">Strengths:</p>
                      <ul class="text-xs text-green-600">
                        {#each data.strengths.slice(0, 2) as strength}
                          <li>✓ {strength}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}
                  {#if data.weaknesses && data.weaknesses.length > 0}
                    <div class="metric-weaknesses">
                      <p class="text-xs font-semibold text-orange-700">Areas for improvement:</p>
                      <ul class="text-xs text-orange-600">
                        {#each data.weaknesses.slice(0, 2) as weakness}
                          <li>→ {weakness}</li>
                        {/each}
                      </ul>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}

        <!-- Phase 1: Cliché Analysis Display -->
        {#if clicheAnalysis && showQualityMetrics}
          <div class="cliche-analysis-panel">
            <h3 class="text-lg font-bold text-purple-800 mb-3">🎭 Cliché Analysis</h3>

            <div class="cliche-score-display">
              <span class="score-label">Originality Score:</span>
              <span class="score-value" class:high={clicheAnalysis.originalityScore >= 8} class:medium={clicheAnalysis.originalityScore >= 6} class:low={clicheAnalysis.originalityScore < 6}>
                {clicheAnalysis.originalityScore.toFixed(1)}/10
              </span>
              <div class="score-bar">
                <div class="score-fill" style="width: {clicheAnalysis.originalityScore * 10}%; background: {clicheAnalysis.originalityScore >= 8 ? 'linear-gradient(90deg, #10b981, #059669)' : clicheAnalysis.originalityScore >= 6 ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #ef4444, #dc2626)'}"></div>
              </div>
            </div>

            <div class="cliche-summary">
              <p class="text-sm text-gray-700 mb-2">
                {#if clicheAnalysis.clicheCount === 0}
                  ✅ <strong>Excellent!</strong> No common clichés detected. The world feels original and fresh.
                {:else if clicheAnalysis.originalityScore >= 8}
                  ✅ <strong>Good work!</strong> Found {clicheAnalysis.clicheCount} minor cliché{clicheAnalysis.clicheCount > 1 ? 's' : ''}, but overall very original.
                {:else if clicheAnalysis.originalityScore >= 6}
                  ⚠️ <strong>Could be improved.</strong> Found {clicheAnalysis.clicheCount} cliché{clicheAnalysis.clicheCount > 1 ? 's' : ''} that could be more creative.
                {:else}
                  ⚠️ <strong>Needs work.</strong> Found {clicheAnalysis.clicheCount} cliché{clicheAnalysis.clicheCount > 1 ? 's' : ''}. Consider revising for more originality.
                {/if}
              </p>

              {#if clicheAnalysis.detected && clicheAnalysis.detected.length > 0}
                <details class="cliche-details">
                  <summary class="text-xs font-semibold text-purple-700 cursor-pointer">View detected clichés ({clicheAnalysis.detected.length})</summary>
                  <ul class="mt-2 space-y-1 text-xs text-gray-600">
                    {#each clicheAnalysis.detected.slice(0, 10) as cliche}
                      <li class="ml-4">• "{cliche.text}" - {cliche.category}</li>
                    {/each}
                  </ul>
                </details>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Phase 1: Magic System Validation Display -->
        {#if magicValidation && showQualityMetrics}
          <div class="magic-validation-panel">
            <h3 class="text-lg font-bold text-purple-800 mb-3">✨ Magic System Validation</h3>

            <div class="magic-score-display">
              <span class="score-label">Style: {detectedMagicStyle === 'hard' ? 'Hard Magic (Sanderson\'s Second Law)' : 'Soft Magic (Sanderson\'s First Law)'}</span>
              <span class="score-value" class:high={magicValidation.valid} class:low={!magicValidation.valid}>
                {magicValidation.score.toFixed(1)}/10 {magicValidation.valid ? '✓' : '✗'}
              </span>
              <div class="score-bar">
                <div class="score-fill" style="width: {magicValidation.score * 10}%; background: {magicValidation.valid ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #ef4444, #dc2626)'}"></div>
              </div>
            </div>

            <div class="magic-summary">
              {#if magicValidation.valid}
                <p class="text-sm text-green-700 mb-2">
                  ✅ <strong>Validated!</strong> Magic system follows {detectedMagicStyle} magic principles.
                </p>
              {:else}
                <p class="text-sm text-orange-700 mb-2">
                  ⚠️ <strong>Needs improvement.</strong> Magic system could be strengthened.
                </p>
              {/if}

              {#if detectedMagicStyle === 'hard' && magicValidation.missing && magicValidation.missing.length > 0}
                <div class="mt-2">
                  <p class="text-xs font-semibold text-orange-700">Missing elements:</p>
                  <ul class="mt-1 space-y-1 text-xs text-orange-600">
                    {#each magicValidation.missing as missing}
                      <li class="ml-4">• {missing}</li>
                    {/each}
                  </ul>
                </div>
              {/if}

              {#if detectedMagicStyle === 'soft' && magicValidation.issues && magicValidation.issues.length > 0}
                <div class="mt-2">
                  <p class="text-xs font-semibold text-orange-700">Issues found:</p>
                  <ul class="mt-1 space-y-1 text-xs text-orange-600">
                    {#each magicValidation.issues as issue}
                      <li class="ml-4">• {issue}</li>
                    {/each}
                  </ul>
                </div>
              {/if}

              {#if magicValidation.suggestions && magicValidation.suggestions.length > 0}
                <details class="magic-details mt-2">
                  <summary class="text-xs font-semibold text-purple-700 cursor-pointer">View suggestions</summary>
                  <ul class="mt-2 space-y-1 text-xs text-gray-600">
                    {#each magicValidation.suggestions.slice(0, 5) as suggestion}
                      <li class="ml-4">💡 {suggestion}</li>
                    {/each}
                  </ul>
                </details>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Core World Info -->
        <div class="world-section">
          <h3 class="section-title">🌍 Geography</h3>
          <p class="text-gray-700 leading-relaxed">{worldData.geography}</p>
        </div>

        <div class="world-section">
          <h3 class="section-title">✨ {worldData.magicSystem.name}</h3>
          <p class="text-gray-700 leading-relaxed">{worldData.magicSystem.description}</p>
        </div>

        <div class="world-section">
          <h3 class="section-title">⚔️ Central Conflict</h3>
          <p class="text-gray-700 leading-relaxed">{worldData.conflict}</p>
        </div>

        <!-- Cultures with Expansion -->
        <div class="world-section">
          <h3 class="section-title">👥 Cultures</h3>
          {#each worldData.cultures as culture}
            <div class="element-card">
              <div class="flex justify-between items-start mb-2">
                <h4 class="text-lg font-bold text-gray-900">{culture.name}</h4>
                {#if !culture.expanded}
                  <button
                    onclick={() => expandCulture(culture.name)}
                    disabled={isGenerating}
                    class="expand-button"
                  >
                    📖 Explore
                  </button>
                {:else}
                  <span class="text-green-600 text-sm font-semibold">✓ Expanded</span>
                {/if}
              </div>
              <p class="text-gray-700 text-sm mb-2">{culture.overview}</p>
              <p class="text-purple-600 text-xs font-semibold">Values: {culture.values}</p>

              {#if culture.expanded && culture.fullDetail}
                <div class="expanded-content">
                  <div class="mt-4">
                    <h5 class="font-semibold text-purple-800 mb-1">Daily Life</h5>
                    <p class="text-sm text-gray-700">{culture.fullDetail.dailyLife}</p>
                  </div>
                  {#if culture.fullDetail.economy}
                    <div class="mt-3">
                      <h5 class="font-semibold text-purple-800 mb-1">Economy & Trade</h5>
                      <p class="text-sm text-gray-700">{culture.fullDetail.economy}</p>
                    </div>
                  {/if}
                  {#if culture.fullDetail.governance}
                    <div class="mt-3">
                      <h5 class="font-semibold text-purple-800 mb-1">Governance</h5>
                      <p class="text-sm text-gray-700">{culture.fullDetail.governance}</p>
                    </div>
                  {/if}
                  <div class="mt-3">
                    <h5 class="font-semibold text-purple-800 mb-1">Notable Figures</h5>
                    {#each culture.fullDetail.notableFigures as figure}
                      <div class="ml-2 mb-2">
                        <p class="text-sm font-semibold text-gray-800">
                          {figure.name}{#if figure.age} (Age {figure.age}){/if} - {figure.role}
                        </p>
                        <p class="text-xs text-gray-600">{figure.description}</p>
                        {#if figure.currentActions}
                          <p class="text-xs text-gray-500 italic">{figure.currentActions}</p>
                        {/if}
                      </div>
                    {/each}
                  </div>
                  {#if culture.fullDetail.locations}
                    <div class="mt-3">
                      <h5 class="font-semibold text-purple-800 mb-1">Key Locations</h5>
                      {#each culture.fullDetail.locations as location}
                        <div class="ml-2 mb-2">
                          <p class="text-sm font-semibold text-gray-800">{location.name} ({location.type})</p>
                          <p class="text-xs text-gray-600">{location.description}</p>
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <!-- Quick Actions -->
        <div class="world-section">
          <h3 class="section-title">🎯 Quick Actions</h3>
          <div class="grid grid-cols-2 gap-3">
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

        <!-- Generated Elements Summary -->
        {#if worldData.characters.length > 0 || worldData.locations.length > 0 || worldData.legends.length > 0}
          <div class="world-section">
            <h3 class="section-title">📚 Generated Content</h3>
            <div class="space-y-2">
              {#if worldData.characters.length > 0}
                <p class="text-sm text-gray-700">👤 <strong>{worldData.characters.length}</strong> Character{worldData.characters.length > 1 ? 's' : ''}</p>
              {/if}
              {#if worldData.locations.length > 0}
                <p class="text-sm text-gray-700">🏛️ <strong>{worldData.locations.length}</strong> Location{worldData.locations.length > 1 ? 's' : ''}</p>
              {/if}
              {#if worldData.legends.length > 0}
                <p class="text-sm text-gray-700">📜 <strong>{worldData.legends.length}</strong> Legend{worldData.legends.length > 1 ? 's' : ''}</p>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    {:else}
      <div class="empty-preview">
        <div class="text-6xl mb-4">🌍</div>
        <h3 class="text-xl font-bold text-gray-700 mb-2">Your World Will Appear Here</h3>
        <p class="text-gray-500 mb-4">Quick foundation → Explore what interests you</p>
        <div class="text-sm text-gray-600 space-y-1">
          <p>✨ Fast initial generation (30 seconds)</p>
          <p>📖 Expand cultures on demand</p>
          <p>👤 Generate characters as needed</p>
          <p>🏛️ Add locations when you want them</p>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .studio-layout {
    display: grid;
    grid-template-columns: 40% 60%; /* Chat narrower (left), World wider (right) */
    height: 100vh;
    background: linear-gradient(to bottom, #faf5ff, #eff6ff);
  }

  @media (max-width: 1024px) {
    .studio-layout {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
    }
  }

  /* Chat Panel */
  .chat-panel {
    display: flex;
    flex-direction: column;
    background: white;
    border-right: 2px solid #e5e7eb;
  }

  .chat-header {
    background: linear-gradient(135deg, #7c3aed, #6366f1);
    padding: 1.5rem;
    border-bottom: 2px solid #5b21b6;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
  }

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

  .welcome-section {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
    padding: 2rem;
  }

  .welcome-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .starter-prompt-btn {
    width: 100%;
    padding: 0.75rem 1rem;
    background: linear-gradient(135deg, #f3e8ff, #e0e7ff);
    border: 2px solid #c4b5fd;
    border-radius: 0.5rem;
    text-align: left;
    font-size: 0.875rem;
    color: #5b21b6;
    transition: all 0.2s;
  }

  .starter-prompt-btn:hover {
    background: linear-gradient(135deg, #e9d5ff, #ddd6fe);
    border-color: #a78bfa;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .user-message {
    background: #7c3aed;
    color: white;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    max-width: 80%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .assistant-message {
    background: #f3f4f6;
    color: #1f2937;
    padding: 0.75rem 1rem;
    border-radius: 1rem;
    max-width: 80%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .error-message {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
  }

  .chat-input-area {
    padding: 1rem 1.5rem;
    background: #f9fafb;
    border-top: 2px solid #e5e7eb;
  }

  .input-field {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .input-field:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  .input-field:disabled {
    background: #f3f4f6;
    cursor: not-allowed;
  }

  .send-button {
    padding: 0.75rem 1.5rem;
    background: #7c3aed;
    color: white;
    border-radius: 0.5rem;
    font-weight: 600;
    transition: all 0.2s;
  }

  .send-button:hover:not(:disabled) {
    background: #6d28d9;
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .send-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  /* World Preview Panel */
  .world-preview-panel {
    background: white;
    overflow-y: auto;
    padding: 2rem;
  }

  .world-preview-panel::-webkit-scrollbar {
    width: 8px;
  }

  .world-preview-panel::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .world-preview-panel::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  .world-content {
    max-width: 700px;
  }

  .world-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #7c3aed;
    margin-bottom: 1rem;
  }

  .element-card {
    background: linear-gradient(135deg, #faf5ff, #f9fafb);
    border: 2px solid #e9d5ff;
    border-radius: 0.75rem;
    padding: 1rem;
    margin-bottom: 1rem;
    transition: all 0.2s;
  }

  .element-card:hover {
    border-color: #c4b5fd;
    box-shadow: 0 4px 8px rgba(124, 58, 237, 0.1);
  }

  .expand-button {
    background: linear-gradient(135deg, #7c3aed, #6366f1);
    color: white;
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 600;
    transition: all 0.2s;
  }

  .expand-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #6d28d9, #4f46e5);
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .expand-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .expanded-content {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e9d5ff;
    animation: slideDown 0.3s ease-out;
  }

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

  .action-button {
    background: white;
    border: 2px solid #e9d5ff;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: #7c3aed;
    transition: all 0.2s;
  }

  .action-button:hover:not(:disabled) {
    background: linear-gradient(135deg, #f3e8ff, #e0e7ff);
    border-color: #c4b5fd;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .action-button:disabled {
    background: #f3f4f6;
    border-color: #e5e7eb;
    color: #9ca3af;
    cursor: not-allowed;
  }

  .export-button {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all 0.2s;
  }

  .export-button:hover {
    background: linear-gradient(135deg, #059669, #047857);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .empty-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
  }

  /* Streaming cursor animation */
  .streaming-cursor {
    display: inline-block;
    width: 8px;
    height: 16px;
    background: #7c3aed;
    margin-left: 4px;
    animation: blink 1s infinite;
    vertical-align: text-bottom;
  }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  /* Settings Panel */
  .settings-panel {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .settings-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .form-checkbox {
    width: 1rem;
    height: 1rem;
    border-radius: 0.25rem;
    border: 2px solid #e9d5ff;
    cursor: pointer;
  }

  .form-checkbox:checked {
    background-color: #a78bfa;
    border-color: #a78bfa;
  }

  /* Quality Metrics Display */
  .quality-metrics-panel {
    background: linear-gradient(135deg, #faf5ff, #f9fafb);
    border: 2px solid #e9d5ff;
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .overall-score-display {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .score-label {
    font-weight: 600;
    color: #7c3aed;
  }

  .score-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #5b21b6;
  }

  .score-bar {
    flex: 1;
    height: 1rem;
    background: #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .score-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    transition: width 0.3s ease;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .metric-card {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid #e9d5ff;
  }

  .metric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .metric-name {
    font-weight: 600;
    color: #4b5563;
    text-transform: capitalize;
  }

  .metric-score {
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
  }

  .metric-score.high {
    background: #d1fae5;
    color: #065f46;
  }

  .metric-score.medium {
    background: #fef3c7;
    color: #92400e;
  }

  .metric-score.low {
    background: #fee2e2;
    color: #991b1b;
  }

  .metric-bar {
    height: 0.5rem;
    background: #e5e7eb;
    border-radius: 0.25rem;
    overflow: hidden;
    margin-bottom: 0.75rem;
  }

  .metric-fill {
    height: 100%;
    background: linear-gradient(90deg, #7c3aed, #6366f1);
    transition: width 0.3s ease;
  }

  .metric-strengths {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid #e9d5ff;
  }

  .metric-weaknesses {
    margin-top: 0.5rem;
  }

  .metric-strengths ul,
  .metric-weaknesses ul {
    list-style: none;
    padding-left: 0;
    margin-top: 0.25rem;
  }

  .metric-strengths li,
  .metric-weaknesses li {
    margin-bottom: 0.25rem;
  }

  .quality-toggle-button {
    background: linear-gradient(135deg, #7c3aed, #6366f1);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    transition: all 0.2s;
  }

  .quality-toggle-button:hover {
    background: linear-gradient(135deg, #6d28d9, #4f46e5);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  /* Phase 1: Cliché Analysis Panel */
  .cliche-analysis-panel {
    background: linear-gradient(135deg, #fef3c7, #fef9c3);
    border: 2px solid #fcd34d;
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .cliche-score-display {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .cliche-summary {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .cliche-details {
    margin-top: 1rem;
    padding-top: 0.75rem;
    border-top: 1px solid #fcd34d;
  }

  .cliche-details summary:hover {
    color: #92400e;
  }

  /* Phase 1: Magic Validation Panel */
  .magic-validation-panel {
    background: linear-gradient(135deg, #ddd6fe, #e9d5ff);
    border: 2px solid #c4b5fd;
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .magic-score-display {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .magic-summary {
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .magic-details {
    margin-top: 0.5rem;
  }

  .magic-details summary:hover {
    color: #5b21b6;
  }
</style>
