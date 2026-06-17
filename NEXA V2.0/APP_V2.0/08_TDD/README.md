# 08_TDD — 기술 설계 (Technical Design Document)

**목적**: 아키텍처, DB, API, 보안, CI/CD.

**플랫폼 방향:** NEXA는 **산업 → 아트 → 일상** 순으로 발전 — BRD [`01_BRD_NEXA_사업마스터플랜`](../01_BRD/01_BRD_NEXA_사업마스터플랜.md) SSOT.

**파일명**: `08_TDD_<도메인>_<주제>.md` (11대 `08_` 접두 유지)

**폴더 구조**: 문서가 15건 이상·도메인이 5개 이상이면 **주제별 하위 폴더**로 분리한다. 11대 분류 번호 `08_TDD`는 그대로 두고, 그 아래에 도메인 폴더를 둔다.

```
08_TDD/
  README.md
  NEXAOS/      # 플랫폼 셸·모노레포·보안 SSOT
  LangGraph/   # LangGraph·agent-graph·IoT·온톨로지 스택
  NEXIA/       # NEXIA 도메인 전용
  Cosmic/      # CSIM·AXON·Cosmic Language
  Galthon/     # Galthon · Trust Watch · Why-Chain 감시 (GL)
  Knowledge/   # Knowledge OS
  Identity/    # Identity·Capability·신뢰도
  AI/          # AI 워크스페이스·Yjs·GOVERN·데이터 프로토콜
  Ontex/       # Ontex · 온톨로지·Graph RAG·지식 허브
```

**연계**: `04_Decision`(Why) · `../prompts/` 비판 검토 후 확정

---

## 하위 폴더

| 폴더 | 설명 | README |
| :--- | :--- | :--- |
| [NEXAOS](./NEXAOS/) | NEXA OS 설계 표준·도메인 레지스트리·플랫폼 스택 | [NEXAOS/README](./NEXAOS/README.md) |
| [LangGraph](./LangGraph/) | LangGraph 모노레포·agent-graph·IoT 스택 | [LangGraph/README](./LangGraph/README.md) |
| [NEXIA](./NEXIA/) | NEXIA 도메인 보안·권한 | [NEXIA/README](./NEXIA/README.md) |
| [Cosmic](./Cosmic/) | CSIM·AXON·Cosmic Language | [Cosmic/README](./Cosmic/README.md) |
| [Galthon](./Galthon/) | Galthon · Trust Watch · Why-Chain 감시 (GL) | [Galthon/README](./Galthon/README.md) |
| [Knowledge](./Knowledge/) | Knowledge OS API·라우팅·로드맵 | [Knowledge/README](./Knowledge/README.md) |
| [Identity](./Identity/) | Identity ID·Capability·신뢰도 | [Identity/README](./Identity/README.md) |
| [AI](./AI/) | Yjs·협업 워크스페이스·GOVERN·RAG | [AI/README](./AI/README.md) |
| [Ontex](./Ontex/) | Ontex · Graph RAG · subRoute · Nexion | [Ontex/README](./Ontex/README.md) |

---

## 문서 목록 (전체)

### NEXAOS

| 문서 | 설명 |
| :--- | :--- |
| [설계표준_미션크리티컬전략](./NEXAOS/08_TDD_NEXAOS_설계표준_미션크리티컬전략.md) | NEXA OS 설계 표준 (SSOT) |
| [도메인구조통합_v1.0](./NEXAOS/08_TDD_NEXAOS_도메인구조통합_v1.0.md) | 도메인 구조 통합 SSOT (TDD-071) — 구 TDD-002 + TDD-059 |
| [수직계층보안아키텍처](./NEXAOS/08_TDD_NEXAOS_수직계층보안아키텍처.md) | 수직 계층 보안 |
| [플랫폼기술스택](./NEXAOS/08_TDD_NEXAOS_플랫폼기술스택.md) | 플랫폼 기술 스택 |
| [4대핵심_체크리스트상세](./NEXAOS/08_TDD_NEXAOS_4대핵심_체크리스트상세.md) | 아카이브 상세 |

### LangGraph

| 문서 | 설명 |
| :--- | :--- |
| [모노레포폴더구조](./LangGraph/08_TDD_LangGraph_모노레포폴더구조_v1.0.md) | LangGraph 모노레포 |
| [LangGraph 플랫폼](./LangGraph/08_TDD_LangGraph_인간LLM협업형IoT온톨로지플랫폼_v1.0.md) | LangGraph 아키텍처 |
| [IoT 핵심기술스택](./LangGraph/08_TDD_IoT온톨로지AI협력플랫폼_핵심기술스택_v1.0.md) | IoT·온톨로지·AI 스택 |
| [오케스트레이션설계](./LangGraph/08_TDD_LangGraph_오케스트레이션설계_v1.0.md) | 플랫폼 오케스트레이션 · graph_id (TDD-058) |

### Ontex

| 문서 | 설명 |
| :--- | :--- |
| [기술스택운영방침](./Ontex/08_TDD_Ontex_기술스택운영방침_v1.0.md) | Ontex Normative 진입점 (TDD-057) |

### NEXIA · Cosmic · Knowledge · Identity · AI

| 폴더 | 문서 |
| :--- | :--- |
| NEXIA | [README](./NEXIA/README.md) — 구조·엔진·MQTT·제너레이터·보안 등 **20건** |
| Cosmic | [CSIM_AXON](./Cosmic/08_TDD_CSIM_AXON프로토콜_정본.md) · [CosmicLanguage](./Cosmic/08_TDD_CosmicLanguage_전역데이터아키텍처.md) |
| Knowledge | [API운영정책](./Knowledge/08_TDD_Knowledge_지식운영체제_API운영정책.md) · [지식층위](./Knowledge/08_TDD_Knowledge_지식층위와오케스트레이션.md) · [언어적라우팅](./Knowledge/08_TDD_Knowledge_언어적라우팅및지능형정규화.md) · [구축로드맵](./Knowledge/08_TDD_Knowledge_시스템구축순서및로드맵.md) |
| Identity | [IdentityID](./Identity/08_TDD_NEXA_IdentityID발급및처리설계.md) · [CapabilityID](./Identity/08_TDD_NEXA_CapabilityID체계_발급및Tier접근권한.md) · [부록](./Identity/08_TDD_NEXA_Capability기능자격_운영및보안부록.md) · [신뢰도점수](./Identity/08_TDD_NEXA_데이터무결성과신뢰도점수.md) |
| AI | [README](./AI/README.md) — Yjs SSOT · 협업 워크스페이스 · GOVERN 등 **10건** |

> **미이관:** `_KNOWLEDGE RULE` · `SPEC CRUD` · `DDL` — NEXA-Platform에 남아 있을 수 있음. `_inbox`는 초안만.
