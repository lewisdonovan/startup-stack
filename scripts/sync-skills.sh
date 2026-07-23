#!/usr/bin/env bash
# sync-skills.sh — Copies skills/ to all agent harness directories.
# Run locally or via GitHub Action.
# Usage: bash scripts/sync-skills.sh

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
SKILLS="$REPO_ROOT/skills"

# Harness directories to sync to
HARNESSES=(
  ".claude/skills"
  ".cursor/skills"
  ".gemini/skills"
  ".agent/skills"
  ".agents/skills"
)

echo "Syncing skills to harness-specific folders in the root directory."
echo ""

for harness in "${HARNESSES[@]}"; do
  target="$harness"
  mkdir -p "$(dirname "$harness")"
  rm -rf "$target"
  cp -r "$SKILLS" "$target"
  git add "$target"
  echo "✓ $harness"
done

echo ""
echo "Done. Skills are in harness-specific folders in the root directory."