#!/usr/bin/env python3
"""
Senior Human Production Engineering Standards Guard
Scans staged or all TypeScript/JavaScript files for banned AI-slop anti-patterns:
- Swallowed/empty catch blocks
- Raw console.log/info/debug calls in runtime paths
- AI Studio placeholders and unfulfilled mocks
- Untyped any escape hatches
"""

import sys
import os
import re
import subprocess
import argparse

EXCLUDE_DIRS = {"node_modules", ".next", "dist", ".turbo", ".git", ".expo", "build", "coverage", ".next-dev"}

PATTERNS = [
    {
        "id": "EMPTY_CATCH",
        "severity": "CRITICAL",
        "regex": re.compile(r"catch\s*(?:\([^)]*\))?\s*\{\s*\}"),
        "desc": "Empty catch block silently swallowing errors"
    },
    {
        "id": "SILENT_CATCH",
        "severity": "HIGH",
        "regex": re.compile(r"catch\s*(?:\([^)]*\))?\s*\{\s*(?:return|return\s+(?:null|undefined|false|\[\]|\{\}))\s*;?\s*\}"),
        "desc": "Catch block returning null/false without logging or reraising"
    },
    {
        "id": "RAW_CONSOLE",
        "severity": "MEDIUM",
        "regex": re.compile(r"\bconsole\.(log|debug|info)\("),
        "desc": "Raw console logging in production runtime path (use structured logger)"
    },
    {
        "id": "AI_STUDIO_ARTIFACT",
        "severity": "HIGH",
        "regex": re.compile(r"(\[AI Studio\]|mock database\s*—|FIXME:\s*mock)", re.IGNORECASE),
        "desc": "AI Studio placeholder or unfulfilled mock in production path"
    },
    {
        "id": "ANY_TYPE_CAST",
        "severity": "LOW",
        "regex": re.compile(r"(:\s*any\b|\bas\s+any\b)"),
        "desc": "Untyped any escape hatch (use explicit types or unknown with guards)"
    }
]

def get_staged_files():
    try:
        out = subprocess.check_output(["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"], text=True)
        return [f.strip() for f in out.strip().split("\n") if f.strip().endswith((".ts", ".tsx", ".js", ".jsx"))]
    except Exception:
        return []

def get_all_source_files(root):
    files_list = []
    for base, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        for f in files:
            if f.endswith((".ts", ".tsx")):
                rel = os.path.relpath(os.path.join(base, f), root)
                if not rel.startswith("scripts/") and ".test." not in rel and ".spec." not in rel:
                    files_list.append(rel)
    return files_list

def scan_file(file_path):
    violations = []
    if not os.path.exists(file_path):
        return violations
    if ".test." in file_path or ".spec." in file_path or file_path.startswith("scripts/"):
        return violations

    try:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as fp:
            content = fp.read()
            lines = content.splitlines()

        for line_no, line in enumerate(lines, 1):
            for p in PATTERNS:
                if p["id"] in ["EMPTY_CATCH", "SILENT_CATCH"]:
                    continue
                if p["regex"].search(line):
                    violations.append({
                        "file": file_path,
                        "line": line_no,
                        "id": p["id"],
                        "severity": p["severity"],
                        "desc": p["desc"],
                        "snippet": line.strip()[:100]
                    })

        for p in [PATTERNS[0], PATTERNS[1]]:
            for m in p["regex"].finditer(content):
                line_no = content[:m.start()].count("\n") + 1
                snippet = content[m.start():m.start() + 70].replace("\n", " ").strip()
                violations.append({
                    "file": file_path,
                    "line": line_no,
                    "id": p["id"],
                    "severity": p["severity"],
                    "desc": p["desc"],
                    "snippet": snippet
                })
    except Exception as e:
        pass

    return violations

def main():
    parser = argparse.ArgumentParser(description="Guard production code quality against AI anti-patterns.")
    parser.add_argument("--staged", action="store_true", help="Scan only staged files for pre-commit hook")
    args = parser.parse_args()

    repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    os.chdir(repo_root)

    if args.staged:
        target_files = get_staged_files()
        mode_label = "Staged files"
    else:
        target_files = get_all_source_files(repo_root)
        mode_label = "All repository production files"

    if not target_files:
        print(f"Production Standards Guard: No relevant files to check ({mode_label}).")
        sys.exit(0)

    total_violations = []
    for f in target_files:
        v = scan_file(f)
        total_violations.extend(v)

    if total_violations:
        print("\n" + "=" * 60)
        print("🛑 PRODUCTION STANDARDS VIOLATION DETECTED")
        print("The following code violates Senior Human Production Engineering standards:")
        print("=" * 60)
        for item in total_violations:
            print(f"[{item['severity']}] {item['file']}:{item['line']} -> {item['desc']}")
            print(f"    Line: {item['snippet']}")
        print("=" * 60)
        print("Commit rejected. Fix the violations above before committing.\n")
        sys.exit(1)
    else:
        print(f"✅ Production Standards Guard passed across {len(target_files)} files ({mode_label}).")
        sys.exit(0)

if __name__ == "__main__":
    main()
