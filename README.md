# AI Adventure Engine

An AI-powered text adventure game that generates completely unique worlds, stories, and choices for every playthrough. Experience infinite replay value with D&D-depth storytelling without the mechanical complexity.

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

## Contributing

This is currently a solo development project for MVP. Contribution guidelines will be added post-launch.

## License

MIT License (or your chosen license)

## Roadmap

### MVP (Current)
- ✅ Project setup and infrastructure
- 🔄 OpenAI API integration
- 🔄 Fantasy theme prompt engineering
- 🔄 Web UI development
- 🔄 Cost management and warnings
- 🔄 Beta testing

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
