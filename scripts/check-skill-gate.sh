#!/usr/bin/env bash
# Guards the Mandatory Skill Gate in AGENTS.md section "Mandatory Skills".
# Fails loudly if the gate text is missing or any of the six skills is dropped.
#
# Two file classes:
#   REQUIRED - tracked in this repository. CI enforces these.
#   OPTIONAL - live in the developer's home dir and are never checked in.
#              Checked when present, skipped when absent (as in CI).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail=0

REQUIRED_FILES=(
  "AGENTS.md"
  "CLAUDE.md"
  ".clinerules"
)

OPTIONAL_FILES=(
  "../.clinerules"
  "../.claude/CLAUDE.md"
)

REQUIRED=(
  "mr-solomon-nine-command-engineering-loop"
  "mr-solomon-natural-voice"
  "bukiebrainjobs-content-style"
  "bukiebrainjobs-experience-standards"
  "ui-ux-pro-max"
  "agent-skills-test-driven-development"
)

check_file() {
  local f="$1"
  local label="$2"

  if ! grep -q "SKILL GATE" "$f"; then
    echo "  GATE ABSENT:  $f (no SKILL GATE block)"
    fail=1
    return
  fi

  local missing=()
  local skill
  for skill in "${REQUIRED[@]}"; do
    grep -q "$skill" "$f" || missing+=("$skill")
  done

  if [ "${#missing[@]}" -gt 0 ]; then
    echo "  SKILLS MISSING in $f: ${missing[*]}"
    fail=1
  else
    echo "  OK: $f ($label)"
  fi
}

echo "== Mandatory Skill Gate guard =="
echo
echo "Required repository files:"

for f in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "  MISSING FILE: $f"
    fail=1
    continue
  fi
  check_file "$f" "required"
done

echo
echo "Home-level rule files (informational, not enforced in CI):"
for f in "${OPTIONAL_FILES[@]}"; do
  if [ -f "$f" ]; then
    check_file "$f" "optional"
  else
    echo "  absent: $f (normal in a CI checkout)"
  fi
done

echo
if [ "$fail" -ne 0 ]; then
  echo "FAIL: the Mandatory Skill Gate has been weakened. Restore it before any work."
  exit 1
fi

echo "PASS: gate present in all required files, all six skills named."
echo "Every agent must print the SKILL GATE block before its first edit."
