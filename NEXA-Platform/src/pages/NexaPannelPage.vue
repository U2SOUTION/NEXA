<template>
  <q-page class="nexa-pannel-page">
    <div class="q-pa-lg">
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 text-primary q-mb-sm">NEXA PANNEL</h1>
        <p class="text-body1 text-grey-7">패널 카탈로그 및 관리</p>
      </div>

      <!-- 메인 탭 -->
      <q-tabs v-model="mainTab" class="q-mb-lg" align="left" dense>
        <q-tab name="device" label="디바이스 패널" icon="devices" />
        <q-tab name="project" label="프로젝트 패널" icon="folder" />
        <q-tab name="parts" label="부품 패널" icon="inventory_2" />
        <q-tab name="other" label="기타 패널" icon="extension" />
        <q-tab name="management" label="패널 관리" icon="settings" />
      </q-tabs>

      <q-tab-panels v-model="mainTab" animated>
        <!-- 디바이스 패널 탭 -->
        <q-tab-panel name="device">
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-md">
              <q-icon name="devices" size="24px" class="q-mr-sm" />
              디바이스 패널
            </div>
            <p class="text-body2 text-grey-7 q-mb-md">IoT 디바이스의 데이터를 시각화하는 패널입니다. 등록된 디바이스의 실시간 데이터를 다양한 형태로 표시할 수 있습니다.</p>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">주요 기능</div>
              <ul class="text-body2 text-grey-6">
                <li>실시간 데이터 표시: 디바이스에서 전송되는 실시간 데이터 시각화</li>
                <li>다양한 차트 타입: 라인 차트, 바 차트, 게이지, 숫자 표시 등</li>
                <li>디바이스 제어: 패널에서 직접 디바이스 제어 명령 전송</li>
                <li>알림 설정: 임계값 초과 시 알림 표시</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">패널 타입 예시</div>
              <ul class="text-body2 text-grey-6">
                <li>센서 데이터 패널: 온도, 습도, 압력 등 센서 값 표시</li>
                <li>스위치 제어 패널: 디바이스 ON/OFF 제어</li>
                <li>모터 제어 패널: 모터 속도, 방향 제어 및 상태 표시</li>
                <li>LED 제어 패널: LED 밝기, 색상 제어</li>
                <li>통계 패널: 디바이스 데이터 통계 및 추이</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">데이터 소스</div>
              <p class="text-body2 text-grey-6">디바이스 패널은 SYSTEM 메뉴에서 등록한 디바이스를 데이터 소스로 사용합니다. 각 디바이스의 데이터 포인트를 선택하여 패널에 연결할 수 있습니다.</p>
            </div>
          </div>
        </q-tab-panel>

        <!-- 프로젝트 패널 탭 -->
        <q-tab-panel name="project">
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-md">
              <q-icon name="folder" size="24px" class="q-mr-sm" />
              프로젝트 패널
            </div>
            <p class="text-body2 text-grey-7 q-mb-md">ERP 프로젝트 정보를 표시하는 패널입니다. 프로젝트 진행 상황, 일정, 예산 등을 시각화할 수 있습니다.</p>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">주요 기능</div>
              <ul class="text-body2 text-grey-6">
                <li>프로젝트 정보 표시: 프로젝트 기본 정보 및 상태 표시</li>
                <li>진행률 표시: 프로젝트 진행률 및 마일스톤 표시</li>
                <li>일정 표시: 프로젝트 일정 및 데드라인 표시</li>
                <li>예산 표시: 프로젝트 예산 및 비용 현황 표시</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">패널 타입 예시</div>
              <ul class="text-body2 text-grey-6">
                <li>프로젝트 개요 패널: 프로젝트 기본 정보 및 상태 요약</li>
                <li>진행률 게이지 패널: 프로젝트 진행률 게이지 표시</li>
                <li>일정 캘린더 패널: 프로젝트 일정 캘린더 뷰</li>
                <li>예산 차트 패널: 예산 대비 사용 현황 차트</li>
                <li>작업 목록 패널: 프로젝트 관련 작업 문서 목록</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">ERP 연동</div>
              <p class="text-body2 text-grey-6">프로젝트 패널은 ERP 메뉴에서 등록한 프로젝트를 데이터 소스로 사용합니다. 프로젝트와 연결된 작업 문서, 일정, 재무 정보 등을 패널에 표시할 수 있습니다.</p>
            </div>
          </div>
        </q-tab-panel>

        <!-- 부품 패널 탭 -->
        <q-tab-panel name="parts">
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-md">
              <q-icon name="inventory_2" size="24px" class="q-mr-sm" />
              부품 패널
            </div>
            <p class="text-body2 text-grey-7 q-mb-md">부품 관리 정보를 표시하는 패널입니다. 재고 현황, 입출고 내역, 부품 정보 등을 시각화할 수 있습니다.</p>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">주요 기능</div>
              <ul class="text-body2 text-grey-6">
                <li>재고 현황 표시: 부품별 재고 수량 및 상태 표시</li>
                <li>입출고 내역: 부품 입출고 이력 표시</li>
                <li>부품 정보: 부품 상세 정보 및 스펙 표시</li>
                <li>재고 알림: 최소 재고 알림 및 부족 부품 표시</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">패널 타입 예시</div>
              <ul class="text-body2 text-grey-6">
                <li>재고 현황 패널: 부품별 재고 수량 및 위치 표시</li>
                <li>입출고 차트 패널: 입출고 추이 차트</li>
                <li>부품 검색 패널: 부품 검색 및 상세 정보 표시</li>
                <li>재고 알림 패널: 부족 부품 및 최소 재고 알림</li>
                <li>부품 통계 패널: 부품 사용 통계 및 분석</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">부품관리 연동</div>
              <p class="text-body2 text-grey-6">부품 패널은 ERP의 부품관리 메뉴에서 관리하는 부품 데이터를 사용합니다. 특정 프로젝트와 연결된 부품이나 전체 부품 재고를 표시할 수 있습니다.</p>
            </div>
          </div>
        </q-tab-panel>

        <!-- 기타 패널 탭 -->
        <q-tab-panel name="other">
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-md">
              <q-icon name="extension" size="24px" class="q-mr-sm" />
              기타 패널
            </div>
            <p class="text-body2 text-grey-7 q-mb-md">커스텀 패널 및 확장 패널입니다. 사용자가 직접 제작하거나 외부에서 가져온 패널을 사용할 수 있습니다.</p>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">주요 기능</div>
              <ul class="text-body2 text-grey-6">
                <li>커스텀 패널: 사용자가 직접 제작한 패널 등록 및 사용</li>
                <li>확장 패널: 외부 라이브러리나 플러그인 기반 패널</li>
                <li>템플릿 패널: 재사용 가능한 패널 템플릿</li>
                <li>통합 패널: 여러 데이터 소스를 통합한 복합 패널</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">원격지 카메라 패널</div>
              <ul class="text-body2 text-grey-6">
                <li>원격지 카메라 영상 표시: ESP32 게이트웨이를 통한 원격지 카메라 영상을 Nexa Board에 패널로 표시</li>
                <li>실시간 스트리밍: 넥사 서버를 통한 실시간 영상 스트리밍</li>
                <li>다중 카메라 지원: 여러 원격지 카메라를 동시에 모니터링</li>
                <li>카메라 제어: 원격지 카메라의 각도, 줌 등 제어 기능</li>
                <li>녹화 및 스냅샷: 영상 녹화 및 스냅샷 저장</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">네트워크 패널</div>
              <ul class="text-body2 text-grey-6">
                <li>WiFi 네트워크 패널: 라우터 상태, 연결 디바이스 목록, 트래픽 정보 표시</li>
                <li>CAN 버스 패널: CAN 버스 노드 상태, 통신 로그, 메시지 모니터링</li>
                <li>Socket 연결 패널: 활성 연결 상태, 클라이언트 목록, 통신 통계</li>
                <li>MQTT 패널: 토픽 구독/발행 모니터링, 메시지 흐름 시각화</li>
                <li>네트워크 통합 모니터링 패널: 전체 네트워크 상태를 한눈에 확인</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">패널 타입 예시</div>
              <ul class="text-body2 text-grey-6">
                <li>HTML/JavaScript 패널: 웹 기술로 제작한 커스텀 패널</li>
                <li>외부 API 패널: 외부 서비스 API를 연동한 패널</li>
                <li>데이터 통합 패널: 여러 소스의 데이터를 통합 표시</li>
                <li>대시보드 위젯: 간단한 정보 표시 위젯</li>
                <li>알림 패널: 시스템 알림 및 메시지 표시</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">패널 개발</div>
              <p class="text-body2 text-grey-6">기타 패널은 NEXA Platform의 패널 API를 사용하여 개발할 수 있습니다. HTML, CSS, JavaScript를 사용하여 자유롭게 패널을 제작하고 등록할 수 있습니다.</p>
            </div>
          </div>
        </q-tab-panel>

        <!-- 패널 관리 탭 -->
        <q-tab-panel name="management">
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-md">
              <q-icon name="settings" size="24px" class="q-mr-sm" />
              패널 관리
            </div>
            <p class="text-body2 text-grey-7 q-mb-md">등록된 패널을 편집하고 호환성 설정을 관리할 수 있습니다.</p>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">주요 기능</div>
              <ul class="text-body2 text-grey-6">
                <li>패널 편집: 패널 설정 및 구성 수정</li>
                <li>패널 호환성 설정: 디바이스 및 데이터 타입 호환성 설정</li>
                <li>패널 삭제: 불필요한 패널 제거</li>
                <li>패널 복제: 기존 패널을 기반으로 새 패널 생성</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">패널 편집</div>
              <ul class="text-body2 text-grey-6">
                <li>기본 정보: 패널명, 설명, 아이콘 등 기본 정보 수정</li>
                <li>레이아웃 설정: 패널 크기, 위치, 스타일 설정</li>
                <li>데이터 소스: 패널이 사용하는 데이터 소스 설정</li>
                <li>시각화 설정: 차트 타입, 색상, 범례 등 시각화 옵션</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">호환성 설정</div>
              <ul class="text-body2 text-grey-6">
                <li>디바이스 호환성: 지원하는 디바이스 타입 및 모델</li>
                <li>데이터 타입: 지원하는 데이터 타입 및 형식</li>
                <li>프로토콜 호환성: 지원하는 통신 프로토콜</li>
                <li>버전 관리: 패널 버전 및 업데이트 관리</li>
              </ul>
            </div>

            <div class="q-mb-md">
              <div class="text-subtitle1 q-mb-sm">패널 사용 현황</div>
              <p class="text-body2 text-grey-6">각 패널이 어느 보드에서 사용되고 있는지 확인할 수 있으며, 패널 수정 시 영향을 받는 보드를 파악할 수 있습니다.</p>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const mainTab = ref('device')
</script>

<style lang="scss" scoped>
.nexa-pannel-page {
  background: var(--nexa-background);
  min-height: 100vh;
}

.page-header {
  border-bottom: 1px solid var(--nexa-border-color);
  padding-bottom: 16px;
}

// 탭 패널 배경 제거 및 보더 추가
:deep(.q-tab-panels) {
  background: transparent;
}

:deep(.q-tab-panel) {
  background: transparent;
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  padding: 50px;
}
</style>
