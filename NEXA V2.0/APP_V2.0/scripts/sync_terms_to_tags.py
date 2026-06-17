#!/usr/bin/env python3
"""
terms_standard · terms_nexa (+ category · domain) → frontmatter tags 동기화

Obsidian 태그 패널용 파생 필드. tags 는 수동 편집하지 않고 본 스크립트만 갱신합니다.

태그 규칙:
  - doc/cat/{category}   — 예: doc/cat/08-tdd  (category 08_TDD)
  - doc/domain/{domain} — 예: doc/domain/nexia (domain 소문자)
  - std/{term}          — terms_standard 항목
  - nexa/{term}         — terms_nexa 항목

사용:
  python scripts/sync_terms_to_tags.py
  python scripts/sync_terms_to_tags.py --check
  python scripts/sync_terms_to_tags.py --verbose
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

DOCS_ROOT = Path(__file__).resolve().parent.parent

CONFIRMED_PREFIXES = (
    "01_BRD",
    "02_Legal",
    "03_MVP",
    "04_Decision",
    "05_PRD",
    "06_Analytics",
    "07_UIUX",
    "08_TDD",
    "09_Admin",
    "10_QA",
    "11_UserGuide",
)

FM_BLOCK_RE = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)
TAGS_LINE_RE = re.compile(r"^tags:\s*.+$", re.M)
TAGS_BLOCK_RE = re.compile(r"^tags:\s*\n(?:  - .+\n)+", re.M)
def parse_scalar(fm: str, key: str) -> str | None:
    m = re.search(rf"^{re.escape(key)}:\s*(.+)$", fm, re.M)
    if not m:
        return None
    v = m.group(1).strip()
    if v in ('""', "''", "null", "~", ""):
        return None
    return v.strip('"').strip("'")


def parse_list_field(fm: str, key: str) -> list[str]:
    m = re.search(
        rf"^{re.escape(key)}:\s*(\[[^\]]*\]|.+)$",
        fm,
        re.M,
    )
    if not m:
        return []
    raw = m.group(1).strip()
    if raw == "[]":
        return []
    if raw.startswith("["):
        return re.findall(r'"([^"]*)"', raw)
    return []


def slug_segment(value: str) -> str:
    s = value.strip().strip("`").lower()
    s = s.replace("_", "-")
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[^a-z0-9._/-]", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    return s or "unknown"


def term_to_tag(prefix: str, term: str) -> str | None:
    t = term.strip().strip("`")
    if not t:
        return None
    # Obsidian nested tag: no spaces; keep intentional casing in term body
    body = re.sub(r"\s+", "-", t)
    body = body.replace("/", "-")
    return f"{prefix}/{body}"


def build_tags(
    category: str | None,
    domain: str | None,
    terms_standard: list[str],
    terms_nexa: list[str],
) -> list[str]:
    tags: list[str] = []
    seen: set[str] = set()

    def add(tag: str | None) -> None:
        if not tag or tag in seen:
            return
        seen.add(tag)
        tags.append(tag)

    if category:
        add(f"doc/cat/{slug_segment(category)}")
    if domain:
        add(f"doc/domain/{slug_segment(domain)}")

    for term in terms_standard:
        add(term_to_tag("std", term))
    for term in terms_nexa:
        add(term_to_tag("nexa", term))

    return tags


def format_tags_line(tags: list[str]) -> str:
    if not tags:
        return "tags: []"
    inner = ", ".join(f'"{t}"' for t in tags)
    return f"tags: [{inner}]"


def upsert_tags_in_frontmatter(fm: str, tags: list[str]) -> tuple[str, bool]:
    new_line = format_tags_line(tags)
    cleaned = TAGS_BLOCK_RE.sub("", fm)
    cleaned = TAGS_LINE_RE.sub("", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip("\n")

    if re.search(r"^terms_nexa:", cleaned, re.M):
        updated = re.sub(
            r"^(terms_nexa:.*)$",
            lambda m: f"{m.group(1)}\n{new_line}",
            cleaned,
            count=1,
            flags=re.M,
        )
    elif re.search(r"^terms_standard:", cleaned, re.M):
        updated = re.sub(
            r"^(terms_standard:.*)$",
            lambda m: f"{m.group(1)}\n{new_line}",
            cleaned,
            count=1,
            flags=re.M,
        )
    elif re.search(r"^domain:", cleaned, re.M):
        updated = re.sub(
            r"^(domain:.*)$",
            lambda m: f"{m.group(1)}\n{new_line}",
            cleaned,
            count=1,
            flags=re.M,
        )
    else:
        updated = cleaned + "\n" + new_line

    old_match = TAGS_LINE_RE.search(fm)
    old_val = old_match.group(0).strip() if old_match else None
    changed = old_val != new_line
    return updated, changed


def process_file(path: Path, check: bool, verbose: bool) -> str:
    text = path.read_text(encoding="utf-8")
    m = FM_BLOCK_RE.match(text)
    if not m:
        return "skip_no_fm"

    fm = m.group(1)
    doc_id = parse_scalar(fm, "doc_id")
    if not doc_id:
        return "skip_no_doc_id"

    category = parse_scalar(fm, "category")
    domain = parse_scalar(fm, "domain")
    terms_standard = parse_list_field(fm, "terms_standard")
    terms_nexa = parse_list_field(fm, "terms_nexa")

    tags = build_tags(category, domain, terms_standard, terms_nexa)
    new_fm, changed = upsert_tags_in_frontmatter(fm, tags)

    if not changed:
        if verbose:
            print(f"  ok  {path.relative_to(DOCS_ROOT)} ({len(tags)} tags)")
        return "unchanged"

    new_text = f"---\n{new_fm}\n---" + text[m.end() :]
    if not check:
        path.write_text(new_text, encoding="utf-8", newline="\n")

    rel = path.relative_to(DOCS_ROOT)
    print(f"  {'would' if check else 'upd'} {rel} (+{len(tags)} tags)")
    if verbose:
        print(f"       {format_tags_line(tags)}")
    return "updated"


def iter_target_files() -> list[Path]:
    files: list[Path] = []
    for prefix in CONFIRMED_PREFIXES:
        base = DOCS_ROOT / prefix
        if not base.is_dir():
            continue
        for path in sorted(base.rglob("*.md")):
            if path.name == "README.md":
                continue
            files.append(path)
    return files


def main() -> int:
    parser = argparse.ArgumentParser(description="Sync terms_* to Obsidian tags")
    parser.add_argument("--check", action="store_true", help="dry-run only")
    parser.add_argument("--verbose", "-v", action="store_true")
    args = parser.parse_args()

    stats = {"updated": 0, "unchanged": 0, "skip_no_fm": 0, "skip_no_doc_id": 0}

    print(f"docs root: {DOCS_ROOT}")
    if args.check:
        print("mode: check (no writes)")

    for path in iter_target_files():
        result = process_file(path, args.check, args.verbose)
        stats[result] = stats.get(result, 0) + 1

    print(
        f"\ndone: updated={stats['updated']} unchanged={stats['unchanged']} "
        f"skip_no_fm={stats['skip_no_fm']} skip_no_doc_id={stats['skip_no_doc_id']}"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
