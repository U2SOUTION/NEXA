<template>
  <!-- Breadcrumb 및 액션 버튼 -->
  <div class="breadcrumb-section">
    <div class="breadcrumb">
      <span class="breadcrumb-item">:: U2BEE</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">도움말</span>
    </div>
    <div class="action-buttons">
      <q-btn flat dense label="문의" size="sm" />
    </div>
  </div>

  <!-- 시작하기 -->
  <div class="list-section">
    <div class="section-label">시작하기</div>
    <div class="help-content">
      <p>U2BEE는 YouTube, TikTok 등 다양한 플랫폼에서 콘텐츠를 수집하고 관리하는 확장 프로그램입니다.</p>
      <p>콘텐츠를 평가하고 카테고리로 분류하여 체계적으로 관리할 수 있습니다.</p>
    </div>
  </div>

  <!-- 주요 기능 -->
  <div class="list-section">
    <div class="section-label">주요 기능</div>
    <q-list>
      <q-item class="help-item">
        <q-item-section avatar>
          <q-icon name="star" class="help-icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="help-item-label">콘텐츠 평가</q-item-label>
          <q-item-label class="help-item-caption">좋아요/싫어요 평가 및 카테고리 분류</q-item-label>
        </q-item-section>
      </q-item>

      <q-item class="help-item">
        <q-item-section avatar>
          <q-icon name="list" class="help-icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="help-item-label">콘텐츠 목록</q-item-label>
          <q-item-label class="help-item-caption">저장된 콘텐츠 검색 및 관리</q-item-label>
        </q-item-section>
      </q-item>

      <q-item class="help-item">
        <q-item-section avatar>
          <q-icon name="playlist_play" class="help-icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="help-item-label">플레이박스</q-item-label>
          <q-item-label class="help-item-caption">플레이리스트 생성 및 재생 관리</q-item-label>
        </q-item-section>
      </q-item>

      <q-item class="help-item">
        <q-item-section avatar>
          <q-icon name="history" class="help-icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="help-item-label">히스토리</q-item-label>
          <q-item-label class="help-item-caption">방문한 콘텐츠 히스토리 확인</q-item-label>
        </q-item-section>
      </q-item>

      <q-item class="help-item">
        <q-item-section avatar>
          <q-icon name="bar_chart" class="help-icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label class="help-item-label">통계</q-item-label>
          <q-item-label class="help-item-caption">콘텐츠 및 평가 통계 확인</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </div>

  <!-- 문의 -->
  <div class="list-section">
    <div class="section-label">문의</div>
    <div class="help-content">
      <p>문제가 발생하거나 문의사항이 있으시면 개발팀에 연락해주세요.</p>
    </div>
  </div>
</template>

<script setup>
// 도움말 페이지는 단순 정보 표시만
</script>

<style lang="scss" scoped>
.breadcrumb-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.breadcrumb-item {
  color: var(--nexa-text-secondary);

  &.active {
    color: var(--nexa-text-primary);
    font-weight: 600;
  }
}

.breadcrumb-separator {
  color: var(--nexa-text-disabled);
}

.action-buttons {
  color: var(--nexa-text-secondary);
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.list-section {
  margin-bottom: 5px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--nexa-border-color); // 임시 확인용

  &:last-child {
    margin-bottom: 0;
  }
}

.section-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--nexa-text-primary);
  padding: 12px 0 8px 0;
  border-bottom: 1px solid var(--nexa-border-color);
  margin-bottom: 8px;
}

.help-content {
  padding: 12px 0;

  p {
    font-size: 14px;
    line-height: 1.6;
    color: var(--nexa-text-primary);
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.help-item {
  padding: 8px 0;
}

.help-icon {
  font-size: 24px;
  color: var(--nexa-button-primary-bg);
}

.help-item-label {
  font-size: 14px;
  color: var(--nexa-text-primary);
}

.help-item-caption {
  font-size: 12px;
  color: var(--nexa-text-secondary);
}
</style>
