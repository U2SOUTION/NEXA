<!-- SchemaDiagram.vue
  데이터베이스 뷰어 전용 ERD 다이어그램 래퍼 컴포넌트
  NexaDiagram을 사용하여 ERD를 렌더링합니다.
-->

<template>
  <div class="schema-diagram">
    <!-- NexaDiagram 컴포넌트 사용 -->
    <NexaDiagram v-if="diagramData.tables && diagramData.relationships" ref="nexaDiagramRef" type="erd" :data="diagramData" :options="diagramOptions" :auto-load="false" @node-click="handleNodeClick" @node-hover="handleNodeHover" @error="handleDiagramError" @loaded="handleDiagramLoaded" />

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="schema-diagram-loading q-pa-lg text-center">
      <q-spinner color="primary" size="3em" />
      <div class="q-mt-md text-caption">ERD 다이어그램을 불러오는 중...</div>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="error" class="schema-diagram-error q-pa-lg text-center">
      <q-icon name="error_outline" size="48px" color="negative" class="q-mb-md" />
      <div class="text-body2 text-negative q-mb-sm">{{ error }}</div>
      <q-btn flat dense label="다시 시도" icon="refresh" @click="loadSchemaData" />
    </div>

    <!-- 추가 가능한 기능 목록 -->
    <div class="">
      <pre class="feature-list">
ERD 다이어그램 추가 가능한 기능


[차트 활용 데이터베이스 대시보드]


1. 시각화 및 탐색
  테이블 검색 및 필터링: 이름으로 검색, 카테고리별 필터
  관계 경로 탐색: 두 테이블 간 경로 표시
  관계 깊이 제어: 1단계/2단계/전체 관계 표시
  테이블 그룹화: 카테고리별 그룹, 수동 그룹 생성
  미니맵: 전체 구조를 보는 작은 맵

2. 인터랙션 및 편집
  노드 드래그: 테이블 위치 수동 조정
  노드 더블클릭: 테이블 상세 정보 표시
  관계선 클릭: 외래키 상세 정보 표시
  테이블 이름 변경: ERD에서 테이블명 변경 (연관 관계 자동 업데이트)
  관계 추가/삭제: 외래키 관계 시각적으로 추가/삭제
  노드 크기 조정: 중요도에 따른 크기 변경

3. 분석 및 최적화
  관계 분석: 순환 참조 탐지, 고아 테이블 탐지
  의존성 분석: 특정 테이블 삭제 시 영향 범위 표시
  정규화 분석: 정규화 수준 표시 및 제안
  인덱스 최적화 제안: 관계 기반 인덱스 제안
  성능 분석: 관계 기반 쿼리 성능 예측

4. 내보내기 및 공유
  이미지 내보내기: PNG, SVG, PDF
  인터랙티브 HTML 내보내기: 독립 실행 HTML
  문서 생성: ERD 기반 데이터베이스 문서 자동 생성
  공유 링크: ERD 상태를 URL로 공유

5. 레이아웃 및 스타일
  레이아웃 알고리즘 선택: 계층형, 원형, 그리드, 수동 배치
  테마 커스터마이징: 색상, 폰트, 크기 조정
  노드 스타일: 테이블 타입별 아이콘/색상
  관계선 스타일: 관계 타입별 선 스타일

6. 고급 기능
  버전 관리: ERD 변경 이력 추적
  비교 기능: 두 시점의 ERD 비교
  스냅샷: 특정 시점 ERD 저장
  자동 레이아웃: 최적 배치 자동 계산
  주석/노트: 테이블/관계에 메모 추가

7. 협업 기능
  실시간 공동 편집: 여러 사용자 동시 편집
  변경 이력: 누가 언제 변경했는지 추적
  댓글 시스템: 테이블/관계에 댓글 추가
  승인 워크플로우: 변경 사항 승인 프로세스

8. 스키마 관리
  마이그레이션 생성: ERD 변경사항을 SQL 마이그레이션으로 변환
  스키마 검증: ERD와 실제 DB 스키마 비교
  차이점 표시: ERD와 실제 DB 차이 하이라이트
  동기화: ERD 변경사항을 DB에 반영

9. 학습 및 문서화
  관계 설명: 각 관계의 의미 자동 설명
  베스트 프랙티스 체크: 관계 설계 가이드라인 검증
  튜토리얼 모드: ERD 사용법 가이드
  자동 문서화: ERD 기반 API 문서 생성

10. 성능 및 최적화
  대용량 스키마 처리: 수백 개 테이블 최적화 렌더링
  가상화: 보이는 영역만 렌더링
  캐싱: 자주 사용하는 레이아웃 캐싱
  백그라운드 로딩: 데이터 비동기 로딩

우선순위 제안
높은 우선순위
1. 테이블 검색 및 필터링
2. 노드 드래그 (수동 레이아웃)
3. 이미지 내보내기 (PNG/SVG)
4. 관계 경로 탐색
5. 관계 깊이 제어

중간 우선순위
6. 테이블 이름 변경 (ERD에서)
7. 의존성 분석
8. 레이아웃 알고리즘 선택
9. 스냅샷 기능
10. 주석/노트 추가

낮은 우선순위
11. 실시간 공동 편집
12. 마이그레이션 생성
13. 버전 관리
14. 자동 문서화</pre
      >
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import NexaDiagram from 'src/diagram/NexaDiagram.vue'

// 선택된 테이블 상태 (왼쪽 사이드바에서 선택된 테이블)
const selectedTable = ref(null)

// NexaDiagram 컴포넌트 참조
const nexaDiagramRef = ref(null)

// 다이어그램 데이터
const diagramData = ref({
  tables: null,
  relationships: null,
})

// 로딩 및 에러 상태
const isLoading = ref(false)
const error = ref(null)

// 다이어그램 옵션 (선택된 노드 포함)
const diagramOptions = computed(() => ({
  selectedNode: selectedTable.value,
  layoutType: 'hierarchical',
  layoutOptions: {},
}))

// 스키마 데이터 로드
async function loadSchemaData() {
  console.log('[SchemaDiagram] 데이터 로드 시작')
  isLoading.value = true
  error.value = null

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    console.log('[SchemaDiagram] API Base URL:', apiBaseUrl)

    // 테이블 목록과 관계 정보를 동시에 가져오기
    console.log('[SchemaDiagram] API 호출 시작...')
    const [tablesResponse, relationshipsResponse] = await Promise.all([fetch(`${apiBaseUrl}/db/tables`), fetch(`${apiBaseUrl}/db/relationships`)])

    console.log('[SchemaDiagram] API 응답 상태:', {
      tables: tablesResponse.status,
      relationships: relationshipsResponse.status,
    })

    // 503 에러 체크
    if (tablesResponse.status === 503 || relationshipsResponse.status === 503) {
      throw new Error('데이터베이스 연결이 없습니다.')
    }

    const tablesData = await tablesResponse.json()
    const relationshipsData = await relationshipsResponse.json()

    console.log('[SchemaDiagram] API 응답 데이터:', {
      tables: tablesData,
      relationships: relationshipsData,
    })

    if (!tablesData.success || !relationshipsData.success) {
      throw new Error('스키마 데이터를 불러오는데 실패했습니다.')
    }

    console.log('[SchemaDiagram] 테이블 개수:', tablesData.data?.length)
    console.log('[SchemaDiagram] 관계 개수:', relationshipsData.data?.length)

    // 다이어그램 데이터 설정
    diagramData.value = {
      tables: tablesData.data || [],
      relationships: relationshipsData.data || [],
    }

    console.log('[SchemaDiagram] 다이어그램 데이터 설정 완료')

    // NexaDiagram이 마운트된 후 렌더링 트리거
    // v-if로 인해 컴포넌트가 마운트되기까지 약간의 지연이 필요할 수 있음
    await nextTick()
    setTimeout(() => {
      if (nexaDiagramRef.value) {
        console.log('[SchemaDiagram] NexaDiagram 렌더링 트리거')
        nexaDiagramRef.value.renderDiagram()
      } else {
        console.warn('[SchemaDiagram] NexaDiagram ref가 아직 없습니다.')
      }
    }, 100)
  } catch (err) {
    // ERR_CONNECTION_REFUSED 등 네트워크 에러 처리
    if (err.name === 'TypeError' && err.message?.includes('Failed to fetch')) {
      error.value = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인하세요.'
      console.warn('[SchemaDiagram] 서버 연결 실패:', err.message)
    } else {
      console.error('[SchemaDiagram] 스키마 데이터 로드 실패:', err)
      error.value = err.message || 'ERD 다이어그램을 불러오는데 실패했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}

// 노드 클릭 핸들러
function handleNodeClick(event) {
  const { nodeId } = event
  console.log('[SchemaDiagram] 노드 클릭:', nodeId)

  // 선택된 테이블 업데이트
  selectedTable.value = nodeId

  // 전역 이벤트로 다른 컴포넌트에 알림
  window.dispatchEvent(
    new CustomEvent('database-table-selected', {
      detail: {
        tableName: nodeId,
      },
    }),
  )
}

// 노드 호버 핸들러
function handleNodeHover(event) {
  const { nodeId, isEntering } = event
  console.log('[SchemaDiagram] 노드 호버:', nodeId, isEntering)
}

// 다이어그램 에러 핸들러
function handleDiagramError(err) {
  console.error('[SchemaDiagram] 다이어그램 에러:', err)
  error.value = err.message || '다이어그램 렌더링 중 오류가 발생했습니다.'
}

// 다이어그램 로드 완료 핸들러
function handleDiagramLoaded(renderResult) {
  console.log('[SchemaDiagram] 다이어그램 로드 완료:', renderResult)
}

// 테이블 선택 이벤트 리스너
function handleTableSelected(event) {
  const { tableName } = event.detail
  console.log('[SchemaDiagram] 테이블 선택 이벤트 수신:', tableName)
  selectedTable.value = tableName
}

// ERD 설정 변경 이벤트 리스너 (실시간 반영)
function handleERDSettingsChanged(event) {
  const { settings } = event.detail
  console.log('[SchemaDiagram] ERD 설정 변경 이벤트 수신:', settings)
  // 설정이 변경되면 다이어그램 재렌더링
  if (nexaDiagramRef.value && typeof nexaDiagramRef.value.renderDiagram === 'function') {
    console.log('[SchemaDiagram] 다이어그램 재렌더링 트리거 (설정 변경)')
    nexaDiagramRef.value.renderDiagram()
  }
}

// 컴포넌트 마운트 시 데이터 로드 및 이벤트 리스너 등록
onMounted(() => {
  console.log('[SchemaDiagram] 컴포넌트 마운트됨')

  // 테이블 선택 이벤트 리스너 등록
  window.addEventListener('database-table-selected', handleTableSelected)

  // ERD 설정 변경 이벤트 리스너 등록
  window.addEventListener('erd-settings-changed', handleERDSettingsChanged)

  // nextTick을 사용하여 DOM이 완전히 렌더링된 후 데이터 로드
  nextTick(() => {
    loadSchemaData()
  })
})

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onBeforeUnmount(() => {
  window.removeEventListener('database-table-selected', handleTableSelected)
  window.removeEventListener('erd-settings-changed', handleERDSettingsChanged)
})

// 선택된 테이블 변경 감지하여 다이어그램 업데이트
// 주의: NexaDiagram의 watch가 자동으로 updateERD를 호출하므로
// 여기서는 renderDiagram을 호출하지 않음 (전체 재렌더링 방지)
watch(
  () => selectedTable.value,
  (newTable, oldTable) => {
    if (newTable !== oldTable && diagramData.value.tables) {
      console.log('[SchemaDiagram] 선택된 테이블 변경:', newTable)
      // NexaDiagram의 watch가 자동으로 updateERD를 호출함
      // renderDiagram()을 호출하면 전체가 재렌더링되어 위치가 초기화됨
    }
  },
)
</script>

<style lang="scss" scoped>
.schema-diagram {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 0; // flex 자식이 overflow를 올바르게 처리하도록
}

.schema-diagram-loading,
.schema-diagram-error {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.schema-diagram-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 1px solid var(--nexa-border-color);
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

// D3.js SVG 스타일 (전역 스타일이 필요하므로 :deep 사용)
:deep(.schema-diagram-container) {
  svg {
    width: 100%;
    height: 100%;
  }

  // 노드 스타일
  .node rect {
    rx: 4px;
    ry: 4px;
  }

  // 엣지 스타일
  .edgePath path {
    marker-end: url(#arrowhead);
  }

  // 화살표 마커
  .marker {
    fill: var(--nexa-primary);
  }
}

.feature-list {
  padding: 26px;
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: var(--nexa-text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  overflow-x: auto;
}
</style>
