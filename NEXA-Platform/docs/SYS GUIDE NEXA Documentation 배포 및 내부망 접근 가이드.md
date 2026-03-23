# NEXA-Documentation 배포 및 내부망 접근 가이드

본 문서는 NEXA 문서 시스템의 동작 구조, 외부/내부 접근 이슈, **내부망 전용 접근** 정책, 그리고 **현재 구현 현황**을 정리한다.

---

## 1. 현재 작업 상황 (다음 참고용)

> 마지막 갱신: 2025년 3월 기준

### 1.1 구현 완료

| 항목 | 설명 |
|------|------|
| **다중 폴더** | `nexa-docs`(NEXA-Documentation), `platform-docs`(NEXA-Platform/docs) 지원 |
| **표시 경로(displayPath)** | UI·복사 시 실제 경로 형식 표시 (`NEXA-Documentation/...`, `NEXA-Platform/docs/...`) |
| **API 경로** | `{folderId}/{relativePath}` 형식, `/api/docs/f/` 접두사로 조회 |
| **정렬 기본값** | 수정일순(modified) + 내림차순(desc), localStorage에 저장 |
| **필터** | 디렉토리(folderId) 기준 카테고리 필터, 정렬 모드(이름/수정일/생성일/사용빈도/즐겨찾기/우선순위) |

### 1.2 기획·검토 예정

| 항목 | 내용 |
|------|------|
| **디렉토리별 1depth 서브폴더 필터** | 디렉토리 선택 시 하위 1단계 폴더(Platform, 공통, Desktop 등) 필터 버튼 추가. 사용성 검토 후 반영. ([기획서] 12장 15번 항목) |

### 1.3 관련 주요 파일

| 파일 | 역할 |
|------|------|
| `server/config/documentConfig.js` | 폴더 설정, 경로 해석 (resolvePrefixedPath, getDocsBasePathForFolder) |
| `server/config/docsFolders.json` | 폴더 목록 (id, label, pathPrefix, displayPathPrefix) |
| `server/routes/documentFiles.js` | 문서 API (metadata, /f/ 경로, displayPath 반환) |
| `src/system/utils/apiBaseUrl.ts` | `getDocsBaseUrl()`, `getDocFileUrl(prefixedPath)` |
| `src/system/store/documentManagerStore.ts` | 문서 메타데이터·내용 로드, displayPath 사용 |
| `src/domains/dev/views/dev-tools/document-manager/` | 문서 관리 UI (필터·정렬·복사 등) |

---

## 2. 문서 로드 구조 개요

### 2.1 폴더 구조 (다중 폴더 지원)

```
NEXA/
├── NEXA-Platform/          ← 앱 + API 서버
│   ├── server/
│   │   ├── config/
│   │   │   ├── documentConfig.js   ← 문서 경로·해석 설정
│   │   │   └── docsFolders.json    ← 폴더 목록 (추가/제거 시 영속화)
│   │   └── routes/documentFiles.js
│   └── docs/               ← 진행 중 기획 문서 (platform-docs)
└── NEXA-Documentation/     ← 정리·보관 문서 (nexa-docs)
```

**기본 등록 폴더** (server/config/docsFolders.json):

| id | label | pathPrefix | displayPathPrefix (UI·복사용) |
|----|-------|------------|------------------------------|
| nexa-docs | NEXA-Documentation | ../../../NEXA-Documentation | NEXA-Documentation |
| platform-docs | Platform docs | ../../docs | NEXA-Platform/docs |

### 2.2 경로 규칙

| 구분 | 형식 | 예시 |
|------|------|------|
| **API 경로** | `{folderId}/{relativePath}` | `nexa-docs/Platform/01-기획/문서.md` |
| **표시 경로(displayPath)** | `{displayPathPrefix}/{relativePath}` | `NEXA-Documentation/Platform/01-기획/문서.md` |
| **파일 조회 URL** | `/api/docs/f/{encodedPath}` | `/api/docs/f/nexa-docs/Platform/01-기획/문서.md` |

- API는 `folderId`로 폴더를 구분한다. `displayPathPrefix`는 UI 표시·복사용 실제 경로로만 사용한다.

### 2.3 API 흐름

| 단계 | 파일 | 역할 |
|------|------|------|
| 문서 API | `server/routes/documentFiles.js` | `resolvePrefixedPath()`로 경로 해석, `getDocsBasePathForFolder()`로 실제 경로 반환 |
| 엔드포인트 | `server/server.js` | `app.use('/api/docs', documentFilesRouter)` |
| 프론트 URL | `apiBaseUrl.ts` | `getDocsBaseUrl()`, `getDocFileUrl(prefixedPath)` → `/api/docs/f/...` |
| 호출 | `documentManagerStore.ts` 등 | `fetch(docsBaseUrl + '/metadata')`, `fetch(getDocFileUrl(path))` |

---

## 3. 개발 PC vs 외부에서 문서가 안 보이는 이유

### 3.1 개발 PC에서는 정상 동작

- `NEXA-Documentation`, `NEXA-Platform/docs`가 로컬에 존재
- 백엔드가 `resolvePrefixedPath`로 해당 폴더 경로 해석
- Quasar dev 프록시로 `localhost:3000/api`에 연결되어 정상 동작

### 3.2 외부(Docker 배포)에서 보이지 않는 원인

#### .dockerignore

```dockerignore
NEXA-Documentation
```

- `NEXA-Documentation`이 Docker 이미지에서 **제외**됨
- 컨테이너 내부에 문서 폴더가 없음

#### .gitignore

```
NEXA-Documentation/
```

- Git에 포함되지 않아 CI/CD 빌드 시 폴더 자체가 없을 수 있음

#### 빌드 시점 스냅샷

- Docker 이미지는 빌드 시점의 파일 스냅샷
- 빌드 후 추가한 새 문서는 재빌드/재배포 전까지 이미지에 없음

---

## 4. 문서 외부 노출 방안 비교

| 방식 | 내용 | 장점 | 단점 |
|------|------|------|------|
| A. Docker 이미지 포함 | `.dockerignore`에서 `NEXA-Documentation` 제거 | 설정 간단 | 빌드 시점 문서만 포함, 새 문서는 재빌드 필요 |
| B. 볼륨 마운트 | `-v /host/NEXA-Documentation:/app/NEXA-Documentation` | 실시간 반영 | 호스트 경로·접근 설정 필요 |
| C. 정기 동기화 | rsync 등으로 우분투 PC에 복사 | 개발 PC OFF 시에도 가능 | 마지막 동기화 이후 문서는 반영 안 됨 |

---

## 5. 네트워크 구조 및 Cloudflare Tunnel

### 5.1 배포 환경 가정

- Docker 배포: **다른 우분투 PC**에서 실행
- 내부: LAN 내 여러 PC (IPTIME 공유기 하위)
- 외부 접근: **Cloudflare Tunnel** 사용 (포트 포워딩 미사용)

### 5.2 Cloudflare Tunnel과 포트 포워딩

| 방식 | 포트 포워딩 | 동작 |
|------|-------------|------|
| **Cloudflare Tunnel** | **불필요** | 내부 PC → Cloudflare로 아웃바운드 터널. 공유기에 열린 포트 없음 |
| **Cloudflare DNS 프록시** | 필요 | 외부 → 공인 IP:80/443 → 포트포워딩 → 내부 서버 |

Cloudflare Tunnel 사용 시 포트 포워딩은 필요하지 않다.

### 5.3 문서 노출 문제와 포트 포워딩

- 문서가 안 보이는 이유는 **네트워크/포트**가 아니라 **문서 경로(볼륨·동기화)** 이슈
- 포트 포워딩 없이 문서 문제를 해결할 수 있음

---

## 6. 보안 및 접근 정책: 내부망 전용

### 6.1 결정 사항

- **내부 네트워크 망에서만** 접근 가능하도록 제한
- 외부(인터넷)에서는 접근 불가
- 작업실 내부 PC에서만 웹 플랫폼을 통해 문서 조회

### 6.2 기술 구조

```
작업실 PC들 (192.168.x.x)
        │
        │  http://우분투PC-IP:3000  (직접 접속)
        ▼
┌─────────────────────┐
│  우분투 PC          │
│  Docker (NEXA)      │  ← NEXA-Documentation, NEXA-Platform/docs 볼륨 마운트
└─────────────────────┘
        │
        ✗ Cloudflare Tunnel로 해당 서비스 노출 안 함
        ✗ 외부 접근 경로 없음
```

### 6.3 설정 포인트

| 항목 | 설정 |
|------|------|
| Cloudflare Tunnel | NEXA Platform(문서 포함) 경로는 터널에 연결하지 않음 |
| 포트 포워딩 | 사용하지 않음 |
| 내부 접속 | `http://우분투PC-IP:3000` |
| 문서 경로 | 우분투 PC에 NEXA-Documentation, NEXA-Platform/docs 마운트·동기화 후 Docker 볼륨 연결 |

### 6.4 보안 요약

| 구분 | 내용 |
|------|------|
| 외부 노출 | Cloudflare·포트포워딩 미사용으로 인터넷 직접 접근 차단 |
| 내부 접근 | 같은 LAN 내 PC만 `http://우분투PC-IP:3000`로 접속 |
| 전제 | 작업실 LAN이 신뢰 가능한 환경 |
| 추가 | 필요 시 방화벽으로 특정 내부 IP 대역만 허용 가능 |

---

## 7. 개발 PC ON/OFF 시나리오

### 7.1 개발 PC 켜져 있을 때

| 방식 | 설명 |
|------|------|
| 네트워크 공유 + 마운트 | 개발 PC에서 NFS/SMB로 `NEXA-Documentation` 공유 → 우분투 PC에서 마운트 → Docker 볼륨으로 전달 |
| SSHFS | 우분투 PC에서 `sshfs`로 개발 PC 폴더 마운트 |

→ 새 문서가 실시간으로 반영됨

### 7.2 개발 PC 꺼져 있을 때

| 방식 | 설명 |
|------|------|
| 정기 동기화 | 개발 PC ON일 때 rsync로 우분투 PC에 복사 → 개발 PC OFF 시에도 마지막 동기화 시점까지 문서 제공 |
| 공유 NAS | NAS에 `NEXA-Documentation` 저장 → 우분투 PC가 마운트 |
| 이미지 포함 | 빌드 시점 문서를 Docker 이미지에 포함 (재빌드 시 업데이트) |

---

## 8. 체크리스트

### 8.1 기술

- [ ] Cloudflare Tunnel에서 NEXA Platform(문서 포함) 경로 제외
- [ ] Docker 볼륨 마운트로 `NEXA-Documentation`, `NEXA-Platform/docs` 연결
- [ ] 내부 PC에서 `http://우분투PC-IP:3000` 접속 확인
- [ ] 문서 목록·상세·파서 기능 동작 확인

### 8.2 보안

- [ ] 해당 서비스가 Cloudflare/외부에 노출되지 않았는지 확인
- [ ] 우분투 PC 방화벽: 3000(또는 사용 포트)은 내부망 대역만 허용
- [ ] (선택) 작업실 LAN과 게스트 Wi‑Fi 등 분리 여부 확인

### 8.3 문서 데이터

- [ ] `NEXA-Documentation`, `NEXA-Platform/docs`가 우분투 PC에 존재 (로컬 복사 또는 공유 폴더 마운트)
- [ ] (선택) 개발 PC OFF 시 rsync 등으로 동기화 유지

---

## 9. 다중 폴더 관리

### 9.1 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/docs/config/folders` | 폴더 목록 조회 |
| POST | `/api/docs/config/folders` | 폴더 추가 (id, label, pathPrefix, displayPathPrefix) |
| DELETE | `/api/docs/config/folders/:id` | 폴더 제거 |

### 9.2 영속화

- `server/config/docsFolders.json`에 저장
- 서버 재시작 시 로드

### 9.3 사용 원칙

| 폴더 | 용도 |
|------|------|
| nexa-docs (NEXA-Documentation) | 정리·보관된 문서 |
| platform-docs (NEXA-Platform/docs) | 진행 중 기획 문서 |

---

## 10. 회원 인증 및 향후 계획

- 현재 웹 플랫폼에는 회원 인증 기능이 없음
- 완성도 향상 후 `/dev` 등 특정 도메인은 관리자 로그인자만 접근하도록 제한 예정
- 내부망 전용 + 향후 인증 추가로 보안을 단계적으로 강화하는 방향
