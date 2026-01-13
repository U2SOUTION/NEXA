<template>
  <div class="archive-view">
    <header class="page-header">
      <div class="title">CONNECTOR</div>
      <div class="subtitle">외부 데이터·기기 연동/매핑</div>
    </header>

    <section class="section-card">
      <div class="section-title">커넥터</div>
      <div class="section-desc">외부 소스, IoT 장치와 연결하고 매핑·로그를 관리합니다.</div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.archive-view {
  padding: 16px;
  color: var(--nexa-text-primary);
  background: var(--nexa-background);
  min-height: 100%;
  box-sizing: border-box;
}

.page-header {
  margin-bottom: 16px;
  .title {
    font-size: 18px;
    font-weight: 700;
  }
  .subtitle {
    margin-top: 4px;
    font-size: 12px;
    color: var(--nexa-text-secondary);
  }
}

.section-card {
  border: 1px solid var(--nexa-border-color);
  border-radius: 8px;
  padding: 12px 14px;
  background: var(--nexa-surface);
  .section-title {
    font-size: 16px;
    font-weight: 600;
  }
  .section-desc {
    margin-top: 6px;
    font-size: 13px;
    color: var(--nexa-text-secondary);
    line-height: 1.4;
  }
}
</style>
