<!-- FileStructureAnalyzerContent.vue
  파일 구조 분석기 메인 컨텐츠 컴포넌트
  프로젝트 파일 구조 시각화 및 코드 검색 통합
-->
<template>
  <div class="file-structure-analyzer-content">
    <div class="coming-soon-wrapper">
      <div class="coming-soon-content">
        <q-icon name="view_module" size="80px" color="grey-7" class="q-mb-md" />
        <h2 class="coming-soon-title">File Structure Analyzer</h2>
        <p class="coming-soon-description">파일 구조 분석 기능은 곧 출시될 예정입니다.</p>
        <div class="coming-soon-features q-mt-lg">
          <h3 class="features-title">예정된 기능</h3>
          <ul class="features-list">
            <li><strong>파일 구조 시각화:</strong> 프로젝트 파일 구조 트리 뷰</li>
            <li><strong>파일 크기 분석:</strong> 폴더별/파일별 크기 통계</li>
            <li><strong>폴더별 통계:</strong> 파일 개수, 라인 수, 용량 분석</li>
            <li><strong>코드 검색 (통합):</strong> 프로젝트 전체 코드 검색</li>
            <li><strong>정규식 검색:</strong> 고급 검색 패턴 지원</li>
            <li><strong>파일/함수/변수 검색:</strong> 심볼 기반 검색</li>
            <li><strong>검색 결과 하이라이트:</strong> 검색된 코드 위치 표시</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// FileStructureAnalyzerContent.vue - 파일 구조 분석기 (코드 검색 통합)
</script>

<style lang="scss" scoped>
.file-structure-analyzer-content {
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
  max-width: 600px;
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

    strong {
      color: var(--nexa-text-primary);
    }
  }
}
</style>
