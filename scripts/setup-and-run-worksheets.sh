#!/usr/bin/env bash
set -euo pipefail

# Setup and end-to-end run script for the OpenMAIC personalized worksheet demo.
# This script installs dependencies, ensures environment variables are set,
# builds the standalone output, starts the server, and verifies PDF generation.

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
 cd "$REPO_ROOT"

SERVER_PID=""

 cleanup() {
  if [ -n "$SERVER_PID" ] && kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "→ Stopping server (PID $SERVER_PID)..."
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "=============================================="
echo "OpenMAIC Personalized Worksheet Demo"
echo "=============================================="

# --- Dependency checks --------------------------------------------------------
if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js is not installed. Please install Node.js >= 20.9.0 first."
  exit 1
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "❌ pnpm is not installed. Please install pnpm first:"
  echo "   npm install -g pnpm"
  exit 1
fi

echo "→ Node $(node --version), pnpm $(pnpm --version)"

# --- Environment setup --------------------------------------------------------
if [ ! -f .env.local ]; then
  if [ -f .env.example ]; then
    echo "→ Creating .env.local from .env.example..."
    cp .env.example .env.local
  else
    echo "❌ .env.example not found. Cannot create .env.local."
    exit 1
  fi
fi

# Source env vars so we can validate them.
set -a
# shellcheck source=/dev/null
source .env.local
set +a

if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo ""
  echo "⚠️  OPENAI_API_KEY is not set in .env.local."
  echo "   Please edit .env.local, add your OpenAI API key, and rerun this script."
  echo "   Example:"
  echo "     OPENAI_API_KEY=sk-..."
  echo "     DEFAULT_MODEL=openai:gpt-5.5"
  exit 1
fi

if [ -z "${DEFAULT_MODEL:-}" ]; then
  echo ""
  echo "⚠️  DEFAULT_MODEL is not set in .env.local."
  echo "   Setting it to openai:gpt-5.5 for this run."
  export DEFAULT_MODEL=openai:gpt-5.5
fi

# --- Install dependencies -----------------------------------------------------
echo "→ Installing dependencies..."
pnpm install --frozen-lockfile

# --- Build --------------------------------------------------------------------
echo "→ Building production standalone output..."
pnpm build

# --- Start server -------------------------------------------------------------
PORT="${PORT:-3030}"
LOG_FORMAT="${LOG_FORMAT:-json}"

echo "→ Starting standalone server on port $PORT..."
set -a
source .env.local
set +a
export PORT
export LOG_FORMAT

nohup node .next/standalone/server.js > standalone.log 2>&1 &
SERVER_PID=$!

echo "→ Server PID: $SERVER_PID"
echo "→ Waiting for server to be ready..."

for i in {1..30}; do
  if curl -s "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
    echo "✅ Server is ready."
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    echo "❌ Server exited unexpectedly. Logs:"
    tail -n 30 standalone.log
    exit 1
  fi
  sleep 1
done

# --- End-to-end test ----------------------------------------------------------
echo ""
echo "→ Running end-to-end PDF generation test..."

TEST_PDF="/tmp/openmaic-worksheet-test.pdf"
curl -s -X POST "http://localhost:$PORT/api/generate-worksheet-pdf" \
  -H "Content-Type: application/json" \
  -d '{
    "students": [{"name":"Alex","grade":"5","class":"A","weakTopics":["fractions"],"strongTopics":["addition"]}],
    "topic": "Fractions",
    "questionCount": 2,
    "difficulty": "easy",
    "questionTypes": ["single","text"]
  }' \
  -o "$TEST_PDF" \
  -w "HTTP %{http_code}, size %{size_download}\n"

if file "$TEST_PDF" | grep -q "PDF document"; then
  echo "✅ End-to-end test passed: $TEST_PDF is a valid PDF."
else
  echo "❌ End-to-end test failed. Response saved to $TEST_PDF"
  cat "$TEST_PDF"
  exit 1
fi

# --- Print access info --------------------------------------------------------
echo ""
echo "=============================================="
echo "Demo is running successfully!"
echo "=============================================="
echo ""
echo "Server:     http://localhost:$PORT"
echo "Health:     http://localhost:$PORT/api/health"
echo "Students:   http://localhost:$PORT/students"
echo "Worksheet:  http://localhost:$PORT/worksheet"
echo "Batch:      http://localhost:$PORT/batch-worksheets"
echo "Logs:       $REPO_ROOT/standalone.log"
echo ""
echo "Press Ctrl+C to stop the server."
echo ""

# Keep script alive until user interrupts.
wait "$SERVER_PID"
