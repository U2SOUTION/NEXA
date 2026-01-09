<template>
  <div class="layout-settings">
    <div class="settings-section">
      <div class="text-h6 q-mb-md">헤더 설정</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>헤더 높이</q-item-label>
            <q-item-label caption>상단 헤더의 높이를 설정합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model.number="headerHeight" type="number" dense outlined class="input-field" suffix="px" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <div class="settings-section">
      <div class="text-h6 q-mb-md">사이드바 제어</div>
      <div class="control-info">
      <q-list>
          <!-- 토글 버튼 -->
          <q-item>
            <q-item-section>
              <q-item-label class="control-title">
                <q-icon name="double_arrow" class="q-mr-sm" />
                토글 버튼
              </q-item-label>
              <q-item-label caption class="control-description"> 화면 양쪽에 있는 토글 버튼을 사용하여 사이드바를 제어할 수 있습니다. </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <div class="control-detail">
                <div class="control-method">
                  <span class="method-label">클릭:</span>
                  <span class="method-description">사이드바 열기/닫기 (이전 크기로 복원)</span>
                </div>
                <div class="control-method">
                  <span class="method-label">드래그:</span>
                  <span class="method-description">사이드바 크기 조정 (닫힌 상태에서 드래그 시 열리면서 크기 조정)</span>
                </div>
              </div>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <!-- 더블클릭 제어 -->
          <q-item>
            <q-item-section>
              <q-item-label class="control-title">
                <q-icon name="touch_app" class="q-mr-sm" />
                더블클릭 제어
              </q-item-label>
              <q-item-label caption class="control-description"> 메인 콘텐츠 영역을 더블클릭하여 사이드바를 제어할 수 있습니다. </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <div class="control-detail">
                <div class="control-method">
                  <span class="method-label">더블클릭:</span>
                  <span class="method-description">
                    <ul class="control-list">
                      <li>둘 다 닫혀있을 때: 마지막에 열었던 쪽과 반대쪽 열기 (번갈아가며)</li>
                      <li>둘 다 열려있을 때: 둘 다 닫기</li>
                      <li>한쪽만 열려있을 때: 열린 쪽 닫기</li>
                    </ul>
                  </span>
                </div>
                <div class="control-method q-mt-md">
                  <span class="method-label">Shift + 더블클릭:</span>
                  <span class="method-description">둘 다 열기 (상태와 관계없이)</span>
                </div>
              </div>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <!-- 키보드 단축키 -->
          <q-item>
            <q-item-section>
              <q-item-label class="control-title">
                <q-icon name="keyboard" class="q-mr-sm" />
                키보드 단축키
              </q-item-label>
              <q-item-label caption class="control-description"> 키보드 단축키를 사용하여 사이드바를 빠르게 제어할 수 있습니다. </q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <div class="control-detail">
                <div class="control-method">
                  <span class="method-label">Ctrl + ← (왼쪽 화살표):</span>
                  <span class="method-description">왼쪽 사이드바 열기/닫기</span>
                </div>
                <div class="control-method">
                  <span class="method-label">Ctrl + → (오른쪽 화살표):</span>
                  <span class="method-description">오른쪽 사이드 패널 열기/닫기</span>
                </div>
              </div>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />

          <!-- 추가 기능 -->
        <q-item>
          <q-item-section>
              <q-item-label class="control-title">
                <q-icon name="info" class="q-mr-sm" />
                추가 기능
              </q-item-label>
          </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <div class="control-detail">
                <div class="control-method">
                  <span class="method-label">크기 기억:</span>
                  <span class="method-description">사이드바 크기는 자동으로 기억되며, 다음에 열 때 이전 크기로 복원됩니다.</span>
                </div>
                <div class="control-method q-mt-sm">
                  <span class="method-label">자동 닫기:</span>
                  <span class="method-description">사이드바 크기를 50px 이하로 줄이면 자동으로 닫힙니다.</span>
                </div>
                <div class="control-method q-mt-sm">
                  <span class="method-label">기본 크기:</span>
                  <span class="method-description">저장된 크기가 없거나 너무 작을 경우 기본 크기로 열립니다 (왼쪽: 250px, 오른쪽: 300px).</span>
                </div>
              </div>
          </q-item-section>
        </q-item>
      </q-list>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
})

const headerHeight = ref(props.settings.header.height)

watch(headerHeight, (newHeight) => {
  // 레이아웃 설정 변경 처리
  document.documentElement.style.setProperty('--header-height', `${newHeight}px`)
})
</script>

<style lang="scss" scoped>
.layout-settings {
  .settings-section {
    margin-bottom: 2rem;

    &:last-child {
      margin-bottom: 0;
    }

    .text-h6 {
      color: var(--nexa-text-primary);
      font-weight: 600;
    }

    .q-item {
      .q-item__label {
        color: var(--nexa-text-primary);
      }

      .q-item__label--caption {
        color: var(--nexa-text-secondary);
      }
    }

    .q-item-label {
      color: var(--nexa-text-primary);
    }

    .q-item-label--caption {
      color: var(--nexa-text-secondary);
    }

    .input-field {
      width: 150px;

      // 입력 필드 텍스트 색상
      :deep(.q-field__native) {
        color: var(--nexa-text-hint);
      }

      // 셀렉트 선택된 값 색상
      :deep(.q-field__native) {
        color: var(--nexa-text-hint);
      }
    }
  }

  // 사이드바 제어 정보 스타일
  .control-info {
    .control-title {
      display: flex;
      align-items: center;
      color: var(--nexa-text-primary);
      font-weight: 500;
      font-size: 1rem;
    }

    .control-description {
      color: var(--nexa-text-secondary);
      margin-top: 4px;
    }

    .control-detail {
      padding-left: 0;
    }

    .control-method {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .method-label {
        color: var(--nexa-primary);
        font-weight: 500;
        font-size: 0.9rem;
        margin-bottom: 2px;
      }

      .method-description {
        color: var(--nexa-text-secondary);
        font-size: 0.875rem;
        line-height: 1.5;
      }

      .control-list {
        margin: 0;
        padding-left: 20px;
        color: var(--nexa-text-secondary);
        font-size: 0.875rem;
        line-height: 1.6;

        li {
          margin-bottom: 4px;

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}
</style>
