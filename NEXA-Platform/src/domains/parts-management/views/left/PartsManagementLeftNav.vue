<!-- PartsManagementSidebar.vue
  부품관리 메뉴 선택 시 표시되는 왼쪽 사이드바
  공간 계층 구조 네비게이션 제공
-->

<template>
  <div class="parts-management-sidebar">
    <q-list ref="qListRef">
      <!-- 헤더 -->
      <div class="sidebar-header q-pa-md">
        <div class="text-h4 text-primary q-mb-xs text-bold">LOGISTICS MANAGEMENT</div>
        <div class="text-caption text-grey-7">System for managing logistics and inventory</div>
      </div>

      <q-separator />

      <!-- 모드 전환 탭 -->
      <div class="sidebar-tabs-section">
        <q-tabs :model-value="sidebarMode === null ? 'physical' : sidebarMode || 'physical'" @update:model-value="handleSidebarModeChange($event)" dense class="sidebar-tabs">
          <q-tab name="physical" label="물리 공간" icon="warehouse" />
          <q-tab name="parts-data" label="부품 데이터" icon="category" />
        </q-tabs>
      </div>

      <q-separator />

      <!-- 초기 상태 (대시보드) -->
      <div v-if="sidebarMode === null" class="sidebar-mode-content">
        <div class="q-pa-md">
          <!-- 환영 메시지 -->
          <div class="welcome-section q-mb-md">
            <div class="text-h6 text-primary q-mb-xs">부품 관리 시스템</div>
            <div class="text-caption text-grey-6">물리 공간과 부품 데이터를 효율적으로 관리하세요</div>
          </div>

          <q-separator class="q-mb-md" />

          <!-- 통계 요약 -->
          <div class="stats-summary-section">
            <div class="text-subtitle2 text-bold q-mb-sm">현황 요약</div>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-label text-caption text-grey-6">공간</div>
                <div class="stat-value text-h6 text-primary">{{ stats.totalSpaces }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label text-caption text-grey-6">부품 분류</div>
                <div class="stat-value text-h6 text-primary">{{ stats.totalClasses }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label text-caption text-grey-6">부품 유형</div>
                <div class="stat-value text-h6 text-primary">{{ stats.totalTypes }}</div>
              </div>
              <div class="stat-item">
                <div class="stat-label text-caption text-grey-6">개별 부품</div>
                <div class="stat-value text-h6 text-primary">{{ stats.totalParts }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 물리 공간 모드 -->
      <div v-if="sidebarMode === 'physical'" class="sidebar-mode-content">
        <!-- 추가 버튼 -->
        <div class="q-pa-sm sidebar-buttons-section">
          <q-btn flat dense @click="showSpaceManagementDialog = true" class="btn-nexa-primary q-mb-xs text-bold full-width q-py-xs">
            <template v-slot:default>
              <div class="full-width row items-center justify-center">
                <q-icon name="warehouse" class="q-mr-sm" />
                <span>부품함 배치 공간 관리</span>
              </div>
            </template>
          </q-btn>
          <q-btn flat dense @click="showBinModelDialog = true" class="btn-nexa-primary text-bold full-width q-py-xs">
            <template v-slot:default>
              <div class="full-width row items-center justify-center">
                <q-icon name="inventory_2" class="q-mr-sm" />
                <span>부품함 모델 관리</span>
              </div>
            </template>
          </q-btn>
        </div>

        <q-separator />

        <!-- 임시 보관소: 메뉴가 없을 때는 버튼 아래에 배치 -->
        <div v-if="!hasSpaces" class="temporary-storage-wrapper temporary-storage-top" :class="{ 'is-fixed': isTemporaryStorageFixed }">
          <TemporaryBinStorage ref="temporaryStorageRef" @position-changed="handlePositionChanged" />
        </div>

        <!-- 공간 트리 네비게이션 -->
        <div v-if="hasSpaces" class="q-pa-sm">
          <div
            v-for="(rootNode, index) in rootNodes"
            :key="rootNode.id"
            :class="{
              'is-dragging': draggedIndex === index,
              'drag-over': dragOverIndex === index,
            }"
            draggable="true"
            @dragstart="handleDragStart(index, $event)"
            @dragend="handleDragEnd"
            @dragover.prevent="handleDragOver(index, $event)"
            @dragenter.prevent="handleDragEnter(index)"
            @dragleave="handleDragLeave"
            @drop.prevent="handleDrop(index, $event)"
            class="draggable-space-item"
          >
            <space-tree-nav-item :node="rootNode" :level="0" :selected-node-id="selectedStorageRowId" :on-add-storage-block="handleOpenAddStorageBlockDialog" />
          </div>
        </div>

        <!-- 임시 보관소: 메뉴가 있을 때는 메뉴들 아래에 배치 -->
        <div
          v-if="hasSpaces"
          class="temporary-storage-wrapper temporary-storage-bottom"
          :class="{
            'is-fixed': isTemporaryStorageFixed,
            'is-sticky': needsSticky && !isTemporaryStorageFixed,
          }"
        >
          <TemporaryBinStorage ref="temporaryStorageRef" @position-changed="handlePositionChanged" />
        </div>

        <!-- 빈 상태 -->
        <q-item v-if="!hasSpaces">
          <q-item-section class="text-grey text-caption text-center q-pa-md">
            등록된 공간이 없습니다.
            <br />새 공간을 추가하세요.
          </q-item-section>
        </q-item>
      </div>

      <!-- 부품 데이터 모드 -->
      <div v-if="sidebarMode === 'parts-data'" class="sidebar-mode-content">
        <div class="q-pa-sm sidebar-buttons-section">
          <q-btn flat dense @click="handleViewChange('part-classes')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': selectedPartsDataView === 'part-classes' }]">
            <template v-slot:default>
              <div class="full-width row items-center justify-center">
                <q-icon name="category" class="q-mr-sm" />
                <span>부품 분류 관리</span>
              </div>
            </template>
          </q-btn>
          <q-btn flat dense @click="handleViewChange('part-models')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': selectedPartsDataView === 'part-models' }]">
            <template v-slot:default>
              <div class="full-width row items-center justify-center">
                <q-icon name="inventory" class="q-mr-sm" />
                <span>부품 유형 관리</span>
              </div>
            </template>
          </q-btn>
          <q-btn flat dense @click="handleViewChange('part-specs')" :class="['btn-nexa-primary q-mb-xs text-bold full-width q-py-xs', { 'active-menu': selectedPartsDataView === 'part-specs' }]">
            <template v-slot:default>
              <div class="full-width row items-center justify-center">
                <q-icon name="description" class="q-mr-sm" />
                <span>개별 부품 관리</span>
              </div>
            </template>
          </q-btn>
        </div>

        <!-- 사이드바 호버 뷰 기본 화면 (마우스 오버 전) -->
        <!-- 항목이 선택되지 않았을 때만 표시 (호버나 클릭 시 숨김) -->
        <div v-if="selectedPartsDataView === 'part-classes' && partsDataStore.selectedPartClasses.length === 0 && !partsDataStore.isSidebarDetailViewActive" class="quick-explore-default q-pa-md">
          <!-- 통계 요약 -->
          <div class="quick-explore-stats q-mb-lg">
            <div class="q-mb-md" style="display: flex; align-items: center; gap: 8px; color: var(--q-primary); font-weight: 600; font-size: 20px">
              <q-icon name="dashboard" size="20px" />
              <span>부품 관리 현황</span>
            </div>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ stats.totalClasses }}</div>
                <div class="stat-label">부품 분류</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ stats.totalTypes }}</div>
                <div class="stat-label">부품 모델</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">{{ stats.totalParts }}</div>
                <div class="stat-label">부품 스펙</div>
              </div>
            </div>
          </div>

          <!-- 사용 가이드 -->
          <div class="quick-explore-guide">
            <div class="text-subtitle2 q-mb-sm" style="display: flex; align-items: center; gap: 6px; color: var(--q-primary); font-weight: 600">
              <q-icon name="explore" size="18px" />
              <span>사이드바 호버 뷰</span>
            </div>
            <div class="guide-content text-caption" style="color: var(--nexa-text-primary); opacity: 0.8; line-height: 1.6">
              <div class="guide-item q-mb-xs">
                <q-icon name="mouse" size="14px" class="q-mr-xs" />
                테이블의 항목에 마우스를 올리면 상세 정보가 표시됩니다
              </div>
              <div class="guide-item q-mb-xs">
                <q-icon name="touch_app" size="14px" class="q-mr-xs" />
                항목을 클릭하면 상세 보기 모드로 전환됩니다
              </div>
              <div class="guide-item">
                <q-icon name="double_arrow" size="14px" class="q-mr-xs" />
                더블 클릭으로 빠르게 상세 보기 모드를 전환할 수 있습니다
              </div>
            </div>
          </div>
        </div>

        <!-- 사이드바 상세 뷰 (part-classes 뷰일 때만 표시) -->
        <!-- 단일 항목 상세 정보 (사이드바 호버 뷰 또는 사이드바 상세 뷰) -->
        <div v-if="selectedPartsDataView === 'part-classes' && partsDataStore.selectedPartClass && (sidebarViewMode === 'detail' || sidebarViewMode === 'hover')" class="selected-item-detail">
          <div class="q-pa-md">
            <!-- 타이틀 -->
            <div class="selected-item-title">
              <div class="selected-item-title-en">PART CLASS</div>
              <div class="selected-item-title-ko">부품 분류 정보</div>
            </div>

            <!-- 핵심 정보 -->
            <div class="selected-item-core q-mt-lg">
              <div class="core-info-item">
                <div class="core-info-label">SKU</div>
                <div class="core-info-value">
                  {{ computedSKU || '-' }}
                </div>
              </div>
              <div class="core-info-item">
                <div class="core-info-label">대분류</div>
                <div class="core-info-value">
                  {{ partsDataStore.selectedPartClass.category || '-' }}
                </div>
              </div>
              <div class="core-info-item">
                <div class="core-info-label">클래스명</div>
                <div class="core-info-value">
                  {{ partsDataStore.selectedPartClass.name || '-' }}
                </div>
              </div>
              <div class="core-info-item" v-if="partsDataStore.selectedPartClass.code_name">
                <div class="core-info-label">Code Name</div>
                <div class="core-info-value">{{ partsDataStore.selectedPartClass.code_name }}</div>
              </div>
            </div>

            <!-- 추가 정보 -->
            <div class="selected-item-additional q-mt-lg" v-if="partsDataStore.selectedPartClass.description || partsDataStore.selectedPartClass.example">
              <div class="additional-info-item q-mb-md" v-if="partsDataStore.selectedPartClass.description">
                <div class="additional-info-label">설명</div>
                <div class="additional-info-value">
                  {{ partsDataStore.selectedPartClass.description }}
                </div>
              </div>
              <div class="additional-info-item" v-if="partsDataStore.selectedPartClass.example">
                <div class="additional-info-label">예시</div>
                <div class="additional-info-value">
                  {{ partsDataStore.selectedPartClass.example }}
                </div>
              </div>
            </div>

            <!-- 일반 첨부 파일 -->
            <div class="selected-item-files q-mt-lg" v-if="attachedFiles.length > 0">
              <div class="files-list">
                <!-- 호버 뷰: 이미지 파일은 설정된 수량만큼만 표시 -->
                <template v-if="isHoverView">
                  <!-- 이미지 파일 (설정된 수량만큼) -->
                  <div v-for="file in hoverViewRegularFileImages" :key="file.id" class="file-item q-mb-sm">
                    <div class="file-image-preview">
                      <img :src="getFileUrl(file.file_path)" :alt="file.original_filename" @error="handleImageError" />
                    </div>
                  </div>
                  <!-- 일반 파일은 모두 표시 -->
                  <div v-for="file in attachedFiles.filter((f) => !isImageFile(f))" :key="file.id" class="file-item q-mb-sm">
                    <div class="file-name-item">
                      <!-- 아이콘이 URL이면 이미지로, 아니면 Material Icons로 렌더링 -->
                      <q-icon v-if="!isIconUrl(getFileIcon(file))" :name="getFileIcon(file)" size="16px" class="q-mr-xs" />
                      <img v-else :src="getFileIcon(file)" alt="File icon" style="margin-right: 6px; object-fit: contain" />
                      <span class="file-name-text" :style="{ color: getFileColor(file) }">
                        <span class="file-name-content">{{ file.original_filename }}</span>
                        <q-icon name="download" size="22px" class="download-icon q-ml-xs" @click.stop="downloadFile(file)" />
                      </span>
                    </div>
                  </div>
                </template>
                <!-- 상세 보기: 모든 파일 표시 -->
                <template v-else-if="isDetailView">
                  <div v-for="file in attachedFiles" :key="file.id" class="file-item q-mb-sm">
                    <!-- 이미지 파일인 경우 -->
                    <div v-if="isImageFile(file)" class="file-image-preview">
                      <img :src="getFileUrl(file.file_path)" :alt="file.original_filename" @error="handleImageError" />
                    </div>
                    <!-- 일반 파일인 경우 -->
                    <div v-else class="file-name-item">
                      <!-- 아이콘이 URL이면 이미지로, 아니면 Material Icons로 렌더링 -->
                      <q-icon v-if="!isIconUrl(getFileIcon(file))" :name="getFileIcon(file)" size="16px" class="q-mr-xs" />
                      <img v-else :src="getFileIcon(file)" alt="File icon" style="margin-right: 6px; object-fit: contain" />
                      <span class="file-name-text" :style="{ color: getFileColor(file) }">
                        <span class="file-name-content">{{ file.original_filename }}</span>
                        <q-icon name="download" size="22px" class="download-icon q-ml-xs" @click.stop="downloadFile(file)" />
                      </span>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- 에디터 이미지 (상세설명에 포함된 이미지) -->
            <div class="selected-item-editor-images q-mt-lg" v-if="editorImages.length > 0">
              <div class="text-caption text-grey-6 q-mb-sm" style="opacity: 0.7">상세설명에 포함된 이미지입니다</div>
              <div class="editor-images-list">
                <!-- 호버 뷰: 설정된 수량만큼만 표시 -->
                <template v-if="isHoverView">
                  <div v-for="file in hoverViewEditorImages" :key="file.id" class="editor-image-item q-mb-sm">
                    <div class="editor-image-preview">
                      <img :src="getFileUrl(file.file_path)" :alt="file.original_filename" @error="handleImageError" />
                    </div>
                  </div>
                </template>
                <!-- 상세 보기: 모든 이미지 표시 -->
                <template v-else-if="isDetailView">
                  <div v-for="file in detailViewEditorImages" :key="file.id" class="editor-image-item q-mb-sm">
                    <div class="editor-image-preview">
                      <img :src="getFileUrl(file.file_path)" :alt="file.original_filename" @error="handleImageError" />
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <!-- 상세설명 (Tiptap 에디터 콘텐츠) -->
            <div class="selected-item-detailed-description q-mt-lg" v-if="partsDataStore.selectedPartClass?.detailed_description">
              <DetailedDescriptionViewer :html-content="partsDataStore.selectedPartClass.detailed_description" :max-text-length="200" />
            </div>

            <!-- 상세 모드 UI (QR 코드, 바코드 등) -->
            <div
              v-if="partsDataStore.isSidebarDetailViewActive"
              class="selected-item-detail-mode q-mt-lg"
              :data-debug="`isSidebarDetailViewActive: ${partsDataStore.isSidebarDetailViewActive}, selectedPartClass: ${partsDataStore.selectedPartClass?.id}, selectedPartClasses: ${partsDataStore.selectedPartClasses.length}`"
            >
              <div class="detail-mode-guide q-mb-md">
                <!-- 사이드바 호버 뷰로 전환 버튼 -->
                <div class="q-mb-sm" style="padding: 0; margin: 0">
                  <q-btn
                    flat
                    dense
                    size="md"
                    color="primary"
                    icon="explore"
                    label="사이드바 호버 뷰로 전환"
                    @click="exitSidebarDetailView"
                    class="detail-mode-exit-btn"
                    style="font-size: 16px; font-weight: 900; padding: 8px 16px; margin: 0; width: 100%; border: 1px solid var(--q-primary); border-radius: 6px; text-align: center"
                  />
                </div>
                <!-- 안내 메시지 -->
                <div class="text-caption" style="display: flex; align-items: flex-start; gap: 2px; padding-left: 0; margin-left: 0; color: var(--q-primary); line-height: 1.2">
                  <q-icon name="info" size="16px" color="primary" style="flex-shrink: 0; margin-top: 2px" />
                  <span style="white-space: normal; word-break: break-word; line-height: 1.2; margin-top: 2px"> 사이드바 상세 뷰 모드입니다. 더블 클릭 또는 위 버튼으로 사이드바 호버 뷰로 전환할 수 있습니다. </span>
                </div>
              </div>

              <!-- QR 코드 -->
              <div class="qr-code-preview q-mb-md">
                <div class="qr-code-placeholder">
                  <div v-if="qrCodeGenerating" class="qr-code-loading">
                    <q-spinner color="primary" size="40px" />
                  </div>
                  <img v-else-if="qrCodeUrl" :src="qrCodeUrl" alt="QR Code" class="qr-code-image" />
                  <div v-else class="qr-code-empty text-caption text-grey-6">QR 코드 생성 중...</div>
                  <div class="qr-code-label text-caption text-grey-6 q-mt-sm">
                    {{ computedSKU || 'QR Code' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 메타 정보 -->
            <div class="selected-item-meta q-mt-xs">
              <div class="meta-info-item" v-if="partsDataStore.selectedPartClass.created_at || partsDataStore.selectedPartClass.updated_at" style="display: flex; gap: 6px; flex-wrap: wrap">
                <div v-if="partsDataStore.selectedPartClass.created_at" style="display: flex; gap: 4px">
                  <span class="meta-info-label">생성일:</span>
                  <span class="meta-info-value">{{ formatDateTime(partsDataStore.selectedPartClass.created_at) }}</span>
                </div>
                <div v-if="partsDataStore.selectedPartClass.updated_at" style="display: flex; gap: 4px">
                  <span class="meta-info-label">수정일:</span>
                  <span class="meta-info-value">{{ formatDateTime(partsDataStore.selectedPartClass.updated_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 사이드바 멀티 셀렉션 뷰 (2개 이상 선택) -->
        <div v-if="selectedPartsDataView === 'part-classes' && sidebarViewMode === 'multi'" class="selected-items-multi">
          <div class="q-pa-md">
            <!-- 상세 모드 UI (QR 코드, 바코드 등) - 멀티 셀렉션 뷰에도 버튼 표시 -->
            <div v-if="partsDataStore.isSidebarDetailViewActive" class="selected-item-detail-mode q-mb-md">
              <div class="detail-mode-guide q-mb-md">
                <!-- 사이드바 호버 뷰로 전환 버튼 -->
                <div class="q-mb-sm" style="padding: 0; margin: 0">
                  <q-btn
                    flat
                    dense
                    size="md"
                    color="primary"
                    icon="explore"
                    label="사이드바 호버 뷰로 전환"
                    @click="exitSidebarDetailView"
                    class="detail-mode-exit-btn"
                    style="font-size: 16px; font-weight: 900; padding: 8px 16px; margin: 0; width: 100%; border: 1px solid var(--q-primary); border-radius: 6px; text-align: center"
                  />
                </div>
                <!-- 안내 메시지 -->
                <div class="text-caption" style="display: flex; align-items: flex-start; gap: 2px; padding-left: 0; margin-left: 0; color: var(--q-primary); line-height: 1.2">
                  <q-icon name="info" size="16px" color="primary" style="flex-shrink: 0; margin-top: 2px" />
                  <span style="white-space: normal; word-break: break-word; line-height: 1.2; margin-top: 2px"> 사이드바 상세 뷰 모드입니다. 더블 클릭 또는 위 버튼으로 사이드바 호버 뷰로 전환할 수 있습니다. </span>
                </div>
              </div>
            </div>

            <!-- 헤더: 수량 -->
            <div class="multi-header q-mb-md">
              <div class="multi-title">
                <div class="multi-title-en">SELECTED ITEMS</div>
                <div class="multi-title-ko">선택된 항목</div>
              </div>
              <div class="multi-count-badge q-mt-sm">
                <q-icon name="check_circle" size="18px" color="primary" class="q-mr-xs" />
                <span class="multi-count-text">{{ partsDataStore.selectedPartClasses.length }}개 선택됨</span>
              </div>
            </div>

            <!-- 선택된 항목 리스트 (카드 형태) -->
            <div class="multi-items-scroll">
              <div v-for="item in partsDataStore.selectedPartClasses" :key="item.id" class="multi-item-card row items-center justify-between q-pa-sm q-mb-xs">
                <div class="multi-item-main column">
                  <div class="multi-item-name">
                    <span class="multi-item-id">#{{ item.id }}</span>
                    <span class="multi-item-text">{{ item.name || '(이름 없음)' }}</span>
                  </div>
                  <div class="multi-item-meta text-caption">
                    <span class="multi-item-category">{{ item.category || '-' }}</span>
                    <span class="multi-item-code" v-if="item.c_code"> · {{ item.c_code }}</span>
                  </div>
                </div>

                <!-- 아이템별 액션 영역 -->
                <div class="multi-item-actions row items-center q-ml-md">
                  <q-btn flat round dense size="md" icon="edit" color="primary" @click="editListItem(item)" class="q-mr-xs">
                    <q-tooltip>수정</q-tooltip>
                  </q-btn>

                  <q-btn flat round dense size="md" icon="delete" color="negative" @click="deleteListItem(item)">
                    <q-tooltip>삭제</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 휴지통 푸터 (부품 데이터 모드일 때만, 사이드바 하단 근처에 고정 느낌으로) -->
      <div v-if="sidebarMode === 'parts-data'" class="trash-footer-wrapper">
        <q-btn flat dense no-caps class="trash-footer-btn full-width" @click="handleOpenTrash">
          <div class="row items-center justify-between full-width">
            <div class="row items-center">
              <q-icon name="delete_outline" size="16px" class="q-mr-xs trash-footer-icon" />
              <span class="text-caption trash-footer-text">휴지통</span>
            </div>
            <div class="row items-center">
              <q-badge v-if="trashCount > 0" color="grey-7" text-color="white" dense :label="trashCount" />
            </div>
          </div>
        </q-btn>
      </div>
    </q-list>

    <!--부품함 배치 공간 추가 다이얼로그 -->
    <AddSpaceForm v-model="showAddSpaceDialog" @created="handleSpaceCreated" />

    <!-- 스토리지 블록 추가 다이얼로그 -->
    <AddStorageBlockForm v-if="selectedParentSpaceId" v-model="showAddStorageBlockDialog" :parent-space-id="selectedParentSpaceId" @created="handleStorageBlockCreated" />

    <!-- 부품함 모델 관리 모달 -->
    <BinModelManagementModal v-model="showBinModelDialog" />

    <!-- 부품함 배치 공간 관리 모달 -->
    <SpaceManagementModal v-model="showSpaceManagementDialog" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { usePartsManagementStore } from 'src/system/store/partsManagementStore'
import { usePartsDataStore } from 'src/system/store/partsDataStore'
import { useClearURLState } from 'src/system/composables/url-state'
import QRCode from 'qrcode'
import SpaceTreeNavItem from 'src/components/parts-management/SpaceTreeNavItem.vue'
import AddSpaceForm from 'src/components/parts-management/form/AddSpaceForm.vue'
import AddStorageBlockForm from 'src/components/parts-management/form/AddStorageBlockForm.vue'
import TemporaryBinStorage from 'src/components/parts-management/TemporaryBinStorage.vue'
import BinModelManagementModal from 'src/components/parts-management/BinModelManagementModal.vue'
import SpaceManagementModal from 'src/components/parts-management/SpaceManagementModal.vue'
import DetailedDescriptionViewer from 'src/components/parts-management/DetailedDescriptionViewer.vue'
import { getFileIcon as getFileIconFromConfig, isIconUrl, getFileColor } from 'src/config/fileTypes.js'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const partsStore = usePartsManagementStore()
const partsDataStore = usePartsDataStore()

// 사이드바 모드 상태 (store에서 가져옴)
const sidebarMode = computed({
  get: () => partsStore.sidebarMode,
  set: (value) => partsStore.setSidebarMode(value),
})

// 부품 데이터 관리 뷰 선택 상태 (store에서 가져옴)
const selectedPartsDataView = computed({
  get: () => partsStore.selectedPartsDataView,
  set: (value) => partsStore.setSelectedPartsDataView(value),
})

// URL 상태 제거 (useClearURLState 사용)
const { clearURLState } = useClearURLState({
  useNextTick: true, // State 변경으로 인한 URL 업데이트 이후에 실행
})

// 공유 URL 필터 제거 함수 (선택 항목 및 필터 조건 모두 제거)
// 기존 함수명 유지 (호환성)
function clearSharedUrlFilter() {
  clearURLState() // 기본 공유 파라미터 제거
}

// 사이드바 모드 변경 핸들러 (단순화: 모드 변경만 처리)
function handleSidebarModeChange(newMode) {
  // null 상태에서 physical로 변경하는 경우도 처리 (초기 진입 시 탭 표시와 실제 렌더링 일치)
  if (partsStore.sidebarMode === newMode && partsStore.sidebarMode !== null) {
    return
  }

  // 모드 변경 (useURLState가 자동으로 URL 업데이트)
  partsStore.setSidebarMode(newMode)

  // 공유 URL 필터 제거 (nextTick으로 State 변경으로 인한 URL 업데이트 이후에 실행)
  nextTick(() => {
    clearSharedUrlFilter()
  })
}

// 테이블 뷰 변경 핸들러 (단순화: 뷰 변경만 처리)
function handleViewChange(viewName) {
  // 뷰 변경 (useURLState가 자동으로 URL 업데이트)
  partsStore.setSelectedPartsDataView(viewName)

  // 공유 URL 필터 제거 (nextTick으로 State 변경으로 인한 URL 업데이트 이후에 실행)
  nextTick(() => {
    clearSharedUrlFilter()
  })
}

const rootNodes = computed(() => partsStore.getRootNodes)
const hasSpaces = computed(() => rootNodes.value && rootNodes.value.length > 0)
const selectedStorageRowId = computed(() => partsStore.selectedStorageRow?.id || null)

// 사이드바 뷰 모드 판단 (호버/상세/멀티)
const sidebarViewMode = computed(() => {
  const count = partsDataStore.selectedPartClasses.length
  if (count === 0) return 'hover' // 사이드바 호버 뷰 (빠른 미리보기)
  if (count === 1) return 'detail' // 사이드바 상세 뷰
  return 'multi' // 사이드바 멀티 셀렉션 뷰 (2개 이상)
})

// 호버 뷰 여부 (상세 보기가 아닐 때)
const isHoverView = computed(() => {
  return sidebarViewMode.value === 'hover' || (sidebarViewMode.value === 'detail' && !partsDataStore.isSidebarDetailViewActive)
})

// 상세 보기 여부
const isDetailView = computed(() => {
  return sidebarViewMode.value === 'detail' && partsDataStore.isSidebarDetailViewActive
})

// SKU 계산 (d_code + c_code 조합)
const computedSKU = computed(() => {
  const selectedClass = partsDataStore.selectedPartClass
  if (!selectedClass) return null

  const dCode = selectedClass.d_code
  const cCode = selectedClass.c_code

  // d_code와 c_code가 모두 있어야 SKU 생성 가능
  if (!dCode || !cCode) return null

  // SKU 형식: {d_code}-{c_code}
  return `${dCode}-${cCode}`
})

// 휴지통 개수 (간단 통계 표시용)
const trashCount = computed(() => partsDataStore.trashCount)

// 리스트 모드 항목 편집
function editListItem(item) {
  // PartClassesView의 편집 함수 호출 필요
  // 임시로 이벤트 발생
  window.dispatchEvent(new CustomEvent('edit-part-class', { detail: item }))
}

// 리스트 모드 항목 삭제
function deleteListItem(item) {
  // PartClassesView의 삭제 함수 호출 필요
  // 임시로 이벤트 발생
  window.dispatchEvent(new CustomEvent('delete-part-class', { detail: item }))
}

// 휴지통 버튼 클릭 핸들러
async function handleOpenTrash() {
  try {
    // 공유 URL 필터(sel) 제거
    clearURLState(['selected'])

    // 데이터 동기화
    await partsDataStore.fetchTrashCount().catch(() => {})
    await partsDataStore.fetchTrashPartClasses().catch(() => {})

    // 우측 컨텐츠를 휴지통 뷰로 전환
    partsStore.setSidebarMode('parts-data')
    partsStore.setSelectedPartsDataView('part-classes-trash')
  } catch (error) {
    console.error('[PartsManagementSidebar] 휴지통 데이터 로드 실패:', error)
  }
}

// 사이드바 초기 로드시 한 번 휴지통 개수 동기화
onMounted(() => {
  partsDataStore.fetchTrashCount().catch(() => {})
})

// QR 코드 이미지 URL
const qrCodeUrl = ref('')
const qrCodeGenerating = ref(false)

// QR 코드 생성 함수
async function generateQRCode() {
  const selectedClass = partsDataStore.selectedPartClass
  if (!selectedClass) {
    qrCodeUrl.value = ''
    return
  }

  // QR 코드에 포함할 데이터 (SKU 우선, 없으면 ID 사용)
  const qrData = computedSKU.value || `PART-CLASS-${selectedClass.id}`

  try {
    qrCodeGenerating.value = true
    // QR 코드 생성 (Data URL로 반환)
    const dataUrl = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#F5F5F5', // 밝은 그레이 배경 (인식률 유지)
      },
    })
    qrCodeUrl.value = dataUrl
  } catch (error) {
    console.error('QR 코드 생성 실패:', error)
    qrCodeUrl.value = ''
  } finally {
    qrCodeGenerating.value = false
  }
}

// 선택된 부품 분류나 SKU 변경 시 QR 코드 재생성
watch(
  [() => partsDataStore.selectedPartClass?.id, computedSKU],
  () => {
    if (partsDataStore.isSidebarDetailViewActive && partsDataStore.selectedPartClass) {
      generateQRCode()
    } else {
      qrCodeUrl.value = ''
    }
  },
  { immediate: true },
)

// 상세 모드 변경 시 QR 코드 생성/제거
watch(
  () => partsDataStore.isSidebarDetailViewActive,
  (isSidebarDetailViewActive) => {
    if (isSidebarDetailViewActive && partsDataStore.selectedPartClass) {
      generateQRCode()
    } else {
      qrCodeUrl.value = ''
    }
  },
)

// 상세 모드 해제 함수
// 사이드바 상세 뷰 해제 (사이드바 호버 뷰로 전환)
function exitSidebarDetailView() {
  partsDataStore.isSidebarDetailViewActive = false
  partsDataStore.selectedPartClass = null
}

// 통계 데이터
const stats = ref({
  totalClasses: 0,
  totalTypes: 0,
  totalParts: 0,
  totalSpaces: 0,
})

// 통계 데이터 로드
async function loadStats() {
  try {
    await Promise.all([partsDataStore.fetchPartClasses(), partsDataStore.fetchPartModels(), partsDataStore.fetchPartSpecs()])

    stats.value = {
      totalClasses: partsDataStore.partClasses.length,
      totalTypes: partsDataStore.partModels.length,
      totalParts: partsDataStore.partSpecs.length,
      totalSpaces: rootNodes.value.length,
    }
  } catch {
    // 통계 데이터 로드 실패 시 기본값 유지
  }
}

// 첨부 파일 목록 (일반 파일만)
const attachedFiles = ref([])
// 에디터 이미지 목록
const editorImages = ref([])

// 현재 뷰모드 설정에서 사이드바 네비게이션 설정 가져오기
const viewModeSettingsStorageKey = 'part-classes-view-mode-settings'
const currentViewMode = ref('table') // 기본값: table

// localStorage에서 현재 뷰모드 읽기
function getCurrentViewMode() {
  try {
    const storageKey = 'part-classes-view-mode'
    let saved = localStorage.getItem(storageKey)
    
    // 새 키에 없으면 구형 키에서 확인 (하위 호환성)
    if (!saved) {
      const oldKey = 'NEXA-part-classes-view-mode'
      saved = localStorage.getItem(oldKey)
      // 구형 키에서 찾았으면 새 키로 마이그레이션
      if (saved) {
        localStorage.setItem(storageKey, saved)
        localStorage.removeItem(oldKey)
      }
    }
    
    if (saved && ['table', 'card', 'list', 'gallery', 'timeline', 'chart'].includes(saved)) {
      return saved
    }
  } catch (error) {
    console.error('뷰 모드 읽기 실패:', error)
  }
  return 'table'
}

// 현재 뷰모드 설정에서 사이드바 네비게이션 설정 가져오기
function getSidebarNavigationSettings() {
  try {
    const viewMode = getCurrentViewMode()
    let stored = localStorage.getItem(viewModeSettingsStorageKey)
    
    // 새 키에 없으면 구형 키에서 확인 (하위 호환성)
    if (!stored) {
      const oldKey = 'NEXA-part-classes-view-mode-settings'
      stored = localStorage.getItem(oldKey)
      // 구형 키에서 찾았으면 새 키로 마이그레이션
      if (stored) {
        localStorage.setItem(viewModeSettingsStorageKey, stored)
        localStorage.removeItem(oldKey)
      }
    }
    
    if (stored) {
      const allSettings = JSON.parse(stored)
      const viewSettings = allSettings[viewMode]
      if (viewSettings && viewSettings.sidebarNavigation) {
        return viewSettings.sidebarNavigation
      }
    }
  } catch (error) {
    console.error('사이드바 네비게이션 설정 로드 실패:', error)
  }
  // 기본값 반환
  return {
    hoverView: {
      maxRegularFileImages: 1,
      maxEditorImages: 1,
    },
  }
}

// 사이드바 네비게이션 설정 (computed로 반응형 유지)
const sidebarNavSettings = computed(() => getSidebarNavigationSettings())

// 호버 뷰에서 표시할 일반 첨부 파일 이미지 (설정된 수량만큼만)
const hoverViewRegularFileImages = computed(() => {
  const maxCount = sidebarNavSettings.value?.hoverView?.maxRegularFileImages ?? 1
  return attachedFiles.value.filter((file) => isImageFile(file)).slice(0, maxCount)
})

// 호버 뷰에서 표시할 에디터 이미지 (설정된 수량만큼만)
const hoverViewEditorImages = computed(() => {
  const maxCount = sidebarNavSettings.value?.hoverView?.maxEditorImages ?? 1
  return editorImages.value.filter((file) => isImageFile(file)).slice(0, maxCount)
})

// 상세 보기에서 표시할 모든 에디터 이미지
const detailViewEditorImages = computed(() => {
  return editorImages.value.filter((file) => isImageFile(file))
})

// 뷰모드 변경 감지 (localStorage 감시)
let viewModeCheckInterval = null
function startViewModeWatcher() {
  viewModeCheckInterval = setInterval(() => {
    const newViewMode = getCurrentViewMode()
    if (newViewMode !== currentViewMode.value) {
      currentViewMode.value = newViewMode
    }
  }, 500) // 500ms마다 체크
}

// 다이얼로그 상태
const showAddSpaceDialog = ref(false)
const showAddStorageBlockDialog = ref(false)
const showBinModelDialog = ref(false)
const showSpaceManagementDialog = ref(false)
const selectedParentSpaceId = ref(null)

// 임시 보관소 위치 상태
const isTemporaryStorageFixed = ref(false)
const temporaryStorageRef = ref(null)
const qListRef = ref(null)
const needsSticky = ref(false) // 스크롤이 필요할 때만 sticky 적용

// 드래그 앤 드롭 상태
const draggedIndex = ref(null)
const dragOverIndex = ref(null)

const handlePositionChanged = (isFixed) => {
  isTemporaryStorageFixed.value = isFixed
}

// 스크롤 가능 여부 체크
function checkScrollable() {
  nextTick(() => {
    if (qListRef.value) {
      const listElement = qListRef.value.$el || qListRef.value
      // scrollHeight가 clientHeight보다 크면 스크롤 가능
      needsSticky.value = listElement.scrollHeight > listElement.clientHeight
    }
  })
}

// 메뉴 변경 감지
watch(
  [hasSpaces, rootNodes],
  () => {
    checkScrollable()
  },
  { deep: true },
)

// 통계 업데이트 감지
watch([() => rootNodes.value.length, () => partsDataStore.partClasses.length, () => partsDataStore.partModels.length, () => partsDataStore.partSpecs.length], () => {
  stats.value = {
    totalClasses: partsDataStore.partClasses.length,
    totalTypes: partsDataStore.partModels.length,
    totalParts: partsDataStore.partSpecs.length,
    totalSpaces: rootNodes.value.length,
  }
})

// 선택된 부품 분류 변경 시 파일 목록 로드
watch(
  () => partsDataStore.selectedPartClass?.id,
  async (newId) => {
    if (newId) {
      try {
        // 일반 첨부 파일과 에디터 이미지를 구분하여 로드
        const [regularFiles, editorImagesData] = await Promise.all([partsDataStore.fetchPartClassRegularFiles(newId), partsDataStore.fetchPartClassEditorImages(newId)])
        attachedFiles.value = regularFiles
        editorImages.value = editorImagesData
      } catch {
        attachedFiles.value = []
        editorImages.value = []
      }
    } else {
      attachedFiles.value = []
      editorImages.value = []
    }
  },
  { immediate: true },
)

// 이미지 파일인지 확인 (file_type 또는 file_extension 모두 확인)
function isImageFile(file) {
  if (!file) return false

  // file_type 확인
  if (file.file_type) {
    const type = String(file.file_type).toLowerCase().trim()
    if (type === 'image' || type.startsWith('image/')) {
      return true
    }
  }

  // file_extension 확인
  if (file.file_extension) {
    const ext = String(file.file_extension).toLowerCase().trim()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
      return true
    }
  }

  // 원본 파일명에서 확장자 추출하여 확인
  if (file.original_filename) {
    const filename = String(file.original_filename).toLowerCase()
    const ext = filename.split('.').pop()
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
      return true
    }
  }

  return false
}

// 파일 아이콘 가져오기 (fileTypes.js 설정 사용)
function getFileIcon(file) {
  return getFileIconFromConfig(file)
}

// 파일 URL 생성
function getFileUrl(filePath) {
  if (!filePath) {
    return ''
  }

  // 서버 기본 URL 가져오기 (API_BASE_URL에서 /api 제거)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
  const baseUrl = apiBaseUrl.replace(/\/api\/?$/, '') || 'http://localhost:3000'

  // 이미 절대 URL인 경우 그대로 반환
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath
  }

  // 경로 부분을 URL 인코딩 (한글 경로 처리)
  // 브라우저가 img src에 자동으로 인코딩하지만, 명시적으로 인코딩하여 일관성 유지
  // 경로를 슬래시로 분리하여 각 부분을 인코딩 (슬래시는 인코딩하지 않음)
  let encodedPath = ''
  if (filePath.startsWith('uploads/')) {
    // uploads/ 이후의 경로만 인코딩
    const pathAfterUploads = filePath.substring(8) // 'uploads/'.length = 8
    const pathParts = pathAfterUploads.split('/')
    encodedPath = 'uploads/' + pathParts.map((part) => encodeURIComponent(part)).join('/')
  } else {
    // uploads/ 접두사 추가 후 인코딩
    const pathParts = filePath.split('/')
    encodedPath = 'uploads/' + pathParts.map((part) => encodeURIComponent(part)).join('/')
  }

  const finalUrl = `${baseUrl}/${encodedPath}`

  return finalUrl
}

// 파일 다운로드
async function downloadFile(file) {
  if (!file || !file.id) {
    $q.notify({
      type: 'warning',
      message: '파일 정보가 없습니다.',
    })
    return
  }

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    const downloadUrl = `${apiBaseUrl}/part-files/${file.id}/download`

    // fetch를 사용하여 파일을 blob으로 받아온 후 다운로드
    const response = await fetch(downloadUrl)

    if (!response.ok) {
      throw new Error(`다운로드 실패: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = file.original_filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // 메모리 정리
    window.URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: '다운로드가 시작되었습니다.',
      timeout: 2000,
    })
  } catch (error) {
    console.error('파일 다운로드 실패:', error)
    $q.notify({
      type: 'negative',
      message: '다운로드에 실패했습니다.',
      caption: error.message,
    })
  }
}

// 이미지 로드 실패 처리
function handleImageError(event) {
  // 이미지 로드 실패 시 기본 아이콘으로 대체
  event.target.style.display = 'none'
  const parent = event.target.parentElement
  if (parent) {
    parent.innerHTML = `
      <q-icon name="broken_image" size="24px" />
      <div class="text-caption text-grey-6 q-mt-xs">이미지를 불러올 수 없습니다</div>
    `
  }
}

let resizeObserver = null
let mutationObserver = null

onMounted(() => {
  checkScrollable()
  loadStats()

  // 뷰모드 감시 시작
  currentViewMode.value = getCurrentViewMode()
  startViewModeWatcher()

  // 초기 진입 시 sidebarMode가 null이면 physical로 설정 (탭 표시와 실제 렌더링 일치)
  if (partsStore.sidebarMode === null) {
    partsStore.setSidebarMode('physical')
  }

  // 리사이즈 이벤트 감지
  window.addEventListener('resize', checkScrollable)

  // DOM 변경 감지 (메뉴 확장/축소 시)
  nextTick(() => {
    if (qListRef.value) {
      const listElement = qListRef.value.$el || qListRef.value

      // MutationObserver로 DOM 변경 감지
      mutationObserver = new MutationObserver(() => {
        checkScrollable()
      })
      mutationObserver.observe(listElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class'],
      })

      // ResizeObserver로 크기 변경 감지
      resizeObserver = new ResizeObserver(() => {
        checkScrollable()
      })
      resizeObserver.observe(listElement)
    }
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScrollable)
  if (mutationObserver) {
    mutationObserver.disconnect()
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
  // 뷰모드 감시 중지
  if (viewModeCheckInterval) {
    clearInterval(viewModeCheckInterval)
    viewModeCheckInterval = null
  }
})

function handleSpaceCreated(space) {
  // 공간 생성 후 자동으로 확장
  partsStore.updateNode(space.id, { expanded: true })
}

function handleStorageBlockCreated(block) {
  // 스토리지 블록 생성 후 부모 공간 확장
  if (block.parentId) {
    partsStore.updateNode(block.parentId, { expanded: true })
  }
  // 다이얼로그 닫기 및 상태 초기화
  showAddStorageBlockDialog.value = false
  selectedParentSpaceId.value = null
}

function handleOpenAddStorageBlockDialog(parentSpaceId) {
  selectedParentSpaceId.value = parentSpaceId
  showAddStorageBlockDialog.value = true
}

// 드래그 앤 드롭 핸들러
function handleDragStart(index, event) {
  draggedIndex.value = index
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/html', index)
  event.currentTarget.style.opacity = '0.5'
}

function handleDragEnd(event) {
  event.currentTarget.style.opacity = ''
  draggedIndex.value = null
  dragOverIndex.value = null
}

function handleDragOver(index, event) {
  if (draggedIndex.value === null || draggedIndex.value === index) return
  event.dataTransfer.dropEffect = 'move'
  dragOverIndex.value = index
}

function handleDragEnter(index) {
  if (draggedIndex.value !== null && draggedIndex.value !== index) {
    dragOverIndex.value = index
  }
}

function handleDragLeave() {
  // 드래그가 다른 요소로 이동할 때만 제거
}

function handleDrop(toIndex, event) {
  event.preventDefault()
  const fromIndex = draggedIndex.value

  if (fromIndex === null || fromIndex === toIndex) {
    dragOverIndex.value = null
    return
  }

  const result = partsStore.reorderSpaces(fromIndex, toIndex)
  if (!result.success) {
    // 순서 변경 실패 시 무시
  }

  draggedIndex.value = null
  dragOverIndex.value = null
}

// 날짜 시간 포맷팅 함수
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return ''
  const date = new Date(dateTimeString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}
</script>

<style lang="scss" scoped>
.parts-management-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;

  .sidebar-header {
    background: var(--nexa-surface-header-bg);
    border-bottom: 1px solid var(--nexa-border-color);
  }

  .sidebar-tabs-section {
    background: rgba(0, 0, 0, 0.15) !important;
    padding: 0;
  }

  .sidebar-tabs {
    :deep(.q-tabs__content) {
      background: transparent;
    }

    :deep(.q-tab) {
      flex: 1;
      text-transform: none;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.6);
      transition: all 0.2s;

      &.q-tab--active {
        color: var(--nexa-button-primary-bg);
      }
    }

    :deep(.q-tabs__indicator) {
      background: var(--nexa-button-primary-bg);
      height: 2px;
    }
  }

  .sidebar-mode-content {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }

  .sidebar-buttons-section {
    background: rgba(0, 0, 0, 0.2) !important; // 세 번째로 어두운 색
  }

  .q-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
}

.trash-footer-wrapper {
  flex-shrink: 0;
  padding: 6px 8px 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;

  // 리스트 스크롤 내에서 하단 근처에 고정되는 느낌
  position: sticky;
  bottom: 0;
  z-index: 5;
}

.trash-footer-btn {
  background: transparent !important;
  color: rgba(255, 255, 255, 0.45) !important;
  justify-content: flex-start;
  padding: 4px 6px;
  border-radius: 4px;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  .trash-footer-text {
    opacity: 0.85;
  }
}

.trash-footer-btn:hover {
  background: rgba(255, 255, 255, 0.06) !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

.trash-footer-icon {
  color: rgba(255, 255, 255, 0.5);
}

.trash-footer-btn:hover .trash-footer-icon {
  color: rgba(255, 255, 255, 0.9);
}

.temporary-storage-wrapper {
  flex-shrink: 0;
  padding: 12px;
  border-top: none; // 라인 제거
  background: transparent; // 배경 제거

  // 스크롤이 필요할 때만 sticky로 하단 고정 (스크롤해도 항상 보임)
  &.temporary-storage-bottom.is-sticky {
    position: sticky;
    bottom: 0;
    z-index: 10;
    background: var(--nexa-bg); // 배경색 설정하여 메뉴 위에 표시
  }

  // fixed 위치일 때는 사이드바 내부에서 공간 차지 안 함
  &.is-fixed {
    height: 0;
    padding: 0;
    border: none;
    overflow: hidden;
    position: static; // sticky 해제
  }
}

.draggable-space-item {
  cursor: grab;
  transition:
    background-color 0.2s,
    opacity 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.02);
  }

  &.is-dragging {
    opacity: 0.5;
    cursor: grabbing;
  }

  &.drag-over {
    background-color: rgba(33, 150, 243, 0.1);
    border-top: 2px solid rgba(33, 150, 243, 0.5);
  }

  &:active {
    cursor: grabbing;
  }
}

.active-menu {
  background-color: rgba(65, 170, 223, 0.15) !important;
  border-left: 3px solid var(--nexa-button-primary-bg);
}

.welcome-section {
  text-align: center;
}

.stats-summary-section {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .stat-item {
      background: rgba(0, 0, 0, 0.15);
      border-radius: 4px;
      padding: 12px;
      text-align: center;
      transition: background-color 0.2s;

      &:hover {
        background: rgba(0, 0, 0, 0.25);
      }

      .stat-label {
        margin-bottom: 4px;
      }

      .stat-value {
        font-weight: 600;
      }
    }
  }
}

// 빠른 탐색 모드 기본 화면 스타일
.quick-explore-default {
  border-top: 1px solid var(--nexa-border-color);
  margin-top: 8px;

  .quick-explore-stats {
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;

      .stat-card {
        background: var(--nexa-bg-secondary);
        border: 1px solid var(--nexa-border-color);
        border-radius: 6px;
        padding: 12px 8px;
        text-align: center;
        transition: all 0.2s;

        &:hover {
          background: var(--nexa-bg-secondary);
          border-color: var(--q-primary);
        }

        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: var(--q-primary);
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 11px;
          color: var(--nexa-text-primary);
          opacity: 0.7;
          line-height: 1.2;
        }
      }
    }
  }

  .quick-explore-guide {
    .guide-content {
      .guide-item {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        padding: 4px 0;

        .q-icon {
          color: var(--q-primary);
          opacity: 0.8;
          margin-top: 2px;
        }
      }
    }
  }
}

.selected-item-detail {
  border-top: 1px solid var(--nexa-border-color);
  margin-top: 8px;
  padding: 10px;

  .selected-item-title {
    color: var(--nexa-text-primary);
    margin-bottom: 16px;

    .selected-item-title-en {
      font-weight: 900;
      text-transform: uppercase;
      font-size: 3.5em;
      line-height: 1.2;
      opacity: 0.4;
      margin-bottom: 4px;
      letter-spacing: 0.05em;
    }

    .selected-item-title-ko {
      font-weight: 400;
      font-size: 1.2em;
      opacity: 0.5;
    }
  }

  .selected-item-core {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .core-info-item {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .core-info-label {
        font-size: 0.8rem;
        color: var(--q-primary);
        opacity: 0.4;
        text-transform: uppercase;
        font-weight: 500;
      }

      .core-info-value {
        font-size: 1.3rem;
        color: var(--q-primary);
        opacity: 0.9;
        font-weight: 500;
        margin-bottom: 0px;
        margin-top: -5px;
      }
    }
  }

  .selected-item-additional {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .additional-info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .additional-info-label {
        font-size: 0.75rem;
        color: var(--nexa-text-primary);
        opacity: 0.6;
        text-transform: uppercase;
        font-weight: 500;
      }

      .additional-info-value {
        font-size: 0.85rem;
        color: var(--nexa-text-primary);
        opacity: 0.7;
        line-height: 1.2;
        white-space: pre-wrap;
        word-break: break-word;
      }
    }
  }

  .selected-item-files {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .files-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .file-item {
      width: 100%;
    }

    .file-image-preview {
      width: 100%;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid var(--nexa-border-color);
      background-color: var(--nexa-bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: auto;
        object-fit: cover;
        display: block;
      }
    }

    .file-name-item {
      display: flex;
      align-items: center;
      padding: 8px;
      border-radius: 4px;
      background-color: var(--nexa-bg-secondary);
      border: 1px solid var(--nexa-border-color);

      .file-name-text {
        font-size: 0.85rem;
        color: var(--nexa-text-primary);
        opacity: 0.8;
        flex: 1;
        min-width: 0; // 텍스트 오버플로우 처리
        display: inline;
        line-height: 1.5;

        .file-name-content {
          word-break: break-all;
          display: inline;
        }

        .download-icon {
          opacity: 0.6;
          transition: all 0.2s ease;
          color: var(--nexa-text-primary);
          cursor: pointer;
          white-space: nowrap;
          display: inline-flex;
          vertical-align: middle;
          margin-left: 4px;

          &:hover {
            opacity: 1;
            color: var(--q-primary);
            transform: scale(1.1);
          }
        }
      }
    }
  }

  .selected-item-editor-images {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .editor-images-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .editor-image-item {
      width: 100%;
    }

    .editor-image-preview {
      width: 100%;
      border-radius: 4px;
      overflow: hidden;
      border: 1px solid var(--nexa-border-color);
      background-color: var(--nexa-bg-secondary);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: auto;
        display: block;
        object-fit: contain;
        max-height: none; // 높이 제한 없음 (사이드 크기에 맞춤)
      }
    }
  }

  // 멀티 셀렉션 모드 스타일
  .selected-items-multi {
    border-top: 1px solid var(--nexa-border-color);
    margin-top: 8px;

    .multi-header {
      .multi-title {
        color: var(--nexa-text-primary);
        margin-bottom: 12px;

        .multi-title-en {
          font-weight: 900;
          text-transform: uppercase;
          font-size: 2.5em;
          line-height: 1.2;
          opacity: 0.4;
          margin-bottom: 4px;
          letter-spacing: 0.05em;
        }

        .multi-title-ko {
          font-weight: 400;
          font-size: 1em;
          opacity: 0.5;
        }
      }

      .multi-count-badge {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: rgba(25, 118, 210, 0.15);
        border-radius: 6px;
        border: 1px solid rgba(25, 118, 210, 0.3);

        .multi-count-text {
          font-size: 14px;
          font-weight: 600;
          color: var(--q-primary);
        }
      }
    }

    .multi-items-scroll {
      max-height: 500px;
      overflow-y: auto;
      padding-right: 4px;

      .multi-item-card {
        border-radius: 6px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        background-color: rgba(0, 0, 0, 0.15);
        transition:
          background-color 0.15s ease,
          border-color 0.15s ease;

        &:hover {
          background-color: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.18);
        }

        .multi-item-main {
          flex: 1 1 auto;
        }

        .multi-item-name {
          display: flex;
          align-items: baseline;
          gap: 6px;

          .multi-item-id {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.5);
          }

          .multi-item-text {
            font-size: 0.85rem;
            color: rgba(65, 220, 8, 0.9);
          }
        }

        .multi-item-meta {
          margin-top: 2px;
          color: rgba(255, 255, 255, 0.55);
        }

        .multi-item-actions {
          flex-shrink: 0;
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }

  .selected-item-detail-mode {
    padding-top: 16px;
    margin-top: 16px;

    .detail-mode-guide {
      background-color: var(--nexa-bg-secondary);
      border-radius: 4px;
      line-height: 1.5;
      padding-left: 0 !important;
      margin-left: 0 !important;
    }

    .detail-mode-exit-btn {
      :deep(.q-btn__content) {
        justify-content: center;
        text-align: center;
      }
    }

    .qr-code-preview {
      display: flex;
      justify-content: center;
      align-items: center;

      .qr-code-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;

        .qr-code-loading {
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: white;
          border: 2px solid var(--nexa-border-color);
          border-radius: 8px;
        }

        .qr-code-image {
          width: 200px;
          height: 200px;
          border: 2px solid var(--nexa-border-color);
          border-radius: 8px;
          background-color: white;
          padding: 10px;
          object-fit: contain;
        }

        .qr-code-empty {
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: white;
          border: 2px solid var(--nexa-border-color);
          border-radius: 8px;
        }

        .qr-code-label {
          text-align: center;
          margin-top: 8px;
        }
      }
    }
  }

  .selected-item-meta {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 4px;

    .meta-info-item {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 8px;

      .meta-info-label {
        font-size: 0.7rem;
        color: var(--nexa-text-primary);
        opacity: 0.5;
        text-transform: uppercase;
      }

      .meta-info-value {
        font-size: 0.7rem;
        color: var(--nexa-text-primary);
        opacity: 0.5;
      }
    }
  }
}
</style>

<!-- v-if로 조건부 렌더링되는 요소들에 대한 전역 스타일 -->
<style lang="scss">
/* 멀티 셀렉션 뷰 스타일 - v-if로 조건부 렌더링되는 요소에 적용 */
.selected-items-multi {
  .multi-title {
    color: var(--q-primary);
    margin-bottom: 12px;

    .multi-title-en {
      font-weight: 900;
      text-transform: uppercase;
      font-size: 2.5em;
      line-height: 1.2;
      opacity: 0.4;
      margin-bottom: 4px;
      letter-spacing: 0.05em;
      color: var(--q-primary);
    }

    .multi-title-ko {
      font-weight: 400;
      font-size: 1em;
      opacity: 0.5;
      color: var(--q-primary);
    }
  }

  .multi-item-card {
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background-color: rgba(0, 0, 0, 0.15);
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.04);
      border-color: rgba(255, 255, 255, 0.18);
    }

    .multi-item-main {
      flex: 1 1 auto;
    }

    .multi-item-name {
      display: flex;
      align-items: baseline;
      gap: 6px;

      .multi-item-id {
        font-size: 0.8rem;
        color: rgba(248, 211, 5, 0.335);
      }

      .multi-item-text {
        font-size: 0.9rem;
        color: rgba(223, 159, 10, 0.9);
      }
    }

    .multi-item-meta {
      margin-top: 2px;
      color: rgba(255, 255, 255, 0.361);
    }

    .multi-item-actions {
      flex-shrink: 0;
      display: flex;
      justify-content: flex-end;
    }
  }
}

/* 호버/상세 뷰 스타일 - 전역 적용 */
.selected-item-detail {
  .selected-item-title {
    color: var(--q-primary);
    margin-bottom: 16px;

    .selected-item-title-en {
      font-weight: 900;
      text-transform: uppercase;
      font-size: 3.5em;
      line-height: 1.2;
      opacity: 0.4;
      margin-bottom: 4px;
      letter-spacing: 0.05em;
      color: var(--q-primary);
    }

    .selected-item-title-ko {
      font-weight: 400;
      font-size: 1.2em;
      opacity: 0.5;
      color: var(--q-primary);
    }
  }

  .core-info-label {
    font-size: 0.8rem;
    color: var(--q-primary);
    opacity: 0.4;
    text-transform: uppercase;
    font-weight: 500;
  }

  .core-info-value {
    font-size: 1.3rem;
    color: var(--q-primary);
    opacity: 0.9;
    font-weight: 500;
    margin-bottom: 0px;
    margin-top: -5px;
  }
}
</style>
