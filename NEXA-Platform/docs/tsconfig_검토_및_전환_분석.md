# tsconfig.json 검토 및 TypeScript 전환 분석

> 확장자 .js → .ts 전환 전, 현재 설정 검토 및 유연한 전환 전략 분석

---

## 1. 현재 tsconfig.json 구조

```json
{
  "extends": "./.quasar/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] },
    "esModuleInterop": true,
    "moduleResolution": "node"
  },
  "ts-node": { "esm": true, "experimentalSpecifierResolution": "node" },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue", "src/tests/.spec.ts"],
  "exclude": ["node_modules", "dist", ".quasar"]
}
```

---

## 2. 현재 설정 분석

### 2.1 include 범위

| 포함 | 미포함 |
|------|--------|
| `src/**/*.ts` | `src/**/*.js` |
| `src/**/*.tsx` | `server/**` |
| `src/**/*.vue` | — |

**→ .js 파일은 tsconfig 타입 체크 대상이 아님.**  
현재는 .ts만 체크되고, .js는 jsconfig + Vite가 처리.

### 2.2 paths 경로

| tsconfig | jsconfig | quasar.config (Vite) |
|----------|----------|----------------------|
| `@/*` → `src/*` | `@frame/*`, `@engines/*`, `@system/*`, `@domains/*` 등 | 동일 |

**→ tsconfig는 `@/*`만 정의.**  
실제 코드는 `@system/`, `@frame/`, `@engines/` 등 사용.  
빌드는 Vite alias로 해결되지만, **tsconfig 기준으로는 `@system` 등이 인식되지 않음.**

### 2.3 extends: .quasar/tsconfig.json

- Quasar가 생성하는 기본 설정
- `strict`, `noImplicitAny` 등 상세 옵션은 상속 파일에 의존
- 직접 확인 불가 시, `strict` 여부는 알 수 없음

### 2.4 server 폴더

- `server/`는 tsconfig include에 없음
- Node.js로 직접 실행 (`node server.js`)
- 별도 tsconfig 없음 → **서버는 TypeScript 미사용**

---

## 3. 확장자만 바꾸면? (현재 설정 유지)

| 항목 | 예상 결과 |
|------|-----------|
| `file.js` → `file.ts` | include에 포함됨 → 타입 체크 시작 |
| `.quasar`의 strict 설정 | strict: true면 `any`, `null` 등 에러 다수 |
| `@system` 등 import | tsconfig paths에 없어 경로 해석 실패 가능 |
| server | 여전히 tsconfig 밖 → 별도 전환 필요 |

**결론: 현재 설정 유지한 채로 확장자만 바꾸면 에러가 많이 나올 가능성이 큼.**

---

## 4. 유연한 전환을 위한 설정 (권장)

### 4.1 단계별 적용

| 단계 | 설정 | 목적 |
|------|------|------|
| 1 | `allowJs: true` | .js와 .ts 혼용 가능 |
| 2 | `strict: false` 또는 `noImplicitAny: false` | 초기 에러 최소화 |
| 3 | paths에 `@system`, `@frame`, `@engines` 등 추가 | 기존 import 경로 인식 |
| 4 | `include`에 `src/**/*.js` 추가 | .js도 타입 체크 대상 (선택) |

### 4.2 extends와의 충돌

- `extends`로 상속하면 `strict: true` 등이 오버라이드될 수 있음
- `.quasar/tsconfig.json` 내용을 확인할 수 없으면, **`compilerOptions`에서 명시적으로 `strict: false` 등 재정의**하는 것이 안전함

### 4.3 server 전환

- server 전용 `server/tsconfig.json` 생성
- 또는 루트 tsconfig에 `include`에 `server/**/*` 추가
- Node.js 실행 시 `tsx` 또는 `ts-node` 사용 필요

---

## 5. 권장 전환 순서

1. **tsconfig 확장**  
   - `allowJs: true`  
   - `strict: false` (또는 `noImplicitAny: false`)  
   - paths에 `@frame`, `@system`, `@engines`, `@domains` 등 추가  

2. **확장자 변경**  
   - 한 파일씩 `.js` → `.ts`  
   - 나오는 에러를 하나씩 해결  

3. **점진적 강화**  
   - `noImplicitAny: true`  
   - `strict: true`  
   - `strictNullChecks` 등 단계적 적용  

4. **server 전환**  
   - 별도 전략 수립 후 `server/tsconfig.json` 생성 및 적용  

---

## 6. 요약

| 질문 | 답변 |
|------|------|
| 현재 설정으로 확장자만 바꿔도 될까? | **아니오.** paths 부족, strict 여부 불명, server 미포함 등으로 에러가 많을 가능성 |
| 유연하게 한 뒤 바꾸는 게 나을까? | **예.** `allowJs`, `strict: false`, paths 보완 후 전환하는 게 안전 |
| server는? | 별도 tsconfig 또는 전환 전략 필요 |
