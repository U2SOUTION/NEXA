# 💡 NEXA Platform Router Layer

이 폴더는 NEXA 플랫폼의 라우팅 시스템을 관리하는 핵심 레이어입니다.

## 🏗️ 아키텍처 결정 사항 (Architectural Decision)

NEXA 플랫폼은 `src/` 루트 디렉토리의 복잡도를 낮추고 레이어 구조를 명확히 하기 위해, Quasar 표준 경로인 `src/router` 대신 **`src/frame/router`**를 라우팅 진입점(Entry Point)으로 사용합니다.

### 구현 방식 (Implementation)

이 아키텍처는 `quasar.config.js`의 두 가지 설정을 통해 구현되었습니다.

#### 1. Quasar 공식 진입점 설정 (가장 중요)

Quasar 엔진이 빌드 시점에 라우터 파일을 찾을 수 있도록 최상위 `sourceFiles` 속성에 경로를 지정했습니다.

```javascript
// quasar.config.js (최상위 속성)
sourceFiles: {
  router: 'src/frame/router/index',
},
```

#### 2. Vite 별칭(Alias) 리다이렉션

Quasar 내부 코드나 써드파티 라이브러리가 `src/router` 또는 `app/src/router`와 같은 고정 경로를 참조할 경우를 대비하여 Vite 별칭 설정을 추가했습니다.

```javascript
// quasar.config.js -> extendViteConf
viteConf.resolve.alias = {
  ...viteConf.resolve.alias,
  'src/router': path.resolve(__dirname, './src/frame/router'),
  'app/src/router': path.resolve(__dirname, './src/frame/router'),
  'app/src/router/index': path.resolve(__dirname, './src/frame/router/index.js'),
}
```

## 📁 파일 구조

- `index.js`: 라우터 인스턴스 생성 및 초기화 (Quasar 공식 입구)
- `routes.js`: 실제 라우트 경로 정의 및 도메인별 라우트 통합
- `README.md`: 아키텍처 결정 및 설정 가이드 (본 파일)
