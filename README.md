# AI Adventure Engine

An AI-powered text adventure game that generates completely unique worlds, stories, and choices for every playthrough. Experience infinite replay value with D&D-depth storytelling without the mechanical complexity.

## 🚀 Live Demo

**Test Harness:** https://textgame-bbyaivkna-mishas-projects-0509f3dc.vercel.app

Try the prompt testing interface to generate unique fantasy worlds and interactive narratives! Enter your OpenAI API key and test world generation and narrative progression.

## Project Overview

AI Adventure Engine leverages OpenAI's language models to act as a personal AI dungeon master, creating procedurally generated narratives that maintain coherence across extended gameplay sessions. Users provide their own API keys, giving them full control over their AI experience and costs.

## Features (MVP)

- **Unique World Generation**: Every playthrough creates an entirely new world with original cultures, conflicts, and themes
- **Fantasy Theme**: Immersive fantasy adventures with magic systems and original lore (launch theme)
- **Meaningful Choices**: 2-4 choice-based decision points that impact story direction
- **Session-Based Gameplay**: No save/load system - each adventure is a single session
- **Cost Transparency**: Real-time API usage tracking and cost warnings
- **Mobile-Responsive**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Svelte 5
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Code Quality**: ESLint + Prettier
- **Deployment**: Vercel/Netlify (static hosting)
- **AI Integration**: OpenAI API (GPT-3.5-turbo / GPT-4)

## Project Structure

```
/textgamea
  /frontend           # Web application code
    /src
      /components     # Svelte components
      /lib            # Utility functions and API integration
      /prompts        # AI prompt templates
      /assets         # Static assets
      app.css         # Global styles with Tailwind
      App.svelte      # Root component
      main.js         # Application entry point
  /docs              # PRD, architecture, stories
  .bmad-core/        # BMAD framework
  .claude/           # Claude Code commands
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key (get one at https://platform.openai.com/api-keys)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd textgamea
   ```

2. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint checks
- `npm run format` - Format code with Prettier

## Development Workflow

1. **Prompt Engineering** (Weeks 1-3): Create and refine AI prompts for world generation, narrative progression, and choice generation
2. **UI Development** (Weeks 3-4): Build web interface components
3. **Integration** (Week 5): Connect UI to OpenAI API with error handling
4. **Testing** (Week 6): Manual testing and prompt refinement
5. **Polish** (Week 7): Mobile responsive design, cost warnings, edge cases
6. **Beta Testing** (Week 8): User testing and critical bug fixes

## Environment Variables

Copy `.env.example` to `.env.local` for local configuration:

```bash
cp .env.example .env.local
```

**Note**: API keys are stored client-side only. No environment variables are required for the application itself - users provide their own OpenAI API keys through the web interface.

## Deployment

The project is configured for one-click deployment to Vercel or Netlify.

### Quick Deploy

**Vercel (Recommended):**
1. Push your code to GitHub
2. Import project at https://vercel.com/new
3. Deploy with zero configuration (uses `vercel.json`)

**Netlify:**
1. Push your code to GitHub
2. Import project at https://app.netlify.com/start
3. Deploy with zero configuration (uses `netlify.toml`)

**Both platforms provide:**
- Automatic HTTPS
- Continuous deployment on git push
- Free tier (perfect for this project)
- <3 minute deployment time

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions, troubleshooting, and custom domain setup.

## Contributing

This is currently a solo development project for MVP. Contribution guidelines will be added post-launch.

## License

MIT License (or your chosen license)

## Roadmap

### Epic 1: Foundation & Prompt Engineering (Current)
- ✅ Project setup and infrastructure (Story 1.1)
- ✅ OpenAI API integration with retry logic (Story 1.2)
- ✅ API key storage and retrieval (Story 1.3)
- ✅ Prompt testing harness (Story 1.4)
- ✅ World generation prompt (Story 1.5)
- ✅ Narrative progression prompt (Story 1.6)
- ✅ Context management & error handling (Story 1.7)
- ✅ Deployment pipeline configured (Story 1.8)

### Epic 2: Web UI & Game Loop (Next)
- 🔄 Landing page with API key input
- 🔄 Theme selection screen
- 🔄 Game initialization
- 🔄 Narrative display components
- 🔄 Choice buttons and interactions
- 🔄 Full playthrough experience

### Post-MVP
- Additional themes (Cyberpunk, Steampunk)
- Save/load functionality
- Story sharing features
- Multi-AI provider support
- User accounts and preferences
- Advanced prompt customization

## Contact

For questions or feedback about AI Adventure Engine, please open an issue or contact [your contact info].

---

**Built with Claude Code** 🤖
