<template>
  <div class="nexia-nexus-container column full-height">
    <!-- [Nexus 상위 헤더] 도메인 타이틀 및 윈도우 제어 -->
    <div class="nexus-domain-header row items-center q-px-md bg-dark text-white">
      <div class="row items-center cursor-pointer" @click="activeTab = 'logic'">
        <q-icon name="psychology" color="primary" size="sm" class="q-mr-sm" />
        <span class="text-subtitle1 font-weight-bold">NEXUS</span>
      </div>

      <q-space />

      <!-- 멀티윈도우 DETACH 버튼 (공통 기능) -->
      <q-btn flat round dense icon="open_in_new" @click="detachWindow">
        <q-tooltip>창 분리 (Detach Workspace)</q-tooltip>
      </q-btn>
    </div>

    <!-- [Nexus 하위 탭 선택] Logic(Rivet) vs Graph(Ontology) -->
    <q-tabs v-model="activeTab" dense class="nexus-sub-tabs bg-black text-grey-5" active-color="primary" indicator-color="primary" align="left" narrow-indicator>
      <q-tab name="logic" icon="account_tree" label="LOGIC (Rivet)" />
      <q-tab name="graph" icon="hub" label="GRAPH (Relation)" />
    </q-tabs>

    <q-separator dark />

    <!-- [탭 콘텐츠 영역] -->
    <q-tab-panels v-model="activeTab" animated class="col bg-transparent">
      <!-- 1. LOGIC 탭: Rivet 실행 로직 설계 -->
      <q-tab-panel name="logic" class="q-pa-none overflow-hidden">
        <div class="column full-height">
          <!-- Rivet 전용 제어바 -->
          <div class="logic-toolbar row items-center q-px-sm">
            <q-btn flat dense icon="play_arrow" color="positive" label="RUN" />
            <q-btn flat dense icon="fiber_manual_record" color="negative" label="REC" class="q-ml-sm" />
            <q-space />
            <q-badge outline color="orange-9">Ollama: Llama3.1</q-badge>
          </div>
          <!-- Rivet Canvas (Vue Flow) 영역 -->
          <div class="col logic-canvas relative-position">
            <div class="placeholder-msg flex flex-center full-height">
              <div class="text-center opacity-4">
                <q-icon name="grid_view" size="100px" />
                <div class="text-h6">Rivet Logic Editor</div>
                <div class="text-caption">노드 기반의 실행 로직을 설계하세요</div>
              </div>
            </div>
          </div>
        </div>
      </q-tab-panel>

      <!-- 2. GRAPH 탭: 온톨로지 및 RAG 관계도 -->
      <q-tab-panel name="graph" class="q-pa-none overflow-hidden">
        <div class="column full-height">
          <!-- Graph 전용 제어바 -->
          <div class="graph-toolbar row items-center q-px-sm">
            <q-btn flat dense icon="refresh" label="RE-LAYOUT" />
            <q-btn flat dense icon="filter_list" label="FILTER" class="q-ml-sm" />
            <q-space />
            <q-badge outline color="blue-9">Ontology: Standard v1</q-badge>
          </div>
          <!-- Graph Canvas (Gravity Engine) 영역 -->
          <div class="col graph-canvas relative-position">
            <div class="placeholder-msg flex flex-center full-height">
              <div class="text-center opacity-4">
                <q-icon name="blur_on" size="100px" />
                <div class="text-h6">Ontology Graph</div>
                <div class="text-caption">중력 엔진 기반의 지식 관계도를 탐색하세요</div>
              </div>
            </div>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>

    <!-- [하단 상태바] -->
    <div class="nexus-footer row items-center q-px-md bg-black text-caption text-grey-7">
      <span>{{ activeTab.toUpperCase() }} MODE ACTIVE</span>
      <q-space />
      <span>Yjs Syncing...</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('logic')

const detachWindow = () => {
  // 팝아웃/윈도우 분리 로직 플랜
}
</script>

<style lang="scss" scoped>
.nexia-nexus-container {
  background: #0d0d0d;

  .nexus-domain-header {
    height: 48px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .nexus-sub-tabs {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .logic-toolbar,
  .graph-toolbar {
    height: 40px;
    background: #1a1a1a;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .logic-canvas {
    background-image: radial-gradient(circle, #212121 1px, transparent 1px);
    background-size: 20px 20px;
  }

  .graph-canvas {
    background: radial-gradient(circle at center, #151515 0%, #0d0d0d 100%);
  }

  .nexus-footer {
    height: 24px;
    font-size: 10px;
  }

  .opacity-4 {
    opacity: 0.4;
  }
}
</style>
