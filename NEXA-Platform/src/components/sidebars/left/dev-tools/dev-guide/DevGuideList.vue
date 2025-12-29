<!-- DevGuideList.vue
  개발 가이드 샘플 목록 컴포넌트
  최근 사용, 즐겨찾기, 전체 샘플 탭 포함
-->
<template>
  <div class="dev-guide-list">
    <q-scroll-area class="list-scroll-area">
      <!-- 샘플 라이브러리 아코디언 (Phase 1-3) -->
      <div class="accordion-wrapper">
        <q-expansion-item icon="style" label="샘플 라이브러리" default-opened class="samples-expansion">
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
                    node-key="id"
                    label-key="label"
                    children-key="children"
                    default-expand-all
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
                        class="row items-center full-width tree-folder-header"
                        @click.capture="
                          (e) => {
                            // 샘플 노드가 아닌 폴더 노드인 경우에만 필터링 처리
                            if (!prop.node.sample) {
                              console.log('🔴🔴🔴 폴더 헤더 클릭 (capture):', prop.node.label, prop.node.id)
                              // stopPropagation을 제거하여 q-tree의 기본 확장/축소 동작 허용
                              handleFolderHeaderClick(prop.node)
                            }
                          }
                        "
                        style="pointer-events: auto !important"
                      >
                        <q-icon v-if="prop.node.icon" :name="prop.node.icon" class="q-mr-sm" />
                        <div class="col">{{ prop.node.label }}</div>
                      </div>
                    </template>
                    <template v-slot:default-body="prop">
                      <!-- 샘플 노드인 경우 클릭 가능한 아이템으로 렌더링 -->
                      <div v-if="prop.node.sample" :class="['tree-sample-item', { 'tree-sample-item-selected': selectedSample?.id === prop.node.sample.id }]" @click="handleSampleSelect(prop.node.sample)">
                        <div class="tree-sample-item-content">
                          <q-icon :name="prop.node.icon || 'style'" class="tree-sample-icon" />
                          <div class="tree-sample-info">
                            <div class="tree-sample-name">{{ prop.node.label }}</div>
                            <div v-if="prop.node.sample.category" class="tree-sample-category">{{ prop.node.sample.category }}</div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </q-tree>

                  <!-- 기존 아코디언 방식 (주석 처리) -->
                  <!--
                  <div v-if="hierarchicalStructure && hierarchicalStructure.length > 0">
                    <div v-for="topLevel in hierarchicalStructure" :key="topLevel.name" class="top-level-group">
                      <q-expansion-item :label="topLevel.label" :icon="topLevel.icon" class="top-level-expansion">
                        <div v-for="category in topLevel.categories" :key="category.name" class="accordion-wrapper">
                          <q-expansion-item :label="category.name" :icon="category.icon" class="category-expansion">
                            <div v-for="sample in category.samples" :key="sample.id" :class="['sample-item', { 'sample-item-selected': selectedSample?.id === sample.id }]" @click="handleSampleSelect(sample)">
                              <div class="sample-item-content">
                                <q-icon :name="sample.icon || 'style'" class="sample-icon" />
                                <div class="sample-info">
                                  <div class="sample-name">{{ sample.displayName || sample.name }}</div>
                                </div>
                              </div>
                            </div>
                          </q-expansion-item>
                        </div>
                      </q-expansion-item>
                    </div>
                  </div>
                  -->
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
import { computed, ref } from 'vue'
import { useDevGuide } from 'src/composables/dev-tools/useDevGuide'

defineProps({
  headerHovered: {
    type: Boolean,
    default: false,
  },
})

const { activeTab, selectedSample, recentSamples, favoriteSamples, samples, filteredSamples, filteredRecentSamples, filteredFavoriteSamples, viewMode, filterListOnSearch, handleSampleSelect, handleFolderSelect, toggleFavorite, getIconForTopLevel, getLabelForTopLevel, getIconForCategory } = useDevGuide()

// viewMode를 computed로 변환하여 템플릿에서 사용
const currentViewMode = computed(() => viewMode.value)

// 리스트에 표시할 샘플 (필터링 토글에 따라 결정)
const listSamples = computed(() => {
  return filterListOnSearch.value ? filteredSamples.value : samples.value
})

// q-tree용 노드 데이터 변환 (필터링 토글에 따라 결정)
const treeNodes = computed(() => {
  // filterListOnSearch가 true면 filteredSamples, false면 samples 사용
  const sourceSamples = filterListOnSearch.value ? filteredSamples.value : samples.value
  
  if (!sourceSamples || sourceSamples.length === 0) {
    return []
  }

  // sourceSamples를 topLevel과 category로 그룹화
  const topLevelMap = new Map()

  sourceSamples.forEach((sample) => {
    const topLevel = sample.topLevel || '기타'
    const category = sample.category || '기타'

    if (!topLevelMap.has(topLevel)) {
      topLevelMap.set(topLevel, {
        name: topLevel,
        label: getLabelForTopLevel(topLevel),
        icon: getIconForTopLevel(topLevel),
        categories: new Map(),
      })
    }

    const topLevelData = topLevelMap.get(topLevel)
    if (!topLevelData.categories.has(category)) {
      topLevelData.categories.set(category, {
        name: category,
        icon: getIconForCategory(category),
        samples: [],
      })
    }

    topLevelData.categories.get(category).samples.push(sample)
  })

  // Map을 배열로 변환하고 정렬
  const hierarchicalData = Array.from(topLevelMap.values())
    .map((topLevel) => ({
      ...topLevel,
      categories: Array.from(topLevel.categories.values())
        .map((cat) => ({
          ...cat,
          samples: cat.samples.sort((a, b) => (a.displayName || a.name).localeCompare(b.displayName || b.name)),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => {
      const order = ['styles', 'patterns', 'conventions', 'best-practices']
      const aIndex = order.indexOf(a.name)
      const bIndex = order.indexOf(b.name)
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return a.label.localeCompare(b.label)
    })

  let nodeId = 1
  return hierarchicalData.map((topLevel) => {
    const topLevelId = nodeId++
    const children = topLevel.categories.map((category) => {
      const categoryId = nodeId++
      const sampleChildren = category.samples.map((sample) => {
        return {
          id: nodeId++,
          label: sample.displayName || sample.name,
          icon: sample.icon || 'style',
          sample: sample, // 원본 샘플 데이터 보관
        }
      })
      return {
        id: categoryId,
        label: category.name,
        icon: category.icon,
        name: category.name, // 폴더 필터를 위한 name
        topLevel: topLevel.name, // 폴더 필터를 위한 topLevel
        children: sampleChildren,
      }
    })
    return {
      id: topLevelId,
      label: topLevel.label,
      icon: topLevel.icon,
      name: topLevel.name, // 폴더 필터를 위한 name
      children: children,
    }
  })
})

// 확장 상태 추적
const expandedNodes = ref({})

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

// 폴더 헤더 클릭 핸들러
function handleFolderHeaderClick(node) {
  console.log('🔴 handleFolderHeaderClick 호출:', node.label, node.id, 'hasSample:', !!node.sample)

  // 샘플 노드는 무시
  if (node.sample) {
    console.log('🔴 샘플 노드이므로 무시')
    return
  }

  // 폴더 노드인 경우 필터링 처리
  console.log('🔴 폴더 노드 클릭, 필터링 처리 시작')

  // 최상위 레벨 폴더인지 확인
  const topLevelNode = treeNodes.value.find((topLevel) => topLevel.id === node.id)
  if (topLevelNode) {
    console.log('🔴 최상위 레벨 폴더 선택:', topLevelNode.name)
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
      console.log('🔴 카테고리 폴더 선택:', categoryNode.name, 'topLevel:', topLevel.name)
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

  if (!expanded || typeof expanded !== 'object') {
    return
  }

  // expanded는 { [nodeId]: boolean } 형태의 객체
  // 이전 상태와 비교하여 새로 확장된 노드만 감지
  for (const [nodeId, isExpanded] of Object.entries(expanded)) {
    const nodeIdNum = parseInt(nodeId, 10)
    const wasExpanded = expandedNodes.value[nodeId] || false

    // 새로 확장된 노드만 처리 (축소된 노드는 무시)
    if (isExpanded && !wasExpanded) {
      console.log('🟣 새로 확장된 노드 감지:', nodeId)
      const node = findNodeById(treeNodes.value, nodeIdNum)

      if (!node) {
        continue
      }

      // 샘플 노드가 아닌 폴더 노드인 경우에만 필터링 처리
      if (!node.sample) {
        console.log('🟣 폴더 노드 확장:', node.label, node.name)

        // 최상위 레벨 폴더인지 확인
        const topLevelNode = treeNodes.value.find((topLevel) => topLevel.id === node.id)
        if (topLevelNode) {
          console.log('🟣 최상위 레벨 폴더 선택:', topLevelNode.name)
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
            console.log('🟣 카테고리 폴더 선택:', categoryNode.name, 'topLevel:', topLevel.name)
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

  // 확장 상태 업데이트
  expandedNodes.value = { ...expanded }
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

  // 트리 폴더 헤더 스타일
  .tree-folder-header {
    pointer-events: auto !important;
    cursor: pointer;
    user-select: none;

    &:hover {
      background-color: var(--nexa-surface-hover);
      border-radius: 4px;
    }
  }

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
