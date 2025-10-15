# AI Worldbuilding Assistant

A conversational AI assistant specialized in worldbuilding for authors, game designers, and creative hobbyists. Unlike general AI chatbots, this assistant understands worldbuilding principles and helps you brainstorm, create, and iteratively refine rich fictional worlds through natural conversation.

## 🚀 Live Demo

**Live App:** https://textgame-bbyaivkna-mishas-projects-0509f3dc.vercel.app

Experience the v3.0 conversational worldbuilding interface with AI-guided interviews, quality systems, and progressive world generation!

## What Is This?

Imagine ChatGPT, but specialized for worldbuilding. This assistant:
- **Understands worldbuilding** - Helps you create consistent, original fictional worlds
- **Remembers everything** - Maintains full context of your world throughout the conversation
- **Asks smart questions** - Clarifies your ideas and suggests creative directions
- **Avoids clichés** - Generates original content, not generic fantasy tropes
- **Exports your work** - Download worlds as JSON or Markdown for your writing tools

## Who Is This For?

**Authors** building worlds for novels, short stories, or series
**Game Designers** creating campaign settings for D&D, Pathfinder, or video games
**Worldbuilding Hobbyists** who enjoy creating fictional worlds for fun
**Creative Writers** looking to overcome creative blocks with AI collaboration

## How It Works

1. **Enter your OpenAI API key** - You control costs and own your data
2. **Start a conversation** - Chat naturally about your worldbuilding needs
3. **Collaborate with AI** - Brainstorm ideas, generate worlds, iterate on concepts
4. **Export your world** - Download as JSON or Markdown for external tools

### Example Conversations

**Brainstorming:**
> "I need ideas for a magic system that's different from typical fantasy."
>
> *AI suggests 3-5 unique concepts with explanations*

**World Generation:**
> "Create a fantasy world with 3 cultures, an unusual magic system, and political conflicts."
>
> *AI generates comprehensive world with all elements*

**Iteration:**
> "Make the magic system more scientific and add economic consequences."
>
> *AI revises while maintaining consistency with other established details*

**Expansion:**
> "Tell me more about daily life in the mountain culture."
>
> *AI expands on established culture with consistent details*

**Questioning:**
> "What would happen if these two cultures went to war?"
>
> *AI explores logical implications based on world rules*

## Why Not Just Use ChatGPT?

ChatGPT is powerful but generic. It tends to generate:
- Overused fantasy tropes (light vs dark, chosen ones, crystal magic)
- Generic naming patterns ("The [Adj] [Noun]")
- Shallow worlds lacking internal consistency
- Responses that don't remember earlier worldbuilding details

This assistant uses specialized prompts and context management to:
- Generate original, specific, detailed content
- Maintain world consistency across the entire conversation
- Provide worldbuilding expertise and guidance
- Avoid clichés through creative constraints

## Features

### Core Features
- **Conversational Interface** - Natural chat-based worldbuilding collaboration
- **Context Management** - AI remembers everything about your world
- **Specialized Prompts** - Optimized for originality and consistency
- **Intent Recognition** - Understands brainstorming, generation, iteration, expansion, and questioning
- **Export Functionality** - Download as JSON or Markdown
- **Session Management** - Save and load multiple worldbuilding projects

### Quality Features ✨ **Phase 1 Complete**

**Chain-of-Thought Reasoning** (Task 1.1)
- Structured 5-step reasoning before generation
- Forces AI to think through implications, conflicts, and specificity
- Ensures originality checks happen systematically

**Cliché Detection** (Task 1.2)
- 80+ pattern detection across genres (fantasy, sci-fi, horror, contemporary)
- Catches: "Chosen one", "Dark lord", "Ancient evil", "The [Adjective] [Noun]"
- Automatic scoring and actionable feedback
- Zero API cost (pure pattern matching)

**Genre System** (Task 1.3)
- 8 supported genres with auto-detection
- Genre-specific quality priorities (e.g., fantasy emphasizes originality 35%, sci-fi emphasizes implications 35%)
- Genre-specific cliché warnings
- Multi-genre blending support

**Sanderson's Laws** (Task 1.4)
- **Hard Magic** (default): 4 required limitation types (constraints, costs, vulnerabilities, social restrictions)
- **Soft Magic** (on request): Mystery preservation, no Deus Ex Machina
- Auto-detects user preference from keywords ("soft magic", "mysterious", etc.)
- Comprehensive validation and feedback

**Constitutional AI**
- Self-critique and revision loop
- 5 quality principles: Originality, Specificity, Implications, Consistency, Mundane Grounding
- Parallel execution for efficiency

**Expected Impact**: +30-40% quality improvement through targeted guidance

### Technical Features
- **User-Owned API Keys** - You control costs, no subscription
- **Client-Side Only** - Your data never leaves your browser
- **Mobile Responsive** - Works on desktop, tablet, and mobile
- **Modern Stack** - Svelte 5, Vite 7, Tailwind CSS 4

## Tech Stack

- **Framework**: Svelte 5
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Code Quality**: ESLint + Prettier
- **Deployment**: Vercel (static hosting)
- **AI Integration**: OpenAI API (user-provided keys)

## Project Structure

```
/textgamea
  /frontend           # Web application
    /src
      /components     # Svelte components (ChatInterface, etc.)
      /lib            # API integration, context management
      /prompts        # Worldbuilding prompt system
      /services       # Export, session management
      app.css         # Global styles with Tailwind
      App.svelte      # Root component
      main.js         # Entry point
  /docs              # Project documentation
    brief-v3.md      # Project brief (current vision)
    prd-v3.md        # Product requirements (current)
    /archive         # Previous versions (v1 game, v2 engine)
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd textgamea
   ```

2. Navigate to frontend:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open browser to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint checks
- `npm run format` - Format code with Prettier
- `npm test` - Run Playwright tests

## Phase 1: Quality Enhancements ✅ **COMPLETE**

**Implementation Date**: October 13, 2025
**Goal**: Improve worldbuilding quality by +30-40% through targeted prompt enhancements

### Completed Tasks

- ✅ **Task 1.0**: Secure API Key Input
- ✅ **Task 1.1**: Chain-of-Thought Reasoning Integration
- ✅ **Task 1.2**: Cliché Detection System (80+ patterns)
- ✅ **Task 1.3**: Genre Selection System (8 genres with auto-detection)
- ✅ **Task 1.4**: Sanderson Limitation Enforcement (hard + soft magic)
- ✅ **Task 1.5**: Code Cleanup and Documentation

**Details**: See task completion summaries:
- [Task 1.2 - Cliché Detection](TASK_1.2_CLICHE_DETECTION_COMPLETE.md)
- [Task 1.3 - Genre System](TASK_1.3_GENRE_SYSTEM_COMPLETE.md)
- [Task 1.4 - Sanderson's Laws](TASK_1.4_SANDERSON_LAWS_COMPLETE.md)

**Test Coverage**: 100% pass rate across all quality systems (38 tests total)

## Phase 2: Production Integration ✅ **COMPLETE**

**Implementation Date**: October 13, 2025
**Goal**: Integrate Phase 1 quality systems into production UI

### Completed

- ✅ **Automatic Genre Detection** - Detects genre from user input (8 genres)
- ✅ **Magic Style Detection** - Auto-detects hard vs soft magic
- ✅ **Genre-Aware Prompts** - System prompts adapt to detected genre
- ✅ **Sanderson's Laws Integration** - Adds appropriate guidance (hard/soft)
- ✅ **Cliché Analysis Display** - Shows originality score and detected clichés
- ✅ **Magic Validation Display** - Shows validation results and suggestions
- ✅ **Quality Metrics Toggle** - UI panels hidden by default, toggle to view

**Details**: See [Phase 2 Integration Complete](PHASE_2_INTEGRATION_COMPLETE.md)

### What Users Get Now

When creating a world, users automatically benefit from:
- Genre detection displayed in chat (e.g., "Detected: Fantasy, hard magic")
- Genre-specific worldbuilding guidance applied to generation
- Cliché analysis (80+ patterns checked) with originality score
- Magic system validation against Sanderson's Laws
- Actionable feedback on quality improvements

**Ready for**: User testing and feedback iteration

## Version History

### v3.0 (Current) - AI Worldbuilding Assistant
**Vision:** Conversational AI specialized for worldbuilding collaboration
**Status:** In development
**Docs:** `docs/brief-v3.md`, `docs/prd-v3.md`

### v2.0 (Archived) - AI Worldbuilding Engine
**Vision:** Structured world generation with button-driven expansion
**Status:** Archived (pivoted to v3)
**Docs:** `docs/archive/v2-worldbuilding-engine/`

### v1.0 (Archived) - Text Adventure Game
**Vision:** Interactive text-based game with AI-generated worlds
**Status:** Archived (pivoted to v2, then v3)
**Docs:** `docs/archive/v1-game-concept/`

## Documentation

### Phase 1 Quality Enhancements
- **[Task 1.2: Cliché Detection](TASK_1.2_CLICHE_DETECTION_COMPLETE.md)** - 80+ pattern detection system
- **[Task 1.3: Genre System](TASK_1.3_GENRE_SYSTEM_COMPLETE.md)** - 8-genre support with auto-detection
- **[Task 1.4: Sanderson's Laws](TASK_1.4_SANDERSON_LAWS_COMPLETE.md)** - Hard/soft magic frameworks
- **[Prompt System README](frontend/src/prompts/README.md)** - Active prompts documentation

### Project Documentation
- **[Project Brief v3](docs/brief-v3.md)** - Vision, target users, competitive landscape
- **[PRD v3](docs/prd-v3.md)** - Functional requirements, user stories, technical architecture
- **[Master Quality Plan](docs/MASTER_QUALITY_IMPLEMENTATION_PLAN.md)** - Complete quality improvement roadmap
- **[Constitutional AI System](docs/CONSTITUTIONAL_AI_SYSTEM.md)** - Self-critique framework
- **[Testing Guide](docs/TESTING_GUIDE.md)** - How to test the application

### Research
- **[Sanderson Research](docs/SANDERSON_WORLDBUILDING_RESEARCH.md)** - Brandon Sanderson's worldbuilding principles
- **[Prompt Research](docs/PROMPT_RESEARCH_FINDINGS.md)** - Prompt engineering best practices
- **[Quality Analysis](docs/VARIETY_QUALITY_BESTPRACTICES_ANALYSIS.md)** - Worldbuilding quality benchmarks

## Contributing

This is currently a solo development project. Contribution guidelines will be added after MVP launch.

## License

MIT License (or your chosen license)

## Contact

For questions, feedback, or bug reports, please open an issue or contact [your contact info].

---

**Built with Claude Code** 🤖
