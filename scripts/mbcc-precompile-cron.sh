#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="${MBCC_LOG_DIR:-$PROJECT_DIR/data/logs}"
LOCK_DIR="${MBCC_LOCK_DIR:-$PROJECT_DIR/data/.mbcc-precompile.lock}"
OUT_PATH="${MBCC_COMPILED_PATH:-$PROJECT_DIR/data/mbcc-2026.compiled.json}"

mkdir -p "$LOG_DIR"

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] MBCC precompile skipped: lock exists at $LOCK_DIR"
  exit 0
fi

cleanup() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

trap cleanup EXIT

cd "$PROJECT_DIR"

RUN_ID="$(date -u +"%Y%m%dT%H%M%SZ")"
LOG_FILE="$LOG_DIR/mbcc-precompile-$RUN_ID.log"

{
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] MBCC precompile started"
  echo "project_dir=$PROJECT_DIR"
  echo "output_path=$OUT_PATH"
  echo "source_url=${MBCC_SOURCE_URL:-https://mbcc.jonpacker.com/latest.json}"
  echo "scrape_enabled=${MBCC_SCRAPE_STYLES:-1}"
  echo "scrape_concurrency=${MBCC_SCRAPE_CONCURRENCY:-2}"
  echo "scrape_delay_ms=${MBCC_SCRAPE_DELAY_MS:-400}"

  node ./scripts/mbcc-precompile.mjs

  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] MBCC precompile finished"
} >>"$LOG_FILE" 2>&1

echo "MBCC precompile complete. Log: $LOG_FILE"
