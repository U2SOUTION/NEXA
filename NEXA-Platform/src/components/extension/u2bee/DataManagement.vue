<template>
  <!-- Breadcrumb 및 액션 버튼 -->
  <div class="breadcrumb-section">
    <div class="breadcrumb">
      <span class="breadcrumb-item">:: U2BEE</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">데이터 관리</span>
    </div>
    <div class="action-buttons">
      <q-btn flat dense label="백업" size="sm" />
      <q-btn flat dense label="복원" size="sm" />
    </div>
  </div>

  <!-- 저장소 사용량 -->
  <div class="list-section">
    <div class="section-label">저장소 사용량</div>
    <div class="storage-info">
      <div class="storage-text">사용 중: {{ mockStorage.used }}MB / {{ mockStorage.total }}MB</div>
      <q-linear-progress :value="mockStorage.used / mockStorage.total" class="storage-progress" />
    </div>
  </div>

  <!-- 데이터 관리 옵션 -->
  <div class="list-section">
    <div class="section-label">데이터 관리</div>
    <q-list>
      <q-item clickable v-ripple class="management-item" @click="backupData">
        <q-item-section avatar>
          <q-icon name="backup" class="management-icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="management-item-label">백업</q-item-label>
          <q-item-label class="management-item-caption">데이터를 백업합니다</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat dense label="백업" class="management-button" />
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple class="management-item" @click="restoreData">
        <q-item-section avatar>
          <q-icon name="restore" class="management-icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="management-item-label">복원</q-item-label>
          <q-item-label class="management-item-caption">백업된 데이터를 복원합니다</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat dense label="복원" class="management-button" />
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple class="management-item" @click="exportData">
        <q-item-section avatar>
          <q-icon name="file_download" class="management-icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="management-item-label">내보내기</q-item-label>
          <q-item-label class="management-item-caption">데이터를 파일로 내보냅니다</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat dense label="내보내기" class="management-button" />
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple class="management-item" @click="importData">
        <q-item-section avatar>
          <q-icon name="file_upload" class="management-icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="management-item-label">가져오기</q-item-label>
          <q-item-label class="management-item-caption">파일에서 데이터를 가져옵니다</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat dense label="가져오기" class="management-button" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>

  <!-- 데이터 정리 -->
  <div class="list-section">
    <div class="section-label">데이터 정리</div>
    <q-list>
      <q-item class="management-item">
        <q-item-section>
          <q-item-label class="management-item-label">오래된 데이터 삭제</q-item-label>
          <q-item-label class="management-item-caption">30일 이상 된 데이터를 삭제합니다</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn flat dense label="삭제" class="management-button-delete" @click="cleanOldData" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 목업 데이터
const mockStorage = ref({
  used: 5.2,
  total: 10.0,
})

function backupData() {
  console.log('Backup data')
}

function restoreData() {
  console.log('Restore data')
}

function exportData() {
  console.log('Export data')
}

function importData() {
  console.log('Import data')
}

function cleanOldData() {
  console.log('Clean old data')
}
</script>

<style lang="scss" scoped>
.breadcrumb-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.breadcrumb-item {
  color: var(--nexa-text-secondary);

  &.active {
    color: var(--nexa-text-primary);
    font-weight: 600;
  }
}

.breadcrumb-separator {
  color: var(--nexa-text-disabled);
}

.action-buttons {
  color: var(--nexa-text-secondary);
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.list-section {
  margin-bottom: 5px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--nexa-border-color); // 임시 확인용

  &:last-child {
    margin-bottom: 0;
  }
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--nexa-text-primary);
  padding: 12px 0 8px 0;
  border-bottom: 1px solid var(--nexa-border-color);
  margin-bottom: 8px;
}

.storage-info {
  padding: 12px 0;
}

.storage-text {
  font-size: 13px;
  color: var(--nexa-text-secondary);
  margin-bottom: 8px;
}

.storage-progress {
  height: 8px;
  border-radius: 4px;
}

.management-item {
  padding: 8px 0;
}

.management-icon {
  font-size: 24px;
  color: var(--nexa-button-primary-bg);
}

.management-item-label {
  font-size: 14px;
  color: var(--nexa-text-primary);
}

.management-item-caption {
  font-size: 12px;
  color: var(--nexa-text-secondary);
}

.management-button {
  color: var(--nexa-button-primary-bg);
}

.management-button-delete {
  color: var(--nexa-error);
}
</style>
