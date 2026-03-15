# NEXA 오케스트라 프로젝트 데이터베이스 설계 명세서 v4.0

**목적**: NEXA 플랫폼 메인 라우터(/nexa-node, /nexa-panel, /infra, /dev, /help 등)의 도메인별 요구사항을 수용하는 **프로젝트 중심 통합 DB 스키마**를 정의한다. 프로젝트 귀속 31개·비귀속 18개 테이블로 구성하며, 구현 시 작업 지시서로 사용한다.

**적용 범위**: Postgres(TimescaleDB)·RLS·JSONB·pgvector 기반 DB 설계. 기술 스택(UUID v7, JSONB, pgvector, TimescaleDB, Yjs) 및 [NEXA-STACK-01] 라우터별 정체성 반영.

**참조**: [NEXA-STACK-01] 기술 스택·메인 라우터, [NEXA-AUTH-01] 계정·인증, [NEXA-AI-09] 프로젝트·파일

**작성일**: 2025-03

---

## 1. 프로젝트 통합 데이터 스키마 리스트 (31개 테이블)

| No. | 테이블명                  | 라우터/도메인 매핑   | 주요 역할 및 특징                                                                                            | 핵심 기술        |
| :-: | ------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------ | ---------------- |
|  1  | projects                  | 플랫폼 프로젝트 전역 | 최상위 프로젝트 식별 정보·도메인 분류. storage_id→storage_configs, storage_quota_bytes로 Quota 지정. current_storage_usage(BIGINT)로 사용량을 증분(Delta)만 갱신·MV로 주기 보정 | UUID v7, RLS     |
|  2  | project_members           | /my (AUTH)           | 사용자별 접근 권한 및 공유 상태 관리                                                                         | RLS              |
|  3  | project_settings          | /settings            | 프로젝트별 전역 및 도메인별 설정 허브                                                                        | JSONB            |
|  4  | project_assets            | 프로젝트 전역자원    | 일반 문서, 코드, YAML 설정 파일 관리                                                                         | JSONB            |
|  5  | project_media             | /nexa-media          | 이미지, 사운드, 영상 등 멀티모달 자원                                                                        | FFmpeg           |
|  6  | project_tags              | 프로젝트 전역검색    | 탐색 필터링을 위한 시맨틱 태그 정보                                                                          | pgvector         |
|  7  | project_logs              | 프로젝트 전역로그    | AI 제안 이력 및 시스템 감사 로그. 시간 기반 정렬 신뢰를 위해 is_time_synced·last_sync_at(NTP 검증) 메타데이터 포함 | TimescaleDB      |
|  8  | project_resource_versions | 프로젝트 전역자원    | 스크립트·주요 설정 파일의 버전 이력(Commit 형태). project_releases와 연동해 안정 배포 버전 지정              | JSONB            |
|  9  | project_folders           | 프로젝트 탐색기 (AI) | 계층적 트리 구조. yjs_state=압축 스냅샷만, 증분은 project_yjs_updates                                       | Yjs              |
| 10  | project_links             | 탐색기 (AI)          | 웹 서치 결과 및 외부 참조 URL 관리                                                                           | AI Crawler       |
| 11  | project_orchestra         | /nexa-ai             | 페르소나, 스킬(Tool Calling), 태스크 정의                                                                    | JSONB            |
| 12  | project_chats             | /nexa-ai             | AI 에이전트 대화 히스토리 및 맥락 유지                                                                       | Vercel AI SDK    |
| 13  | project_agent_sessions    | /nexa-ai             | AI 현재 상태(Thinking, Tool Calling, Action 등)·단기 작업 임시 데이터. 끊김 없는 협업 세션 복원              | JSONB            |
| 14  | project_knowledge         | /nexa-archive        | RAG용 지식 본문 및 벡터 데이터 저장                                                                          | pgvector         |
| 15  | project_nodes             | /nexa-node           | 노드 기반 IoT 로직. yjs_state=압축 스냅샷만, 증분은 project_yjs_updates                                      | Vue Flow, Yjs    |
| 16  | project_scripts           | /nexa-node           | 프로젝트별 가변 비즈니스 로직 및 실행 스크립트. 기기 전체를 굽지 않고 동적 주입                              | JSONB / Bytecode |
| 17  | project_simulations       | /nexa-node           | 노드 구성에 따른 가상 시뮬레이션 결과값                                                                      | JSONB            |
| 18  | project_panels            | /nexa-panel          | 활성화된 위젯(Panel) 목록 및 개별 설정                                                                       | JSONB            |
| 19  | project_boards            | /nexa-board          | 대시보드 레이아웃 프리셋 정보                                                                                | JSONB            |
| 20  | project_devices           | /infra               | 프로젝트에 할당된 장치 및 상태 관리. 배포된 펌웨어 버전 조합(core_fw_id, model_hw_id, script_id)으로 3단계(Core→Model→Script) 현재 상태 추적·AI 배포 오류 진단 | MQTT, FK         |
| 21  | project_network_topology  | /network             | 디바이스 간 논리적/물리적 연결 맵 데이터                                                                     | JSONB            |
| 22  | project_traces            | /nexa-trace          | 사용자 동작 녹화 및 자동화 로직 시퀀스                                                                       | JSONB            |
| 23  | project_solutions         | /solutions           | 문제 정의 및 솔루션 기획(비전 공유) 데이터                                                                   | JSONB            |
| 24  | project_tasks             | /erp                 | 업무 일정, 마일스톤 및 진행 상태 관리(ERP 용도)                                                              | ERP Hub          |
| 25  | project_parts_bom         | /erp/parts           | BOM(부품 명세). part_model_id(타입)·spec_id(실물 인스턴스/part_specs) 선택 참조로 설계-재고-출고 연동. AI 검증 상태 관리 | JSONB, FK        |
| 26  | project_extensions        | /extension           | 설치된 플러그인 및 외부 API 연동 정보(자격 증명은 project_secrets 참조)                                      | JSONB            |
| 27  | project_secrets           | /extension           | 프로젝트별 외부 서비스 자격 증명. RLS·BYTEA(암호문만 저장)·앱 AES-256-GCM·DB pgcrypto 이중 암호화로 관리자 직접 조회 시 평문 노출 방지 | RLS, BYTEA, pgcrypto |
| 28  | project_releases          | /portfolio           | 최종 생산물 버전 및 전시용 메타데이터                                                                        | JSONB            |
| 29  | project_jobs              | 전역·백그라운드      | 장기 실행 작업(FFmpeg 인코딩, RAG 임베딩, 펌웨어 빌드 등) 상태·진행률. status/progress/error_msg. 재접속 시 UI 진행 표시 기준 | JSONB            |
| 30  | project_user_presence     | 실시간 협업          | 폴더/노드별 현재 접속 사용자(Presence). resource_type/resource_id·activity(viewing·editing). UNLOGGED. "A님이 이 노드를 수정 중" 등 UI 협업 가시성 | UNLOGGED         |
| 31  | project_yjs_updates      | 실시간 동기화        | Yjs 증분 업데이트 로그. resource_type/resource_id·update_data(BYTEA). 단일 필드 덮어쓰기 대신 이력 적재. 서버 병합·스냅샷 전략용 | BYTEA            |

**Secret 관리 구분**: 플랫폼 전역 설정·관리자용 키는 `.env` 등 서버 환경 변수로 관리한다. 사용자가 프로젝트에서 개별 연동한 외부 서비스(예: 개인 OpenAI 키, 외부 날씨 API)의 자격 증명은 `project_secrets`에만 저장하며, Postgres RLS로 프로젝트 멤버만 접근한다. **저장 필드는 BYTEA 또는 암호화된 텍스트만 허용**하여, 관리자가 DB를 직접 조회해도 평문이 노출되지 않도록 한다. 암호화는 **애플리케이션 레벨(AES-256-GCM, 키는 서버 환경 변수)**과 **DB 레벨(pgcrypto 확장으로 컬럼 추가 보호, 선택)**을 병행한다.

### 1.1 프로젝트 비귀속 플랫폼 테이블 (18개)

프로젝트에 귀속되지 않는 플랫폼 전역 라이브러리·원형 정의·감사·지원·저장소·**글로벌 태그/검색** 정의용 테이블이다.

| No. | 테이블명             | 단계 (구분)      | 역할 및 특징                                                                                          | 데이터 형식   | 관련 도메인             |
| :-: | -------------------- | ---------------- | ----------------------------------------------------------------------------------------------------- | ------------- | ----------------------- |
|  1  | panel_components     | —                | 위젯(Panel)의 원형 코드 및 UI 정의 데이터. 마켓플레이스 상품 리스트 역할.                             | JSONB         | /nexa-panel             |
|  2  | node_definitions     | —                | 표준 노드(센서, 로직, 통신 등)의 규격 및 속성 정의. /nexa-node에서 사용.                              | JSONB         | /nexa-node              |
|  3  | document_templates   | —                | 작업 시방서, 제안서, 기술 문서 등 AI가 채워넣을 문서의 표준 레이아웃.                                 | JSONB         | /nexa-archive           |
|  4  | protocol_manifests   | —                | MQTT, ESPHome 등 기기 통신 시 사용하는 표준 프로토콜 명세 및 설정 프리셋.                             | JSONB         | /infra, /network        |
|  5  | automation_recipes   | —                | 검증된 자동화 로직의 모범 사례(Best Practice). /nexa-trace에서 활용.                                  | JSONB         | /nexa-trace             |
|  6  | orchestra_scores     | —                | 오케스트라 설정(페르소나·스킬) 공유 저장소. 프로젝트에 템플릿 적용 시 참조.                           | JSONB         | 라이브러리              |
|  7  | firmwares_core       | Core (시스템)    | 기기 식별(Device Token), 최소 구동 및 복구/OTA용 최하위 펌웨어                                        | Binary        | —                       |
|  8  | firmwares_model      | Model (하드웨어) | 하드웨어 모델별 핀 맵, 물리 설정 및 안전 가드레일(Interlock 등) 정의                                  | Binary / YAML | —                       |
|  9  | device_registry      | —                | 기기 최초 등록·라이프사이클 관리. UUID v7/시간 정렬 신뢰를 위해 is_time_synced·last_ntp_sync_at(NTP 검증) 포함 | JSONB         | /infra                  |
| 10  | platform_audit_logs  | —                | 인증 실패, API 호출 빈도, 서버 리소스 상태 등 플랫폼 전역 감사·인프라 관리                            | TimescaleDB   | /dev                    |
| 11  | api_usage_stats      | —                | API 호출 통계. /dev 및 인프라 관리용 TimescaleDB 하이퍼테이블                                         | TimescaleDB   | /dev                    |
| 12  | template_reviews     | —                | library_templates·panel_components 평점·리뷰. 마켓플레이스 신뢰도 관리                                | JSONB         | 라이브러리, /nexa-panel |
| 13  | usage_metrics        | —                | 템플릿 다운로드 수·인기도. 고품질 솔루션 선택 지원용 마켓플레이스 지표                                | JSONB         | 라이브러리, /nexa-panel |
| 14  | support_faq          | —                | 플랫폼 사용법 FAQ. /help 조회 및 AI 상담 연계                                                         | JSONB         | /help                   |
| 15  | ai_consultation_logs | —                | /help AI 챗 상담 이력. 플랫폼 가이드 자동 개선(Insights) 기초 자료                                    | TimescaleDB   | /help                   |
| 16  | storage_configs      | —                | 저장소 백엔드 정의·quota_bytes(기본 할당량). projects.storage_quota_bytes와 연동. 트리거·MV로 project_assets/project_media 추가 시 Quota 검증 및 사용량 집계 | JSONB         | 전역 인프라             |
| 17  | global_tags          | —                | 마켓플레이스 자산(orchestra_scores, panel_components 등)용 전역 시맨틱 태그. tag_vector로 유사 태그 검색                       | pgvector      | 라이브러리, 마켓플레이스 |
| 18  | global_knowledge_base| —                | 마켓 자산 검색용 요약·임베딩. content_type/content_id·embedding으로 pgvector 유사도 검색 → 최적 템플릿 발견. metadata에 tag_ids 등 | pgvector      | 라이브러리, 마켓플레이스 |

**시맨틱 태그 용어 및 예시(참고)**: 본 문서의 시맨틱 태그는 **HTML 표준 시맨틱 태그**(`<header>`, `<nav>`, `<article>` 등)가 아니다. 마켓 자산의 **의미·용도 분류**를 위한 라벨이며, pgvector 유사도 검색·추천에 사용된다. `global_tags.category`로 대분류를 두고, 아래와 같은 예시를 참고용으로 부여할 수 있다.

| 구분 | 예시 |
|------|------|
| 용도/도메인 | `스마트팩토리`, `실내환경모니터링`, `에너지절감` |
| 시나리오 | `대시보드`, `알람자동화`, `데이터로깅` |
| 대상 | `초보자용`, `고급제어`, `템플릿` |
| 기술/스택 | `MQTT`, `ESP32`, `센서퓨전` |

### 1.2 현재 생성된 테이블 현황

DB에 이미 생성되어 있는 테이블 목록이다. 설계안(§1, §1.1)과의 대응 관계를 명시하여 추후 마이그레이션·통합 시 참고한다.

| No. | 테이블명         | 설계 대응 (목표)                     | 비고                                                |
| :-: | ---------------- | ------------------------------------ | --------------------------------------------------- |
|  1  | users            | —                                    | [NEXA-AUTH-01] 계정·인증. project_members 상위 주체 |
|  2  | projects         | projects (귀속 No.1)                 | 최상위 프로젝트                                     |
|  3  | files            | 전역 파일 레지스트리                 | 아래 「파일 테이블 사용 방침」 참조                 |
|  4  | file_references  | 전역 파일 참조                       | 아래 「파일 테이블 사용 방침」 참조                 |
|  5  | part_specs       | node_definitions 등                  | 파트(노드/부품) 규격 정의                           |
|  6  | part_classes     | node_definitions 등                  | 파트 분류 체계                                      |
|  7  | part_models      | node_definitions 등                  | 파트(모델) 정의                                     |
|  8  | part_files       | node_definitions·project_assets      | 파트별 첨부 파일                                    |
|  9  | device_registry  | device_registry (비귀속 No.9)        | 기기 등록·라이프사이클                              |
| 10  | device_members   | project_members·device 단위          | 기기별 멤버/공유. project_devices와 연계            |
| 11  | ai_user_memos    | project_knowledge·project_chats 연계 | AI·사용자 메모. 채팅/지식 보조                      |
| 12  | system_templates | document_templates·orchestra_scores  | 시스템 공통 템플릿. 문서/오케스트라 레이아웃        |

**파일 테이블 사용 방침**: `files`와 `file_references`는 플랫폼 범용 테이블로 유지한다. 엣지 디바이스·AI·개인 프로필·프로젝트 등 출처와 무관하게 **모든 파일은 이 경로를 통해서만 등록**하며, `project_assets`·`project_media` 등 프로젝트 하위 테이블에는 **참조 데이터(file_id 등)만 저장**한다.

---

## 2. 설계 핵심 지향점

### 2.1 AI 협업 최적화 (RAG & Tool Calling)

`project_knowledge`(No.5)와 `project_orchestra`(No.4)는 AI가 프로젝트 배경 지식을 습득하고 가용 도구를 파악하는 핵심 기반이다. pgvector로 사용자 의도에 가장 가까운 지식을 추출하여 답변 품질을 높인다. `project_chats`(No.6)·`project_logs`(No.21)와 함께 벡터·대화 맥락·행동 이력을 삼각 편대로 구성하여, AI가 프로젝트의 과거·현재·미래를 종합적으로 파악하고 조언할 수 있는 장기 기억 구조를 확보한다. `project_agent_sessions`(No.13)는 AI 현재 상태(Thinking, Tool Calling, Action 등)와 단기 작업 임시 데이터를 보관하여 세션 끊김 없이 협업을 이어갈 수 있게 한다. 해당 데이터는 쓰기 빈도가 높고 수명이 짧은 휘발성 데이터이므로, DDL에서는 UNLOGGED 테이블로 선언하고 last_active 기준 24시간 TTL 삭제를 관리 로직(스케줄)으로 적용한다. **project_user_presence**(No.30)는 같은 프로젝트 내에서 **지금 누가 어떤 폴더·노드 화면을 보고 있는지** 사용자 존재(Presence) 정보를 UNLOGGED로 저장하며, resource_type/resource_id·activity(viewing·editing)로 "A님이 이 노드를 수정 중입니다" 같은 협업 가시성을 UI에 제공한다. last_active 기준 주기 삭제(예: 5~10분 미갱신)를 권장한다.

### 2.2 실시간 동기화 및 데이터 유연성 (Yjs, JSONB, pgvector)

`project_folders`(No.9)·`project_nodes`(No.15)는 Yjs 레이어로 다중 사용자 협업 시 충돌 없이 실시간 동기화된다. 단, Yjs 업데이트 바이너리를 단일 필드(`yjs_state`)에 덮어쓰기만 하면 동시 편집 시 DB 레벨에서 충돌 없음 병합이 깨질 수 있으므로, **이력 기반 증분 저장 및 스냅샷** 전략을 둔다.

**① 증분 업데이트 테이블**  
단일 필드 덮어쓰기 대신, 발생하는 모든 변경(Update)을 개별 행으로 쌓는다. **project_yjs_updates**(No.31): `id`, `project_id`, `resource_type`('folder'|'node'), `resource_id`, `update_data`(BYTEA), `created_at`.

**② 서버 측 병합 및 스냅샷**  
- **병합**: 서버(Node.js/Express)가 Y.Doc 인스턴스를 유지하며 클라이언트로부터 오는 업데이트를 실시간 병합.  
- **스냅샷**: `project_folders.yjs_state`, `project_nodes.yjs_state`는 전체 이력이 아닌 **압축된 스냅샷(Compacted Snapshot)**만 저장.  
- **주기 최적화**: 업데이트 로그가 일정 수 이상 쌓이면 서버가 병합하여 스냅샷 테이블을 갱신하고, 오래된 project_yjs_updates 행을 정리해 데이터 크기를 관리.

**③ Redis·Web Worker 부하 분산**  
- **Redis**: 초고빈도 업데이트를 Redis(큐/캐시)에 먼저 담아 처리 속도를 높이고, 배치(Batch) 단위로 DB에 영속화해 DB I/O 부하를 줄인다.  
- **Web Worker**: 클라이언트에서 대용량 Yjs 바이너리 파싱·병합 계산을 Web Worker로 분리해 메인 스레드 UI 응답성을 유지한다.

**④ 정합성 검증**  
명세에 반영된 **is_time_synced**, **last_sync_at**(project_logs 등) 메타데이터를 활용해, 업데이트 발생 선후 관계를 시스템·AI가 더 정확히 판단하도록 보정할 수 있다.

JSONB·pgvector 기반 테이블은 스키마 유연성과 확장성을 보장한다.

### 2.3 공유 및 재사용 전략

`orchestra_scores`(비귀속)로 페르소나·스킬 세트·대시보드 구성을 템플릿화하여 타인과 공유하거나 프로젝트에 재적용한다.

### 2.4 도메인 수직 계층화 및 물리 연결

`/nexa-node` 설계 결과는 `project_scripts`(No.16)로 비즈니스 로직을 주입하고, `firmwares_core`·`firmwares_model`(비귀속) 기반 기기가 `project_devices`(No.20)를 통해 `/infra`에 배포된다. `project_devices`에는 실제 디바이스에 배포된 **현재 상태**를 추적하는 버전 조합 FK(`core_fw_id`→firmwares_core, `model_hw_id`→firmwares_model, `script_id`→project_scripts)를 두어, 3단계(시스템 Core → 하드웨어 Model → 로직 Script) 배포 상태를 명확히 하고 AI가 배포 오류를 진단할 수 있게 한다. `project_resource_versions`(No.25)는 스크립트·주요 설정 파일의 변경 이력(Commit 형태)을 관리하며, `project_releases`(No.22)와 연동하여 특정 버전을 안정 배포용으로 지정한다. 해당 과정은 `project_traces`(No.19)에 기록되며, `project_network_topology`(No.13)로 인프라 위상을 시각화한다.

### 2.5 데이터 격리 및 보안

프로젝트 귀속 테이블은 `project_id`를 외래키로 가지며, Postgres RLS 정책으로 프로젝트 멤버가 아닌 사용자의 접근을 차단한다. `project_secrets`(No.27)는 RLS에 더해 **자격 증명을 암호문만 저장**한다. 저장 컬럼(`encrypted_value`)은 **BYTEA**로 두며 평문 TEXT 저장을 금지하고, **애플리케이션 레벨**에서는 AES-256-GCM 등으로 암호화한 뒤 DB에 전달하고, **DB 레벨**에서는 pgcrypto 확장(예: `pgp_sym_encrypt`/`pgp_sym_decrypt`)으로 특정 컬럼을 한 번 더 보호할 수 있다. 복호화는 서버 애플리케이션(및 필요 시 pgcrypto 키를 세션으로 주입한 뒤)만 수행하여, 관리자 DB 직접 조회 시에도 평문이 노출되지 않도록 한다.

### 2.6 플랫폼 전역 감사·마켓플레이스·지원

`project_logs`(No.7)는 프로젝트 단위 AI 제안 이력·감사 로그이다. PK에 UUID v7을 사용할 때 엣지 디바이스 RTC가 NTP 미동기화면 시간 기반 정렬이 꼬일 수 있으므로, **is_time_synced**·**last_sync_at** 컬럼으로 로그 발생 시점의 시간 동기화 여부를 기록하여 정렬 신뢰성을 확보한다. 플랫폼 전역 인증 실패·API 호출·서버 리소스는 `platform_audit_logs`·`api_usage_stats`(비귀속)로 TimescaleDB 하이퍼테이블 관리하며 `/dev`·인프라 관리에 활용한다. `device_registry`(비귀속)는 `/infra`에서 기기 최초 등록·라이프사이클의 시작점이며, **is_time_synced**·**last_ntp_sync_at**으로 등록·갱신 시점의 NTP 동기화 여부를 저장하여 UUID v7 및 시간 기반 정렬의 신뢰성을 보완한다. `storage_configs`(비귀속)는 플랫폼이 지원하는 저장소 백엔드를 정의하며, **quota_bytes**로 저장소별 기본 할당량을 둔다. `projects`는 **storage_quota_bytes**로 프로젝트별 용량 제한을 지정하고, `project_assets`·`project_media`에 파일이 추가될 때 **트리거**로 현재 사용량 합산 후 제한치 초과 여부를 검증한다. 사용량 집계는 **머티리얼라이즈드 뷰(project_storage_usage_mv)**를 주기적으로 REFRESH하여 대시/관리 API에서 활용한다. 플랫폼 규모 확장 시 특정 프로젝트 미디어만 외부 클라우드로 이전하거나 프로젝트별 Quota를 부여할 때의 기준 데이터가 된다. `template_reviews`·`usage_metrics`(비귀속)로 라이브러리·패널 템플릿의 평점·리뷰·다운로드 수를 관리하여 마켓플레이스 신뢰도와 인기도를 제공한다. **글로벌 라이브러리 태그·검색**을 위해 **global_tags**(비귀속 No.17)·**global_knowledge_base**(비귀속 No.18)를 둔다. 사용자가 오케스트라 설정·패널 컴포넌트 등을 마켓에 등록할 때 시맨틱 태그를 부여하고, `global_knowledge_base`에 검색용 요약·임베딩을 저장한다. 다른 사용자는 pgvector 기반 유사도 검색으로 최적의 템플릿을 찾을 수 있으며, `project_tags`(No.6)는 프로젝트 내부 시맨틱 탐색 전용으로 유지한다. `/help`는 `support_faq`로 FAQ를 제공하고, `ai_consultation_logs`에 AI 챗 상담 이력을 저장하여 플랫폼 가이드 자동 개선(Insights)의 기초로 사용한다.

### 2.7 구현 시 가이드 (설계 검증 요약)

제작 시 아래 세 가지를 기준으로 설계 일관성을 유지한다.

| 구분                     | 가이드 요약                                                                                                 | 구현 시 유의점                                                                                                          |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **3단계 펌웨어 구조**    | 시스템(`firmwares_core`) → 하드웨어(`firmwares_model`) → 로직(`project_scripts`) 순의 분리 전략을 유지한다. | `project_devices`에 `core_fw_id`, `model_hw_id`, `script_id` FK로 배포된 버전 조합을 저장하여 현재 탑재 상태를 추적하고, AI 배포 오류 진단에 활용한다. 로직은 JSONB/Bytecode로 관리하고 기기 전체를 굽지 않고 동적 주입한다.           |
| **AI 협업 삼각 편대**    | `project_knowledge`·`project_orchestra`·`project_chats`가 상호작용하여 AI 장기 기억 구조를 이룬다.          | AI 워크스페이스의 핵심 가치인 **과거·현재·미래의 종합 파악**이 가능하도록 세 테이블 간 연동과 RAG/맥락 흐름을 보장한다. |
| **실시간 동기화 레이어** | `project_folders`·`project_nodes`에 Yjs 적용. 단일 필드 덮어쓰기는 동시성 시 정합성 깨짐.                          | **이력 기반 증분·스냅샷**: **project_yjs_updates**(No.31)에 증분 적재. yjs_state는 압축 스냅샷만. 서버(Node.js)에서 Y.Doc 병합·주기 스냅샷 갱신. Redis 배치 영속화·Web Worker 파싱. is_time_synced/last_sync_at으로 선후 보정. |
| **자격 증명 암호화**    | `project_secrets`의 실제 값은 BYTEA(암호문만 저장)·RLS와 병행.                                              | **앱 레벨**: AES-256-GCM, 키는 서버 환경 변수. **DB 레벨**: pgcrypto로 컬럼 추가 보호(선택). 관리자 DB 직접 조회 시 평문 노출 방지. |
| **시간 동기화(NTP) 검증** | UUID v7은 시간 기반 정렬을 전제로 하며, 엣지 RTC 미동기화 시 순서가 꼬일 수 있음.                           | `device_registry`에 **is_time_synced**, **last_ntp_sync_at**. `project_logs`에 **is_time_synced**, **last_sync_at**. 등록·로그 시점의 NTP 동기화 여부를 저장해 시간 기반 정렬 신뢰성 확보. |
| **저장소 할당량(Quota)**  | `storage_configs.quota_bytes`, `projects.storage_quota_bytes`로 용량 제한. `projects.current_storage_usage`로 사용량을 증분만 유지해 쓰기 성능 확보. | **BEFORE INSERT**: `current_storage_usage` + 새 파일 크기만으로 할당량 검사(전체 SUM 없음). **AFTER INSERT/DELETE**: 증분(Delta)만 `current_storage_usage`에 반영. **MV**: `project_storage_usage_mv` 주기 REFRESH 후, MV 기준으로 `current_storage_usage` 정기 보정. `files.size_bytes` 필요. |
| **장기 실행 작업(Job)**   | `project_agent_sessions`는 실시간 에이전트 상태, `project_logs`는 이력. 수 분 이상 걸리는 백그라운드 작업은 별도 관리. | **project_jobs**(No.29): FFmpeg 인코딩·RAG 임베딩·펌웨어 빌드 등. **status**(Pending/Running/Completed/Failed/Cancelled), **progress**(0–100%), **error_msg**. 사용자가 브라우저를 닫았다가 재접속해도 UI에서 진행 상황 표시 가능. `project_tasks`(No.24)는 ERP 업무용으로 유지. |
| **글로벌 라이브러리 태그·검색** | `project_tags`(No.6)는 프로젝트 내부 시맨틱 탐색. 마켓플레이스 자산은 전역 태그·검색 체계 필요. | **global_tags**(비귀속 No.17): 마켓 자산용 시맨틱 태그·tag_vector. **global_knowledge_base**(비귀속 No.18): content_type/content_id·content_text·embedding. 마켓 등록 시 태그 부여·요약 임베딩 저장 → pgvector 유사도 검색으로 최적 템플릿 발견. |
| **사용자 존재(Presence)**       | 실시간 협업 시 "지금 누가 이 폴더/노드를 보고 있는가" DB 저장이 없음.                               | **project_user_presence**(No.30): UNLOGGED. project_id·user_id·resource_type('folder'|'node')·resource_id·activity('viewing'|'editing')·last_active. 하트비트 갱신 후 주기 삭제로 UI 협업 가시성 제공. |
| **BOM·실물 재고 연동**          | 설계(BOM)에 필요한 부품과 재고(물리 위치)의 연결 고리 부재 시 동일 부품 판별 불가.                 | **project_parts_bom.spec_id**: part_specs(실물 인스턴스/물리 위치) 선택 참조. part_model_id(타입)만 있으면 '무엇이 필요한가', spec_id가 있으면 '어느 실물을 쓸 것인가' 연결. 설계-재고-출고 자동화 기준. |
| **RAG·시맨틱 검색 벡터 인덱스** | 대규모 지식/태그 검색 시 풀 스캔 방지 및 RAG 응답 속도 확보.                                      | **거리**: 시맨틱/RAG 특성상 **코사인 유사도**(`vector_cosine_ops`) 사용. **HNSW 디폴트**: project_knowledge.embedding, project_tags.tag_vector, global_knowledge_base.embedding, global_tags.tag_vector, support_faq.faq_vector. **IVFFlat**: 사용자·오케스트레이션 선택 시 대안(대량 삽입 후 검색 위주·메모리 제약). DDL-01 §「pgvector 인덱스 및 성능 최적화 가이드」에 스크립트·ef_search 안내. |

---

## 3. 데이터 연동 시나리오 (활용 예시)

스키마 구현 시 AI(orchestra)의 데이터 흐름은 아래와 같이 정의한다.

| 단계 | 테이블·도메인                                                 | 내용                                           |
| ---- | ------------------------------------------------------------- | ---------------------------------------------- |
| 분석 | `project_knowledge`                                           | 시방서 등 지식 검색 및 RAG 활용                |
| 제안 | `project_nodes`, `project_simulations`                        | 회로도 수정 및 가상 테스트 수행                |
| 실행 | `project_scripts`, `project_devices`                          | 사용자 승인 후 스크립트 주입·배포              |
| 전시 | `project_resource_versions`, `project_releases`, `/portfolio` | 버전 이력 중 안정 버전 지정 후 포트폴리오 공개 |

---

## 4. 설계 요약

플랫폼의 모든 라우터 경로는 **Project**를 최상위 작업 단위로 하여 데이터를 생성·관리한다. 본 설계는 메인 라우터의 기능을 프로젝트 단위로 통합하며, AI와 사용자가 물리적 인프라와 지식을 함께 제어하는 지능형 워크스페이스의 기반을 정의한다.
