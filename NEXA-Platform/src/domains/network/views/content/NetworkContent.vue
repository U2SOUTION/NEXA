<template>
  <q-page class="network-page">
    <div class="q-pa-lg">
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 text-primary" style="margin-bottom: 2px">NETWORK</h1>
        <p class="text-body1 text-grey-7">네트워크 구성 및 관리</p>
      </div>

      <!-- 네트워크 개념 설명 -->
      <div class="q-mb-lg network-concept-section">
        <h2 class="text-h6">네트워크란?</h2>
        <div class="q-mb-md description-item">
          <h4 class="text-subtitle1 q-mb-sm">네트워크 정의</h4>
          <p class="text-body2 text-grey-7">디바이스, 시스템, 서비스 간 통신을 위한 연결 방식. WiFi, BUS, Socket, MQTT 등 다양한 프로토콜 지원. 각 프로토콜 특성에 맞는 구성 및 관리</p>
        </div>
        <div class="q-mb-md description-item">
          <h4 class="text-subtitle1 q-mb-sm">네트워크 관리</h4>
          <p class="text-body2 text-grey-7">통신 상태 모니터링, 오류 감지, 성능 최적화, 보안 관리를 통한 시스템 안정성 및 효율성 보장</p>
        </div>
        <div class="q-mb-md description-item">
          <h4 class="text-subtitle1 q-mb-sm">넥셋화</h4>
          <p class="text-body2 text-grey-7">네트워크의 각 기능(WiFi 상태, CAN 버스 모니터링, Socket 연결, MQTT 토픽 등)을 넥셋로 만들어 Nexa Board에 통합하여 실시간 모니터링 및 제어 가능</p>
        </div>
      </div>

      <!-- 탭 구조 -->
      <q-tabs v-model="networkTab" dense class="text-grey-7" active-color="primary" indicator-color="primary" align="left" narrow-indicator>
        <q-tab name="wifi" label="WiFi 네트워크" icon="wifi" />
        <q-tab name="bus" label="켄통신 (근거리 네트워크)" icon="router" />
        <q-tab name="socket" label="Socket 연결" icon="link" />
        <q-tab name="mqtt" label="MQTT 관리" icon="hub" />
        <q-tab name="monitoring" label="네트워크 모니터링" icon="analytics" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="networkTab" animated>
        <!-- WiFi 네트워크 -->
        <q-tab-panel name="wifi" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="wifi" size="24px" class="q-mr-sm" />
            WiFi 네트워크
          </h3>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">라우터 설정</h4>
            <p class="text-body2 text-grey-7 q-mb-sm">SSID, 비밀번호, 채널, 대역폭 설정 관리. 네트워크 성능 및 보안 최적화. 다중 라우터 환경의 메시 네트워크 구성 지원</p>
            <p class="text-body2 text-grey-7 q-mb-sm"><strong>라우터 접근 방법:</strong> 사설 IP 주소(192.168.0.1, 192.168.1.1 등)로 관리 페이지 접근. 동일 네트워크 내에서 라우터 사설 IP 입력 시 관리 인터페이스 접근</p>
            <p class="text-body2 text-grey-7 q-mb-sm">라우터 관리 UI 시스템 통합 표시 또는 iframe을 통한 원본 관리 페이지 표시. 넥사 시스템 내에서 라우터 관리</p>
            <p class="text-body2 text-grey-7">
              <strong>직접 UI 표현:</strong> 라우터 연결 상태 및 디바이스 정보를 iframe 없이 직접 UI 표현. 라우터 API 또는 UPnP/TR-069 표준 프로토콜을 통한 연결 디바이스 목록, 네트워크 상태, 트래픽 정보 실시간 표시. 백엔드 서버 또는 로컬 네트워크 에이전트를 통한 정보 수집 후 넥사 시스템 UI로 통합
              표시
            </p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">연결 상태 모니터링</h4>
            <p class="text-body2 text-grey-7">신호 강도, 연결 속도, 패킷 손실률 추적. 네트워크 품질 평가 및 문제 조기 감지</p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">디바이스 연결 관리</h4>
            <p class="text-body2 text-grey-7">연결 디바이스 목록, IP 주소 할당, MAC 주소 기반 접근 제어, 대역폭 제한 관리. 네트워크 리소스 효율적 관리</p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">네트워크 토폴로지</h4>
            <p class="text-body2 text-grey-7">라우터, 액세스 포인트, 연결 디바이스 간 관계 그래픽 표현. 네트워크 경로 및 연결 상태 시각화</p>
          </div>
        </q-tab-panel>

        <!-- 켄통신 (근거리 네트워크) -->
        <q-tab-panel name="bus" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="router" size="24px" class="q-mr-sm" />
            켄통신 (근거리 네트워크)
          </h3>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">BUS 구성</h4>
            <p class="text-body2 text-grey-7">CAN, Modbus, RS-485 등 다양한 BUS 프로토콜 지원. 물리적 연결 및 통신 파라미터 설정. 다중 노드 환경의 버스 토폴로지 구성 관리</p>
            <p class="text-body2 text-grey-7 q-mb-sm"><strong>원격 접근 구조:</strong> ESP32 게이트웨이를 통한 원격 CAN 버스 접근. ESP32는 CAN 버스와 직접 연결, WiFi/인터넷으로 넥사 서버 연결. 넥사 서버 중계를 통한 원격 CAN 버스 상태 확인 및 제어</p>
            <p class="text-body2 text-grey-7"><strong>ESP32 주소 구성:</strong> 디바이스 ID, MAC 주소, 등록된 디바이스 이름으로 식별. 넥사 서버 등록 시 시스템 내 고유 식별. API 키/인증 토큰을 통한 보안 접근. 디바이스 ID로 원격 ESP32 접근</p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">노드 관리</h4>
            <p class="text-body2 text-grey-7">노드 ID 할당, 주소 매핑, 노드별 통신 설정 관리. 노드 추가/제거/설정 변경 시 네트워크 영향 분석</p>
            <p class="text-body2 text-grey-7"><strong>원격 노드 제어:</strong> 넥사 서버를 통한 ESP32 게이트웨이 연결 CAN 버스 노드 원격 제어. 노드별 명령 전송, 상태 조회, 설정 변경. 모든 통신은 넥사 서버 경유 처리</p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">통신 상태 모니터링</h4>
            <p class="text-body2 text-grey-7">노드 간 통신 성공률, 응답 시간, 오류 발생 빈도 추적. 통신 지연/오류 발생 시 즉시 알림</p>
            <p class="text-body2 text-grey-7"><strong>원격 모니터링:</strong> ESP32 게이트웨이를 통한 원격지 CAN 버스 상태 실시간 모니터링. ESP32가 통신 상태 수집 후 넥사 서버로 전송. 넥사 시스템에서 모든 원격 CAN 버스 상태 통합 확인</p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">통신 로그</h4>
            <p class="text-body2 text-grey-7">송수신 메시지, 타임스탬프, 노드 정보, 오류 메시지 기록. 로그 필터링 및 검색을 통한 문제 진단 및 성능 분석</p>
            <p class="text-body2 text-grey-7"><strong>중앙 집중식 로그 관리:</strong> 원격지 CAN 버스 통신 로그를 ESP32를 통해 넥사 서버로 전송하여 중앙 관리. 모든 CAN 버스 로그 통합 분석. 디바이스별, 시간대별, 노드별 필터링을 통한 문제 진단</p>
          </div>
        </q-tab-panel>

        <!-- Socket 연결 -->
        <q-tab-panel name="socket" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="link" size="24px" class="q-mr-sm" />
            Socket 연결
          </h3>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">연결 상태</h4>
            <p class="text-body2 text-grey-7">활성 연결 수, 연결 클라이언트 목록, 연결 지속 시간, 데이터 송수신 상태 추적. 연결 끊김 또는 오류 발생 시 즉시 감지 및 알림</p>
            <p class="text-body2 text-grey-7"><strong>원격 접근 구조:</strong> 넥사 서버를 통한 원격 소켓 서버 접근. 원격 소켓 서버는 넥사 서버에 연결되어 중계 서버 역할 수행. 넥사 시스템을 통한 원격 소켓 서버 상태 확인 및 제어</p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">클라이언트 관리</h4>
            <p class="text-body2 text-grey-7">클라이언트 IP 주소, 포트, 연결 시간, 세션 정보 관리. 특정 클라이언트 연결 종료 또는 제한. 클라이언트별 권한 설정 및 접근 제어</p>
            <p class="text-body2 text-grey-7"><strong>원격 클라이언트 관리:</strong> 넥사 서버를 통한 원격 소켓 서버의 클라이언트 관리. 원격 클라이언트 연결 상태 조회, 명령 전송, 연결 제어. 모든 통신은 넥사 서버 경유 처리</p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">통신 로그</h4>
            <p class="text-body2 text-grey-7">연결/해제 이벤트, 송수신 데이터, 오류 메시지, 타임스탬프 기록. 대용량 로그 데이터 효율적 관리. 조건별 필터링을 통한 정보 추출</p>
            <p class="text-body2 text-grey-7"><strong>중앙 집중식 로그 관리:</strong> 원격 소켓 서버의 통신 로그를 넥사 서버로 전송하여 중앙 관리. 모든 소켓 서버 로그 통합 분석. 서버별, 시간대별, 클라이언트별 필터링을 통한 문제 진단</p>
          </div>
        </q-tab-panel>

        <!-- MQTT 관리 -->
        <q-tab-panel name="mqtt" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="hub" size="24px" class="q-mr-sm" />
            MQTT 관리
          </h3>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">브로커 설정</h4>
            <p class="text-body2 text-grey-7">포트 설정, SSL/TLS 보안 설정, 인증 방식, 연결 제한, 세션 관리 구성. 브로커 성능 최적화 설정 및 클러스터링 구성 지원</p>
            <p class="text-body2 text-grey-7">
              <strong>웹 호스팅 제한 우회:</strong> 웹 호스팅 환경에서 80, 443 포트 외 포트 사용 제한 시 WebSocket을 통한 MQTT 연결. WebSocket 포트(예: 8080, 9000)를 통한 MQTT 브로커 접근. 브라우저 기반 MQTT 클라이언트 지원. 표준 HTTP/HTTPS 포트를 통한 MQTT over WebSocket 연결로 방화벽 및 포트 제한
              우회
            </p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">토픽 관리</h4>
            <p class="text-body2 text-grey-7">토픽 계층 구조, 와일드카드 패턴(# 전체 레벨, + 단일 레벨), 토픽별 읽기/쓰기 권한 설정을 통한 메시지 흐름 제어. 토픽 사용 통계 및 모니터링</p>
            <p class="text-body2 text-grey-7 q-mb-sm"><strong>토픽 구조 설계:</strong> 계층적 토픽 구조로 디바이스 및 프로젝트 관리. 예: device/{device-id}/status, device/{device-id}/command, project/{project-id}/data. 와일드카드를 통한 그룹 구독 및 일괄 제어</p>
            <p class="text-body2 text-grey-7 q-mb-sm"><strong>토픽 템플릿 및 자동 생성:</strong> 디바이스 등록 시 자동 토픽 생성. 프로젝트별 토픽 그룹 자동 구성. 토픽 네이밍 규칙 템플릿 제공. 시스템 표준 토픽 구조 준수</p>
            <p class="text-body2 text-grey-7"><strong>토픽 기반 시스템 연동:</strong> 자동화 워크플로우와 토픽 연동. 토픽 구독을 통한 트리거 설정. 토픽 발행을 통한 디바이스 제어. 토픽별 알림 규칙 설정. 토픽 데이터 히스토리 저장 및 분석</p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">구독/발행 모니터링</h4>
            <p class="text-body2 text-grey-7">활성 구독자 수, 메시지 발행 빈도, 토픽별 메시지 흐름, 클라이언트별 활동 추적. 비정상 메시지 패턴 또는 과도한 트래픽 감지 시 알림</p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">통신 로그</h4>
            <p class="text-body2 text-grey-7">연결/해제 이벤트, 구독/구독 해제, 메시지 발행/수신, QoS 레벨, 오류 메시지 기록. 로그 분석을 통한 통신 패턴 파악 및 성능 최적화</p>
          </div>
        </q-tab-panel>

        <!-- 네트워크 모니터링 -->
        <q-tab-panel name="monitoring" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="analytics" size="24px" class="q-mr-sm" />
            네트워크 모니터링
          </h3>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">통합 네트워크 대시보드</h4>
            <p class="text-body2 text-grey-7">WiFi, BUS, Socket, MQTT 등 모든 네트워크 프로토콜을 통합하여 한 화면에서 모니터링. 네트워크 전체 상태, 활성 연결 수, 트래픽 현황을 실시간으로 표시. 프로토콜별, 디바이스별, 지역별 필터링 및 그룹화</p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">전체 트래픽 분석</h4>
            <p class="text-body2 text-grey-7">모든 프로토콜을 통합한 전체 네트워크 트래픽 분석. 프로토콜별 대역폭 사용량, 데이터 전송량, 패킷 수 시각화. 시간대별, 프로토콜별, 디바이스별 트래픽 패턴 분석을 통한 네트워크 병목 지점 식별 및 용량 계획</p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">통합 연결 통계</h4>
            <p class="text-body2 text-grey-7">모든 네트워크 프로토콜의 연결 상태를 통합하여 통계 제공. 전체 활성 연결 수, 프로토콜별 연결 분포, 연결 성공/실패율, 동시 연결 최대치 추적. 네트워크 전체 용량 및 성능 평가</p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">통합 오류 감지 및 알림</h4>
            <p class="text-body2 text-grey-7">모든 프로토콜의 오류를 통합하여 감지 및 알림. 프로토콜별 오류율, 네트워크 전체 오류 트렌드 분석. 임계값 초과 시 즉시 알림 발송. 오류 발생 패턴 분석 및 근본 원인 파악</p>
          </div>

          <div class="q-mb-md description-item">
            <h4 class="text-subtitle1 q-mb-sm">네트워크 성능 종합 분석</h4>
            <p class="text-body2 text-grey-7">전체 네트워크의 성능 지표를 종합적으로 분석. 프로토콜별 지연 시간, 처리량, 응답 시간 비교. 네트워크 전체 성능 트렌드 추적. 성능 저하 원인 분석 및 최적화 방안 제시</p>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

// NETWORK 페이지
// 네트워크 구성 및 관리

const networkTab = ref('wifi')
</script>

<style lang="scss" scoped>
.network-page {
  //background: var(--nexa-background);
  min-height: 100vh;
}

.network-concept-section {
  counter-reset: section-counter;

  h2 {
    margin-top: 1.5rem;
    margin-bottom: 0.25rem;
    margin-left: 1rem;
  }

  .description-item {
    counter-increment: section-counter;
    counter-reset: detail-counter;

    h4::before {
      content: counter(section-counter) '. ';
      font-weight: 600;
      color: var(--q-primary);
    }

    > p:not(:has(strong)) {
      position: relative;
      margin-left: 0.5rem;
      padding-left: 1rem;

      &::before {
        content: '⌦';
        position: absolute;
        left: 0;
        color: var(--q-primary);
        font-size: 0.7em;
      }
    }

    p:has(strong) {
      margin-left: 2.5rem;
      margin-top: 0.5rem;
    }

    p strong {
      counter-increment: detail-counter;

      &::before {
        content: '• ';
        font-weight: 600;
        color: var(--q-primary);
        margin-right: 0.1rem;
      }
    }
  }
}

.network-tab-panel {
  counter-reset: section-counter;
  border-radius: 4px;
  padding: 16px 35px;
}

// 탭 넥셋 배경 제거
:deep(.q-tab-panels) {
  background: transparent;
}

:deep(.q-tab-panel) {
  background: transparent;
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
}

.description-item {
  counter-increment: section-counter;
  counter-reset: detail-counter;

  h4::before {
    content: counter(section-counter) '. ';
    font-weight: 600;
    color: var(--q-primary);
  }

  > p:not(:has(strong)) {
    position: relative;
    margin-left: 0.5rem;
    padding-left: 1rem;

    &::before {
      content: '⌦';
      position: absolute;
      left: 0;
      color: var(--q-primary);
      font-size: 0.7em;
      //opacity: 0.6;
    }
  }

  p:has(strong) {
    margin-left: 2.5rem; //점 이전 공백
    margin-top: 0.5rem;
  }

  p strong {
    counter-increment: detail-counter;

    &::before {
      content: '• ';
      font-weight: 600;
      color: var(--q-primary);
      margin-right: 0.1rem; //점 이후 공백
    }
  }
}
</style>
