<template>
  <div class="u2bee-help-page">
    <div class="help-header q-mb-md">
      <div class="text-h6">도움말</div>
      <div class="text-body2 text-grey-7">U2BEE 사용 방법을 확인합니다</div>
    </div>

    <!-- 도움말 섹션 (목업) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">시작하기</div>
        <div class="text-body2 q-mb-sm">
          U2BEE는 YouTube, TikTok 등 다양한 플랫폼에서 콘텐츠를 수집하고 관리하는 확장 프로그램입니다.
        </div>
        <div class="text-body2 q-mb-sm">
          콘텐츠를 평가하고 카테고리로 분류하여 체계적으로 관리할 수 있습니다.
        </div>
      </q-card-section>
    </q-card>

    <!-- 주요 기능 (목업) -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">주요 기능</div>
        <q-list bordered separator>
          <q-item>
            <q-item-section avatar>
              <q-icon name="star" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>콘텐츠 평가</q-item-label>
              <q-item-label caption>좋아요/싫어요 평가 및 카테고리 분류</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="list" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>콘텐츠 목록</q-item-label>
              <q-item-label caption>저장된 콘텐츠 검색 및 관리</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="playlist_play" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>플레이박스</q-item-label>
              <q-item-label caption>플레이리스트 생성 및 재생 관리</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="history" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>히스토리</q-item-label>
              <q-item-label caption>방문한 콘텐츠 히스토리 확인</q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section avatar>
              <q-icon name="bar_chart" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>통계</q-item-label>
              <q-item-label caption>콘텐츠 및 평가 통계 확인</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>

    <!-- 문의 (목업) -->
    <q-card>
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">문의</div>
        <div class="text-body2">
          문제가 발생하거나 문의사항이 있으시면 개발팀에 연락해주세요.
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
// 도움말 페이지는 단순 정보 표시만
</script>

<style lang="scss" scoped>
.u2bee-help-page {
  padding: 16px;

  .help-header {
    margin-bottom: 16px;
  }
}
</style>
