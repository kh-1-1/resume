#!/usr/bin/env sh
set -eu

PROJECT_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$PROJECT_ROOT"
export npm_config_cache="$PROJECT_ROOT/.npm-cache"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required. Install Node.js 22 LTS from https://nodejs.org/ and rerun this file."
  exit 1
fi

node -e 'const [major, minor] = process.versions.node.split(".").map(Number); if (!((major === 20 && minor >= 19) || major >= 22)) { console.error("Node.js 20.19+ or 22.12+ is required."); process.exit(1) }'

echo "[1/3] Installing project dependencies..."
npm install
echo "[2/3] Running checks and production build..."
npm test
echo "[3/3] Starting the local production preview at http://127.0.0.1:4173/"
npm run preview -- --host 0.0.0.0 --port 4173
