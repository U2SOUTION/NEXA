# NEXA-Documentation 배포 및 내부망 접근 가이드

본 문서는 NEXA-Documentation 폴더의 문서를 웹 플랫폼에서 조회할 때의 동작 구조, 외부/내부 접근 이슈, 그리고 **내부망 전용 접근**으로 제한하는 기술·보안 정책을 정리한다.

---

## 1. 문서 로드 구조 개요

### 1.1 폴더 구조 (다중 폴더 지원)

```
NEXA/
├── NEXA-Platform/          ← 앱 + API 서버
│   ├── server/
│   │   ├── config/
│   │   │   ├── documentConfig.js   ← 문서 경로 설정 (다중 폴더)
│   │   │   └── docsFolders.json    ← 폴더 목록 (추가/제거 시 영속화)
│   │   └── routes/documentFiles.js
│   └── docs/               ← 진행 중 기획 문서 (platform-docs)
└── NEXA-Documentation/     ← 정리·보관 문서 (nexa-docs)
```

**기본 등록 폴더** (server/config/docsFolders.json):

| id | label | pathPrefix | displayPathPrefix (복사·표시용) |
|----|-------|------------|-------------------------------|
| nexa-docs | NEXA-Documentation | ../../../NEXA-Documentation | NEXA-Documentation |
| platform-docs | Platform docs | ../../docs | NEXA-Platform/docs |

### 1.2 경로 결정 방식 (다중 폴더)

- `documentConfig.js`가 `docsFolders.json`에서 폴더 목록을 로드한다.
- API 경로 형식: `{folderId}/{relativePath}` (예: `nexa-docs/Platform/01-기획/문서.md`)
- 파일 조회/저장: `GET/PUT/DELETE /api/docs/f/{prefixedPath}`

### 1.3 API 흐름

| 단계 | 파일 | 역할 |
|------|------|------|
| 문서 API | `server/routes/documentFiles.js` | `getDocsBasePath()`로 `NEXA-Documentation` 읽기 |
| 엔드포인트 | `server/server.js` | `app.use('/api/docs', documentFilesRouter)` |
| 프론트 URL | `apiBaseUrl.ts` | `getDocsBaseUrl()` → `${getApiBaseUrl()}/docs` |
| 호출 | `documentManagerStore.ts` 등 | `fetch(docsBaseUrl + '/metadata')`, `fetch(docsBaseUrl + '/' + fileName)` |

---

## 2. 개발 PC vs 외부에서 문서가 안 보이는 이유

### 2.1 개발 PC에서는 정상 동작

- `NEXA-Documentation`이 로컬 workspace에 존재
- 백엔드가 `getDocsBasePath()`로 해당 폴더를 읽음
- Quasar dev 프록시로 `localhost:3000/api`에 연결되어 정상 동작

### 2.2 외부(Docker 배포)에서 보이지 않는 원인

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

#### 빌드 시점 스냅샷 한계

- Docker 이미지는 빌드 시점의 파일 스냅샷
- 빌드 후 추가한 새 기획문서는 재빌드/재배포 전까지 이미지에 없음

---

## 3. 문서 외부 노출 방안 비교

| 방식 | 내용 | 장점 | 단점 |
|------|------|------|------|
| A. Docker 이미지 포함 | `.dockerignore`에서 `NEXA-Documentation` 제거 | 설정 간단 | 빌드 시점 문서만 포함, 새 문서는 재빌드 필요 |
| B. 볼륨 마운트 | `-v /host/NEXA-Documentation:/app/docs` | 실시간 반영 | 호스트 경로·접근 설정 필요 |
| C. 정기 동기화 | rsync 등으로 우분투 PC에 복사 | 개발 PC OFF 시에도 가능 | 마지막 동기화 이후 문서는 반영 안 됨 |

---

## 4. 네트워크 구조 및 Cloudflare Tunnel

### 4.1 배포 환경 가정

- Docker 배포: **다른 우분투 PC**에서 실행
- 내부: LAN 내 여러 PC (IPTIME 공유기 하위)
- 외부 접근: **Cloudflare Tunnel** 사용 (포트 포워딩 미사용)

### 4.2 Cloudflare Tunnel과 포트 포워딩

| 방식 | 포트 포워딩 | 동작 |
|------|-------------|------|
| **Cloudflare Tunnel** | **불필요** | 내부 PC → Cloudflare로 아웃바운드 터널. 공유기에 열린 포트 없음 |
| **Cloudflare DNS 프록시** | 필요 | 외부 → 공인 IP:80/443 → 포트포워딩 → 내부 서버 |

Cloudflare Tunnel 사용 시 포트 포워딩은 필요하지 않다.

### 4.3 문서 노출 문제와 포트 포워딩

- 문서가 안 보이는 이유는 **네트워크/포트**가 아니라 **문서 경로(볼륨·동기화)** 이슈
- 포트 포워딩 없이 문서 문제를 해결할 수 있음

---

## 5. 보안 및 접근 정책: 내부망 전용

### 5.1 결정 사항

- **내부 네트워크 망에서만** 접근 가능하도록 제한
- 외부(인터넷)에서는 접근 불가
- 작업실 내부 PC에서만 웹 플랫폼을 통해 문서 조회 (파서, TOC 등 기능 활용 목적)

### 5.2 기술 구조 (내부 전용)

```
작업실 PC들 (192.168.x.x)
        │
        │  http://우분투PC-IP:3000  (직접 접속)
        ▼
┌─────────────────────┐
│  우분투 PC          │
│  Docker (NEXA)      │  ← NEXA-Documentation 볼륨 마운트
└─────────────────────┘
        │
        ✗ Cloudflare Tunnel로 해당 서비스 노출 안 함
        ✗ 외부 접근 경로 없음
```

### 5.3 설정 포인트

| 항목 | 설정 |
|------|------|
| Cloudflare Tunnel | NEXA Platform(문서 포함) 경로는 터널에 연결하지 않음 |
| 포트 포워딩 | 사용하지 않음 |
| 내부 접속 | `http://우분투PC-IP:3000` |
| 문서 경로 | 우분투 PC에 NEXA-Documentation 마운트/동기화 후 Docker 볼륨 연결 |

### 5.4 보안 요약

| 구분 | 내용 |
|------|------|
| 외부 노출 | Cloudflare·포트포워딩 미사용으로 인터넷 직접 접근 차단 |
| 내부 접근 | 같은 LAN 내 PC만 `http://우분투PC-IP:3000`로 접속 |
| 전제 | 작업실 LAN이 신뢰 가능한 환경 |
| 추가 | 필요 시 방화벽으로 특정 내부 IP 대역만 허용 가능 |

---

## 6. 개발 PC ON/OFF 시나리오

### 6.1 개발 PC 켜져 있을 때

| 방식 | 설명 |
|------|------|
| 네트워크 공유 + 마운트 | 개발 PC에서 NFS/SMB로 `NEXA-Documentation` 공유 → 우분투 PC에서 마운트 → Docker 볼륨으로 전달 |
| SSHFS | 우분투 PC에서 `sshfs`로 개발 PC 폴더 마운트 |

→ 새 문서가 실시간으로 반영됨

### 6.2 개발 PC 꺼져 있을 때

| 방식 | 설명 |
|------|------|
| 정기 동기화 | 개발 PC ON일 때 rsync로 우분투 PC에 복사 → 개발 PC OFF 시에도 마지막 동기화 시점까지 문서 제공 |
| 공유 NAS | NAS에 `NEXA-Documentation` 저장 → 우분투 PC가 마운트 |
| 이미지 포함 | 빌드 시점 문서를 Docker 이미지에 포함 (재빌드 시 업데이트) |

---

## 7. 체크리스트

### 7.1 기술

- [ ] Cloudflare Tunnel에서 NEXA Platform(문서 포함) 경로 제외
- [ ] Docker 볼륨 마운트로 `NEXA-Documentation` 연결
- [ ] 내부 PC에서 `http://우분투PC-IP:3000` 접속 확인
- [ ] 문서 목록·상세·파서 기능 동작 확인

### 7.2 보안

- [ ] 해당 서비스가 Cloudflare/외부에 노출되지 않았는지 확인
- [ ] 우분투 PC 방화벽: 3000(또는 사용 포트)은 내부망 대역만 허용
- [ ] (선택) 작업실 LAN과 게스트 Wi‑Fi 등 분리 여부 확인

### 7.3 문서 데이터

- [ ] `NEXA-Documentation`이 우분투 PC에 존재 (로컬 복사 또는 공유 폴더 마운트)
- [ ] (선택) 개발 PC OFF 시 rsync 등으로 동기화 유지

---

## 8. 회원 인증 및 향후 계획

- 현재 웹 플랫폼에는 회원 인증 기능이 없음
- 완성도 향상 후 `/dev` 등 특정 도메인은 관리자 로그인자만 접근하도록 제한 예정
- 내부망 전용 + 향후 인증 추가로 보안을 단계적으로 강화하는 방향

---

## 9. 다중 폴더 관리

- **폴더 추가/제거**: 문서 설정 모달 또는 API
  - `GET /api/docs/config/folders` - 목록 조회
  - `POST /api/docs/config/folders` - 추가 (id, label, pathPrefix)
  - `DELETE /api/docs/config/folders/:id` - 제거
- **영속화**: `server/config/docsFolders.json`
- **폴더 사용 원칙**: 진행 중 기획 → `NEXA-Platform/docs`, 정리된 문서 → `NEXA-Documentation`

## 10. 관련 파일 참조

| 파일 | 역할 |
|------|------|
| `server/config/documentConfig.js` | 다중 폴더 설정, add/remove |
| `server/config/docsFolders.json` | 폴더 목록 (영속화) |
| `server/routes/documentFiles.js` | 문서 API (metadata, /f/ 경로) |
| `src/system/utils/apiBaseUrl.ts` | `getDocsBaseUrl()`, `getDocFileUrl()` |
| `src/system/store/documentManagerStore.ts` | 문서 메타데이터·내용 로드 |
| `NEXA-Platform/.dockerignore` | Docker 빌드 제외 목록 |
