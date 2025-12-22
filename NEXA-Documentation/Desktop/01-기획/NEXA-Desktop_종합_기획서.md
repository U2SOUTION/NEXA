# NEXA-Desktop 종합 기획서

**작성일**: 2024년  
**버전**: 1.0  
**상태**: 기획 단계

---

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [현재 상태](#현재-상태)
3. [시스템 목표](#시스템-목표)
4. [아키텍처 설계](#아키텍처-설계)
5. [NEXA 시스템 통합](#nexa-시스템-통합)
6. [기술 스택](#기술-스택)
7. [개발 로드맵](#개발-로드맵)
8. [파일 구조](#파일-구조)
9. [참고 자료](#참고-자료)

---

## 프로젝트 개요

### 목적

**NEXA-Desktop**은 NEXA 시스템의 데스크톱 클라이언트로, Python 기반의 확장 가능한 데스크톱 애플리케이션입니다.

### 역할

-   **NEXA Platform과의 통합**: 웹 플랫폼과 실시간 동기화
-   **로컬 작업 도구**: 드로잉, 캡처, 일정 관리 등 로컬 작업 지원
-   **ESP32 디바이스 제어**: IoT 디바이스 원격 제어 및 모니터링
-   **부품 관리 연동**: 부품 재고 관리 및 입출고 기록
-   **프로젝트 관리**: ERP 시스템과 연동하여 프로젝트 작업 지원

### 핵심 가치

1. **확장 가능성**: 독립 Workspace 패턴으로 기능 추가 용이
2. **통합성**: NEXA 시스템 전체와 원활한 연동
3. **모듈화**: 재사용 가능한 모듈 구조
4. **실시간 동기화**: WebSocket 기반 양방향 통신

---

## 현재 상태

### 기존 프로그램 (ScreenDraw)

**위치**: `ScreenDraw/`  
**상태**: 참고용 보관

#### 특징

-   급작스럽게 제작된 화면 드로잉 도구
-   AI 소통을 위한 초기 프로토타입
-   기본 기능: 드로잉, 캡처, 색상 선택, 선 두께 조절
-   플랫폼 연동 시도 (HTTP POST)

#### 한계점

-   단일 클래스 중심 구조
-   Workspace 패턴 미적용
-   MessageBus 시스템 없음
-   WebSocket 통신 없음
-   확장성 부족

#### 활용 방안

-   기존 코드는 참고용으로 보관
-   모듈화된 부분(ControlPanelManager, ConfigManager 등)은 아이디어 참고
-   새로운 구조로 재구현

---

## 시스템 목표

### 1. 독립 Workspace 시스템

각 기능을 독립적인 Workspace로 분리하여:

-   **독립 사용**: 각 Workspace를 단독으로 사용 가능
-   **혼합 사용**: 여러 Workspace를 동시에 사용 가능
-   **확장 용이**: 새로운 Workspace 추가가 쉬움

#### 예상 Workspace

1. **DrawingWorkspace**: 화면 드로잉 및 캡처
2. **PickerWorkspace**: 색상 선택 및 관리
3. **PlatformWorkspace**: 웹 플랫폼 UI 통합
4. **DeviceWorkspace**: ESP32 디바이스 제어 (향후)
5. **PartsWorkspace**: 부품 관리 (향후)
6. **ScheduleWorkspace**: 일정 관리 (향후)

### 2. MessageBus 기반 통신

Workspace 간 통신을 위한 이벤트 버스 시스템:

-   **이벤트 구독/발행**: Pub-Sub 패턴
-   **메시지 전파**: Workspace 간 자동 메시지 전달
-   **플랫폼 연동**: 플랫폼 메시지를 모든 Workspace에 전파

#### 주요 메시지 타입

-   `COLOR_SELECTED`: 색상 선택 이벤트
-   `DRAWING_CAPTURED`: 드로잉 캡처 완료
-   `PLATFORM_MESSAGE`: 플랫폼에서 온 메시지
-   `WORKSPACE_CHANGED`: Workspace 전환 알림
-   `DEVICE_STATUS`: 디바이스 상태 변경
-   `PARTS_UPDATED`: 부품 정보 업데이트

### 3. SharedDataManager

Workspace 간 공유 데이터 관리:

-   **색상 정보**: 현재 선택된 색상
-   **드로잉 데이터**: 드로잉 경로 및 캡처 이미지
-   **설정 정보**: 공통 설정
-   **플랫폼 상태**: 연결 상태 및 동기화 정보
-   **디바이스 정보**: ESP32 디바이스 목록 및 상태

### 4. 실시간 플랫폼 연동

WebSocket 기반 양방향 통신:

-   **실시간 동기화**: 드로잉, 색상, 설정 등 실시간 동기화
-   **명령 전송**: 플랫폼에서 디바이스 제어 명령 수신
-   **데이터 수신**: 플랫폼에서 업데이트된 데이터 수신
-   **상태 모니터링**: 디바이스 상태 실시간 모니터링

---

## 아키텍처 설계

### 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                    CoreManager                          │
│              (메인 애플리케이션 윈도우)                    │
└──────────────┬──────────────────────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐ ┌───▼───┐ ┌───▼──────────┐
│Control│ │Message│ │SharedData    │
│Panel  │ │Bus    │ │Manager       │
└───────┘ └───┬───┘ └───┬──────────┘
              │         │
    ┌─────────┼─────────┼─────────┐
    │         │         │         │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼──────┐
│Drawing│ │Picker│ │Platform│ │Device   │
│Worksp.│ │Worksp│ │Worksp. │ │Worksp.  │
└───┬───┘ └───┬───┘ └───┬───┘ └───┬──────┘
    │         │         │         │
    └─────────┼─────────┼─────────┘
              │         │
    ┌─────────▼─────────▼─────────┐
    │   PlatformCommunicator      │
    │   (WebSocket/HTTP 통신)      │
    └──────────────┬──────────────┘
                   │
    ┌──────────────▼──────────────┐
    │      NEXA-Platform          │
    │   (웹 플랫폼 서버)            │
    └─────────────────────────────┘
```

### 핵심 컴포넌트

#### 1. CoreManager

**역할**: 메인 애플리케이션 관리

-   애플리케이션 초기화
-   WorkspaceManager, MessageBus, SharedDataManager 초기화
-   전역 설정 관리
-   시스템 트레이 관리

#### 2. WorkspaceManager

**역할**: Workspace 전환 및 관리

-   Workspace 등록 및 관리
-   Workspace 전환 (show/hide)
-   현재 활성 Workspace 추적
-   Workspace 전환 이벤트 발행

#### 3. MessageBus

**역할**: 이벤트 버스 - Workspace 간 메시지 전파

-   메시지 구독/발행
-   메시지 타입별 라우팅
-   플랫폼 메시지 중계
-   이벤트 로깅 (디버깅용)

#### 4. SharedDataManager

**역할**: 공유 데이터 관리

-   Workspace 간 공유 데이터 저장
-   데이터 변경 이벤트 발행
-   플랫폼과 데이터 동기화
-   데이터 영속성 (설정 파일 저장)

#### 5. PlatformCommunicator

**역할**: 플랫폼 통신 레이어

-   WebSocket 연결 관리
-   HTTP API 호출
-   메시지 버스를 통한 메시지 전파
-   연결 상태 관리

#### 6. BaseWorkspace

**역할**: Workspace 기본 클래스

-   Workspace 공통 기능
-   MessageBus 구독/발행
-   SharedData 접근
-   생명주기 관리 (init, show, hide, destroy)

---

## NEXA 시스템 통합

### 통합 대상

1. **NEXA-Platform** (웹 플랫폼)

    - WebSocket 통신
    - REST API 호출
    - 실시간 데이터 동기화

2. **NEXA-Edge** (ESP32 디바이스)

    - 디바이스 제어 명령 전송
    - 센서 데이터 수신
    - 펌웨어 업데이트 관리

3. **NEXA-Mobile** (모바일 앱) - 향후
    - 공통 API 사용
    - 데이터 동기화

### 통신 프로토콜

#### WebSocket 메시지 형식

```json
{
    "type": "MESSAGE_TYPE",
    "timestamp": "2024-01-01T00:00:00Z",
    "data": {
        // 메시지별 데이터
    },
    "source": "desktop|platform|edge|mobile",
    "target": "all|desktop|platform|edge|mobile"
}
```

#### 주요 메시지 타입

-   `DRAWING_DATA`: 드로잉 데이터 전송/수신
-   `COLOR_SYNC`: 색상 정보 동기화
-   `DEVICE_COMMAND`: 디바이스 제어 명령
-   `DEVICE_STATUS`: 디바이스 상태 업데이트
-   `PARTS_UPDATE`: 부품 정보 업데이트
-   `PROJECT_UPDATE`: 프로젝트 정보 업데이트
-   `SYNC_REQUEST`: 동기화 요청
-   `SYNC_RESPONSE`: 동기화 응답

### API 엔드포인트 (HTTP)

-   `POST /api/desktop/drawing`: 드로잉 데이터 전송
-   `GET /api/desktop/devices`: 디바이스 목록 조회
-   `POST /api/desktop/devices/:id/command`: 디바이스 제어
-   `GET /api/desktop/parts`: 부품 목록 조회
-   `POST /api/desktop/parts/inout`: 입출고 기록
-   `GET /api/desktop/projects`: 프로젝트 목록 조회

---

## 기술 스택

### 프레임워크

-   **PySide6** (Qt for Python): GUI 프레임워크
-   **Python 3.10+**: 프로그래밍 언어

### 통신

-   **websockets**: WebSocket 클라이언트
-   **requests**: HTTP 클라이언트
-   **aiohttp**: 비동기 HTTP 클라이언트 (선택적)

### 데이터 관리

-   **JSON**: 설정 파일 및 데이터 저장
-   **SQLite**: 로컬 데이터베이스 (선택적)

### 유틸리티

-   **pynput**: 전역 단축키
-   **Pillow**: 이미지 처리
-   **pyautogui**: 화면 캡처 (선택적)

### 개발 도구

-   **pytest**: 테스트 프레임워크
-   **black**: 코드 포맷터
-   **mypy**: 타입 체커

---

## 개발 로드맵

### Phase 1: 기반 구조 구축 (1-2주)

#### 1.1 프로젝트 구조 설정

-   [ ] 프로젝트 루트 구조 생성
-   [ ] 모듈 디렉토리 구조 생성
-   [ ] 의존성 관리 (requirements.txt)
-   [ ] 개발 환경 설정

#### 1.2 핵심 컴포넌트 구현

-   [ ] MessageBus 구현
-   [ ] SharedDataManager 구현
-   [ ] WorkspaceManager 구현
-   [ ] BaseWorkspace 구현
-   [ ] CoreManager 구현

#### 1.3 기본 UI 구조

-   [ ] 메인 윈도우 구조
-   [ ] ControlPanel 구현
-   [ ] Workspace 전환 UI

### Phase 2: 기본 Workspace 구현 (2-3주)

#### 2.1 DrawingWorkspace

-   [ ] 드로잉 기능 구현
-   [ ] 캡처 기능 구현
-   [ ] MessageBus 통합
-   [ ] SharedData 통합

#### 2.2 PickerWorkspace

-   [ ] 색상 선택 UI
-   [ ] 색상 관리 기능
-   [ ] MessageBus 통합
-   [ ] SharedData 통합

#### 2.3 PlatformWorkspace

-   [ ] 웹뷰 통합 (QWebEngineView)
-   [ ] 플랫폼 UI 표시
-   [ ] JavaScript 브릿지 구현

### Phase 3: 플랫폼 통신 구현 (2주)

#### 3.1 PlatformCommunicator 확장

-   [ ] WebSocket 클라이언트 구현
-   [ ] HTTP API 클라이언트 구현
-   [ ] MessageBus 통합
-   [ ] 연결 상태 관리
-   [ ] 재연결 로직

#### 3.2 데이터 동기화

-   [ ] 드로잉 데이터 동기화
-   [ ] 색상 정보 동기화
-   [ ] 설정 동기화
-   [ ] 충돌 해결 로직

### Phase 4: 고급 기능 (3-4주)

#### 4.1 DeviceWorkspace

-   [ ] 디바이스 목록 조회
-   [ ] 디바이스 제어 UI
-   [ ] 실시간 상태 모니터링
-   [ ] 명령 전송 기능

#### 4.2 PartsWorkspace

-   [ ] 부품 목록 조회
-   [ ] 입출고 기록 UI
-   [ ] 재고 현황 표시
-   [ ] 검색 및 필터링

#### 4.3 ScheduleWorkspace

-   [ ] 일정 목록 조회
-   [ ] 일정 추가/수정 UI
-   [ ] 캘린더 뷰
-   [ ] 알림 기능

### Phase 5: 최적화 및 테스트 (2주)

#### 5.1 성능 최적화

-   [ ] 메모리 사용 최적화
-   [ ] 렌더링 성능 개선
-   [ ] 네트워크 통신 최적화

#### 5.2 테스트

-   [ ] 단위 테스트 작성
-   [ ] 통합 테스트 작성
-   [ ] E2E 테스트 작성

#### 5.3 문서화

-   [ ] API 문서 작성
-   [ ] 사용자 가이드 작성
-   [ ] 개발자 가이드 작성

---

## 파일 구조

### 프로젝트 루트 구조

```
NEXA-Desktop/
├── docs/                          # 문서 폴더
│   ├── README.md
│   ├── NEXA-Desktop_종합_기획서.md
│   ├── 아키텍처_설계.md
│   ├── API_명세서.md
│   └── 개발_가이드.md
│
├── src/                           # 소스 코드
│   ├── main.py                    # 진입점
│   ├── core/                      # 핵심 모듈
│   │   ├── __init__.py
│   │   ├── core_manager.py        # CoreManager
│   │   ├── workspace_manager.py   # WorkspaceManager
│   │   ├── message_bus.py         # MessageBus
│   │   ├── shared_data_manager.py # SharedDataManager
│   │   └── base_workspace.py      # BaseWorkspace
│   │
│   ├── workspaces/                 # Workspace 구현
│   │   ├── __init__.py
│   │   ├── drawing/               # DrawingWorkspace
│   │   │   ├── __init__.py
│   │   │   ├── drawing_workspace.py
│   │   │   └── components/
│   │   ├── picker/                 # PickerWorkspace
│   │   │   ├── __init__.py
│   │   │   ├── picker_workspace.py
│   │   │   └── components/
│   │   ├── platform/               # PlatformWorkspace
│   │   │   ├── __init__.py
│   │   │   ├── platform_workspace.py
│   │   │   └── components/
│   │   ├── device/                 # DeviceWorkspace (향후)
│   │   └── parts/                  # PartsWorkspace (향후)
│   │
│   ├── communication/              # 통신 모듈
│   │   ├── __init__.py
│   │   ├── platform_communicator.py
│   │   ├── websocket_client.py
│   │   └── http_client.py
│   │
│   ├── ui/                         # UI 컴포넌트
│   │   ├── __init__.py
│   │   ├── main_window.py
│   │   ├── control_panel.py
│   │   └── widgets/
│   │
│   ├── utils/                      # 유틸리티
│   │   ├── __init__.py
│   │   ├── config_manager.py
│   │   ├── logger.py
│   │   └── helpers.py
│   │
│   └── types/                      # 타입 정의
│       ├── __init__.py
│       ├── messages.py
│       └── workspace.py
│
├── tests/                          # 테스트
│   ├── __init__.py
│   ├── test_message_bus.py
│   ├── test_workspace_manager.py
│   └── test_platform_communicator.py
│
├── ScreenDraw/                     # 기존 프로그램 (참고용)
│   └── ...
│
├── requirements.txt                 # 의존성
├── requirements-dev.txt            # 개발 의존성
├── .gitignore
├── README.md
└── setup.py                         # 패키지 설정 (선택적)
```

---

## 참고 자료

### 내부 문서

-   [독립 Workspace 구조 설계](../ScreenDraw/독립_workspace_구조_+_메시지_시스템_설계_222d0755.plan.md)
-   [NEXA-Platform 아키텍처](../../NEXA-Platform/docs/CORE/NEXA-ARCHITECTURE.md)
-   [NEXA 주요 기능 요구사항](../../NEXA-Platform/docs/NEXA-주요_기능_요구사항.md)

### 외부 자료

-   [PySide6 공식 문서](https://doc.qt.io/qtforpython/)
-   [WebSocket 프로토콜](https://tools.ietf.org/html/rfc6455)
-   [Qt for Python 예제](https://doc.qt.io/qtforpython/examples/)

---

## 변경 이력

| 버전 | 날짜   | 변경 내용 | 작성자      |
| ---- | ------ | --------- | ----------- |
| 1.0  | 2024년 | 초안 작성 | NEXA 개발팀 |

---

**작성자**: NEXA 개발팀  
**검토자**: -  
**승인자**: -
