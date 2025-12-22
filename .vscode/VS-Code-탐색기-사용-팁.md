# VS Code 탐색기 사용 팁

## 핵심 단축키

### 폴더 접기/펼치기

#### 모든 폴더 접기

-   **Windows/Linux**: `Ctrl + K, Ctrl + 0` (Ctrl+K 누른 후 Ctrl+0)
-   **Mac**: `Cmd + K, Cmd + 0`
-   **대안**: `Ctrl + K, Ctrl + -` (일부 버전)

#### 모든 폴더 펼치기

-   **Windows/Linux**: `Ctrl + K, Ctrl + J`
-   **Mac**: `Cmd + K, Cmd + J`

#### 현재 폴더만 접기/펼치기

-   **Windows/Linux**: `Ctrl + -` (현재 선택된 폴더 접기)
-   **Mac**: `Cmd + -`
-   또는 폴더 옆의 화살표 클릭

### 탐색기 포커스

-   **Windows/Linux**: `Ctrl + Shift + E`
-   **Mac**: `Cmd + Shift + E`

## 아코디언 모드 (클릭한 폴더만 열기)

### 방법 1: 설정으로 활성화 (권장)

`settings.json`에 다음 설정 추가:

```json
{
    "explorer.autoReveal": false,
    "explorer.compactFolders": false,
    "workbench.tree.indent": 8
}
```

### 방법 2: 단축키로 제어

현재 VS Code에는 기본적으로 "아코디언 모드"가 없지만, 다음 방법으로 유사하게 동작시킬 수 있습니다:

1. **모든 폴더 접기**: `Ctrl + K, Ctrl + -`
2. **원하는 폴더만 클릭하여 열기**

### 방법 3: 커스텀 단축키 설정

`keybindings.json`에 다음 추가:

```json
[
    {
        "key": "ctrl+k ctrl+0",
        "command": "workbench.files.action.collapseExplorerFolders"
    },
    {
        "key": "ctrl+k ctrl+j",
        "command": "workbench.files.action.expandExplorerFolders"
    }
]
```

## 추가 유용한 단축키

### 파일 탐색

-   **파일 검색**: `Ctrl + P` (Quick Open)
-   **파일에서 검색**: `Ctrl + Shift + F`
-   **심볼 검색**: `Ctrl + T` (파일 내 함수/클래스 찾기)

### 탐색기 조작

-   **새 파일**: `Ctrl + N`
-   **새 폴더**: 탐색기에서 우클릭 → "New Folder"
-   **파일 이름 변경**: `F2`
-   **파일 삭제**: `Delete` 또는 `Shift + Delete` (영구 삭제)

### 탐색기 보기

-   **탐색기 토글**: `Ctrl + B` (사이드바 전체 토글)
-   **탐색기만 토글**: `Ctrl + Shift + E`

## 추천 설정

```json
{
    "workbench.iconTheme": "vscode-great-icons",

    // 탐색기 설정
    "explorer.autoReveal": false, // 파일 열 때 자동으로 탐색기에서 파일 위치 표시 안 함
    "explorer.compactFolders": false, // 빈 폴더도 표시
    "explorer.confirmDelete": true, // 삭제 확인
    "explorer.confirmDragAndDrop": true, // 드래그 앤 드롭 확인
    "files.exclude": {
        // 탐색기에서 숨길 파일/폴더
        "**/.git": true,
        "**/node_modules": true,
        "**/__pycache__": true
    }
}
```

## 아코디언 모드 구현 팁

VS Code에는 기본 아코디언 모드가 없지만, 다음 워크플로우로 유사하게 사용 가능:

1. **모든 폴더 접기**: `Ctrl + K, Ctrl + -`
2. **원하는 폴더만 클릭하여 열기**
3. **다른 폴더 열기 전에**: 다시 `Ctrl + K, Ctrl + -`로 모두 접기

또는 확장 프로그램 사용:

-   **Auto Fold** - 자동으로 폴더 접기/펼치기 제어
-   **Fold Plus** - 폴더 접기/펼치기 향상 기능
