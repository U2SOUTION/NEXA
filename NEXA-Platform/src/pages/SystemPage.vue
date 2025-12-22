<template>
  <q-page class="system-page">
    <div class="q-pa-lg">
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 text-primary" style="margin-bottom: 2px">SYSTEM</h1>
        <p class="text-body1 text-grey-7">디바이스 등록 및 시스템 상태 모니터링</p>
      </div>

      <!-- 물리 구조 시스템 섹션 -->
      <div class="physical-systems-section q-mb-xl">
        <div class="section-header q-mb-lg">
          <h2 class="text-h5 text-primary q-mb-sm">
            <q-icon name="precision_manufacturing" size="28px" class="q-mr-sm" />
            NEXA 물리 구조 시스템 (Physical Structure Systems)
          </h2>
          <p class="text-body2 text-grey-7">디바이스, 게이트웨이, 하드웨어 인프라 등 물리적 구조를 기반으로 한 시스템 관리 및 모니터링</p>
        </div>

        <!-- 메인 탭 -->
        <q-tabs v-model="mainTab" class="q-mb-none" align="left" dense>
          <q-tab name="device" label="디바이스 등록" icon="devices_other" />
          <q-tab name="status" label="시스템 상태" icon="monitor_heart" />
          <q-tab name="agw" label="AGW System" icon="dns" />
          <q-tab name="monitoring" label="실시간 모니터링" icon="timeline" />
        </q-tabs>

        <q-tab-panels v-model="mainTab" animated>
          <!-- 디바이스 등록 탭 -->
          <q-tab-panel name="device">
            <div class="q-mb-lg">
              <div class="text-h6 q-mb-md">
                <q-icon name="devices_other" size="24px" class="q-mr-sm" />
                디바이스 등록 및 관리
              </div>
              <p class="text-body2 text-grey-7 q-mb-md">IoT 디바이스를 등록하고 관리합니다. 등록된 디바이스는 NEXA BOARD에서 사용할 수 있습니다.</p>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">주요 기능</div>
                <ul class="text-body2 text-grey-6">
                  <li>디바이스 등록: 새로운 IoT 디바이스 추가 및 설정</li>
                  <li>디바이스 목록: 등록된 모든 디바이스 조회 및 관리</li>
                  <li>디바이스 설정: 각 디바이스의 상세 설정 및 구성</li>
                  <li>연결 상태: 디바이스 연결 상태 확인 및 모니터링</li>
                  <li>디바이스 그룹화: 카테고리별 디바이스 분류 및 관리</li>
                </ul>
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">디바이스 정보</div>
                <ul class="text-body2 text-grey-6">
                  <li>기본 정보: 디바이스명, 타입, 제조사, 모델명</li>
                  <li>연결 정보: IP 주소, MAC 주소, 연결 프로토콜</li>
                  <li>설정 정보: 디바이스별 커스텀 설정 및 파라미터</li>
                  <li>상태 정보: 현재 상태, 마지막 연결 시간, 오류 정보</li>
                </ul>
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">NEXA BOARD 연동</div>
                <p class="text-body2 text-grey-6">등록된 디바이스는 NEXA BOARD에서 패널로 추가하여 사용할 수 있습니다. 각 디바이스는 여러 보드에서 동시에 사용할 수 있으며, 실시간 데이터를 제공합니다.</p>
              </div>
            </div>
          </q-tab-panel>

          <!-- 시스템 상태 탭 -->
          <q-tab-panel name="status">
            <div class="q-mb-lg">
              <div class="text-h6 q-mb-md">
                <q-icon name="monitor_heart" size="24px" class="q-mr-sm" />
                시스템 상태 모니터링
              </div>
              <p class="text-body2 text-grey-7 q-mb-md">전체 시스템의 건강도와 상태를 모니터링하고 관리합니다.</p>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">주요 기능</div>
                <ul class="text-body2 text-grey-6">
                  <li>전체 시스템 건강도: 시스템 전반의 상태 점수 및 지표</li>
                  <li>디바이스 상태 모니터링: 각 디바이스의 연결 상태 및 건강도</li>
                  <li>네트워크 상태 요약: 네트워크 연결 상태 및 통신 품질</li>
                  <li>성능 지표: CPU, 메모리, 디스크 사용률 등 시스템 리소스</li>
                </ul>
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">시스템 건강도</div>
                <ul class="text-body2 text-grey-6">
                  <li>전체 점수: 시스템 전반의 건강도 점수 (0-100)</li>
                  <li>디바이스 상태: 정상/경고/오류 디바이스 수</li>
                  <li>네트워크 상태: 네트워크 연결 안정성 및 지연 시간</li>
                  <li>시스템 리소스: 서버 리소스 사용률 및 여유 공간</li>
                </ul>
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">알림 및 경고</div>
                <p class="text-body2 text-grey-6">시스템 상태가 비정상일 경우 자동으로 알림을 발송합니다. 디바이스 연결 끊김, 네트워크 오류, 리소스 부족 등의 상황을 감지하고 알림합니다.</p>
              </div>
            </div>
          </q-tab-panel>

          <!-- AGW System 탭 -->
          <q-tab-panel name="agw">
            <div class="q-mb-lg">
              <div class="text-h6 q-mb-md">
                <q-icon name="dns" size="24px" class="q-mr-sm" />
                AGW System 관리
              </div>
              <p class="text-body2 text-grey-7 q-mb-md">AGW (Application Gateway) 시스템을 관리하고 모니터링합니다.</p>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">주요 구성 요소</div>
                <ul class="text-body2 text-grey-6">
                  <li>TOWER: 메인 AGW 서버 시스템</li>
                  <li>BACKUP: 백업 및 복구 시스템</li>
                  <li>켄통신 MARSER: 근거리 통신 게이트웨이</li>
                </ul>
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">TOWER</div>
                <ul class="text-body2 text-grey-6">
                  <li>메인 서버: 중앙 집중식 게이트웨이 서버</li>
                  <li>디바이스 연결: 모든 IoT 디바이스와의 연결 관리</li>
                  <li>데이터 처리: 디바이스 데이터 수집 및 처리</li>
                  <li>라우팅: 디바이스 간 통신 라우팅</li>
                </ul>
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">BACKUP</div>
                <ul class="text-body2 text-grey-6">
                  <li>데이터 백업: 정기적인 데이터 백업 수행</li>
                  <li>설정 백업: 시스템 설정 및 구성 백업</li>
                  <li>복구 시스템: 장애 시 자동 복구 기능</li>
                  <li>백업 스케줄: 자동 백업 스케줄 관리</li>
                </ul>
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">켄통신 MARSER</div>
                <ul class="text-body2 text-grey-6">
                  <li>근거리 통신: 켄통신 프로토콜 지원</li>
                  <li>게이트웨이 기능: 켄통신 네트워크와의 브릿지</li>
                  <li>노드 관리: 켄통신 네트워크 노드 관리</li>
                  <li>통신 모니터링: 켄통신 통신 상태 모니터링</li>
                </ul>
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">AGW 시스템 모니터링</div>
                <p class="text-body2 text-grey-6">각 AGW 구성 요소의 상태를 실시간으로 모니터링하고, 성능 지표, 연결 상태, 오류 로그 등을 확인할 수 있습니다.</p>
              </div>
            </div>
          </q-tab-panel>

          <!-- 실시간 모니터링 탭 -->
          <q-tab-panel name="monitoring">
            <div class="q-mb-lg">
              <div class="text-h6 q-mb-md">
                <q-icon name="timeline" size="24px" class="q-mr-sm" />
                실시간 모니터링
              </div>
              <p class="text-body2 text-grey-7 q-mb-md">시스템의 실시간 활동을 모니터링하고 추적합니다.</p>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">주요 기능</div>
                <ul class="text-body2 text-grey-6">
                  <li>디바이스 활동: 실시간 디바이스 데이터 전송 및 상태 변화</li>
                  <li>통신 로그: 디바이스와 서버 간 통신 로그 및 메시지</li>
                  <li>오류 추적: 시스템 오류 및 예외 상황 추적 및 분석</li>
                </ul>
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">디바이스 활동</div>
                <ul class="text-body2 text-grey-6">
                  <li>실시간 데이터: 디바이스에서 전송되는 실시간 데이터 스트림</li>
                  <li>상태 변화: 디바이스 상태 변경 이벤트 및 알림</li>
                  <li>활동 통계: 디바이스별 활동 빈도 및 패턴 분석</li>
                  <li>이벤트 타임라인: 시간순 디바이스 이벤트 표시</li>
                </ul>
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">통신 로그</div>
                <ul class="text-body2 text-grey-6">
                  <li>메시지 로그: 디바이스와 서버 간 주고받은 메시지</li>
                  <li>프로토콜 로그: 사용된 통신 프로토콜 및 세부 정보</li>
                  <li>연결 로그: 디바이스 연결/해제 이벤트</li>
                  <li>오류 로그: 통신 중 발생한 오류 및 예외</li>
                </ul>
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">오류 추적</div>
                <ul class="text-body2 text-grey-6">
                  <li>오류 목록: 발생한 모든 오류 및 예외 목록</li>
                  <li>오류 상세: 각 오류의 상세 정보 및 스택 트레이스</li>
                  <li>오류 통계: 오류 유형별 통계 및 추이</li>
                  <li>알림 설정: 중요 오류 발생 시 알림 설정</li>
                </ul>
              </div>

              <div class="q-mb-md">
                <div class="text-subtitle1 q-mb-sm">필터링 및 검색</div>
                <p class="text-body2 text-grey-6">디바이스, 시간 범위, 이벤트 타입 등으로 필터링하여 원하는 정보만 확인할 수 있습니다. 검색 기능을 통해 특정 키워드나 이벤트를 빠르게 찾을 수 있습니다.</p>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>

      <!-- 워크플로우 구조 -->
      <div class="workflow-section q-mt-xl q-mb-xl">
        <div class="section-header q-mb-lg">
          <h2 class="text-h5 text-primary q-mb-sm">
            <q-icon name="account_tree" size="28px" class="q-mr-sm" />
            NEXA 시스템 워크플로우 (System Workflow)
          </h2>
          <p class="text-body2 text-grey-7">
            NEXA 시스템은 두 가지 워크플로우를 제공합니다.<br />
            자동화 기반 워크플로우는 프로젝트와 노드 자동화를 통해 체계적인 작업 관리를 지원하며,<br />
            직접 구성 워크플로우는 빠르고 간단한 보드 및 패널 구성을 가능하게 합니다.<br />
            <strong>NEXA TEACH</strong>는 모든 워크플로우의 반복 작업을 녹화하여 자동화하는 핵심 자동화 인프라입니다.
          </p>
        </div>

        <!-- 흐름 1: 자동화 기반 워크플로우 -->
        <div class="workflow-flow q-mb-lg">
          <div class="text-subtitle1 q-mb-sm text-primary text-center">자동화 기반 워크플로우</div>
          <div class="workflow-steps">
            <div class="workflow-step">
              <q-icon name="settings" size="32px" class="q-mb-xs" />
              <div class="step-label">디바이스 등록</div>
              <div class="step-menu">SYSTEM</div>
            </div>
            <div class="workflow-arrow">
              <q-icon name="arrow_downward" size="24px" />
            </div>
            <div class="workflow-step">
              <q-icon name="business" size="32px" class="q-mb-xs" />
              <div class="step-label">프로젝트 등록</div>
              <div class="step-menu">NEXA ERP</div>
            </div>
            <div class="workflow-arrow">
              <q-icon name="arrow_downward" size="24px" />
            </div>
            <div class="workflow-step">
              <q-icon name="hub" size="32px" class="q-mb-xs" />
              <div class="step-label">노드 자동화 구성</div>
              <div class="step-menu">NEXA NODE</div>
            </div>
            <div class="workflow-arrow">
              <q-icon name="arrow_downward" size="24px" />
            </div>
            <div class="workflow-step">
              <q-icon name="dashboard" size="32px" class="q-mb-xs" />
              <div class="step-label">보드 생성/설정</div>
              <div class="step-menu">NEXA BOARD</div>
            </div>
            <div class="workflow-arrow">
              <q-icon name="arrow_downward" size="24px" />
            </div>
            <div class="workflow-step">
              <q-icon name="widgets" size="32px" class="q-mb-xs" />
              <div class="step-label">패널 구성</div>
              <div class="step-menu">NEXA PANNEL</div>
            </div>
            <div class="workflow-arrow">
              <q-icon name="arrow_downward" size="24px" />
            </div>
            <div class="workflow-step">
              <q-icon name="school" size="32px" class="q-mb-xs" />
              <div class="step-label">반복 작업 자동화</div>
              <div class="step-menu">NEXA TEACH</div>
            </div>
          </div>
        </div>

        <!-- 흐름 2: 직접 구성 워크플로우 -->
        <div class="workflow-flow">
          <div class="text-subtitle1 q-mb-sm text-primary text-center">직접 구성 워크플로우</div>
          <div class="workflow-steps">
            <div class="workflow-step">
              <q-icon name="settings" size="32px" class="q-mb-xs" />
              <div class="step-label">디바이스 등록</div>
              <div class="step-menu">SYSTEM</div>
            </div>
            <div class="workflow-arrow">
              <q-icon name="arrow_downward" size="24px" />
            </div>
            <div class="workflow-step">
              <q-icon name="dashboard" size="32px" class="q-mb-xs" />
              <div class="step-label">보드 생성/설정</div>
              <div class="step-menu">NEXA BOARD</div>
            </div>
            <div class="workflow-arrow">
              <q-icon name="arrow_downward" size="24px" />
            </div>
            <div class="workflow-step">
              <q-icon name="widgets" size="32px" class="q-mb-xs" />
              <div class="step-label">패널 구성</div>
              <div class="step-menu">NEXA PANNEL</div>
            </div>
            <div class="workflow-arrow">
              <q-icon name="arrow_downward" size="24px" />
            </div>
            <div class="workflow-step">
              <q-icon name="school" size="32px" class="q-mb-xs" />
              <div class="step-label">반복 작업 자동화</div>
              <div class="step-menu">NEXA TEACH</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 컴포넌트 재사용 구조 -->
      <div class="component-structure-section q-mt-xl q-mb-xl">
        <div class="section-header q-mb-lg">
          <h2 class="text-h5 text-primary q-mb-sm">
            <q-icon name="architecture" size="28px" class="q-mr-sm" />
            NEXA SYSTEM 핵심 컴포넌트 재사용 구조 (Component Reusability Structure)
          </h2>
          <p class="text-body2 text-grey-7">코딩 관점에서 각 컴포넌트를 어떻게 바라보고 재사용해야 하는지에 대한 가이드입니다.</p>
        </div>

        <div class="component-cards">
          <!-- 차트 시스템 -->
          <div class="component-card">
            <div class="card-header">
              <div class="card-title">차트 (Charts)</div>
              <div class="card-path">src/charts/</div>
            </div>
            <div class="card-content">
              <div class="card-section">
                <div class="section-label">역할</div>
                <div class="section-text">프로젝트 전역에서 사용 가능한 데이터 시각화 컴포넌트. 다양한 데이터 소스를 지원하며 수십 개로 확장 예정.</div>
              </div>
              <div class="card-section">
                <div class="section-label">재사용 방법</div>
                <div class="section-text">
                  <strong>베이스 컴포넌트:</strong> <code>NexaChart</code>로 동적 타입 선택<br />
                  <strong>직접 사용:</strong> 타입별 차트 컴포넌트 직접 import<br />
                  <strong>사용 위치:</strong> 넥사블록, 데이터 렌더러, 일반 컴포넌트
                </div>
              </div>
              <div class="card-section">
                <div class="section-label">사용 패턴</div>
                <div class="section-text">
                  <code>&lt;NexaChart type="line" :data="data" /&gt;</code><br />
                  <code>import LineChart from 'charts/line/LineChart.vue'</code>
                </div>
              </div>
            </div>
          </div>

          <!-- 블럭 시스템 -->
          <div class="component-card">
            <div class="card-header">
              <div class="card-title">블럭 (Block)</div>
              <div class="card-path">src/block/</div>
            </div>
            <div class="card-content">
              <div class="card-section">
                <div class="section-label">역할</div>
                <div class="section-text">독립적인 콘텐츠 단위 컴포넌트. 패널, 에디터, 메인 페이지 등 어디서든 사용 가능하며 수백 개로 확장 예정.</div>
              </div>
              <div class="card-section">
                <div class="section-label">재사용 방법</div>
                <div class="section-text">
                  <strong>베이스 컴포넌트:</strong> <code>NexaBlock</code>로 동적 타입 선택<br />
                  <strong>직접 사용:</strong> 타입별 블록 컴포넌트 직접 import<br />
                  <strong>사용 위치:</strong> 넥사패널, Tiptap 에디터, 메인 페이지, 사이드바
                </div>
              </div>
              <div class="card-section">
                <div class="section-label">사용 패턴</div>
                <div class="section-text">
                  <code>&lt;NexaBlock type="time" :location="auto" /&gt;</code><br />
                  <code>import TimeBlock from 'block/time/TimeBlock.vue'</code>
                </div>
              </div>
            </div>
          </div>

          <!-- 패널 시스템 -->
          <div class="component-card">
            <div class="card-header">
              <div class="card-title">패널 (Panel)</div>
              <div class="card-path">src/panel/</div>
            </div>
            <div class="card-content">
              <div class="card-section">
                <div class="section-label">역할</div>
                <div class="section-text">넥사보드 전용 컨테이너/래퍼 컴포넌트. 그리드 레이아웃, 드래그앤드롭, 리사이즈 등 넥사보드 전용 기능 제공.</div>
              </div>
              <div class="card-section">
                <div class="section-label">재사용 방법</div>
                <div class="section-text">
                  <strong>주요 컴포넌트:</strong> <code>NexaPanel</code>, <code>NexaPanelHeader</code>, <code>NexaPanelMenu</code><br />
                  <strong>사용 위치:</strong> 넥사보드에서만 사용<br />
                  <strong>특징:</strong> 넥사블록을 감싸는 컨테이너 역할
                </div>
              </div>
              <div class="card-section">
                <div class="section-label">사용 패턴</div>
                <div class="section-text">
                  <code>&lt;NexaPanel :panel-id="id" :draggable="true"&gt;</code><br />
                  <code>&nbsp;&nbsp;&lt;NexaBlock type="time" /&gt;</code><br />
                  <code>&lt;/NexaPanel&gt;</code>
                </div>
              </div>
            </div>
          </div>

          <!-- 보드 시스템 -->
          <div class="component-card">
            <div class="card-header">
              <div class="card-title">보드 (Board)</div>
              <div class="card-path">src/board/</div>
            </div>
            <div class="card-content">
              <div class="card-section">
                <div class="section-label">역할</div>
                <div class="section-text">패널을 묶은 단위. 레이아웃, 패널 구성 등 핵심 데이터를 표준화하여 어디서든 재사용 가능한 대시보드 시스템.</div>
              </div>
              <div class="card-section">
                <div class="section-label">재사용 방법</div>
                <div class="section-text">
                  <strong>핵심 데이터 표준화:</strong> 레이아웃 프리셋, 패널 구성, 그리드 설정 등<br />
                  <strong>재사용 가능성:</strong> 표준화된 데이터 구조로 다양한 컨텍스트에서 활용 가능<br />
                  <strong>주요 컴포넌트:</strong> <code>NexaDashboardRenderer</code>, <code>NexaBoardSetup</code>
                </div>
              </div>
              <div class="card-section">
                <div class="section-label">사용 패턴</div>
                <div class="section-text">
                  <code>&lt;nexa-dashboard-renderer :preset="presetData" /&gt;</code><br />
                  <code>&lt;nexa-board-setup :boardConfig="config" /&gt;</code><br />
                  <strong>확장 가능성:</strong> 표준화된 보드 데이터로 모달, 사이드바, 임베드 등 다양한 형태로 응용 가능
                </div>
              </div>
            </div>
          </div>

          <!-- 노드 시스템 -->
          <div class="component-card">
            <div class="card-header">
              <div class="card-title">노드 (Node)</div>
              <div class="card-path">src/node/</div>
            </div>
            <div class="card-content">
              <div class="card-section">
                <div class="section-label">역할</div>
                <div class="section-text">자동화 워크플로우의 핵심 로직 처리 단위. 노드 에디터를 통해 트리거-처리-액션 흐름을 시각적으로 구성하고 실행. 데이터 변환, 계산 등 다양한 로직을 구현하며, 패널, 차트, 블럭 등 다른 컴포넌트에서도 활용 가능한 재사용 가능한 전역 로직 모듈</div>
              </div>
              <div class="card-section">
                <div class="section-label">재사용 방법</div>
                <div class="section-text">
                  <strong>트리거 노드:</strong> NEXA NODE 전용 (이벤트 시작, 스케줄, 디바이스 입력 등)<br />
                  <strong>처리 노드:</strong> 전역 공통 사용 가능 (데이터 변환, 계산, 집계, 필터링, 조건 분기 등)<br />
                  <strong>액션 노드:</strong> NEXA NODE 전용 (디바이스 제어, 알림 발송, 데이터 저장 등 최종 실행)
                </div>
              </div>
              <div class="card-section">
                <div class="section-label">사용 패턴</div>
                <div class="section-text">
                  <code>NEXA NODE:</code> 노드 에디터에서 트리거-처리-액션 워크플로우 구성<br />
                  <code>패널:</code> 데이터 변환 노드로 센서 값 가공 후 표시<br />
                  <code>차트:</code> 집계 노드로 데이터 요약 후 시각화<br />
                  <code>블럭:</code> 계산 노드로 실시간 수치 계산 및 표시
                </div>
              </div>
            </div>
          </div>

          <!-- NEXA TEACH 시스템 -->
          <div class="component-card">
            <div class="card-header">
              <div class="card-title">NEXA TEACH</div>
              <div class="card-path">src/teach/</div>
            </div>
            <div class="card-content">
              <div class="card-section">
                <div class="section-label">역할</div>
                <div class="section-text">액션 녹화 및 재생을 통한 핵심 자동화 인프라. 사용자 인터랙션을 녹화하고 재생하여 반복 작업을 자동화. 맥락 정보 캡처, 변수 시스템, 조건부 실행 등 고급 자동화 기능 제공. 모든 워크플로우의 반복 작업을 녹화하여 자동화하는 시스템.</div>
              </div>
              <div class="card-section">
                <div class="section-label">재사용 방법</div>
                <div class="section-text">
                  <strong>액션 녹화:</strong> 사용자 인터랙션을 자동으로 캡처하여 액션 시퀀스 생성<br />
                  <strong>액션 재생:</strong> 녹화된 액션 시퀀스를 맥락 정보와 함께 재생<br />
                  <strong>단축키 연동:</strong> 녹화된 액션을 단축키에 할당하여 빠른 실행<br />
                  <strong>NEXA NODE 연동:</strong> 액션 시퀀스를 노드 그래프로 변환하여 시각적 편집 가능
                </div>
              </div>
              <div class="card-section">
                <div class="section-label">사용 패턴</div>
                <div class="section-text">
                  <code>액션 녹화:</code> 반복 작업을 녹화하여 액션 시퀀스 생성<br />
                  <code>단축키 할당:</code> 녹화된 액션을 단축키에 할당하여 빠른 실행<br />
                  <code>변수 활용:</code> 동적 변수를 사용하여 다양한 시나리오에 대응<br />
                  <code>조건부 실행:</code> if/else, 루프 등 조건부 로직으로 동적 워크플로우 구성
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const mainTab = ref('device')
</script>

<style lang="scss" scoped>
.system-page {
  background: var(--nexa-background);
  min-height: 100vh;
}

.page-header {
  border-bottom: 1px solid var(--nexa-border-color);
  //padding-bottom: 16px;
}

// 탭 패널 배경 제거 및 보더 추가
:deep(.q-tab-panels) {
  background: transparent;
  margin-top: 0 !important;
  padding-top: 0 !important;
}

:deep(.q-tabs) {
  margin-bottom: 0 !important;
}

:deep(.q-tab-panel) {
  background: transparent;
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  padding: 50px;
  margin-top: 0 !important;
  padding-top: 0 !important;
}

.physical-systems-section,
.workflow-section,
.component-structure-section {
  .section-header {
    margin-top: 60px;
  }
}

.workflow-section {
  margin-top: 60px;
  //padding-top: 20px;

  .workflow-flow {
    .workflow-steps {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      @media (min-width: 768px) {
        flex-direction: row;
        justify-content: center;
        flex-wrap: wrap;
        gap: 16px;
      }
    }

    .workflow-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      min-width: 120px;
      background: transparent;
      border: 1px solid var(--nexa-border-color);
      border-radius: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: transparent;
        border-color: var(--q-primary);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .step-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--nexa-text-primary);
        text-align: center;
        margin-top: 4px;
      }

      .step-menu {
        font-size: 12px;
        color: var(--nexa-text-secondary);
        text-align: center;
        margin-top: 2px;
      }
    }

    .workflow-arrow {
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--q-primary);
      padding: 8px;
      flex-shrink: 0;

      @media (min-width: 768px) {
        transform: rotate(-90deg);
      }
    }
  }
}

.component-structure-section {
  margin-top: 60px;
  //padding-top: 20px;

  .component-cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;

    @media (min-width: 768px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: 1200px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .component-card {
    background: var(--nexa-surface);
    border: 1px solid var(--nexa-border-color);
    border-radius: 8px;
    padding: 20px;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--q-primary);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .card-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
    }

    .card-title {
      font-size: 18px;
      font-weight: 600;
      color: var(--nexa-text-primary);
      margin-bottom: 4px;
    }

    .card-path {
      font-size: 12px;
      font-family: 'Courier New', monospace;
      color: var(--nexa-text-secondary);
      background: var(--nexa-background);
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    }

    .card-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .card-section {
      .section-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--q-primary);
        margin-bottom: 6px;
      }

      .section-text {
        font-size: 13px;
        color: var(--nexa-text-secondary);
        line-height: 1.6;

        code {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          background: var(--nexa-background);
          padding: 2px 6px;
          border-radius: 3px;
          color: var(--nexa-text-primary);
          display: inline-block;
          margin: 2px 0;
        }

        strong {
          color: var(--nexa-text-primary);
          font-weight: 600;
        }
      }
    }
  }
}
</style>
