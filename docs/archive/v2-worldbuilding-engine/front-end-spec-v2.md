# AI Worldbuilding Engine - UI/UX Specification

**Version:** 2.0
**Last Updated:** 2025-10-11
**Project:** AI Worldbuilding Engine
**Document Owner:** UX Expert

---

## Table of Contents

1. [Introduction](#introduction)
2. [User Personas](#user-personas)
3. [User Flows](#user-flows)
4. [Component Library](#component-library)
5. [Branding & Style Guide](#branding--style-guide)
6. [Accessibility Requirements](#accessibility-requirements)

---

## Introduction

### Overall UX Goals & Principles

**Primary Goal:** Enable creative professionals to generate and explore rich fantasy worlds quickly and intuitively.

**UX Principles:**
1. **Clarity:** Information organized into digestible sections
2. **Progressive Disclosure:** Start with overview, expand details on demand
3. **Creative Focus:** UI supports exploration without distraction
4. **Export-Ready:** Content formatted for external tool integration
5. **Mobile-First Responsive:** Usable everywhere, from phone inspiration to desktop deep work

---

## User Personas

### Primary Persona: Creative Worldbuilder

**Profile:**
- **Age:** 25-45
- **Occupation:** Fantasy/sci-fi writer, game designer
- **Tech Level:** Moderate to high
- **Context:** Needs world foundations quickly to start creative projects

**Needs:**
- Generate complete worlds in minutes
- Expand specific aspects as project needs emerge
- Export to writing/design tools (Notion, Scrivener, Google Docs)
- Maintain consistency across worldbuilding sessions

**User Quote:** *"I need rich world details without spending months building them manually."*

### Secondary Persona: Tabletop Game Master

**Profile:**
- **Age:** 28-50
- **Occupation:** D&D/Pathfinder GM
- **Tech Level:** Moderate
- **Context:** Preparing campaigns, generating content during sessions

**Needs:**
- Quick campaign setting generation
- On-demand NPC and location creation
- Export to share with players
- Coherent worlds across long campaigns

---

## User Flows

### Flow 1: First-Time User - World Generation

1. **Landing Page**
   - User sees clear value proposition
   - Prompted to enter OpenAI API key
   - Key saved to localStorage for future visits

2. **Theme Selection**
   - User selects Fantasy theme (only option for MVP)
   - Clear description of what will be generated

3. **World Generation**
   - Loading state with progress indicator
   - 60-120 second wait time
   - Success: Navigate to World Explorer
   - Error: Clear message with retry option

4. **World Explorer - Overview**
   - 10 sections displayed: Theme, Geography, History, Magic, Cultures, Conflicts, Economy, Daily Life, Unique Feature, Secrets
   - Organized cards/sections for easy scanning
   - Navigation tabs for quick jumping

5. **Exploration Actions**
   - Expand cultures (in-depth daily life, figures, locations)
   - Generate characters, locations, legends, events
   - Ask freeform questions about the world

6. **Export**
   - User clicks "Export JSON" or "Export Markdown"
   - File downloads immediately with world name as filename
   - Success message confirms export

### Flow 2: Returning User - Quick Exploration

1. **Landing Page**
   - API key pre-loaded (skip input step)
   - Direct to Theme Selection

2. **Generate New World**
   - User goes straight to generation
   - Familiar with process, expects 2-3 minute wait

3. **Focused Exploration**
   - User knows what they want (e.g., generate 3 characters)
   - Quick navigation to Characters section
   - Generate → Export → Done (5-10 minute session)

### Flow 3: Deep Worldbuilding Session

1. **Generate World**
   - Standard generation process

2. **Systematic Exploration**
   - Expand all cultures
   - Generate 5+ characters
   - Generate 3+ locations
   - Generate 2+ legends
   - Ask 5+ questions about world details

3. **Extensive Export**
   - Export Markdown for Notion import
   - Review generated content in external tool
   - Return later for more content generation

---

## Component Library

### Core Components

**1. LandingPage.svelte**
- API key input field (validated)
- Clear instructions and value proposition
- "Continue" button (disabled until valid key)
- Cost transparency messaging

**2. ThemeSelection.svelte**
- Theme cards (Fantasy currently, extensible for future)
- Theme descriptions
- "Generate World" button

**3. GameInitializer.svelte** (World Generator)
- Progress indicator during generation
- 10-step progress tracking (each world section)
- Loading messages
- Error handling and retry

**4. WorldExplorer.svelte**
- **Header:**
  - World name and tagline
  - Export buttons (JSON, Markdown)
  - "Generate New World" button
- **Navigation:**
  - Tab bar: Overview, Cultures (dynamic), Characters, Locations, Legends, History, Questions
- **Content Area:**
  - Overview: All 10 world sections in organized cards
  - Culture Detail: Expanded culture with figures and locations
  - Characters: Grid of generated characters
  - Locations: List of generated locations
  - Legends: Story cards
  - History: Historical events
  - Questions: Freeform Q&A interface
- **Action Buttons:**
  - "Explore Culture" (per culture in overview)
  - "Generate Character", "Generate Location", "Generate Legend", "Generate Historical Event"
  - "Ask Question" form

**5. Supporting Components**
- **CostDisplay.svelte:** Real-time cost tracking
- **CostWarningModal.svelte:** Alerts when costs exceed thresholds
- **Settings.svelte:** API key management, preferences

---

## Branding & Style Guide

### Visual Identity

**Product Name:** AI Worldbuilding Engine
**Tagline:** "Generate rich fantasy worlds in minutes"

**Color Palette:**
- **Primary:** Purple (#7C3AED) - creativity, imagination
- **Secondary:** Blue (#3B82F6) - trust, stability
- **Accent:** Green (#10B981) - growth, exploration
- **Warning:** Yellow (#FBBF24) - cost alerts
- **Error:** Red (#EF4444) - errors, critical actions
- **Background:** Gradient from purple-50 to blue-50

**Typography:**
- **Headings:** System font stack (SF Pro, Segoe UI, Roboto)
- **Body:** System font stack
- **Code/JSON:** Monospace (Menlo, Monaco, Consolas)

**Spacing:**
- Mobile: Tight (p-3, gap-2)
- Desktop: Generous (p-6, gap-4)

### Component Styling

**Cards:**
- White background
- Rounded corners (rounded-lg)
- Shadow (shadow-md)
- Padding (p-4 mobile, p-6 desktop)

**Buttons:**
- Primary: bg-purple-600 hover:bg-purple-700
- Secondary: bg-blue-600 hover:bg-blue-700
- Success: bg-green-600 hover:bg-green-700
- Warning: bg-yellow-600 hover:bg-yellow-700
- Danger: bg-red-600 hover:bg-red-700

**Loading States:**
- Spinning circle (animate-spin)
- Blue accent color
- Clear loading messages

---

## Accessibility Requirements

**WCAG 2.1 Level AA Compliance:**
- Color contrast ratios meet AA standards
- All interactive elements keyboard accessible
- Screen reader friendly labels
- Focus indicators visible
- Loading states announced

**Mobile Accessibility:**
- Touch targets minimum 44x44px
- No hover-only interactions
- Responsive text sizing
- Scrollable content areas

---

## Responsive Breakpoints

**Mobile:** < 768px (sm, base styles)
**Tablet:** 768px - 1024px (md)
**Desktop:** > 1024px (lg, xl)

**Responsive Patterns:**
- Mobile: Single column, stacked sections
- Tablet: Two columns for character/location grids
- Desktop: Multi-column layouts, wider content areas

---

## Next Steps

1. Conduct user testing with writers and game designers
2. Gather feedback on navigation and information architecture
3. Iterate on export formats based on real-world usage
4. Consider adding visual enhancements (illustrations, icons)

---

**Status:** Active - Reflects implemented UI/UX

**Built with Claude Code** 🤖
