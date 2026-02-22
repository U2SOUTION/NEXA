<template>
  <div class="ai-left-nav">
    <StandardLeftHeader
      title="NEXA AI"
      subtitle="Ollama 기반 AI 대화"
      icon="smart_toy"
    />
    <div class="panel-scroll-area q-pa-md">
      <div class="text-body2 text-grey-7 q-mb-md">
        AI 플랫폼에 오신 것을 환영합니다.
      </div>
      <q-list bordered separator class="rounded-borders">
        <q-item clickable v-ripple to="/nexa-ai" exact-active-class="active">
          <q-item-section avatar>
            <q-icon name="chat" />
          </q-item-section>
          <q-item-section>채팅</q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script setup>
import StandardLeftHeader from '@frame/layout/components/StandardLeftHeader.vue'
</script>

<style lang="scss" scoped>
.ai-left-nav {
  height: 100%;
  display: flex;
  flex-direction: column;

  .panel-scroll-area {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
}
</style>
