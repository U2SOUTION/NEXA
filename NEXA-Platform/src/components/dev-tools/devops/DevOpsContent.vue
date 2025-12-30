<template>
  <div class="devops-content">
    <!-- 선택된 항목이 없을 때: 메인 페이지 -->
    <div v-if="!selectedBuild && !selectedDeployment && !selectedEnvironmentVariable && !selectedPackage" class="devops-main-view">
      <!-- 대형 타이틀 -->
      <div class="devops-large-title">DEVOPS</div>

      <!-- BUILD 탭 컨텐츠 -->
      <div v-if="activeTab === 'build'" class="build-tab-content">
        <div class="coming-soon-wrapper">
          <div class="coming-soon-content">
            <q-icon name="build" size="80px" color="grey-7" class="q-mb-md" />
            <h2 class="coming-soon-title">BUILD</h2>
            <p class="coming-soon-description">빌드 도구 기능은 곧 출시될 예정입니다.</p>
          </div>
        </div>
      </div>

      <!-- DEPLOY 탭 컨텐츠 -->
      <div v-else-if="activeTab === 'deploy'" class="deploy-tab-content">
        <div class="coming-soon-wrapper">
          <div class="coming-soon-content">
            <q-icon name="cloud_upload" size="80px" color="grey-7" class="q-mb-md" />
            <h2 class="coming-soon-title">DEPLOY</h2>
            <p class="coming-soon-description">배포 관리 기능은 곧 출시될 예정입니다.</p>
          </div>
        </div>
      </div>

      <!-- ENV 탭 컨텐츠 -->
      <div v-else-if="activeTab === 'env'" class="env-tab-content">
        <div class="coming-soon-wrapper">
          <div class="coming-soon-content">
            <q-icon name="tune" size="80px" color="grey-7" class="q-mb-md" />
            <h2 class="coming-soon-title">ENV</h2>
            <p class="coming-soon-description">환경 변수 관리 기능은 곧 출시될 예정입니다.</p>
          </div>
        </div>
      </div>

      <!-- PACKAGE 탭 컨텐츠 -->
      <div v-else-if="activeTab === 'package'" class="package-tab-content">
        <div class="coming-soon-wrapper">
          <div class="coming-soon-content">
            <q-icon name="inventory_2" size="80px" color="grey-7" class="q-mb-md" />
            <h2 class="coming-soon-title">PACKAGE</h2>
            <p class="coming-soon-description">패키지 관리 기능은 곧 출시될 예정입니다.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 선택된 항목이 있을 때: 상세 페이지 -->
    <div v-else class="devops-detail-view">
      <div class="detail-placeholder q-pa-lg text-center">
        <q-icon name="info" size="48px" color="grey-5" class="q-mb-md" />
        <p class="text-grey-7">상세 정보 (구현 예정)</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

// 활성 탭 (사이드바와 동기화)
const activeTab = ref('build')

// 선택된 항목
const selectedBuild = ref(null)
const selectedDeployment = ref(null)
const selectedEnvironmentVariable = ref(null)
const selectedPackage = ref(null)

// 탭 변경 이벤트 리스너
function handleTabChange(event) {
  const tab = event.detail?.tab
  if (tab) {
    activeTab.value = tab
    // 탭 변경 시 선택 해제
    selectedBuild.value = null
    selectedDeployment.value = null
    selectedEnvironmentVariable.value = null
    selectedPackage.value = null
  }
}

// 빌드 선택 이벤트 리스너
function handleBuildSelected(event) {
  const build = event.detail?.build
  if (build) {
    selectedBuild.value = build
    selectedDeployment.value = null
    selectedEnvironmentVariable.value = null
    selectedPackage.value = null
  }
}

// 배포 선택 이벤트 리스너
function handleDeploymentSelected(event) {
  const deployment = event.detail?.deployment
  if (deployment) {
    selectedDeployment.value = deployment
    selectedBuild.value = null
    selectedEnvironmentVariable.value = null
    selectedPackage.value = null
  }
}

// 환경 변수 선택 이벤트 리스너
function handleEnvironmentVariableSelected(event) {
  const variable = event.detail?.variable
  if (variable) {
    selectedEnvironmentVariable.value = variable
    selectedBuild.value = null
    selectedDeployment.value = null
    selectedPackage.value = null
  }
}

// 패키지 선택 이벤트 리스너
function handlePackageSelected(event) {
  const packageItem = event.detail?.package
  if (packageItem) {
    selectedPackage.value = packageItem
    selectedBuild.value = null
    selectedDeployment.value = null
    selectedEnvironmentVariable.value = null
  }
}

// 메인 페이지로 이동 핸들러
function handleMainPage() {
  selectedBuild.value = null
  selectedDeployment.value = null
  selectedEnvironmentVariable.value = null
  selectedPackage.value = null
}

onMounted(() => {
  window.addEventListener('devops-tab-change', handleTabChange)
  window.addEventListener('devops-build-selected', handleBuildSelected)
  window.addEventListener('devops-deployment-selected', handleDeploymentSelected)
  window.addEventListener('devops-environment-variable-selected', handleEnvironmentVariableSelected)
  window.addEventListener('devops-package-selected', handlePackageSelected)
  window.addEventListener('devops-main-page', handleMainPage)
})

onBeforeUnmount(() => {
  window.removeEventListener('devops-tab-change', handleTabChange)
  window.removeEventListener('devops-build-selected', handleBuildSelected)
  window.removeEventListener('devops-deployment-selected', handleDeploymentSelected)
  window.removeEventListener('devops-environment-variable-selected', handleEnvironmentVariableSelected)
  window.removeEventListener('devops-package-selected', handlePackageSelected)
  window.removeEventListener('devops-main-page', handleMainPage)
})
</script>

<style lang="scss" scoped>
.devops-content {
  height: 100%;
}

.devops-main-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.devops-large-title {
  font-size: 4rem;
  font-weight: 700;
  color: var(--nexa-text-primary);
  margin-bottom: 3rem;
  letter-spacing: 0.5rem;
}

.coming-soon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
}

.coming-soon-content {
  text-align: center;
  padding: 2rem;
}

.coming-soon-title {
  color: var(--nexa-text-primary);
  font-size: 2rem;
  font-weight: 600;
  margin: 1rem 0;
}

.coming-soon-description {
  color: var(--nexa-text-secondary);
  font-size: 1rem;
  margin: 0;
}

.devops-detail-view {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.detail-placeholder {
  text-align: center;
}
</style>
