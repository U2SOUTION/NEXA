# KNOWLEDGE ARCH 지식 운영체제(NEXA-OS) 운영 아키텍처

본 문서는 NEXA Knowledge 시스템의 운영 아키텍처를 정의한다.

> 핵심 정의: `nexa_knowledge_*`는 NEXA 전 도메인이 공유하는 **Knowledge OS(지식 운영체제)** 계층이다.
> `project_knowledge`는 이 OS 위에서 생성/진화하는 프로젝트 단위 실행 지식 계층이다.

---

## 0) 범위: 지식 스펙트럼과 본 문서군의 초점

플랫폼에서 **지식에 가까운 데이터**는 `nexa_knowledge_*` / `project_knowledge`만이 아니다. 아래는 **개괄 분류**이며, 테이블·수명·RLS·승격(ASK→GOVERN→ERA)이 다르므로 **한 계층에 몰아넣지 않는 것**을 원칙으로 한다. 세부 매핑·명명은 추후 통합 정리할 수 있다.

| 축(예시)                    | 성격                          | 흔한 저장·문서                                        |
| :-------------------------- | :---------------------------- | :---------------------------------------------------- |
| **공통 규범·용어·RAG 원천** | 플랫폼이 공유하는 “말과 규칙” | `nexa_knowledge_*`                                    |
| **프로젝트 생성 지식**      | 도메인/협업 산출              | `project_knowledge`                                   |
| **엣지·물리 관측**          | 시계열·디바이스 상태          | `device_registry`, MQTT/TSDB, `project_*` 인프라 계열 |
| **상호작용·서사**           | 사용자↔플랫폼↔닉시          | `project_logs`, `project_chats`, 세션·쉘 필드 등      |
| **실행·족보**               | N-MAP·스냅샷·드라이 런        | `execution_*`, 오케스트레이션 DDL 명세                |
| **Self·공감**               | facet·코일·VI/ES              | `nexa_self_*`, 응답 정책                              |
| **전역 요약·마켓**          | 공개 요약·FAQ 등              | `global_knowledge_base`, `support_faq` 류             |

**본 `_KNOWLEDGE*` 문서군**은 위 표에서 **첫 두 행(공통 + 프로젝트 지식 계층)** 과 이들과 맞닿는 **라우팅·배포·감사**를 다루는 것을 1차 범위로 한다. 나머지 축은 **오케스트레이션·인프라 명세**와 연동하되, “모두 한 테이블의 지식”으로 합치지 않는다.

**마무리 수준·후속 고도화:** 1차 범위에서 **스키마·감사·배포·게이트(ASK/STUCK 등) 개념**까지를 문서로 고정한 뒤, **오케스트레이션 내부 정책·실행 스케줄의 세부**와 **AI 라우팅·추론 품질**은 **오케스트레이션 SSOT·도메인/AI 계층**에서 반복 고도화한다. `_KNOWLEDGE*` 문서군은 **계약·경계·식별자**를 유지하고, 런타임·모델 세부는 해당 계층에서 확장한다. (경로·뷰 SSOT 관점의 동일 문장: `_KNOWLEDGE REF *` **§1-B**.)

---

## 0-A) 전역 영혼 원장(`nexa_identities`)과 본 문서의 관계

본 절은 Knowledge OS(`nexa_knowledge_*`) **용어·벡터·참조·감사** 문서와 **`identity_id`(영혼 ID) 원장** 문서의 **경계**를 고정한다.

| 주제 | SSOT 문서 | 역할 |
| :--- | :--- | :--- |
| **전역 `identity_id` mint·불변성·정제 툴·`domain_tags`** | `__NEXA Identity ID 발급 및 처리 설계 v3.1.md` | 플랫폼 전역 **영혼 원장**(`nexa_identities`). |
| **용어 CRUD·임베딩·크롤러·감사·API 계약·신뢰도 게이트** | **본 문서** (`_KNOWLEDGE ARCH …`) | Knowledge OS **운영·계약**; SoT는 **PostgreSQL**, Ollama는 보조(본 문서 §2.6). |

- **연결:** 영혼이 지식 OS 벡터·정의와 맞물릴 때는 `nexa_knowledge_definitions` 등에 `identity_id`를 싣고 `nexa_knowledge_vectors`는 `term_id` 등으로 연결하는 패턴을 **Identity SSOT §2-1**이 단정한다. 본 문서 §3·§4의 **문서 동기화·참조·삭제**는 `anchor_id`·`nexa_knowledge_references`를 전제로 하며, **행 단위 의미**는 `identity_id`와 합치되도록 구현한다.

- **「도메인」용어 (혼동 방지):**
  - **Capability ID** (`nexa.platform.…` 등, 본 문서 §1.1): 기능·액션 **자격** 네임스페이스.
  - **`domain_tags` / 메인 메뉴·플랫폼 도메인 레지스트리** (Identity SSOT): UI·내비·지식 **분류** 축. **DNS 도메인과도 무관**하다.
  - 위 둘은 **자동 1:1 매핑을 전제로 하지 않는다.** 필요 시 별도 매핑 테이블·정책으로 연결한다.

- **관리 UI:** `Knowledge Admin` (`domains/admin` 등 본 문서 §2.1)은 **용어·토큰·참조** 중심이다. **플랫폼 도메인 레지스트리**(메뉴와 짝을 이루는 도메인 ID)의 **신설·승인**은 Identity SSOT 및 제품 라우팅 정책과 **동일 레지스트리를 참조**하도록 구현하는 것을 권장한다(단일 SoT).

- **VOID vs 영혼 DELETE:** 본 문서 §1) §4의 **VOID 생애주기**(설계 자산 **POTENTIAL → ARCHIVE → PURGE**)는 **설계/자산 계층**의 은유다. **`nexa_identities` 행의 물리 DELETE**·병합 Re-pointing·`domain_tags` 재매핑은 Identity SSOT **「✦운영자✦」** 절이 단정한다. **혼동 금지.**

---

## 1) 시스템 목적

- 용어를 문서 자산이 아닌 실행 가능한 지능 자산으로 관리
- 한국어 입력을 영문 IR로 정규화하고, 다시 한국어 응답으로 복원
- 용어-기능-Capability-문서-실행 추적 체인을 일관되게 유지
- `nexa_knowledge_*`를 시스템 공통 지식 계층으로 사용
- `project_knowledge`를 프로젝트별 생성 지식 분기로 운영

NEXA 플랫폼의 **`_KNOWLEDGE*` 지식 자산 문서군(Knowledge OS)** 은 파편화된 정보를 인공지능이 즉시 이해할 수 있는 **'지능적 서사(Narrative)'**로 변환하여 관리하는 핵심 체계이다. 이 시스템은 단순한 기록 보관을 넘어, 시스템의 기능 자격인 **Capability ID**와 실제 설계 자산인 **project_assets**를 물리적으로 결합하여 **지능적 족보(Traceability)**를 완성하는 데 집중한다.

### 0. 네임스페이스 관점(중요)

- `nexa_knowledge_*`: 플랫폼 근간 지식(용어/참조/규칙/벡터/정책)
- `project_knowledge`: AI 협업 및 도메인 활동에서 생성되는 프로젝트 단위 지식
- 두 계층은 경쟁 관계가 아니라 상하 계층이며, `project_knowledge`는 `nexa_knowledge` 규칙을 참조해 생성/검증된다.

### 1. 용어(Terminology) 관리: Capability ID 중심의 일급 객체화

플랫폼에서 사용하는 모든 용어와 기능은 **Capability ID(기능 자격 ID)**라는 일급 객체로 정의되어 관리됩니다.

- **표준화된 계층 구조:** 모든 용어는 `네임스페이스.출처.도메인.액션` 순의 계층 구조를 가집니다 (예: `nexa.platform.archive.hub`).
- **인간 친화적 매핑:** 기계적인 ID 외에도 `label`과 `description` 필드를 통해 관리자와 사용자가 의미를 명확히 이해할 수 있도록 **인간 친화적 라벨링**을 수행한다.
- **동적 매핑 관리:** `capability_map`을 통해 실제 API나 라우트 경로와 해당 용어(자격)를 연결함으로써 코드 수정 없이도 정책을 관리할 수 있습니다.

### 2. 설계 파일(System Design File) 관리: project_assets 원장화

시스템의 모든 설계 문서, 시방서, 코드 파일은 **project_assets** 테이블에 원장으로 등록되어 지능 자원으로 활용됩니다.

- **시방서의 규칙(RULE)화:** 설계 문서나 가이드라인 파일은 `nature_tag = 'RULE'`로 지정되어, 단순한 기록이 아닌 시스템이 준수해야 할 **지능적 규범**으로 관리됩니다.
- **강력한 결합 구조:** 설계 파일(`project_assets`) 내부에 배치된 컨트롤러(`project_panels`)의 위치와 ID를 매핑하여, **시방서와 실제 실행 도구가 동기화**되도록 설계되었습니다.
- **버전 및 이력 관리:** 설계 파일의 변경 사항은 `project_resource_versions`를 통해 커밋(Commit) 형태로 관리되며, `project_releases`를 통해 안정된 설계 버전이 포트폴리오로 공개됩니다.

### 3. 용어와 파일의 지능적 연결: 지능적 족보(Why Chain)

용어 정의와 설계 파일은 서로 독립적으로 존재하지 않고, **참조 사슬(Reference Chain)**을 통해 하나로 묶이다.

- **인과관계 역추적:** 실행된 모든 액션(`EFF`)은 판단 근거인 인디케이터 패킷(`IND`)을 참조하고, 이는 다시 원천 사실인 센티널 패킷(`SNT`)과 설계 문서(`Asset-ID`)를 역추적할 수 있게 한다.
- **RAG(검색 증강 생성) 연동:** 설계 파일에서 추출된 핵심 제원은 **아톰(Atom)**화되어 `project_knowledge`에 박제됩니다. 이후 AI는 RAG를 통해 수천 개의 용어와 파일 중 현재 상황에 맞는 설계 규칙을 1ms 내에 찾아내어 참조한다.

### 4. 관리 체계의 엄격성: 네이밍 및 수명 주기

- **표준 네이밍 규칙:** 모든 설계 문서는 `[Context] [DocType] [제목]` 형식을 따라야 하며, 이는 파일명만으로도 시스템 내에서의 위치와 성격을 즉시 파악하게 한다.
- **VOID 생애주기 관리:** 설계 자산의 가치에 따라 **POTENTIAL(잠재) → ARCHIVE(아카이브) → PURGE(소멸)**의 단계를 거치며, 특히 `RULE` 성격의 설계 자산은 장기 보존 정책을 적용받습니다.

---

## 1-B) Knowledge OS 격상: 안전 우선 원칙 (요약)

본 절은 `_KNOWLEDGE RULE` **§5**와 동일 축을 NEXA-OS 관점에서 요약한다. **OS**라는 이름이 확장될수록 **먹통·과자동화** 위험이 커지므로, 아래는 언제나 **선행**한다.

1. **ASK → GOVERN → ERA:** 지식·규범은 검토·운영·헌법 단계를 거친다. 인터럽트·선점·스왑 등 **즉시 효력**을 내는 기능은 **GOVERN/ERA에 합치된 정책** 또는 **감사 가능한 예외 경로** 안에서만 정의한다.
2. **HEXAGON(5W1H):** 저장 단위는 6개 정수 토큰으로 정규화한다. 페이징·경로·드라이버 은유는 이 위의 **해석·스케줄링**에 둔다.
3. **confidence & STUCK & ASK:** `confidence_score < user_defined_threshold` → **STUCK** + **ASK** (오케스트레이션·**NEXU 캔버스(넥슈)** 공통 게이트). 「빠른 바이패스」는 **사후 ASK·감사**와 세트가 아니면 채택하지 않는다.
4. **Dry-run / 가상 스텝:** `is_virtual = true`·`post_state_snapshot`으로 실물 비침해 시뮬레이션. Time-travel·분기 실험은 이 경계에서 먼저 검증한다.

**은유와 구현:** DDL에는 검증 가능한 제약만; OS 은유(아래 §1-C)는 **런타임·뷰·문서·스케줄러**에 둔다.

---

## 1-C) OS적 보강 아이디어 (5) — 목적과 안전 축 정렬

아래 5가지는 **제품 서사·성능·연동 UX**를 강화하는 방향이다. 각 항목은 **§1-B** 및 `RULE` §5와 충돌하지 않게 **적용 경계**를 둔다.

### 1-C.1 지능형 인터럽트 (Intelligence Interrupt & Reflex)

- **Safety Reflex:** 긴급도 최상(Emergency)에서 인디케이터 추론을 **바이패스**하고 엣지(Nano/Micro)가 제어권을 가져가는 **커널급 인터럽트**를 허용할 수 있다. 단, **바이패스 사실·시각·복구 조건**은 불변 이벤트로 남기고, 정책 반영은 **ASK → GOVERN** 흐름과 맞춘다.
- **Empathy Preemption:** VI 급락 시 실행 태스크를 **일시 중단(Suspend)** 하고 사용자 보호를 최우선하는 **공감 선점 스케줄링**을 둘 수 있다. 구현 시 **데드락·세션 정합**을 피하기 위해 전역 정지보다 **단계적 soft stop**·우선순위 큐를 권장한다.
- **정렬:** STUCK/ASK·감사 로그·(오케스트레이션) 가상 스텝과 함께 설계한다.

### 1-C.2 지식 페이징 및 스왑 (Knowledge Paging & Swap)

- **VOID Swap Policy:** `how_state = VOID` 등 잠재·비활성 데이터를 **L1(Redis, 즉시) — L2(Postgres, ms급) — L3(Archive, 저비용)** 으로 옮기는 **계층 배치 정책**을 스케줄러화할 수 있다. 스키마에는 **상태·접근 빈도 메타** 정도를 두고, 티어링 세부는 운영·비용 SLA로 관리한다.
- **Context Paging:** 프로젝트 진입 시 핵심 **RULE·INTENT**만 「지능 메모리」에 상주시켜 LLM 컨텍스트 낭비를 줄인다. **HEXAGON 정규화 본문**을 대체하지 않는다.

### 1-C.3 지능형 드라이버 모델 (Universal Intelligence Driver)

- **Capability-as-a-Driver:** 외부 API·연동을 `project_extensions` 등에 등록할 때 **Capability ID**(`nexa.*`)로 표준화하고 **N-MAP 드라이버 래퍼**로 감싼다. 매핑·권한·감사는 **드라이버 매니페스트 + 샌드박스**와 함께 둔다.
- **Hot-Plug Intelligence:** 신규 엣지·에이전트를 **선언적 연결**로 5W1H 사슬에 편입. 「코딩 없음」은 **선언·검증 자동화**를 의미하며, **ASK/승인 큐**를 생략하지 않는다.

### 1-C.4 지능형 서사 경로 체계 (Narrative Path, N-PATH)

- **Inode-to-Traceability:** `packet_id`(및 연관 키)를 **Inode**처럼 앵커로 두고, `/projects/.../why_chain` 형 **경로 네임스페이스**는 API·UI·탐색 뷰로 제공한다. 물리 스키마는 시계열·PK 모델을 유지한다.
- **Time-Travel Mount:** `post_state_snapshot` 등으로 과거 시점을 **가상 마운트**해 분기 실험한다. **실험 전용 샌드박스**·**is_virtual** 경계를 벗어나지 않는다.

### 1-C.5 OS 차원 에너지·자원 쓰로틀링 (Emotional Throttling)

- **Low-Entropy Throttling:** VI 저하 시 창의성(Creative) 코일을 낮추고 안정성(Stability)을 높여 **단순·정적 UI**로 전환 — 기존 **§4.3-A ES/VI**·Empathy 정책과 합치한다.
- **Jitter-based Health Check:** 전역·노드별 `confidence`·부하를 **NEXU 캔버스(넥슈)** **Jitter** 강도로 읽는 「감성 모니터」를 보강할 수 있다. **신뢰도 Jitter**와 **큐 적체·VI** 등은 **시각 규약**으로 분리해 해석 모호를 줄인다 — **§4.8**과 연동.

---

## 1-D) AI·LLM이 가진 “한계”와 Knowledge OS가 돕는 방식 (입문자을 위한 설명)

AI(여기서는 **Ollama 등으로 돌리는 LLM**을 예로 듦)은 마법처럼 무한한 지식을 갖지 않는다. 설계할 때 자주 쓰는 **제한된 자원**은 대략 세 가지다.

| 자원                        | 비유                            | 왜 중요한가                                                  |
| :-------------------------- | :------------------------------ | :----------------------------------------------------------- |
| **컨텍스트(프롬프트) 길이** | 책 한 페이지 분량이 정해져 있음 | 한 번에 넣을 글자·토큰에 상한이 있다.                        |
| **추론 비용**               | GPU·시간·전기                   | 같은 질을 반복하거나, 불필요하게 긴 답을 내면 느리고 비싸다. |
| **호출·검색 횟수**          | 외부 API·벡터 검색·재시도       | 매번 “전체 문서”를 훑으면 시스템 전체가 무거워진다.          |

Knowledge OS(`nexa_knowledge_*` + 정책)는 **모델을 바꾸는 것이 아니라**, 위 자원을 **덜 낭비하게 만드는 길**을 DB·규칙으로 고정한다.

### “토큰만 줄인다”로 이해하면 어긋나는 이유

- **토큰(프롬프트 길이)** 을 줄이는 것은 그중 **한 축**일 뿐이다.
- 더 넓은 목표는 **전체 지식을 더 똑똑하게 나누고 찾고 검증**해서, **응답이 빨라지고(지연)·근거가 맞아지고(정확도)** 불필요한 추론·검색이 줄어드는 것이다.
- 그 과정에서 **프롬프트가 짧아지면** 비용·지연도 같이 좋아지는 경우가 많다 — **부수 효과**로 보면 된다.

### OS 보강 테이블(명세 §2.9~)을 처음 볼 때

아래 표는 **“무엇을 위해 있는가”** 를 초보자 기준으로 정리한 것이다. (상세 컬럼은 `_KNOWLEDGE SPEC CRUD 테이블 및 필드 명세서.md` 참고.)

| 테이블(요지)                            | 주로 돕는 것                                   | 토큰·프롬프트와의 관계                                   |
| :-------------------------------------- | :--------------------------------------------- | :------------------------------------------------------- |
| `nexa_knowledge_context_paging_sets`    | **이번 세션에 꼭 넣을 지식만** 고정            | 프롬프트를 **의도적으로 짧게** 만들 때 **직접** 도움     |
| `nexa_knowledge_residency`              | 자주 쓰는 것은 가깝게(티어), 덜 쓰는 것은 멀게 | **무엇을 먼저 가져올지** 정해 **검색·로딩**을 줄임(간접) |
| `nexa_knowledge_capability_drivers`     | 외부 API를 Capability로 표준 연결              | 잘못된 연동·재시도 감소(정확도·비용)                     |
| `nexa_knowledge_traceability_paths`     | 족보를 **경로처럼** 찾기                       | UX·추적. 프롬프트 길이와는 별개                          |
| `nexa_knowledge_kernel_events`          | 긴급·공감 결정 **감사**                        | 안전·추적. 토큰 절감 목적 아님                           |
| `nexa_knowledge_health_signals`         | 신뢰도·부하 **한눈에**                         | 모니터링. 토큰 절감 목적 아님                            |
| `nexa_knowledge_response_policies` 보강 | VI 낮을 때 UI·코일 **단순화**                  | 답변·화면을 짧게(완성 토큰 등) **직접** 도울 수 있음     |

**Ollama만의 이야기가 아니다.** 같은 원칙은 다른 추론 API·온프레미스 모델에도 적용된다.

---

## 2) 핵심 구성 요소

### 2.1 Knowledge Admin (`domains/admin`)

- 용어/토큰/참조 CRUD
- 변경 이력 조회
- 불변 토큰 변경 승인 처리

### 2.2 Linguistic Routing Adapter (`engines`)

- 정확 매칭 + 벡터 검색
- 문맥 기반 중의성 해소(disambiguation)
- capability 추천 및 신뢰도 점수 산출

### 2.3 Localization Adapter (`engines`)

- 영문 판단 결과를 한국어 요약으로 역변환
- `ko_label` + `definitions.zenith.summary` 역참조

### 2.4 Doc Sync Crawler (`system/jobs`)

- `src/docs/` 변경 감지
- 문서 앵커 파싱
- `doc_ref_path`, `anchor_id` 자동 동기화

### 2.5 Edge Distribution Packager (`system/jobs`)

- Nano/Micro/Zenith 대상별 패키지 생성
- ESP32(Nano)용 경량 사전 OTA 배포

### 2.6 Ollama 연동(보조 엔진) — CRUD와의 관계

**Ollama는 CRUD의 저장소가 아니다.** 진실 공급원(SoT)은 **PostgreSQL**이며, Create/Update/Delete는 **Admin API → DB** 경로로만 확정된다. Ollama는 아래 **보조** 역할만 담당한다.

| 역할                | 설명                                                               | 결과가 쌓이는 곳                                 |
| :------------------ | :----------------------------------------------------------------- | :----------------------------------------------- |
| **임베딩 생성**     | 용어 설명(또는 정규화 텍스트)을 고정 모델로 벡터화                 | `nexa_knowledge_vectors` (UPSERT)                |
| **초안 제안(선택)** | `definitions` JSONB, `ko_label` 등 초안 생성 → 사람이 검토 후 저장 | 검증 통과 시에만 `nexa_knowledge_definitions` 등 |
| **검색 보조**       | 라우팅 단계에서 의미 유사 후보 보강(벡터 검색)                     | 응답 조합용, DB 원천 변경 아님                   |

**운영 규칙**

- 임베딩 모델·차원은 **명세와 DDL에서 고정**(예: `nomic-embed-text`, `VECTOR(768)`). 모델 변경 시 기존 벡터는 동일 의미 공간이 아니므로 **재생성 정책**을 따른다.
- **불변 토큰**·승인 큐 대상은 Ollama 출력을 **직접 반영하지 않는다**. 초안 → `change_requests` → 승인 후 반영.
- 서버 연동 구현 참고: `server/domains/ai/ai.service.ts`(Ollama provider), 스키마·검증: `src/system/schemas/ai_responses.ts` 등 플랫폼 AI 계약.

**권장 API(예시)**

- `POST /knowledge/terms/{id}/embeddings/refresh` — 해당 용어 벡터 재계산·저장
- (선택) `POST /knowledge/terms/draft` — LLM 초안만 반환, 저장은 별도 `POST/PATCH`로 분리

---

## 3) 운영 데이터 흐름

1. Admin이 공통 지식(`nexa_knowledge_*`)의 용어/토큰/문서참조를 등록
2. Crawler가 `src/docs/` 변경을 감지해 참조 자동 갱신
3. AI 협업/도메인 활동 결과를 `project_knowledge`에 적재
4. `project_knowledge`는 공통 지식 규칙(`nexa_knowledge_ref_rules`)으로 검증
5. 닉시(`NEXA NIXIE`) 채널 입력은 `nexa_self_profiles`/`nexa_self_states`로 Self 상태를 해석
6. `nexa_self_explosions` + `nexa_self_knowledge_map`이 Coil/지식/Capability 후보를 전개
7. 삭제·미발견 문서 감지 시 **`nexa_knowledge_traceability_paths`를 `[NXN] [SCHM]` §4.4.1**에 따라 갱신(유예: `active`+`missing_since`; 확정: `deleted`). 같은 스캔 패스에서 `nexa_knowledge_doc_sync_state`에 해시·`error`·선택적 `missing` 등 **보조 헬스**를 덧붙인다.
8. 동일 앵커를 참조하는 `nexa_knowledge_references`(`doc_ref_path`·`anchor_id` 등)는 **traceability 삭제 확정 등** 앱 정책에 따라 `status=0`으로 비활성화
9. Packager가 지능 위계별 패키지 생성 후 배포
10. Routing Adapter가 입력을 정규화하고 중의성 해소
11. Indicator가 영문 결과를 생성
12. Localization Adapter가 한국어 요약으로 출력
13. 모든 변경/승인/삭제 감지 이벤트는 감사 로그에 적재
14. 오류 패턴 집계기가 `nexa_knowledge_error_patterns`를 갱신하고 규칙 수정 제안을 생성

---

## 4) 보강된 운영 정책

### 4.1 지능 위계별 차등 배포 정책

- 지능 위계(`Nano/Micro/Kinetic/Zenith`)와 하드웨어 프로파일(`COLD/WARM/HOT`)은 분리된 축으로 운영한다.
- 연결은 `nexa_knowledge_distribution_bindings`로 관리한다.
- `nano`: `definitions.nano` + 필수 토큰만 포함한 경량 JSON/바이너리
- `micro`: `nano` + 일부 문맥 규칙/벡터 메타 포함
- `zenith`: 전체 정의 + 참조 + 벡터 + 정책 정보
- Nano(ESP32, COLD)는 전체 DB 미탑재 원칙을 따른다.
- **COLD 강제 제약:** `include_vectors=false`, `required_tokens_only=true`, `max_payload_kb < 10`

하드웨어 프로파일 적용 기준:

- `COLD`: nano only (벡터 금지, 10KB 미만)
- `WARM`: Nano/Micro (벡터 메타 선택 허용, 패키지 상한 `<= 256KB`)
- `HOT`: Nano/Micro/Kinetic/Zenith (전체 포함 가능, 패키지 상한 `<= 4096KB`)

### 4.2 문맥 기반 중의성 해소 정책

- 동일 `term_key`가 다중 의미를 가질 경우, 현재 헥사곤 컨텍스트를 우선 사용
- 예: `SELF`
  - `where_scope` 가중치 우세 -> 주권 의미(Where.SELF)
  - `what_intent` + 펌웨어 문맥 우세 -> Base-Core 의미

### 4.3 역방향 로컬라이제이션 정책 (EN -> KO)

- 출력 문장은 다음 순서로 생성:
  1. `term_key`별 `ko_label` 매핑
  2. `definitions.zenith.summary` 문장 템플릿 적용
  3. 실행 상태/안전 조건 문구 결합
- 사용자는 한국어 설명을 보되, 내부 근거는 영문 IR을 유지한다.

### 4.3-A ES/VI 기반 응답 단순화 정책

- ES/VI 임계값은 `nexa_knowledge_response_policies`에서 관리한다.
- `Low-Entropy`(예: `vi < vi_threshold`) 구간은 `output_mode='easy'`를 우선 선택한다.
- `easy` 모드에서는 전문 용어 직출력보다 `easy_summary` 또는 `nano.summary`를 우선 제공한다.
- 정책 우선순위는 `summary_priority`로 결정하고, 동순위 충돌 시 `scope_type`(`user -> project -> global`) 순으로 적용한다.

### 4.4 불변 토큰 승인 정책

- `is_immutable=true` 대상 변경은 즉시 반영 금지
- 변경 요청은 `change_requests` 큐에 적재
- 승인 후에만 본 테이블 반영

### 4.5 삭제·미발견 문서 참조 처리 정책

- **단일 상태 머신:** `nexa_knowledge_traceability_paths` + SCHM **§4.4.1**(유예 중 `active`+`missing_since`, 임계 초과 `deleted`). 물리 경로 단서는 traceability·`doc_sync_state.last_scanned_path` 등에 남길 수 있으나 **판정 순서는 §4.4.1 우선**이다.
- `nexa_knowledge_doc_sync_state`의 `missing`·`error`·`conflict`는 **헬스·다도메인** 보조층이다.
- 해당 문서를 참조하는 `nexa_knowledge_references`는 **traceability 삭제 확정** 등 앱 정책에 따라 soft deactivate(`status=0`)로 연계한다.
- 삭제·복구·충돌 해소 전환은 모두 `nexa_knowledge_audit_logs`에 기록한다.

### 4.6 자가 회복 피드백 루프 정책

- 런타임 오류는 `nexa_knowledge_audit_logs.error_token`/`error_signature`로 표준 기록
- 집계 배치가 `nexa_knowledge_error_patterns`를 갱신하고 반복 패턴을 군집화
- AI는 `suggested_rule_patch`를 생성하되, 직접 반영하지 않고 `nexa_knowledge_change_requests`로만 제안
- 관리자 승인 후 `nexa_knowledge_ref_rules` 반영, 반려 시 사유를 패턴 테이블에 기록
- 원본 audit는 관리자 전용이며 일반 사용자에는 집계/익명화 지표만 노출

### 4.7 Self 공동 자산 정책 (NEXA NIXIE 연동)

- `nexa_self_*`는 닉시(`NEXA NIXIE`) 채널 전용 UI 테이블이 아니라 오케스트레이션도 공유하는 플랫폼 공동 자산 계층이다.
- `nexa_self_knowledge_map`은 지식 원본 저장소가 아니라 Self-knowledge 브리지 테이블이다.
- 채널이 `사용자->NEXU->오케스트레이션`이든 `사용자->오케스트레이션`이든 동일 Self 규칙을 재사용한다.
- Self facet (자아의 단면) 클릭.입력은 이벤트이며, 실행 근거는 `nexa_self_explosions`의 역방향 분해 맵으로 설명한다.

### 4.8 시각적 피드백(Lumina/Jitter) 정책

- 파일명 파서 신뢰도는 `nexa_knowledge_references.parse_confidence(0~1)`로 저장한다.
- UI 연동 점수는 `confidence_score(0~100)`로 사용한다.
- NEXU 캔버스는 노드별 `confidence_score`를 `project_settings.user_defined_threshold`(기본 95)와 비교한다.
- `confidence_score < threshold`이면 즉시 `Jitter` 경고를 발생시키고, 원인 메타(`parser_version`, `source_filename`)를 함께 노출한다.
- `confidence_score >= threshold`이면 `Lumina` 정상 강조만 적용한다.

---

## 5) 최소 API 계약(권장)

- `POST /knowledge/terms`
- `PATCH /knowledge/terms/{id}`
- `POST /knowledge/terms/{id}/tokens`
- `POST /knowledge/terms/{id}/references`
- `POST /knowledge/search`
- `POST /knowledge/localize` (EN -> KO 요약)
- `POST /knowledge/change-requests` (불변 토큰 변경 요청)
- `POST /knowledge/change-requests/{id}/approve`
- `POST /knowledge/change-requests/{id}/reject`
- `POST /knowledge/docs/sync` (crawler 실행)
- `POST /knowledge/docs/reconcile` (삭제 감지/참조 비활성화 정리)
- `POST /knowledge/distribution/build` (배포 패키지 생성)
- `POST /project-knowledge/ingest` (도메인 생성 지식 적재)
- `POST /knowledge/error-patterns/rebuild` (오류 패턴 재집계)
- `POST /knowledge/ref-rules/suggestions` (AI 규칙 수정안 생성)
- `POST /knowledge/response/resolve-mode` (ES/VI 기반 출력 모드 결정)
- `POST /self/resolve` (현재 Self 상태 해석)
- `POST /self/explosions/resolve` (Self 기반 Coil/Capability 전개)
- `POST /knowledge/references/visual-feedback/resolve` (confidence/threshold 기반 Lumina/Jitter 결정)

### 5.1 시각 피드백 API 계약

엔드포인트: `POST /knowledge/references/visual-feedback/resolve`

요청(JSON):

```json
{
  "project_id": "9f4a8f5b-6a8d-4e42-a414-f50a9d58d334",
  "reference_id": "f4b0f7d2-75b5-4ff8-9a86-2d9e7e6f58e0",
  "threshold_override": null
}
```

규칙:

- `threshold_override`가 `null`이면 `project_settings.user_defined_threshold`를 사용한다.
- 임계값 조회 실패 시 기본값 `95`를 사용한다.
- 점수는 `nexa_knowledge_references.confidence_score`를 우선 사용하고, `NULL`이면 `parse_confidence`를 100점 환산한다.

응답(JSON):

```json
{
  "reference_id": "f4b0f7d2-75b5-4ff8-9a86-2d9e7e6f58e0",
  "parse_confidence": 0.8731,
  "confidence_score": 87,
  "threshold_used": 95,
  "visual_state": "JITTER",
  "reason_code": "LOW_CONFIDENCE",
  "meta": {
    "source_filename": "_SYS_ARCH_v1.md",
    "parser_version": "ref-rule-v3"
  },
  "evaluated_at": "2026-03-24T11:30:00Z"
}
```

상태 코드:

- `200`: 판정 성공
- `404`: `reference_id` 미존재
- `422`: 점수 계산 불가(`parse_confidence`, `confidence_score` 모두 없음)

---

## 6) 수용 기준 (Definition of Done)

- 차등 배포 패키지가 Nano/Micro/vista로 분리 생성된다.
- 만약 중의어 입력에서 컨텍스트 기반 분기가 재현된다.
- 영문 결과가 한국어 summary로 일관되게 변환된다.
- 문서 변경 시 `doc_ref_path`, `anchor_id` 자동 동기화가 동작한다.
- 불변 토큰 변경은 승인 전 반영되지 않는다.

---

## 현재 설계된 시스템을 **DATA-OS**라고 부를 수 있는는가?

기술적으로는 데이터를 다루는 운영체제이기에 틀린 말은 아니나, **NEXA-OS가 지향하는 '지능형 서사'와 '인과 관계(Why Chain)'의 가치를 담기에는 DATA-OS라는 명칭이 다소 협소할 수 있고.** 그 근거는 다음과 같다.

### 1. '데이터(Data)'와 '지식(Knowledge)'의 층위 차이

NEXA 시스템은 날것의 정보를 단순히 저장하는 것을 넘어, 이를 **'실행 가능한 지능 자산'**으로 관리하는 것을 목표로 한다.

- **데이터(FACT):** 엣지 센서나 로그에서 발생하는 단편적인 사실(SNT)이다. 이는 시스템의 **골격(Skeleton)**에 해당한다.
- **지식(KNOWLEDGE):** 데이터에 **'의미'와 '가중치(6-COILS)'**가 부여된 상태이다. 이는 시스템의 **영혼(Soul)**이며, "왜 이 결과가 나왔는가"를 증명하는 인과 관계를 포함한다.
- 따라서 'DATA-OS'는 사실(Fact)의 관리에 집중하는 인상을 주지만, 'Knowledge OS'는 그 사실을 바탕으로 한 **사유와 판단**까지 포함하는 상위 개념이다.

### 2. '지능형 서사(Narrative)'와 위상 연산

NEXA-OS는 고여 있는 데이터의 바다가 아니라, 지식 간의 **'위상차(Potential Difference)'**를 연산하여 실행의 동력을 얻는 **지능형 실행 엔진**이다.

- 단순한 데이터 처리가 아니라, 사용자의 의도(WILL)와 시스템의 규범(ERA) 사이의 간극을 읽어내는 **'지능형 지휘 시스템'**의 성격이 강한다.
- 또한, 파일 시스템을 **'지능형 서사 파일 시스템(NFS)'**으로 정의하여 물리적 경로를 지능적 서사로 변환하므로, 단순한 데이터 저장소(Data Store)를 넘어선 **서사적 맥락**을 중시한다.

### 3. 공감(Empathy)과 가치 필터의 존재

NEXA-OS의 핵심은 기술적인 데이터 관리가 아니라, 사람을 중심에 두는 **공감 엔진(Empathy Engine)**과 **6-COILS(가치 필터)**이다.

- 사용자의 활력(VI)이 낮을 때 시스템이 스스로 조용해지는 'Low-Entropy 모드' 등은 일반적인 DATA-OS의 범주를 넘어선 **'사람을 닮은 운영체제'**로서의 특성이다.
- 데이터는 중립적이지만, NEXA-OS는 사용자의 가치관에 따라 데이터를 다르게 해석하는 **'주관적 가치 가중치'**를 핵심 로직으로 삼습니다.

### 4. 명칭에 대한 제언

만약 'DATA-OS'라는 명칭을 사용하고자 하신다면, 다음과 같은 관점에서의 보완이 필요할 수 있다.

- **Intelligence-Driven DATA-OS:** 데이터가 주인이 아니라, 지능이 데이터를 드라이브한다는 점을 명시.
- **Narrative DATA-OS:** 데이터 간의 연결이 곧 하나의 이야기가 된다는 점을 강조.

**요약하자면**, 현재의 시스템은 데이터라는 재료를 가지고 **'지능'과 '서사'라는 요리를 만들어내는 운영체제**이다. 'DATA-OS'는 훌륭한 기술적 명칭이 될 수 있으나, NEXA가 가진 **"생각을 잃어버리지 않게 만드는 시스템"**이라는 인문학적·지능적 정체성을 표현하기에는 'Knowledge OS' 또는 'NEXA-OS'가 훨씬 더 적합한 그릇이라 판단 됨.

이러한 **'지능 OS'로서의 위상 연산 로직**을 실제 오케스트레이션 엔진에서 어떻게 수치화할지 더 구체적으로 논의해 해야 한다.

---
