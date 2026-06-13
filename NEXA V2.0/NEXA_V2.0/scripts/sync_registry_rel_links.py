#!/usr/bin/env python3
"""
doc_id_레지스트리.md — ## 관련 문서 링크 현황 자동 동기화

각 확정 문서의 본문 `## 관련 문서` 섹션을 스캔해 레지스트리 표에 반영합니다.
수동 편집 대상이 아닌 열: 관련문서, 링크·충실도

사용:
  python scripts/sync_registry_rel_links.py
  python scripts/sync_registry_rel_links.py --check   # 갱신 없이 요약만
  python scripts/sync_registry_rel_links.py --verbose

충실도 정의 (YAML → 본문 링크):
  - 기대 링크 = parent_doc + implements_doc + see_also (비어 있지 않은 값만)
  - 역방향(parent로 가리키는 문서)은 충실도 계산에 포함하지 않음 (허브 과부하 방지)
  - 기대 0건: 섹션 있고 링크 ≥1 이면 완료
"""

from __future__ import annotations

import argparse
import re
import sys
from dataclasses import dataclass
from datetime import date
from pathlib import Path
from urllib.parse import unquote

DOCS_ROOT = Path(__file__).resolve().parent.parent
REGISTRY = DOCS_ROOT / "doc_id_레지스트리.md"

DOC_ID_RE = re.compile(r"^(BRD|MVP|PRD|UIX|TDD|ADM)-\d+$")
ROW_RE = re.compile(
    r"^\| (BRD-\d+|MVP-\d+|PRD-\d+|UIX-\d+|TDD-\d+|ADM-\d+) \|"
)
PATH_LINK_RE = re.compile(r"\[[^\]]+\]\((\.\/[^)]+\.md)\)")
MD_LINK_RE = re.compile(r"\[[^\]]*\]\(([^)]+\.md)\)")
FM_BLOCK_RE = re.compile(r"^---\s*\n(.*?)\n---", re.DOTALL)
REL_SECTION_RE = re.compile(
    r"^## 관련 문서\s*$([\s\S]*?)(?=^## |\Z)", re.MULTILINE
)

SUMMARY_START = "<!-- REL_SYNC_SUMMARY_START -->"
SUMMARY_END = "<!-- REL_SYNC_SUMMARY_END -->"


@dataclass
class DocMeta:
    doc_id: str
    path: Path
    parent_doc: str | None
    implements_doc: str | None
    see_also: list[str]


@dataclass
class RelReport:
    doc_id: str
    has_section: bool
    link_count: int
    linked_doc_ids: set[str]
    expected: list[str]
    covered: int
    status: str
    fidelity_display: str


def parse_frontmatter(text: str) -> dict[str, str | list[str]]:
    m = FM_BLOCK_RE.match(text)
    if not m:
        return {}
    fm = m.group(1)
    out: dict[str, str | list[str]] = {}

    def scalar(key: str) -> str | None:
        hit = re.search(rf"^{key}:\s*(.+)$", fm, re.M)
        if not hit:
            return None
        v = hit.group(1).strip()
        if v in ("", '""', "null", "~"):
            return None
        return v.strip('"')

    out["doc_id"] = scalar("doc_id") or ""
    out["parent_doc"] = scalar("parent_doc")
    out["implements_doc"] = scalar("implements_doc")

    see = re.search(r"^see_also:\s*(.+)$", fm, re.M)
    if see:
        raw = see.group(1).strip()
        if raw.startswith("["):
            out["see_also"] = re.findall(r'"([^"]+)"', raw)
        else:
            out["see_also"] = []
    else:
        out["see_also"] = []

    return out


def extract_registry_paths(registry_text: str) -> dict[str, Path]:
    mapping: dict[str, Path] = {}
    for line in registry_text.splitlines():
        m = ROW_RE.match(line)
        if not m:
            continue
        doc_id = m.group(1)
        links = PATH_LINK_RE.findall(line)
        if not links:
            continue
        rel = links[-1]
        mapping[doc_id] = (DOCS_ROOT / unquote(rel)).resolve()
    return mapping


def path_to_doc_id(path: Path, id_to_path: dict[str, Path]) -> str | None:
    try:
        resolved = path.resolve()
    except OSError:
        return None
    for did, p in id_to_path.items():
        if p.resolve() == resolved:
            return did
    return None


def expected_outgoing(meta: DocMeta) -> list[str]:
    exp: list[str] = []
    if meta.parent_doc and DOC_ID_RE.match(meta.parent_doc):
        exp.append(meta.parent_doc)
    if meta.implements_doc and DOC_ID_RE.match(meta.implements_doc):
        exp.append(meta.implements_doc)
    for s in meta.see_also:
        if DOC_ID_RE.match(s) and s not in exp:
            exp.append(s)
    return exp


def analyze_doc(meta: DocMeta, id_to_path: dict[str, Path]) -> RelReport:
    text = meta.path.read_text(encoding="utf-8")
    sec = REL_SECTION_RE.search(text)
    has_section = sec is not None
    section_body = sec.group(1) if sec else ""

    linked_ids: set[str] = set()
    for href in MD_LINK_RE.findall(section_body):
        if href.startswith("http"):
            continue
        target = (meta.path.parent / unquote(href)).resolve()
        did = path_to_doc_id(target, id_to_path)
        if did:
            linked_ids.add(did)

    exp = expected_outgoing(meta)
    covered = sum(1 for e in exp if e in linked_ids)
    link_count = len(MD_LINK_RE.findall(section_body)) if has_section else 0

    if not has_section:
        status = "미작성"
        fid = "-"
    elif link_count == 0:
        status = "빈섹션"
        fid = "0%"
    elif not exp:
        status = "완료" if link_count >= 1 else "빈섹션"
        fid = f"{link_count}링크"
    elif covered == len(exp):
        status = "완료"
        fid = f"{covered}/{len(exp)} · {link_count}링크"
    elif covered > 0 or link_count >= 1:
        status = "부분"
        pct = int(covered / len(exp) * 100) if exp else 0
        fid = f"{covered}/{len(exp)} ({pct}%) · {link_count}링크"
    else:
        status = "최소"
        fid = f"0/{len(exp)} · {link_count}링크"

    return RelReport(
        doc_id=meta.doc_id,
        has_section=has_section,
        link_count=link_count,
        linked_doc_ids=linked_ids,
        expected=exp,
        covered=covered,
        status=status,
        fidelity_display=fid,
    )


def inject_rel_columns(line: str, report: RelReport | None) -> str:
    if not ROW_RE.match(line):
        return line
    doc_id = ROW_RE.match(line).group(1)
    if report is None:
        return line

    if "관련문서" in line and report.doc_id in line:
        return line

    parts = line.rstrip().split("|")
    if len(parts) < 4:
        return line

    # 이미 관련문서 열이 있으면 제거 후 재삽입
    if len(parts) >= 3 and parts[-4].strip() in (
        "완료",
        "부분",
        "최소",
        "미작성",
        "빈섹션",
    ):
        parts = parts[: -4] + parts[-2:]

    path_col = parts[-2]
    middle = parts[1:-2]
    new_parts = [
        "",
        *middle,
        f" {report.status} ",
        f" {report.fidelity_display} ",
        path_col,
        "",
    ]
    return "|".join(new_parts)


def patch_header(line: str) -> str:
    if not line.startswith("| doc_id |"):
        return line
    if "관련문서" in line:
        return line
    return line.replace(
        "| 파일 경로 |",
        "| 관련문서 | 링크·충실도 | 파일 경로 |",
    )


def patch_separator(line: str, prev_line: str) -> str:
    if not line.startswith("| :"):
        return line
    if "관련문서" in prev_line:
        ncol = prev_line.count("|") - 1
        return "|" + "|".join([" :----- "] * ncol) + "|"
    return line


def build_summary(reports: dict[str, RelReport]) -> str:
    total = len(reports)
    counts: dict[str, int] = {}
    for r in reports.values():
        counts[r.status] = counts.get(r.status, 0) + 1

    order = ["완료", "부분", "최소", "빈섹션", "미작성"]
    parts = [f"**{k}** {counts.get(k, 0)}" for k in order if counts.get(k, 0)]
    bar = " · ".join(parts)
    done = counts.get("완료", 0)
    pct = int(done / total * 100) if total else 0

    return (
        f"{SUMMARY_START}\n"
        f"> **관련 문서 링크 현황** (자동 갱신 `{date.today().isoformat()}`) — "
        f"완료 **{done}/{total}** ({pct}%) · {bar}\n"
        f"> 재생성: `python scripts/sync_registry_rel_links.py`\n"
        f"{SUMMARY_END}"
    )


def upsert_summary(text: str, summary: str) -> str:
    if SUMMARY_START in text and SUMMARY_END in text:
        return re.sub(
            rf"{re.escape(SUMMARY_START)}[\s\S]*?{re.escape(SUMMARY_END)}",
            summary,
            text,
        )
    anchor = "## 사용 규칙\n"
    if anchor in text:
        return text.replace(anchor, summary + "\n\n" + anchor)
    return summary + "\n\n" + text


def update_rule_line(text: str) -> str:
    if "`관련문서`·`링크·충실도` 열**" in text:
        return text
    text = text.replace(
        "그래프 링크는 본문 경로 링크만.",
        "그래프 링크는 본문 `## 관련 문서` 경로 링크만.",
    )
    insert = (
        "5. **`관련문서`·`링크·충실도` 열** — "
        "`python scripts/sync_registry_rel_links.py` 로 자동 갱신. 수동 편집하지 않습니다.\n"
    )
    return text.replace(
        "그래프 링크는 본문 `## 관련 문서` 경로 링크만.\n",
        "그래프 링크는 본문 `## 관련 문서` 경로 링크만.\n" + insert,
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check", action="store_true", help="레지스트리 파일을 수정하지 않음"
    )
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    if not REGISTRY.exists():
        print(f"레지스트리 없음: {REGISTRY}", file=sys.stderr)
        return 1

    registry_text = REGISTRY.read_text(encoding="utf-8")
    id_to_path = extract_registry_paths(registry_text)

    metas: list[DocMeta] = []
    for doc_id, path in sorted(id_to_path.items()):
        if not path.exists():
            print(f"WARN 파일 없음 {doc_id}: {path}", file=sys.stderr)
            continue
        fm = parse_frontmatter(path.read_text(encoding="utf-8"))
        metas.append(
            DocMeta(
                doc_id=doc_id,
                path=path,
                parent_doc=fm.get("parent_doc"),  # type: ignore[arg-type]
                implements_doc=fm.get("implements_doc"),  # type: ignore[arg-type]
                see_also=fm.get("see_also") or [],  # type: ignore[arg-type]
            )
        )

    reports = {m.doc_id: analyze_doc(m, id_to_path) for m in metas}

    if args.verbose or args.check:
        for did in sorted(reports):
            r = reports[did]
            print(f"{did}\t{r.status}\t{r.fidelity_display}\tlinked={sorted(r.linked_doc_ids)}")

    counts = {}
    for r in reports.values():
        counts[r.status] = counts.get(r.status, 0) + 1
    print(
        f"요약: 완료 {counts.get('완료',0)}/{len(reports)} · "
        f"부분 {counts.get('부분',0)} · 최소 {counts.get('최소',0)} · "
        f"빈섹션 {counts.get('빈섹션',0)} · 미작성 {counts.get('미작성',0)}"
    )

    if args.check:
        return 0

    lines = registry_text.splitlines()
    out: list[str] = []
    for i, line in enumerate(lines):
        if line.startswith("| doc_id |"):
            line = patch_header(line)
        elif i > 0 and lines[i - 1].startswith("| doc_id |"):
            line = patch_separator(line, lines[i - 1])
        m = ROW_RE.match(line)
        if m:
            line = inject_rel_columns(line, reports.get(m.group(1)))
        out.append(line)

    result = "\n".join(out)
    result = upsert_summary(result, build_summary(reports))
    result = update_rule_line(result)
    REGISTRY.write_text(result, encoding="utf-8")
    print(f"갱신 완료: {REGISTRY}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
