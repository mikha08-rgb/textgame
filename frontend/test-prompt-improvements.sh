#!/bin/bash

# Test Prompt Improvements Script
# Runs comprehensive tests on the improved prompt system

echo "════════════════════════════════════════════════════════════════"
echo "🧪 PROMPT IMPROVEMENT TEST SUITE"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "This will test the new positive-principles approach and validate:"
echo "  ✓ Absence of clichés (no generic fantasy tropes)"
echo "  ✓ Presence of specific numbers and measurements"
echo "  ✓ Mundane/bureaucratic naming patterns"
echo "  ✓ Concrete sensory details"
echo "  ✓ Grounded economic/practical terms"
echo ""
echo "Expected improvements: 50-70% cliché reduction"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check for API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  WARNING: OPENAI_API_KEY not set!"
    echo ""
    echo "Please set your API key:"
    echo "  export OPENAI_API_KEY='sk-...'"
    echo ""
    echo "Or pass it to this script:"
    echo "  OPENAI_API_KEY='sk-...' ./test-prompt-improvements.sh"
    echo ""
    exit 1
fi

echo "🔑 API Key: Found (${OPENAI_API_KEY:0:10}...)"
echo ""

# Check if we're in the frontend directory
if [ ! -f "playwright.config.js" ]; then
    echo "⚠️  Not in frontend directory. Changing to frontend..."
    cd frontend || exit 1
fi

echo "📂 Working directory: $(pwd)"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Run the test
echo "🚀 Starting Playwright tests..."
echo "════════════════════════════════════════════════════════════════"
echo ""

# Run just the prompt improvement test
npx playwright test prompt-improvement.spec.js

TEST_EXIT_CODE=$?

echo ""
echo "════════════════════════════════════════════════════════════════"

if [ $TEST_EXIT_CODE -eq 0 ]; then
    echo "✅ TESTS PASSED!"
    echo ""
    echo "The improved prompt system is working as expected:"
    echo "  ✓ Clichés eliminated"
    echo "  ✓ Positive principles present"
    echo "  ✓ Worlds are original and diverse"
    echo ""
    echo "Next steps:"
    echo "  1. Generate 5-10 more worlds manually to verify"
    echo "  2. Compare quality to old system"
    echo "  3. Consider implementing Week 2 improvements (Constitutional AI)"
else
    echo "❌ TESTS FAILED"
    echo ""
    echo "Some checks did not pass. Review the output above to see:"
    echo "  - Which clichés were found (should be eliminated)"
    echo "  - Which positive principles are missing"
    echo "  - Suggestions for prompt improvements"
    echo ""
    echo "You may need to adjust the prompt principles in:"
    echo "  frontend/src/prompts/worldGeneration.js"
fi

echo "════════════════════════════════════════════════════════════════"

exit $TEST_EXIT_CODE
