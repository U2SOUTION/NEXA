# [NEXA-PLATFORM-TS-02] 서버에서 @system/* 경로가 안 쓰이는 이유와 해결

## 왜 `@system/schemas/devices` 대신 상대 경로를 쓰나?

### 1. 프로젝트가 둘로 나뉘어 있음

- **루트 tsconfig** (`NEXA-Platform/tsconfig.json`): `include`에 **`src/**`만** 있음.  
  → 프론트/Quasar용. **`server/`는 포함되지 않음.**
- **서버 tsconfig** (`server/tsconfig.json`): `include`에 **`server/**` + `../src/system/schemas/**`, `../src/system/types/**`** 가 있음.  
  → 서버 전용. `paths`에 `"@system/*": ["../src/system/*"]` 있음.

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
- **그래서 당장은** 경로 해석이 **항상 같은 방식으로 되도록** `@system/*` 대신 **상대 경로**(`../../../src/system/schemas/...`)를 쓰고 있습니다.

---

## 해결 방법

### 방법 A: IDE가 서버 tsconfig를 쓰게 하기 (권장)

1. **서버 tsconfig 유지**
   - `server/tsconfig.json`에  
     `"paths": { "@system/*": ["../src/system/*"] }`,  
     `"include"`에 `"../src/system/schemas/**/*.ts"`, `"../src/system/types/**/*.ts"` 유지.
   - `rootDir`을 `".."`로 두어, `../src`가 같은 프로젝트에 묶이게 함 (이미 그렇게 되어 있으면 유지).

2. **IDE 설정**
   - VSCode/Cursor에서:
     - **TypeScript: Select TypeScript Version** → 워크스페이스/사용 중인 TS 버전 확인.
     - 서버 파일만 열고 **“이 파일에 적용된 tsconfig”**가 `server/tsconfig.json`인지 확인.
   - 서버 폴더를 **별도 루트로 열어서** 작업하는 방법도 있습니다.  
     (예: `File > Open Folder` → `NEXA-Platform/server` 만 열면, 해당 폴더의 tsconfig만 사용됨.)

3. **코드에서 다시 `@system/*` 사용**
   - IDE가 서버 tsconfig를 쓰는 것이 확인되면,  
     `import { ... } from '@system/schemas/devices'` 등으로 되돌리면 됨.

이렇게 되면 **서버에서는 계속 `@system/*`만 쓰고**, 상대 경로는 제거할 수 있습니다.

### 방법 B: 루트 tsconfig에 server 포함 (한 프로젝트로 통일)

- **루트** `tsconfig.json`의 `include`에 `server/**/*.ts`, `server/**/*.js` 를 추가.
- 루트에는 이미 `"@system/*": ["src/system/*"]` 가 있으므로, **루트를 쓰는 한** 서버 파일에서도 `@system/schemas/devices` 등이 `src/system/...`로 해석됨.
- 단점:
  - 서버는 Node/ESM, 프론트는 Quasar/Vite라서 **한 tsconfig로 묶으면 옵션 충돌**이 날 수 있음.
  - `moduleResolution: "NodeNext"`(서버) vs `node`(프론트) 등.

그래서 **방법 A(서버는 서버 tsconfig만 쓰게)** 가 더 안전합니다.

### 방법 C: 상대 경로 유지 (현재 방식)

- **원인**을 알고, **임시로** 상대 경로를 쓰는 전략입니다.
- `devices.controller.ts` 등에서는:
  - `import { ... } from '../../../src/system/schemas/devices.js'`
  - `import { ApiErrorCode } from '../../../src/system/schemas/errors.js'`
- **NodeNext**이므로 확장자 `.js`를 붙임 (실제 소스는 `.ts`, 런타임은 tsx 등이 해석).

**정리**:  
- **원인** = 서버 파일에 대해 `@system/*`가 정의된 **서버 tsconfig가 적용되지 않음**.  
- **해결** = 서버만 열거나, IDE가 서버 tsconfig를 쓰게 해서 **`@system/*` 사용(방법 A)** 하거나,  
  당분간 **상대 경로(방법 C)** 로 두는 것.
