#!/bin/bash

echo "🚀 Test du Lazy Loading des Drills"
echo "=================================="
echo ""

cd "/Users/ogmegelas/Documents/practice lap"

npx playwright test tests/e2e/validate-lazy-loading.spec.js --reporter=list --project=chromium
