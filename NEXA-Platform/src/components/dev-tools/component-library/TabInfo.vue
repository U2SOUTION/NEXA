<!-- TabInfo.vue
  탭별 정보 컴포넌트
  각 탭에 대한 통계, 목적, 특징, 기능 등을 표시
-->

<template>
  <div class="tab-info">
    <q-scroll-area class="tab-info-scroll">
      <div class="tab-info-content q-pa-lg">
        <!-- 헤더 -->
        <div class="tab-header q-mb-lg">
          <div class="row items-center q-gutter-sm">
            <q-icon :name="tabInfo.icon" size="32px" color="primary" />
            <div class="col">
              <div class="text-h4">{{ tabInfo.title }}</div>
              <div class="text-body2 text-grey-7 q-mt-xs">{{ tabInfo.subtitle }}</div>
            </div>
          </div>
        </div>

        <!-- 통계 카드 -->
        <div class="statistics-section q-mb-lg">
          <div class="text-h6 q-mb-md">
            <q-icon name="bar_chart" size="20px" class="q-mr-xs" />
            통계
          </div>
          <div class="row q-gutter-md">
            <q-card v-for="(stat, index) in tabInfo.statistics" :key="index" class="stat-card col-auto">
              <q-card-section>
                <div class="stat-label text-caption text-grey-7 q-mb-xs">{{ stat.label }}</div>
                <div class="stat-value text-h4 text-primary">{{ stat.value }}</div>
                <div v-if="stat.description" class="stat-description text-caption text-grey-7 q-mt-xs">
                  {{ stat.description }}
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- 목적 -->
        <div class="purpose-section q-mb-lg">
          <div class="text-h6 q-mb-md">
            <q-icon name="flag" size="20px" class="q-mr-xs" />
            목적
          </div>
          <q-card class="info-card">
            <q-card-section>
              <p class="text-body1">{{ tabInfo.purpose }}</p>
            </q-card-section>
          </q-card>
        </div>

        <!-- 특징 -->
        <div class="features-section q-mb-lg">
          <div class="text-h6 q-mb-md">
            <q-icon name="star" size="20px" class="q-mr-xs" />
            특징
          </div>
          <q-card class="info-card">
            <q-card-section>
              <ul class="features-list">
                <li v-for="(feature, index) in tabInfo.features" :key="index" class="text-body1 q-mb-sm">
                  <q-icon name="check_circle" size="18px" color="positive" class="q-mr-sm" />
                  {{ feature }}
                </li>
              </ul>
            </q-card-section>
          </q-card>
        </div>

        <!-- 기능 -->
        <div class="functions-section">
          <div class="text-h6 q-mb-md">
            <q-icon name="settings" size="20px" class="q-mr-xs" />
            주요 기능
          </div>
          <div class="row q-gutter-md">
            <q-card v-for="(func, index) in tabInfo.functions" :key="index" class="function-card col-12 col-md-6">
              <q-card-section>
                <div class="row items-center q-mb-sm">
                  <q-icon :name="func.icon" size="24px" color="primary" class="q-mr-sm" />
                  <div class="text-h6">{{ func.title }}</div>
                </div>
                <div class="text-body2 text-grey-7">{{ func.description }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'

const props = defineProps({
  tabName: {
    type: String,
    required: true,
  },
  statistics: {
    type: Object,
    default: () => ({}),
  },
})

onMounted(() => {
  console.log('[TabInfo] 마운트됨, tabName:', props.tabName, 'statistics:', props.statistics)
})

// 탭별 정보 정의
const tabInfoMap = {
  all: {
    title: '전체',
    subtitle: '모든 컴포넌트를 한눈에 확인',
    icon: 'list',
    purpose: '프로젝트 내 모든 Vue 컴포넌트를 평면적으로 나열하여 전체 목록을 한눈에 확인할 수 있습니다.',
    features: [
      '모든 컴포넌트를 알파벳 순으로 정렬하여 표시',
      '검색 기능을 통해 빠르게 원하는 컴포넌트 찾기',
      '컴포넌트 경로와 기본 정보를 바로 확인',
      '컴포넌트 선택 시 상세 정보 표시',
    ],
    functions: [
      {
        title: '전체 목록 보기',
        icon: 'view_list',
        description: '프로젝트 내 모든 Vue 컴포넌트를 하나의 목록으로 확인',
      },
      {
        title: '검색 및 필터링',
        icon: 'search',
        description: '컴포넌트 이름이나 경로로 빠르게 검색',
      },
      {
        title: '상세 정보 확인',
        icon: 'info',
        description: '컴포넌트 선택 시 경로, 분류 정보 등 상세 내용 확인',
      },
    ],
  },
  systems: {
    title: '시스템',
    subtitle: 'NEXA 시스템 기준 논리적 분류',
    icon: 'apps',
    purpose: 'NEXA의 중요한 시스템(부품 관리, 디바이스 관리, 대시보드 등)을 기준으로 컴포넌트를 논리적으로 분류하여 관리합니다. 디렉토리 구조와 무관하게 시스템의 중요성과 역할에 따라 직접 분류합니다.',
    features: [
      'NEXA 시스템 구조를 반영한 논리적 분류',
      '디렉토리 구조 변경에 영향받지 않는 안정적인 분류',
      '하위 카테고리 구조를 통한 세밀한 분류',
      '시스템별 컴포넌트 그룹화 및 관리',
      '수동 관리로 정확한 분류 보장',
    ],
    functions: [
      {
        title: '시스템별 분류',
        icon: 'category',
        description: '부품 관리, 디바이스 관리 등 NEXA 시스템별로 컴포넌트 분류',
      },
      {
        title: '하위 카테고리 관리',
        icon: 'folder_tree',
        description: '각 시스템 내 세부 카테고리로 더 정밀한 분류',
      },
      {
        title: '의존성 다이어그램',
        icon: 'account_tree',
        description: '시스템 내 컴포넌트 간 의존성 관계 시각화',
      },
      {
        title: '수동 분류 관리',
        icon: 'edit',
        description: '중요한 시스템을 기준으로 직접 분류 관리',
      },
    ],
  },
  directory: {
    title: '디렉토리',
    subtitle: '파일 시스템 구조 기반 자동 분류',
    icon: 'folder',
    purpose: '실제 파일 시스템의 디렉토리 구조를 기반으로 컴포넌트를 자동으로 분류합니다. 깊이 설정을 통해 원하는 수준의 디렉토리 구조를 확인할 수 있습니다.',
    features: [
      '디렉토리 구조를 그대로 반영한 자동 분류',
      '깊이 설정으로 원하는 수준의 구조 확인',
      '실제 파일 위치와 일치하는 분류',
      '디렉토리 구조 변경 시 자동 반영',
      '의존성 다이어그램으로 컴포넌트 관계 시각화',
    ],
    functions: [
      {
        title: '자동 스캔',
        icon: 'refresh',
        description: '파일 시스템을 스캔하여 자동으로 컴포넌트 분류',
      },
      {
        title: '깊이 조절',
        icon: 'layers',
        description: '1단계부터 전체까지 원하는 깊이로 구조 확인',
      },
      {
        title: '의존성 분석',
        icon: 'account_tree',
        description: '카테고리 내 컴포넌트 간 의존성 관계 분석 및 시각화',
      },
      {
        title: '실시간 반영',
        icon: 'sync',
        description: '디렉토리 구조 변경 시 자동으로 분류 업데이트',
      },
    ],
  },
  analysis: {
    title: '체계분석',
    subtitle: '다차원 분류 + 적합성 평가',
    icon: 'analytics',
    purpose: '컴포넌트를 6가지 차원(기능별, 위치별, 용도별, 관계별, 범위별, 계층별)으로 분류하고, 각 컴포넌트의 적합성을 평가합니다. 이를 통해 컴포넌트의 올바른 분류와 구조 개선을 제안합니다.',
    features: [
      '6가지 차원으로 컴포넌트 다차원 분류',
      '컴포넌트 적합성 평가 및 점수 산출',
      '규칙 위반 감지 및 개선 제안',
      '분류 체계 기반 자동 검증',
      '구조 개선 제안 및 통계 분석',
    ],
    functions: [
      {
        title: '다차원 분류',
        icon: 'account_tree',
        description: '기능, 위치, 용도 등 6가지 차원으로 컴포넌트 분류',
      },
      {
        title: '적합성 평가',
        icon: 'assessment',
        description: '컴포넌트의 분류 적합성과 구조 적합성 평가',
      },
      {
        title: '규칙 검사',
        icon: 'verified',
        description: '정의된 규칙에 따른 컴포넌트 구조 검사',
      },
      {
        title: '개선 제안',
        icon: 'lightbulb',
        description: '검사 결과를 바탕으로 구조 개선 방안 제안',
      },
    ],
  },
}

// 통계 데이터를 배열로 변환
const statisticsArray = computed(() => {
  if (!props.statistics || typeof props.statistics !== 'object') {
    return []
  }
  // 객체를 배열로 변환
  return Object.values(props.statistics).filter((stat) => stat && typeof stat === 'object')
})

// 현재 탭 정보
const tabInfo = computed(() => {
  const info = tabInfoMap[props.tabName] || tabInfoMap.all
  return {
    ...info,
    statistics: statisticsArray.value,
  }
})
</script>

<style lang="scss" scoped>
.tab-info {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-background);
}

.tab-info-scroll {
  flex: 1;
}

.tab-info-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.tab-header {
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--nexa-border-color);
}

.statistics-section,
.purpose-section,
.features-section,
.functions-section {
  margin-bottom: 2rem;
}

.stat-card {
  min-width: 200px;
  background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
}

.stat-label {
  font-weight: 500;
}

.stat-value {
  font-weight: 600;
}

.stat-description {
  margin-top: 0.5rem;
}

.info-card {
  background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: flex-start;
  }
}

.function-card {
  background-color: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--nexa-border-hover);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>

