# AI Worldbuilding Engine - Product Requirements Document (PRD)

**Version:** 2.0
**Status:** Active
**Last Updated:** 2025-10-11

---

## Goals and Background Context

### Goals

- Enable rapid generation of rich, detailed fantasy worlds for creative professionals and hobbyists
- Provide on-demand content expansion for any world aspect (cultures, characters, locations, legends)
- Deliver D&D-quality worldbuilding depth in minutes instead of weeks
- Support export functionality for integration with external tools (Notion, Scrivener, game engines)
- Enable users to own their AI experience through user-provided API keys (zero infrastructure costs)
- Launch functional MVP within 6-8 weeks with complete worldbuilding capabilities
- Achieve 90%+ technical reliability (world generations complete without critical AI failures)
- Maintain 40%+ user engagement (users expand at least one world aspect)

### Background Context

Creative writers and game designers spend weeks or months building fantasy worlds manually. This time-intensive process delays projects, causes creative blocks, and often results in shallow or inconsistent world details. While AI chatbots can generate content, they lack structure, organization, and export capabilities needed for professional workflows.

AI Worldbuilding Engine addresses this by providing structured, comprehensive world generation with the ability to drill down into any aspect on-demand. Unlike template-based tools (World Anvil, Campfire) or unstructured AI chatbots (ChatGPT), this engine combines depth, structure, and flexibility in a single tool.

**Competitive Landscape:**

The worldbuilding and creative writing tool space has several established players:

- **World Anvil / Campfire:** Manual worldbuilding platforms with templates and organization tools. Excellent for documenting existing worlds, but require users to create all content manually. No AI generation capabilities.
- **ChatGPT / Claude Direct Use:** Powerful AI but unstructured. Users must manually prompt, organize, and export content. No built-in worldbuilding framework or state management.
- **AI Dungeon / NovelAI:** Focus on narrative generation and interactive fiction. Less structured worldbuilding capabilities. Subscription-based models with no user control over AI provider.
- **Random Generators (Donjon, Fantasy Name Generators):** Generate isolated elements (names, maps, NPCs) but lack coherence and interconnected systems.

**Market Gap:** No current product combines structured AI worldbuilding + on-demand expansion + comprehensive export + user-owned AI keys. AI Worldbuilding Engine fills this gap by treating worldbuilding as a professional creative tool, not a game or entertainment product.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-11 | v2.0 | Complete rewrite for worldbuilding engine (pivot from game concept) | PM |
| 2025-10-11 | v1.2 | Updated OpenAI pricing (archived - v1 game concept) | PM |
| 2025-10-11 | v1.1 | Added competitive analysis and data requirements (archived) | PM |
| 2025-10-11 | v1.0 | Initial PRD creation from project brief (archived - v1 game concept) | PM |

---

## Requirements

### Functional Requirements

**FR1:** The system shall accept and securely store user-provided OpenAI API keys in browser localStorage, with clear input validation and error messaging for invalid keys.

**FR2:** The system shall provide a theme selection interface offering Fantasy theme for MVP, with extensible architecture for future themes (Cyberpunk, Steampunk).

**FR3:** Upon initiating world generation, the AI shall generate a comprehensive unique world including:
- Core theme and tagline
- Detailed geography with major locations
- Complete history (ancient era, formative conflict, recent history)
- Original magic system with rules, social impact, costs, and variants
- Multiple cultures (2-4) with descriptions, values, economies, and notable figures
- Central conflicts and tensions
- Economic systems and trade
- Daily life details
- Unique feature that distinguishes the world
- Hidden secrets for storytelling depth

**FR4:** The system shall display the generated world in an organized, navigable interface with sections for geography, history, magic, cultures, conflicts, economy, and daily life.

**FR5:** The system shall allow users to explore and expand individual cultures, generating detailed information including:
- Daily life descriptions
- Notable figures with roles, descriptions, and personalities
- Specific locations within that culture
- Expanded relationship to magic and economy

**FR6:** The system shall provide on-demand generation of:
- **Characters:** Full NPCs with name, age, role, culture, physical description, personality, goal, distinctive trait, and secret
- **Locations:** Named places with type, description, inhabitants, current situation, and memorable details
- **Legends:** Myths/stories with title, timeframe, narrative, moral/lesson, and cultural significance
- **Historical Events:** Named events with timeframe, description, key figures, consequences, and cultural perspectives

**FR7:** The system shall allow users to ask freeform questions about the world and receive coherent, context-aware answers that maintain world consistency.

**FR8:** The system shall provide export functionality in two formats:
- **JSON:** Complete structured data including world, all expansions, and generation metadata
- **Markdown:** Formatted document with headings, sections, and readable layout for use in external tools

**FR9:** The system shall support mobile-responsive design accessible on modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+).

**FR10:** The system shall provide visual feedback during AI response generation (loading indicators) with 30-120 second expected response times for world generation, 10-30 seconds for expansions.

**FR11:** The system shall handle API errors gracefully with clear user messaging and recovery options (retry, use different API key).

**FR12:** The system shall allow users to start new worlds at any time, generating fresh unique worlds with independent state.

---

### Non-Functional Requirements

**NFR1:** The web application shall load in under 3 seconds on 4G connections.

**NFR2:** The system shall minimize bandwidth usage, with initial app load under 200KB (gzipped).

**NFR3:** The application shall use zero-cost hosting infrastructure (Vercel, Netlify, or Cloudflare Pages free tier).

**NFR4:** API error rate shall remain below 5% of total generation requests.

**NFR5:** The system shall maintain HTTPS for all traffic to protect API key transmission.

**NFR6:** User API keys shall never be transmitted to application servers, only directly to OpenAI endpoints.

**NFR7:** The system shall provide prominent cost warnings and usage estimates to prevent user API cost surprises.

**NFR8:** The application shall be developed using open-source tools only, maintaining $0-100 total MVP budget.

**NFR9:** Code shall be maintainable for solo developer iteration with clear separation of prompt templates from application logic.

**NFR10:** The system shall support 90%+ successful world generation completion rate (no critical AI coherence failures or technical errors).

---

## User Interface Design Goals

### Overall UX Vision

Create a clean, organized interface that prioritizes exploration and discovery. The UI should feel like a professional creative tool - elegant typography, clear information hierarchy, and intuitive navigation between world sections. Users should be able to generate worlds quickly, then dive deep into any aspect that interests them. The design should support both quick inspiration-seeking and detailed worldbuilding workflows.

### Key Design Principles

1. **Clarity Over Complexity:** Show world information in digestible sections, not overwhelming walls of text
2. **Progressive Disclosure:** Start with overview, reveal details on demand
3. **Creative Focus:** UI stays out of the way, letting the world content shine
4. **Export-Ready:** Information presented in ways that translate well to exported formats
5. **Mobile-First Responsive:** Usable on phones for on-the-go inspiration, optimized for desktop for serious worldbuilding

---

## Target Users & Personas

### Primary Persona: Creative Worldbuilder ("The Writer")

**Demographics:**
- Age: 25-45
- Occupation: Fantasy/sci-fi writer (professional or aspiring)
- Tech comfort: Moderate to high
- Income: Varies (willing to pay $2-5 for world generation via their API)

**Behaviors:**
- Writes fantasy or sci-fi novels, short stories, or scripts
- Spends 5-10 hours/week on creative writing
- Uses tools like Scrivener, Notion, Google Docs
- Active in writing communities (Reddit, Discord, forums)
- Consumes fantasy media voraciously (books, shows, games)

**Motivations:**
- Wants unique worlds, not generic fantasy tropes
- Needs consistent, detailed world foundations before writing
- Seeks inspiration to overcome creative blocks
- Values time efficiency (prefers generating worlds over months of manual work)

**Pain Points:**
- Worldbuilding takes weeks, delaying actual writing
- Manually created worlds risk inconsistencies
- Generic templates feel uninspired
- ChatGPT/Claude lack structure and export capabilities

**Goals:**
- Generate complete world in minutes
- Expand specific cultures/locations as story needs arise
- Export to Notion/Scrivener for reference while writing
- Maintain creative control (not locked into AI suggestions)

**Scenario:**
Sarah is writing a fantasy novel set in a world where magic is powered by music. She spends 2 hours generating and refining the world, expanding the culture of "Soundweavers," generating 3 main characters, and creating 5 key locations. She exports the world as Markdown, imports it to Notion, and starts writing her first chapter with rich world details at her fingertips.

**Quote:** *"I need a world that feels real and consistent, but I don't have months to build it. I want to start writing my story this week, not next year."*

---

### Secondary Persona: Tabletop Game Master ("The GM")

**Demographics:**
- Age: 28-50
- Occupation: D&D/Pathfinder Game Master (hobby, occasionally paid)
- Tech comfort: Moderate
- Income: Middle class, willing to spend $3-8 per campaign setting

**Behaviors:**
- Runs weekly or bi-weekly tabletop RPG sessions
- Spends 2-5 hours/week on campaign prep
- Uses tools like D&D Beyond, Roll20, Notion for session notes
- Browses /r/DnD, /r/DMAcademy for inspiration
- Collects campaign modules and settings

**Motivations:**
- Needs unique settings to keep players engaged
- Wants to reduce prep time without losing quality
- Seeks "just-in-time" NPC and location generation
- Values flexibility to adapt worlds mid-campaign

**Pain Points:**
- Creating homebrew settings takes dozens of hours
- Published settings feel overused
- Improv can lead to inconsistent world details
- Players ask questions about world lore during sessions

**Goals:**
- Generate campaign setting quickly
- Create NPCs and locations during prep or live
- Export worlds to share with players via Discord/Google Docs
- Maintain coherence across 20+ session campaign

**Scenario:**
Mark runs a weekly D&D game. He generates a new world for his upcoming campaign, expands the two main cultures his players will interact with, creates 5 NPCs for the starting city, and generates 3 legends the players might uncover. During sessions, he references the exported Markdown document and generates new locations on-the-fly when players go off-script.

**Quote:** *"I need a setting that feels deep enough for a year-long campaign, but I can't spend 40 hours building it. My players are starting next week."*

---

### Tertiary Persona: Worldbuilding Hobbyist ("The Explorer")

**Demographics:**
- Age: 18-35
- Occupation: Various (worldbuilding is a hobby)
- Tech comfort: High
- Income: Lower to middle class, willing to spend $1-3 per world

**Behaviors:**
- Builds fantasy/sci-fi worlds for fun (not tied to specific projects)
- Active on /r/worldbuilding, Worldbuilding Stack Exchange
- Shares worlds on forums and social media
- Uses World Anvil or personal wikis to document creations
- Explores "what if" scenarios and alternative magic systems

**Motivations:**
- Enjoys the creative process of worldbuilding itself
- Wants to experiment with unusual concepts
- Seeks community recognition for unique worlds
- Values iteration and exploration over final products

**Pain Points:**
- Manual worldbuilding is time-consuming
- Starting from scratch is intimidating
- Hard to maintain consistency across large worlds
- Limited feedback on world concepts

**Goals:**
- Generate worlds quickly to explore ideas
- Experiment with different themes and concepts
- Export to World Anvil or personal wikis
- Share worlds with online communities

**Scenario:**
Jamie loves worldbuilding but doesn't write stories or run games. They use the tool 2-3 times per week to generate different worlds, exploring concepts like "magic powered by emotions" or "cultures based on musical traditions." They export favorites to World Anvil and share them on /r/worldbuilding for feedback.

**Quote:** *"I love creating worlds, but I want to spend my time refining ideas, not filling in every detail manually."*

---

## Technical Requirements

### Browser Compatibility

**Supported Browsers:**
- Desktop: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ (1920x1080 typical)
- Mobile: iOS Safari 14+, Android Chrome 90+ (375x667 to 414x896 typical)
- Tablet: Responsive design scales gracefully for iPad and Android tablets

**Responsive approach:** Mobile-first design that scales up to desktop.

**Out of scope for MVP:** Native iOS/Android apps, offline support, IE11, outdated browsers.

---

## Technical Assumptions

### Repository Structure: Monorepo

**Decision:** Single repository containing frontend code and documentation.

**Structure:**
```
/textgamea
  /frontend        # Web application code
  /docs           # PRD, architecture, documentation
  .bmad-core/     # BMAD framework
  .claude/        # Claude Code commands
```

**Rationale:** Simple for solo developer - all code in one place, easy coordination, no multi-repo complexity.

---

### Service Architecture

**Decision:** Client-side Single Page Application (SPA) with no backend.

**Architecture:**
- **Frontend:** Browser-based JavaScript application handling all UI and worldbuilding logic
- **API Layer:** Direct calls from browser to OpenAI API (user-provided keys)
- **State Management:** Client-side only, session-based (no server-side state)
- **Deployment:** Static site hosting (Vercel free tier)

**Technologies:**
- **Frontend Framework:** Svelte 5 (minimal boilerplate, compiled framework)
- **Build Tool:** Vite 7 (fast, modern, minimal configuration)
- **Language:** JavaScript (TypeScript if developer has prior TS experience)
- **CSS Framework:** Tailwind CSS 4 (rapid UI development)
- **API Integration:** Native fetch API (simple, no dependencies)

**Rationale:** Eliminates backend complexity (saves 1-2 weeks), uses free hosting, focuses development time on prompt engineering (the actual hard problem).

---

### Testing Requirements

**Decision:** Unit testing for critical paths only + extensive manual testing for content quality.

**Testing Strategy:**
- **Unit Tests:** API key validation, export functions, state management
- **Manual Testing:** World generation quality, coherence, content variety
- **No End-to-End Tests for MVP:** Focus on shipping, add E2E post-launch if needed

**Rationale:** AI output is non-deterministic - automated tests can't verify narrative quality. Human review is required.

---

## Data Requirements

### Data Storage

**Client-Side Only:**
- API keys stored in browser localStorage
- Generated worlds stored in component state (session-only)
- No database or cloud storage for MVP

**Privacy:** User data never leaves their browser except API calls to OpenAI.

---

## Success Metrics

### Launch Success (First 30 Days)

- **Adoption:** 100+ unique users generate worlds
- **Engagement:** 40%+ users expand at least one aspect (culture/character/location)
- **Export:** 20%+ users export worlds (indicates real-world use)
- **Retention:** 30%+ users return to generate a second world
- **Technical Reliability:** <5% error rate, 95%+ successful generations

### Long-term Success (3-6 Months)

- **Monthly Active Users:** 500+ users
- **Power Users:** 15%+ generate 5+ worlds
- **Export Rate:** 30%+ of sessions end with export
- **User Satisfaction:** 4+ stars on Product Hunt, positive Reddit feedback
- **Community Growth:** Active Discord or subreddit with user-shared worlds

---

## MVP Scope

### In Scope

- ✅ API key input and validation
- ✅ Theme selection (Fantasy for MVP)
- ✅ Comprehensive world generation (10 sections)
- ✅ World overview display with organized sections
- ✅ Culture exploration and expansion
- ✅ Character generation (on-demand)
- ✅ Location generation (on-demand)
- ✅ Legend generation (on-demand)
- ✅ Historical event generation (on-demand)
- ✅ Freeform world questioning
- ✅ JSON export
- ✅ Markdown export
- ✅ Mobile-responsive UI
- ✅ Cost warnings and transparency
- ✅ Error handling and recovery

### Out of Scope (Post-MVP)

- Additional themes (Cyberpunk, Steampunk, Sci-Fi, Horror)
- Save/load functionality (cloud storage)
- World sharing features (public gallery, remixing)
- User accounts and authentication
- Collaborative editing (team worldbuilding)
- Multi-AI provider support (Anthropic, local models)
- Advanced customization (control tone, complexity, originality sliders)
- Image generation (world maps, character portraits)
- Integration APIs (Notion, Scrivener, World Anvil)

---

## Roadmap

### Phase 1: MVP Launch ✅ (Complete - October 2025)

- ✅ All MVP features implemented
- ✅ Production deployment on Vercel
- ✅ Documentation and testing complete

### Phase 2: Post-Launch Refinement (November 2025)

- Gather user feedback
- Fix critical bugs
- Optimize prompt quality based on user reports
- Add usage analytics (opt-in)

### Phase 3: Feature Expansion (Q1 2026)

- Additional themes (Cyberpunk, Steampunk)
- Save/load functionality
- Community features (world sharing, galleries)
- User accounts (optional, for cloud saves)

### Phase 4: Ecosystem Growth (Q2+ 2026)

- Integration APIs for external tools
- Advanced AI customization options
- Collaborative worldbuilding features
- Multi-AI provider support

---

## Risks & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| OpenAI API changes pricing/terms | Medium | High | Monitor API updates, consider multi-provider support |
| Users unwilling to provide API keys | Medium | High | Clear value prop, cost transparency, demo mode |
| AI generates inappropriate content | Low | Medium | Content filtering, user reporting, prompt engineering |
| World quality inconsistent | Medium | Medium | Prompt refinement, user feedback loops |
| Export format incompatibility | Low | Low | Support multiple formats, clear documentation |

---

## Open Questions

- Should we add a "demo mode" with pre-generated worlds for users without API keys?
- What's the optimal balance between world generation time and content depth?
- Should we support local LLM models (Llama, Mistral) for cost-conscious users?
- How do we handle NSFW content requests (horror themes, dark fantasy)?

---

**Status:** Active - MVP Complete, Ready for Launch

**Contact:** For questions or feedback, open an issue on GitHub.
