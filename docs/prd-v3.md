# AI Worldbuilding Assistant - Product Requirements Document (PRD)

**Version:** 3.0
**Status:** Active
**Last Updated:** 2025-10-12

---

## Goals and Background Context

### Goals

- Create a conversational AI assistant specialized in worldbuilding for authors and hobbyists
- Provide natural dialogue-based collaboration for world creation, iteration, and expansion
- Maintain context and consistency throughout worldbuilding conversations
- Enable users to brainstorm ideas, generate complete worlds, and refine concepts through chat
- Support export of worlds in structured formats (JSON, Markdown) for external use
- Deliver specialized worldbuilding expertise superior to general-purpose AI chatbots
- Launch functional MVP within 6-8 weeks with core conversational worldbuilding capabilities
- Achieve 90%+ technical reliability and 40%+ user engagement (5+ message conversations)

### Background Context

Authors and worldbuilding hobbyists struggle with creating rich, consistent fictional worlds. Manual worldbuilding is time-consuming and prone to creative blocks. While general AI tools like ChatGPT can help, they lack worldbuilding specialization and produce generic, clichéd responses.

This product provides a purpose-built conversational AI assistant that understands worldbuilding principles, maintains narrative consistency, and helps users iteratively develop original worlds through natural dialogue. Unlike structured generation tools or generic chatbots, this assistant combines the flexibility of conversation with specialized worldbuilding expertise.

**Competitive Landscape:**
- **ChatGPT/Claude:** Powerful but generic, prone to fantasy clichés, no worldbuilding focus
- **World Anvil/Campfire:** Manual tools for organization, no AI generation
- **Random Generators:** Shallow disconnected outputs without coherence

**Market Gap:** No conversational AI assistant specialized for worldbuilding with context management and export capabilities.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-12 | v3.0 | Complete rewrite for conversational assistant concept | PM |
| 2025-10-11 | v2.0 | (Archived) Structured worldbuilding engine | PM |
| 2025-10-11 | v1.0 | (Archived) Text adventure game | PM |

---

## Requirements

### Functional Requirements

#### FR1: API Key Management

**FR1.1:** The system shall accept user-provided OpenAI API keys through a secure input interface with validation.

**FR1.2:** The system shall store API keys in browser localStorage with encryption.

**FR1.3:** The system shall validate API keys by making a test request to OpenAI on entry.

**FR1.4:** The system shall provide clear error messages for invalid or expired keys with instructions for obtaining new keys.

**FR1.5:** The system shall allow users to update or remove their API keys at any time.

**FR1.6:** The system shall never transmit API keys to any server except OpenAI's official API endpoints.

---

#### FR2: Chat Interface

**FR2.1:** The system shall provide a conversational interface with:
- Message input field (text area with multi-line support)
- Send button (click or Enter key)
- Conversation history display (scrollable)
- Clear visual distinction between user and AI messages
- Timestamps for messages
- Typing indicator when AI is generating response

**FR2.2:** The system shall display user messages immediately upon sending.

**FR2.3:** The system shall show a loading/thinking indicator while AI generates responses (5-30 second expected duration).

**FR2.4:** The system shall display AI responses with proper formatting (paragraphs, lists, headings).

**FR2.5:** The system shall support markdown formatting in AI responses.

**FR2.6:** The system shall auto-scroll to the latest message when new messages appear.

**FR2.7:** The system shall allow users to scroll up to review conversation history at any time.

**FR2.8:** The system shall provide a "New Conversation" button to start fresh worldbuilding sessions.

---

#### FR3: Worldbuilding Conversation

**FR3.1:** The system shall use specialized worldbuilding prompts that:
- Emphasize originality and avoid fantasy clichés
- Maintain narrative consistency and coherence
- Provide worldbuilding expertise and guidance
- Ask clarifying questions when user requests are ambiguous
- Suggest creative directions and improvements

**FR3.2:** The system shall support the following conversation types:

**FR3.2.1 - Ideation:** User requests world ideas or brainstorming
- Example: "I need ideas for a magic system"
- Response: AI provides 3-5 creative concepts with brief explanations

**FR3.2.2 - Generation:** User requests complete world creation
- Example: "Create a fantasy world with 3 cultures"
- Response: AI generates comprehensive world with all requested elements

**FR3.2.3 - Expansion:** User requests more detail on existing elements
- Example: "Tell me more about the mountain culture"
- Response: AI expands on established details while maintaining consistency

**FR3.2.4 - Iteration:** User requests changes to existing world
- Example: "Make the magic system more scientific"
- Response: AI revises while preserving other established elements

**FR3.2.5 - Questioning:** User asks about world implications or details
- Example: "What would happen if these cultures went to war?"
- Response: AI provides logical extrapolation based on world rules

**FR3.2.6 - Guidance:** User asks for worldbuilding advice
- Example: "How can I make this world more original?"
- Response: AI provides specific suggestions and worldbuilding principles

**FR3.3:** The system shall recognize user intent from natural language without requiring specific command syntax.

**FR3.4:** The system shall ask clarifying questions when user requests are vague or ambiguous.

**FR3.5:** The system shall maintain a consistent tone: collaborative, expert, encouraging, and creative.

---

#### FR4: Context Management

**FR4.1:** The system shall maintain full conversation history for the current session.

**FR4.2:** The system shall include relevant context from the entire conversation when making AI requests.

**FR4.3:** The system shall extract and track key world elements from the conversation:
- World name and core concept
- Geography and locations
- Magic/technology systems
- Cultures and factions
- History and timeline
- Key characters and figures
- Conflicts and themes
- Unique features

**FR4.4:** The system shall ensure AI responses maintain consistency with previously established world details.

**FR4.5:** The system shall warn users if a request would contradict established world elements (unless user explicitly wants to change them).

**FR4.6:** The system shall handle long conversations by:
- Including full history for sessions <20 messages
- Creating summaries of earlier messages for sessions >20 messages
- Always including recent messages (last 5-10) in full

---

#### FR5: World Export

**FR5.1:** The system shall provide "Export" functionality accessible from the chat interface.

**FR5.2:** The system shall support JSON export format containing:
- Full conversation history (all messages with timestamps)
- Extracted world data (structured elements identified from conversation)
- Generation metadata (creation date, model used, token usage)
- User API key identifier (hashed, not full key)

**FR5.3:** The system shall support Markdown export format containing:
- Formatted conversation history
- Extracted world summary
- Organized sections with headings
- Readable format for Notion, Scrivener, or similar tools

**FR5.4:** The system shall generate downloadable files with descriptive names (e.g., "worldbuilding-session-2025-10-12.json").

**FR5.5:** The system shall provide a copy-to-clipboard option for both formats.

---

#### FR6: Session Management

**FR6.1:** The system shall allow users to start new worldbuilding sessions at any time.

**FR6.2:** The system shall warn users before clearing a current conversation if it contains unsaved data.

**FR6.3:** The system shall optionally save conversation sessions to localStorage (user preference).

**FR6.4:** The system shall allow users to load previously saved sessions.

**FR6.5:** The system shall display a list of saved sessions with titles (auto-generated or user-provided) and timestamps.

**FR6.6:** The system shall allow users to delete saved sessions.

---

#### FR7: Error Handling

**FR7.1:** The system shall handle API errors gracefully:
- Invalid API key: Clear message with instructions
- Rate limiting: Inform user to wait and retry
- Network errors: Retry with exponential backoff (3 attempts)
- Token limit exceeded: Inform user and suggest summarization or new session
- Model errors: Display error and suggest retry

**FR7.2:** The system shall never show raw error messages or technical stack traces to users.

**FR7.3:** The system shall log errors for debugging (console only, not sent to server).

**FR7.4:** The system shall provide recovery options for all error states (retry, new session, check API key).

---

#### FR8: User Preferences

**FR8.1:** The system shall allow users to configure:
- AI model selection (GPT-3.5-turbo, GPT-4, GPT-4-turbo)
- Temperature setting (creativity level: conservative, balanced, creative)
- Auto-save conversations (on/off)
- Message display preferences (compact, comfortable, spacious)

**FR8.2:** The system shall persist user preferences in localStorage.

**FR8.3:** The system shall provide tooltips explaining each preference option.

---

### Non-Functional Requirements

#### NFR1: Performance

**NFR1.1:** The application shall load and be interactive within 3 seconds on standard broadband connections.

**NFR1.2:** AI responses shall begin appearing within 5 seconds for simple requests, 30 seconds maximum for complex world generation.

**NFR1.3:** The interface shall remain responsive during AI generation (user can scroll, review history).

**NFR1.4:** The system shall handle conversations up to 50 messages without performance degradation.

**NFR1.5:** Export operations shall complete within 2 seconds for typical conversations (<30 messages).

---

#### NFR2: Reliability

**NFR2.1:** The system shall maintain 99% uptime (excluding OpenAI API downtime).

**NFR2.2:** The system shall handle OpenAI API failures gracefully with automatic retry logic.

**NFR2.3:** The system shall preserve conversation data in localStorage to prevent loss on page refresh.

**NFR2.4:** The system shall validate all user inputs to prevent XSS or injection attacks.

---

#### NFR3: Security

**NFR3.1:** API keys shall be stored encrypted in localStorage.

**NFR3.2:** API keys shall never be transmitted to any server except OpenAI's official endpoints.

**NFR3.3:** The application shall not collect or store any user data on external servers.

**NFR3.4:** All external API calls shall use HTTPS.

**NFR3.5:** The application shall sanitize all user inputs and AI outputs to prevent XSS attacks.

---

#### NFR4: Usability

**NFR4.1:** The interface shall be intuitive for users with basic web browsing skills.

**NFR4.2:** First-time users shall be able to start a worldbuilding conversation within 2 minutes of landing (including API key entry).

**NFR4.3:** The system shall provide contextual help and tooltips for key features.

**NFR4.4:** Error messages shall be clear, actionable, and non-technical.

**NFR4.5:** The interface shall follow accessibility standards (WCAG 2.1 Level AA minimum).

---

#### NFR5: Compatibility

**NFR5.1:** The application shall work on modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**NFR5.2:** The application shall be fully responsive:
- Desktop (1024px+)
- Tablet (768px-1023px)
- Mobile (320px-767px)

**NFR5.3:** Core functionality shall work without third-party cookies or local storage (with reduced features).

---

#### NFR6: Maintainability

**NFR6.1:** Code shall follow established style guides (ESLint, Prettier).

**NFR6.2:** All components shall have clear separation of concerns.

**NFR6.3:** Prompt engineering shall be separate from application logic.

**NFR6.4:** The system shall be easily extensible for new AI providers (Anthropic, local models).

---

#### NFR7: Cost Optimization

**NFR7.1:** The system shall minimize token usage while maintaining quality:
- Efficient context summarization for long conversations
- Removal of unnecessary prompt verbosity
- Smart caching of repeated elements

**NFR7.2:** The system shall display estimated token usage and cost for each request.

**NFR7.3:** The system shall warn users before operations estimated to cost >$0.10.

---

## User Stories

### Epic 1: Getting Started

**US1.1:** As a new user, I want to enter my OpenAI API key so I can use the assistant.
- Acceptance: Clear input field, validation, error messages for invalid keys

**US1.2:** As a user, I want to see example prompts so I understand how to use the assistant.
- Acceptance: Landing page shows 5-7 example prompts across different use cases

**US1.3:** As a user, I want to start a worldbuilding conversation immediately after entering my API key.
- Acceptance: Chat interface appears, ready for first message

---

### Epic 2: Core Conversations

**US2.1:** As an author, I want to ask for world ideas so I can overcome creative block.
- Acceptance: AI provides 3-5 unique ideas with brief explanations

**US2.2:** As an author, I want the AI to generate a complete world so I have a starting point.
- Acceptance: AI generates comprehensive world with cultures, magic, geography, conflicts

**US2.3:** As a user, I want to expand on specific world elements so I can add depth.
- Acceptance: AI remembers world context and generates consistent detailed expansions

**US2.4:** As a user, I want to make changes to the world so I can iterate on ideas.
- Acceptance: AI revises specific elements while maintaining consistency with unchanged parts

**US2.5:** As a user, I want to ask questions about my world so I can explore implications.
- Acceptance: AI provides logical, consistent answers based on world rules

---

### Epic 3: Context & Consistency

**US3.1:** As a user, I want the AI to remember everything we've discussed so I don't repeat myself.
- Acceptance: AI references earlier conversation details without being reminded

**US3.2:** As a user, I want the AI to maintain consistency so my world makes sense.
- Acceptance: AI responses never contradict established world facts

**US3.3:** As a user, I want to review our conversation history so I can check what we established.
- Acceptance: Scrollable conversation history with all messages visible

---

### Epic 4: Export & Save

**US4.1:** As an author, I want to export my world as a document so I can use it in my writing tools.
- Acceptance: Markdown export downloads with proper formatting

**US4.2:** As a user, I want to export the full conversation so I have a record of all ideas.
- Acceptance: JSON export includes all messages, timestamps, and metadata

**US4.3:** As a user, I want to save my conversation so I can continue later.
- Acceptance: Save button, session persists, can be reloaded

**US4.4:** As a user, I want to manage multiple saved worlds so I can work on different projects.
- Acceptance: List of saved sessions, load/delete functionality

---

### Epic 5: Quality & Originality

**US5.1:** As a user, I want the AI to avoid fantasy clichés so my world is original.
- Acceptance: AI responses use creative, specific language; avoid tropes

**US5.2:** As a user, I want worldbuilding guidance so I can improve my ideas.
- Acceptance: AI can provide advice, suggestions, and worldbuilding principles

**US5.3:** As a user, I want the AI to ask clarifying questions so it understands what I need.
- Acceptance: When requests are vague, AI asks specific questions

---

### Epic 6: Error Handling & Reliability

**US6.1:** As a user, I want clear error messages if something goes wrong so I know how to fix it.
- Acceptance: All errors show user-friendly messages with actions

**US6.2:** As a user, I want the system to retry failed requests so transient issues don't interrupt me.
- Acceptance: Automatic retry with exponential backoff (3 attempts)

**US6.3:** As a user, I want my conversation to persist through page refreshes so I don't lose work.
- Acceptance: Auto-save to localStorage, conversation restores on reload

---

## Out of Scope (MVP)

**Post-MVP Features:**
- Multi-user collaboration (sharing, co-editing)
- Backend database for cloud save
- User accounts and authentication
- Visual generation (maps, character portraits)
- Integration with external tools (Notion API, Scrivener import)
- Advanced conversation branching (alternate timelines)
- Custom AI model fine-tuning
- Community features (public gallery, templates)
- Multi-language support
- Voice input/output
- Real-time collaboration

---

## Success Metrics

### MVP Launch Criteria (Week 8)

**Core Functionality:**
- ✅ Users can enter API keys and start conversations
- ✅ AI maintains context throughout sessions
- ✅ Export works for JSON and Markdown
- ✅ Mobile responsive on all viewports
- ✅ Error handling covers all failure modes

**Quality Metrics:**
- 90%+ successful conversation completions (no critical errors)
- <30s average AI response time for generations
- 95%+ of AI responses maintain world consistency
- Zero API key security incidents

**User Engagement:**
- 40%+ of users have conversations >5 messages
- 20%+ of users export their worlds
- Users return within 7 days (20%+ retention)

---

## Technical Architecture

### High-Level Components

1. **Chat Interface (ChatInterface.svelte)**
   - Message display
   - Input handling
   - Typing indicators
   - Conversation history

2. **Context Manager (contextManager.js)**
   - Message history tracking
   - World state extraction
   - Context summarization for long conversations
   - Consistency checking

3. **Prompt System (worldbuildingPrompts.js)**
   - System prompts for worldbuilding specialization
   - User intent detection
   - Dynamic prompt construction
   - Anti-cliché constraints

4. **API Service (openaiService.js)**
   - OpenAI API integration
   - Retry logic and error handling
   - Token counting and cost estimation
   - Request/response processing

5. **Export System (exportService.js)**
   - JSON formatter
   - Markdown formatter
   - File download generation
   - Clipboard operations

6. **Session Manager (sessionManager.js)**
   - localStorage persistence
   - Session save/load
   - Session list management
   - Auto-save functionality

---

## Open Questions

1. **Model Selection:** Default to GPT-3.5-turbo or GPT-4 for better quality?
2. **Context Limit:** How many messages before forced summarization?
3. **Prompt Strategy:** Single system prompt or multi-prompt approach with role-play?
4. **Export Format:** What specific sections should Markdown export include?
5. **Session Naming:** Auto-generate from first message or require user input?
6. **Collaboration:** Should v1 include basic sharing (read-only links)?

---

## Appendix A: Prompt Engineering Strategy

### System Prompt Goals

1. **Specialization:** Act as worldbuilding expert, not general assistant
2. **Originality:** Avoid fantasy clichés and tropes
3. **Consistency:** Remember and reference established world details
4. **Collaboration:** Ask questions, make suggestions, provide guidance
5. **Flexibility:** Handle ideation, generation, iteration, and questioning

### Anti-Cliché Constraints

- Avoid: "The [Adj] [Noun]" naming patterns
- Avoid: Generic descriptors (ancient, mystical, dark, light)
- Avoid: Overused tropes (chosen ones, light vs dark, crystal magic)
- Prefer: Specific details, unique mechanics, unexpected combinations

### Example System Prompt Outline

```
You are an expert worldbuilding assistant helping authors and creators
develop rich, original fictional worlds.

Guidelines:
- Be creative and avoid fantasy clichés
- Maintain consistency with established world details
- Ask clarifying questions when requests are ambiguous
- Provide worldbuilding expertise and guidance
- Use specific, concrete details over generic descriptions
- Suggest improvements and creative directions
- Remember everything discussed about the current world

[Additional constraints and examples...]
```

---

## Appendix B: User Flow Diagrams

### First-Time User Flow

```
Landing Page
    ↓
Enter API Key
    ↓
[Validate Key]
    ↓ (valid)
Chat Interface (with example prompts)
    ↓
User sends first message
    ↓
AI responds
    ↓
Conversation continues
    ↓
[Optional: Export/Save]
```

### Returning User Flow

```
Landing Page (has key in localStorage)
    ↓
[Auto-validate key]
    ↓
Chat Interface (empty or restored session)
    ↓
[Optional: Load Saved Session]
    ↓
Continue conversation
```

---

**Version History:**

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-12 | 3.0 | Complete rewrite for conversational assistant | PM |
| 2025-10-11 | 2.0 | (Archived) Structured worldbuilding engine | PM |
| 2025-10-11 | 1.0 | (Archived) Text adventure game | PM |
