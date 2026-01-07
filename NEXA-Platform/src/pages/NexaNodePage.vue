<!-- NexaNodePage.vue
 경로: NEXA-Platform/src/pages/NexaNodePage.vue
 -->

<template>
  <q-page class="automation-page">
    <div class="q-pa-lg">
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 text-primary q-mb-sm">NEXA NODE</h1>
        <p class="text-body1 text-grey-7">NEXA 노드 에디터를 통한 자동화 규칙 구상 및 검증</p>
      </div>

      <div v-if="isSimulatorVisible" class="simulator-overlay">
        <div class="simulator-header row items-center justify-between">
          <div>
            <div class="text-h6 text-bold text-primary">Virtual IoT 시뮬레이터</div>
            <div class="text-caption text-grey-5">실시간 가상 장비 / 캔버스 연동</div>
          </div>
          <q-btn dense flat icon="close" label="닫기" @click="closeSimulator" />
        </div>
        <div class="simulator-body row">
          <div class="simulator-canvas col">
            <VirtualCanvas />
          </div>
          <div class="simulator-device col-auto">
            <VirtualIotDevice />
          </div>
        </div>
      </div>
      <div v-else class="page-content">
        <div v-if="canvasReady" class="canvas-stage">
          <NodeCanvas class="canvas-full" :nodes="canvasNodes" :links="canvasLinks" />
        </div>
        <div v-else class="doc-stage">
          <div class="canvas-hint text-caption q-mb-lg">
            {{ canvasHintText }}
          </div>
          <!-- 메인 탭 -->
          <q-tabs v-model="mainTab" class="q-mb-lg" align="left" dense>
            <q-tab name="basic" label="기본 개념" icon="lightbulb" />
            <q-tab name="node-types" label="노드 타입" icon="category" />
            <q-tab name="global-modules" label="전역 모듈" icon="extension" />
            <q-tab name="workflow" label="작업 관리 시스템" icon="work" />
            <q-tab name="goals" label="목표 및 효과" icon="flag" />
          </q-tabs>

          <q-tab-panels v-model="mainTab" animated>
            <!-- 기본 개념 탭 -->
            <q-tab-panel name="basic">
              <div class="q-mb-lg">
                <div class="text-h6 q-mb-md">
                  <q-icon name="lightbulb" size="24px" class="q-mr-sm" />
                  노드 기반 자동화 시스템 개념
                </div>
                <p class="text-body2 text-grey-7 q-mb-md">노드 기반 자동화 시스템은 블렌더의 노드 시스템과 유사하게 시각적 그래프를 통해 자동화 로직을 구성합니다.</p>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">노드 타입</div>
                  <ul class="text-body2 text-grey-6">
                    <li><strong>트리거 노드:</strong> 자동화를 시작하는 이벤트 소스 (시간, 이벤트, 조건 기반)</li>
                    <li><strong>처리 노드:</strong> 데이터 변환, 조건 판단, 로직 처리 (IF/ELSE, 계산, 집계 등)</li>
                    <li><strong>액션 노드:</strong> 최종 실행 동작 (디바이스 제어, 패널 업데이트, 알림 등)</li>
                  </ul>
                </div>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">노드 연결</div>
                  <p class="text-body2 text-grey-6">노드는 입력 소켓과 출력 소켓을 통해 연결됩니다. 데이터는 노드 간 소켓을 통해 흐르며, 각 노드는 입력 데이터를 처리하여 출력 데이터를 생성합니다.</p>
                </div>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">복합 처리</div>
                  <ul class="text-body2 text-grey-6">
                    <li>여러 트리거 노드 연결 가능 (OR, AND 조건)</li>
                    <li>병렬 처리 및 분기 처리 지원</li>
                    <li>데이터 병합 및 집계 기능</li>
                    <li>모든 노드는 복합 처리 가능</li>
                  </ul>
                </div>
              </div>
            </q-tab-panel>

            <!-- 노드 타입 탭 -->
            <q-tab-panel name="node-types">
              <div class="q-mb-lg">
                <div class="text-h6 q-mb-md">
                  <q-icon name="category" size="24px" class="q-mr-sm" />
                  노드 타입 상세
                </div>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">트리거 노드</div>
                  <ul class="text-body2 text-grey-6">
                    <li>시간 기반: 스케줄, 크론 표현식</li>
                    <li>이벤트 기반: 디바이스 상태 변경, 센서 값 변화</li>
                    <li>조건 기반: 특정 값 도달, 임계값 초과</li>
                  </ul>
                </div>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">처리 노드</div>
                  <ul class="text-body2 text-grey-6">
                    <li>조건 판단: IF/ELSE, 비교 연산</li>
                    <li>데이터 변환: 수학 연산, 문자열 처리</li>
                    <li>로직 처리: AND/OR, NOT, 지연(Delay)</li>
                    <li>데이터 집계: 평균, 합계, 최대/최소</li>
                  </ul>
                </div>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">액션 노드</div>
                  <ul class="text-body2 text-grey-6">
                    <li>디바이스 제어: 명령 전송, 상태 변경</li>
                    <li>패널 업데이트: 데이터 갱신, 시각화</li>
                    <li>알림 발송: 이메일, SMS, 푸시</li>
                    <li>다른 규칙 트리거: 체인 연결</li>
                  </ul>
                </div>
              </div>
            </q-tab-panel>

            <!-- 전역 모듈 탭 -->
            <q-tab-panel name="global-modules">
              <div class="q-mb-lg">
                <div class="text-h6 q-mb-md">
                  <q-icon name="extension" size="24px" class="q-mr-sm" />
                  전역 모듈로서의 노드
                </div>
                <p class="text-body2 text-grey-7 q-mb-md">NEXA 시스템에서 전역으로 사용 가능한 모듈은 차트, 블럭, 패널, 그리고 자동화 노드입니다. 자동화 노드는 다른 모듈과 교차하여 사용할 수 있는 전역 모듈로 분류됩니다.</p>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">전역 모듈 구조</div>
                  <ul class="text-body2 text-grey-6">
                    <li><strong>차트:</strong> 데이터 시각화 컴포넌트 (재사용 가능)</li>
                    <li><strong>블럭:</strong> UI 구성 요소 (재사용 가능)</li>
                    <li><strong>패널:</strong> NEXA BOARD에서 사용하는 독립적인 표시 단위</li>
                    <li><strong>노드:</strong> 로직 처리 단위 (전역 모듈)</li>
                  </ul>
                </div>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">노드의 전역 모듈 특성</div>
                  <ul class="text-body2 text-grey-6">
                    <li><strong>재사용성:</strong> 처리 노드는 패널, 차트, 블럭에서도 활용 가능</li>
                    <li><strong>일관성:</strong> 동일한 로직을 여러 곳에서 공유</li>
                    <li><strong>확장성:</strong> 노드 기반으로 새로운 기능 추가 용이</li>
                    <li><strong>통합성:</strong> Automation과 다른 모듈 간 데이터/로직 공유</li>
                  </ul>
                </div>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">노드 분류</div>
                  <ul class="text-body2 text-grey-6">
                    <li><strong>트리거 노드:</strong> Automation 전용 (이벤트 시작)</li>
                    <li><strong>처리 노드:</strong> 공통 사용 가능 (데이터 변환, 계산 등)</li>
                    <li><strong>액션 노드:</strong> Automation 전용 (최종 실행)</li>
                  </ul>
                </div>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">구현 접근 방식</div>
                  <ul class="text-body2 text-grey-6">
                    <li><strong>1단계:</strong> Automation 노드를 내부적으로 모듈화 (노드 로직과 UI 분리)</li>
                    <li><strong>2단계:</strong> 공통 노드 식별 및 추출 (데이터 변환, 계산 등 재사용 가능한 노드)</li>
                    <li><strong>3단계:</strong> 다른 모듈과 통합 (패널에서 공통 노드 사용, 차트에서 데이터 처리 노드 활용)</li>
                  </ul>
                </div>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">사용 예시</div>
                  <ul class="text-body2 text-grey-6">
                    <li>패널에서 데이터 변환 노드 사용: 센서 값을 다른 단위로 변환하여 표시</li>
                    <li>차트에서 집계 노드 사용: 데이터를 평균, 합계로 집계하여 차트로 표시</li>
                    <li>블럭에서 계산 노드 사용: 여러 입력값을 계산하여 결과 표시</li>
                  </ul>
                </div>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">구현 시 고려사항</div>
                  <ul class="text-body2 text-grey-6">
                    <li>노드 실행 컨텍스트 분리 (Automation vs 실시간 표시)</li>
                    <li>데이터 흐름 관리 (비동기 vs 동기)</li>
                    <li>상태 관리 (노드 실행 상태, 에러 처리)</li>
                    <li>성능 최적화 (노드 실행 오버헤드)</li>
                  </ul>
                </div>
              </div>
            </q-tab-panel>

            <!-- 작업 관리 시스템 탭 -->
            <q-tab-panel name="workflow">
              <div class="q-mb-lg">
                <div class="text-h6 q-mb-md">
                  <q-icon name="work" size="24px" class="q-mr-sm" />
                  작업 관리 시스템
                </div>
                <p class="text-body2 text-grey-7 q-mb-md">ERP에서 작업 문서를 등록하고, Automation에서 워크플로우로 변환하여, NEXA BOARD에서 실행하는 시스템입니다.</p>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">전체 워크플로우</div>
                  <ul class="text-body2 text-grey-6">
                    <li><strong>1단계 - 문서 등록 (ERP):</strong> 프로젝트 및 작업 문서 등록, 제원 입력, 수량 설정</li>
                    <li><strong>2단계 - 자동화 로직 관리 (AUTOMATION):</strong> 작업 항목을 노드로 변환, 워크플로우 구성, 장비 매핑</li>
                    <li><strong>3단계 - 실행 (NEXA BOARD):</strong> 워크플로우 템플릿 불러오기, 실행 및 모니터링</li>
                  </ul>
                </div>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">작업 방식</div>
                  <ul class="text-body2 text-grey-6">
                    <li><strong>문서 기반 방식:</strong> ERP에서 작업 문서를 먼저 등록한 후 워크플로우 구성</li>
                    <li><strong>직접 구성 방식:</strong> ERP 문서 없이 Automation에서 직접 워크플로우 구성</li>
                  </ul>
                </div>

                <div class="q-mb-md">
                  <div class="text-subtitle1 q-mb-sm">주요 노드 타입</div>
                  <ul class="text-body2 text-grey-6">
                    <li><strong>작업 실행 노드:</strong> 제원 데이터를 장비 명령으로 변환하여 전송</li>
                    <li><strong>수량 카운트 노드:</strong> 작업 완료 수량을 자동/수동으로 카운트</li>
                  </ul>
                </div>
              </div>
            </q-tab-panel>

            <!-- 목표 및 효과 탭 -->
            <q-tab-panel name="goals">
              <div class="q-mb-lg">
                <div class="text-h6 q-mb-md">
                  <q-icon name="flag" size="24px" class="q-mr-sm" />
                  프로젝트 목표
                </div>
                <ul class="text-body2 text-grey-6 q-mb-lg">
                  <li>작업 시간 단축</li>
                  <li>작업 정확도 향상</li>
                  <li>사용자 간 기술 편차 감소</li>
                  <li>작업자 간 역할 분담 및 소통 효율화</li>
                </ul>

                <div class="text-h6 q-mb-md">
                  <q-icon name="star" size="24px" class="q-mr-sm" />
                  주요 장점
                </div>
                <ul class="text-body2 text-grey-6 q-mb-lg">
                  <li>시각적 로직 구성으로 이해도 향상</li>
                  <li>재사용 가능한 노드로 개발 효율성 증대</li>
                  <li>실시간 검증으로 오류 사전 방지</li>
                  <li>모듈화된 구조로 유지보수 용이</li>
                </ul>

                <div class="text-h6 q-mb-md">
                  <q-icon name="analytics" size="24px" class="q-mr-sm" />
                  현실성 및 효율성
                </div>
                <p class="text-body2 text-grey-6">노드 기반 자동화 시스템은 블렌더 등에서 검증된 패턴을 적용하여 현실적으로 구현 가능합니다. 특히 처리 노드를 전역 모듈로 활용함으로써 시스템 전반의 효율성을 높일 수 있습니다.</p>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import NodeCanvas from 'src/components/nexa-node/NodeCanvas.vue'
import VirtualCanvas from 'src/components/nexa-node/VirtualCanvas.vue'
import VirtualIotDevice from 'src/components/nexa-node/VirtualIotDevice.vue'
import { nodeAdapter } from 'src/services/device/VirtualNodeAdapter'
import { useNexaNodeStore } from 'src/stores/nexaNodeStore'

const mainTab = ref('basic')
const nexNodeStore = useNexaNodeStore()
const { canvasNodes, canvasLinks, canvasReady, isSimulatorVisible } = storeToRefs(nexNodeStore)

const canvasHintText = computed(() => {
  if (canvasReady.value) {
    return ''
  }
  return '왼쪽 사이드바의 [New]를 눌러 기본 다이어그램 캔버스를 생성하세요.'
})

const closeSimulator = () => nexNodeStore.closeSimulator()

onMounted(() => {
  if (nodeAdapter && typeof nodeAdapter.init === 'function') {
    nodeAdapter.init()
    console.log('✨ NEXA_SYSTEM: Virtual Node Adapter 연결 완료')
  }
})
</script>

<style lang="scss" scoped>
.automation-page {
  background: var(--nexa-background);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.automation-page > .q-pa-lg {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.page-header {
  border-bottom: 1px solid var(--nexa-border-color);
  padding-bottom: 16px;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.canvas-hint {
  color: var(--nexa-text-secondary);
  margin-top: 0.5rem;
  font-weight: 500;
}

.canvas-stage {
  width: 100%;
  flex: 1;
  margin-top: 0;
  min-height: 0;
  display: flex;
}

.canvas-full {
  flex: 1;
  min-height: 0;
  display: flex;
}

.doc-stage {
  width: 100%;
  margin-top: 24px;
}

.simulator-overlay {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.simulator-header {
  border-bottom: 1px solid var(--nexa-border-color);
  padding-bottom: 16px;
}

.simulator-body {
  flex: 1;
  gap: 16px;
}

.simulator-canvas {
  flex: 1;
  min-height: 360px;
}

.simulator-device {
  width: 320px;
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
