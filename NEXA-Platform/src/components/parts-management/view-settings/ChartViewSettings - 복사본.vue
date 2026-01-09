<!-- ChartViewSettings.vue
  차트 뷰 설정 컴포넌트
-->
<template>
  <div class="chart-view-settings">
    <q-list>
      <!-- 차트 기본 설정 -->
      <q-expansion-item v-model="expanded.basic" label="차트 기본 설정" icon="bar_chart" header-class="text-weight-bold" group="settings-accordion">
        <q-card>
          <q-card-section>
            <!-- 차트 타입 (멀티 셀렉트) -->
            <div class="q-mb-md">
              <div class="text-caption q-mb-xs">
                <span v-if="localSettings.chartTypes && localSettings.chartTypes.length > 0">
                  차트 타입: {{ localSettings.chartTypes.length }}개 선택됨
                  <span v-if="isMultiChartMode" class="q-ml-xs chart-mode-label-multi">(멀티 차트 모드)</span>
                  <span v-else class="q-ml-xs chart-mode-label-single">(단일 차트 모드)</span>
                </span>
                <span v-else>
                  차트 타입 (2개 이상 선택 시 멀티 차트 모드)
                  <span class="text-warning q-ml-xs warning-text">
                    <q-icon name="warning" size="xs" class="q-mr-xs" />
                    최소 1개 선택 필요
                  </span>
                </span>
              </div>
              <q-select v-model="localSettings.chartTypes" :options="chartTypeOptions" option-label="label" option-value="value" emit-value map-options multiple dense outlined label="차트 타입" @update:model-value="handleChartTypesChange">
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.label }}</q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="isChartTypeSelected(scope.opt.value)">
                      <div class="row items-center q-gutter-xs">
                        <span class="text-caption text-grey-6">{{ getChartTypeLabelText(scope.opt.value) }}</span>
                        <q-icon :name="getChartTypeVisibilityIcon(scope.opt.value)" :color="getChartTypeVisibilityColor(scope.opt.value)" size="18px" />
                      </div>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- X축 필드 -->
            <div class="q-mb-md">
              <q-select v-model="localSettings.xAxisField" :options="availableFieldsOptions" option-label="label" option-value="value" emit-value map-options dense outlined clearable label="X축 필드" @update:model-value="emitUpdate" />
            </div>

            <!-- Y축 필드 -->
            <div class="q-mb-md">
              <q-select v-model="localSettings.yAxisField" :options="availableFieldsOptions" option-label="label" option-value="value" emit-value map-options dense outlined clearable label="Y축 필드" @update:model-value="emitUpdate" />
            </div>

            <!-- 집계 방식 -->
            <div class="q-mb-md" v-if="localSettings.yAxisField && localSettings.yAxisField !== '__count__'">
              <q-select v-model="localSettings.aggregation" :options="aggregationOptions" option-label="label" option-value="value" emit-value map-options dense outlined label="집계 방식" @update:model-value="emitUpdate" />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- 시각 효과 -->
      <q-expansion-item v-model="expanded.effects" :label="isMultiChartMode ? '전체 시각 효과' : '시각 효과'" icon="auto_awesome" header-class="text-weight-bold" group="settings-accordion">
        <q-card>
          <q-card-section>
            <!-- 전역 설정 적용 모드 -->
            <div v-if="isMultiChartMode" class="q-mb-md mode-toggle-section">
              <div class="column items-center q-gutter-sm">
                <q-btn-toggle
                  v-model="localSettings.applyToAllEffects"
                  :options="[
                    { label: '전체 적용', value: true, icon: 'auto_awesome' },
                    { label: '개별 보호', value: false, icon: 'shield' },
                  ]"
                  toggle-color="primary"
                  color="grey-7"
                  text-color="white"
                  @update:model-value="handleApplyToAllEffectsChange"
                />
                <div class="text-caption mode-description mode-description-normal text-center">
                  <q-icon :name="localSettings.applyToAllEffects ? 'auto_awesome' : 'shield'" size="xs" class="q-mr-xs" />
                  <span v-if="localSettings.applyToAllEffects">전역 설정 변경 시 모든 레이어의 차트에 즉시 적용됩니다</span>
                  <span v-else>개별 설정이 있는 레이어의 차트 설정이 보호됩니다</span>
                </div>
              </div>
            </div>

            <div class="q-mb-md">
              <div class="row items-center q-gutter-sm">
                <div class="text-caption slider-label">투명도 강도 (0 - 10)</div>
                <q-slider v-model="opacitySliderValue" :min="0" :max="10" :step="0.1" class="col" @update:model-value="handleOpacityChange" />
                <div class="text-caption text-weight-medium slider-value">{{ opacitySliderValue.toFixed(1) }}</div>
              </div>
            </div>

            <!-- 흐리기 -->
            <div class="q-mb-md">
              <div class="row items-center q-gutter-sm">
                <div class="text-caption slider-label">흐리기 강도 (0 - 10)</div>
                <q-slider v-model="blurValue" :min="0" :max="10" :step="0.5" class="col" />
                <div class="text-caption text-weight-medium slider-value">{{ blurValue.toFixed(1) }}</div>
              </div>
            </div>

            <!-- 네온 강도 -->
            <div class="q-mb-md">
              <div class="row items-center q-gutter-sm">
                <div class="text-caption slider-label">네온 강도 (0 - 20)</div>
                <q-slider v-model="neonIntensityValue" :min="0" :max="20" :step="0.5" class="col" />
                <div class="text-caption text-weight-medium slider-value">{{ neonIntensityValue.toFixed(1) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- 스타일 -->
      <q-expansion-item v-model="expanded.style" :label="isMultiChartMode ? '전체 스타일' : '스타일'" icon="palette" header-class="text-weight-bold" group="settings-accordion">
        <q-card>
          <q-card-section>
            <!-- 전역 설정 적용 모드 -->
            <div v-if="isMultiChartMode" class="q-mb-md mode-toggle-section">
              <div class="column items-center column-gap-small">
                <q-btn-toggle
                  v-model="localSettings.applyToAllStyles"
                  :options="[
                    { label: '전체 적용', value: true, icon: 'auto_awesome' },
                    { label: '개별 보호', value: false, icon: 'shield' },
                  ]"
                  toggle-color="primary"
                  color="grey-7"
                  text-color="white"
                  @update:model-value="handleApplyToAllStylesChange"
                />
                <!-- 설명 텍스트와 안내 문구를 하나의 블록으로 통합 -->
                <div class="column items-center column-gap-full">
                  <div class="text-caption mode-description mode-description-compact text-center">
                    <q-icon :name="localSettings.applyToAllStyles ? 'auto_awesome' : 'shield'" size="xs" class="q-mr-xs" />
                    <span v-if="localSettings.applyToAllStyles">전역 설정 변경 시 모든 레이어의 차트에 즉시 적용됩니다</span>
                    <span v-else>개별 설정이 있는 레이어의 차트 설정이 보호됩니다</span>
                  </div>
                  <div class="text-body2 text-center info-notice">
                    <q-icon name="warning" class="q-mr-xs info-notice-icon" />
                    아래 설정의 각 항목은 적용 가능한 차트에만 자동으로 적용됩니다
                  </div>
                </div>
              </div>
            </div>

            <!-- 단독 차트 모드 공통 안내 -->
            <div v-if="!isMultiChartMode" class="q-mb-md">
              <div class="text-body2 text-center info-notice">
                <q-icon name="warning" class="q-mr-xs info-notice-icon" />
                아래 설정의 각 항목은 적용 가능한 차트에만 자동으로 적용됩니다
              </div>
            </div>

            <div class="q-mb-md">
              <div class="row items-center q-gutter-sm">
                <div class="text-caption slider-label">색상 선택 및 입력</div>
                <div class="col">
                  <q-input v-model="localSettings.style.color" type="text" placeholder="칼라 스포이트를 클릭하여 색상 변경이 가능합니다." dense outlined @update:model-value="emitUpdate">
                    <template v-slot:append>
                      <q-icon name="colorize" class="cursor-pointer">
                        <q-popup-proxy ref="globalColorPopup" cover transition-show="scale" transition-hide="scale">
                          <q-color v-model="localSettings.style.color" @update:model-value="emitUpdate" />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <!-- 색상 미리보기 영역 -->
                <div
                  class="color-preview cursor-pointer"
                  :style="{
                    backgroundColor: displayColor,
                    width: '60px',
                    height: '40px',
                    borderRadius: '4px',
                    border: '1px solid var(--nexa-border-color)',
                    flexShrink: 0,
                  }"
                  @click="globalColorPopup?.show()"
                ></div>
              </div>
            </div>

            <div class="q-mb-md">
              <div class="row items-center q-gutter-sm">
                <div class="text-caption slider-label">라인 두께 (1 - 20)</div>
                <q-slider v-model="localSettings.style.strokeWidth" :min="1" :max="20" :step="0.5" class="col" @update:model-value="emitUpdate" />
                <div class="text-caption text-weight-medium slider-value">{{ localSettings.style.strokeWidth.toFixed(1) }}</div>
              </div>
            </div>

            <div class="q-mb-md">
              <div class="row items-center q-gutter-sm">
                <div class="text-caption slider-label">데이터 점 크기 (1 - 50)</div>
                <q-slider v-model="localSettings.style.dotSize" :min="1" :max="50" :step="0.5" class="col" @update:model-value="emitUpdate" />
                <div class="text-caption text-weight-medium slider-value">{{ localSettings.style.dotSize.toFixed(1) }}</div>
              </div>
            </div>

            <div class="q-mb-md">
              <div class="row items-center q-gutter-sm">
                <div class="text-caption slider-label">노드 크기 (0 - 20)</div>
                <q-slider v-model="localSettings.style.nodeSize" :min="0" :max="20" :step="0.5" class="col" @update:model-value="emitUpdate" />
                <div class="text-caption text-weight-medium slider-value">{{ localSettings.style.nodeSize.toFixed(1) }}</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- 멀티 차트 레이어 설정 (멀티 모드일 때만 표시) -->
      <q-expansion-item v-if="isMultiChartMode" v-model="expanded.layers" label="멀티 차트 레이어" icon="layers" header-class="text-weight-bold" group="settings-accordion">
        <q-card>
          <q-card-section>
            <div>
              <div v-for="(layer, index) in localSettings.layers" :key="layer.id" :data-layer-id="layer.id" :data-layer-index="index" :id="`layer-item-${layer.id}`" :class="['layer-item', 'q-mb-lg', { 'layer-highlight': highlightedLayerId === layer.id }]">
                <!-- 레이어 헤더 (아코디언으로 통합) -->
                <q-expansion-item :model-value="expandedLayerId === layer.id" dense @update:model-value="handleLayerExpansion(layer.id, $event)">
                  <template v-slot:header>
                    <q-item-section>
                      <q-item-label class="text-subtitle2 layer-header-text">
                        <span class="text-weight-medium">[ {{ getChartTypeLabel(layer.type) }} ]</span>
                        <span class="layer-number">레이어 {{ index + 1 }} 상세설정</span>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="row items-center q-gutter-xs">
                        <q-btn flat dense :icon="layer.visible !== false ? 'visibility' : 'visibility_off'" size="sm" class="layer-visibility-btn" @click.stop="toggleLayerVisibility(layer)" />
                        <q-btn flat dense icon="arrow_upward" size="sm" class="layer-order-btn" :disable="index === 0" @click.stop="moveLayer(index, 'up')" />
                        <q-btn flat dense icon="arrow_downward" size="sm" class="layer-order-btn" :disable="index === localSettings.layers.length - 1" @click.stop="moveLayer(index, 'down')" />
                      </div>
                    </q-item-section>
                  </template>

                  <q-card>
                    <q-card-section>
                      <!-- X축 필드 (공통 필드 사용 또는 독립 설정) -->
                      <div class="q-mb-md">
                        <div class="row items-center q-gutter-sm">
                          <div class="text-caption field-label">X축 필드 직접선택</div>
                          <q-select v-model="layer.xField" :options="xAxisFieldOptions" option-label="label" option-value="value" emit-value map-options dense outlined class="col" @update:model-value="handleFieldChange(layer, 'xField', $event)" />
                        </div>
                      </div>

                      <!-- Y축 필드 (공통 필드 사용 또는 독립 설정) -->
                      <div class="q-mb-md">
                        <div class="row items-center q-gutter-sm">
                          <div class="text-caption field-label">Y축 필드 직접선택</div>
                          <q-select v-model="layer.yField" :options="yAxisFieldOptions" option-label="label" option-value="value" emit-value map-options dense outlined class="col" @update:model-value="handleFieldChange(layer, 'yField', $event)" />
                        </div>
                      </div>

                      <!-- 집계 방식 (공통 집계 사용 또는 독립 설정) -->
                      <div class="q-mb-md" v-if="(!layer.yField && localSettings.yAxisField && localSettings.yAxisField !== '__count__') || (layer.yField && layer.yField !== '__count__')">
                        <div class="row items-center q-gutter-sm">
                          <div class="text-caption field-label">집계 방식 직접선택</div>
                          <q-select v-model="layer.aggregation" :options="aggregationFieldOptions" option-label="label" option-value="value" emit-value map-options dense outlined class="col" @update:model-value="handleFieldChange(layer, 'aggregation', $event)" />
                        </div>
                      </div>

                      <!-- 레이어별 상세 설정 -->
                      <div class="q-mt-sm">
                        <!-- 1. 투명도 강도 -->
                        <div class="q-mb-sm">
                          <div class="row items-center q-gutter-sm">
                            <div class="text-caption slider-label">
                              투명도 강도 (0 - 10)
                              <span class="text-grey-6">({{ layer.style?.opacity !== null && layer.style?.opacity !== undefined ? '상세' : '전역' }})</span>
                            </div>
                            <q-slider
                              :model-value="(1 - (layer.style?.opacity ?? 1)) * 10"
                              :min="0"
                              :max="10"
                              :step="0.1"
                              class="col"
                              @update:model-value="
                                (val) => {
                                  if (!layer.style) layer.style = {}
                                  layer.style.opacity = 1 - val / 10
                                  emitUpdate()
                                }
                              "
                            />
                            <div class="text-caption text-weight-medium slider-value">{{ ((1 - (layer.style?.opacity ?? 1)) * 10).toFixed(1) }}</div>
                          </div>
                        </div>

                        <!-- 2. 흐리기 강도 -->
                        <div class="q-mb-sm">
                          <div class="row items-center q-gutter-sm">
                            <div class="text-caption slider-label">
                              흐리기 강도 (0 - 10)
                              <span class="text-grey-6">({{ layer.style?.blur !== null && layer.style?.blur !== undefined ? '상세' : '전역' }})</span>
                            </div>
                            <q-slider v-model="layer.style.blur" :min="0" :max="10" :step="0.5" class="col" @update:model-value="emitUpdate" />
                            <div class="text-caption text-weight-medium slider-value">{{ (layer.style?.blur || 0).toFixed(1) }}</div>
                          </div>
                        </div>

                        <!-- 3. 네온 강도 -->
                        <div class="q-mb-sm">
                          <div class="row items-center q-gutter-sm">
                            <div class="text-caption slider-label">
                              네온 강도 (0 - 20)
                              <span class="text-grey-6">({{ layer.style?.neonIntensity !== null && layer.style?.neonIntensity !== undefined ? '상세' : '전역' }})</span>
                            </div>
                            <q-slider v-model="layer.style.neonIntensity" :min="0" :max="20" :step="0.5" class="col" @update:model-value="emitUpdate" />
                            <div class="text-caption text-weight-medium slider-value">{{ (layer.style?.neonIntensity || 0).toFixed(1) }}</div>
                          </div>
                        </div>

                        <!-- 4. 색상 -->
                        <div v-if="supportsColor(layer.type)" class="q-mb-sm">
                          <div class="row items-center q-gutter-sm">
                            <div class="text-caption slider-label">
                              색상
                              <span class="text-grey-6">({{ layer.style?.color !== null && layer.style?.color !== undefined && layer.style?.color !== '' ? '상세' : '전역' }})</span>
                            </div>
                            <div class="col">
                              <q-input v-model="layer.style.color" type="text" placeholder="색상 코드 (예: #2196F3)" dense outlined class="layer-color-input" @update:model-value="emitUpdate">
                                <template v-slot:append>
                                  <q-icon name="colorize" class="cursor-pointer">
                                    <q-popup-proxy
                                      :ref="
                                        (el) => {
                                          if (el) layerColorPopups[layer.id] = el
                                        }
                                      "
                                      cover
                                      transition-show="scale"
                                      transition-hide="scale"
                                    >
                                      <q-color v-model="layer.style.color" @update:model-value="emitUpdate" />
                                    </q-popup-proxy>
                                  </q-icon>
                                </template>
                              </q-input>
                            </div>
                            <!-- 색상 미리보기 영역 -->
                            <div
                              v-if="supportsColor(layer.type)"
                              class="color-preview cursor-pointer"
                              :style="{
                                backgroundColor: layer.style.color || getChartMetadata(layer.type)?.defaultStyle?.color || '#2196F3',
                                width: '40px',
                                height: '32px',
                                borderRadius: '4px',
                                border: '1px solid var(--nexa-border-color)',
                                flexShrink: 0,
                              }"
                              @click="layerColorPopups[layer.id]?.show()"
                            ></div>
                          </div>
                        </div>

                        <!-- 5. 라인 두께 -->
                        <div v-if="supportsStrokeWidth(layer.type)" class="q-mb-sm">
                          <div class="row items-center q-gutter-sm">
                            <div class="text-caption slider-label">
                              라인 두께 (1 - 20)
                              <span class="text-grey-6">({{ layer.style?.strokeWidth !== null && layer.style?.strokeWidth !== undefined ? '상세' : '전역' }})</span>
                            </div>
                            <q-slider v-model="layer.style.strokeWidth" :min="1" :max="20" :step="0.5" class="col" @update:model-value="emitUpdate" />
                            <div class="text-caption text-weight-medium slider-value">{{ (layer.style?.strokeWidth || 0).toFixed(1) }}</div>
                          </div>
                        </div>

                        <!-- 6. 데이터 점 크기 -->
                        <div v-if="supportsDotSize(layer.type)" class="q-mb-sm">
                          <div class="row items-center q-gutter-sm">
                            <div class="text-caption slider-label">
                              데이터 점 크기 (1 - 50)
                              <span class="text-grey-6">({{ layer.style?.dotSize !== null && layer.style?.dotSize !== undefined ? '상세' : '전역' }})</span>
                            </div>
                            <q-slider v-model="layer.style.dotSize" :min="1" :max="50" :step="0.5" class="col" @update:model-value="emitUpdate" />
                            <div class="text-caption text-weight-medium slider-value">{{ (layer.style?.dotSize || 0).toFixed(1) }}</div>
                          </div>
                        </div>

                        <!-- 7. 노드 크기 -->
                        <div v-if="supportsNodeSize(layer.type)" class="q-mb-sm">
                          <div class="row items-center q-gutter-sm">
                            <div class="text-caption slider-label">
                              노드 크기 (0 - 20)
                              <span class="text-grey-6">({{ layer.style?.nodeSize !== null && layer.style?.nodeSize !== undefined ? '상세' : '전역' }})</span>
                            </div>
                            <q-slider v-model="layer.style.nodeSize" :min="0" :max="20" :step="0.5" class="col" @update:model-value="emitUpdate" />
                            <div class="text-caption text-weight-medium slider-value">{{ (layer.style?.nodeSize || 0).toFixed(1) }}</div>
                          </div>
                        </div>
                      </div>

                      <!-- 레이어별 옵션 -->
                      <div class="q-mt-sm">
                        <div class="text-subtitle2 q-mb-sm">레이어별 차트 옵션</div>
                        <div class="q-gutter-sm q-mb-md">
                          <q-checkbox v-model="layer.showLabels" label="라벨" class="layer-option-checkbox" @update:model-value="emitUpdate" />
                          <q-checkbox v-model="layer.options.animation" label="애니메이션" class="layer-option-checkbox" @update:model-value="emitUpdate" />
                          <q-checkbox v-model="layer.options.showGrid" label="그리드" class="layer-option-checkbox" @update:model-value="emitUpdate" />
                          <q-checkbox v-model="layer.options.showLegend" label="범례" class="layer-option-checkbox" @update:model-value="emitUpdate" />
                        </div>
                        <div class="text-subtitle2 q-mb-sm">레이어별 인터랙션</div>
                        <div class="q-gutter-sm">
                          <q-checkbox v-model="layer.interaction.tooltip" label="툴팁" class="layer-option-checkbox" @update:model-value="emitUpdate" />
                          <q-checkbox v-model="layer.interaction.hover" label="호버" class="layer-option-checkbox" @update:model-value="emitUpdate" />
                          <q-checkbox v-model="layer.interaction.click" label="클릭" class="layer-option-checkbox" @update:model-value="emitUpdate" />
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- 차트 옵션 -->
      <q-expansion-item v-model="expanded.options" :label="isMultiChartMode ? '전체 차트 옵션' : '차트 옵션'" icon="tune" header-class="text-weight-bold" group="settings-accordion">
        <q-card>
          <q-card-section>
            <!-- 전역 설정 적용 모드 -->
            <div v-if="isMultiChartMode" class="q-mb-md mode-toggle-section">
              <div class="column items-center column-gap-small">
                <q-btn-toggle
                  v-model="localSettings.applyToAllOptions"
                  :options="[
                    { label: '전체 적용', value: true, icon: 'auto_awesome' },
                    { label: '개별 보호', value: false, icon: 'shield' },
                  ]"
                  toggle-color="primary"
                  color="grey-7"
                  text-color="white"
                  @update:model-value="handleApplyToAllOptionsChange"
                />
                <!-- 설명 텍스트와 안내 문구를 하나의 블록으로 통합 -->
                <div class="column items-center column-gap-full">
                  <div class="text-caption mode-description mode-description-compact text-center">
                    <q-icon :name="localSettings.applyToAllOptions ? 'auto_awesome' : 'shield'" size="xs" class="q-mr-xs" />
                    <span v-if="localSettings.applyToAllOptions">전역 설정 변경 시 모든 레이어의 차트에 즉시 적용됩니다</span>
                    <span v-else>개별 설정이 있는 레이어의 차트 설정이 보호됩니다</span>
                  </div>
                  <div class="text-body2 text-center info-notice">
                    <q-icon name="warning" class="q-mr-xs info-notice-icon" />
                    아래 설정의 각 항목은 적용 가능한 차트에만 자동으로 적용됩니다
                  </div>
                </div>
              </div>
            </div>

            <!-- 단독 차트 모드 공통 안내 -->
            <div v-if="!isMultiChartMode" class="q-mb-md">
              <div class="text-body2 text-center info-notice">
                <q-icon name="warning" class="q-mr-xs info-notice-icon" />
                아래 설정의 각 항목은 적용 가능한 차트에만 자동으로 적용됩니다
              </div>
            </div>

            <div class="q-gutter-sm">
              <q-checkbox v-model="localSettings.chartOptions.showLabels" label="라벨" @update:model-value="emitUpdate" />
              <q-checkbox v-model="localSettings.chartOptions.animation" label="애니메이션" @update:model-value="emitUpdate" />
              <q-checkbox v-model="localSettings.chartOptions.showGrid" label="그리드" @update:model-value="emitUpdate" />
              <q-checkbox v-model="localSettings.chartOptions.showLegend" label="범례" @update:model-value="emitUpdate" />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <!-- 인터랙션 설정 -->
      <q-expansion-item v-model="expanded.interaction" :label="isMultiChartMode ? '전체 인터랙션' : '인터랙션'" icon="touch_app" header-class="text-weight-bold" group="settings-accordion">
        <q-card>
          <q-card-section>
            <!-- 전역 설정 적용 모드 -->
            <div v-if="isMultiChartMode" class="q-mb-md mode-toggle-section">
              <div class="column items-center column-gap-small">
                <q-btn-toggle
                  v-model="localSettings.applyToAllInteractions"
                  :options="[
                    { label: '전체 적용', value: true, icon: 'auto_awesome' },
                    { label: '개별 보호', value: false, icon: 'shield' },
                  ]"
                  toggle-color="primary"
                  color="grey-7"
                  text-color="white"
                  @update:model-value="handleApplyToAllInteractionsChange"
                />
                <!-- 설명 텍스트와 안내 문구를 하나의 블록으로 통합 -->
                <div class="column items-center column-gap-full">
                  <div class="text-caption mode-description mode-description-compact text-center">
                    <q-icon :name="localSettings.applyToAllInteractions ? 'auto_awesome' : 'shield'" size="xs" class="q-mr-xs" />
                    <span v-if="localSettings.applyToAllInteractions">전역 설정 변경 시 모든 레이어의 차트에 즉시 적용됩니다</span>
                    <span v-else>개별 설정이 있는 레이어의 차트 설정이 보호됩니다</span>
                  </div>
                  <div class="text-body2 text-center info-notice">
                    <q-icon name="warning" class="q-mr-xs info-notice-icon" />
                    아래 설정의 각 항목은 적용 가능한 차트에만 자동으로 적용됩니다
                  </div>
                </div>
              </div>
            </div>

            <!-- 단독 차트 모드 공통 안내 -->
            <div v-if="!isMultiChartMode" class="q-mb-md">
              <div class="text-body2 text-center info-notice">
                <q-icon name="warning" class="q-mr-xs info-notice-icon" />
                아래 설정의 각 항목은 적용 가능한 차트에만 자동으로 적용됩니다
              </div>
            </div>

            <div class="q-gutter-sm">
              <q-checkbox v-model="localSettings.interaction.tooltip" label="툴팁" @update:model-value="emitUpdate" />
              <q-checkbox v-model="localSettings.interaction.hover" label="호버" @update:model-value="emitUpdate" />
              <q-checkbox v-model="localSettings.interaction.click" label="클릭" @update:model-value="emitUpdate" />
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { supportsStrokeWidth, supportsDotSize, supportsNodeSize, supportsColor, getChartMetadata } from '@engines/charts/config/chartMetadata.js'

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
  availableFields: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:settings', 'apply-to-all-views'])

// 색상 팔레트 ref
const globalColorPopup = ref(null)
const layerColorPopups = ref({})

// 하이라이트된 레이어 ID (순서 변경 시 시각적 피드백)
const highlightedLayerId = ref(null)

// 확장 상태
const expanded = ref({
  basic: true,
  options: false,
  effects: false,
  style: false,
  layers: false,
  interaction: false,
})

// 레이어별 확장 상태 관리 (아코디언 모드: 하나만 열리도록)
const expandedLayerId = ref(null)

const localSettings = ref({
  ...props.settings,
  chartTypes: props.settings.chartTypes || (props.settings.chartType ? [props.settings.chartType] : ['line']),
  layers: props.settings.layers || [],
  applyToAllStyles: props.settings.applyToAllStyles !== undefined ? props.settings.applyToAllStyles : false, // 기본값: 상세 설정 보호 모드
  applyToAllEffects: props.settings.applyToAllEffects !== undefined ? props.settings.applyToAllEffects : false, // 기본값: 상세 설정 보호 모드
  applyToAllOptions: props.settings.applyToAllOptions !== undefined ? props.settings.applyToAllOptions : false, // 기본값: 상세 설정 보호 모드
  applyToAllInteractions: props.settings.applyToAllInteractions !== undefined ? props.settings.applyToAllInteractions : false, // 기본값: 상세 설정 보호 모드
  style: {
    strokeWidth: 2,
    dotSize: 6,
    nodeSize: 4,
    color: null,
    ...(props.settings.style
      ? {
          strokeWidth: props.settings.style.strokeWidth,
          dotSize: props.settings.style.dotSize,
          nodeSize: props.settings.style.nodeSize,
          color: props.settings.style.color,
        }
      : {}),
  },
  effects: {
    opacity: 1,
    blur: 0,
    neonIntensity: 0,
    ...(props.settings.effects ||
      (props.settings.style
        ? {
            opacity: props.settings.style.opacity,
            blur: props.settings.style.blur,
            neonIntensity: props.settings.style.neonIntensity,
          }
        : {})),
  },
  interaction: {
    tooltip: true,
    hover: true,
    click: true,
    ...props.settings.interaction,
  },
  chartOptions: {
    showLegend: true,
    showGrid: true,
    showLabels: true,
    animation: true,
    ...props.settings.chartOptions,
  },
})

const isMultiChartMode = computed(() => {
  return localSettings.value.chartTypes && localSettings.value.chartTypes.length > 1
})

const currentChartType = computed(() => {
  if (isMultiChartMode.value && localSettings.value.layers.length > 0) {
    return localSettings.value.layers[0].type
  }
  return localSettings.value.chartTypes?.[0] || localSettings.value.chartType || 'line'
})

// 기본 색상 계산 (색상이 비어있을 때 사용)
const defaultColor = computed(() => {
  const metadata = getChartMetadata(currentChartType.value)
  return metadata?.defaultStyle?.color || '#2196F3'
})

// 실제 표시할 색상 (입력값이 있으면 사용, 없으면 기본값)
const displayColor = computed(() => {
  return localSettings.value.style.color || defaultColor.value
})

const chartTypeOptions = [
  { label: '막대 차트', value: 'bar' },
  { label: '라인 차트', value: 'line' },
  { label: '영역 차트', value: 'area' },
  { label: '파이 차트', value: 'pie' },
  { label: '분산 차트', value: 'scatter' },
]

const aggregationOptions = [
  { label: '합계', value: 'sum' },
  { label: '평균', value: 'avg' },
  { label: '최소값', value: 'min' },
  { label: '최대값', value: 'max' },
  { label: '개수', value: 'count' },
]

const availableFieldsOptions = computed(() => {
  const options = [
    { label: '개수 (Count)', value: '__count__' },
    ...props.availableFields.map((field) => ({
      label: field.label || field.name,
      value: field.name || field.field,
    })),
  ]
  return options
})

// X축 필드 옵션 (공통 필드 사용 옵션 포함)
const xAxisFieldOptions = computed(() => {
  return [{ label: '공통 필드 사용 (전역 설정)', value: null }, ...availableFieldsOptions.value]
})

// Y축 필드 옵션 (공통 필드 사용 옵션 포함)
const yAxisFieldOptions = computed(() => {
  return [{ label: '공통 필드 사용 (전역 설정)', value: null }, ...availableFieldsOptions.value]
})

// 집계 방식 옵션 (공통 집계 사용 옵션 포함)
const aggregationFieldOptions = computed(() => {
  return [{ label: '공통 집계 사용 (전역 설정)', value: null }, ...aggregationOptions]
})

// effects 객체가 항상 존재하도록 보장
const ensureEffects = () => {
  if (!localSettings.value.effects) {
    localSettings.value.effects = {
      opacity: 1,
      blur: 0,
      neonIntensity: 0,
    }
  }
}

const opacitySliderValue = computed({
  get: () => {
    ensureEffects()
    const opacity = localSettings.value.effects.opacity ?? 1
    return Math.round((1 - opacity) * 10 * 10) / 10
  },
  set: (value) => {
    ensureEffects()
    const opacity = Math.round((1 - value / 10) * 10) / 10
    localSettings.value.effects.opacity = opacity
    emitUpdate()
  },
})

function handleOpacityChange(value) {
  ensureEffects()
  const opacity = Math.round((1 - value / 10) * 10) / 10
  localSettings.value.effects.opacity = opacity
  emitUpdate()
}

// 템플릿에서 사용됨 (98, 99, 107, 108번 줄)

const blurValue = computed({
  get: () => {
    ensureEffects()
    return localSettings.value.effects.blur || 0
  },
  set: (value) => {
    ensureEffects()
    localSettings.value.effects.blur = value
    emitUpdate()
  },
})

// 템플릿에서 사용됨 (107, 108번 줄)

const neonIntensityValue = computed({
  get: () => {
    ensureEffects()
    return localSettings.value.effects.neonIntensity || 0
  },
  set: (value) => {
    ensureEffects()
    localSettings.value.effects.neonIntensity = value
    emitUpdate()
  },
})

function handleChartTypesChange(newTypes) {
  // 빈 배열 허용 (모두 해제 가능)
  // 자동 선택하지 않고 사용자가 명시적으로 선택하도록 함
  localSettings.value.chartTypes = newTypes || []

  // 멀티 차트 모드인 경우 레이어 초기화
  if (newTypes && newTypes.length > 1) {
    initializeLayers(newTypes)
  } else if (newTypes && newTypes.length <= 1) {
    // 단일 차트 모드로 돌아간 경우 레이어 정리
    localSettings.value.layers = []
  }

  emitUpdate()
}

function createLayerStyleFromGlobal() {
  return {
    opacity: null,
    blur: null,
    neonIntensity: null,
    strokeWidth: null,
    dotSize: null,
    nodeSize: null,
    color: null,
  }
}

function initializeLayers(chartTypes) {
  if (!localSettings.value.layers || localSettings.value.layers.length === 0) {
    localSettings.value.layers = chartTypes.map((type, index) => {
      const layerId = `layer-${index}`
      return {
        id: layerId,
        type: type,
        layerIndex: index,
        useCustomXField: false,
        useCustomYField: false,
        useCustomAggregation: false,
        xField: null,
        yField: null,
        aggregation: null,
        style: createLayerStyleFromGlobal(),
        interaction: {
          tooltip: true,
          hover: true,
          click: true,
          ...localSettings.value.interaction,
        },
        options: {
          showLabels: true,
          animation: true,
          showGrid: true,
          showLegend: true,
          ...localSettings.value.chartOptions,
        },
        showLabels: true,
        visible: true,
      }
    })
  } else {
    // 기존 레이어와 새 타입을 동기화
    const existingTypes = localSettings.value.layers.map((l) => l.type)
    const newTypes = chartTypes.filter((t) => !existingTypes.includes(t))

    // 새 타입 추가 (임시 ID 사용, 필터링 후 재생성됨)
    newTypes.forEach((type) => {
      localSettings.value.layers.push({
        id: `temp-${Date.now()}-${Math.random()}`, // 임시 ID (필터링 후 재생성됨)
        type: type,
        layerIndex: localSettings.value.layers.length,
        useCustomXField: false,
        useCustomYField: false,
        useCustomAggregation: false,
        xField: null,
        yField: null,
        aggregation: null,
        style: createLayerStyleFromGlobal(),
        interaction: {
          tooltip: true,
          hover: true,
          click: true,
          ...localSettings.value.interaction,
        },
        showLabels: true,
        visible: true,
      })
    })

    // 필터링: 선택되지 않은 차트 타입의 레이어 제거
    localSettings.value.layers = localSettings.value.layers.filter((l) => chartTypes.includes(l.type))

    // 필터링 후 ID를 인덱스에 맞게 재생성 (고유성 보장)
    const oldExpandedLayerId = expandedLayerId.value
    localSettings.value.layers.forEach((layer, index) => {
      layer.layerIndex = index
      const newLayerId = `layer-${index}`
      // ID가 변경되면 expandedLayerId도 업데이트
      if (layer.id !== newLayerId) {
        // expandedLayerId가 변경 전 ID를 참조하고 있으면 새 ID로 업데이트
        if (oldExpandedLayerId === layer.id) {
          expandedLayerId.value = newLayerId
        }
        layer.id = newLayerId
      }
    })
  }

  // 레이어가 변경되면 expandedLayerId 초기화 (존재하지 않는 레이어 ID면 null로)
  const currentLayerIds = new Set(localSettings.value.layers.map((l) => l.id))
  if (expandedLayerId.value && !currentLayerIds.has(expandedLayerId.value)) {
    expandedLayerId.value = null
  }

  // 개발 모드에서만 레이어 ID 중복 확인
  if (import.meta.env.DEV) {
    const layerIds = localSettings.value.layers.map((l) => l.id)
    const duplicateIds = layerIds.filter((id, index) => layerIds.indexOf(id) !== index)
    if (duplicateIds.length > 0) {
      console.warn(
        '[ChartViewSettings] 중복된 레이어 ID 발견:',
        duplicateIds,
        '레이어 목록:',
        localSettings.value.layers.map((l) => ({ id: l.id, type: l.type })),
      )
    }
  }
}

function emitUpdate() {
  emit('update:settings', { ...localSettings.value })
}

// 필드 변경 핸들러 (체크박스 자동 업데이트)
function handleFieldChange(layer, fieldType, value) {
  // 필드 값이 null이면 공통 필드 사용, 아니면 독립 필드 사용
  // null 또는 undefined를 명시적으로 null로 설정하여 placeholder가 표시되도록 함
  const normalizedValue = value === null || value === undefined ? null : value

  if (fieldType === 'xField') {
    layer.useCustomXField = normalizedValue !== null
    layer.xField = normalizedValue
  } else if (fieldType === 'yField') {
    layer.useCustomYField = normalizedValue !== null
    layer.yField = normalizedValue
  } else if (fieldType === 'aggregation') {
    layer.useCustomAggregation = normalizedValue !== null
    layer.aggregation = normalizedValue
  }
  emitUpdate()
}

function getChartTypeLabel(type) {
  const option = chartTypeOptions.find((opt) => opt.value === type)
  return option ? option.label : type
}

// 차트 타입이 선택되었는지 확인
function isChartTypeSelected(chartType) {
  return localSettings.value.chartTypes && localSettings.value.chartTypes.includes(chartType)
}

// 차트 타입의 visibility 아이콘 반환
function getChartTypeVisibilityIcon(chartType) {
  if (!isChartTypeSelected(chartType)) {
    return null
  }

  // 해당 차트 타입의 레이어 찾기
  const layers = localSettings.value.layers || []
  const chartTypeLayers = layers.filter((layer) => layer.type === chartType)

  if (chartTypeLayers.length === 0) {
    return null
  }

  // 하나라도 보이는 레이어가 있으면 visibility, 모두 숨겨져 있으면 visibility_off
  const hasVisibleLayer = chartTypeLayers.some((layer) => layer.visible !== false)
  return hasVisibleLayer ? 'visibility' : 'visibility_off'
}

// 차트 타입의 visibility 아이콘 색상 반환
function getChartTypeVisibilityColor(chartType) {
  const icon = getChartTypeVisibilityIcon(chartType)
  if (!icon) {
    return null
  }
  return icon === 'visibility' ? 'primary' : 'grey-6'
}

// 차트 타입의 레이어 인덱스 번호 반환 (예: "1, 2" 또는 "1")
function getChartTypeLayerIndices(chartType) {
  if (!isChartTypeSelected(chartType)) {
    return ''
  }

  const layers = localSettings.value.layers || []
  const chartTypeLayers = layers.filter((layer) => layer.type === chartType)

  if (chartTypeLayers.length === 0) {
    return ''
  }

  // 레이어 인덱스 번호 수집 (1부터 시작, 레이어 섹션에서 표시하는 번호와 동일)
  const indices = chartTypeLayers.map((layer) => {
    const layerIndex = layers.indexOf(layer)
    return layerIndex + 1
  })

  return indices.join(', ')
}

// 차트 타입의 라벨 텍스트 반환 (멀티: "Multi 1, 2", 단독: "Single")
function getChartTypeLabelText(chartType) {
  if (!isChartTypeSelected(chartType)) {
    return ''
  }

  if (isMultiChartMode.value) {
    const indices = getChartTypeLayerIndices(chartType)
    return indices ? `Multi ${indices}` : 'Multi'
  } else {
    return 'Single'
  }
}

// 레이어 확장 핸들러 (아코디언 모드: 하나만 열리도록)
function handleLayerExpansion(layerId, isExpanded) {
  // 아코디언 모드: 하나만 열리도록
  if (isExpanded) {
    // 열기: 현재 열린 레이어를 닫고 새 레이어 열기
    expandedLayerId.value = layerId
    // 확장될 때 해당 레이어로 스크롤
    nextTick(() => {
      const layerElement = document.getElementById(`layer-item-${layerId}`)
      if (layerElement) {
        layerElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    })
  } else {
    // 닫기
    expandedLayerId.value = null
  }

  emitUpdate()
}

function toggleLayerVisibility(layer) {
  if (layer.visible === undefined) {
    layer.visible = true
  }
  layer.visible = !layer.visible
  emitUpdate()
}

async function moveLayer(index, direction) {
  // FLIP 애니메이션 사용 이유: Vue의 transition-group이 Quasar 컴포넌트와 함께 사용 시
  // 배열 순서 변경을 제대로 감지하지 못하여 수동으로 FLIP 기법을 구현
  let movedLayerId = null
  const currentLayers = [...localSettings.value.layers]

  // FLIP 애니메이션 Step 1: First - 이동 전 각 레이어의 위치를 저장
  const layerElements = document.querySelectorAll('.layer-item')
  const beforePositions = new Map()
  layerElements.forEach((el) => {
    const id = el.getAttribute('data-layer-id')
    if (id) {
      const rect = el.getBoundingClientRect()
      beforePositions.set(id, {
        top: rect.top,
        left: rect.left,
        height: rect.height,
      })
    }
  })

  if (direction === 'up' && index > 0) {
    movedLayerId = currentLayers[index].id
    const newLayers = [...currentLayers]
    ;[newLayers[index - 1], newLayers[index]] = [newLayers[index], newLayers[index - 1]]
    newLayers.forEach((layer, i) => {
      layer.layerIndex = i
    })
    localSettings.value.layers = newLayers
    emitUpdate()
  } else if (direction === 'down' && index < currentLayers.length - 1) {
    movedLayerId = currentLayers[index].id
    const newLayers = [...currentLayers]
    ;[newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]]
    newLayers.forEach((layer, i) => {
      layer.layerIndex = i
    })
    localSettings.value.layers = newLayers
    emitUpdate()
  }

  // DOM 업데이트 대기 (Vue가 배열 변경을 반영할 시간)
  await nextTick()
  await nextTick()

  // FLIP 애니메이션 Step 2-4: Last, Invert, Play
  const afterElements = document.querySelectorAll('.layer-item')
  afterElements.forEach((el) => {
    const id = el.getAttribute('data-layer-id')
    if (id && beforePositions.has(id)) {
      const before = beforePositions.get(id) // Step 1에서 저장한 원래 위치
      const after = el.getBoundingClientRect() // Step 2: Last - 배열 변경 후 새 위치

      const deltaY = before.top - after.top // 이동해야 할 거리 계산

      if (Math.abs(deltaY) > 1) {
        // Step 3: Invert - 요소를 원래 위치로 되돌림 (사용자 눈에는 변화 없음)
        el.style.transform = `translateY(${deltaY}px)`
        el.style.transition = 'none' // 즉시 이동 (애니메이션 없음)

        // Step 4: Play - transform을 제거하여 목표 위치로 부드럽게 이동
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transform = '' // transform 제거 = 목표 위치로 이동
            el.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' // 부드러운 애니메이션
          })
        })
      }
    }
  })

  // 하이라이트 효과
  if (movedLayerId) {
    highlightedLayerId.value = movedLayerId
    setTimeout(() => {
      highlightedLayerId.value = null
    }, 1000)
  }

  // 애니메이션 완료 후 transition 제거
  setTimeout(() => {
    afterElements.forEach((el) => {
      el.style.transition = ''
    })
  }, 500)
}

/**
 * "전체 설정 우선" 모드 토글 핸들러 (스타일)
 * 플래그 변경 없음 - 모드 값만 저장, 병합 로직에서 이 값을 직접 참조하여 우선순위 결정
 * 템플릿에서 사용됨 (131번 줄)
 *
 * @param {boolean} _value - 토글 상태 (true: 전체 설정 우선, false: 상세 설정 보호)
 */
// eslint-disable-next-line no-unused-vars
function handleApplyToAllStylesChange(_value) {
  // _value는 v-model 바인딩으로 자동 업데이트되므로 사용하지 않음
  // 플래그 변경 없음 - 모드 값만 저장
  // 병합 로직에서 이 값을 직접 참조하여 우선순위 결정
  emitUpdate()
}

/**
 * "전체 설정 우선" 모드 토글 핸들러 (시각효과)
 * 플래그 변경 없음 - 모드 값만 저장, 병합 로직에서 이 값을 직접 참조하여 우선순위 결정
 * 템플릿에서 사용됨 (68번 줄)
 *
 * @param {boolean} _value - 토글 상태 (true: 전체 설정 우선, false: 상세 설정 보호)
 */
// eslint-disable-next-line no-unused-vars
function handleApplyToAllEffectsChange(_value) {
  // _value는 v-model 바인딩으로 자동 업데이트되므로 사용하지 않음
  // 플래그 변경 없음 - 모드 값만 저장
  // 병합 로직에서 이 값을 직접 참조하여 우선순위 결정
  emitUpdate()
}

/**
 * "전체 설정 우선" 모드 토글 핸들러 (차트 옵션)
 * 플래그 변경 없음 - 모드 값만 저장, 병합 로직에서 이 값을 직접 참조하여 우선순위 결정
 *
 * @param {boolean} _value - 토글 상태 (true: 전체 설정 우선, false: 상세 설정 보호)
 */
// eslint-disable-next-line no-unused-vars
function handleApplyToAllOptionsChange(_value) {
  // _value는 v-model 바인딩으로 자동 업데이트되므로 사용하지 않음
  // 플래그 변경 없음 - 모드 값만 저장
  // 병합 로직에서 이 값을 직접 참조하여 우선순위 결정
  emitUpdate()
}

/**
 * "전체 설정 우선" 모드 토글 핸들러 (인터랙션)
 * 플래그 변경 없음 - 모드 값만 저장, 병합 로직에서 이 값을 직접 참조하여 우선순위 결정
 *
 * @param {boolean} _value - 토글 상태 (true: 전체 설정 우선, false: 상세 설정 보호)
 */
// eslint-disable-next-line no-unused-vars
function handleApplyToAllInteractionsChange(_value) {
  // _value는 v-model 바인딩으로 자동 업데이트되므로 사용하지 않음
  // 플래그 변경 없음 - 모드 값만 저장
  // 병합 로직에서 이 값을 직접 참조하여 우선순위 결정
  emitUpdate()
}

// 레이어 옵션 객체 초기화 보장
function ensureLayerOptions(layer) {
  if (!layer.options) {
    layer.options = {
      showLabels: true,
      animation: true,
      showGrid: true,
      showLegend: true,
      ...localSettings.value.chartOptions,
    }
  }
}

// 레이어 인터랙션 객체 초기화 보장
function ensureLayerInteraction(layer) {
  if (!layer.interaction) {
    layer.interaction = {
      tooltip: true,
      hover: true,
      click: true,
      ...localSettings.value.interaction,
    }
  }
}

// 전역 스타일 변경 시 레이어 스타일을 자동으로 변경하지 않음
// 상세 설정이 우선 적용되므로, 레이어별로 명시적으로 설정된 값은 유지됨
// 실제 렌더링 시 병합은 DataChartRenderer.vue의 mergeLayerStyle 함수에서 처리됨

// 레이어 옵션 및 인터랙션 초기화 watch
watch(
  () => localSettings.value.layers,
  (layers) => {
    if (layers && layers.length > 0) {
      layers.forEach((layer) => {
        ensureLayerOptions(layer)
        ensureLayerInteraction(layer)
      })
    }
  },
  { deep: true, immediate: true },
)

watch(
  () => props.settings,
  (newSettings) => {
    localSettings.value = {
      ...newSettings,
      chartTypes: newSettings.chartTypes || (newSettings.chartType ? [newSettings.chartType] : ['line']),
      layers: newSettings.layers || [],
      applyToAllStyles: newSettings.applyToAllStyles !== undefined ? newSettings.applyToAllStyles : false,
      applyToAllEffects: newSettings.applyToAllEffects !== undefined ? newSettings.applyToAllEffects : false,
      applyToAllOptions: newSettings.applyToAllOptions !== undefined ? newSettings.applyToAllOptions : false,
      applyToAllInteractions: newSettings.applyToAllInteractions !== undefined ? newSettings.applyToAllInteractions : false,
      style: {
        strokeWidth: 2,
        dotSize: 6,
        nodeSize: 4,
        color: null,
        ...(newSettings.style
          ? {
              strokeWidth: newSettings.style.strokeWidth,
              dotSize: newSettings.style.dotSize,
              nodeSize: newSettings.style.nodeSize,
              color: newSettings.style.color,
            }
          : {}),
      },
      effects: {
        opacity: 1,
        blur: 0,
        neonIntensity: 0,
        ...(newSettings.effects ||
          (newSettings.style
            ? {
                opacity: newSettings.style.opacity,
                blur: newSettings.style.blur,
                neonIntensity: newSettings.style.neonIntensity,
              }
            : {})),
      },
      interaction: {
        tooltip: true,
        hover: true,
        click: true,
        ...newSettings.interaction,
      },
      chartOptions: {
        showLegend: true,
        showGrid: true,
        showLabels: true,
        animation: true,
        ...newSettings.chartOptions,
      },
    }

    // 레이어가 변경되면 expandedLayerId 동기화 (존재하지 않는 레이어 ID면 null로)
    const newLayerIds = new Set((localSettings.value.layers || []).map((l) => l.id))
    if (expandedLayerId.value && !newLayerIds.has(expandedLayerId.value)) {
      expandedLayerId.value = null
    }
  },
  { deep: true },
)
</script>

<style lang="scss" scoped>
.chart-view-settings {
  :deep(.q-expansion-item) {
    margin-bottom: 8px;
  }

  :deep(.q-card) {
    box-shadow: none;
    border: 1px solid var(--nexa-border);
  }

  // 멀티 차트 레이어 아이템 스타일
  .layer-item {
    border: 1px solid var(--nexa-border-color);
    border-radius: 4px;
    padding: 0;
    margin: 4px 0;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    will-change: transform;
    overflow: hidden;

    &:hover {
      border-color: var(--nexa-borde);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    // 아코디언 헤더 스타일
    :deep(.q-expansion-item) {
      .q-item {
        padding: 2px 16px;
      }
    }

    // 레이어 헤더 텍스트 정렬
    .layer-header-text {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    // 레이어 번호 스타일 (작게 표시)
    .layer-number {
      font-size: 12px;
      font-weight: 400;
      color: var(--nexa-text-secondary);
      line-height: 1;
    }

    // 순서 변경 버튼 스타일
    .layer-order-btn {
      border: 1px solid var(--nexa-border-color);
      border-radius: 4px;
      margin-left: 4px;
      min-width: 32px;

      &:hover:not(:disabled) {
        border-color: var(--nexa-ui-primary);
        background-color: rgba(var(--nexa-primary-rgb, 0, 118, 253), 0.1);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    // 하이라이트 효과 (순서 변경 시)
    .layer-highlight {
      border-color: var(--nexa-primary) !important;
      box-shadow: 0 0 12px rgba(var(--nexa-primary-rgb, 0, 118, 253), 0.4) !important;
      animation: highlight-pulse 1s ease-out;
    }

    // 아코디언 내용 영역 패딩
    :deep(.q-expansion-item__content) {
      .q-card {
        border: none;
        box-shadow: none;
        border-radius: 0;
      }

      .q-card-section {
        padding: 16px;
      }
    }
  }

  // 레이어 이동 애니메이션
  .layer-move-move {
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
  }

  // transition-group이 자동으로 적용하는 move 클래스 강제 적용
  .layer-item.layer-move-move {
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
  }

  .layer-move-enter-active,
  .layer-move-leave-active {
    transition: all 0.4s ease;
  }

  .layer-move-enter-from {
    opacity: 0;
    transform: translateY(-20px);
  }

  .layer-move-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }

  // 하이라이트 펄스 애니메이션
  @keyframes highlight-pulse {
    0% {
      box-shadow: 0 0 0 rgba(var(--nexa-primary-rgb, 0, 118, 253), 0);
    }
    50% {
      box-shadow: 0 0 16px rgba(var(--nexa-primary-rgb, 0, 118, 253), 0.6);
    }
    100% {
      box-shadow: 0 0 12px rgba(var(--nexa-primary-rgb, 0, 118, 253), 0.4);
    }
  }

  // 슬라이더 라벨 스타일
  .slider-label {
    min-width: 120px;
    max-width: 140px;
    margin-right: 10px;
    flex-shrink: 0;
    text-align: right;
  }

  // 슬라이더 값 표시 스타일
  .slider-value {
    min-width: 50px;
    text-align: right;
    color: var(--nexa-text-primary);
  }

  // 슬라이더 커서 스타일
  :deep(.q-slider) {
    cursor: default;

    .q-slider__track,
    .q-slider__thumb,
    .q-slider__track-container {
      cursor: default;
    }
  }

  // 전역 설정 모드 토글 스타일
  .mode-toggle-section {
    display: flex;
    justify-content: center;

    :deep(.q-btn-toggle) {
      .q-btn {
        min-width: 140px;
        padding: 8px 16px;
        font-size: 13px;
        font-weight: 500;

        .q-icon {
          margin-right: 6px;
        }
      }
    }

    .mode-description {
      line-height: 1.5;
      max-width: 500px;

      .q-icon {
        vertical-align: middle;
      }

      strong {
        color: var(--nexa-text-primary);
      }
    }
  }

  // 레이어별 색상 입력 필드 높이 조정
  :deep(.layer-color-input) {
    .q-field__control {
      min-height: 32px;
      height: 32px;
    }

    .q-field__native {
      min-height: 32px;
      padding: 4px 12px;
    }
  }

  // 레이어별 옵션 체크박스 라벨 스타일
  :deep(.layer-option-checkbox) {
    .q-checkbox__label {
      font-size: 12px;
      font-weight: 400;
    }
  }

  // 차트 모드 라벨 색상
  .chart-mode-label-multi {
    color: var(--nexa-primary);
  }

  .chart-mode-label-single {
    color: var(--nexa-text-secondary);
  }

  // 경고 텍스트 스타일
  .warning-text {
    font-weight: 500;
  }

  // 모드 설명 텍스트 스타일
  .mode-description-compact {
    margin-top: 2px;
    padding: 0;
    line-height: 1;
  }

  .mode-description-normal {
    line-height: 1.3;
  }

  // 컬럼 레이아웃 간격
  .column-gap-small {
    gap: 2px;
  }

  .column-gap-full {
    gap: 2px;
    width: 100%;
  }

  // 안내 문구 스타일
  .info-notice {
    color: var(--nexa-accent);
    font-size: 13px;

    .info-notice-icon {
      font-size: 16px; // sm 크기와 유사한 크기
      width: 16px;
      height: 16px;
    }
  }

  // 필드 라벨 너비
  .field-label {
    min-width: 120px;
  }

  // 슬라이더 라벨은 이미 정의되어 있지만 인라인 스타일이 우선순위가 높으므로
  // 인라인 스타일을 제거하면 기존 CSS가 적용됨
}
</style>
