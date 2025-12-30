<!-- DependencyAnalyzerContent.vue
  의존성 분석기 메인 컨텐츠 컴포넌트
  외부 패키지 및 내부 모듈 의존성 분석
-->
<template>
  <div class="dependency-analyzer-content">
    <div class="coming-soon-wrapper">
      <div class="coming-soon-content">
        <q-icon name="account_tree" size="80px" color="grey-7" class="q-mb-md" />
        <h2 class="coming-soon-title">Dependency Analyzer</h2>
        <p class="coming-soon-description">의존성 분석 기능은 곧 출시될 예정입니다.</p>
        <div class="coming-soon-features q-mt-lg">
          <h3 class="features-title">예정된 기능</h3>
          <ul class="features-list">
            <li>package.json 분석 (설치된 패키지 목록)</li>
            <li>실제 코드 스캔 (import 문 분석)</li>
            <li>사용되지 않는 의존성 탐지</li>
            <li>의존성 그래프 시각화</li>
            <li>통계 및 리포트</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// DependencyAnalyzerContent.vue - 의존성 분석기
</script>

<style lang="scss" scoped>
.dependency-analyzer-content {
  height: 100%;
}

.coming-soon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.coming-soon-content {
  text-align: center;
  padding: 2rem;
}

.coming-soon-title {
  color: var(--nexa-text-primary);
  font-size: 2rem;
  font-weight: 600;
  margin: 1rem 0;
}

.coming-soon-description {
  color: var(--nexa-text-secondary);
  font-size: 1rem;
  margin: 0;
}

.coming-soon-features {
  text-align: left;
  max-width: 500px;
  margin: 0 auto;
}

.features-title {
  color: var(--nexa-text-primary);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.features-list {
  color: var(--nexa-text-secondary);
  list-style-type: disc;
  margin-left: 1.5rem;

  li {
    margin-bottom: 0.5rem;
  }
}
</style>
