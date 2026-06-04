# NEXA 플랫폼 · 메타 OS · NEXIA · 도메인 — 정체성 SSOT

**한 줄:** **NEXA 플랫폼**은 세상에 배포·운영되는 **제품**이고, **엣지·메타 OS**는 그 제품을 **만들고 유지**하는 **메타 레이어**이며, **NEXIA**는 플랫폼의 **핵심 지능 도메인 하나**(`domainKey: nexia`)로 다른 도메인·모드와 **연결되어** 동작한다.

- **역할:** **Normative (용어·경계)** — “NEXIA 플랫폼” 등 **혼동 금지** 표현의 단일 기준
- **도메인 목록:** [`NEXA OS — 도메인 구조`](./NEXA%20OS/_NEXA-OS-V2.1-도메인-레지스트리-명세.md)
- **NEXIA 규정:** [`00 NEXIA 구조`](./Nexia/00%20인공지능%20NEXIA%20구조와%20기술%20스택과%20운영방침.md)
- **메타 빌드:** [`M.O.S.E.S.`](./NEXA%20OS/M.O.S.E.S.%20(Meta-Operating%20System%20for%20Edge%20%26%20Swarm).md)

---

## 1. 세 층 — 절대 혼동 금지

| 층 | 정식 명칭 | 무엇인가 | 배포·사용자 |
|----|-----------|----------|-------------|
| **A** | **엣지·메타 OS** (Meta-Build) | **시스템을 만들기 위한 시스템** — Rivet·Ollama·OpenClaw·ESP32 OTA 등으로 NEXA 플랫폼 **구축·패치·엣지 연동·유지보수** | 운영자·빌드 파이프라인·개발 메타 인프라. **최종 사용자 제품 아님** |
| **B** | **NEXA 플랫폼** (Product / Runtime) | 실제 세상에 **배포되어 서비스**되는 통합 제품 — `frame/` · `domains/` · `engines/` · NEXA OS 거버넌스(Grade·Ingress·감사) 적용 | **고객·현장·운영 사용자** |
| **C** | **NEXIA** (Domain) | NEXA 플랫폼 **내부의 하나의 도메인 영역** — `domainKey: nexia` · 7탭 `tabId` · Omnix 허브. 플랫폼 **핵심 지능**이지만 **플랫폼 전체가 아님** | NEXA 플랫폼 UI에서 **도메인 전환**으로 진입하는 영역 중 하나 |

```text
[ A: 엣지·메타 OS ]  ── 구축 · CI · OTA · 스키마 생성 · 유지보수 ──▶  [ B: NEXA 플랫폼 ]
                                                                          │
                    ┌─────────────────────────────────────────────────────┤
                    │                                                     │
              [ C: nexia 도메인 ] ◀── 연결·오케스트레이션 ──▶  [ 기타 도메인들 ]
              (핵심 지능·7탭)              Omnix·Grade·공통 frame              home · robot · knowledge · …
```

### 1.1 금지·권장 표현

| 금지 (혼동) | 권장 |
|-------------|------|
| “NEXIA 플랫폼” (제품 전체를 가리킬 때) | **NEXA 플랫폼** |
| “NEXIA = 배포되는 서비스 전체” | **NEXA 플랫폼**이 배포 주체 · **NEXIA**는 그 안의 **도메인** |
| “메타 OS = 사용자가 쓰는 앱” | **엣지·메타 OS** = NEXA 플랫폼을 **만들고 고치는** 층 |
| “도메인 = NEXIA와 별개 제품” | 도메인은 **NEXA 플랫폼을 구성**하며, 업무·지능 흐름은 **NEXIA와 연결**되어 작동 (§3) |

---

## 2. NEXA 플랫폼 (Product)

- **정의:** Header 전역 메뉴·`domainRegistry`·백엔드·엣지 게이트웨이·감사까지 포함한 **단일 배포 단위**.
- **구성:** [`src/domains/`](./NEXA%20OS/_NEXA-OS-V2.1-도메인-레지스트리-명세.md) 아래 **다수 도메인** + 공통 `frame/` · `system/` · `engines/`.
- **운영 규칙 (미션 크리티컬):** NEXA OS V2.1 — Grade×Ingress · Zod SSOT · 수직 계층 보안 — [`수직 계층 보안`](./NEXA%20OS/_NEXA-OS-V2.1-수직-계층-보안-아키텍처.md) · [`설계 표준 보강본`](./NEXA%20OS/_NEXA-OS-V2.1-설계-표준-및-미션크리티컬-전략-보강본.md).

---

## 3. NEXIA 도메인과 다른 도메인·모드

### 3.1 NEXIA의 위치

| 항목 | 내용 |
|------|------|
| **레지스트리** | `domainKey: nexia` · 폴더 `domains/nexia/` |
| **역할** | 플랫폼 **핵심 지능 조종** — 7탭(`Omnix` … `Navex`) · 승인·Normex·협업·IoT 연동 **허브** |
| **범위** | 본 도메인 문서군(`docs/Nexia/`)은 **nexia 도메인** Normative. **NEXA 플랫폼 전체** SSOT는 본 문서 + OS·도메인 레지스트리 |

### 3.2 다른 도메인·모드

- **도메인:** `home` · `robot` · `knowledge` · `nexage` · `u2bee` · … — 각각 **제품·업무 영역** (`domainKey` 하나 = 메뉴 하나).
- **연결:** 각 도메인의 실행·AI·IoT·자산 요청은 **NEXIA(Omnix → Normex → 탭)** 경로·Grade·Envelope·CSIM 규약으로 **조율·승인·감사**된다. 도메인 UI는 독립하나 **지능·고위험 명령 SSOT는 NEXIA 측**과 맞물린다.
- **모드:** 도메인 내부·전역의 운영 모드(예: Mission-Safe UI MAE, 드로어 정책, `themePreset`)는 **해당 `domainKey` 레지스트리** + 필요 시 **NEXIA 탭·Grade**와 연동.

```text
사용자: 전역 메뉴에서 도메인 선택 (예: robot)
              │
              ▼
        robot 도메인 UI·업무 로직
              │
              │  고위험·AI·규범·IoT 실행 payload
              ▼
        NEXIA (nexia) — Omnix · Normex · tabId · Grade
              │
              ▼
        NEXA OS 명령·감사·edge-queue (플랫폼 전역)
```

---

## 4. 엣지·메타 OS (Meta-Build)

- **정의:** NEXA 플랫폼 **이전·이후** 생명주기 — 설계 JSON(Rivet) → 로컬 추론(Ollama) → 배포 에이전트(OpenClaw) → ESP32 OTA 등.
- **대표 문서:** [`M.O.S.E.S.`](./NEXA%20OS/M.O.S.E.S.%20(Meta-Operating%20System%20for%20Edge%20%26%20Swarm).md)
- **분리 원칙:** 제품 런타임(웹·API·사용자 세션)이 **펌웨어·터미널·OTA를 직접 소유하지 않음** — 메타 레이어가 전담하고, 플랫폼은 **웹훅·명령·Grade**로만 지시.

---

## 5. 문서·코드 작성 시 체크리스트

1. 제품·배포·고객 관점 → **NEXA 플랫폼**
2. 빌드·유지보수·코드 생성·OTA → **엣지·메타 OS** (M.O.S.E.S. 등)
3. 7탭·Omnix·`.nx*`·Nexia `docs/` → **NEXIA (도메인 `nexia`)**
4. 메뉴·폴더·`domainRegistry` 항목 → **도메인** (`domainKey`)
5. “NEXIA 플랫폼” 문구 발견 시 → 본 SSOT에 따라 **NEXA 플랫폼** 또는 **NEXIA 도메인**으로 수정

---

## 6. 관련 SSOT 맵

| 주제 | 문서 |
|------|------|
| 도메인 키·슬롯 | [`_NEXA-OS-V2.1-도메인-레지스트리-명세.md`](./NEXA%20OS/_NEXA-OS-V2.1-도메인-레지스트리-명세.md) |
| NEXIA 7탭·운영 | [`00 … NEXIA 구조`](./Nexia/00%20인공지능%20NEXIA%20구조와%20기술%20스택과%20운영방침.md) |
| 보안·Grade (플랫폼 + NEXIA) | [`01 보안`](./Nexia/01%20보안%20및%20권한%20관리%20체계%20(Security%20%26%20Governance).md) · OS V2.1 보강본 |
| 구현 로드맵 | [`_NEXA GUIDE …`](./_NEXA%20GUIDE%20플랫폼%20구현%20단계%20및%20로드맵.md) |
