# Git 원격 저장소 가이드

> Git 초보자를 위한 원격 저장소 설정 및 사용 가이드

## 🎯 Git 기본 개념 (쉽게 이해하기)

### 로컬 vs 원격

```
로컬 저장소 (내 컴퓨터)
├── 소스 코드
├── 커밋 이력
└── 변경사항

원격 저장소 (클라우드)
├── 소스 코드 (백업)
├── 커밋 이력 (백업)
└── 다른 사람과 공유
```

**비유**:

-   **로컬**: 내 컴퓨터의 작업 공간
-   **원격**: 클라우드 백업 + 공유 공간

---

## 📋 현재 상태 확인

### 1. 로컬 저장소 확인

```bash
git status
```

-   ✅ **로컬 저장소 있음**: 커밋 이력이 있으면 로컬 저장소가 있는 것

### 2. 원격 저장소 확인

```bash
git remote -v
```

-   ❌ **원격 저장소 없음**: 아무것도 나오지 않으면 원격 저장소가 설정되지 않은 것

---

## 🚀 원격 저장소 설정하기

### 방법 1: GitHub 사용 (가장 쉬움)

#### 1단계: GitHub에서 저장소 생성

1. https://github.com 접속
2. 우측 상단 `+` 버튼 → "New repository" 클릭
3. 저장소 이름 입력 (예: `NEXA`)
4. "Create repository" 클릭
5. **중요**: "Initialize this repository with a README" 체크하지 않기 (이미 로컬에 있으므로)

#### 2단계: 원격 저장소 연결

```bash
# GitHub에서 제공하는 명령어 복사 (HTTPS 또는 SSH)
# 예시:
git remote add origin https://github.com/사용자명/NEXA.git
```

#### 3단계: 원격 저장소 확인

```bash
git remote -v
```

-   `origin`이 보이면 성공!

#### 4단계: 첫 푸시 (로컬 → 원격)

```bash
# 현재 변경사항 커밋
git add .
git commit -m "원격 저장소 연결"

# 원격 저장소에 푸시
git push -u origin main
```

**`-u` 옵션**: 처음 한 번만 사용. 이후에는 `git push`만 하면 됨

---

### 방법 2: GitLab 사용

1. https://gitlab.com 접속
2. "New project" → "Create blank project"
3. 저장소 이름 입력
4. 아래 명령어로 연결:

```bash
git remote add origin https://gitlab.com/사용자명/NEXA.git
git push -u origin main
```

---

### 방법 3: NAS에 Git 저장소 생성

#### 1단계: NAS에 Git 저장소 생성

```bash
# NAS에 SSH 접속 후
cd /volume1/backup  # NAS 백업 폴더
git init --bare NEXA.git
```

#### 2단계: 로컬에서 연결

```bash
git remote add origin ssh://사용자명@NAS주소:/volume1/backup/NEXA.git
git push -u origin main
```

---

## 💻 VS Code/Cursor에서 Git 사용하기

### 기본 사용법

#### 1. 소스 제어 패널 열기

-   **단축키**: `Ctrl+Shift+G`
-   또는 왼쪽 사이드바에서 소스 제어 아이콘 클릭

#### 2. 변경사항 커밋

1. 변경된 파일 옆 `+` 버튼 클릭 (스테이징)
2. 위쪽 메시지 입력창에 커밋 메시지 입력
3. `Ctrl+Enter` 또는 `✓` 버튼 클릭 (커밋)

#### 3. 원격 저장소에 푸시

1. 소스 제어 패널에서 `...` (더보기) 버튼 클릭
2. "Push" 선택
3. 또는 `Ctrl+Shift+P` → "Git: Push" 입력

#### 4. 원격 저장소에서 풀 (가져오기)

1. `Ctrl+Shift+P` → "Git: Pull" 입력
2. 또는 `...` 버튼 → "Pull" 선택

---

## 🔄 자주 사용하는 Git 명령어

### 로컬 작업

```bash
# 변경사항 확인
git status

# 변경사항 스테이징 (커밋 준비)
git add .

# 커밋 (로컬에 저장)
git commit -m "커밋 메시지"

# 커밋 이력 보기
git log --oneline
```

### 원격 작업

```bash
# 원격 저장소에 푸시 (업로드)
git push

# 원격 저장소에서 풀 (다운로드)
git pull

# 원격 저장소 확인
git remote -v

# 원격 저장소 추가
git remote add origin <저장소주소>

# 원격 저장소 변경
git remote set-url origin <새주소>
```

---

## 🖱️ VS Code/Cursor UI로 커밋하기 (추천!)

명령어를 외울 필요 없이 **마우스 클릭만으로** 커밋할 수 있습니다!

### 방법 1: 소스 제어 패널 사용 (가장 쉬움)

#### 1단계: 소스 제어 패널 열기

-   **단축키**: `Ctrl+Shift+G` (Windows/Linux) 또는 `Cmd+Shift+G` (Mac)
-   또는 왼쪽 사이드바에서 **소스 제어 아이콘** 클릭 (분기 모양 아이콘)

#### 2단계: 변경사항 확인

-   "변경 사항" 섹션에 수정된 파일들이 표시됩니다
-   각 파일 옆의 `+` 아이콘을 클릭하면 해당 파일만 스테이징
-   또는 "변경 사항" 제목 옆의 `+` 아이콘을 클릭하면 모든 파일 스테이징

#### 3단계: 커밋 메시지 입력

-   상단의 입력창에 커밋 메시지 입력 (예: "문서 스타일 수정")
-   `Ctrl+Enter` (Windows/Linux) 또는 `Cmd+Enter` (Mac)로 커밋

#### 4단계: 원격 저장소에 푸시

-   소스 제어 패널 상단의 `...` (점 3개) 메뉴 클릭
-   "Push" 또는 "Push to..." 선택
-   또는 하단 상태바의 **분기 이름** 클릭 → "Push" 선택

### 방법 2: GitLens 확장 사용 (고급)

GitLens가 설치되어 있다면:

1. 왼쪽 사이드바에서 **GitLens 아이콘** 클릭
2. "COMMITS" 섹션에서 커밋 히스토리 확인
3. "SOURCE CONTROL" 섹션에서 변경사항 확인
4. 소스 제어 패널과 동일하게 커밋 가능

### 방법 3: 명령 팔레트 사용

1. `Ctrl+Shift+P` (Windows/Linux) 또는 `Cmd+Shift+P` (Mac)
2. 다음 명령어 입력:
    - `Git: Commit` - 커밋하기
    - `Git: Push` - 푸시하기
    - `Git: Pull` - 가져오기

### 💡 UI 사용 팁

-   **변경사항 미리보기**: 파일을 클릭하면 변경 내용을 확인할 수 있습니다
-   **파일별 커밋**: 여러 파일 중 일부만 선택해서 커밋할 수 있습니다
-   **커밋 히스토리**: GitLens에서 모든 커밋을 시각적으로 확인 가능합니다

---

## 🎯 실전 시나리오

### 시나리오 1: 매일 작업 후 백업

```bash
# 1. 변경사항 확인
git status

# 2. 변경사항 커밋
git add .
git commit -m "오늘 작업 내용"

# 3. 원격 저장소에 푸시
git push
```

### 시나리오 2: 다른 컴퓨터에서 작업

```bash
# 1. 원격 저장소에서 최신 버전 가져오기
git pull

# 2. 작업 후 커밋
git add .
git commit -m "작업 내용"

# 3. 원격 저장소에 푸시
git push
```

### 시나리오 3: 여러 원격 저장소 사용 (중복 백업)

```bash
# GitHub 추가
git remote add github https://github.com/사용자명/NEXA.git

# GitLab 추가
git remote add gitlab https://gitlab.com/사용자명/NEXA.git

# NAS 추가
git remote add nas ssh://사용자명@NAS주소:/volume1/backup/NEXA.git

# 모든 원격 저장소에 푸시
git push github main
git push gitlab main
git push nas main
```

---

## ⚠️ 주의사항

### 1. `.gitignore` 확인

-   `.gitignore`에 있는 파일은 커밋되지 않음
-   환경 변수 파일 (`.env.local`)은 절대 커밋하지 않기

### 2. 커밋 메시지 작성

-   의미 있는 메시지 작성 (예: "문서 관리 기능 추가")
-   나중에 찾기 쉬움

### 3. 정기적으로 푸시

-   로컬에만 커밋하면 백업이 안 됨
-   작업 후 `git push`로 원격 저장소에 백업

### 4. 충돌 해결

-   다른 곳에서 수정한 내용이 있으면 `git pull` 먼저
-   충돌 발생 시 VS Code에서 해결 가능

---

## 🔍 문제 해결

### 문제 1: "remote origin already exists"

```bash
# 기존 원격 저장소 제거 후 재추가
git remote remove origin
git remote add origin <새주소>
```

### 문제 2: "failed to push"

```bash
# 원격 저장소에서 먼저 가져오기
git pull origin main --allow-unrelated-histories
git push origin main
```

### 문제 3: 인증 오류

-   GitHub: Personal Access Token 필요
-   GitLab: Personal Access Token 필요
-   NAS: SSH 키 설정 필요

---

## 📚 다음 단계

1. **GitHub/GitLab 계정 생성**
2. **원격 저장소 생성**
3. **로컬에서 연결**
4. **첫 푸시 실행**

---

**핵심 정리**:

-   **로컬 커밋**: 내 컴퓨터에만 저장 (백업 아님)
-   **원격 푸시**: 클라우드에 백업 (진짜 백업)
-   **정기 푸시**: 작업 후 `git push`로 백업하기

**마지막 업데이트**: 2024년 12월
