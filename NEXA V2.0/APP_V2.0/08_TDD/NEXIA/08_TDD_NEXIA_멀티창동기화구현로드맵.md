---
doc_id: TDD-015
title: "멀티창 동기화 구현 로드맵"
category: "08_TDD"
domain: NEXIA
status: archived
created: 2026-06-10
updated: 2026-06-13
parent_doc: MVP-001
terms_standard: ["yjs", "broadcast-channel", "shared-worker"]
terms_nexa: ["Multi-Window", "Sync-Bus", "detach", "NexiaSplitLayout"]
tags: ["doc/cat/08-tdd", "doc/domain/nexia", "std/yjs", "std/broadcast-channel", "std/shared-worker", "nexa/Multi-Window", "nexa/Sync-Bus", "nexa/detach", "nexa/NexiaSplitLayout"]
---
## NEXIA 멀티창 동기화 구현 로드맵

> **⛔ archived (2026-06-13):** `NexiaSplitLayout` · shadcn 초안 로드맵 · **SSOT ✗**
> **대체:** [TDD-014 Document PiP](./08_TDD_NEXIA_멀티윈도우DocumentPiP.md) · [TDD-038 Yjs SSOT](../AI/08_TDD_AI_YjsHocuspocus협업SSOT.md)

> **협업 SSOT:** [08_TDD_AI_YjsHocuspocus협업SSOT](../AI/08_TDD_AI_YjsHocuspocus협업SSOT.md)  
> 본 로드맵 **Phase 1** = 동일 사용자 **멀티 탭·창**(SharedWorker). **멀티 유저·서버 영속** = **`apps/sync` Hocuspocus** ([TDD-038 Yjs SSOT](../AI/08_TDD_AI_YjsHocuspocus협업SSOT.md) §10.0과 동시 진행).  
> **스택:** 현행 `apps/web` (Next.js). 본문 shadcn/ui/Vite 표기는 **레거시** 참고용.

### Phase 0 — 기반 설계 확정 (시작 전 체크)

□ shadcn/ui 프로젝트 구조 확인
□ system/workers/ 디렉토리 존재 여부
□ Vite 기준 SharedWorker 빌드 설정 가능 여부
□ 현재 Zustand store 구조 파악

□ 브라우저 호환성 확인
□ Document PIP API → Chrome 116+ 전용
□ SharedWorker → 모든 모던 브라우저 OK
□ Yjs → 전혀 문제 없음

□ 패키지 설치 목록 확정
□ yjs
□ y-protocols
□ lib0
□ @tiptap/extension-collaboration ← Ethos
□ @tiptap/extension-collaboration-cursor
□ y-monaco ← Glos
□ y-prosemirror (Tiptap 내부용)

---

### Phase 1 — Yjs + SharedWorker Provider 구축

#### 주요 디렉토리 구조

```
system/
├── hooks/
│   ├── useSyncBus.js       ← 통신 추상화
│   ├── useYjsProvider.js   ← Yjs 연결
│   └── usePIP.js           ← PIP 관리
├── workers/
│   └── nexia-sync.worker.js ← SharedWorker
├── services/
│   └── yjs.service.js      ← ydoc 스키마 관리
└── types/
    └── sync.types.ts       ← 동기화 관련 타입
```

□ SharedWorker 구현
□ src/workers/nexia-sync.worker.js 생성
□ 포트 연결/해제 관리
□ 메시지 브로드캐스트 로직
□ Yjs 업데이트 릴레이

□ Yjs Provider 구현
□ src/hooks/useYjsProvider.js 생성
□ SharedWorker ↔ Yjs Doc 연결
□ awareness (커서/사용자 상태) 설정
□ 연결 상태 모니터링

□ ydoc 스키마 확정
□ cockpit:messages (Y.Array)
□ cockpit:stream (Y.Text) ← Ollama 스트리밍
□ synapse:nodes (Y.Array)
□ synapse:edges (Y.Array)
□ glos:monaco (Y.Text) ← Monaco 직접 바인딩
□ ethos:tiptap (Y.XmlFragment)
□ aionos:state (Y.Map)
□ sense:devices (Y.Map)
□ physis:queue (Y.Array)

□ useSyncBus 추상화 레이어
□ src/hooks/useSyncBus.js 생성
□ send(type, payload) 인터페이스
□ on(type, handler) 인터페이스
□ off(type, handler) 인터페이스
□ 내부는 Yjs로 구현, 인터페이스는 고정

□ 검증
□ 메인 탭 2개 열어서 Yjs 동기화 확인
□ 브라우저 DevTools → SharedWorker 연결 확인

---

### Phase 2 — Cockpit PIP 구현

□ Document PIP API 기반 구성
□ src/hooks/usePIP.js 생성
□ requestWindow() 호출 및 에러 핸들링
□ PIP 창에 React 앱 마운트 로직
□ PIP 창 닫힘 감지 및 정리

□ PIP 전용 레이아웃
□ src/layouts/PIPLayout.tsx 생성
□ 최소 UI (타이틀바 + 닫기 버튼)
□ 반응형 (PIP 창 크기 변화 대응)
□ 다크모드 동기화

□ Cockpit 미니뷰 컴포넌트
□ src/components/pip/CockpitPIP.tsx 생성
□ Ollama 스트리밍 텍스트 표시
□ Global Flow 미니 뷰
□ 주요 이벤트 알림

□ Yjs ↔ PIP 동기화
□ PIP 창에서 useSyncBus 연결 확인
□ cockpit:stream 실시간 반영 확인
□ cockpit:messages 수신 확인

□ Ollama 스트리밍 연결
□ 스트리밍 토큰 → Y.Text 업데이트
□ throttle 16ms 적용 (60fps)
□ PIP 창에서 스트리밍 실시간 표시 확인

□ 검증
□ PIP 열기/닫기 반복 테스트
□ 멀티모니터 이동 후 동기화 유지 확인
□ PIP 창 크기 조절 시 레이아웃 확인
□ 메인 창 새로고침 시 PIP 처리 확인

---

### Phase 3 — Glos (Monaco) Yjs 바인딩

□ y-monaco 연결
□ Y.Text ↔ Monaco 에디터 바인딩
□ 커서 위치 awareness 설정
□ 언어별 Lint 체인 유지 확인

□ PIP 뷰 연동
□ Glos 코드 읽기 전용 PIP 뷰
□ 실시간 코드 변경 반영 확인

□ 검증
□ 메인에서 타이핑 → PIP 즉시 반영
□ 대용량 코드 붙여넣기 시 성능 확인

---

### Phase 4 — Ethos (Tiptap) Yjs 바인딩

□ Tiptap Collaboration 익스텐션 연결
□ Y.XmlFragment ↔ Tiptap 바인딩
□ CollaborationCursor 설정
□ 정책 문서 동시편집 확인

□ 검증
□ 두 창에서 동시 편집 충돌 없음 확인
□ 실행 취소/다시 실행 동작 확인

---

### Phase 5 — Synapse (React Flow) Yjs 바인딩

□ 노드/엣지 Yjs 연동
□ Y.Array ↔ React Flow nodes/edges 바인딩
□ 노드 추가/삭제/이동 동기화
□ 엣지 연결/해제 동기화

□ awareness 활용
□ 선택된 노드 실시간 표시
□ 다른 창에서의 변경 하이라이트

□ 검증
□ 두 창에서 동시 노드 편집 확인
□ 대형 그래프(100+ 노드) 성능 확인

---

### Phase 6 — Aionos / Sense Yjs 연동

□ Aionos
□ RxJS 스트림 → Y.Map 상태 반영
□ MQTT 메시지 → Yjs 경유 전파
□ FFT/주파수 데이터 throttle 설계

□ Sense
□ ESPHome 장치 상태 → Y.Map
□ 네트워크 토폴로지 변경 동기화
□ 장치 온/오프라인 이벤트 처리

□ 검증
□ 고빈도 데이터(MQTT) 성능 확인
□ 장치 상태 변경 → 전 창 반영 확인

---

### Phase 7 — 팝아웃 구현

□ 라우터 설정
□ /popout/:tabId 라우트 추가
□ PopoutLayout.tsx (미니멀 레이아웃)
□ 각 탭별 팝아웃 뷰 컴포넌트

□ 팝아웃 실행
□ window.open() 옵션 최적화
□ 탭별 창 크기 기본값 설정
□ 이미 열린 창 재사용 (중복 방지)

□ Yjs 자동 연결
□ 팝아웃 창 → SharedWorker 자동 연결
□ 초기 state 즉시 수신 확인
□ 팝아웃 닫힘 → 정리 처리

□ 각 탭별 팝아웃 뷰
□ Cockpit 팝아웃
□ Glos 팝아웃 (Monaco 에디터)
□ Synapse 팝아웃 (그래프 뷰)
□ Ethos 팝아웃 (문서 뷰)
□ Aionos 팝아웃 (스트림 뷰)
□ Sense 팝아웃 (장치 뷰)
□ Physis 팝아웃 (미디어 뷰)

□ 최종 검증
□ 메인 + PIP + 팝아웃 3개 동시 동기화
□ 멀티모니터 환경 전체 테스트
□ 창 여러 개 동시 열기 성능 확인
□ 네트워크 끊김 후 재연결 처리

---

### 공통 체크사항 (전 Phase)

□ 에러 핸들링
□ SharedWorker 미지원 브라우저 폴백
□ PIP API 미지원 시 팝아웃으로 대체
□ Yjs 동기화 실패 시 재연결 로직

□ 성능
□ 고빈도 업데이트 throttle/debounce
□ 대형 문서/그래프 메모리 관리
□ 불필요한 Yjs 업데이트 방지

□ 개발 편의
□ Yjs DevTools 연동
□ 창 간 동기화 상태 디버그 패널
□ 각 Phase 완료 후 스냅샷 태깅
---

## 관련 문서

| 관계 | 문서 |
| :--- | :--- |
| 상위 MVP | [NEXIA 레이아웃 · 팝아웃 MVP (MVP-001)](../../03_MVP/03_MVP_NEXIA_레이아웃팝아웃MVP.md) |
| 멀티윈도우 TDD | [멀티윈도우 · Document PiP (TDD-014)](./08_TDD_NEXIA_멀티윈도우DocumentPiP.md) |
| 레이아웃 규격 | [NEXA 통합 레이아웃 구조 규격 (UIX-006)](../../07_UIUX/07_UIUX_NEXA_통합레이아웃구조규격.md) |
