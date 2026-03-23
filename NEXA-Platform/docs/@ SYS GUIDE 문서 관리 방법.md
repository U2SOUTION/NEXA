# SYS GUIDE 문서 관리 방법

> 파일명 네이밍 규칙을 실제로 어떻게 적용하는가
> 규칙 자체는 `SYS GLOSSARY 문서 네이밍 규칙.md` 참조

---

## 이 문서의 목적

```
SYS GLOSSARY 문서 네이밍 규칙.md   → 규칙이 무엇인가
SYS GUIDE 문서 관리 방법.md        → 규칙을 어떻게 적용하는가   ← 이 문서
SYS PLAN NEXA 전체 작업 순서.md    → 지금 무엇을 해야 하는가
```

---

## 파일명으로 현황을 읽는 방법

탐색기에서 파일 목록을 볼 때 파일명만으로 현재 상태를 파악할 수 있어요.

### DocType으로 프로세스 단계 파악

```
DocType 순서 = 개발 워크플로우 순서

NOTE / SPIKE          아직 탐색 단계
VISION / CONCEPT      방향과 개념 정의 단계
PRD / REQ             요구사항 정의 단계
RFC                   검토 중, 아직 결정 전
ADR                   결정 완료
ARCH                  구조 설계 완료
DESIGN / SPEC         세부 설계 및 명세 단계
SCHEMA                데이터 구조 정의 완료
GUIDE / RUNBOOK       운영 가능 단계
```

예시로 AIS Context를 보면:

```
AIS ARCH AI 협업형 멀티 에디터 플랫폼 구축.md   → 구조 설계됨
AIS RFC ASK VOID 처리 설계.md                   → 아직 검토 중
AIS SPEC AI 협업 TS 타입 스키마.md              → 명세 확정됨
```

ARCH와 SPEC이 있지만 ADR이 없다 → 주요 결정 사항이 아직 기록되지 않음

### 접두어로 파일 상태 파악

```
_  파일명 앞   진행 중, 미완료. 탐색기 최상단에 위치
@  파일명 앞   수정 금지, 기준 문서. 탐색기 최상단에 위치
없음           일반 문서
```

---

## Context별 현황 파악 방법

파일 목록에서 Context 코드를 기준으로 묶어서 보면 현황이 보여요.

### 현황 읽는 순서

```
1. 해당 Context 파일 목록 확인
2. DocType 종류 확인
   → VISION, CONCEPT만 있음   : 아직 초기 탐색 단계
   → RFC가 많음               : 기획 중, 결정 전
   → ARCH, DESIGN, SPEC 있음  : 설계 진행 중
   → ADR 있음                 : 주요 결정 완료
   → GUIDE, RUNBOOK 있음      : 운영 가능 단계
3. 빠진 DocType 확인
   → RFC는 있는데 ADR 없음    : 결정 기록 필요
   → ARCH 없는데 SPEC 있음    : 전체 구조 먼저 필요
   → SCHEMA 없는데 SPEC 있음  : 데이터 구조 정의 필요
```

### Context별 현재 단계 (2026-03-22 기준)

| Context | 완료된 DocType | 부족한 것 |
|---------|--------------|---------|
| `NEXA` | VISION, CONCEPT, REF | ADR (주요 결정 기록) |
| `SYS` | ARCH, CONCEPT, GLOSSARY, GUIDE | SPEC, ADR |
| `AIS` | SPEC, ARCH, RFC, DESIGN | ADR (결정 완료 기록) |
| `NOD` | RFC, SPEC, DESIGN, ARCH | ADR, SCHEMA |
| `ADM` | RFC, DESIGN | SPEC, SCHEMA |
| `AUTH` | RFC | ARCH, DESIGN, SPEC |
| `NEXU` | VISION, ARCH, REQ | DESIGN, SPEC |
| `NIXIE` | ARCH, CONCEPT | DESIGN, SPEC |
| `ARC` | RFC | ARCH, DESIGN |
| `DDL` | SCHEMA | REF 확정 |
| `UCL` | ARCH, SPEC, DESIGN | ADR, GUIDE |
| `INF` | GUIDE | ARCH |
| `DEV` | GUIDE | — |

---

## 체크리스트 템플릿 활용법

### 템플릿 두 종류

```
SYS REF Context 작업 체크리스트 템플릿 A 서비스기능.md
  → AIS, NOD, BRD, ARC, TRC 등 UI + 백엔드 + 데이터가 함께 있는 Context

SYS REF Context 작업 체크리스트 템플릿 B 기술인프라.md
  → AUTH, DDL, INF, UCL, NEXU 등 기술 구조 중심 Context
```

### 새 Context 작업 시작 방법

```
1. 해당 Context 성격 파악
   → 서비스 기능이면 템플릿 A
   → 기술/인프라면 템플릿 B

2. 템플릿 복사 후 파일 생성
   → {Context} PLAN {Context명} 작업 체크리스트.md
   → 예: AIS PLAN AI 워크스페이스 작업 체크리스트.md

3. {Context}, {Context명}, {날짜} 교체

4. 작업하면서 하나씩 체크
```

### 빠진 문서 파악 방법

템플릿 체크리스트 항목 = 있어야 할 문서 목록이에요.

```
체크리스트 항목과 실제 파일 목록 비교

- [x] {Context} ARCH 작성   ← 파일 있음 → 체크
- [ ] {Context} ADR 작성    ← 파일 없음 → 빠진 문서 발견
- [ ] {Context} SCHEMA 작성 ← 파일 없음 → 빠진 문서 발견
```

### 문서를 만드는 기준

```
체크리스트 항목이 있다          → 만들어야 할 문서
현재 작업 단계에 해당한다       → 지금 만들어야 할 문서
현재 단계보다 앞선 항목이다     → 아직 안 만들어도 됨

ARCH 없는데 SPEC을 만들려 한다
  → 체크리스트 보면 ARCH가 SPEC보다 앞에 있음
  → ARCH 먼저 만들어야 한다는 기준이 생김

RFC 있는데 ADR이 없다
  → 아직 결정이 안 난 것
  → ADR 만들기 전에 RFC를 먼저 확정해야 함
```

---

## 파일명 변경이 필요한 경우

### RFC → ADR 전환

RFC 단계 문서가 결정 완료되면 파일명을 바꿔요.

```
변경 전   AIS RFC AI 협업 TS 타입 스키마.md
변경 후   AIS ADR AI 협업 TS 타입 스키마 결정.md
```

내용도 "제안" → "결정 이유와 맥락" 으로 업데이트.

### 버전 올리기

내용이 크게 바뀌면 파일명 끝 버전을 올려요.

```
변경 전   NEXU REQ JAB5 멀티앰프 스피커 지능 선택 설계 v0.8.md
변경 후   NEXU REQ JAB5 멀티앰프 스피커 지능 선택 설계 v0.9.md
```

### 진행 중 → 완료

작업이 완료되면 앞의 `_`를 제거해요.

```
변경 전   _ AIS RFC 진행 중인 기획.md
변경 후   AIS RFC 진행 중인 기획.md
```

---

## 정리가 필요한 파일 목록 (2026-03-22 기준)

네이밍 규칙 미적용 파일들이에요. 내용 확인 후 순차적으로 정리.

| 현재 파일명 | 변경 후 파일명 | 비고 |
|------------|--------------|------|
| `@ GLOSSARY SYS 문서 네이밍 규칙 FULL CATE.md` | `@ SYS REF 문서 네이밍 규칙 전체.md` | @ 유지 |
| `@ SYS GLOSSARY 문서 네이밍 규칙.md` | `@ SYS GLOSSARY 문서 네이밍 규칙.md` | @ 유지, 현재 OK |
| `NEXA 용어집 Glossary v0.2.md` | `SYS GLOSSARY NEXA 용어집 v0.2.md` | — |
| `NEXA Master Design_v0.4.md` | `NEXA REF Master Design v0.4.md` | — |
| `AIS DESIGN tiptap 엔진 도메인 옵션.md` | 현재 OK | 번호 없음 의도적 |
| `AIS RFC 탐색기 미디어탭 동기화 기획.md` | 현재 OK | 번호 없음 의도적 |
| `AIS RFC AI 드롭존 첨부 기능 플랜.md` | `AIS RFC AI 드롭존 첨부 기능.md` | PLAN → 플랜 제거 |

---

*작성: 2026-03-22*
*상태: 수시 업데이트 필요*
