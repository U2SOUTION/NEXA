<!-- DevOpsSidebar.vue
  DevOps 왼쪽 사이드바 통합 컴포넌트
  탭 구조: BUILD, DEPLOY, ENV, PACKAGE
  헤더 + 목록
-->

<template>
  <div class="devops-sidebar">
    <!-- 탭 메뉴 -->
    <div class="sidebar-tabs q-pa-sm">
      <q-tabs v-model="activeTab" dense class="text-grey" active-color="primary" indicator-color="primary" align="left">
        <q-tab name="build" label="BUILD" icon="build" />
        <q-tab name="deploy" label="DEPLOY" icon="cloud_upload" />
        <q-tab name="env" label="ENV" icon="tune" />
        <q-tab name="package" label="PACKAGE" icon="inventory_2" />
      </q-tabs>
    </div>

    <!-- BUILD 탭 -->
    <template v-if="activeTab === 'build'">
      <BuildHeader
        @refresh="handleBuildRefresh"
        @build="handleBuild"
        @settings="handleBuildSettings"
      />
      <BuildList
        :builds="builds"
        :selected-build="selectedBuild"
        :is-loading="isLoading"
        @build-selected="handleBuildSelected"
      />
    </template>

    <!-- DEPLOY 탭 -->
    <template v-else-if="activeTab === 'deploy'">
      <DeployHeader
        @refresh="handleDeployRefresh"
        @deploy="handleDeploy"
        @settings="handleDeploySettings"
      />
      <DeployList
        :deployments="deployments"
        :selected-deployment="selectedDeployment"
        :is-loading="isLoading"
        @deployment-selected="handleDeploymentSelected"
      />
    </template>

    <!-- ENV 탭 -->
    <template v-else-if="activeTab === 'env'">
      <EnvHeader
        @refresh="handleEnvRefresh"
        @search-change="handleEnvSearchChange"
        @settings="handleEnvSettings"
      />
      <EnvList
        :variables="environmentVariables"
        :selected-variable="selectedEnvironmentVariable"
        :is-loading="isLoading"
        @variable-selected="handleEnvironmentVariableSelected"
      />
    </template>

    <!-- PACKAGE 탭 -->
    <template v-else-if="activeTab === 'package'">
      <PackageHeader
        @refresh="handlePackageRefresh"
        @search-change="handlePackageSearchChange"
        @settings="handlePackageSettings"
      />
      <PackageList
        :packages="packages"
        :selected-package="selectedPackage"
        :is-loading="isLoading"
        @package-selected="handlePackageSelected"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import BuildHeader from './BuildHeader.vue'
import BuildList from './BuildList.vue'
import DeployHeader from './DeployHeader.vue'
import DeployList from './DeployList.vue'
import EnvHeader from './EnvHeader.vue'
import EnvList from './EnvList.vue'
import PackageHeader from './PackageHeader.vue'
import PackageList from './PackageList.vue'

// 활성 탭
const activeTab = ref('build')

// Props
defineProps({
  // BUILD 관련
  builds: {
    type: Array,
    default: () => [],
  },
  selectedBuild: {
    type: Object,
    default: null,
  },
  // DEPLOY 관련
  deployments: {
    type: Array,
    default: () => [],
  },
  selectedDeployment: {
    type: Object,
    default: null,
  },
  // ENV 관련
  environmentVariables: {
    type: Array,
    default: () => [],
  },
  selectedEnvironmentVariable: {
    type: Object,
    default: null,
  },
  // PACKAGE 관련
  packages: {
    type: Array,
    default: () => [],
  },
  selectedPackage: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  // BUILD
  'build-refresh',
  'build',
  'build-settings',
  'build-selected',
  // DEPLOY
  'deploy-refresh',
  'deploy',
  'deploy-settings',
  'deployment-selected',
  // ENV
  'env-refresh',
  'env-search-change',
  'env-settings',
  'environment-variable-selected',
  // PACKAGE
  'package-refresh',
  'package-search-change',
  'package-settings',
  'package-selected',
  // 탭 변경
  'tab-change',
])

// BUILD 핸들러
function handleBuildRefresh() {
  emit('build-refresh')
}

function handleBuild() {
  emit('build')
}

function handleBuildSettings() {
  emit('build-settings')
}

function handleBuildSelected(build) {
  emit('build-selected', build)
}

// DEPLOY 핸들러
function handleDeployRefresh() {
  emit('deploy-refresh')
}

function handleDeploy() {
  emit('deploy')
}

function handleDeploySettings() {
  emit('deploy-settings')
}

function handleDeploymentSelected(deployment) {
  emit('deployment-selected', deployment)
}

// ENV 핸들러
function handleEnvRefresh() {
  emit('env-refresh')
}

function handleEnvSearchChange(value) {
  emit('env-search-change', value)
}

function handleEnvSettings() {
  emit('env-settings')
}

function handleEnvironmentVariableSelected(variable) {
  emit('environment-variable-selected', variable)
}

// PACKAGE 핸들러
function handlePackageRefresh() {
  emit('package-refresh')
}

function handlePackageSearchChange(value) {
  emit('package-search-change', value)
}

function handlePackageSettings() {
  emit('package-settings')
}

function handlePackageSelected(packageItem) {
  emit('package-selected', packageItem)
}

// 탭 변경 감지
watch(activeTab, (newTab) => {
  emit('tab-change', newTab)
})
</script>

<style lang="scss" scoped>
.devops-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--nexa-surface);

  // Container Query 활성화 (사이드바 너비 기준)
  container-type: inline-size;
  container-name: devops-sidebar;
}

.sidebar-tabs {
  background: var(--nexa-background-darker);
  border-bottom: 1px solid var(--nexa-border-color);
}
</style>
