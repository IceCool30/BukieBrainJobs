#!/usr/bin/env bash
# Guards the Mandatory Skill Gate in AGENTS.md section "Mandatory Skills".
# Fails loudly if the gate text is missing or any of the six skills is dropped.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fail=0

FILES=(
  "AGENTS.md"
  "CLAUDE.md"
  ".clinerules"
  "../.clinerules"
  "../.claude/CLAUDE.md"
)

REQUIRED=(
  "mr-solomon-nine-command-engineering-loop"
  "mr-solomon-natural-voice"
  "bukiebrainjobs-content-style"
  "bukiebrainjobs-trades-design-system"
  "bukiebrainjobs-experience-standards"
  "ui-ux-pro-max"
  "agent-skills-test-driven-development"
)

echo "== Mandatory Skill Gate guard =="
echo

for f in "${FILES[@]}"; do
  if [ ! -f "$f" ]; then
    echo "MISSING FILE: $f"
    fail=1
    continue
  fi

  if ! grep -q "SKILL GATE" "$f"; then
    echo "GATE ABSENT:   $f (no SKILL GATE block)"
    fail=1
  else
    missing=()
    for skill in "${REQUIRED[@]}"; do
      grep -q "$skill" "$f" || missing+=("$skill")
    done
    if [ "${#missing[@]}" -gt 0 ]; then
      echo "SKILLS MISSING in $f: ${missing[*]}"
      fail=1
    else
      echo "OK:            $f"
    fi
  fi
done

echo
if [ "$fail" -ne 0 ]; then
  echo "FAIL: the Mandatory Skill Gate has been weakened. Restore it before any work."
  exit 1
fi

echo "PASS: gate present in all rule files, all seven skills named."
echo "Every agent must print the SKILL GATE block before its first edit."
