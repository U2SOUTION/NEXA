# NEXA Platform

스마트 IoT 플랫폼 - ESP32 기반 디바이스 관리 및 시각화 시스템

## 📚 문서

- **[아키텍처 문서](./docs/ARCHITECTURE.md)**: 전체 시스템 구조 및 설계 문서
- **[부품 관리 시스템](./docs/PARTS_MANAGEMENT.md)**: 부품 관리 모듈 상세 설계 문서
- **[기술 스택](./docs/TECH_STACK.md)**: 사용 중인 라이브러리 및 기술 스택
- **[개발 가이드라인](./docs/development-guidelines.md)**: 개발 컨벤션 및 가이드라인 (localStorage 네이밍 등)
- **[뷰 모드 구현 계획](./docs/view-mode-implementation-plan.md)**: 뷰 모드 기능 구현 및 적용 작업 순서

> 📖 더 많은 문서는 [`docs/`](./docs/) 디렉토리를 참고하세요.

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).

## 기술 스택

- **Vue 3** (v3.4.18) - 프레임워크
- **Quasar** (v2.16.0) - UI 프레임워크
- **Pinia** (v3.0.2) - 상태 관리
- **Vue Router** (v4.0.0) - 라우팅
- **vue3-grid-layout-next** (v1.0.7) - 그리드 레이아웃

> 📦 상세한 라이브러리 정보는 [기술 스택 문서](./docs/TECH_STACK.md)를 참고하세요.
