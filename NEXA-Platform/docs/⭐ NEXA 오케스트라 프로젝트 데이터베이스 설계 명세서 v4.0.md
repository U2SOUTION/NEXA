# NEXA 오케스트라 프로젝트 데이터베이스 설계 명세서 v4.0

**목적**: NEXA 플랫폼 메인 라우터(/nexa-node, /nexa-panel, /infra, /dev, /help 등)의 도메인별 요구사항을 수용하는 **프로젝트 중심 통합 DB 스키마**를 정의한다. 프로젝트 귀속 24개·비귀속 15개 테이블로 구성하며, 구현 시 작업 지시서로 사용한다.

**적용 범위**: Postgres(TimescaleDB)·RLS·JSONB·pgvector 기반 DB 설계. 기술 스택(UUID v7, JSONB, pgvector, TimescaleDB, Yjs) 및 [NEXA-STACK-01] 라우터별 정체성 반영.

**참조**: [NEXA-STACK-01] 기술 스택·메인 라우터, [NEXA-AUTH-01] 계정·인증, [NEXA-AI-09] 프로젝트·파일

**작성일**: 2025-03

---

## 1. 프로젝트 통합 데이터 스키마 리스트 (24개 테이블)

| No. | 테이블명                 | 라우터/도메인 매핑 | 주요 역할 및 특징                                                               | 핵심 기술        |
| :-: | ------------------------ | ------------------ | ------------------------------------------------------------------------------- | ---------------- |
|  1  | projects                 | 플랫폼 전역        | 최상위 프로젝트 식별 정보 및 도메인 분류                                        | UUID v7, RLS     |
|  2  | project_members          | /my (AUTH)         | 사용자별 접근 권한 및 공유 상태 관리                                            | RLS              |
|  3  | project_folders          | 탐색기 (AI)        | 계층적 트리 구조 및 가상 디렉토리 관리                                          | Yjs              |
|  4  | project_orchestra        | /nexa-ai           | 페르소나, 스킬(Tool Calling), 태스크 정의                                       | JSONB            |
|  5  | project_knowledge        | /nexa-archive      | RAG용 지식 본문 및 벡터 데이터 저장                                             | pgvector         |
|  6  | project_chats            | /nexa-ai           | AI 에이전트 대화 히스토리 및 맥락 유지                                          | Vercel AI SDK    |
|  7  | project_nodes            | /nexa-node         | 노드 기반 IoT 로직 시각화 데이터                                                | Vue Flow         |
|  8  | project_scripts          | /nexa-node         | 프로젝트별 가변 비즈니스 로직 및 실행 스크립트. 기기 전체를 굽지 않고 동적 주입 | JSONB / Bytecode |
|  9  | project_simulations      | /nexa-node         | 노드 구성에 따른 가상 시뮬레이션 결과값                                         | JSONB            |
| 10  | project_boards           | /nexa-board        | 대시보드 레이아웃 프리셋 정보                                                   | JSONB            |
| 11  | project_panels           | /nexa-panel        | 활성화된 위젯(Panel) 목록 및 개별 설정                                          | JSONB            |
| 12  | project_devices          | /infra             | 프로젝트에 할당된 장치 및 상태 관리                                             | MQTT             |
| 13  | project_network_topology | /network           | 디바이스 간 논리적/물리적 연결 맵 데이터                                        | JSONB            |
| 14  | project_solutions        | /solutions         | 문제 정의 및 솔루션 기획(비전 공유) 데이터                                      | JSONB            |
| 15  | project_extensions       | /extension         | 설치된 플러그인 및 외부 API 연동 정보                                           | JSONB            |
| 16  | project_assets           | 전역 자원          | 일반 문서, 코드, YAML 설정 파일 관리                                            | JSONB            |
| 17  | project_media            | /nexa-media        | 이미지, 사운드, 영상 등 멀티모달 자원                                           | FFmpeg           |
| 18  | project_links            | 탐색기 (AI)        | 웹 서치 결과 및 외부 참조 URL 관리                                              | AI Crawler       |
| 19  | project_traces           | /nexa-trace        | 사용자 동작 녹화 및 자동화 로직 시퀀스                                          | JSONB            |
| 20  | project_tasks            | /erp               | 업무 일정, 마일스톤 및 진행 상태 관리                                           | ERP Hub          |
| 21  | project_logs             | 플랫폼 전역        | AI 제안 이력 및 시스템 감사 로그                                                | TimescaleDB      |
| 22  | project_releases         | /portfolio         | 최종 생산물 버전 및 전시용 메타데이터                                           | JSONB            |
| 23  | project_tags             | 전역 검색          | 탐색 필터링을 위한 시맨틱 태그 정보                                             | pgvector         |
| 24  | project_settings         | /settings          | 프로젝트별 전역 및 도메인별 설정 허브                                           | JSONB            |

### 1.1 프로젝트 비귀속 플랫폼 테이블 (15개)

프로젝트에 귀속되지 않는 플랫폼 전역 라이브러리·원형 정의·감사·지원용 테이블이다.

| No. | 테이블명             | 단계 (구분)      | 역할 및 특징                                                                 | 데이터 형식   | 관련 도메인       |
| :-: | -------------------- | ---------------- | ---------------------------------------------------------------------------- | ------------- | ----------------- |
|  1  | panel_components     | —                | 위젯(Panel)의 원형 코드 및 UI 정의 데이터. 마켓플레이스 상품 리스트 역할.     | JSONB         | /nexa-panel       |
|  2  | node_definitions     | —                | 표준 노드(센서, 로직, 통신 등)의 규격 및 속성 정의. /nexa-node에서 사용.      | JSONB         | /nexa-node        |
|  3  | document_templates   | —                | 작업 시방서, 제안서, 기술 문서 등 AI가 채워넣을 문서의 표준 레이아웃.         | JSONB         | /nexa-archive     |
|  4  | protocol_manifests   | —                | MQTT, ESPHome 등 기기 통신 시 사용하는 표준 프로토콜 명세 및 설정 프리셋.   | JSONB         | /infra, /network  |
|  5  | automation_recipes   | —                | 검증된 자동화 로직의 모범 사례(Best Practice). /nexa-trace에서 활용.        | JSONB         | /nexa-trace       |
|  6  | orchestra_scores     | —                | 오케스트라 설정(페르소나·스킬) 공유 저장소. 프로젝트에 템플릿 적용 시 참조.  | JSONB         | 라이브러리        |
|  7  | firmwares_core       | Core (시스템)    | 기기 식별(Device Token), 최소 구동 및 복구/OTA용 최하위 펌웨어               | Binary        | —                 |
|  8  | firmwares_model      | Model (하드웨어) | 하드웨어 모델별 핀 맵, 물리 설정 및 안전 가드레일(Interlock 등) 정의         | Binary / YAML | —                 |
|  9  | device_registry      | —                | 신규 사용자가 기기를 최초 등록하고 라이프사이클을 관리하는 시작점            | JSONB         | /infra            |
| 10  | platform_audit_logs  | —                | 인증 실패, API 호출 빈도, 서버 리소스 상태 등 플랫폼 전역 감사·인프라 관리   | TimescaleDB   | /dev              |
| 11  | api_usage_stats      | —                | API 호출 통계. /dev 및 인프라 관리용 TimescaleDB 하이퍼테이블               | TimescaleDB   | /dev              |
| 12  | template_reviews     | —                | library_templates·panel_components 평점·리뷰. 마켓플레이스 신뢰도 관리       | JSONB         | 라이브러리, /nexa-panel |
| 13  | usage_metrics        | —                | 템플릿 다운로드 수·인기도. 고품질 솔루션 선택 지원용 마켓플레이스 지표       | JSONB         | 라이브러리, /nexa-panel |
| 14  | support_faq          | —                | 플랫폼 사용법 FAQ. /help 조회 및 AI 상담 연계                               | JSONB         | /help             |
| 15  | ai_consultation_logs | —                | /help AI 챗 상담 이력. 플랫폼 가이드 자동 개선(Insights) 기초 자료            | TimescaleDB   | /help             |

---

## 2. 설계 핵심 지향점

### 2.1 AI 협업 최적화 (RAG & Tool Calling)

`project_knowledge`(No.5)와 `project_orchestra`(No.4)는 AI가 프로젝트 배경 지식을 습득하고 가용 도구를 파악하는 핵심 기반이다. pgvector로 사용자 의도에 가장 가까운 지식을 추출하여 답변 품질을 높인다. `project_chats`(No.6)·`project_logs`(No.21)와 함께 벡터·대화 맥락·행동 이력을 삼각 편대로 구성하여, AI가 프로젝트의 과거·현재·미래를 종합적으로 파악하고 조언할 수 있는 장기 기억 구조를 확보한다.

### 2.2 실시간 동기화 및 데이터 유연성 (Yjs, JSONB, pgvector)

`project_folders`(No.3)·`project_nodes`(No.7)는 Yjs 레이어로 다중 사용자 협업 시 충돌 없이 실시간 동기화된다. JSONB·pgvector 기반 테이블은 스키마 유연성과 확장성을 보장한다.

### 2.3 공유 및 재사용 전략

`orchestra_scores`(비귀속)로 페르소나·스킬 세트·대시보드 구성을 템플릿화하여 타인과 공유하거나 프로젝트에 재적용한다.

### 2.4 도메인 수직 계층화 및 물리 연결

`/nexa-node` 설계 결과는 `project_scripts`(No.8)로 비즈니스 로직을 주입하고, `firmwares_core`·`firmwares_model`(비귀속) 기반 기기가 `project_devices`(No.12)를 통해 `/infra`에 배포된다. 해당 과정은 `project_traces`(No.19)에 기록되며, `project_network_topology`(No.13)로 인프라 위상을 시각화한다.

### 2.5 데이터 격리 및 보안

프로젝트 귀속 테이블은 `project_id`를 외래키로 가지며, Postgres RLS 정책으로 프로젝트 멤버가 아닌 사용자의 접근을 차단한다.

### 2.6 플랫폼 전역 감사·마켓플레이스·지원

`project_logs`(No.21)는 프로젝트 단위 AI 제안 이력·감사 로그이다. 플랫폼 전역 인증 실패·API 호출·서버 리소스는 `platform_audit_logs`·`api_usage_stats`(비귀속)로 TimescaleDB 하이퍼테이블 관리하며 `/dev`·인프라 관리에 활용한다. `device_registry`(비귀속)는 `/infra`에서 기기 최초 등록·라이프사이클의 시작점이다. `template_reviews`·`usage_metrics`(비귀속)로 라이브러리·패널 템플릿의 평점·리뷰·다운로드 수를 관리하여 마켓플레이스 신뢰도와 인기도를 제공한다. `/help`는 `support_faq`로 FAQ를 제공하고, `ai_consultation_logs`에 AI 챗 상담 이력을 저장하여 플랫폼 가이드 자동 개선(Insights)의 기초로 사용한다.

---

## 3. 데이터 연동 시나리오 (활용 예시)

스키마 구현 시 AI(orchestra)의 데이터 흐름은 아래와 같이 정의한다.

| 단계 | 테이블·도메인                          | 내용                              |
| ---- | -------------------------------------- | --------------------------------- |
| 분석 | `project_knowledge`                    | 시방서 등 지식 검색 및 RAG 활용   |
| 제안 | `project_nodes`, `project_simulations` | 회로도 수정 및 가상 테스트 수행   |
| 실행 | `project_scripts`, `project_devices`   | 사용자 승인 후 스크립트 주입·배포 |
| 전시 | `project_releases`, `/portfolio`       | 성공 과정 요약 및 포트폴리오 공개 |

---

## 4. 설계 요약

플랫폼의 모든 라우터 경로는 **Project**를 최상위 작업 단위로 하여 데이터를 생성·관리한다. 본 설계는 메인 라우터의 기능을 프로젝트 단위로 통합하며, AI와 사용자가 물리적 인프라와 지식을 함께 제어하는 지능형 워크스페이스의 기반을 정의한다.
