# AI Worldbuilding Engine

An AI-powered worldbuilding tool that generates rich, detailed fantasy worlds for creative writers, game designers, and worldbuilding hobbyists. Generate complete worlds with cultures, magic systems, histories, and conflicts in minutes, then expand any aspect on-demand.

## 🚀 Live Demo

**Live App:** https://textgame-bbyaivkna-mishas-projects-0509f3dc.vercel.app

Enter your OpenAI API key and generate comprehensive fantasy worlds! Explore cultures, create characters and locations, generate legends, and export everything as JSON or Markdown for use in your projects.

## Project Overview

AI Worldbuilding Engine leverages OpenAI's language models to create complete, interconnected fantasy worlds with depth comparable to published D&D settings—in just 2-3 minutes. Users provide their own API keys, giving them full control over their AI experience and costs.

## Features (MVP)

- **Comprehensive World Generation**: Every world includes 10 detailed sections: theme, geography, history, magic system, cultures, conflicts, economy, daily life, unique features, and hidden secrets
- **On-Demand Content Creation**: Generate characters, locations, legends, and historical events specific to your world
- **Culture Exploration**: Dive deep into any culture with expanded daily life, notable figures, and locations
- **Freeform Questioning**: Ask anything about your world and get coherent, context-aware answers
- **Export Functionality**: Download complete worlds as JSON or Markdown for integration with Notion, Scrivener, or other tools
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

1. **Prompt Engineering** (Weeks 1-3): Create and refine AI prompts for world generation and content expansion
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

### Epic 1: Foundation & Prompt Engineering ✅ (Complete)
- ✅ Project setup and infrastructure (Story 1.1)
- ✅ OpenAI API integration with retry logic (Story 1.2)
- ✅ API key storage and retrieval (Story 1.3)
- ✅ Prompt testing harness (Story 1.4)
- ✅ World generation prompt (Story 1.5)
- ✅ World expansion prompts - characters, locations, legends, events (Story 1.6)
- ✅ Context management & error handling (Story 1.7)
- ✅ Deployment pipeline configured (Story 1.8)

### Epic 2: Web UI & Worldbuilding Experience ✅ (Complete)
- ✅ Landing page with API key input
- ✅ Theme selection screen
- ✅ World generation with progress tracking
- ✅ World explorer with organized sections
- ✅ Culture exploration and expansion
- ✅ On-demand content generation (characters, locations, legends, historical events)
- ✅ Freeform world questioning
- ✅ Export functionality (JSON and Markdown)

### Post-MVP
- Additional themes (Cyberpunk, Steampunk, Sci-Fi, Horror)
- Save/load functionality (cloud storage)
- World sharing features (public gallery, remixing)
- Multi-AI provider support (Anthropic, local models)
- User accounts and preferences
- Advanced prompt customization (tone, complexity, originality)
- Collaborative worldbuilding (team editing)
- Image generation (maps, character portraits)

## Contact

For questions or feedback about AI Worldbuilding Engine, please open an issue or contact [your contact info].

---

**Built with Claude Code** 🤖
