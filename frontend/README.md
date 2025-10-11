# AI Adventure Engine - Frontend

This is the web application for AI Adventure Engine, built with Svelte and Vite.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
/src
  /components     # Svelte components
  /lib            # API integration and utilities
  /prompts        # AI prompt templates (YAML/JSON)
  /assets         # Images, icons, etc.
  app.css         # Global styles with Tailwind directives
  App.svelte      # Root component
  main.js         # Application entry point
```

## Tech Stack

- **Svelte 5**: Reactive UI framework
- **Vite 7**: Fast build tool with HMR
- **Tailwind CSS 4**: Utility-first CSS framework
- **ESLint + Prettier**: Code quality and formatting

## Development Notes

- OpenAI API key is user-provided and stored client-side only
- No backend server required - direct browser-to-OpenAI API calls
- Session-based gameplay (no persistence for MVP)
- Mobile-first responsive design

For more information, see the main README at the project root.
