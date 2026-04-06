# [NXN] [UIUX] ④ Nexion Glossary — 용어·언어 라우팅 관리 설계

| 항목 | 내용 |
| :--- | :--- |
| **권장·정식 파일명** | `[NXN] [UIUX] ④ Nexion Glossary — 용어·언어 라우팅 관리 설계.md` _(파일명의 ④ = 5대 중 4번 Glossary)_ |
| **SSOT (5대)** | `_[NXN] NEXA Nexion 5대 지능 관리 시스템.md` — **4번 Nexion Glossary (언어 관리)** |
| **범위** | **용어 원장**, **HEXAGON(5W1H)**, 한국어→영문 IR 규칙, **Ollama** 연동 용어 추출 UI(Terms Inspector 등). |
| **상호 참고** | `_KNOWLEDGE SSOT Knowledge OS 스키마 DDL.md`, `_KNOWLEDGE ARCH 언어적 라우팅 및 지능형 정규화.md`, `[NXN] [UIUX] NEXA Nexion 인터페이스 레이아웃 및 Vue Flow 운영 규약.md`, `[NXN] [UIUX] Nexion TipTap 편집·실시간 반영 및 Ollama 연동 기획.md`, `[NXN] [API] NEXA Nexion API 및 통신 규약.md`(Extended) |

---

## 목차

1. [5대 정렬](#1-5대-정렬)
2. [UI 초점: 사전과 라우팅](#2-ui-초점-사전과-라우팅)
3. [우측 패널·Extension](#3-우측-패널extension)
4. [불변 ID와 메타](#4-불변-id와-메타)
5. [다른 5대와의 경계](#5-다른-5대와의-경계)

---

## 1. 5대 정렬

| 5대 SSOT 요약 | 본 문서의 초점 |
| :--- | :--- |
| **역할** | **용어·HEXAGON 토큰**·언어적 라우팅 경로. |
| **핵심 기능** | `nexa_knowledge_definitions` 원장, 한국어→영문 IR, **Ollama** 연동 추출. |
| **비유** | AI·인간 **공통 언어·사전**. |

---

## 2. UI 초점: 사전과 라우팅

- **목록·검색:** 용어·정의·태그·버전; 변경 요청·불변 토큰 흐름은 ARCH·SCHM SSOT.
- **라우팅 규칙 편집:** 한국어 입력 → 영문 IR 정규화 규칙 — `_KNOWLEDGE ARCH 언어적 라우팅 및 지능형 정규화.md` 와 정합.
- **HEXAGON:** 5W1H 토큰·시트 UI는 지식 OS 스키마·명세와 동기화한다.

---

## 3. 우측 패널·Extension

- **Terms Inspector(Ollama):** 문서 편집 맥락에서 핵심 용어 추출 — 위치·에러 흐름은 `[NXN] [UIUX] NEXA Nexion 인터페이스 레이아웃 및 Vue Flow 운영 규약.md` §6, API Extended.
- **코어 vs Ext:** 용어 추출은 **Phase Ext** 트랙일 수 있으나, **원장·스키마** 는 코어 SSOT와 동일 필드명을 쓴다.

---

## 4. 불변 ID와 메타

- **`term_id` 등 불변 키** + 라벨·정의·동의어·해시는 **메타** — ⑤ Narrative §6·Identity·Capability 문서와 동일 원칙.
- **표기 문자열을 ID로 쓰지 않는다** — 다국어·개정은 메타로 처리.

---

## 5. 다른 5대와의 경계

| 구분 | 설명 |
| :--- | :--- |
| **Identity** | 개체 **영혼 ID** 는 ②. Glossary는 **정의·용어** 엔티티. |
| **Narrative** | 문서·앵커는 ⑤; Glossary는 **문서가 참조하는 용어 정의** 원장. |
| **Capability** | “메뉴에 노출”과 **기능 ID** 는 ③. Glossary는 **의미·IR** 축. |
| **Database** | 테이블 DDL은 ①. `nexa_knowledge_definitions` 등 **테이블 설계** 는 DDL SSOT가 우선한다. |
