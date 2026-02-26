<!-- SettingsManagerContent.vue
  설정 관리 메인 컨텐츠 컴포넌트
  설정 상세 정보 및 전체 현황 표시

  TODO: 향후 스토리지 관리 기능 통합 예정
  - localStorage, sessionStorage, IndexedDB 통합 관리
  - 스토리지 데이터 편집/삭제 기능
  - 스토리지 사용량 분석
  - 스토리지 백업/복원 기능
  - 메뉴 이름도 "설정 및 스토리지 관리" 등으로 변경 검토
-->
<template>
  <!-- 설정이 선택되지 않았을 때: 전체 현황 및 가이드 -->
  <div v-if="!actualSelectedSetting" class="settings-overview">
    <!-- 전체 현황 -->
    <section v-if="actualStatistics" class="statistics-section">
      <h2 class="section-title">전체 현황</h2>
      <div class="statistics-grid">
        <div class="stat-card">
          <q-icon name="description" size="32px" color="primary" />
          <div class="stat-value">{{ actualStatistics.totalCount }}</div>
          <div class="stat-label">전체 설정</div>
        </div>
        <div class="stat-card">
          <q-icon name="folder" size="32px" color="secondary" />
          <div class="stat-value">{{ actualStatistics.configFilesCount }}</div>
          <div class="stat-label">Config 파일</div>
        </div>
        <div class="stat-card">
          <q-icon name="storage" size="32px" color="accent" />
          <div class="stat-value">{{ actualStatistics.localStorageCount }}</div>
          <div class="stat-label">localStorage</div>
        </div>
        <div class="stat-card">
          <q-icon name="settings" size="32px" color="positive" />
          <div class="stat-value">{{ actualStatistics.systemSettingsCount }}</div>
          <div class="stat-label">시스템 설정</div>
        </div>
      </div>

      <!-- 카테고리별 통계 -->
      <div v-if="actualStatistics.categoryStats" class="category-stats">
        <h3 class="subsection-title">카테고리별 통계</h3>
        <div v-for="(stats, category) in actualStatistics.categoryStats" :key="category" class="category-stat-item">
          <div class="category-name">{{ category }}</div>
          <div class="category-count">{{ stats.count }}개</div>
          <div class="category-size">{{ formatSize(stats.size) }}</div>
        </div>
      </div>
    </section>

    <!-- 스캔 가이드 -->
    <section class="guide-section">
      <h2 class="section-title">설정 스캔 가이드</h2>
      <div class="guide-item">
        <q-icon name="info" size="24px" color="info" />
        <div>
          <strong>Config 파일 스캔</strong>
          <p>config/ 폴더의 모든 설정 파일을 자동으로 스캔합니다.</p>
          <ul>
            <li>devGuideConfig.js - 개발 가이드 설정</li>
            <li>documentConfig.js - 문서 관리 설정</li>
            <li>sidebarRegistry.js - 사이드바 설정</li>
            <li>componentTaxonomy.js - 컴포넌트 분류 설정</li>
            <li>기타 config/ 폴더 내 모든 설정 파일</li>
          </ul>
        </div>
      </div>

      <div class="guide-item">
        <q-icon name="storage" size="24px" color="secondary" />
        <div>
          <strong>localStorage 스캔</strong>
          <p>브라우저 localStorage에 저장된 모든 설정을 스캔합니다.</p>
          <ul>
            <li>dev-* 접두어: 개발 도구 관련 설정</li>
            <li>user* 접두어: 사용자 설정</li>
            <li>Part-* 접두어: 부품 관리 설정</li>
            <li>Board-* 접두어: 보드 메뉴 설정</li>
            <li>기타 설정 관련 키</li>
          </ul>
        </div>
      </div>

      <div class="guide-item">
        <q-icon name="settings" size="24px" color="accent" />
        <div>
          <strong>시스템 설정 스캔</strong>
          <p>시스템 전역 설정 파일을 스캔합니다.</p>
          <ul>
            <li>settings/system.js - 시스템 설정</li>
          </ul>
        </div>
      </div>

      <div class="guide-item">
        <q-icon name="code" size="24px" color="primary" />
        <div>
          <strong>새로운 설정 추가 방법</strong>
          <p>새로운 설정을 스캔 가능하게 하려면:</p>
          <ol>
            <li><strong>Config 파일:</strong> config/ 폴더에 .js 파일로 추가</li>
            <li><strong>localStorage:</strong> 설정 관련 키는 자동으로 감지됩니다</li>
            <li><strong>시스템 설정:</strong> settings/ 폴더에 추가</li>
            <li><strong>스캔 업데이트:</strong> settingsScanner.js에 새로운 파일 경로 추가</li>
          </ol>
        </div>
      </div>
    </section>
  </div>

  <!-- 설정이 선택되었을 때: 설정 상세 정보 -->
  <div v-else class="setting-detail">
    <header class="detail-header">
      <q-btn flat dense icon="arrow_back" @click="handleBack" size="sm" />
      <h2 class="detail-title">{{ actualSelectedSetting.name }}</h2>
      <q-chip :color="getCategoryColor(actualSelectedSetting.category)" text-color="white" size="sm">
        {{ actualSelectedSetting.category }}
      </q-chip>
      <q-chip :color="getTypeColor(actualSelectedSetting.type)" text-color="white" size="sm">
        {{ actualSelectedSetting.type }}
      </q-chip>
      <q-btn v-if="actualSelectedSetting.type === 'localStorage'" flat dense icon="edit" size="sm" @click="showEditDialog = true" />
      <q-btn v-if="actualSelectedSetting.type === 'localStorage'" flat dense icon="delete" size="sm" color="negative" @click="handleDelete" />
    </header>

    <div class="detail-info-row">
      <div class="info-item">
        <span class="info-label">경로:</span>
        <span class="info-value">{{ actualSelectedSetting.path }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">크기:</span>
        <span class="info-value">{{ formatSize(actualSelectedSetting.size) }}</span>
      </div>
      <div v-if="actualSelectedSetting.lastModified" class="info-item">
        <span class="info-label">수정일:</span>
        <span class="info-value">{{ formatDate(actualSelectedSetting.lastModified) }}</span>
      </div>
    </div>

    <section class="detail-section">
      <h3 class="section-title">설정 데이터</h3>
      <pre class="data-viewer">{{ formatJSON(actualSelectedSetting.data) }}</pre>
    </section>

    <section v-if="actualSelectedSetting.type === 'localStorage' && actualSelectedSetting.rawValue" class="detail-section">
      <div class="section-header">
        <h3 class="section-title">원본 데이터</h3>
        <q-btn flat dense icon="content_copy" size="sm" @click="copyToClipboard(actualSelectedSetting.rawValue)" />
      </div>
      <pre class="data-viewer">{{ actualSelectedSetting.rawValue }}</pre>
    </section>

    <section class="detail-section">
      <h3 class="section-title">발생 위치</h3>
      <div v-if="getUsageLocations(actualSelectedSetting.name).length > 0" class="usage-list">
        <div v-for="(location, index) in getUsageLocations(actualSelectedSetting.name)" :key="index" class="usage-item">
          <q-icon name="code" size="14px" />
          <span class="usage-path">{{ location.path }}</span>
          <q-chip size="xs" dense :color="location.type === 'store' ? 'purple' : location.type === 'service' ? 'blue' : 'grey'">
            {{ location.type }}
          </q-chip>
        </div>
      </div>
      <div v-else class="usage-empty">
        <q-icon name="help_outline" size="20px" color="grey-5" />
        <span class="usage-empty-text">사용 위치를 찾을 수 없습니다</span>
      </div>
    </section>

    <section class="detail-section">
      <h3 class="section-title">DB 이전 계획</h3>
      <div class="plan-row">
        <div class="plan-item">
          <span class="plan-label">이전 대상:</span>
          <q-select v-model="migrationTarget" :options="migrationTargetOptions" option-label="label" option-value="value" emit-value map-options dense outlined placeholder="선택" class="plan-select" />
        </div>
        <div class="plan-item">
          <span class="plan-label">테이블명:</span>
          <q-input v-model="migrationTableName" dense outlined placeholder="예: user_settings" class="plan-input" />
        </div>
      </div>
      <div class="plan-item">
        <span class="plan-label">컬럼 구조:</span>
        <q-input v-model="migrationColumnStructure" type="textarea" dense outlined placeholder="예: key VARCHAR(255), value TEXT" rows="2" class="plan-textarea" />
      </div>
      <div class="plan-item">
        <span class="plan-label">메모:</span>
        <q-input v-model="migrationNotes" type="textarea" dense outlined placeholder="고려사항, 주의사항 등" rows="2" class="plan-textarea" />
      </div>
      <div class="plan-actions">
        <q-btn flat dense icon="save" label="저장" size="sm" color="primary" @click="saveMigrationPlan" />
        <q-btn flat dense icon="clear" label="초기화" size="sm" @click="resetMigrationPlan" />
      </div>
    </section>
  </div>

  <!-- 수정 다이얼로그 -->
  <q-dialog v-model="showEditDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">설정 수정</div>
        <div class="text-caption text-grey q-mt-xs">{{ actualSelectedSetting?.name }}</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="editValue" type="textarea" label="값" outlined rows="10" :rules="[(val) => val.length > 0 || '값을 입력해주세요']">
          <template v-slot:hint> JSON 형식으로 입력하거나 문자열로 입력할 수 있습니다. </template>
        </q-input>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="취소" @click="showEditDialog = false" />
        <q-btn flat label="저장" color="primary" @click="handleSave" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  selectedSetting: {
    type: Object,
    default: null,
  },
  statistics: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['back'])

// Props를 computed로 변환 (템플릿에서 actualSelectedSetting, actualStatistics 사용)
const actualSelectedSetting = computed(() => props.selectedSetting)
const actualStatistics = computed(() => props.statistics)

// 수정 다이얼로그 상태
const showEditDialog = ref(false)
const editValue = ref('')

// DB 이전 계획 상태
const migrationTarget = ref(null)
const migrationTableName = ref('')
const migrationColumnStructure = ref('')
const migrationNotes = ref('')

// 이전 대상 옵션
const migrationTargetOptions = [
  { label: '사용자 설정 테이블', value: 'user_settings' },
  { label: '앱 설정 테이블', value: 'app_config' },
  { label: '세션 데이터 테이블', value: 'session_data' },
  { label: '별도 테이블 생성', value: 'custom' },
]

// 발생 위치 추적 함수
function getUsageLocations(keyName) {
  const locations = []

  // Config 파일인 경우 (type이 'config-file'인 경우)
  // 실제로는 keyName이 아니라 setting 객체 전체를 받아야 하지만,
  // 현재 구조에서는 keyName만 받으므로 actualSelectedSetting을 사용
  if (actualSelectedSetting.value && actualSelectedSetting.value.type === 'config-file') {
    // Config 파일 자체가 발생 위치
    locations.push({
      path: actualSelectedSetting.value.path,
      type: 'config-file',
      description: '설정 파일',
    })

    // Config 파일을 import하는 일반적인 위치들
    const configFileName = actualSelectedSetting.value.name

    if (configFileName.includes('devGuide')) {
      locations.push({
        path: '@system/store/devGuideStore',
        type: 'store',
        description: '개발 가이드 Store에서 사용',
      })
      locations.push({
        path: '@system/composables/useDevGuide.js',
        type: 'composable',
        description: '개발 가이드 Composable에서 사용',
      })
      locations.push({
        path: '@system/utils/path-tree-builder.js',
        type: 'utility',
        description: '경로 트리 빌더에서 사용',
      })
    } else if (configFileName.includes('document')) {
      locations.push({
        path: '@system/store/documentManagerStore.js',
        type: 'store',
        description: '문서 관리 Store에서 사용',
      })
      locations.push({
        path: 'src/domains/dev/modules/document-manager/services/documentStorage.js',
        type: 'service',
        description: '문서 저장소 서비스에서 사용',
      })
    } else if (configFileName.includes('sidebar')) {
      locations.push({
        path: '@domains/dev/views/DevLeftNav.vue',
        type: 'component',
        description: '사이드바 컴포넌트에서 사용',
      })
      locations.push({
        path: '@frame/layout/MainLayout.vue',
        type: 'component',
        description: '메인 레이아웃에서 사용',
      })
    } else if (configFileName.includes('componentTaxonomy') || configFileName.includes('componentCategories')) {
      locations.push({
        path: '@system/composables/useComponentLibrary.js',
        type: 'composable',
        description: '컴포넌트 라이브러리 Composable에서 사용',
      })
      locations.push({
        path: '@domains/dev/views/dev-tools/component-library/ComponentLibraryContent.vue',
        type: 'component',
        description: '컴포넌트 라이브러리 컨텐츠에서 사용',
      })
    } else if (configFileName.includes('urlState')) {
      locations.push({
        path: '@system/composables/url-state/useURLStateSync.js',
        type: 'composable',
        description: 'URL 상태 동기화에서 사용',
      })
      locations.push({
        path: '@system/composables/url-state/useDeepLinking.js',
        type: 'composable',
        description: '딥 링킹에서 사용',
      })
    } else if (configFileName.includes('fileTypes')) {
      locations.push({
        path: '@system/store/documentManagerStore.js',
        type: 'store',
        description: '문서 관리 Store에서 사용',
      })
    } else if (configFileName.includes('diagram')) {
      locations.push({
        path: 'src/engines/diagram/config/diagramSettings.js',
        type: 'config',
        description: '다이어그램 설정에서 사용',
      })
      locations.push({
        path: '@domains/dev/views/right-dev-tools/ERDDiagramSettingsPanel.vue',
        type: 'component',
        description: 'ERD 다이어그램 설정 패널에서 사용',
      })
    } else if (configFileName.includes('viewMode')) {
      locations.push({
        path: 'src/domains/parts/components/PartClassesView.vue',
        type: 'component',
        description: '부품 클래스 뷰에서 사용',
      })
      locations.push({
        path: 'src/domains/parts/components/ViewModeSelector.vue',
        type: 'component',
        description: '뷰 모드 선택기에서 사용',
      })
    }

    return locations
  }

  // localStorage 키인 경우 (기존 로직)
  // 키 이름 패턴 분석 (우선순위 순)

  // 1. TOC 관련
  if (keyName.startsWith('dev-toc-expanded-')) {
    locations.push({
      path: 'src/domains/dev/modules/document-manager/services/documentStorage.js',
      type: 'service',
      description: 'TOC 확장 상태 저장/로드',
    })
  } else if (keyName === 'dev-toc-settings') {
    locations.push({
      path: 'src/domains/dev/modules/document-manager/services/documentStorage.js',
      type: 'service',
      description: 'TOC 설정 저장/로드',
    })
  }

  // 2. 개발 가이드 관련
  if (keyName.startsWith('dev-guide-')) {
    // 세부 패턴별로 분기
    if (keyName.includes('sort-mode')) {
      locations.push({
        path: '@domains/dev/views/dev-tools/dev-guide/DevGuideList.vue',
        type: 'component',
        description: '정렬 모드 저장/로드',
      })
    } else if (keyName.includes('card-display-options')) {
      locations.push({
        path: '@domains/dev/views/dev-tools/dev-guide/DevGuideContent.vue',
        type: 'component',
        description: '카드 표시 옵션 저장/로드',
      })
    } else {
      // 일반적인 dev-guide-* 패턴
      locations.push({
        path: '@system/store/devGuideStore',
        type: 'store',
        description: '개발 가이드 설정 관리',
      })
    }
  }

  // 3. 메뉴 관련
  if (keyName === 'dev-active-menu') {
    locations.push({
      path: '@domains/dev/views/content/DevContent.vue',
      type: 'component',
      description: '활성 메뉴 상태 저장',
    })
    locations.push({
      path: '@domains/dev/views/DevLeftNav.vue',
      type: 'component',
      description: '활성 메뉴 상태 복원',
    })
  } else if (keyName === 'dev-menu-wheel-scroll-step') {
    locations.push({
      path: '@domains/dev/views/dev-tools/DevMenuSlider.vue',
      type: 'component',
      description: '메뉴 스크롤 스텝 설정',
    })
  }

  // 4. 문서 관리 관련
  if (keyName.startsWith('dev-checkbox-states')) {
    locations.push({
      path: 'src/domains/dev/modules/document-manager/services/documentStorage.js',
      type: 'service',
      description: '체크박스 상태 저장',
    })
  } else if (keyName === 'dev-trash-files') {
    locations.push({
      path: '@system/store/documentManagerStore.js',
      type: 'store',
      description: '휴지통 파일 목록 저장',
    })
  } else if (keyName === 'dev-previous-file-list' || keyName === 'dev-previous-file-hashes') {
    locations.push({
      path: '@system/store/documentManagerStore.js',
      type: 'store',
      description: '이전 파일 목록/해시 저장',
    })
  } else if (keyName === 'dev-document-folder-name') {
    locations.push({
      path: '@system/store/documentManagerStore.js',
      type: 'store',
      description: '문서 폴더명 저장',
    })
  } else if (keyName === 'dev-file-usage-counts') {
    locations.push({
      path: '@system/store/documentManagerStore.js',
      type: 'store',
      description: '파일 사용 횟수 저장',
    })
  } else if (keyName === 'dev-priority-states') {
    locations.push({
      path: '@system/store/documentManagerStore.js',
      type: 'store',
      description: '우선순위 상태 저장',
    })
  } else if (keyName === 'dev-favorite-states') {
    locations.push({
      path: '@system/store/documentManagerStore.js',
      type: 'store',
      description: '즐겨찾기 상태 저장',
    })
  }

  // 5. 모달 관련
  if (keyName.startsWith('modal-state-')) {
    locations.push({
      path: '@system/store/modalSystemStore.js',
      type: 'store',
      description: '모달 상태 관리',
    })
  }

  // 6. 에러 추적 관련
  if (keyName.startsWith('Error-') || keyName.startsWith('error-')) {
    locations.push({
      path: 'src/utils/error-tracking/errorStorage.js',
      type: 'service',
      description: '에러 추적 데이터 저장',
    })
    locations.push({
      path: '@domains/dev/views/dev-tools/error-tracking/ErrorTrackingContent.vue',
      type: 'component',
      description: '에러 추적 UI',
    })
  }

  // 7. 사용자 설정
  if (keyName === 'userSettings' || keyName.startsWith('user-')) {
    locations.push({
      path: '@system/store/userSettingsStore',
      type: 'store',
      description: '사용자 설정 관리',
    })
  }

  // 8. 부품 관리 관련
  if (keyName.startsWith('Part-')) {
    locations.push({
      path: '@system/store/partsManagementStore.js',
      type: 'store',
      description: '부품 관리 설정',
    })
  }

  // 9. 보드 메뉴 관련
  if (keyName.startsWith('Board-')) {
    locations.push({
      path: '@system/store/boardMenuStore',
      type: 'store',
      description: '보드 메뉴 설정',
    })
  }

  // 10. Mermaid 스타일 관련
  if (keyName.startsWith('Mermaid-') || keyName.startsWith('mermaid-style:')) {
    locations.push({
      path: 'src/domains/dev/modules/document-manager/services/mermaidStyleStorage.js',
      type: 'service',
      description: 'Mermaid 스타일 저장',
    })
  }

  // 11. 테마 관련
  if (keyName.startsWith('Theme-')) {
    locations.push({
      path: 'src/domains/dev/modules/theme-manager/services/favoriteColorsManager.js',
      type: 'service',
      description: '테마 색상 관리',
    })
    locations.push({
      path: 'src/domains/dev/modules/theme-manager/services/recentColorsManager.js',
      type: 'service',
      description: '최근 색상 관리',
    })
  }

  // 12. 성능 모니터 관련
  if (keyName.startsWith('Performance-')) {
    locations.push({
      path: 'src/utils/performance/performanceStorage.js',
      type: 'service',
      description: '성능 데이터 저장',
    })
  }

  // 13. 토스트 설정
  if (keyName === 'dev-toast-settings') {
    locations.push({
      path: 'src/system/components/ui/TableFilterBar.vue',
      type: 'component',
      description: '토스트 설정 저장',
    })
  }

  // 패턴을 찾지 못한 경우, 키 이름에서 추론
  if (locations.length === 0) {
    // 키 이름에서 모듈명 추론
    const keyParts = keyName.split('-')
    if (keyParts.length > 1) {
      const moduleName = keyParts[1] // 예: 'dev-guide-*' -> 'guide'

      // 일반적인 패턴 추론
      if (moduleName === 'toc' || keyName.includes('toc')) {
        locations.push({
          path: 'src/domains/dev/modules/document-manager/services/documentStorage.js',
          type: 'service',
          description: 'TOC 관련 설정 (추정)',
        })
      } else if (moduleName === 'guide' || keyName.includes('guide')) {
        locations.push({
          path: '@system/store/devGuideStore',
          type: 'store',
          description: '개발 가이드 관련 설정 (추정)',
        })
      } else if (moduleName === 'document' || keyName.includes('document')) {
        locations.push({
          path: '@system/store/documentManagerStore.js',
          type: 'store',
          description: '문서 관리 관련 설정 (추정)',
        })
      } else if (keyName.includes('menu')) {
        locations.push({
          path: '@domains/dev/views/dev-tools/DevMenuSlider.vue',
          type: 'component',
          description: '메뉴 관련 설정 (추정)',
        })
      }
    }
  }

  return locations
}

// DB 이전 계획 저장
function saveMigrationPlan() {
  if (!actualSelectedSetting.value) return

  const plan = {
    target: migrationTarget.value,
    tableName: migrationTableName.value,
    columnStructure: migrationColumnStructure.value,
    notes: migrationNotes.value,
    updatedAt: new Date().toISOString(),
  }

  try {
    const key = `migration-plan-${actualSelectedSetting.value.name}`
    localStorage.setItem(key, JSON.stringify(plan))
    // TODO: 성공 알림
  } catch (error) {
    console.error('[SettingsManager] 이전 계획 저장 실패:', error)
  }
}

// DB 이전 계획 로드
function loadMigrationPlan() {
  if (!actualSelectedSetting.value) return

  try {
    const key = `migration-plan-${actualSelectedSetting.value.name}`
    const saved = localStorage.getItem(key)
    if (saved) {
      const plan = JSON.parse(saved)
      migrationTarget.value = plan.target
      migrationTableName.value = plan.tableName || ''
      migrationColumnStructure.value = plan.columnStructure || ''
      migrationNotes.value = plan.notes || ''
    } else {
      resetMigrationPlan()
    }
  } catch (error) {
    console.error('[SettingsManager] 이전 계획 로드 실패:', error)
    resetMigrationPlan()
  }
}

// DB 이전 계획 초기화
function resetMigrationPlan() {
  migrationTarget.value = null
  migrationTableName.value = ''
  migrationColumnStructure.value = ''
  migrationNotes.value = ''
}

// 선택된 설정이 변경될 때 이전 계획 로드 및 수정 다이얼로그 초기화
watch(
  () => actualSelectedSetting.value,
  () => {
    if (actualSelectedSetting.value) {
      loadMigrationPlan()
      // localStorage인 경우 수정 다이얼로그 값 초기화
      if (actualSelectedSetting.value.type === 'localStorage' && actualSelectedSetting.value.rawValue) {
        editValue.value = actualSelectedSetting.value.rawValue
      }
    } else {
      resetMigrationPlan()
      showEditDialog.value = false
      editValue.value = ''
    }
  },
  { immediate: true },
)

// 수정 다이얼로그가 열릴 때 값 초기화
watch(showEditDialog, (isOpen) => {
  if (isOpen && actualSelectedSetting.value?.rawValue) {
    editValue.value = actualSelectedSetting.value.rawValue
  }
})

// localStorage 설정 저장
function handleSave() {
  if (!actualSelectedSetting.value || actualSelectedSetting.value.type !== 'localStorage') {
    return
  }

  try {
    // JSON 파싱 시도
    let parsedValue = null
    try {
      parsedValue = JSON.parse(editValue.value)
      // 파싱 성공 시 JSON으로 저장
      localStorage.setItem(actualSelectedSetting.value.name, JSON.stringify(parsedValue))
    } catch {
      // JSON이 아니면 문자열로 저장
      localStorage.setItem(actualSelectedSetting.value.name, editValue.value)
    }

    $q.notify({
      type: 'positive',
      message: '설정이 저장되었습니다',
      position: 'top',
      timeout: 2000,
    })

    showEditDialog.value = false

    // 전역 이벤트로 업데이트 알림
    window.dispatchEvent(new CustomEvent('settings-manager-setting-updated', { detail: { keyName: actualSelectedSetting.value.name } }))
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `저장 실패: ${error.message}`,
      position: 'top',
      timeout: 3000,
    })
  }
}

// localStorage 설정 삭제
function handleDelete() {
  if (!actualSelectedSetting.value || actualSelectedSetting.value.type !== 'localStorage') {
    return
  }

  $q.dialog({
    title: '설정 삭제',
    message: `"${actualSelectedSetting.value.name}" 설정을 삭제하시겠습니까?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    try {
      localStorage.removeItem(actualSelectedSetting.value.name)

      $q.notify({
        type: 'positive',
        message: '설정이 삭제되었습니다',
        position: 'top',
        timeout: 2000,
      })

      // 전역 이벤트로 삭제 알림
      window.dispatchEvent(new CustomEvent('settings-manager-setting-deleted', { detail: { keyName: actualSelectedSetting.value.name } }))

      // 뒤로 가기
      handleBack()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: `삭제 실패: ${error.message}`,
        position: 'top',
        timeout: 3000,
      })
    }
  })
}

// 클립보드에 복사
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      $q.notify({
        type: 'positive',
        message: '클립보드에 복사되었습니다',
        position: 'top',
        timeout: 2000,
      })
    })
    .catch((error) => {
      $q.notify({
        type: 'negative',
        message: `복사 실패: ${error.message}`,
        position: 'top',
        timeout: 3000,
      })
    })
}

// 뒤로 가기 핸들러
function handleBack() {
  emit('back')
}

// 크기 포맷팅
function formatSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

// 날짜 포맷팅
function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('ko-KR')
}

// JSON 포맷팅
function formatJSON(obj) {
  try {
    return JSON.stringify(obj, null, 2)
  } catch {
    return String(obj)
  }
}

// 카테고리별 색상
function getCategoryColor(category) {
  const colorMap = {
    '개발 가이드': 'blue',
    '개발 도구': 'green',
    '사용자 설정': 'purple',
    '부품 관리': 'orange',
    '보드 메뉴': 'teal',
    'Mermaid 스타일': 'cyan',
    '테마 관리': 'pink',
    '에러 추적': 'red',
    '성능 모니터': 'amber',
    '문서 관리': 'indigo',
    시스템: 'grey-8',
    기타: 'grey-6',
  }
  return colorMap[category] || 'grey'
}

// 타입별 색상
function getTypeColor(type) {
  const colorMap = {
    'config-file': 'primary',
    localStorage: 'secondary',
    'system-config': 'accent',
  }
  return colorMap[type] || 'grey'
}
</script>

<style lang="scss" scoped>
.settings-manager-content {
  height: 100%;
  padding: 24px;
  overflow-y: auto;
}

.settings-overview {
  max-width: 1200px;
  margin: 0 auto;
}

.overview-section {
  margin-bottom: 32px;
  padding: 24px;
  background-color: var(--nexa-surface);
  border-radius: 8px;
  border: 1px solid var(--nexa-border-color);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--nexa-text-primary);
  margin-bottom: 16px;
}

.subsection-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin-bottom: 12px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background-color: var(--nexa-background);
  border-radius: 8px;
  border: 1px solid var(--nexa-border-color);

  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--nexa-text-primary);
  }

  .stat-label {
    font-size: 0.875rem;
    color: var(--nexa-text-secondary);
  }
}

.category-stats {
  margin-top: 16px;
}

.category-stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background-color: var(--nexa-background);
  border-radius: 4px;
  border: 1px solid var(--nexa-border-color);
  margin-bottom: 8px;

  .category-name {
    font-weight: 600;
    color: var(--nexa-text-primary);
    flex: 1;
  }

  .category-count {
    color: var(--nexa-text-secondary);
    margin-right: 16px;
  }

  .category-size {
    color: var(--nexa-text-secondary);
    font-size: 0.875rem;
  }
}

.guide-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  padding-bottom: 24px;
  background-color: var(--nexa-background);
  border-radius: 8px;
  border: 1px solid var(--nexa-border-color);
  margin-bottom: 16px;

  strong {
    display: block;
    font-size: 1.125rem;
    color: var(--nexa-text-primary);
    margin-bottom: 8px;
  }

  p {
    color: var(--nexa-text-secondary);
    margin-bottom: 8px;
  }

  ul,
  ol {
    margin-left: 20px;
    color: var(--nexa-text-secondary);

    li {
      margin-bottom: 4px;
    }
  }
}

.setting-detail {
  padding-top: 50px;
  max-width: 1200px;
  margin: 0 auto;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  margin-bottom: 8px;

  .detail-title {
    font-size: 2.25rem;
    font-weight: 900;
    color: var(--nexa-text-primary);
    margin: 0;
    flex: 1;
  }
}

.detail-info-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 8px;
  margin-bottom: 8px;
  font-size: 0.875rem;

  .info-item {
    display: flex;
    align-items: center;
    gap: 4px;

    .info-label {
      color: var(--nexa-text-secondary);
      font-weight: 500;
    }

    .info-value {
      color: var(--nexa-text-primary);
    }
  }
}

.detail-section {
  margin-bottom: 12px;
  padding: 12px;
  background-color: var(--nexa-surface);
  border-radius: 4px;
  border: 1px solid var(--nexa-border-color);

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--nexa-text-primary);
    margin: 0 0 8px 0;
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    .section-title {
      margin: 0;
    }
  }
}

.data-viewer {
  background-color: var(--nexa-background);
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  padding: 8px;
  overflow-x: auto;
  overflow-y: visible;
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  color: var(--nexa-text-primary);
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
}

.usage-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.usage-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background-color: var(--nexa-background);
  border-radius: 4px;
  border: 1px solid var(--nexa-border-color);
  font-size: 0.8125rem;

  .usage-path {
    flex: 1;
    font-family: 'Courier New', monospace;
    color: var(--nexa-text-primary);
    word-break: break-word;
  }
}

.usage-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  color: var(--nexa-text-secondary);
  font-size: 0.8125rem;

  .usage-empty-text {
    color: var(--nexa-text-secondary);
  }
}

.plan-row {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.plan-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex: 1;

  .plan-label {
    font-size: 0.8125rem;
    font-weight: 500;
    color: var(--nexa-text-secondary);
    white-space: nowrap;
    min-width: fit-content;
  }

  .plan-select,
  .plan-input,
  .plan-textarea {
    flex: 1;
    min-width: 0;
  }
}

.plan-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
