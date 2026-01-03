<template>
  <div class="u2bee-data-management">
    <div class="management-header q-mb-md">
      <div class="text-h6">데이터 관리</div>
      <div class="text-body2 text-grey-7">데이터를 백업하고 관리합니다</div>
    </div>

    <!-- 저장소 사용량 (목업) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">저장소 사용량</div>
        <div class="q-mb-sm">
          <div class="text-body2 text-grey-7 q-mb-xs">사용 중: {{ mockStorage.used }}MB / {{ mockStorage.total }}MB</div>
          <q-linear-progress :value="mockStorage.used / mockStorage.total" color="primary" class="q-mt-sm" />
        </div>
      </q-card-section>
    </q-card>

    <!-- 데이터 관리 옵션 (목업) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">데이터 관리</div>
        <q-list bordered separator>
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="backup" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>백업</q-item-label>
              <q-item-label caption>데이터를 백업합니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat dense label="백업" @click="backupData" />
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="restore" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>복원</q-item-label>
              <q-item-label caption>백업된 데이터를 복원합니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat dense label="복원" @click="restoreData" />
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="file_download" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>내보내기</q-item-label>
              <q-item-label caption>데이터를 파일로 내보냅니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat dense label="내보내기" @click="exportData" />
            </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="file_upload" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>가져오기</q-item-label>
              <q-item-label caption>파일에서 데이터를 가져옵니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat dense label="가져오기" @click="importData" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- 데이터 정리 (목업) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">데이터 정리</div>
        <q-list bordered separator>
          <q-item>
            <q-item-section>
              <q-item-label>오래된 데이터 삭제</q-item-label>
              <q-item-label caption>30일 이상 된 데이터를 삭제합니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat dense label="삭제" color="negative" @click="cleanOldData" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
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
  // TODO: 데이터 백업
}

function restoreData() {
  console.log('Restore data')
  // TODO: 데이터 복원
}

function exportData() {
  console.log('Export data')
  // TODO: 데이터 내보내기
}

function importData() {
  console.log('Import data')
  // TODO: 데이터 가져오기
}

function cleanOldData() {
  console.log('Clean old data')
  // TODO: 오래된 데이터 삭제
}
</script>

<style lang="scss" scoped>
.u2bee-data-management {
  padding: 16px;

  .management-header {
    margin-bottom: 16px;
  }
}
</style>
