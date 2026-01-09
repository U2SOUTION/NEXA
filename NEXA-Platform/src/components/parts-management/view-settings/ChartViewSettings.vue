<!-- ChartViewSettings.vue
  차트 뷰 설정 컴포넌트
-->
<template>
  <div class="chart-view-settings">
    <!-- 모드 선택 탭 -->
    <q-tabs v-model="chartMode" dense class="q-mb-md">
      <q-tab name="single" label="싱글 모드" icon="bar_chart" />
      <q-tab name="multi" label="멀티 모드" icon="layers" />
    </q-tabs>

    <q-tab-panels v-model="chartMode" animated>
      <!-- 싱글 모드 -->
      <q-tab-panel name="single">
        <q-list>
          <!-- 차트 기본 설정 -->
          <q-expansion-item v-model="expanded.basic" label="차트 기본 설정" icon="bar_chart" header-class="text-weight-bold" group="settings-accordion-single">
            <q-card>
              <q-card-section>
                <!-- 차트 타입 (멀티 셀렉트) -->
                <div class="q-mb-md">
                  <div class="text-caption q-mb-xs">
                    <span v-if="singleChartType">차트 타입: {{ getChartTypeLabel(singleChartType) }}</span>
                    <span v-else>
                      차트 타입을 선택하세요
                      <span class="text-warning q-ml-xs warning-text">
                        <q-icon name="warning" size="xs" class="q-mr-xs" />
                        최소 1개 선택 필요
                      </span>
                    </span>
                  </div>
                  <q-select v-model="singleChartType" :options="chartTypeOptions" option-label="label" option-value="value" emit-value map-options dense outlined clearable label="차트 타입" @update:model-value="handleSingleChartTypeChange" />
                </div>

                <!-- X축 필드, Y축 필드 (한 줄 배치) -->
                <div class="row q-gutter-md q-mb-md">
                  <div class="col">
                    <q-select v-model="localSettings.xAxisField" :options="availableFieldsOptions" option-label="label" option-value="value" emit-value map-options dense outlined label="X축 필드" @update:model-value="handleGlobalFieldChange('xAxisField', $event)" />
                  </div>
                  <div class="col">
                    <q-select v-model="localSettings.yAxisField" :options="availableFieldsOptions" option-label="label" option-value="value" emit-value map-options dense outlined label="Y축 필드" @update:model-value="handleGlobalFieldChange('yAxisField', $event)" />
                  </div>
                </div>

                <!-- 집계 방식 -->
                <div class="q-mb-md" v-if="localSettings.yAxisField && localSettings.yAxisField !== '__count__'">
                  <q-select v-model="localSettings.aggregation" :options="aggregationOptions" option-label="label" option-value="value" emit-value map-options dense outlined label="집계 방식" @update:model-value="handleGlobalFieldChange('aggregation', $event)" />
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- 시각 효과 -->
          <q-expansion-item v-model="expanded.effects" label="시각 효과" icon="auto_awesome" header-class="text-weight-bold" group="settings-accordion-single">
            <q-card>
              <q-card-section>
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
          <q-expansion-item v-model="expanded.style" label="스타일" icon="palette" header-class="text-weight-bold" group="settings-accordion-single">
            <q-card>
              <q-card-section>
                <!-- 스타일 미지원 차트 타입 안내 -->
                <div v-if="singleChartType && !supportsColor(singleChartType) && !supportsStrokeWidth(singleChartType) && !supportsDotSize(singleChartType) && !supportsNodeSize(singleChartType)" class="text-center q-pa-sm">
                  <q-icon name="info" size="md" color="grey-6" class="q-mb-sm" />
                  <div class="text-body2 text-grey-7">이 차트 타입은 스타일 설정을 지원하지 않습니다</div>
                </div>
                <div v-else>
                  <!-- 단독 차트 모드 공통 안내 -->
                  <div class="q-mb-md" v-if="singleChartType">
                    <div class="text-body2 text-center info-notice">
                      <q-icon name="warning" class="q-mr-xs info-notice-icon" />
                      아래 설정의 각 항목은 적용 가능한 차트에만 자동으로 적용됩니다
                    </div>
                  </div>

                  <div class="q-mb-md" v-if="singleChartType && supportsColor(singleChartType)">
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

                  <div class="q-mb-md" v-if="singleChartType && supportsStrokeWidth(singleChartType)">
                    <div class="row items-center q-gutter-sm">
                      <div class="text-caption slider-label">라인 두께 (1 - 20)</div>
                      <q-slider v-model="localSettings.style.strokeWidth" :min="1" :max="20" :step="0.5" class="col" @update:model-value="emitUpdate" />
                      <div class="text-caption text-weight-medium slider-value">{{ localSettings.style.strokeWidth.toFixed(1) }}</div>
                    </div>
                  </div>

                  <div class="q-mb-md" v-if="singleChartType && supportsDotSize(singleChartType)">
                    <div class="row items-center q-gutter-sm">
                      <div class="text-caption slider-label">데이터 점 크기 (1 - 50)</div>
                      <q-slider v-model="localSettings.style.dotSize" :min="1" :max="50" :step="0.5" class="col" @update:model-value="emitUpdate" />
                      <div class="text-caption text-weight-medium slider-value">{{ localSettings.style.dotSize.toFixed(1) }}</div>
                    </div>
                  </div>

                  <div class="q-mb-md" v-if="singleChartType && supportsNodeSize(singleChartType)">
                    <div class="row items-center q-gutter-sm">
                      <div class="text-caption slider-label">노드 크기 (0 - 20)</div>
                      <q-slider v-model="localSettings.style.nodeSize" :min="0" :max="20" :step="0.5" class="col" @update:model-value="emitUpdate" />
                      <div class="text-caption text-weight-medium slider-value">{{ localSettings.style.nodeSize.toFixed(1) }}</div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- 멀티 차트 레이어 설정 (멀티 모드일 때만 표시) -->
          <q-expansion-item v-if="isMultiChartMode" v-model="expanded.layers" label="멀티 차트 레이어" icon="layers" header-class="text-weight-bold" group="settings-accordion-single">
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
                          <!-- X축 필드, Y축 필드 (한 줄 배치) -->
                          <div class="row q-gutter-md q-mb-md">
                            <div class="col">
                              <q-select v-model="layer.xField" :options="availableFieldsOptions" option-label="label" option-value="value" emit-value map-options dense outlined label="X축 필드" placeholder="X축 필드 선택 하세요" @update:model-value="handleFieldChange(layer, 'xField', $event)" />
                            </div>
                            <div class="col">
                              <q-select v-model="layer.yField" :options="availableFieldsOptions" option-label="label" option-value="value" emit-value map-options dense outlined label="Y축 필드" placeholder="Y축 필드 선택 하세요" @update:model-value="handleFieldChange(layer, 'yField', $event)" />
                            </div>
                          </div>

                          <!-- 집계 방식 -->
                          <div class="q-mb-md" v-if="(!layer.yField && localSettings.yAxisField && localSettings.yAxisField !== '__count__') || (layer.yField && layer.yField !== '__count__')">
                            <q-select
                              v-model="layer.aggregation"
                              :options="aggregationOptions"
                              option-label="label"
                              option-value="value"
                              emit-value
                              map-options
                              dense
                              outlined
                              label="집계 방식"
                              placeholder="집계 방식 선택 하세요"
                              @update:model-value="handleFieldChange(layer, 'aggregation', $event)"
                            />
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
          <q-expansion-item v-model="expanded.options" label="차트 옵션" icon="tune" header-class="text-weight-bold" group="settings-accordion-single">
            <q-card>
              <q-card-section>
                <!-- 단독 차트 모드 공통 안내 -->
                <div class="q-mb-md">
                  <div class="text-body2 text-center info-notice">
                    <q-icon name="warning" class="q-mr-xs info-notice-icon" />
                    아래 설정의 각 항목은 적용 가능한 차트에만 자동으로 적용됩니다
                  </div>
                </div>

                <div class="q-gutter-sm checkbox-group-center">
                  <q-checkbox v-model="localSettings.chartOptions.showLabels" label="라벨" @update:model-value="emitUpdate" />
                  <q-checkbox v-model="localSettings.chartOptions.animation" label="애니메이션" @update:model-value="emitUpdate" />
                  <q-checkbox v-model="localSettings.chartOptions.showGrid" label="그리드" @update:model-value="emitUpdate" />
                  <q-checkbox v-model="localSettings.chartOptions.showLegend" label="범례" @update:model-value="emitUpdate" />
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- 인터랙션 설정 -->
          <q-expansion-item v-model="expanded.interaction" label="인터랙션" icon="touch_app" header-class="text-weight-bold" group="settings-accordion-single">
            <q-card>
              <q-card-section>
                <!-- 단독 차트 모드 공통 안내 -->
                <div class="q-mb-md">
                  <div class="text-body2 text-center info-notice">
                    <q-icon name="warning" class="q-mr-xs info-notice-icon" />
                    아래 설정의 각 항목은 적용 가능한 차트에만 자동으로 적용됩니다
                  </div>
                </div>

                <div class="q-gutter-sm checkbox-group-center">
                  <q-checkbox v-model="localSettings.interaction.tooltip" label="툴팁" @update:model-value="emitUpdate" />
                  <q-checkbox v-model="localSettings.interaction.hover" label="호버" @update:model-value="emitUpdate" />
                  <q-checkbox v-model="localSettings.interaction.click" label="클릭" @update:model-value="emitUpdate" />
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </q-tab-panel>

      <!-- 멀티 모드 -->
      <q-tab-panel name="multi">
        <q-list>
          <!-- 차트 기본 설정 (멀티 모드) -->
          <q-expansion-item v-model="expanded.basic" label="차트 기본 설정" icon="bar_chart" header-class="text-weight-bold" group="multi-main-accordion">
            <q-card>
              <q-card-section>
                <!-- 전역 설정 체크박스 -->
                <div class="q-mb-md global-settings-section">
                  <div class="global-checkbox-wrapper">
                    <q-checkbox v-model="useGlobalSettings" label="전역 설정 사용 (모든 설정변경이 모든 레이어에 전파)" class="text-body2" />
                  </div>
                  <div class="guide-text">
                    <q-icon name="warning" class="guide-icon q-mr-xs" />
                    공통 설정 후 개별적 설정 변경 하려면 반드시 해지 하세요!!
                  </div>
                </div>

                <!-- X축 필드, Y축 필드 (한 줄 배치) -->
                <div class="row q-gutter-md q-mb-md">
                  <div class="col">
                    <q-select v-model="localSettings.xAxisField" :options="availableFieldsOptions" option-label="label" option-value="value" emit-value map-options dense outlined label="X축 필드" @update:model-value="handleGlobalFieldChange('xAxisField', $event)" />
                  </div>
                  <div class="col">
                    <q-select v-model="localSettings.yAxisField" :options="availableFieldsOptions" option-label="label" option-value="value" emit-value map-options dense outlined label="Y축 필드" @update:model-value="handleGlobalFieldChange('yAxisField', $event)" />
                  </div>
                </div>

                <!-- 집계 방식 -->
                <div class="q-mb-md" v-if="localSettings.yAxisField && localSettings.yAxisField !== '__count__'">
                  <q-select v-model="localSettings.aggregation" :options="aggregationOptions" option-label="label" option-value="value" emit-value map-options dense outlined label="집계 방식" @update:model-value="handleGlobalFieldChange('aggregation', $event)" />
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>

          <!-- 멀티 차트 레이어 설정 (레이어 중심 구조) -->
          <q-expansion-item
            v-for="(layer, index) in visibleLayers"
            :key="layer.id"
            :model-value="expandedLayerId === layer.id"
            @update:model-value="handleLayerExpansion(layer.id, $event)"
            header-class="text-weight-bold"
            group="multi-main-accordion"
            :class="['layer-item', { 'layer-highlight': highlightedLayerId === layer.id }]"
            :data-layer-id="layer.id"
            :data-layer-index="index"
            :id="`layer-item-${layer.id}`"
          >
            <template v-slot:header>
              <q-item-section>
                <q-item-label class="text-subtitle2 layer-header-text" :class="{ 'layer-hidden': layer.visible === false }">
                  <q-icon name="layers" class="q-mr-sm" />
                  <span class="layer-index-text">Layer{{ index + 1 }}</span>
                  <span class="layer-chart-name">{{ getChartTypeLabel(layer.type) }}</span>
                  <span v-if="useGlobalSettings" class="layer-global-badge">전역설정 사용중</span>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="row items-center q-gutter-xs">
                  <q-btn flat dense :icon="layer.visible !== false ? 'visibility' : 'visibility_off'" size="sm" class="layer-visibility-btn" @click.stop="toggleLayerVisibility(layer)" />
                  <q-btn flat dense icon="arrow_upward" size="sm" class="layer-order-btn" :disable="index === 0" @click.stop="moveLayerInMultiMode(layer.id, index, 'up')" />
                  <q-btn flat dense icon="arrow_downward" size="sm" class="layer-order-btn" :disable="index === visibleLayers.length - 1" @click.stop="moveLayerInMultiMode(layer.id, index, 'down')" />
                </div>
              </q-item-section>
            </template>
            <q-card>
              <q-card-section>
                <!-- X축 필드, Y축 필드 (한 줄 배치) -->
                <div class="row q-gutter-md q-mb-md">
                  <div class="col">
                    <q-select v-model="layer.xField" :options="availableFieldsOptions" option-label="label" option-value="value" emit-value map-options dense outlined label="X축 필드" placeholder="X축 필드 선택 하세요" @update:model-value="handleFieldChange(layer, 'xField', $event)" />
                  </div>
                  <div class="col">
                    <q-select v-model="layer.yField" :options="availableFieldsOptions" option-label="label" option-value="value" emit-value map-options dense outlined label="Y축 필드" placeholder="Y축 필드 선택 하세요" @update:model-value="handleFieldChange(layer, 'yField', $event)" />
                  </div>
                </div>

                <!-- 집계 방식 -->
                <div class="q-mb-md" v-if="(!layer.yField && localSettings.yAxisField && localSettings.yAxisField !== '__count__') || (layer.yField && layer.yField !== '__count__')">
                  <q-select v-model="layer.aggregation" :options="aggregationOptions" option-label="label" option-value="value" emit-value map-options dense outlined label="집계 방식" placeholder="집계 방식 선택 하세요" @update:model-value="handleFieldChange(layer, 'aggregation', $event)" />
                </div>

                <!-- 레이어별 시각 효과 -->
                <q-expansion-item label="시각 효과" icon="auto_awesome" dense class="q-mb-sm" group="layer-settings-accordion">
                  <q-card>
                    <q-card-section>
                      <div class="q-mb-md">
                        <div class="row items-center q-gutter-sm">
                          <div class="text-caption slider-label">투명도 강도 (0 - 10)</div>
                          <q-slider :model-value="(1 - (layer.style?.opacity ?? localSettings.effects?.opacity ?? 1)) * 10" :min="0" :max="10" :step="0.1" class="col" @update:model-value="handleLayerOpacityChange(layer, $event)" />
                          <div class="text-caption text-weight-medium slider-value">{{ ((1 - (layer.style?.opacity ?? localSettings.effects?.opacity ?? 1)) * 10).toFixed(1) }}</div>
                        </div>
                      </div>
                      <div class="q-mb-md">
                        <div class="row items-center q-gutter-sm">
                          <div class="text-caption slider-label">흐리기 강도 (0 - 10)</div>
                          <q-slider :model-value="layer.style?.blur ?? localSettings.effects?.blur ?? 0" :min="0" :max="10" :step="0.5" class="col" @update:model-value="handleLayerBlurChange(layer, $event)" />
                          <div class="text-caption text-weight-medium slider-value">{{ (layer.style?.blur ?? localSettings.effects?.blur ?? 0).toFixed(1) }}</div>
                        </div>
                      </div>
                      <div class="q-mb-md">
                        <div class="row items-center q-gutter-sm">
                          <div class="text-caption slider-label">네온 강도 (0 - 20)</div>
                          <q-slider :model-value="layer.style?.neonIntensity ?? localSettings.effects?.neonIntensity ?? 0" :min="0" :max="20" :step="0.5" class="col" @update:model-value="handleLayerNeonChange(layer, $event)" />
                          <div class="text-caption text-weight-medium slider-value">{{ (layer.style?.neonIntensity ?? localSettings.effects?.neonIntensity ?? 0).toFixed(1) }}</div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>

                <!-- 레이어별 스타일 -->
                <q-expansion-item label="스타일" icon="palette" dense class="q-mb-sm" group="layer-settings-accordion">
                  <q-card>
                    <q-card-section>
                      <!-- 스타일 미지원 차트 타입 안내 -->
                      <div v-if="!supportsColor(layer.type) && !supportsStrokeWidth(layer.type) && !supportsDotSize(layer.type) && !supportsNodeSize(layer.type)" class="text-center q-pa-md">
                        <q-icon name="info" size="md" color="grey-6" class="q-mb-sm" />
                        <div class="text-body2 text-grey-7">이 차트 타입은 스타일 설정을 지원하지 않습니다</div>
                      </div>
                      <div v-else>
                        <div class="q-mb-md" v-if="supportsColor(layer.type)">
                          <div class="row items-center q-gutter-sm">
                            <div class="text-caption slider-label">색상</div>
                            <div class="col">
                              <q-input :model-value="layer.style?.color ?? localSettings.style?.color ?? ''" type="text" placeholder="색상 코드" dense outlined @update:model-value="handleLayerColorChange(layer, $event)">
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
                                      <q-color :model-value="layer.style?.color ?? localSettings.style?.color ?? ''" @update:model-value="handleLayerColorChange(layer, $event)" />
                                    </q-popup-proxy>
                                  </q-icon>
                                </template>
                              </q-input>
                            </div>
                          </div>
                        </div>
                        <div class="q-mb-md" v-if="supportsStrokeWidth(layer.type)">
                          <div class="row items-center q-gutter-sm">
                            <div class="text-caption slider-label">라인 두께 (1 - 20)</div>
                            <q-slider :model-value="layer.style?.strokeWidth ?? localSettings.style?.strokeWidth ?? 2" :min="1" :max="20" :step="0.5" class="col" @update:model-value="handleLayerStrokeWidthChange(layer, $event)" />
                            <div class="text-caption text-weight-medium slider-value">{{ (layer.style?.strokeWidth ?? localSettings.style?.strokeWidth ?? 2).toFixed(1) }}</div>
                          </div>
                        </div>
                        <div class="q-mb-md" v-if="supportsDotSize(layer.type)">
                          <div class="row items-center q-gutter-sm">
                            <div class="text-caption slider-label">데이터 점 크기 (1 - 50)</div>
                            <q-slider :model-value="layer.style?.dotSize ?? localSettings.style?.dotSize ?? 6" :min="1" :max="50" :step="0.5" class="col" @update:model-value="handleLayerDotSizeChange(layer, $event)" />
                            <div class="text-caption text-weight-medium slider-value">{{ (layer.style?.dotSize ?? localSettings.style?.dotSize ?? 6).toFixed(1) }}</div>
                          </div>
                        </div>
                        <div class="q-mb-md" v-if="supportsNodeSize(layer.type)">
                          <div class="row items-center q-gutter-sm">
                            <div class="text-caption slider-label">노드 크기 (0 - 20)</div>
                            <q-slider :model-value="layer.style?.nodeSize ?? localSettings.style?.nodeSize ?? 4" :min="0" :max="20" :step="0.5" class="col" @update:model-value="handleLayerNodeSizeChange(layer, $event)" />
                            <div class="text-caption text-weight-medium slider-value">{{ (layer.style?.nodeSize ?? localSettings.style?.nodeSize ?? 4).toFixed(1) }}</div>
                          </div>
                        </div>
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>

                <!-- 레이어별 차트 옵션 -->
                <q-expansion-item label="차트 옵션" icon="tune" dense class="q-mb-sm" group="layer-settings-accordion">
                  <q-card>
                    <q-card-section>
                      <div class="q-gutter-sm checkbox-group-center">
                        <q-checkbox :model-value="layer.showLabels ?? localSettings.chartOptions?.showLabels ?? true" label="라벨" @update:model-value="handleLayerOptionChange(layer, 'showLabels', $event)" />
                        <q-checkbox :model-value="layer.options?.animation ?? localSettings.chartOptions?.animation ?? true" label="애니메이션" @update:model-value="handleLayerOptionChange(layer, 'animation', $event)" />
                        <q-checkbox :model-value="layer.options?.showGrid ?? localSettings.chartOptions?.showGrid ?? true" label="그리드" @update:model-value="handleLayerOptionChange(layer, 'showGrid', $event)" />
                        <q-checkbox :model-value="layer.options?.showLegend ?? localSettings.chartOptions?.showLegend ?? true" label="범례" @update:model-value="handleLayerOptionChange(layer, 'showLegend', $event)" />
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>

                <!-- 레이어별 인터랙션 -->
                <q-expansion-item label="인터랙션" icon="touch_app" dense group="layer-settings-accordion">
                  <q-card>
                    <q-card-section>
                      <div class="q-gutter-sm checkbox-group-center">
                        <q-checkbox :model-value="layer.interaction?.tooltip ?? localSettings.interaction?.tooltip ?? true" label="툴팁" @update:model-value="handleLayerInteractionChange(layer, 'tooltip', $event)" />
                        <q-checkbox :model-value="layer.interaction?.hover ?? localSettings.interaction?.hover ?? true" label="호버" @update:model-value="handleLayerInteractionChange(layer, 'hover', $event)" />
                        <q-checkbox :model-value="layer.interaction?.click ?? localSettings.interaction?.click ?? true" label="클릭" @update:model-value="handleLayerInteractionChange(layer, 'click', $event)" />
                      </div>
                    </q-card-section>
                  </q-card>
                </q-expansion-item>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </q-list>
      </q-tab-panel>
    </q-tab-panels>
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

// 차트 모드 (싱글/멀티)
const chartMode = ref('single')

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

// 전역 설정 사용 여부 (멀티 모드)
const useGlobalSettings = ref(false)

// visibleChartTypes는 더 이상 사용하지 않음 (모든 차트 타입 항상 표시)

// 싱글 모드 차트 타입
const singleChartType = computed({
  get: () => {
    return localSettings.value.chartTypes?.[0] || null
  },
  set: (value) => {
    handleSingleChartTypeChange(value)
  },
})

const localSettings = ref({
  ...props.settings,
  chartTypes: props.settings.chartTypes || (props.settings.chartType ? [props.settings.chartType] : ['line']),
  layers: props.settings.layers || [],
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
  return chartMode.value === 'multi'
})

// 모든 레이어 표시 (멀티 모드) - visible 속성은 차트 렌더링 시에만 사용
const visibleLayers = computed(() => {
  if (!isMultiChartMode.value) return []
  return localSettings.value.layers // 모든 레이어 표시 (visible 필터링 제거)
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

// X축 필드 옵션 및 Y축 필드 옵션은 더 이상 사용하지 않음
// availableFieldsOptions를 직접 사용

// 집계 방식 옵션은 더 이상 사용하지 않음
// aggregationOptions를 직접 사용

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

// 싱글 모드: 단수 선택 처리
function handleSingleChartTypeChange(newType) {
  if (chartMode.value === 'single') {
    localSettings.value.chartTypes = newType ? [newType] : []
    localSettings.value.layers = []
    emitUpdate()
  }
}

// 멀티 모드: 보이는 차트 타입 변경 처리
// handleVisibleChartTypesChange 함수는 더 이상 사용하지 않음 (모든 차트 타입 항상 표시)

// 기존 함수는 제거 (더 이상 사용하지 않음)

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

function emitUpdate() {
  // chartTypes가 배열인지 확인하고 배열로 보장
  const settingsToEmit = { ...localSettings.value }
  if (settingsToEmit.chartTypes && !Array.isArray(settingsToEmit.chartTypes)) {
    // 객체로 변환된 경우 배열로 복원
    settingsToEmit.chartTypes = Object.values(settingsToEmit.chartTypes)
  }
  if (!Array.isArray(settingsToEmit.chartTypes)) {
    settingsToEmit.chartTypes = settingsToEmit.chartTypes ? [settingsToEmit.chartTypes] : []
  }

  emit('update:settings', settingsToEmit)
}

// 필드 변경 핸들러 (체크박스 자동 업데이트)
// 기본 설정(전역) 필드 변경 핸들러 (멀티 모드)
function handleGlobalFieldChange(fieldType, value) {
  const normalizedValue = value === null || value === undefined ? null : value

  if (fieldType === 'xAxisField') {
    localSettings.value.xAxisField = normalizedValue
    // 전역 설정이 체크되어 있으면 모든 레이어에 전파
    if (useGlobalSettings.value) {
      visibleLayers.value.forEach((layer) => {
        layer.xField = normalizedValue
        layer.useCustomXField = normalizedValue !== null
      })
    }
  } else if (fieldType === 'yAxisField') {
    localSettings.value.yAxisField = normalizedValue
    // 전역 설정이 체크되어 있으면 모든 레이어에 전파
    if (useGlobalSettings.value) {
      visibleLayers.value.forEach((layer) => {
        layer.yField = normalizedValue
        layer.useCustomYField = normalizedValue !== null
      })
    }
  } else if (fieldType === 'aggregation') {
    localSettings.value.aggregation = normalizedValue
    // 전역 설정이 체크되어 있으면 모든 레이어에 전파
    if (useGlobalSettings.value) {
      visibleLayers.value.forEach((layer) => {
        layer.aggregation = normalizedValue
        layer.useCustomAggregation = normalizedValue !== null
      })
    }
  }
  emitUpdate()
}

function handleFieldChange(layer, fieldType, value) {
  // 필드 값 설정
  const normalizedValue = value === null || value === undefined ? null : value

  if (fieldType === 'xField') {
    layer.useCustomXField = normalizedValue !== null
    layer.xField = normalizedValue
    // 전역 설정이 체크되어 있으면 모든 레이어와 기본 설정에 전파
    if (useGlobalSettings.value) {
      propagateToAllLayers(layer, 'xField', normalizedValue)
      localSettings.value.xAxisField = normalizedValue
    }
  } else if (fieldType === 'yField') {
    layer.useCustomYField = normalizedValue !== null
    layer.yField = normalizedValue
    // 전역 설정이 체크되어 있으면 모든 레이어와 기본 설정에 전파
    if (useGlobalSettings.value) {
      propagateToAllLayers(layer, 'yField', normalizedValue)
      localSettings.value.yAxisField = normalizedValue
    }
  } else if (fieldType === 'aggregation') {
    layer.useCustomAggregation = normalizedValue !== null
    layer.aggregation = normalizedValue
    // 전역 설정이 체크되어 있으면 모든 레이어와 기본 설정에 전파
    if (useGlobalSettings.value) {
      propagateToAllLayers(layer, 'aggregation', normalizedValue)
      localSettings.value.aggregation = normalizedValue
    }
  }
  emitUpdate()
}

function getChartTypeLabel(type) {
  const option = chartTypeOptions.find((opt) => opt.value === type)
  return option ? option.label : type
}

// isChartTypeSelected 함수는 제거됨 (더 이상 사용하지 않음)

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

// 전역 설정 전파 헬퍼
function propagateToAllLayers(changedLayer, settingType, value) {
  if (!useGlobalSettings.value) return

  visibleLayers.value.forEach((layer) => {
    if (layer.id !== changedLayer.id) {
      if (!layer.style) layer.style = {}
      if (!layer.options) layer.options = {}
      if (!layer.interaction) layer.interaction = {}

      if (settingType === 'opacity' || settingType === 'blur' || settingType === 'neonIntensity') {
        layer.style[settingType] = value
      } else if (settingType === 'color' || settingType === 'strokeWidth' || settingType === 'dotSize' || settingType === 'nodeSize') {
        layer.style[settingType] = value
      } else if (settingType === 'showLabels' || settingType === 'animation' || settingType === 'showGrid' || settingType === 'showLegend') {
        if (settingType === 'showLabels') {
          layer.showLabels = value
        } else {
          layer.options[settingType] = value
        }
      } else if (settingType === 'tooltip' || settingType === 'hover' || settingType === 'click') {
        layer.interaction[settingType] = value
      } else if (settingType === 'xField') {
        layer.xField = value
        layer.useCustomXField = value !== null
      } else if (settingType === 'yField') {
        layer.yField = value
        layer.useCustomYField = value !== null
      } else if (settingType === 'aggregation') {
        layer.aggregation = value
        layer.useCustomAggregation = value !== null
      }
    }
  })
}

// 레이어별 설정 변경 핸들러들
function handleLayerOpacityChange(layer, value) {
  if (!layer.style) layer.style = {}
  const opacity = 1 - value / 10
  layer.style.opacity = opacity
  propagateToAllLayers(layer, 'opacity', opacity)
  emitUpdate()
}

function handleLayerBlurChange(layer, value) {
  if (!layer.style) layer.style = {}
  layer.style.blur = value
  propagateToAllLayers(layer, 'blur', value)
  emitUpdate()
}

function handleLayerNeonChange(layer, value) {
  if (!layer.style) layer.style = {}
  layer.style.neonIntensity = value
  propagateToAllLayers(layer, 'neonIntensity', value)
  emitUpdate()
}

function handleLayerColorChange(layer, value) {
  if (!layer.style) layer.style = {}
  layer.style.color = value
  propagateToAllLayers(layer, 'color', value)
  emitUpdate()
}

function handleLayerStrokeWidthChange(layer, value) {
  if (!layer.style) layer.style = {}
  layer.style.strokeWidth = value
  propagateToAllLayers(layer, 'strokeWidth', value)
  emitUpdate()
}

function handleLayerDotSizeChange(layer, value) {
  if (!layer.style) layer.style = {}
  layer.style.dotSize = value
  propagateToAllLayers(layer, 'dotSize', value)
  emitUpdate()
}

function handleLayerNodeSizeChange(layer, value) {
  if (!layer.style) layer.style = {}
  layer.style.nodeSize = value
  propagateToAllLayers(layer, 'nodeSize', value)
  emitUpdate()
}

function handleLayerOptionChange(layer, optionName, value) {
  if (!layer.options) layer.options = {}
  if (optionName === 'showLabels') {
    layer.showLabels = value
  } else {
    layer.options[optionName] = value
  }
  propagateToAllLayers(layer, optionName, value)
  emitUpdate()
}

function handleLayerInteractionChange(layer, interactionName, value) {
  if (!layer.interaction) layer.interaction = {}
  layer.interaction[interactionName] = value
  propagateToAllLayers(layer, interactionName, value)
  emitUpdate()
}

// 멀티 모드용 레이어 순서 변경 함수
async function moveLayerInMultiMode(layerId, visibleIndex, direction) {
  // visibleLayers의 인덱스를 실제 layers 배열의 인덱스로 변환
  const actualIndex = localSettings.value.layers.findIndex((l) => l.id === layerId)
  if (actualIndex === -1) return

  // FLIP 애니메이션 사용 이유: Vue의 transition-group이 Quasar 컴포넌트와 함께 사용 시
  // 배열 순서 변경을 제대로 감지하지 못하여 수동으로 FLIP 기법을 구현
  let movedLayerId = null
  const currentLayers = [...localSettings.value.layers]

  // FLIP 애니메이션 Step 1: First - 이동 전 각 레이어의 위치를 저장
  const layerElements = document.querySelectorAll('.layer-item')
  const beforePositions = new Map()
  const idMapping = new Map() // 원래 ID와 새 인덱스 매핑 저장

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

  if (direction === 'up' && actualIndex > 0) {
    movedLayerId = currentLayers[actualIndex].id
    const newLayers = [...currentLayers]
    ;[newLayers[actualIndex - 1], newLayers[actualIndex]] = [newLayers[actualIndex], newLayers[actualIndex - 1]]

    // ID 매핑 저장 (애니메이션을 위해 원래 ID 유지)
    newLayers.forEach((layer, i) => {
      layer.layerIndex = i
      idMapping.set(layer.id, i) // 원래 ID를 새 인덱스에 매핑
    })

    localSettings.value.layers = newLayers
    emitUpdate()
  } else if (direction === 'down' && actualIndex < currentLayers.length - 1) {
    movedLayerId = currentLayers[actualIndex].id
    const newLayers = [...currentLayers]
    ;[newLayers[actualIndex], newLayers[actualIndex + 1]] = [newLayers[actualIndex + 1], newLayers[actualIndex]]

    // ID 매핑 저장 (애니메이션을 위해 원래 ID 유지)
    newLayers.forEach((layer, i) => {
      layer.layerIndex = i
      idMapping.set(layer.id, i) // 원래 ID를 새 인덱스에 매핑
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

  // 하이라이트 효과 (원래 ID 사용)
  if (movedLayerId) {
    highlightedLayerId.value = movedLayerId
    setTimeout(() => {
      highlightedLayerId.value = null
    }, 1000)
  }

  // 애니메이션 완료 후 transition 제거 및 ID 업데이트
  setTimeout(() => {
    afterElements.forEach((el) => {
      el.style.transition = ''
    })
    // 애니메이션 완료 후 ID 재할당
    localSettings.value.layers.forEach((layer, i) => {
      layer.id = `layer-${i}`
    })
    emitUpdate()
  }, 500)
}

// 기존 moveLayer 함수 (하위 호환성 유지)
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
      layer.id = `layer-${i}`
    })
    localSettings.value.layers = newLayers
    emitUpdate()
  } else if (direction === 'down' && index < currentLayers.length - 1) {
    movedLayerId = currentLayers[index].id
    const newLayers = [...currentLayers]
    ;[newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]]
    newLayers.forEach((layer, i) => {
      layer.layerIndex = i
      layer.id = `layer-${i}`
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

// applyToAll 관련 핸들러는 제거됨 (전역 설정 체크박스로 대체)

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

// 모드 전환 감지 및 초기화
watch(
  () => chartMode.value,
  (newMode, oldMode) => {
    if (newMode === 'multi' && oldMode === 'single') {
      // 싱글 → 멀티: 모든 차트 타입 자동 생성
      // 멀티 모드 진입 시 기본 설정 열기
      expanded.value.basic = true
      expanded.value.options = false
      expanded.value.effects = false
      expanded.value.style = false
      expanded.value.interaction = false
      // layers와 chartTypes는 [chartMode.value, localSettings.value.layers] watch에서 처리됨
      // 모든 변경이 완료된 후 emit (nextTick 사용)
      nextTick(() => {
        emitUpdate()
      })
    } else if (newMode === 'single' && oldMode === 'multi') {
      // 멀티 → 싱글: 첫 번째 보이는 레이어를 선택
      const firstVisibleLayer = visibleLayers.value.find((l) => l.visible !== false)
      if (firstVisibleLayer) {
        handleSingleChartTypeChange(firstVisibleLayer.type)
      } else if (localSettings.value.layers.length > 0) {
        handleSingleChartTypeChange(localSettings.value.layers[0].type)
      } else {
        // 레이어가 없으면 기본값
        handleSingleChartTypeChange('line')
      }
      // 싱글 모드 진입 시 기본 설정 열기
      expanded.value.basic = true
      expanded.value.options = false
      expanded.value.effects = false
      expanded.value.style = false
      expanded.value.interaction = false
      // handleSingleChartTypeChange 내부에서 이미 emitUpdate()를 호출하므로 여기서는 호출하지 않음
    } else if (oldMode !== undefined) {
      // 초기 로드가 아닌 경우 (oldMode가 undefined가 아닌 경우)
      // chartMode가 다른 방식으로 변경된 경우를 대비하여 emit
      nextTick(() => {
        emitUpdate()
      })
    }
  },
)

// 초기화: 멀티 모드일 때 모든 차트 타입 자동 생성
watch(
  () => [chartMode.value, localSettings.value.layers],
  ([mode, layers]) => {
    if (mode === 'multi') {
      // 멀티 모드: 모든 차트 타입이 레이어로 생성되어야 함
      const allTypes = chartTypeOptions.map((opt) => opt.value)
      const existingTypes = (layers || []).map((l) => l.type)
      const missingTypes = allTypes.filter((t) => !existingTypes.includes(t))

      if (missingTypes.length > 0) {
        // 누락된 타입 추가
        missingTypes.forEach((type) => {
          const layerId = `layer-${localSettings.value.layers.length}`
          localSettings.value.layers.push({
            id: layerId,
            type: type,
            layerIndex: localSettings.value.layers.length,
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
          })
        })

        // 모든 차트 타입을 chartTypes에 설정
        localSettings.value.chartTypes = allTypes
        emitUpdate()
      } else {
        // 이미 모든 레이어가 존재하는 경우에도 chartTypes를 업데이트하고 emit
        // (이전에 저장된 설정을 복원한 경우를 대비)
        if (localSettings.value.chartTypes?.length !== allTypes.length || !localSettings.value.chartTypes.every((t) => allTypes.includes(t))) {
          localSettings.value.chartTypes = allTypes
          emitUpdate()
        }
      }
    }
  },
  { immediate: true },
)

watch(
  () => props.settings,
  (newSettings) => {
    // 현재 모드 확인: 멀티 모드인지 체크
    const chartTypes = newSettings.chartTypes || (newSettings.chartType ? [newSettings.chartType] : ['line'])
    const layers = newSettings.layers || []
    const isMultiMode = chartTypes.length > 1 || layers.length > 1

    // chartMode 업데이트 (현재 모드와 다를 때만)
    if (isMultiMode && chartMode.value !== 'multi') {
      chartMode.value = 'multi'
    } else if (!isMultiMode && chartMode.value !== 'single') {
      chartMode.value = 'single'
    }

    localSettings.value = {
      ...newSettings,
      chartTypes: chartTypes,
      layers: layers,
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
  { deep: true, immediate: true },
)
</script>

<style lang="scss" scoped>
.chart-view-settings {
  //모드 전환 탭 메뉴 스타일 (아이콘과 라벨을 한 줄로 배치, 전체 너비 차지)
  :deep(.q-tabs) {
    border-top: 1px solid var(--nexa-border-color);
    border-bottom: 1px solid var(--nexa-border-color);
    margin-bottom: 0px;
    background-color: var(--nexa-modal-surface);
    width: 100% !important;

    .q-tabs__content {
      width: 100% !important;
      display: flex !important;
    }

    .q-tab {
      flex: 1 !important;
      flex-direction: row !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 6px !important;

      .q-tab__content {
        flex-direction: row !important;
        align-items: center !important;
        gap: 6px !important;
      }

      .q-tab__icon {
        margin: 0 !important;
        order: 1;
      }

      .q-tab__label {
        margin: 0 !important;
        order: 2;
      }
    }
  }

  //아코디언 부모 영역 스타일
  :deep(.q-list) {
    background-color: var(--nexa-modal-surface) !important;
    // border: solid 1px var(--nexa-border-color) !important;
  }

  //아코디언 스타일
  :deep(.q-expansion-item) {
    border: solid 1px var(--nexa-border-color) !important;
    margin-top: 2px !important;
  }

  //아코디언 컨텐츠
  :deep(.q-expansion-item__content) {
    .q-card {
      padding: 20px 30px;
    }
  }

  // 멀티 차트 레이어 아이템 스타일
  .layer-item {
    // 레이어 헤더 텍스트 정렬
    .layer-header-text {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    // 레이어 인덱스 텍스트 (작고 연하게)
    .layer-index-text {
      font-size: 11px;
      font-weight: 400;
      color: var(--nexa-text-secondary, rgba(0, 0, 0, 0.5));
      opacity: 0.6;
      line-height: 1;
    }

    // 레이어 차트명 텍스트
    .layer-chart-name {
      font-size: 14px;
      font-weight: 500;
      color: var(--nexa-text-primary, rgba(0, 0, 0, 0.87));
      margin-left: 4px;
    }

    // 전역 설정 사용 중 알림 배지
    .layer-global-badge {
      display: inline-block;
      margin-left: 8px;
      padding: 2px 8px;
      font-size: 10px;
      font-weight: 600;
      color: var(--nexa-warning, #edb20f);
      border: 1px solid var(--nexa-warning, #edb20f);
      border-radius: 4px;
    }

    // 레이어의 세부설정 아코디언 스타일
    :deep(.q-expansion-item) {
      border: 1px solid var(--nexa-border-color);
      .q-item {
        padding: 2px 16px; //설정 헤더 패딩
        color: var(--nexa-text-secondary);
      }
    }

    // 레이어 번호 스타일 (작게 표시) - 하위 호환성 유지
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

    // 숨김 레이어 스타일 (전환할때 부드러운 opacity 전환)
    .layer-header-text.layer-hidden {
      opacity: 0.6;
      transition: opacity 0.2s ease-in-out;

      .layer-index-text,
      .layer-chart-name {
        opacity: 0.7;
        transition: opacity 0.5s ease-in-out;
      }

      .q-icon {
        opacity: 0.8;
        transition: opacity 2s ease-in-out;
        color: #000000;
      }
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

  // 전역 설정 섹션 (체크박스 + 안내 메시지 가운데 정렬)
  .global-settings-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    .global-checkbox-wrapper {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    // 전역 설정 안내 메시지 스타일
    .guide-text {
      border: 1px solid var(--nexa-warning, #edb20f);
      border-radius: 4px;
      padding: 2px 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: var(--nexa-warning, #edb20f);
      font-size: 12px;
      margin-top: -4px;
      //padding: 4px 0;

      .guide-icon {
        color: var(--nexa-warning, #edb20f);
        font-size: 14px;
        width: 14px;
        height: 14px;
      }
    }
  }

  // 차트 옵션 및 인터렉션 체크박스 그룹 중앙 정렬
  .checkbox-group-center {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }
}
</style>
