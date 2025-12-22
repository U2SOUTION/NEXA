<template>
  <q-page class="my-page">
    <div class="q-pa-lg">
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 text-primary q-mb-sm">MY</h1>
        <p class="text-body1 text-grey-7">내 정보 및 등록 기기 관리</p>
      </div>

      <q-tabs v-model="myTab" class="q-mb-lg">
        <q-tab name="profile" label="내 정보" icon="account_circle" />
        <q-tab name="devices" label="등록한 디바이스" icon="devices_other" />
        <q-tab name="equipment" label="등록한 제작 장비" icon="precision_manufacturing" />
        <q-tab name="settings" label="내 기기 설정" icon="settings" />
        <q-tab name="logout" label="로그아웃" icon="logout" />
      </q-tabs>

      <q-tab-panels v-model="myTab" animated>
        <!-- 내 정보 -->
        <q-tab-panel name="profile" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="account_circle" size="24px" class="q-mr-sm" />
            내 정보
          </h3>
          <p class="text-body2 text-grey-7">
            로그인 정보 및 프로필을 관리합니다.
          </p>
        </q-tab-panel>

        <!-- 등록한 디바이스 -->
        <q-tab-panel name="devices" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="devices_other" size="24px" class="q-mr-sm" />
            등록한 디바이스
          </h3>
          <div class="empty-state text-center q-pa-xl">
            <q-icon name="devices_other" size="64px" color="grey-5" class="q-mb-md" />
            <div class="text-h6 text-grey-7 q-mb-sm">등록한 디바이스가 없습니다</div>
            <div class="text-caption text-grey-6">
              디바이스를 등록하여 관리하세요
            </div>
          </div>
        </q-tab-panel>

        <!-- 등록한 제작 장비 -->
        <q-tab-panel name="equipment" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="precision_manufacturing" size="24px" class="q-mr-sm" />
            등록한 제작 장비
          </h3>
          <div class="empty-state text-center q-pa-xl">
            <q-icon name="precision_manufacturing" size="64px" color="grey-5" class="q-mb-md" />
            <div class="text-h6 text-grey-7 q-mb-sm">등록한 제작 장비가 없습니다</div>
            <div class="text-caption text-grey-6">
              제작 장비를 등록하여 관리하세요
            </div>
          </div>
        </q-tab-panel>

        <!-- 내 기기 설정 -->
        <q-tab-panel name="settings" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="settings" size="24px" class="q-mr-sm" />
            내 기기 설정
          </h3>
          <div class="text-body2 text-grey-7">
            등록한 기기의 설정을 관리할 수 있습니다.
          </div>
        </q-tab-panel>

        <!-- 로그아웃 -->
        <q-tab-panel name="logout" class="network-tab-panel">
          <h3 class="text-h6 q-mb-md">
            <q-icon name="logout" size="24px" class="q-mr-sm" />
            로그아웃
          </h3>
          <p class="text-body2 text-grey-7">
            현재 세션에서 로그아웃합니다.
          </p>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const myTab = ref('profile')
</script>

<style lang="scss" scoped>
.my-page {
  background: var(--nexa-background);
  min-height: 100vh;
}

.network-tab-panel {
  counter-reset: section-counter;
  background-color: var(--nexa-background-lower);
  border-radius: 4px;
  padding: 16px 35px;
}
</style>

