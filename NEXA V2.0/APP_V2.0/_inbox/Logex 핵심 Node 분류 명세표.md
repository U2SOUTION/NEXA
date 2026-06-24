##  Logex 핵심 Node(노드) 분류 명세표

| #   | 노드 분류 (Category)     | 주요 컴포넌트 노드                                            | 핵심 역할 및 데이터 처리 방식                                     | `Logex Canvas` 아키텍처 매핑 및 힌트                                   |
| --- | ------------------------ | ------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Text & Prompts           | `Text`, `Assemble Prompt`, `Chunk`, `Split Text`              | 변수 치환(`{{variable}}`), 텍스트 조각 조립 및 청크 분할          | Tiptap 에디터에서 작성된 기획 초안을 프롬프트 규격으로 조립하는 레이어 |
| 2   | AI & LLM Core            | `Chat`, `GPT Function`, `Get Embedding`, `Trim Chat Messages` | LLM API 호출, 펑션 콜링 정의, 컨텍스트 윈도우 관리 및 임베딩 변환 | `agent-graph` 내부의 Ollama/vLLM 추론 핵심 엔진 노드로 구체화          |
| 3   | Control Flow & Logic     | `If/Else`, `Match`, `Loop Controller`, `Abort Graph`          | 조건 분기, Switch-Case 매칭, 순환 루프 제어, 에이전트 강제 종료   | `LOOP 설계도`의 자율 개선 루프 및 탈출 궤도를 결정하는 핵심 관문       |
| 4   | Data Types               | `Number`, `Bool`, `Object`, `Image`, `Audio`, `Evaluate`      | 정적 원시 데이터 타입 선언 및 Handlebars 내부 수학 수식 연산      | 와이어(Wire)를 통해 흐르는 데이터의 타입을 명시하는 캔버스 기본 노드   |
| 5   | Lists & Arrays           | `Array`, `Filter`, `Pop`, `Slice`, `Shuffle`                  | 데이터 배열 생성 및 요소 필터링, 정렬, 슬라이싱                   | RAG를 통해 추출된 대량의 가이드라인 리스트를 제어할 때 활용            |
| 6   | Objects & Parsing        | `Extract JSON`, `Extract YAML`, `To JSON`                     | LLM의 텍스트 응답에서 구조화된 객체(JSON)를 강제 발라내기         | 심사관(Judge) 뇌가 뱉는 초-저맥락 JSON 리포트를 객체화하는 노드        |
| 7   | Input / Output           | `Graph Input`, `Graph Output`, `User Input`                   | 서브그래프 간의 입출력 포트 정의 및 인간 개입 대기 게이트         | `LOOP 검증`의 4회차 강제 정지 및 Human-in-the-loop 인터럽트 게이트     |
| 8   | Datasets & Vector        | `Vector Store`, `Vector KNN`, `Read File`                     | 벡터 DB 검색(유사도 룩업) 및 로컬 파일 시스템 탐색                | `LOOP 기억`의 듀얼 RAG 지식 검색 및 PostgreSQL(pgvector) 연동부        |
| 9   | Advanced & Extensibility | `Code`, `Subgraph`, `External Call`, `MCP Nodes`              | JS/TS 커스텀 스크립트 실행, 에이전트 모듈화, 외부 도구 동적 발견  | AST 정적 분석기, 라인 수 제한 카운터 등 물리적 강제 규칙 코드 주입구   |

## CI 랭그래프 노드 분류 명세표

| 구분 (Category)    | 노드 명칭            | 입력 데이터 (IN) & 타입   | 출력 데이터 (OUT) & 타입                       | 핵심 메커니즘 및 지능 운용 방식 (Detailed Mechanism)                                                                                                                        |
| :----------------- | :------------------- | :------------------------ | :--------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Infra**          | **Env Checker**      | `None`                    | `env_status: Literal["OK", "FAIL"]`            | **환경 무결성 검증**: `psycopg2`, `neo4j` 등 핵심 인프라의 가용성을 확인하고, 런타임 의존성 버전이 `[[Normex]]` 규격과 일치하는지 확약함.                                   |
| **Perception**     | **File Scanner**     | `env_status: str`         | `source_files: Dict[path, hash]`               | **결정적 스냅샷 생성**: 전체 프로젝트 디렉토리를 재귀적으로 순회하며 파일별 해시값을 추출. 변경된 파일만 식별하여 차기 노드의 연산 부하를 최소화함.                         |
| **Perception**     | **Scope Resolver**   | `user_request: str`       | `target_files: List[str]`, `rules: List[Dict]` | **맥락적 범위 확정**: 유저 요청과 `git diff`를 결합하여 수정 대상을 타겟팅. 동시에 `[[Dual-RAG]]`를 가동하여 해당 도메인에 박제된 `[[인과적 통찰]]` 룰셋을 로드함.          |
| **Execution**      | **E2E Tester**       | `target_files: List[str]` | `test_result: bool`, `logs: str`               | **다차원 상태 검증**: `Playwright`와 `K6`를 병렬 구동하여 기능과 성능을 동시 검증. 실패 시점의 시스템 상태를 `PostgresSaver`로 스냅샷 박제하여 재현 가능성 확보.            |
| **Reasoning**      | **Noise Filter**     | `logs: str`               | `filtered_logs: str`                           | **데이터 정제(De-noising)**: 방대한 실행 로그에서 타임스탬프, 중복 워닝 등 노이즈를 정규식으로 제거. LLM이 오직 '순수 에러 원천'에만 집중할 수 있도록 정보 밀도를 극대화함. |
| **Reasoning**      | **LLM Analyzer**     | `filtered_logs: str`      | `insight: JSON`, `fix_prompt: str`             | **인과적 통찰 도출**: 실패 로그를 바탕으로 **5WHY 추론**을 수행. 단순 문법 오류인지, `[[Logex]]` 설계 결함인지 인과 관계를 분석하여 구조화된 JSON 리포트로 출력.            |
| **Refinement**     | **Prompt Optimizer ⚙️** | `fix_prompt: str`      | `refined_prompt: str`, `cache_hit: bool`       | **프롬프트 정제 엔진**: `LLMLingua`로 언어적 노이즈를 50~80% 압축 → XML 규격화(`<instruction>`/`<target_file>`/`<error_log>`) → 불변 규칙(Top)·가변 데이터(Bottom) 강제 재정렬로 `vLLM`/`Ollama` 프롬프트 캐시 적중률을 95% 이상으로 끌어올림. |
| **Implementation** | **Code Fixer LLM**   | `insight: JSON`           | `proposed_patch: str (diff)`                   | **제약 조건부 코딩**: 분석된 인과 관계를 바탕으로 Claude 3.5가 코드를 수정. 이때 파일 쓰기/수정 외의 도구 사용을 엄격히 제한하여 부수 효과(Side Effect)를 차단함.           |
| **Governance**     | **Patch Validator**  | `proposed_patch: str`     | `is_valid: bool`, `errors: List[str]`          | **화이트박스 가드레일**: `ast.parse()`를 통해 금지된 라이브러리 호출이나 보안 취약점을 물리적으로 적발. 통과하지 못할 경우 `Node C-2`로 즉시 회귀시키는 인터셉터 역할.      |
| **Governance**     | **Code Reviewer**    | `proposed_patch: str`     | `score: int (0-100)`, `status: str`            | **품질 휴리스틱 평가**: 코드 가독성, 중복성, 알고리즘 효율성을 점수화. 일정 점수 미달 시 자율 개선 루프를 강제하며, 3회 이상 실패 시 `Node HITL`로 제어권을 넘김.           |
| **Control**        | **⏸ Interrupt Gate** | `score: int`              | `signal: Literal["APPROVE", "REJECT"]`         | **정서적 HITL 개입**: 랭그래프 엔진을 동결(`Frozen`)하고 `[[NIXIE]]`를 통해 시각적 경고 송출. 인간 아키텍터가 `[[Logex]]` UI에서 최종 승인 또는 수정 방향을 결정함.         |
| **Governance**     | **Rule Validator**   | `signal: str`             | `is_passed: bool`                              | **규범적 수문장**: 수정한 코드가 `[[NEXA-3대-규범]]`에 위배되지 않는지 최종 확인. 논리적 충돌 발생 시 전체 파이프라인을 롤백하고 인과적 오류를 기록함.                      |
| **Heritage**       | **PR Merger**        | `is_passed: bool`         | `pipeline_status: Literal["SUCCESS"]`          | **지능 유산화 및 마감**: 최종 코드를 메인 브랜치에 머지. 이번 루프에서 얻은 `[[인과적 통찰]]`을 `[[Neo4j]]` 그래프 DB에 영구 저장하여 향후 유사 사례 발생 시 참조함.        |
