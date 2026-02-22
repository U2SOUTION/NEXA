# ✨ 도커 배포 프로세스 (Windows → NAS)

- NEXA Platform – Docker 이미지 빌드 및 NAS 배포

### 1. 윈도우에서 이미지 생성 및 내보내기

- **도커 이미지 빌드** (소스 코드가 있는 폴더에서 실행)

```powershell
docker build -t nexa-platform:latest .
```

- **이미지를 .tar 파일로 압축 저장**

```powershell
docker save -o nexa-platform.tar nexa-platform:latest
```

### 2. 파일 이동 (Windows → NAS)

- **방법:** 윈도우 탐색기 주소창에 `\\NAS_IP` 입력 후 접속
- **경로:** `/mnt/web_data/nexa-platform` (또는 지정한 NAS 폴더)
- **동작:** 생성된 `nexa-platform.tar` 파일을 해당 폴더로 복사

### 3. NAS에서 이미지 로드 및 실행 (원격 접속/터미널)

- **파일이 위치한 폴더로 이동**

```bash
cd /mnt/web_data/nexa-platform
```

- **기존에 돌아가던 컨테이너 삭제** (포트 충돌 방지)

```bash
docker rm -f nexa-web
```

- **.tar 파일에서 이미지 불러오기**

```bash
docker load -i nexa-platform.tar
```

- **새 컨테이너 실행** (환경 변수 포함)

```bash
docker run -d \
  --name nexa-web \
  --restart always \
  -p 8080:3000 \
  -e MYSQL_HOST=192.168.0.10 \
  -e MYSQL_PASSWORD=1234 \
  nexa-platform:latest
```

### 4. 상태 확인 및 로그 모니터링

- **컨테이너 실행 상태 확인**

```bash
docker ps
```

- **실시간 로그 확인** (DB 연결 에러 등 확인 시 필수)

```bash
docker logs -f nexa-web
```

---

## ✨ 데이터베이스 관리 (MySQL Workbench)

개발 PC의 실제 데이터를 NAS MariaDB로 옮기거나, 백업/복원할 때 사용합니다.

### DB 내보내기 (Export) – 개발 PC → 파일

1. **MySQL Workbench** 실행 후 **개발 PC MySQL** 접속 (localhost, root, 비밀번호 1234).
2. 상단 메뉴 **Server** → **Data Export**.
3. 왼쪽에서 **nexa_db** 스키마 선택 (필요 시 테이블만 선택).
4. **Export to Self-Contained File** 선택.
5. **파일 경로** 지정 (예: `E:\backup\nexa_db_20260214.sql`).
6. **Start Export** 실행 → `.sql` 파일 생성.

### DB 가져오기 (Import) – 파일 → NAS MariaDB

1. **MySQL Workbench**에서 **NAS MariaDB** 접속
   - Host: NAS IP (예: 192.168.0.10), Port: MariaDB 공개 포트(예: 330), User: root, Password: 1234.
2. **nexa_db** 스키마가 없으면 생성:  
   쿼리 탭에서 `CREATE DATABASE IF NOT EXISTS nexa_db;` 실행.
3. 상단 메뉴 **Server** → **Data Import**.
4. **Import from Self-Contained File** 선택 후, 내보낸 `.sql` 파일 선택.
5. **Default Target Schema**에서 **nexa_db** 선택.
6. **Start Import** 실행.

> NAS 포털에서 “데이터가 없습니다”가 나오면, 위 가져오기 후 **데이터 새로고침** 버튼으로 다시 불러오면 됩니다.

---

## 로컬 DB 연결이 포트 충돌을 피하기 위해 수정한 파일 요약

- **package.json**
  - `quasar dev` 할 때 `VITE_API_PORT=3001` 사용 → 프론트가 **3001**로 API 호출
- **server/package.json**

  - `npm run dev` 할 때 `PORT=3001` 사용 → API 서버가 **3001**에서 대기

- **로컬 개발:**
  - `npm run dev:all` (또는 dev + dev:server) 그대로 사용
  - 브라우저는 기존처럼 **localhost:9000 또는 9003** 등으로 접속 (Quasar 포트는 그대로)
- **로컬에서 도커로 NEXA 실행:**
  - `docker run ... -p 3000:3000` → **localhost:3000** 으로 접속
- **NAS:**
  - NAS에서 도커로 띄운 NEXA는 그대로 **NAS IP:설정한 포트**로 접속

정리하면, **항상 Stop 할 필요는 없고**, 개발은 3001, 도커 테스트는 3000으로 나눠 써서 둘 다 같이 켜 둬도 되도록 맞춰 둔 상태입니다.
만약 3000 포트를 둘다 사용하면 개발 도커를 중지 시켜야 함

## 다음 진행 순서

> **docker-compose**: DB 컨테이너 + NEXA 앱을 한 번에 띄우는 `docker-compose.yml` 추가.
> **"외부 도메인 연결(Cloudflare)"** 연결
> 도커 허브 이용 레지스트리 사용 (Docker Hub / NAS 내장 레지스트리) 사용법 학습
