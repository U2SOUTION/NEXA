<template>
  <q-page class="q-pa-lg">
    <div class="page-header q-mb-lg">
      <h1 class="text-h4 text-primary q-mb-sm">NEXA TEACH</h1>
      <p class="text-body1 text-grey-7">액션 녹화 및 재생 시스템</p>
      <p class="text-caption text-grey-6 q-mt-xs">Learning from Demonstration (LfD) & Programming by Demonstration (PbD) 기반 자동화 플랫폼</p>
    </div>

    <!-- 메인 탭 -->
    <q-tabs v-model="mainTab" class="q-mb-lg" align="left" dense>
      <q-tab name="overview" label="개요" icon="info" />
      <q-tab name="architecture" label="시스템 아키텍처" icon="architecture" />
      <q-tab name="context" label="맥락 정보" icon="account_tree" />
      <q-tab name="recording" label="액션 녹화" icon="fiber_smart_record" />
      <q-tab name="playback" label="액션 재생" icon="play_arrow" />
      <q-tab name="advanced" label="고급 기능" icon="tune" />
      <q-tab name="integration" label="시스템 통합" icon="hub" />
      <q-tab name="compatibility" label="호환성 관리" icon="update" />
    </q-tabs>

    <q-tab-panels v-model="mainTab" animated>
      <!-- 개요 탭 -->
      <q-tab-panel name="overview">
        <div class="q-mb-lg">
          <div class="text-h6 q-mb-md">
            <q-icon name="info" size="24px" class="q-mr-sm" />
            핵심 개념
          </div>
          <p class="text-body2 text-grey-7 q-mb-md">
            NEXA TEACH는 사용자가 수행하는 모든 동작을 녹화하여 재사용 가능한 매크로로 변환하는 시스템입니다. 이 시스템은 단순한 단축키 대체 기능을 넘어서, <strong>넥사 플랫폼의 핵심 자동화 인프라</strong>로서 역할하며, NEXA BOARD, ERP 시스템, IOT 디바이스 등 모든 시스템을 연결하고 자동화하는 통합
            계층을 제공합니다.
          </p>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">Learning from Demonstration (LfD)</div>
            <p class="text-body2 text-grey-6 q-mb-sm">전문가의 시연을 관찰하고 학습하여 동일한 작업을 수행할 수 있도록 하는 학습 방법입니다.</p>
            <ul class="text-body2 text-grey-6">
              <li><strong>녹화 단계:</strong> 사용자가 직접 시스템을 조작하는 과정을 녹화</li>
              <li><strong>학습 단계:</strong> 녹화된 액션 시퀀스를 분석하고 맥락 정보를 추출</li>
              <li><strong>재생 단계:</strong> 학습된 액션 시퀀스를 재생하여 동일한 작업을 자동으로 수행</li>
            </ul>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">Programming by Demonstration (PbD)</div>
            <p class="text-body2 text-grey-6 q-mb-sm">코드 작성 없이 사용자의 시연을 통해 프로그램을 생성하는 방법입니다.</p>
            <ul class="text-body2 text-grey-6">
              <li><strong>시연:</strong> 사용자가 직접 UI를 조작하여 원하는 작업을 수행</li>
              <li><strong>프로그램 생성:</strong> 시연 과정이 자동으로 액션 시퀀스(프로그램)로 변환</li>
              <li><strong>재사용:</strong> 생성된 액션 시퀀스를 저장하고 재생하여 동일한 작업을 반복 수행</li>
            </ul>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">시스템 목표</div>
            <ul class="text-body2 text-grey-6">
              <li>모든 사용자 액션 녹화: 클릭, 입력, 네비게이션, Store 액션 등 모든 인터랙션 추적</li>
              <li>재사용 가능한 매크로 생성: 녹화된 액션을 저장하고 재생</li>
              <li>고급 자동화 기능: 변수 시스템, 조건부 실행, 액션 편집을 통한 동적 워크플로우 구성</li>
              <li>시스템 통합: NEXA NODE, IOT 디바이스 등 모든 넥사 시스템과의 통합</li>
              <li>통합 자동화 플랫폼: 넥사 플랫폼의 모든 기능을 연결하고 자동화하는 통합 계층 제공</li>
            </ul>
          </div>
        </div>
      </q-tab-panel>

      <!-- 시스템 아키텍처 탭 -->
      <q-tab-panel name="architecture">
        <div class="q-mb-lg">
          <div class="text-h6 q-mb-md">
            <q-icon name="architecture" size="24px" class="q-mr-sm" />
            전체 구조
          </div>
          <p class="text-body2 text-grey-7 q-mb-md">NEXA TEACH는 액션 녹화, 편집, 재생, 퀵메뉴, 단축키 통합, 그리고 NEXA NODE 및 IOT 통합으로 구성된 통합 자동화 플랫폼입니다.</p>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">주요 컴포넌트</div>
            <ul class="text-body2 text-grey-6">
              <li><strong>액션 녹화 엔진:</strong> 전역 이벤트 리스너, 액션 추출 및 표준화, 맥락 정보 캡처</li>
              <li><strong>액션 편집 시스템:</strong> 액션 수정, 복사, 삽입, 변수 시스템, 조건부 실행</li>
              <li><strong>액션 재생 엔진:</strong> 액션 시퀀스 순차 실행, 변수 해석, 조건 평가, 컨텍스트 복원</li>
              <li><strong>사용자 퀵메뉴 시스템:</strong> 녹화된 액션 저장/관리, 퀵메뉴 UI, 액션 실행</li>
              <li><strong>단축키 시스템:</strong> 퀵메뉴 항목에 단축키 부여, 기존 단축키 시스템과 통합</li>
              <li><strong>NEXA NODE 통합:</strong> 액션 시퀀스 ↔ 노드 그래프 변환, 양방향 동기화</li>
              <li><strong>IOT 통합:</strong> 외부 트리거, 센서 데이터 기반 조건부 실행, 디바이스 제어</li>
            </ul>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">데이터 흐름</div>
            <p class="text-body2 text-grey-6">
              사용자 액션 발생 → 액션 녹화 엔진이 액션 캡처 → 액션을 표준화된 형식으로 변환 → 맥락 정보 캡처 → 액션 시퀀스에 추가 → 녹화 중지 시 액션 시퀀스 저장 → 액션 편집 (선택적) → 사용자 퀵메뉴 항목으로 등록 → 단축키 부여 또는 IOT 트리거 설정 → 액션 재생 엔진이 액션 시퀀스 재생 → 맥락 정보 검증
              및 환경 복원 → 액션 순차 실행
            </p>
          </div>
        </div>
      </q-tab-panel>

      <!-- 맥락 정보 탭 -->
      <q-tab-panel name="context">
        <div class="q-mb-lg">
          <div class="text-h6 q-mb-md">
            <q-icon name="account_tree" size="24px" class="q-mr-sm" />
            맥락 정보 (Context Information)
          </div>
          <p class="text-body2 text-grey-7 q-mb-md">액션 녹화 시 <strong>맥락 정보</strong>는 재생 시 정확한 환경 복원을 위해 매우 중요합니다. 특히 넥사 시스템의 경우 패널, 블럭, 노드, 보드 등의 복잡한 구조와 관계를 추적해야 하므로, 맥락 정보 없이는 정확한 재생이 어렵습니다.</p>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">맥락 정보 분류</div>
            <ul class="text-body2 text-grey-6">
              <li><strong>라우팅 정보:</strong> URL, 라우트 경로, 파라미터, 쿼리</li>
              <li><strong>넥사 핵심 요소:</strong> 보드, 패널, 블럭, 노드의 구성, 관계, 목적</li>
              <li><strong>DOM 구조:</strong> 요소 경로, 계층 구조, 뷰포트 정보</li>
              <li><strong>브라우저 환경:</strong> User Agent, 뷰포트 크기, 디바이스 픽셀 비율</li>
              <li><strong>애플리케이션 상태:</strong> Store 상태, localStorage, 테마, 레이아웃</li>
              <li><strong>사용자 세션:</strong> 세션 ID (보안 고려하여 선택적)</li>
            </ul>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">녹화 옵션</div>
            <p class="text-body2 text-grey-6 q-mb-sm">사용자는 녹화 시작 전 맥락 정보 옵션을 선택할 수 있습니다:</p>
            <ul class="text-body2 text-grey-6">
              <li><strong>최소:</strong> 필수 맥락 정보만 (빠른 녹화, 작은 파일 크기)</li>
              <li><strong>권장:</strong> 일반적인 사용에 적합 (기본값)</li>
              <li><strong>전체:</strong> 모든 맥락 정보 포함 (디버깅, 복잡한 시나리오)</li>
              <li><strong>사용자 정의:</strong> 개별 옵션 선택</li>
            </ul>
          </div>
        </div>
      </q-tab-panel>

      <!-- 액션 녹화 탭 -->
      <q-tab-panel name="recording">
        <div class="q-mb-lg">
          <div class="text-h6 q-mb-md">
            <q-icon name="fiber_smart_record" size="24px" class="q-mr-sm" />
            액션 녹화 엔진
          </div>
          <p class="text-body2 text-grey-7 q-mb-md">액션 녹화 엔진은 사용자의 모든 인터랙션을 추적하고 표준화된 형식으로 변환하여 저장합니다.</p>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">녹화 가능한 액션 타입</div>
            <ul class="text-body2 text-grey-6">
              <li><strong>click:</strong> 마우스 클릭</li>
              <li><strong>input:</strong> 입력 필드 변경</li>
              <li><strong>navigation:</strong> 라우터 네비게이션</li>
              <li><strong>store-action:</strong> Pinia store 액션</li>
              <li><strong>panel-action:</strong> 패널 액션</li>
              <li><strong>keyboard:</strong> 키보드 입력</li>
              <li><strong>drag-drop:</strong> 드래그 앤 드롭</li>
              <li><strong>scroll:</strong> 스크롤</li>
              <li><strong>focus:</strong> 포커스 변경</li>
              <li><strong>custom:</strong> 커스텀 액션</li>
            </ul>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">액션 데이터 구조</div>
            <p class="text-body2 text-grey-6">각 액션은 고유 ID, 타입, 타임스탬프, 대상 정보, 파라미터, 맥락 정보를 포함합니다. 액션 시퀀스는 이러한 액션들의 배열로 구성되며, 이름, 설명, 생성일시, 수정일시, 버전 정보를 포함합니다.</p>
          </div>
        </div>
      </q-tab-panel>

      <!-- 액션 재생 탭 -->
      <q-tab-panel name="playback">
        <div class="q-mb-lg">
          <div class="text-h6 q-mb-md">
            <q-icon name="play_arrow" size="24px" class="q-mr-sm" />
            액션 재생 엔진
          </div>
          <p class="text-body2 text-grey-7 q-mb-md">액션 재생 엔진은 저장된 액션 시퀀스를 순차적으로 실행하며, 맥락 정보를 검증하고 환경을 복원합니다.</p>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">재생 프로세스</div>
            <ul class="text-body2 text-grey-6">
              <li><strong>맥락 검증:</strong> 녹화 시점의 맥락 정보와 현재 환경 비교</li>
              <li><strong>환경 복원:</strong> 라우팅, Store 상태, 레이아웃 등 환경 복원</li>
              <li><strong>변수 해석:</strong> 액션 시퀀스 내 변수를 실제 값으로 치환</li>
              <li><strong>조건 평가:</strong> 조건부 실행 로직 평가 및 분기</li>
              <li><strong>액션 실행:</strong> 각 액션을 순차적으로 실행</li>
              <li><strong>에러 처리:</strong> 실행 중 오류 발생 시 복구 또는 중단</li>
            </ul>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">재생 전략</div>
            <p class="text-body2 text-grey-6">재생 시 요소를 찾기 위해 다중 전략을 사용합니다: ID 기반 → 컴포넌트 경로 → CSS 셀렉터 → 텍스트 매칭 → 위치 기반 순서로 시도하며, 실패 시 사용자에게 수동 매핑을 요청할 수 있습니다.</p>
          </div>
        </div>
      </q-tab-panel>

      <!-- 고급 기능 탭 -->
      <q-tab-panel name="advanced">
        <div class="q-mb-lg">
          <div class="text-h6 q-mb-md">
            <q-icon name="tune" size="24px" class="q-mr-sm" />
            고급 자동화 기능
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">액션 편집</div>
            <ul class="text-body2 text-grey-6">
              <li>액션 수정, 삭제, 복사, 재배열</li>
              <li>다른 녹화에서 부분 요소 복사 및 삽입</li>
              <li>액션 시퀀스 병합 및 분할</li>
              <li>액션 그룹화 및 주석 추가</li>
            </ul>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">변수 시스템</div>
            <p class="text-body2 text-grey-6 q-mb-sm">동적 값을 사용하기 위한 변수 시스템을 제공합니다:</p>
            <ul class="text-body2 text-grey-6">
              <li><strong>변수 타입:</strong> 문자열, 숫자, 객체, DOM/Nexa 요소</li>
              <li><strong>변수 스코프:</strong> 전역, 시퀀스, 액션 레벨</li>
              <li><strong>변수 소스:</strong> 사용자 입력, IOT 이벤트, 계산 결과, 다른 액션의 출력</li>
            </ul>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">조건부 실행</div>
            <ul class="text-body2 text-grey-6">
              <li><strong>IF/ELSE:</strong> 조건에 따른 분기 실행</li>
              <li><strong>반복문:</strong> WHILE, FOR 루프를 통한 반복 실행</li>
              <li><strong>에러 처리:</strong> TRY-CATCH를 통한 예외 처리</li>
              <li><strong>조건 빌더:</strong> 시각적 UI를 통한 조건 구성</li>
            </ul>
          </div>
        </div>
      </q-tab-panel>

      <!-- 시스템 통합 탭 -->
      <q-tab-panel name="integration">
        <div class="q-mb-lg">
          <div class="text-h6 q-mb-md">
            <q-icon name="hub" size="24px" class="q-mr-sm" />
            시스템 통합
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">NEXA NODE 연동</div>
            <p class="text-body2 text-grey-6 q-mb-sm">액션 시퀀스를 노드 그래프로 변환하여 시각적으로 편집할 수 있습니다:</p>
            <ul class="text-body2 text-grey-6">
              <li>액션 시퀀스 ↔ 노드 그래프 양방향 변환</li>
              <li>노드 기반 시각적 편집</li>
              <li>실시간 동기화</li>
              <li>하이브리드 워크플로우 (일부는 녹화, 일부는 노드로 구성)</li>
            </ul>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">IOT 통합</div>
            <p class="text-body2 text-grey-6 q-mb-sm">외부 IOT 시스템과의 통합을 제공합니다:</p>
            <ul class="text-body2 text-grey-6">
              <li><strong>외부 트리거:</strong> 웹훅, MQTT, HTTP API, 센서 데이터, 스케줄</li>
              <li><strong>디바이스 제어:</strong> IOT 디바이스 제어 액션</li>
              <li><strong>실시간 이벤트:</strong> 이벤트 스트림을 통한 실시간 자동화</li>
              <li><strong>조건부 실행:</strong> 센서 데이터를 조건으로 사용</li>
            </ul>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">넥사 플랫폼 통합</div>
            <ul class="text-body2 text-grey-6">
              <li><strong>NEXA BOARD:</strong> 보드 구성, 패널 배치, 레이아웃 변경 자동화</li>
              <li><strong>ERP 시스템:</strong> 프로젝트 워크플로우, 부품 관리 자동화</li>
              <li><strong>단축키 시스템:</strong> 기존 단축키 시스템과 통합, 동적 액션 생성</li>
            </ul>
          </div>
        </div>
      </q-tab-panel>

      <!-- 호환성 관리 탭 -->
      <q-tab-panel name="compatibility">
        <div class="q-mb-lg">
          <div class="text-h6 q-mb-md">
            <q-icon name="update" size="24px" class="q-mr-sm" />
            시스템 업데이트 및 호환성 관리
          </div>
          <p class="text-body2 text-grey-7 q-mb-md">시스템 업데이트로 인한 UI 변경이나 맥락 정보 변경에 대응하기 위한 호환성 관리 시스템입니다.</p>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">버전 관리</div>
            <ul class="text-body2 text-grey-6">
              <li>액션 시퀀스 버전 정보 저장</li>
              <li>시스템 버전과의 호환성 추적</li>
              <li>자동 마이그레이션 지원</li>
            </ul>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">요소 찾기 전략</div>
            <p class="text-body2 text-grey-6 q-mb-sm">재생 시 요소를 찾기 위해 다중 전략을 사용합니다:</p>
            <ul class="text-body2 text-grey-6">
              <li>ID 기반 찾기 (최우선)</li>
              <li>컴포넌트 경로 기반 찾기</li>
              <li>CSS 셀렉터 기반 찾기</li>
              <li>텍스트 매칭</li>
              <li>위치 기반 찾기 (최후 수단)</li>
            </ul>
          </div>

          <div class="q-mb-md">
            <div class="text-subtitle1 q-mb-sm">호환성 체크</div>
            <ul class="text-body2 text-grey-6">
              <li>자동 호환성 검사</li>
              <li>호환성 문제 감지 시 사용자에게 알림</li>
              <li>수동 요소 재매핑 UI 제공</li>
              <li>호환성 문제 해결 가이드 제공</li>
            </ul>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const mainTab = ref('overview')
</script>

<style lang="scss" scoped>
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
