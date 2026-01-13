<template>
  <q-list dense class="section-list">
    <q-item-label header>HUB</q-item-label>

    <q-expansion-item dense expand-icon="chevron_right" label="자산 트리" icon="account_tree" default-opened>
      <q-list dense>
        <q-item v-for="item in assets" :key="item.label" dense>
          <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>

    <q-expansion-item dense expand-icon="chevron_right" label="프로젝트 그리드" icon="grid_view">
      <q-list dense>
        <q-item v-for="item in projects" :key="item.label" dense>
          <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>

    <q-expansion-item dense expand-icon="chevron_right" label="지식 맵" icon="share">
      <q-list dense>
        <q-item v-for="item in knowledge" :key="item.label" dense>
          <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>

    <q-expansion-item dense expand-icon="chevron_right" label="추천/인사이트" icon="lightbulb">
      <q-list dense>
        <q-item v-for="item in insights" :key="item.label" dense>
          <q-item-section avatar><q-icon :name="item.icon" /></q-item-section>
          <q-item-section>{{ item.label }}</q-item-section>
        </q-item>
      </q-list>
    </q-expansion-item>
  </q-list>
</template>

<script setup>
const assets = [
  { label: '프로젝트 트리', icon: 'folder' },
  { label: '노트/지식 트리', icon: 'article' },
  { label: '태그 필터', icon: 'sell' },
]

const projects = [
  { label: '활성 프로젝트', icon: 'play_arrow' },
  { label: '최근 업데이트', icon: 'update' },
  { label: '즐겨찾기', icon: 'star' },
]

const knowledge = [
  { label: '지식 그래프', icon: 'device_hub' },
  { label: '토픽 클러스터', icon: 'blur_circular' },
  { label: '연결 맵', icon: 'share' },
]

const insights = [
  { label: '추천 문서', icon: 'lightbulb' },
  { label: '관련 업무', icon: 'work' },
  { label: '알림/이벤트', icon: 'notifications' },
]
</script>

<style scoped lang="scss">
.section-list {
  padding: 0 10px;
  :deep(.q-item__label) {
    color: var(--nexa-text-primary);
  }
}

.q-item {
  padding-left: 34px;
  font-size: 12px;
  color: var(--nexa-text-secondary);

  &:hover {
    color: var(--nexa-text-primary);
  }

  &:active {
    color: var(--nexa-text-primary);
  }

  &:focus {
    color: var(--nexa-text-primary);
  }

  &:selected {
    color: var(--nexa-text-primary);
  }
}
</style>
