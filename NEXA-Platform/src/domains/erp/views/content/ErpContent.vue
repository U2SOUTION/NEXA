<template>
  <div class="erp-dashboard q-pa-lg">
    <div class="page-header q-mb-lg">
      <h1 class="text-h5 text-primary q-mb-xs">ERP Dashboard</h1>
      <p class="text-body2 text-grey-6">전사적 자원 관리 요약 샘플 페이지</p>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="card">
          <q-card-section class="card-header">
            <div class="row items-center no-wrap">
              <q-icon name="folder" size="20px" class="q-mr-sm text-primary" />
              <div class="text-subtitle2">프로젝트</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="card-body">
            <div class="stat-number">12</div>
            <div class="stat-label">진행 중</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="card">
          <q-card-section class="card-header">
            <div class="row items-center no-wrap">
              <q-icon name="account_balance" size="20px" class="q-mr-sm text-primary" />
              <div class="text-subtitle2">재무</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="card-body">
            <div class="stat-number">2.4B</div>
            <div class="stat-label">예산 (KRW)</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="card">
          <q-card-section class="card-header">
            <div class="row items-center no-wrap">
              <q-icon name="people" size="20px" class="q-mr-sm text-primary" />
              <div class="text-subtitle2">인사</div>
            </div>
          </q-card-section>
          <q-separator />
          <q-card-section class="card-body">
            <div class="stat-number">87</div>
            <div class="stat-label">전체 인원</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.erp-dashboard {
  max-width: 1200px;
  margin: 0 auto;

  .card {
    background: var(--nexa-surface);
  }

  .card-header {
    padding: 12px 16px;
  }

  .card-body {
    padding: 16px;
    text-align: center;

    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: var(--nexa-primary);
      margin-bottom: 4px;
    }

    .stat-label {
      font-size: 12px;
      color: var(--nexa-text-secondary);
    }
  }
}
</style>
