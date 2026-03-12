# [NEXA-PLATFORM-TS-01-B] ⭐⭐⭐ TS 최적화 후속·미완료 항목

**파일명**: `[NEXA-PLATFORM-TS-01-B] ⭐⭐⭐ TS_최적화_후속_및_미완료_항목.md` — ⭐⭐⭐ 로 검색·목록에서 찾기 쉽게 표시.

**관련 문서**: [NEXA-PLATFORM-TS-01] 서버·프론트 TS 마이그레이션 및 최적화 전략

**목적**: 1차 TS 최적화는 완료된 상태에서, **“완전히 끝”이 아닐 수 있는 부분**을 별도 문서로 정리한다.  
나중에 요구사항이 생기거나 단계적으로 품질을 올릴 때 이 문서를 기준으로 검토할 수 있도록 한다.

**작성일**: 2025-03

---

## 1. 문서가 필요한 이유

- 전략서([NEXA-PLATFORM-TS-01]) 안에서 “미완료·후속” 내용이 묻혀 찾기 어려울 수 있음.
- 별도 문서로 두면 **검색·북마크·이슈 연결**이 쉬움.
- 각 항목별로 **구체적인 경로·명령·판단 기준**을 적어 두면, 누가 보더라도 후속 작업을 진행하기 쉽다.

---

## 2. engines — strict 대상에서 제외된 영역

### 2.1 현재 상태

| 대상 | 경로 | 조치 |
|------|------|------|
| **charts** | `src/engines/charts/**/*.ts` | 파일 상단 `// @ts-nocheck` + `/* eslint-disable @typescript-eslint/ban-ts-comment */` 적용. strict 검사 대상 아님. |
| **diagram** | `src/engines/diagram/**/*.ts` | 동일. |
| **device 서비스** | `src/system/services/device/*.ts` (VirtualDeviceManager, VirtualNodeAdapter) | 동일. |

- **strict 설정**: `tsconfig.strict.json`의 `include`에는 **engines를 넣지 않음**.  
  frame/domains/system만 strict로 검사하고, engines는 일반 빌드/타입체크에서만 포함된다.
- **의도**: 당장 동작·릴리즈에 지장 없이 1차 최적화를 마무리하고, engines는 **요구사항 발생 시** 엔진 단위로 strict 적용·타입 정리 또는 재작성을 검토하기 위함.

### 2.2 후속 검토 시 고려 사항

- **옵션 A — 기존 코드에 strict 적용**  
  - `@ts-nocheck` 제거 후, D3·dagre 등 라이브러리 타입과 맞춰 인자/반환 타입·제네릭을 보강.  
  - 작업량이 많고, 레거시 구조가 그대로 유지됨.
- **옵션 B — 엔진 재작성**  
  - 요구사항(성능, 기능 변경, 유지보수성)이 있을 때 해당 엔진만 새로 설계·구현하고, 처음부터 strict·타입을 적용.  
  - 코드 깔끔함·일관성 측면에서 유리.
- **권장**: 요구사항이 생긴 **엔진부터** 하나씩 검토.  
  - 예: “차트 라이브러리 교체” 요구 시 → charts 엔진만 strict 포함 또는 재작성 검토.

### 2.3 대상 파일 목록 (참고)

- **charts**: `area/AreaChart.ts`, `bar/BarChart.ts`, `line/LineChart.ts`, `pie/PieChart.ts`, `scatter/ScatterChart.ts`, `config/chartMetadata.ts`, `utils/chartAxes.ts`, `chartBackground.ts`, `chartEvents.ts`, `chartFilters.ts`, `chartScales.ts`, `chartTheme.ts`, `chartTooltip.ts`
- **diagram**: `config/diagramMetadata.ts`, `diagramSettings.ts`, `diagramSettingsConfig.ts`, `erd/ERDDiagram.ts`, `filetree/FileTreeDiagram.ts`, `flow/FlowDiagram.ts`, `network/NetworkDiagram.ts`, `dependency/ForceDirectedDiagram.ts`, `utils/diagramEvents.ts`, `diagramLayout.ts`, `diagramZoom.ts`
- **device**: `VirtualDeviceManager.ts`, `VirtualNodeAdapter.ts`

---

## 3. 점진적 강화 (선택 사항)

### 3.1 no-explicit-any 축소

- **현재**: ESLint에서 `@typescript-eslint/no-explicit-any`를 **warn** 수준으로 사용 중일 수 있음.
- **후속**:  
  - 남은 `any` 사용처를 `unknown` 또는 구체 타입으로 치환.  
  - 어느 정도 정리된 뒤 규칙을 **error**로 올리면, 신규 `any` 유입을 막을 수 있음.
- **참고**: [NEXA-PLATFORM-TS-01] §6.1 unknown vs any 정책.

### 3.2 스키마·타입 정의 보강

- API·JSONB·도메인 경계에서 아직 단언(`as`)만 쓰는 구간이 있다면, Zod 스키마 + `z.infer` 또는 공용 타입으로 점진적으로 교체.
- 서버·프론트·(향후) 엣지에서 **스키마 1회 정의 → 타입 일원화**가 되어 있는지 주기적으로 점검.

### 3.3 Branded ID 확대

- `UserId`, `ProjectId`, `DeviceId` 등은 이미 도입된 경우, 다른 도메인 ID(예: ArchiveId, PartId 등)에도 동일한 패턴을 확대 적용하면 혼용 실수를 줄일 수 있음.
- 정의 위치: `src/system/types/ids.ts` 등, 전략서에서 정한 공용 타입 경로 유지.

---

## 4. CI에 strict 타입체크 포함

### 4.1 목적

- **회귀 방지**: 새 코드가 들어갈 때 strict 타입체크를 통과하지 않으면 빌드/PR이 실패하도록 하면, “나중에 고치자”가 쌓이는 것을 막을 수 있음.

### 4.2 적용 방법 예시

- **프론트 strict**:  
  `vue-tsc --noEmit -p tsconfig.strict.json`  
  또는 `package.json`에 `typecheck:strict` 스크립트를 두고, CI 단계에서 실행.
- **시점**: PR 머지 전, 또는 푸시 시 자동 실행.
- **주의**: 현재 strict 대상은 frame/domains/system만 포함하고 engines는 제외되어 있으므로, CI도 동일한 `tsconfig.strict.json`을 사용하면 된다.

### 4.3 선택 사항

- CI에 넣지 않고 로컬에서만 수동 실행할 수도 있음.  
  다만 “나중에” 회귀가 쌓이지 않으려면 CI 포함을 권장.

---

## 5. tsconfig.strict.json — 유지·제거

### 5.1 현재는 유지해야 함

- **역할**: frame/domains/system만 **strict 옵션**으로 타입 검사하기 위한 전용 설정 파일.
- **사용처**: `vue-tsc --noEmit -p tsconfig.strict.json` 또는 `npm run typecheck:strict` 등.
- **이유**: 메인 `tsconfig.json`(빌드·개발용)은 strict를 쓰지 않거나, 전체 소스가 한 번에 strict를 통과하지 못하는 상태일 수 있음. 그래서 **strict 통과 범위**를 `tsconfig.strict.json`의 `include`로 나누어 두고, 해당 범위만 엄격히 검사하는 구조.
- **정리**: 최적화가 더 진행되기 전까지는 **이 파일을 유지**하고, strict 타입체크 시 이 설정을 사용하면 된다.

### 5.2 나중에 없앨 수 있는 조건

- **전체가 하나의 strict 설정으로 통일**되면 `tsconfig.strict.json`은 제거해도 됨.
- **조건 요약**:
  1. **메인 tsconfig** (앱 빌드·개발에 쓰는 설정)에 `strict: true`, `noImplicitAny: true` 등을 넣었고,
  2. **전체 소스**(engines 포함 여부는 정책에 따라)가 그 메인 설정으로 타입체크를 통과하며,
  3. **strict 전용**으로 다른 include/exclude를 나눌 필요가 없어졌을 때.
- **가능한 시나리오**:
  - engines까지 strict를 적용해, 모든 코드가 한 tsconfig로 strict 통과하는 경우 → 메인 tsconfig만 strict로 쓰고 `tsconfig.strict.json` 삭제.
  - 또는 메인 tsconfig는 비-strict로 두고, CI에서만 strict 검사가 필요하다면 그때까지는 `tsconfig.strict.json`을 계속 사용.
- **정리**: “최적화가 끝나서 **전체를 한 설정으로 strict 통과**시키기로 한 뒤”에는 strict 전용 파일을 없애고, **메인 설정 하나만** 쓸 수 있다.

---

## 6. 요약 표 — 언제 무엇을 볼지

| 항목 | 언제 검토하면 좋은지 | 참고 위치 |
|------|----------------------|-----------|
| **engines strict 포함** | 해당 엔진 기능 변경·재작성·버그 수정 시 | 본문 §2 |
| **any 축소** | 코드 리뷰·리팩터 시점, 또는 린트 규칙을 error로 올리기 전 | 본문 §3.1 |
| **스키마·타입 보강** | API/도메인 스키마 변경 시, 또는 타입 불일치 이슈 발생 시 | 본문 §3.2 |
| **Branded ID 확대** | 새 도메인/엔티티 ID 도입 시 | 본문 §3.3 |
| **strict CI** | CI/빌드 파이프라인 정비 시 | 본문 §4 |
| **tsconfig.strict.json 제거** | 전체를 한 strict 설정으로 통일할 때 | 본문 §5 |

---

## 7. 관련 문서

| 문서 | 설명 |
|------|------|
| **[NEXA-PLATFORM-TS-01]** | 서버·프론트 TS 마이그레이션 및 최적화 전략 (본문). §9.3 strict 포함 현황, §10 추가·후속 검토 요약. |
| **[NEXA-PLATFORM-TS-01-B]** | 본 문서 (파일명에 ⭐⭐⭐ 포함). “완전히 끝이 아닐 수 있는 부분” 상세. |

이 문서는 **검색 키워드**로 찾기 쉽게 제목·파일명에 “TS”, “후속”, “미완료”, “⭐⭐⭐”를 넣어 두었고,  
필요 시 이슈/태스크에서 “[NEXA-PLATFORM-TS-01-B] §2”처럼 섹션을 지정해 참조하면 된다.
