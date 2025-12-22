<template>
  <q-page class="portfolio-page">
    <div class="q-pa-lg">
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 text-primary q-mb-sm">PORTFOLIO</h1>
        <p class="text-body1 text-grey-7">넥사에서 만든 제품 소개</p>
        <p class="text-caption text-grey-6 q-mt-xs">소규모 주문 생산 제품을 카테고리별로 소개합니다</p>
      </div>

      <!-- 검색 및 필터 -->
      <div class="row q-gutter-md q-mb-lg">
        <div class="col-12 col-md-6">
          <q-input v-model="searchQuery" placeholder="제품명, 설명으로 검색..." outlined dense clearable>
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-6">
          <q-select v-model="selectedCategory" :options="categoryOptions" placeholder="카테고리 필터" outlined dense clearable>
            <template v-slot:prepend>
              <q-icon name="filter_list" />
            </template>
          </q-select>
        </div>
      </div>

      <q-tabs v-model="activeTab" class="q-mb-lg">
        <q-tab name="industrial" label="Industrial Systems" icon="precision_manufacturing" />
        <q-tab name="living" label="Living Solutions" icon="home" />
        <q-tab name="media" label="Media & Interaction" icon="videocam" />
        <q-tab name="art" label="Media Art" icon="palette" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated>
        <!-- Industrial Systems -->
        <q-tab-panel name="industrial">
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-sm">
              <q-icon name="precision_manufacturing" size="24px" class="q-mr-sm" />
              Industrial Systems
            </div>
            <p class="text-body2 text-grey-7">산업용 정밀 제어, 에너지 관리, 물류 시스템 제품</p>
          </div>
          <div class="row q-gutter-md no-wrap">
            <q-card class="col" clickable style="min-width: 300px">
              <q-card-section>
                <div class="text-h6 q-mb-sm">Precision Control (정밀제어)</div>
                <p class="text-caption text-grey-6 q-mb-sm">정밀 제어 시스템 제품</p>
                <ul class="text-body2 text-grey-7">
                  <li>Nexa Tensor (와이어 제어)</li>
                  <li>Nexa Lift (기중 시스템)</li>
                  <li>Nexa Trek (트랙 시스템)</li>
                </ul>
                <div class="q-mt-sm">
                  <q-btn size="sm" color="primary" label="상세보기" class="q-mr-xs" />
                  <q-btn size="sm" outline color="primary" label="문의하기" />
                </div>
              </q-card-section>
            </q-card>

            <q-card class="col" clickable style="min-width: 300px">
              <q-card-section>
                <div class="text-h6 q-mb-sm">Energy Management (에너지 관리)</div>
                <p class="text-caption text-grey-6 q-mb-sm">에너지 효율 관리 시스템</p>
                <ul class="text-body2 text-grey-7">
                  <li>Nexa Solar (태양광)</li>
                  <li>Nexa Energy (에너지 최적화)</li>
                </ul>
                <div class="q-mt-sm">
                  <q-btn size="sm" color="primary" label="상세보기" class="q-mr-xs" />
                  <q-btn size="sm" outline color="primary" label="문의하기" />
                </div>
              </q-card-section>
            </q-card>

            <q-card class="col" clickable style="min-width: 300px">
              <q-card-section>
                <div class="text-h6 q-mb-sm">Logistics (물류)</div>
                <p class="text-caption text-grey-6 q-mb-sm">물류 관리 시스템</p>
                <ul class="text-body2 text-grey-7">
                  <li>Nexa Stock (재고 관리)</li>
                  <li>Nexa Transport (운송 시스템)</li>
                </ul>
                <div class="q-mt-sm">
                  <q-btn size="sm" color="primary" label="상세보기" class="q-mr-xs" />
                  <q-btn size="sm" outline color="primary" label="문의하기" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>

        <!-- Living Solutions -->
        <q-tab-panel name="living">
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-sm">
              <q-icon name="home" size="24px" class="q-mr-sm" />
              Living Solutions
            </div>
            <p class="text-body2 text-grey-7">주거 환경, 생산성 향상, 스마트 농업 솔루션</p>
          </div>
          <div class="row q-gutter-md no-wrap">
            <q-card class="col" clickable style="min-width: 300px">
              <q-card-section>
                <div class="text-h6 q-mb-sm">Residential (주거지)</div>
                <p class="text-caption text-grey-6 q-mb-sm">주거 환경 솔루션</p>
                <ul class="text-body2 text-grey-7">
                  <li>Nexa Home (홈 오토메이션)</li>
                  <li>Nexa Camper (모바일 홈)</li>
                </ul>
                <div class="q-mt-sm">
                  <q-btn size="sm" color="primary" label="상세보기" class="q-mr-xs" />
                  <q-btn size="sm" outline color="primary" label="문의하기" />
                </div>
              </q-card-section>
            </q-card>

            <q-card class="col" clickable style="min-width: 300px">
              <q-card-section>
                <div class="text-h6 q-mb-sm">Productivity (생산성)</div>
                <p class="text-caption text-grey-6 q-mb-sm">작업 효율 향상 솔루션</p>
                <ul class="text-body2 text-grey-7">
                  <li>Nexa Break (작업 효율화)</li>
                </ul>
                <div class="q-mt-sm">
                  <q-btn size="sm" color="primary" label="상세보기" class="q-mr-xs" />
                  <q-btn size="sm" outline color="primary" label="문의하기" />
                </div>
              </q-card-section>
            </q-card>

            <q-card class="col" clickable style="min-width: 300px">
              <q-card-section>
                <div class="text-h6 q-mb-sm">Agriculture (농업)</div>
                <p class="text-caption text-grey-6 q-mb-sm">스마트 농업 솔루션</p>
                <ul class="text-body2 text-grey-7">
                  <li>Nexa Farm (스마트팜)</li>
                  <li>Nexa Hive (양봉 관리)</li>
                </ul>
                <div class="q-mt-sm">
                  <q-btn size="sm" color="primary" label="상세보기" class="q-mr-xs" />
                  <q-btn size="sm" outline color="primary" label="문의하기" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>

        <!-- Media & Interaction -->
        <q-tab-panel name="media">
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-sm">
              <q-icon name="videocam" size="24px" class="q-mr-sm" />
              Media & Interaction
            </div>
            <p class="text-body2 text-grey-7">오디오 시스템, 비주얼 시스템, 시각화 및 조명 제품</p>
          </div>
          <div class="row q-gutter-md no-wrap">
            <q-card class="col" clickable style="min-width: 300px">
              <q-card-section>
                <div class="text-h6 q-mb-sm">Audio Systems (오디오 시스템)</div>
                <p class="text-caption text-grey-6 q-mb-sm">음향 시스템 제품</p>
                <ul class="text-body2 text-grey-7">
                  <li>Nexa Audio (음향 시스템)</li>
                  <li>Nexa Voice (보이스컨트롤, 피드백)</li>
                </ul>
                <div class="q-mt-sm">
                  <q-btn size="sm" color="primary" label="상세보기" class="q-mr-xs" />
                  <q-btn size="sm" outline color="primary" label="문의하기" />
                </div>
              </q-card-section>
            </q-card>

            <q-card class="col" clickable style="min-width: 300px">
              <q-card-section>
                <div class="text-h6 q-mb-sm">Visual Systems (비주얼 시스템)</div>
                <p class="text-caption text-grey-6 q-mb-sm">시각화 및 조명 시스템</p>
                <ul class="text-body2 text-grey-7">
                  <li>Nexa Visual (데이터 시각화, 환경상태)</li>
                  <li>Nexa Lighting (조명)</li>
                  <li>Nexa Facade (파사드)</li>
                </ul>
                <div class="q-mt-sm">
                  <q-btn size="sm" color="primary" label="상세보기" class="q-mr-xs" />
                  <q-btn size="sm" outline color="primary" label="문의하기" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>

        <!-- Media Art -->
        <q-tab-panel name="art">
          <div class="q-mb-lg">
            <div class="text-h6 q-mb-sm">
              <q-icon name="palette" size="24px" class="q-mr-sm" />
              Media Art
            </div>
            <p class="text-body2 text-grey-7">환경 미술, 공공미술, 상호작용 미디어 아트 작품</p>
          </div>
          <div class="row q-gutter-md no-wrap">
            <q-card class="col" clickable style="min-width: 300px">
              <q-card-section>
                <div class="text-h6 q-mb-sm">Nexa Nature Art</div>
                <p class="text-body2 text-grey-7 q-mb-sm">환경 미술 작품</p>
                <p class="text-caption text-grey-6">자연과 조화로운 미디어 아트</p>
                <div class="q-mt-sm">
                  <q-btn size="sm" color="primary" label="상세보기" class="q-mr-xs" />
                  <q-btn size="sm" outline color="primary" label="문의하기" />
                </div>
              </q-card-section>
            </q-card>

            <q-card class="col" clickable style="min-width: 300px">
              <q-card-section>
                <div class="text-h6 q-mb-sm">Nexa Urban Art</div>
                <p class="text-body2 text-grey-7 q-mb-sm">공공미술 작품</p>
                <p class="text-caption text-grey-6">도시 환경과 상호작용하는 미디어 아트</p>
                <div class="q-mt-sm">
                  <q-btn size="sm" color="primary" label="상세보기" class="q-mr-xs" />
                  <q-btn size="sm" outline color="primary" label="문의하기" />
                </div>
              </q-card-section>
            </q-card>

            <q-card class="col" clickable style="min-width: 300px">
              <q-card-section>
                <div class="text-h6 q-mb-sm">Nexa Flow Art</div>
                <p class="text-body2 text-grey-7 q-mb-sm">상호작용 미디어 아트</p>
                <p class="text-caption text-grey-6">관객과 실시간 상호작용하는 작품</p>
                <div class="q-mt-sm">
                  <q-btn size="sm" color="primary" label="상세보기" class="q-mr-xs" />
                  <q-btn size="sm" outline color="primary" label="문의하기" />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-tab-panel>
      </q-tab-panels>

      <!-- Portfolio 특별 기능 섹션 -->
      <div class="q-mt-xl">
        <div class="text-h6 q-mb-md">
          <q-icon name="star" size="24px" class="q-mr-sm" />
          Portfolio 특별 기능
        </div>

        <div class="row q-gutter-md">
          <q-card class="col-12 col-md-6 col-lg-3" clickable>
            <q-card-section>
              <q-icon name="photo_library" size="32px" color="primary" class="q-mb-sm" />
              <div class="text-subtitle1 q-mb-sm">제품 갤러리</div>
              <p class="text-caption text-grey-6">제품 이미지, 제작 과정, 상세 스펙을 갤러리 형태로 확인할 수 있습니다.</p>
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-6 col-lg-3" clickable>
            <q-card-section>
              <q-icon name="history" size="32px" color="primary" class="q-mb-sm" />
              <div class="text-subtitle1 q-mb-sm">제작 스토리</div>
              <p class="text-caption text-grey-6">각 제품의 제작 배경, 과정, 기술적 특징을 스토리 형태로 소개합니다.</p>
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-6 col-lg-3" clickable>
            <q-card-section>
              <q-icon name="rate_review" size="32px" color="primary" class="q-mb-sm" />
              <div class="text-subtitle1 q-mb-sm">제작 사례</div>
              <p class="text-caption text-grey-6">실제 주문 제작 사례와 고객 후기를 확인할 수 있습니다.</p>
            </q-card-section>
          </q-card>

          <q-card class="col-12 col-md-6 col-lg-3" clickable>
            <q-card-section>
              <q-icon name="compare" size="32px" color="primary" class="q-mb-sm" />
              <div class="text-subtitle1 q-mb-sm">제품 비교</div>
              <p class="text-caption text-grey-6">여러 제품을 선택하여 스펙과 특징을 비교할 수 있습니다.</p>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const activeTab = ref('industrial')
const searchQuery = ref('')
const selectedCategory = ref(null)

const categoryOptions = ['Industrial Systems', 'Living Solutions', 'Media & Interaction', 'Media Art']
</script>

<style lang="scss" scoped>
.portfolio-page {
  background: var(--nexa-background);
  min-height: 100vh;
}

.page-header {
  border-bottom: 1px solid var(--nexa-border-color);
  padding-bottom: 16px;
}

// 탭 패널 배경 제거 및 보더 추가
:deep(.q-tab-panels) {
  background: transparent;
}

:deep(.q-tab-panel) {
  background: transparent;

  padding: 0px;
}
</style>
