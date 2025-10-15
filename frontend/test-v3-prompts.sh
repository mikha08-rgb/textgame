#!/bin/bash

# Test WorldbuildingStudio v3 Prompt Quality
# Tests the research-backed anti-cliché prompts

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  WorldbuildingStudio v3 Prompt Quality Test                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check for API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ ERROR: OPENAI_API_KEY not set"
    echo ""
    echo "Please set your OpenAI API key:"
    echo "  export OPENAI_API_KEY='sk-...'"
    echo ""
    exit 1
fi

echo "✅ API key found"
echo ""

# Check if dev server is running
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "⚠️  Dev server not running at http://localhost:5173"
    echo ""
    echo "Please start it in another terminal:"
    echo "  cd frontend && npm run dev"
    echo ""
    exit 1
fi

echo "✅ Dev server running"
echo ""

# Run Playwright test
echo "🚀 Running tests..."
echo ""

npx playwright test worldbuilding-studio-v3.spec.js --project=chromium

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Test Complete!                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
