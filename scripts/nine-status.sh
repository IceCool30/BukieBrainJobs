#!/usr/bin/env bash
# nine-status.sh: quick view of current NINE loop state
set -euo pipefail

echo "=== Mr. Solomon 9-Command Engineering Loop: Status ==="
echo

if [[ -f docs/scope.md ]]; then
  echo "Scope: docs/scope.md exists"
  grep -E '^- \[ \]|^- \[x\]' docs/scope.md | head -25 || true
else
  echo "Scope: no docs/scope.md yet (run /scope)"
fi
echo

if [[ -f AGENTS.md ]]; then
  echo "Context: AGENTS.md exists"
else
  echo "Context: no AGENTS.md yet (run /audit)"
fi
echo

if [[ -d docs/specs ]]; then
  echo "Specs:"
  ls -1 docs/specs/ 2>/dev/null || echo "  (empty)"
else
  echo "Specs: no docs/specs/ directory (run /architect)"
fi
echo

if [[ -f docs/check-log.md ]]; then
  echo "Last check log:"
  tail -10 docs/check-log.md || true
else
  echo "Check Log: no docs/check-log.md yet (run /check)"
fi
echo

if [[ -f CHANGELOG.md ]]; then
  echo "Changelog: CHANGELOG.md exists"
else
  echo "Changelog: no CHANGELOG.md yet (run /document)"
fi
