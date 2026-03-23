# [NEXA-PLATFORM-TS-02] 서버에서 @system/* 경로 해석 가이드

## 현재 적용 상태 (방법 A 적용)

- 서버에서는 **`@system/*`** 로 공용 스키마/타입을 import 하며, **상대 경로로 `src/system`을 참조하지 않음**.
- **NodeNext** 사용 시 path 매핑으로 해석할 때 **확장자 `.js`를 반드시 붙임** (아래 참고).
- 서버 내부 모듈은 **`@/`** alias로 통일 (예: `@/config/dbConfig.js`, `@/types/common.js`).

---

## NodeNext에서 @system/* import 시 `.js` 확장자 필수

**요약**: 서버 **소스 파일은 모두 `.ts`** 이다. **import 문 안의 경로만** `.../devices.js` 처럼 **`.js`로 쓴다**.  
(파일을 .ts에서 .js로 바꾼 것이 아니라, ESM 규칙에 맞추기 위한 **경로 표기**이다.)

서버 tsconfig가 `"moduleResolution": "NodeNext"` 일 때, **확장자 없이** `@system/schemas/devices`처럼 쓰면 TypeScript가 해당 경로를 **디렉터리**로만 해석해 `devices.ts` 파일을 찾지 못하고 "모듈을 찾을 수 없습니다"가 난다.

- **해결**: import 경로에 **emit 결과 확장자 `.js`** 를 붙인다.  
  예: `import { ... } from '@system/schemas/devices.js'`  
  (실제 디스크에는 `devices.ts`가 있고, TypeScript가 타입 체크 시 그 `.ts`를 찾아 쓴다. 런타임에는 빌드 결과인 `.js`를 참조하는 셈이다.)

서버에서 `@system` 사용 예:

```ts
import { createDeviceSchema } from '@system/schemas/devices.js'
import { ApiErrorCode } from '@system/schemas/errors.js'
import type { UserId, DeviceId } from '@system/types/ids.js'
```

---

## 왜 `@system/*`가 안 쓰였나? (과거 원인 정리)

### 1. 프로젝트가 둘로 나뉘어 있음

- **루트 tsconfig** (`NEXA-Platform/tsconfig.json`): `include`에 **`src/**`만** 있음.  
  → 프론트/Quasar용. **`server/`는 포함되지 않음.**
- **서버 tsconfig** (`server/tsconfig.json`): `include`에 **`server/**` + `../src/system/schemas/**`, `../src/system/types/**`** 가 있음.  
  → 서버 전용. `paths`에 `"@system/*": ["./../src/system/*"]`, `"@/*": ["./*"]` 있음.

서버 코드는 **서버 tsconfig**로만 보면 `@system/*`가 정상 해석되어야 합니다.

### 2. IDE가 어떤 tsconfig를 쓰는지

- Cursor/VSCode는 **열린 파일을 포함하는 tsconfig**를 골라서 그걸로 타입 체크·경로 해석을 합니다.
- **루트 include에 `server/`가 없으면** 이론상 `server/.../devices.controller.ts`는 **서버 tsconfig**로만 포함되므로, 서버 tsconfig의 `@system/*`가 적용돼야 합니다.
- 그런데도 **`@system/schemas/devices` 모듈을 찾을 수 없다**고 나오는 경우는 보통 다음 때문입니다.
  - IDE가 **루트 tsconfig를 workspace 기본으로** 쓰고, 루트에는 `server/`가 없어서 **서버 파일이 “어느 프로젝트에도 안 묶인” 상태**로 보이거나,
  - 루트를 쓰면서 **경로 해석만 루트 기준**으로 해서, 서버 tsconfig의 `paths`가 전혀 적용되지 않는 경우.

즉, **“서버 쪽 paths가 아니라, 루트/다른 설정으로 해석되고 있어서”** `@system/*`가 안 먹는 상황입니다.

### 3. rootDir 제약

- 서버 tsconfig에서 `@system/*`를 쓰려면 **`../src/system/...`를 include**에 넣어야 합니다.
- 그러면 컴파일 대상에 **서버 밖 디렉터리(`../src`)가 포함**되므로, **`rootDir`을 `".."`로 두는 식의 조정**이 필요합니다.
- 이렇게 해도 **IDE가 서버 tsconfig를 쓰지 않으면** 같은 현상이 나올 수 있습니다.

정리하면:

- **`@system/*`를 못 쓰는 직접적인 이유**:  
  **서버 파일을 타입 체크할 때, `paths`에 `@system/*`가 있는 서버 tsconfig가 아니라, `@system/*`가 없거나 다른 루트(프론트) tsconfig가 쓰이기 때문**입니다.
- 현재는 **방법 A**를 적용해 `@system/*.js` 로 import 하고 있음.

---

## 해결 방법

### 방법 A: IDE가 서버 tsconfig를 쓰게 하기 (권장)

1. **서버 tsconfig**
   - `"paths": { "@system/*": ["./../src/system/*"], "@/*": ["./*"] }`
   - `"include"`에 `"../src/system/schemas/**/*.ts"`, `"../src/system/types/**/*.ts"` 유지.
   - `rootDir: ".."` 등 필요 시 유지.

2. **import 규칙** (아래 3번도 참고). IDE: 서버 파일만 열고 **“이 파일에 적용된 tsconfig”**가 `server/tsconfig.json`인지 확인.
   - 서버 폴더를 **별도 루트로 열어서** 작업하는 방법도 있습니다.  
     (예: `File > Open Folder` → `NEXA-Platform/server` 만 열면, 해당 폴더의 tsconfig만 사용됨.)

2. **import 규칙**: `@system` 사용 시 **반드시 확장자 `.js`** 를 붙인다. 서버 내부는 `@/config/...`, `@/utils/...`, `@/types/...` 등 `@/` 로 통일.

3. **IDE**: 서버 파일에 적용되는 tsconfig가 `server/tsconfig.json`인지 확인. 필요 시 **TypeScript: Restart TS Server** 또는 서버 폴더만 열어서 작업.

이렇게 하면 **서버에서는 `@system/*.js`와 `@/` 만 사용**합니다.

### 방법 B: 루트 tsconfig에 server 포함 (한 프로젝트로 통일)

- **루트** `tsconfig.json`의 `include`에 `server/**/*.ts`, `server/**/*.js` 를 추가.
- 루트에는 이미 `"@system/*": ["src/system/*"]` 가 있으므로, **루트를 쓰는 한** 서버 파일에서도 `@system/schemas/devices` 등이 `src/system/...`로 해석됨.
- 단점:
  - 서버는 Node/ESM, 프론트는 Quasar/Vite라서 **한 tsconfig로 묶으면 옵션 충돌**이 날 수 있음.
  - `moduleResolution: "NodeNext"`(서버) vs `node`(프론트) 등.

그래서 **방법 A(서버는 서버 tsconfig만 쓰게)** 가 더 안전합니다.

### 방법 C: 상대 경로 유지 (과거 임시 방식)

- `import { ... } from '../../../src/system/schemas/devices.js'` 처럼 `src/system`을 상대 경로로 참조.  
  **현재는 사용하지 않고** `@system/*.js` 로 통일함.

**정리**:  
- **원인** = 서버 파일에 대해 `@system/*`가 정의된 서버 tsconfig가 적용되지 않거나, NodeNext에서 **확장자 없이** path 매핑을 쓰면 디렉터리로만 해석되는 문제.  
- **해결** = 서버 tsconfig 유지 + **`@system/*` import 시 `.js` 확장자 필수** + 서버 내부는 `@/` 사용.
