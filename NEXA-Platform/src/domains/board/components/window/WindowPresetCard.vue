<template>
  <div class="preset-card" @click="$emit('select', preset)">
    <!-- 썸네일: 모든 상태 UI 처리 -->
    <div class="preset-thumbnail" :class="[`thumbnail-${preset}`, { active, selected }]">
      <div class="thumbnail-container">
        <div v-if="preset === 'single'" class="thumbnail-single">
          <div class="pane-box main-pane">메인</div>
        </div>
        <div v-else-if="preset === 'split-lr'" class="thumbnail-split-lr">
          <div class="pane-box left-pane">왼쪽</div>
          <div class="pane-box right-pane">오른쪽</div>
        </div>
        <div v-else-if="preset === 'l-shape'" class="thumbnail-l-shape">
          <div class="pane-box left-pane">왼쪽</div>
          <div class="pane-box-container">
            <div class="pane-box top-pane">위</div>
            <div class="pane-box bottom-pane">아래</div>
          </div>
        </div>
        <div v-else-if="preset === 'split-tb'" class="thumbnail-split-tb">
          <div class="pane-box top-pane">위</div>
          <div class="pane-box bottom-pane">아래</div>
        </div>
      </div>
    </div>

    <!-- 정보 (라벨, 설명) -->
    <div class="preset-info" :class="{ 'info-selected': selected }">
      <div class="preset-label">{{ label }}</div>
      <div class="preset-description">{{ description }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getPresetMetadata } from '@system/utils/boardWindowPreset.js'

const props = defineProps({
  preset: { type: String, required: true },
  active: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})

defineEmits(['select'])

const metadata = computed(() => getPresetMetadata(props.preset))
const label = computed(() => metadata.value.label)
const description = computed(() => metadata.value.description)
</script>

<style lang="scss" scoped>
// CSS 변수로 간격 일괄 관리 (컴포넌트 레벨)
.preset-card {
  // 간격 변수 정의
  --preset-card-padding: 10px;
  --preset-pane-gap: 5px;
  --preset-thumbnail-padding: 10px;
  --preset-thumbnail-height: 200px;
  --preset-pane-border: none; // 창 보더 (none | 2px solid rgba(255, 255, 255, 0.3))

  padding: var(--preset-card-padding);
  cursor: pointer;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  height: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  position: relative;
}

// 썸네일 스타일
.preset-thumbnail {
  width: 100%;
  height: var(--preset-thumbnail-height);
  min-height: var(--preset-thumbnail-height);
  max-height: var(--preset-thumbnail-height);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent; // 배경 제거
  border-radius: 8px;
  //border: 2px solid var(--nexa-border); // 기본 그레이톤 보더
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  transition: all 0.2s ease;

  // 호버 시 색상 변화
  &:hover {
    border: 2px solid var(--nexa-primary); // 기본 그레이톤 보더
    //border-color: var(--nexa-primary);
    //box-shadow: 0 0 0 1px var(--nexa-primary);
  }

  // 선택/활성 상태 통일 (active와 selected 구분 없이 동일한 스타일)
  &.active,
  &.selected,
  &.active.selected {
    border: 5px solid var(--nexa-primary);
    box-shadow:
      0 0 0 2px var(--nexa-primary),
      0 4px 12px var(--nexa-shadow-3);
    background: transparent; // 배경 유지하지 않음
  }
}

.thumbnail-container {
  width: 100%;
  height: 100%;
  display: flex;
  padding: var(--preset-thumbnail-padding);
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.pane-box {
  background: var(--nexa-primary);
  color: var(--nexa-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  border-radius: 4px;
  border: var(--preset-pane-border, none);
  min-height: 32px;
  min-width: 50px;
  padding: 6px 8px;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  z-index: 10;
  text-shadow: 0 1px 3px var(--nexa-text-hint);
  flex-shrink: 0;
}

// 공통 스타일: 모든 썸네일 레이아웃
%thumbnail-layout-base {
  width: 100%;
  height: 100%;
  display: flex;
  gap: var(--preset-pane-gap);
  position: relative;
}

// 단일 창
.thumbnail-single {
  @extend %thumbnail-layout-base;
  align-items: stretch;
  justify-content: stretch;

  .main-pane {
    width: 100%;
    height: 100%;
    position: relative;
  }
}

// 좌우 분할
.thumbnail-split-lr {
  @extend %thumbnail-layout-base;
  align-items: stretch;

  .left-pane {
    width: 30%;
    min-width: 50px;
    position: relative;
  }

  .right-pane {
    flex: 1;
    min-width: 60px;
    position: relative;
  }
}

// L자형
.thumbnail-l-shape {
  @extend %thumbnail-layout-base;
  align-items: stretch;

  .left-pane {
    width: 30%;
    min-width: 50px;
    position: relative;
  }

  .pane-box-container {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--preset-pane-gap);

    .top-pane {
      flex: 7 0 0;
      min-height: 60px;
      position: relative;
    }

    .bottom-pane {
      flex: 3 0 0;
      min-height: 50px;
      position: relative;
    }
  }
}

// 상하 분할
.thumbnail-split-tb {
  @extend %thumbnail-layout-base;
  flex-direction: column;
  align-items: stretch;

  .top-pane {
    flex: 7 0 0;
    min-height: 60px;
    position: relative;
  }

  .bottom-pane {
    flex: 3 0 0;
    min-height: 50px;
    position: relative;
  }
}

// 정보 영역
.preset-info {
  margin-left: var(--preset-card-padding);
  text-align: left;
  flex-shrink: 0;
  margin-top: auto;
  transition: color 0.2s ease;

  // 선택 상태일 때 텍스트 색상 조정
  &.info-selected {
    .preset-label {
      color: var(--nexa-primary);
      font-weight: 700;
    }

    .preset-description {
      color: var(--nexa-text-secondary);
    }
  }
}

.preset-label {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
  transition: color 0.2s ease;
}

.preset-description {
  font-size: 0.775rem;
  font-weight: 300;
  color: var(--nexa-text-secondary);
  min-height: 2.5em;
  transition: color 0.2s ease;
}
</style>
