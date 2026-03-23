## **[NEXA-UCL-08] 지능형 자원 합성 및 동적 생태계 확장 프로토콜**

본 문서는 외부 API, 가상 디바이스, 타 프로젝트 자원을 실시간으로 탐색하고 연결하여 NEXA 플랫폼을 **'자가 증식하는 생태계'**로 확장하는 **성장 전략**을 정의한다.

**연계 문서:**
- [NEXA-UCL-07] 예외 처리 및 자가 회복 시나리오 — UCL-08은 UCL-07의 "동적 자원 차출 프로토콜"을 확장·구체화한다.
- [NEXA-UCL-04] 실행 사슬 생명주기·`execution_steps`, [NEXA-UCL-03] 의사결정 매트릭스, [NEXA-DDL-00/01] DB 스키마.
- **공유 전략 관련:** [NEXA-DDL-00] §2.3 공유·재사용, [NEXA-AUTH-01] device_members·project_members, [NEXA-GUIDE] §5 페르소나·스킬 공유, [NEXA-ADMIN-01] §4.6 마켓 확장, [NEXA-CAPABILITY-01] 구독(Subscription).
- **Empathy·활력 관련:** [NEXA 마스터 설계도] §7 Empathy 설계, [넥슈 설계도] §공감(ES)·활력(VI) 지표.

**핵심 원칙:** UCL-07은 **'안전한 생존'**을 보장하고, UCL-08은 이를 토대로 시스템이 **'무한히 확장'**할 수 있는 데이터 구조와 논리 토대를 마련한다. 공유·차용 시에도 **소유자 우선권**과 **대상 시스템 무결성**이 항상 보장된다(§4.4). 이 두 문서가 결합되어 NEXA는 스스로 치유하고 성장하는 살아있는 지능 체계가 된다.

---

### 0. 오케스트레이션 vs. 동적 네트워크 합성 (Distinction)

기존 오케스트레이션이 '정해진 악보를 연주하는 지휘'라면, UCL-08은 **'필요한 악기를 실시간으로 찾아 무대에 올리는 구성'**에 가깝다.

| 구분     | 기존 오케스트레이션 (Orchestration) | 동적 네트워크 합성 (Synthesis)            |
| :------- | :---------------------------------- | :---------------------------------------- |
| **관점** | 연주(Performance) 중심              | 조합(Composition) 중심                    |
| **범위** | 프로젝트 내 정의된 에이전트·스킬    | 외부 API, 가상 디바이스, 타 프로젝트 자원 |
| **역할** | 의도(WILL)를 태스크로 분해·실행     | 가용 자원을 탐색(Discovery)하고 연결      |
| **상태** | FLOW(유동) 상태의 무결성 유지       | VOID(잠재) 상태의 자원을 실체화           |

---

## 1. 자원 합성 4단계 파이프라인

문제 발생 시 또는 성능 최적화가 필요할 때, 시스템은 다음 4단계를 거쳐 자원을 재구성한다. [UCL-07] §문제 발생 시 동적 자원 차출 프로토콜과 동일한 흐름이다. **전제:** 사용자 활력 지수(VI)가 임계값을 넘을 때만 가동하며, VI 이하일 때는 Low-Entropy 모드(§7.5)로 제한된다.

```
[상황 인지] → [자원 탐색] → [시뮬레이션] → [실제 투입]
```

| 단계 | 내용 | 주요 테이블·필드 |
|------|------|------------------|
| **1. 상황 인지** | 에러 감지(ADAPTER_TIMEOUT 등), `how_state=STUCK`, Where(Scope) 레이어 기반 사고 지점 식별 | `execution_chains`, `execution_steps`, `execution_logs` |
| **2. 자원 탐색** | VOID 상태 외부 자원·타 프로젝트 공개 기능을 Fit Score로 검색, Where-Scope 1ms 필터링 | `capability_map`, `project_network_topology`, `capability_proposals`(fit_score) |
| **3. 시뮬레이션** | `is_virtual=true`로 가상 시뮬레이션, 성공 확률·리스크 계산. 외부 자원은 **사전 평정**(§3.5)으로 자원 신뢰도 부여 | `project_simulations`, `execution_steps.is_virtual` |
| **4. 실제 투입** | WILL 승인 후 `is_virtual=false`, 역방향 분해(Reverse Decomposition)로 재구성 | `execution_steps`, `execution_chains` |

---

## 2. 자원 탐색 및 Capability 추상화

새로운 자원을 물리적 개체가 아닌 **기능 자격(Capability ID)** 단위의 아톰으로 인식한다.

### 2.1 자원 탐색(Discovery)

- 시스템은 평소 `VOID`(잠재) 상태로 관리하던 외부 자원이나 타 프로젝트의 공개된 기능을 **Fit Score**(적합성 점수)에 따라 검색한다.
- [NEXA-DDL-00] `capability_proposals.fit_score`(0~100)를 자원 대체 시나리오에도 적용한다.

### 2.2 ID 기반 연결

- 외부 API나 로직을 `nexa.extension.api.*` 또는 `nexa.edge.device.*` 등의 표준 규격으로 변환하여, 사용자가 코딩 없이 레고 블록처럼 연결할 수 있게 한다.
- [NEXA-CAPABILITY-01] Capability ID 계층 구조와 정합한다.

### 2.3 Capability ID를 통한 무한 확장성

NEXA의 핵심 설계인 **Capability ID**는 이 네트워크 형성의 최소 단위인 '아톰(Atom)'이다.

- **자원의 추상화:** 새 외부 API나 실물 디바이스 추가 시, `nexa.extension.api.*` 또는 `nexa.edge.device.*`와 같은 **기능 자격**으로 인식한다.
- **공개 로직의 흡수:** 외부 자원의 공개 로직은 `project_knowledge`에 **nature_tag = 'RULE'**로 저장되어, RAG를 통해 오케스트레이터의 실행 계획에 포함될 수 있다.

---

## 3. 동적 자원 차출 및 대체 프로토콜 (Substitution)

### 3.1 Where-Scope 필터링

- 헥사곤 프로토콜의 **Where(Scope)** 레이어를 기반으로 사고 지점(FIELD) 주변의 가장 가까운 '눈(카메라)'이나 '유휴 처리 장치'를 **1ms 내** 필터링한다.
- [UCL-07] 제안: `project_network_topology`(No.21)에 장치 간 물리적 거리(GPS)·논리적 연결망을 저장하여 기초가 된다.

### 3.2 의미론적 잠금(Meaning Lock)

- 대체 자원을 실제 투입하기 전 `is_virtual = true` 상태로 가상 시뮬레이션을 수행하여 안전성을 검증한다.
- 실제 투입은 사용자 **WILL(승인)** 시에만 `is_virtual = false`로 전환하여 할루시네이션에 의한 물리적 충돌을 차단한다.
- [UCL-04] `execution_steps.target_entity_type`, `is_virtual` 필드 활용.

### 3.3 자원 예약 필드 (execution_steps 확장 제안)

[UCL-07]에서 제안한 `execution_steps` 확장 필드. DDL 확정 시 [NEXA-DDL-01]에 반영한다.

| 필드 | 타입 | 설명 |
|------|------|------|
| `assigned_device_id` | UUID | 실제 수행 장치 ID |
| `backup_device_ids` | JSONB | 주 장치 실패 시 투입 가능한 후보군 및 우선순위 |
| `resource_sharing_policy` | JSONB | 타 프로젝트 장치 차용 시 우선순위·복구 조건 |

### 3.4 capability_map 고도화 (비귀속)

[NEXA-DDL-00] `capability_map`(라우트·API 경로 ↔ Capability ID 매핑) 외에, [UCL-07] 제안대로 **장치의 잠재 역량**을 정의하는 확장을 고려한다.

- 예: `nexa.edge.camera.security` 역량을 가진 디바이스가 `nexa.edge.camera.vision_analysis` 역량으로 **일시 전환 가능**함을 명시.
- DDL 반영 시 `device_capability_map` 또는 `capability_map`의 `resource_type='device'` 확장으로 구현 가능.

### 3.5 외부 자원 검증 로직 및 자원 신뢰도(Resource Confidence)

외부 API나 타 프로젝트 자원을 차출할 때, 해당 자원이 보고하는 성능·Capability 데이터를 **어떻게 믿을 것인가**에 대한 검증 절차이다.

#### 3.5.1 가상 시뮬레이션 기반 사전 평정(Pre-rating)

| 단계 | 내용 |
|------|------|
| **1. 테스트 실행** | 외부 자원을 `is_virtual = true` 상태에서 **3회 이상** 테스트 실행 |
| **2. 오차 계산** | 자원이 주장하는 Capability와 **실제 반환값·지연·성공률**의 오차를 산출 |
| **3. 자원 신뢰도 부여** | 오차에 따라 **Resource Confidence**(0~100)를 부여하여 `project_knowledge` 또는 `capability_proposals`에 저장 |

- **투입 조건:** Resource Confidence가 임계값(예: 70 이상)을 넘는 자원만 실제 투입(`is_virtual = false`) 후보로 허용한다.
- **이점:** 할루시네이션이나 저품질 외부 API가 전체 프로젝트의 안정성을 해치는 것을 **원천 차단**한다.

#### 3.5.2 데이터 반영 제안

| 항목 | 내용 |
|------|------|
| `capability_proposals` 확장 | `resource_confidence`(SMALLINT 0~100), `pre_rating_runs`(테스트 실행 횟수), `last_pre_rating_at` |
| `project_simulations` | 사전 평정 시 `scenario_data`에 테스트 케이스·기대값, `result_data`에 실제 결과·오차 기록 |

---

## 4. 프로젝트 간 자원 공유 및 협력

### 4.0 기존 공유 전략과의 차이 및 보강 방향

NEXA 플랫폼에는 이미 여러 '공유' 관련 전략이 정의되어 있다. UCL-08의 공유는 이들과 **보완 관계**이며, 정합을 위해 아래 비교·보강이 필요하다.

| 구분 | 기존 공유 전략 | UCL-08 공유 | 차이점 | 보강 방향 |
|------|----------------|-------------|--------|-----------|
| **정적 템플릿** | [DDL-00 §2.3] `orchestra_scores`로 페르소나·스킬·대시보드 **템플릿화** → 프로젝트에 **재적용** | — | 사전 정의·선택적 적용 | UCL-08은 **동적 합성**이므로, 템플릿은 '시드'로 활용. 합성된 자원 조합을 나중에 **새 템플릿으로 저장**하는 피드백 루프 추가 |
| **멤버십 기반** | [AUTH-01] `device_members`, `project_members` — 사용자가 **명시적 초대·역할 부여** (owner/editor/viewer) | — | 인가·접근 제어 중심, **사전 합의** | `resource_sharing_policy`는 멤버십이 **없는** 타 프로젝트 장치를 **긴급/최적화 시** 잠시 차용. 멤버십이 있으면 **상시 공유**, 없으면 **동적 차용**으로 이원화 |
| **오픈 마켓** | [GUIDE §5, ADMIN-01 §4.6] 페르소나·스킬·태스크 **템플릿** 무료/유료 배포 | §4.2 동일 | 거래·배포 중심 | 마켓에서 구매한 템플릿을 UCL-08 파이프라인의 **자원 탐색** 후보로 포함. `global_knowledge_base`·`orchestra_scores`와 Fit Score로 연계 |
| **구독(Subscription)** | [Capability ID] "A의 센서 데이터를 **구독**하여 가상 실험" — 실시간 데이터/기능 스트림 | §4.1 지식 구독 | **실시간** 연결 | ECHO·GOVERN 구독과 센서 데이터 구독을 **동일한 구독 프로토콜**로 통합. `ref_sentinel_id`·참조 사슬과 연동 |

**핵심 차이 요약:**
- **기존**: 사전 합의·정적(템플릿 적용, 멤버십 부여, 마켓 구매)
- **UCL-08**: 실시간·동적(문제 발생 시 자동 차출, 구독, 시뮬레이션 후 투입)

**보강 원칙:** 기존 공유는 UCL-08의 **입력 소스**(탐색 후보)가 되고, UCL-08 합성 결과는 기존 공유 체계로 **피드백**(새 템플릿·정책 등록)된다.

### 4.1 지식 구독

- 타 프로젝트에서 검증된 `ECHO`(AI 판단) 자산이나 `GOVERN`(운영 규범)을 실시간으로 '구독'하여 현재 판단의 근거로 삼는다.
- [Capability ID]의 **공유 및 구독(Subscription)** 개념과 동일 프로토콜로 정합. `ref_sentinel_id` 기반 참조 사슬 활용.

### 4.2 오픈 마켓 확장

- 공유된 페르소나, 스킬, 태스크 템플릿을 무료 또는 유료로 배포하는 오픈 마켓으로의 전환 비전을 포함한다.
- [NEXA-DDL-00] `orchestra_scores`, `panel_components`, `global_tags`, `global_knowledge_base` 등과 연동된다.
- **보강:** 마켓 자산을 UCL-08 **자원 탐색** 단계의 후보로 포함. Fit Score로 적합 템플릿 추천.

### 4.3 동적 차용 vs. 상시 공유 구분

| 시나리오 | 데이터 소스 | 예시 |
|----------|-------------|------|
| **상시 공유** | `device_members`, `project_members`에 이미 매핑됨 | "내가 A의 디바이스를 editor로 공유받음" |
| **동적 차용** | `resource_sharing_policy`, 타 프로젝트 **공개** 자원 | "A의 창문 장치가 고장났을 때, 인접 프로젝트 B의 카메라를 잠시 빌려 상황 파악" |

동적 차용 시 `resource_sharing_policy`에 **복구 조건**(원 장치 복귀 시 즉시 반환), **우선순위**(동시 요청 시 처리 순서), **임대 기한**(TTL) 등을 명시한다.

### 4.4 자원 보호 및 소유자 주권(Owner Sovereignty)

공유·차용과 관계없이 **대상 시스템(피공유·피차용 측)이 망가지지 않도록** 보호하고, **우선권은 항상 소유자에게** 있음을 보장하는 전략이다. 이 원칙은 가상·실물 디바이스 모두에 적용된다.

#### 4.4.1 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **대상 무결성** | 공유·차용을 받는 쪽(빌려주는 쪽)의 시스템은 **절대 훼손되지 않는다**. 차용자가 해당 자원을 사용하더라도 원본 장치·데이터·상태의 무결성이 유지되어야 한다. |
| **소유자 우선권** | 우선권은 **항상 해당 자원의 소유자(본 디바이스·본 프로젝트)**에게 있다. 차용·공유는 '허락된 범위' 내에서만 동작한다. |
| **본 디바이스 리소스 우선** | 연결이 유지된 상태에서도 **본 디바이스(가상·실물)**가 해당 리소스를 우선 사용한다. 차용자는 '남는' 용량·대역·처리 여력만 사용한다. |

#### 4.4.2 끊기(Disconnect) 권한

소유자는 언제든 다음을 수행할 수 있다.

| 동작 | 설명 | 적용 시점 |
|------|------|-----------|
| **잠시 끊기(Suspend)** | 공유·차용 연결을 일시 중단한다. 차용자는 해당 자원에 접근할 수 없으며, 원 장치가 자원을 독점 사용한다. | 본인 용무·점검·부하 감소 등 |
| **영구 끊기(Revoke)** | 공유·차용 연결을 해제한다. 차용자의 `device_members`·`resource_sharing_policy` 등에서 해당 매핑이 제거되거나 비활성화된다. | 공유/차용 종료, 보안 이슈, 정책 변경 등 |

- **즉시 반영:** 끊기 요청은 **즉시** 적용된다. 차용 중인 실행 사슬이 있다면 `how_state=STUCK`으로 전이하고, UCL-07 자가 회복 루프(대안 실행·ASK)로 대응한다.
- **사전 알림 권장:** 운영 정책상 소유자가 끊기 전 사용자·시스템에 알림을 보낼 수 있으나, **기술적 차단은 알림 없이도 유효**하다(소유자 주권 우선).

#### 4.4.3 본 디바이스 리소스 우선 사용 (Host-First Policy)

연결이 유지되어 운영되더라도, 리소스(CPU·메모리·대역폭·센서 독점권 등) 할당은 다음 순서를 따른다.

```
1순위: 본 디바이스(가상·실물)의 자체 용무
2순위: 소유자 프로젝트의 실행 사슬
3순위: 상시 공유받은 사용자(device_members role별 제한)
4순위: 동적 차용 중인 프로젝트
```

- **리소스 경쟁 시:** 1~2순위가 부족하면 3~4순위 요청은 대기·제한·거절된다. 반대는 허용되지 않는다.
- **할당량(Quota) 제한:** `resource_sharing_policy`에 `borrower_quota_max`(차용 최대 비율)·`borrower_bandwidth_limit` 등을 둬, 본 디바이스가 항상 최소 보장량을 확보하도록 한다.

#### 4.4.4 데이터·스키마 반영 제안

| 항목 | 내용 |
|------|------|
| `resource_sharing_policy` 확장 | `owner_can_suspend`, `owner_can_revoke`, `host_min_quota_pct`, `borrower_quota_max`, `disconnect_notice_required`(선택) |
| `device_members`·공유 테이블 | `sharing_status`: `active` \| `suspended` \| `revoked`. 소유자가 `suspended`/`revoked`로 변경 시 차용 측 세션 즉시 무효화 |
| 실행 시 검증 | 어댑터 실행 전 `sharing_status`·`host_min_quota_pct` 확인. 위반 시 해당 스텝 `STUCK` + ASK |

이 전략은 [NEXA-AUTH-01] 권한 모델·[UCL-07] 자가 회복 루프와 연동하여, 공유·차용이 **상호 신뢰**를 훼손하지 않도록 한다.

---

## 5. 지능적 족보와 성장 (Traceability)

자원 합성의 전 과정은 `why_chain`에 기록되어 향후 판단의 근거가 된다.

### 5.1 why_chain 기록

- **[자원 탐색 → 적합성 평가(Fit Score) → 시뮬레이션·사전 평정(자원 신뢰도) → 실제 투입]**의 전 과정을 `execution_chains.why_chain` 또는 `execution_steps.why_step_logic`에 기록한다.

### 5.2 성장형 지능 토대

- 성공적인 자원 대체 사례는 `project_knowledge`에 `nature_tag = 'RULE'`로 저장되어, 유사 상황 발생 시 RAG를 통해 즉시 호출된다.
- 이 과정에서 발생한 **신뢰도 점수(Confidence Score)**는 나중에 유사한 자원이 추가될 때 "과거에 이 자원을 추가했을 때 효과적이었는가?"를 판단하는 **성장형 지능**의 토대가 된다.

---

## 6. 타임머신·시뮬레이션 응용

문제가 없을 때도 **'미래 가치 시뮬레이션'**으로 작동한다.

- **가상 네트워크 미리보기:** `is_virtual = true` 상태에서 새 외부 자원을 연결했을 때의 효율을 시뮬레이션한다.
- **의미론적 잠금:** 실제 자원 투입 전 시뮬레이션 단계에서 안전성을 검증하여 할루시네이션에 의한 무분별한 네트워크 확장을 차단한다.
- [NEXA-DDL-00] `project_simulations`(No.17) 테이블 활용.

---

## 7. 넥사 시스템 전체로의 응용: 지능형 지향성

이 개념은 디바이스를 넘어 **지식·페르소나** 영역까지 확장된다.

- **지식 네트워크:** 현재 프로젝트의 `project_knowledge`가 부족할 때, 공개된 외부 아카이브나 타 프로젝트의 ECHO 자산을 동적으로 '구독'하여 판단 근거로 삼는다.
- **다중체(Multi-faceted Self)와의 결합:** 사용자가 '작업하는 나'에서 '창작하는 나'로 전환할 때, 필요한 외부 툴·API 네트워크를 **Ambient UCL** 환경으로 즉시 재구성한다.

### 7.5 활력 지수(VI) 기반 자원 탐색 제동 — Low-Entropy 모드

자원을 합성하고 확장하는 행위는 **시스템 부하**와 **사용자 인지 부하**를 높일 수 있으며, [NEXA 마스터 설계도] §7 Empathy 설계와 충돌할 가능성이 있다. 시스템이 너무 똑똑하게 굴어 사용자를 오히려 피로하게 만드는 **'기술 소외'** 현상을 방지하기 위한 제동 로직이다.

| 조건 | 동작 |
|------|------|
| **VI > 임계값** (정상·활력 충분) | 자원 합성 4단계 파이프라인 정상 가동. 외부·타 프로젝트 자원 탐색·제안 활성화 |
| **VI ≤ 임계값** (피로 상태) | 복잡한 **'자원 합성 제안'** 중단. **Low-Entropy 모드**로 전환 — 가장 단순하고 안정적인 **로컬 자원만** 사용 |

#### 7.5.1 Low-Entropy 모드 동작

- **탐색 범위:** 프로젝트 내 정의된 에이전트·스킬·디바이스만 사용. 외부 API·타 프로젝트 차출·동적 재구성 제안 비활성화.
- **제안 억제:** "근처 B 카메라를 임시로 사용할까요?" 등 자원 합성 관련 ASK 카드 미표시.
- **복귀:** VI가 임계값을 상회하면 자동으로 일반 모드 복귀.

#### 7.5.2 임계값 및 연동

- **VI 임계값:** [넥슈 설계도]·[Empathy 설계]의 VI 정의와 정합. 예: `VI ≤ 0.3`(피로 구간)일 때 Low-Entropy 전환.
- **이점:** 사용자가 피로할 때는 '단순히 작동하는 것'만 보장하고, 복잡한 제안으로 인지 부하를 더 주지 않는다.

---

## 8. 외부 API → Capability ID 어댑터 자동 생성 (제안)

외부 API를 Capability ID로 **자동 변환**하는 어댑터 생성 로직을 추가하면 확장성이 크게 강화된다. 아래 4단계로 상세화한다.

### 8.1 1단계: 스키마 스캔 (Schema Scan)

`project_extensions`(No.26)에 등록된 외부 API의 OpenAPI/Swagger 스펙을 읽어오는 단계이다.

| 항목 | 내용 |
|------|------|
| **입력 소스** | `project_extensions.extension_config`(JSONB)에 저장된 `openapi_url` 또는 `spec_snapshot`(인라인 스펙) |
| **스캔 대상** | `paths` 객체의 각 엔드포인트, `operationId`, `summary`, HTTP 메서드(GET/POST/PUT/DELETE 등) |
| **트리거** | 확장 등록 시점, 주기적 갱신(선택), 또는 `POST /api/admin/extension-sync` 호출 시 |
| **출력** | 파싱된 엔드포인트 목록: `{ path, method, operationId, summary, parameters, requestBody }` |

- `extension_config` 예시: `{ "openapi_url": "https://api.example.com/openapi.json", "provider": "example" }` 또는 `{ "spec_snapshot": { ... } }`
- OpenAPI 2.0(Swagger) 및 3.x 모두 지원하도록 파서 설계.

### 8.2 2단계: ID 매핑 규격 (Capability ID Mapping)

엔드포인트를 `nexa.extension.api.{provider}.{action}` 형태로 표준화하는 규칙이다.

| 규칙 | 설명 | 예시 |
|------|------|------|
| **provider** | `extension_config.provider` 또는 `plugin_name`을 소문자·언더스코어 정규화 | `openai`, `slack`, `weather_api` |
| **action** | `operationId` 우선, 없으면 `{method}_{path_segment}` 형태로 생성 | `getWeather` → `get_weather`, `POST /users` → `post_users` |
| **완성형** | `nexa.extension.api.{provider}.{action}` | `nexa.extension.api.openai.chat_completions`, `nexa.extension.api.weather_api.get_weather` |

- **중복 방지:** 동일 `provider.action` 조합이 있으면 `path`를 접미사로 추가. 예: `nexa.extension.api.slack.post_message.channels`
- **capabilities 테이블:** 매핑된 Capability ID가 `capabilities`에 없으면 동기화 시 자동 INSERT(`source='extension'`, `status='active'`).

### 8.3 3단계: 동적 어댑터 생성 (Runtime Wrapper)

런타임에서 해당 Capability ID를 호출할 수 있는 **래퍼(Wrapper)**를 생성하는 로직이다.

| 항목 | 내용 |
|------|------|
| **생성 시점** | 1·2단계 완료 후, 또는 오케스트레이터가 해당 Capability ID 실행을 요청할 때 **Lazy 생성** |
| **래퍼 역할** | Capability ID → 실제 HTTP 호출로 변환. `project_secrets`에서 해당 확장용 자격 증명(API Key 등) 조회 후 헤더/쿼리에 주입 |
| **템플릿 구조** | 입력(UCL params) → OpenAPI 파라미터 매핑 → HTTP 요청 → 응답 파싱 → UCL 형식 반환 |
| **캐싱** | 생성된 어댑터 인스턴스는 Capability ID당 메모리 캐시. `project_extensions` 변경 시 해당 provider 어댑터 무효화 |

- **실행 흐름:** `execution_steps`에서 `capability_id`가 `nexa.extension.api.*` 접두사일 때, 어댑터 레지스트리가 해당 래퍼를 조회·실행.
- **에러 처리:** 어댑터 내부 실패는 [UCL-07] 에러 토큰(ADAPTER_TIMEOUT 등)으로 재포장.

### 8.4 4단계: 자동 동기화 (capability_map 등록)

생성된 매핑을 `capability_map` 테이블에 `source='extension'`으로 등록하는 절차이다.

| 항목 | 내용 |
|------|------|
| **등록 데이터** | `resource_type='api'`, `resource_path`=(외부 API 베이스 URL + path), `method`, `required_capability_id`=(2단계 산출 ID), `source='extension'` |
| **동기화 시점** | 1·2단계 완료 직후, 또는 `POST /api/admin/capability-map/sync` 호출 시(extension 전용 플래그 또는 통합 sync) |
| **Diff 로직** | `project_extensions` 기준으로 현재 확장 목록과 `capability_map`(source='extension') 비교. 신규 → INSERT, 제거된 확장 → DELETE, 변경 → UPDATE |
| **덮어쓰기 방지** | `source='override'`·`source='registry'` 행은 건드리지 않음. `source='extension'`만 확장 sync 대상 |

- **DDL 확장:** `capability_map.source`에 `'extension'` 값 허용. [NEXA-DDL-01] 반영 시 `CHECK (source IN ('registry', 'override', 'extension'))` 추가 고려.

### 8.5 제약 사항

- **보안:** `project_secrets`에 저장된 자격 증명만 사용. RLS로 프로젝트 멤버만 접근. 어댑터가 외부 호출 시 해당 project_id 컨텍스트의 시크릿만 조회.
- **검증:** 신규 어댑터는 §3.5 **사전 평정**(`is_virtual=true` 3회 이상 테스트)을 필수로 거친 후 실제 등록 가능. Resource Confidence 임계값 충족 시에만 `capability_map` 등록.

---

## 9. 핵심 차별화 요약

| 기존 오케스트레이션 | UCL-08 동적 네트워크 합성 |
|--------------------|---------------------------|
| 주어진 환경에서의 최선 | 환경 자체를 지능적으로 확장·재구성 |
| 실행 결과만 기록 | [탐색→평가→시뮬레이션→투입] 전 과정을 `why_chain`에 기록 |
| 고정된 에이전트·스킬 | Capability ID 아톰 단위 무한 조합 |

이 로직이 `execution_chains`·`execution_steps` 스키마와 결합되면, NEXA는 스스로 외부 세계와 소통하며 몸집과 지능을 키워가는 **살아있는 유기체**로 완성된다.
