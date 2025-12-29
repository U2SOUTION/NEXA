<!-- DevGuideList.vue
  개발 가이드 샘플 목록 컴포넌트
  최근 사용, 즐겨찾기, 전체 샘플 탭 포함
-->
<template>
  <div class="dev-guide-list">
    <q-scroll-area class="list-scroll-area">
      <!-- 샘플 모음 아코디언 (Phase 1-3) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="style" label="샘플 모음" default-opened class="samples-expansion">
          <q-tabs v-model="activeTab" dense class="samples-tabs" @update:model-value="handleTabChange">
            <q-tab name="all">
              <q-icon name="list" class="q-mr-xs" />
              <span>전체</span>
            </q-tab>
            <q-tab name="recent">
              <q-icon name="schedule" class="q-mr-xs" />
              <span>최근</span>
            </q-tab>
            <q-tab name="favorite">
              <q-icon name="star" class="q-mr-xs" />
              <span>즐겨찾기</span>
            </q-tab>
          </q-tabs>

          <!-- 컨트롤 버튼 영역 -->
          <div class="tree-controls q-px-sm q-pt-xs q-pb-xs">
            <div class="row q-gutter-xs items-center">
              <!-- 뷰 모드 토글 -->
              <q-btn
                flat
                dense
                size="sm"
                :icon="currentViewMode === 'flat' ? 'view_list' : 'account_tree'"
                :label="currentViewMode === 'flat' ? '평면 보기' : '계층 보기'"
                :class="{ 'view-mode-toggle-active': currentViewMode === 'hierarchy', 'view-mode-toggle-inactive': currentViewMode === 'flat' }"
                class="view-mode-toggle-btn"
                @click="handleViewModeToggle"
              >
                <q-tooltip>{{ currentViewMode === 'flat' ? '평면 모드' : '계층 모드' }} (클릭하여 전환)</q-tooltip>
              </q-btn>

              <!-- 아코디언 모드 토글 (계층 모드일 때만 표시) -->
              <q-btn
                v-if="currentViewMode === 'hierarchy' && activeTab === 'all'"
                flat
                dense
                size="sm"
                :icon="accordionMode ? 'unfold_less' : 'unfold_more'"
                :label="accordionMode ? '아코디언 ON' : '아코디언 OFF'"
                :class="{ 'accordion-toggle-active': accordionMode, 'accordion-toggle-inactive': !accordionMode }"
                class="accordion-toggle-btn"
                @click="handleAccordionModeToggle"
              >
                <q-tooltip>아코디언 모드 {{ accordionMode ? 'ON' : 'OFF' }} (최상위 폴더 하나만 열기)</q-tooltip>
              </q-btn>

              <!-- 트리 컨트롤 버튼 (계층 모드일 때만 표시) -->
              <q-btn
                v-if="currentViewMode === 'hierarchy' && activeTab === 'all'"
                flat
                dense
                size="sm"
                :icon="isAllExpanded ? 'unfold_less' : 'unfold_more'"
                :label="isAllExpanded ? '모두 접기' : '모두 펴기'"
                :class="{ 'tree-expand-toggle-active': isAllExpanded, 'tree-expand-toggle-inactive': !isAllExpanded }"
                class="tree-expand-toggle-btn"
                @click="toggleExpandAll"
              >
                <q-tooltip>{{ isAllExpanded ? '모든 노드 접기' : '모든 노드 펴기' }}</q-tooltip>
              </q-btn>
            </div>
          </div>

          <q-tab-panels v-model="activeTab" class="samples-tab-panels">
            <!-- 전체 샘플 탭 -->
            <q-tab-panel name="all" class="q-pa-sm">
              <div v-if="listSamples.length > 0" class="samples-list">
                <!-- 평면 분류 모드 -->
                <template v-if="currentViewMode === 'flat'">
                  <div
                    v-for="sample in listSamples"
                    :key="sample.id"
                    :class="['sample-item', { 'sample-item-selected': selectedSample?.id === sample.id }]"
                    @click="
                      () => {
                        console.log('🟢 샘플 클릭:', sample.name)
                        handleSampleSelect(sample)
                      }
                    "
                  >
                    <div class="sample-item-content">
                      <q-icon :name="sample.icon || 'style'" class="sample-icon" />
                      <div class="sample-info">
                        <div class="sample-name">{{ sample.displayName || sample.name }}</div>
                        <div class="sample-category">{{ sample.category }}</div>
                        <div v-if="sample.tags && sample.tags.length > 0" class="sample-tags">
                          <q-chip v-for="tag in sample.tags.slice(0, 3)" :key="tag" dense size="sm">
                            {{ tag }}
                          </q-chip>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- 계층적 분류 모드 (최상위 레벨 > 카테고리 > 샘플) -->
                <template v-else-if="currentViewMode === 'hierarchy'">
                  <!-- q-tree 방식 (테스트용) -->
                  <q-tree
                    v-if="treeNodes && treeNodes.length > 0"
                    :nodes="treeNodes"
                    :expanded="expandedNodes"
                    node-key="id"
                    label-key="label"
                    children-key="children"
                    class="hierarchy-tree"
                    @update:selected="handleTreeNodeSelect"
                    @update:expanded="
                      (expanded) => {
                        console.log('🔴🔴🔴 @update:expanded 이벤트 발생:', expanded)
                        handleTreeExpanded(expanded)
                      }
                    "
                  >
                    <template v-slot:default-header="prop">
                      <div
                        :class="['row items-center full-width', prop.node.sample ? 'tree-file-header' : 'tree-folder-header', prop.node.sample && selectedSample?.id === prop.node.sample.id ? 'tree-file-header-selected' : '']"
                        @click.capture="
                          (e) => {
                            // 파일 노드인 경우 파일 열기
                            if (prop.node.sample) {
                              e.stopPropagation() // q-tree의 확장/축소 방지
                              handleSampleSelect(prop.node.sample)
                            } else {
                              // 폴더 노드인 경우 필터링 처리
                              console.log('🔴🔴🔴 폴더 헤더 클릭 (capture):', prop.node.label, prop.node.id)
                              handleFolderHeaderClick(prop.node)
                            }
                          }
                        "
                        style="pointer-events: auto"
                      >
                        <q-icon v-if="prop.node.icon" :name="prop.node.icon" class="q-mr-sm" />
                        <div class="col">{{ prop.node.label }}</div>
                      </div>
                    </template>
                  </q-tree>

                  <div v-if="!treeNodes || treeNodes.length === 0" class="empty-state">
                    <q-icon name="account_tree" size="48px" class="q-mb-sm" />
                    <div class="empty-message">계층 구조 데이터가 없습니다.</div>
                    <div class="empty-hint">샘플을 로드하면 계층 구조가 표시됩니다.</div>
                  </div>
                </template>
              </div>
              <div v-else class="empty-state">
                <q-icon name="style" size="48px" class="q-mb-sm" />
                <div class="empty-message">샘플이 없습니다.</div>
                <div class="empty-hint">샘플을 등록하면 여기에 표시됩니다.</div>
              </div>
            </q-tab-panel>

            <!-- 최근 사용 탭 -->
            <q-tab-panel name="recent" class="q-pa-sm">
              <div v-if="filteredRecentSamples.length > 0" class="samples-list">
                <div v-for="sample in filteredRecentSamples" :key="sample.id" :class="['sample-item', { 'sample-item-selected': selectedSample?.id === sample.id, 'has-favorite': isFavorite(sample.id) }]" @click="handleSampleSelect(sample)">
                  <div class="sample-item-content">
                    <div class="sample-actions">
                      <q-btn flat dense round :icon="isFavorite(sample.id) ? 'star' : 'star_border'" size="sm" :class="{ 'favorite-btn': true, active: isFavorite(sample.id) }" @click.stop="handleToggleFavorite(sample)" />
                      <q-btn flat dense round icon="close" size="sm" class="delete-btn" @click.stop="handleDeleteRecent(sample.id)" />
                    </div>
                    <q-icon :name="sample.icon || 'style'" class="sample-icon" />
                    <div class="sample-info">
                      <div class="sample-name">{{ sample.displayName || sample.name }}</div>
                      <div class="sample-category">{{ sample.category }}</div>
                      <div v-if="sample.tags && sample.tags.length > 0" class="sample-tags">
                        <q-chip v-for="tag in sample.tags.slice(0, 3)" :key="tag" dense size="sm">
                          {{ tag }}
                        </q-chip>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <q-icon name="schedule" size="48px" class="q-mb-sm" />
                <div class="empty-message">최근 사용한 샘플이 없습니다.</div>
                <div class="empty-hint">샘플을 선택하면 여기에 표시됩니다.</div>
              </div>
            </q-tab-panel>

            <!-- 즐겨찾기 탭 -->
            <q-tab-panel name="favorite" class="q-pa-sm">
              <div v-if="filteredFavoriteSamples.length > 0" class="samples-list">
                <div v-for="sample in filteredFavoriteSamples" :key="sample.id" :class="['sample-item', { 'sample-item-selected': selectedSample?.id === sample.id }]" @click="handleSampleSelect(sample)">
                  <div class="sample-item-content">
                    <div class="sample-actions">
                      <q-btn flat dense round icon="star" size="sm" class="favorite-btn active" @click.stop="handleToggleFavorite(sample)" />
                      <q-btn flat dense round icon="close" size="sm" class="delete-btn" @click.stop="handleDeleteFavorite(sample.id)" />
                    </div>
                    <q-icon :name="sample.icon || 'style'" class="sample-icon" />
                    <div class="sample-info">
                      <div class="sample-name">{{ sample.displayName || sample.name }}</div>
                      <div class="sample-category">{{ sample.category }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <q-icon name="star" size="48px" class="q-mb-sm" />
                <div class="empty-message">즐겨찾기 샘플이 없습니다.</div>
                <div class="empty-hint">최근 샘플 목록에서 별 아이콘을 클릭하여 즐겨찾기에 추가하세요.</div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-expansion-item>
      </div>

      <!-- 코딩 컨벤션 아코디언 (Phase 4: 향후 구현) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="code" label="코딩 컨벤션" class="conventions-expansion">
          <div class="coming-soon-section q-pa-md">
            <div class="coming-soon-content">
              <q-icon name="code" size="48px" class="q-mb-sm" />
              <div class="coming-soon-title">코딩 컨벤션 가이드</div>
              <div class="coming-soon-description">Phase 4에서 구현 예정</div>
              <div class="coming-soon-features q-mt-md">
                <div class="feature-item">
                  <q-icon name="text_fields" size="sm" />
                  <span>네이밍 규칙 샘플</span>
                </div>
                <div class="feature-item">
                  <q-icon name="folder_open" size="sm" />
                  <span>파일 구조 패턴</span>
                </div>
                <div class="feature-item">
                  <q-icon name="code" size="sm" />
                  <span>코드 스타일 가이드</span>
                </div>
              </div>
            </div>
          </div>
        </q-expansion-item>
      </div>

      <!-- 아키텍처 패턴 아코디언 (Phase 5: 향후 구현) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="account_tree" label="아키텍처 패턴" class="patterns-expansion">
          <div class="coming-soon-section q-pa-md">
            <div class="coming-soon-content">
              <q-icon name="account_tree" size="48px" class="q-mb-sm" />
              <div class="coming-soon-title">아키텍처 패턴 가이드</div>
              <div class="coming-soon-description">Phase 5에서 구현 예정</div>
              <div class="coming-soon-features q-mt-md">
                <div class="feature-item">
                  <q-icon name="account_tree" size="sm" />
                  <span>컴포넌트 구조 패턴</span>
                </div>
                <div class="feature-item">
                  <q-icon name="storage" size="sm" />
                  <span>상태 관리 패턴</span>
                </div>
                <div class="feature-item">
                  <q-icon name="hub" size="sm" />
                  <span>통신 패턴</span>
                </div>
                <div class="feature-item">
                  <q-icon name="folder" size="sm" />
                  <span>모듈 구조 패턴</span>
                </div>
              </div>
            </div>
          </div>
        </q-expansion-item>
      </div>

      <!-- 베스트 프랙티스 아코디언 (Phase 6: 향후 구현) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="star" label="베스트 프랙티스" class="best-practices-expansion">
          <div class="coming-soon-section q-pa-md">
            <div class="coming-soon-content">
              <q-icon name="star" size="48px" class="q-mb-sm" />
              <div class="coming-soon-title">베스트 프랙티스 가이드</div>
              <div class="coming-soon-description">Phase 6에서 구현 예정</div>
              <div class="coming-soon-features q-mt-md">
                <div class="feature-item">
                  <q-icon name="error_outline" size="sm" />
                  <span>에러 처리 패턴</span>
                </div>
                <div class="feature-item">
                  <q-icon name="speed" size="sm" />
                  <span>성능 최적화</span>
                </div>
                <div class="feature-item">
                  <q-icon name="accessibility_new" size="sm" />
                  <span>접근성 가이드</span>
                </div>
                <div class="feature-item">
                  <q-icon name="security" size="sm" />
                  <span>보안 가이드</span>
                </div>
              </div>
            </div>
          </div>
        </q-expansion-item>
      </div>

      <!-- 빠른 액세스 섹션 (Phase 6: 향후 구현) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="flash_on" label="빠른 액세스" class="quick-access-expansion">
          <div class="coming-soon-section q-pa-md">
            <div class="coming-soon-content">
              <q-icon name="flash_on" size="48px" class="q-mb-sm" />
              <div class="coming-soon-title">빠른 액세스</div>
              <div class="coming-soon-description">Phase 6에서 구현 예정</div>
              <div class="coming-soon-features q-mt-md">
                <div class="feature-item">
                  <q-icon name="star" size="sm" />
                  <span>자주 사용하는 샘플 (최대 5개)</span>
                </div>
                <div class="feature-item">
                  <q-icon name="history" size="sm" />
                  <span>최근 검색어</span>
                </div>
                <div class="feature-item">
                  <q-icon name="smart_toy" size="sm" />
                  <span>추천 샘플 (AI 기반)</span>
                </div>
              </div>
            </div>
          </div>
        </q-expansion-item>
      </div>

      <!-- 고급 필터 (Phase 6: 향후 구현) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="tune" label="고급 필터" class="advanced-filter-expansion">
          <div class="coming-soon-section q-pa-md">
            <div class="coming-soon-content">
              <q-icon name="tune" size="48px" class="q-mb-sm" />
              <div class="coming-soon-title">고급 필터</div>
              <div class="coming-soon-description">Phase 6에서 구현 예정</div>
              <div class="coming-soon-features q-mt-md">
                <div class="feature-item">
                  <q-icon name="apps" size="sm" />
                  <span>프로젝트별 필터 (Platform, Desktop, Edge, Mobile)</span>
                </div>
                <div class="feature-item">
                  <q-icon name="signal_cellular_alt" size="sm" />
                  <span>난이도 필터 (초급, 중급, 고급)</span>
                </div>
                <div class="feature-item">
                  <q-icon name="label" size="sm" />
                  <span>태그 다중 선택</span>
                </div>
                <div class="feature-item">
                  <q-icon name="sort" size="sm" />
                  <span>정렬 옵션 (이름순, 카테고리순, 최근 수정순, 사용 빈도순)</span>
                </div>
              </div>
            </div>
          </div>
        </q-expansion-item>
      </div>
    </q-scroll-area>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useDevGuide } from 'src/composables/dev-tools/useDevGuide'
import { buildPathTree, getLabelForDirectory } from 'src/utils/path-tree-builder'

defineProps({
  headerHovered: {
    type: Boolean,
    default: false,
  },
})

const {
  activeTab,
  selectedSample,
  recentSamples,
  favoriteSamples,
  samples,
  filteredSamples,
  filteredRecentSamples,
  filteredFavoriteSamples,
  viewMode,
  filterListOnSearch,
  accordionMode,
  handleSampleSelect,
  handleFolderSelect,
  toggleFavorite,
  getLabelForTopLevel,
  handleViewModeChange,
  handleAccordionModeChange,
} = useDevGuide()

// viewMode를 computed로 변환하여 템플릿에서 사용
const currentViewMode = computed(() => viewMode.value)

// 리스트에 표시할 샘플 (필터링 토글에 따라 결정)
const listSamples = computed(() => {
  return filterListOnSearch.value ? filteredSamples.value : samples.value
})

// q-tree용 노드 데이터 변환 (실제 디렉토리 구조 기반)
const treeNodes = computed(() => {
  // filterListOnSearch가 true면 filteredSamples, false면 samples 사용
  const sourceSamples = filterListOnSearch.value ? filteredSamples.value : samples.value

  if (!sourceSamples || sourceSamples.length === 0) {
    return []
  }

  // 경로 기반 트리 구조 생성 (재사용 가능한 유틸리티 사용)
  return buildPathTree(sourceSamples, {
    rootPrefix: 'guides',
    pathKey: 'componentPath',
    iconGetter: () => {
      // 모든 레벨에서 동일한 폴더 아이콘 사용
      return 'folder'
    },
    labelGetter: (dirName, level) => {
      // 레벨 0 (최상위)는 기존 라벨 getter 사용
      if (level === 0) {
        return getLabelForTopLevel(dirName)
      }
      // 그 외는 한글명 getter 사용
      return getLabelForDirectory(dirName, level) || dirName
    },
    onNodeCreate: () => {
      // 노드 생성 시 추가 메타데이터 설정 (필요시)
      // 예: node.customData = ...
    },
  })
})

// 확장 상태 추적 (배열 형태: 확장된 노드 ID들의 배열)
const expandedNodes = ref([])

// 모든 노드 ID 수집 (재귀, 샘플 노드 제외)
function getAllNodeIds(nodes) {
  const ids = []
  for (const node of nodes) {
    // 샘플 노드는 children이 없으므로 제외
    if (!node.sample) {
      ids.push(node.id)
    }
    if (node.children && node.children.length > 0) {
      ids.push(...getAllNodeIds(node.children))
    }
  }
  return ids
}

// 모두 펴기
function expandAll() {
  if (!treeNodes.value || treeNodes.value.length === 0) {
    return
  }
  const allIds = getAllNodeIds(treeNodes.value)
  // Quasar q-tree는 expanded prop으로 배열을 받음 (노드 ID들의 배열)
  expandedNodes.value = [...allIds]
  console.log('🟢 모두 펴기:', expandedNodes.value)
}

// 모두 접기
function collapseAll() {
  expandedNodes.value = []
  console.log('🟢 모두 접기')
}

// 모두 접기/펴기 상태 확인
const isAllExpanded = computed(() => {
  if (!treeNodes.value || treeNodes.value.length === 0) {
    return false
  }
  const allIds = getAllNodeIds(treeNodes.value)
  if (allIds.length === 0) {
    return false
  }
  // 모든 노드가 확장되어 있는지 확인 (배열에 모든 ID가 포함되어 있는지)
  return allIds.every((id) => expandedNodes.value.includes(id))
})

// 모두 접기/펴기 토글
function toggleExpandAll() {
  if (isAllExpanded.value) {
    collapseAll()
  } else {
    expandAll()
  }
}

// 트리 노드 변경 시 초기 상태 설정 (모두 펴기)
watch(
  () => treeNodes.value,
  (newNodes) => {
    if (newNodes && newNodes.length > 0 && expandedNodes.value.length === 0) {
      // 초기 상태는 모두 펴기 (expandedNodes가 비어있을 때만)
      expandAll()
    }
  },
  { immediate: true },
)

// 노드 ID로 노드 찾기 헬퍼 함수
function findNodeById(nodes, targetId) {
  for (const node of nodes) {
    if (node.id === targetId) {
      return node
    }
    if (node.children) {
      const found = findNodeById(node.children, targetId)
      if (found) return found
    }
  }
  return null
}

// q-tree 노드 선택 핸들러
function handleTreeNodeSelect(selectedId) {
  // 선택된 노드에서 샘플 데이터 찾기
  const findSampleInNodes = (nodes) => {
    for (const node of nodes) {
      if (node.id === selectedId && node.sample) {
        handleSampleSelect(node.sample)
        return
      }
      if (node.children) {
        const found = findSampleInNodes(node.children)
        if (found) return found
      }
    }
    return null
  }

  findSampleInNodes(treeNodes.value)
}

// 폴더 헤더 클릭 핸들러 (실제 디렉토리 구조 기반)
function handleFolderHeaderClick(node) {
  console.log('🔴 handleFolderHeaderClick 호출:', node.label, node.id, 'hasSample:', !!node.sample, 'path:', node.path)

  // 샘플 노드는 무시
  if (node.sample) {
    console.log('🔴 샘플 노드이므로 무시')
    return
  }

  // 폴더 노드인 경우 필터링 처리
  console.log('🔴 폴더 노드 클릭, 필터링 처리 시작')

  // 경로 기반 필터링 (모든 레벨 지원)
  if (node.path) {
    console.log('🔴 경로 기반 폴더 선택:', node.path, 'level:', node.level)
    handleFolderSelect({
      type: 'path',
      path: node.path,
      fullPath: node.fullPath,
      level: node.level,
      name: node.name,
      label: node.label,
    })
    return
  }

  // 하위 호환성: 기존 방식 (레벨 0, 1만)
  // 최상위 레벨 폴더인지 확인
  const topLevelNode = treeNodes.value.find((topLevel) => topLevel.id === node.id)
  if (topLevelNode) {
    console.log('🔴 최상위 레벨 폴더 선택 (하위 호환):', topLevelNode.name)
    handleFolderSelect({
      type: 'topLevel',
      name: topLevelNode.name,
    })
    return
  }

  // 카테고리 폴더인지 확인
  for (const topLevel of treeNodes.value) {
    const categoryNode = topLevel.children?.find((cat) => cat.id === node.id)
    if (categoryNode) {
      console.log('🔴 카테고리 폴더 선택 (하위 호환):', categoryNode.name, 'topLevel:', topLevel.name)
      handleFolderSelect({
        type: 'category',
        name: categoryNode.name,
        topLevel: topLevel.name,
      })
      return
    }
  }

  console.log('🔴 폴더를 찾을 수 없음')
}

// q-tree 확장/축소 핸들러 (폴더 클릭 감지)
function handleTreeExpanded(expanded) {
  console.log('🟣 트리 확장/축소 이벤트:', expanded)
  console.log('🟣 이전 확장 상태:', expandedNodes.value)

  // Quasar q-tree의 @update:expanded 이벤트는 배열을 반환 (확장된 노드 ID들의 배열)
  if (!Array.isArray(expanded)) {
    return
  }

  // 이전 상태와 비교하여 새로 확장된 노드만 감지
  const previousExpanded = new Set(expandedNodes.value)

  for (const nodeId of expanded) {
    // 새로 확장된 노드만 처리
    if (!previousExpanded.has(nodeId)) {
      console.log('🟣 새로 확장된 노드 감지:', nodeId)
      const node = findNodeById(treeNodes.value, nodeId)

      if (!node) {
        continue
      }

      // 샘플 노드가 아닌 폴더 노드인 경우에만 필터링 처리
      if (!node.sample) {
        console.log('🟣 폴더 노드 확장:', node.label, node.name, 'path:', node.path)

        // 경로 기반 필터링 (모든 레벨 지원)
        if (node.path) {
          console.log('🟣 경로 기반 폴더 선택:', node.path, 'level:', node.level)
          handleFolderSelect({
            type: 'path',
            path: node.path,
            fullPath: node.fullPath,
            level: node.level,
            name: node.name,
            label: node.label,
          })
          break
        }

        // 하위 호환성: 기존 방식 (레벨 0, 1만)
        // 최상위 레벨 폴더인지 확인
        const topLevelNode = treeNodes.value.find((topLevel) => topLevel.id === node.id)
        if (topLevelNode) {
          console.log('🟣 최상위 레벨 폴더 선택 (하위 호환):', topLevelNode.name)
          handleFolderSelect({
            type: 'topLevel',
            name: topLevelNode.name,
          })
          break
        }

        // 카테고리 폴더인지 확인
        for (const topLevel of treeNodes.value) {
          const categoryNode = topLevel.children?.find((cat) => cat.id === node.id)
          if (categoryNode) {
            console.log('🟣 카테고리 폴더 선택 (하위 호환):', categoryNode.name, 'topLevel:', topLevel.name)
            handleFolderSelect({
              type: 'category',
              name: categoryNode.name,
              topLevel: topLevel.name,
            })
            break
          }
        }
      }
    }
  }

  // 아코디언 모드: 최상위 레벨 폴더(level 0)가 확장되면 다른 최상위 레벨 폴더들을 접기
  if (accordionMode.value) {
    // 모든 최상위 레벨 폴더 ID 수집 (level 0인 노드들)
    const topLevelIds = treeNodes.value
      .filter((node) => node.level === 0 || node.level === undefined) // 레벨 0 또는 레벨 정보가 없는 경우 (하위 호환)
      .map((topLevel) => topLevel.id)

    // 확장된 노드 중 최상위 레벨 폴더 찾기
    const expandedTopLevelIds = expanded.filter((nodeId) => topLevelIds.includes(nodeId))

    // 새로 확장된 최상위 레벨 폴더가 있으면
    if (expandedTopLevelIds.length > 0) {
      // 가장 최근에 확장된 최상위 레벨 폴더 (마지막 항목)
      const newlyExpandedTopLevelId = expandedTopLevelIds[expandedTopLevelIds.length - 1]

      // 다른 최상위 레벨 폴더들의 ID
      const otherTopLevelIds = topLevelIds.filter((id) => id !== newlyExpandedTopLevelId)

      // 최상위 레벨 폴더의 모든 하위 노드 ID 수집 (재귀)
      function getAllChildIds(node) {
        const ids = []
        if (node.children) {
          for (const child of node.children) {
            ids.push(child.id)
            if (child.children) {
              ids.push(...getAllChildIds(child))
            }
          }
        }
        return ids
      }

      // 다른 최상위 레벨 폴더와 그 하위 노드들의 ID
      const otherTopLevelAndChildrenIds = new Set()
      for (const topLevelId of otherTopLevelIds) {
        const topLevelNode = treeNodes.value.find((tl) => tl.id === topLevelId)
        if (topLevelNode) {
          otherTopLevelAndChildrenIds.add(topLevelId)
          getAllChildIds(topLevelNode).forEach((id) => otherTopLevelAndChildrenIds.add(id))
        }
      }

      // 새로 확장된 최상위 레벨 폴더와 그 하위 노드만 유지
      const filteredExpanded = expanded.filter((nodeId) => {
        // 다른 최상위 레벨 폴더나 그 하위 노드면 제거
        return !otherTopLevelAndChildrenIds.has(nodeId)
      })

      expandedNodes.value = filteredExpanded
      console.log('🟢 아코디언 모드: 다른 최상위 폴더 접기', {
        newlyExpandedTopLevelId,
        filteredExpanded,
      })
      return
    }
  }

  // 확장 상태 업데이트 (배열로 저장)
  expandedNodes.value = [...expanded]
}

// 즐겨찾기 확인
function isFavorite(sampleId) {
  return favoriteSamples.value.some((s) => s.id === sampleId)
}

// 탭 변경 핸들러
function handleTabChange(newTab) {
  console.log('🟡 탭 변경:', newTab, '이전 탭:', activeTab.value)
  // activeTab은 useDevGuide에서 관리
}

// 뷰 모드 토글 핸들러
function handleViewModeToggle() {
  const newMode = currentViewMode.value === 'flat' ? 'hierarchy' : 'flat'
  handleViewModeChange(newMode)
}

// 아코디언 모드 토글 핸들러
function handleAccordionModeToggle() {
  const newValue = !accordionMode.value
  handleAccordionModeChange(newValue)
}

// 즐겨찾기 토글
function handleToggleFavorite(sample) {
  console.log('🟠 즐겨찾기 토글:', sample.name, '현재 상태:', isFavorite(sample.id))
  toggleFavorite(sample)
  console.log('🟠 즐겨찾기 토글 후 상태:', isFavorite(sample.id))
}

// 최근 사용에서 삭제
function handleDeleteRecent(sampleId) {
  const index = recentSamples.value.findIndex((s) => s.id === sampleId)
  if (index >= 0) {
    recentSamples.value.splice(index, 1)
  }
}

// 즐겨찾기에서 삭제
function handleDeleteFavorite(sampleId) {
  const index = favoriteSamples.value.findIndex((s) => s.id === sampleId)
  if (index >= 0) {
    favoriteSamples.value.splice(index, 1)
  }
}
</script>

<style lang="scss" scoped>
.dev-guide-list {
  height: 100%;

  .list-scroll-area {
    height: 100%;
  }

  // 트리 컨트롤 버튼
  .tree-controls {
    display: flex;
    align-items: center;
    border-top: 1px solid var(--nexa-border-color);
    border-bottom: 1px solid var(--nexa-border-color);
    padding: 4px;

    .view-mode-toggle-btn,
    .accordion-toggle-btn,
    .tree-expand-toggle-btn {
      font-size: 0.7rem;
      color: var(--nexa-text-secondary);
      padding: 0px 16px 0 10px;
      line-height: 1.2;
      transition:
        color 0.2s ease,
        background-color 0.2s ease;

      // Quasar 기본 스타일 완전 오버라이드
      :deep(.q-btn__wrapper) {
        padding: 0;
        min-height: unset;
        height: auto;
      }

      :deep(.q-btn__content) {
        font-size: 0.8rem;
        padding: 0;
        min-height: unset;
        height: auto;
        line-height: 1.2;
      }

      :deep(.q-icon) {
        font-size: 16px;
        margin-right: 4px;
      }

      :deep(.q-btn__label) {
        font-size: 0.8rem;
        line-height: 1.2;
      }

      &:hover {
        color: var(--nexa-primary);
        background-color: color-mix(in srgb, var(--nexa-primary) 10%, transparent);
      }
    }

    .view-mode-toggle-btn {
      &.view-mode-toggle-active {
        background-color: var(--nexa-button-primary-bg);
        color: var(--nexa-button-primary-text);

        :deep(.q-icon) {
          color: var(--nexa-button-primary-text);
        }
      }

      &.view-mode-toggle-inactive {
        background-color: var(--nexa-surface);
        color: var(--nexa-text-secondary);

        :deep(.q-icon) {
          color: var(--nexa-text-secondary);
        }
      }
    }

    .accordion-toggle-btn {
      &.accordion-toggle-active {
        background-color: var(--nexa-button-primary-bg);
        color: var(--nexa-button-primary-text);

        :deep(.q-icon) {
          color: var(--nexa-button-primary-text);
        }
      }

      &.accordion-toggle-inactive {
        background-color: var(--nexa-surface);
        color: var(--nexa-text-secondary);

        :deep(.q-icon) {
          color: var(--nexa-text-secondary);
        }
      }
    }

    .tree-expand-toggle-btn {
      &.tree-expand-toggle-active {
        background-color: var(--nexa-button-primary-bg);
        color: var(--nexa-button-primary-text);

        :deep(.q-icon) {
          color: var(--nexa-button-primary-text);
        }
      }

      &.tree-expand-toggle-inactive {
        background-color: var(--nexa-surface);
        color: var(--nexa-text-secondary);

        :deep(.q-icon) {
          color: var(--nexa-text-secondary);
        }
      }
    }
  }

  // 트리 스타일은 전역 _tree.scss에서 관리

  // 샘플 아이템 스타일 (최근, 즐겨찾기, 전체 탭의 평면 모드)
  .sample-item {
    .sample-item-content {
      display: flex;
      align-items: center;
      gap: 2px;

      .sample-actions {
        display: flex;
        align-items: center;
        gap: 4px;
        width: 0;
        overflow: hidden;
        opacity: 0;
        transition:
          width 0.2s ease,
          opacity 0.2s ease;
        flex-shrink: 0;
      }

      .sample-icon {
        flex-shrink: 0;
      }

      .sample-info {
        display: flex;
        align-items: center;
        gap: 6px;
        flex: 1;
        min-width: 0;

        .sample-name {
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .sample-category {
          font-size: 0.75rem;
          color: var(--nexa-text-secondary);
          white-space: nowrap;
        }

        .sample-tags {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;

          :deep(.q-chip) {
            margin: 0;
          }
        }
      }
    }

    // 즐겨찾기가 있는 경우 항상 표시
    &.has-favorite {
      .sample-item-content {
        .sample-actions {
          width: auto;
          opacity: 1;
        }
      }
    }

    &:hover {
      .sample-item-content {
        .sample-actions {
          width: auto;
          opacity: 1;
        }
      }
    }

    // 즐겨찾기 버튼 액센트 컬러 적용
    .favorite-btn {
      &.active {
        :deep(.q-icon) {
          color: var(--nexa-accent);
        }
      }
    }
  }
}
</style>
