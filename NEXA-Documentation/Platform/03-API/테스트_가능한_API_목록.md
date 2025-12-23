# 테스트 가능한 API 목록

> **서버 주소**: `http://localhost:3000`  
> **기본 경로**: `/api`

---

## 📋 목차

1. [부품 클래스 (Part Classes) API](#1-부품-클래스-part-classes-api)
2. [부품 모델 (Part Models) API](#2-부품-모델-part-models-api)
3. [부품 사양 (Part Specs) API](#3-부품-사양-part-specs-api)
4. [부품 파일 (Part Files) API](#4-부품-파일-part-files-api)
5. [문서 파일 (Document Files) API](#5-문서-파일-document-files-api)

---

## 1. 부품 클래스 (Part Classes) API

### 1.1 조회

#### GET `/api/part-classes`

-   **설명**: 모든 부품 클래스 조회 (휴지통 제외)
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-classes");
    ```
-   **응답**: 부품 클래스 배열

#### GET `/api/part-classes/:id`

-   **설명**: 특정 부품 클래스 조회
-   **파라미터**: `id` (부품 클래스 ID)
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-classes/1");
    ```
-   **응답**: 부품 클래스 객체

#### GET `/api/part-classes/trash`

-   **설명**: 휴지통에 있는 부품 클래스 목록 조회
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-classes/trash");
    ```
-   **응답**: 휴지통 부품 클래스 배열

#### GET `/api/part-classes/trash/count`

-   **설명**: 휴지통에 있는 부품 클래스 개수 조회
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-classes/trash/count");
    ```
-   **응답**: `{ count: number }`

### 1.2 생성

#### POST `/api/part-classes`

-   **설명**: 부품 클래스 생성
-   **요청 본문**:
    ```json
    {
        "name": "부품 클래스 이름",
        "c_code": "C001",
        "category": "카테고리",
        "sort_order": 1,
        "sub_sort_order": 1
    }
    ```
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "새 부품 클래스",
            c_code: "C001",
            category: "카테고리",
            sort_order: 1,
            sub_sort_order: 1,
        }),
    });
    ```
-   **응답**: 생성된 부품 클래스 객체

### 1.3 수정

#### PUT `/api/part-classes/:id`

-   **설명**: 부품 클래스 수정
-   **파라미터**: `id` (부품 클래스 ID)
-   **요청 본문**: 수정할 필드들
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-classes/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "수정된 이름",
            c_code: "C002",
        }),
    });
    ```
-   **응답**: 수정된 부품 클래스 객체

#### PUT `/api/part-classes/reorder`

-   **설명**: 부품 클래스 순서 변경
-   **요청 본문**:
    ```json
    {
        "items": [
            { "id": 1, "sort_order": 1, "sub_sort_order": 1 },
            { "id": 2, "sort_order": 2, "sub_sort_order": 1 }
        ]
    }
    ```

#### POST `/api/part-classes/reinitialize-sort-order`

-   **설명**: 부품 클래스 정렬 순서 재초기화
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-classes/reinitialize-sort-order", {
        method: "POST",
    });
    ```

### 1.4 삭제

#### DELETE `/api/part-classes/:id`

-   **설명**: 부품 클래스 삭제 (휴지통으로 이동)
-   **파라미터**: `id` (부품 클래스 ID)
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-classes/1", {
        method: "DELETE",
    });
    ```
-   **응답**: 삭제 성공 메시지

#### POST `/api/part-classes/bulk-delete`

-   **설명**: 여러 부품 클래스 일괄 삭제
-   **요청 본문**:
    ```json
    {
        "ids": [1, 2, 3]
    }
    ```

#### DELETE `/api/part-classes/:id/permanent`

-   **설명**: 부품 클래스 영구 삭제 (휴지통에서 완전 삭제)
-   **파라미터**: `id` (부품 클래스 ID)
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-classes/1/permanent", {
        method: "DELETE",
    });
    ```

### 1.5 복원

#### POST `/api/part-classes/:id/restore`

-   **설명**: 휴지통에서 부품 클래스 복원
-   **파라미터**: `id` (부품 클래스 ID)
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-classes/1/restore", {
        method: "POST",
    });
    ```

#### POST `/api/part-classes/bulk-restore`

-   **설명**: 여러 부품 클래스 일괄 복원
-   **요청 본문**:
    ```json
    {
        "ids": [1, 2, 3]
    }
    ```

---

## 2. 부품 모델 (Part Models) API

### 2.1 조회

#### GET `/api/part-models`

-   **설명**: 모든 부품 모델 조회
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-models");
    ```
-   **응답**: 부품 모델 배열

#### GET `/api/part-models/:id`

-   **설명**: 특정 부품 모델 조회
-   **파라미터**: `id` (부품 모델 ID)
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-models/1");
    ```
-   **응답**: 부품 모델 객체

#### GET `/api/part-models/class/:classId`

-   **설명**: 특정 클래스의 모델 조회
-   **파라미터**: `classId` (부품 클래스 ID)
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-models/class/1");
    ```
-   **응답**: 부품 모델 배열

---

## 3. 부품 사양 (Part Specs) API

### 3.1 조회

#### GET `/api/part-specs`

-   **설명**: 모든 부품 사양 조회
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-specs");
    ```
-   **응답**: 부품 사양 배열

#### GET `/api/part-specs/:id`

-   **설명**: 특정 부품 사양 조회
-   **파라미터**: `id` (부품 사양 ID)
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-specs/1");
    ```
-   **응답**: 부품 사양 객체

#### GET `/api/part-specs/model/:modelId`

-   **설명**: 특정 모델의 사양 조회
-   **파라미터**: `modelId` (부품 모델 ID)
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-specs/model/1");
    ```
-   **응답**: 부품 사양 배열

### 3.2 생성

#### POST `/api/part-specs`

-   **설명**: 부품 사양 생성
-   **요청 본문**: 부품 사양 데이터
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-specs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            part_model_id: 1,
            spec_name: "사양 이름",
            spec_value: "사양 값",
        }),
    });
    ```

### 3.3 수정

#### PUT `/api/part-specs/:id`

-   **설명**: 부품 사양 수정
-   **파라미터**: `id` (부품 사양 ID)
-   **요청 본문**: 수정할 필드들
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-specs/1", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            spec_name: "수정된 사양 이름",
            spec_value: "수정된 사양 값",
        }),
    });
    ```

### 3.4 삭제

#### DELETE `/api/part-specs/:id`

-   **설명**: 부품 사양 삭제
-   **파라미터**: `id` (부품 사양 ID)
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-specs/1", {
        method: "DELETE",
    });
    ```

---

## 4. 부품 파일 (Part Files) API

### 4.1 조회

#### GET `/api/part-files`

-   **설명**: 모든 부품 파일 조회
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-files");
    ```
-   **응답**: 부품 파일 배열

#### GET `/api/part-files/:id`

-   **설명**: 특정 부품 파일 조회
-   **파라미터**: `id` (부품 파일 ID)
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-files/1");
    ```
-   **응답**: 부품 파일 객체

#### GET `/api/part-files/spec/:specId`

-   **설명**: 특정 사양의 파일 조회
-   **파라미터**: `specId` (부품 사양 ID)
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-files/spec/1");
    ```
-   **응답**: 부품 파일 배열

#### GET `/api/part-files/:id/download`

-   **설명**: 부품 파일 다운로드
-   **파라미터**: `id` (부품 파일 ID)
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-files/1/download");
    ```
-   **응답**: 파일 바이너리

### 4.2 업로드

#### POST `/api/part-files/upload`

-   **설명**: 부품 파일 업로드 (FormData)
-   **요청 본문**: `FormData` (file 필드 포함)
-   **요청 예시**:

    ```javascript
    const formData = new FormData();
    formData.append("file", fileBlob, "filename.jpg");
    formData.append("part_spec_id", "1");

    fetch("http://localhost:3000/api/part-files/upload", {
        method: "POST",
        body: formData,
    });
    ```

#### POST `/api/part-files/upload-temp`

-   **설명**: 임시 파일 업로드
-   **요청 본문**: Base64 인코딩된 파일 데이터
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-files/upload-temp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            file: "base64EncodedString",
            fileName: "filename.jpg",
        }),
    });
    ```

#### POST `/api/part-files/move-temp`

-   **설명**: 임시 파일을 실제 파일로 이동
-   **요청 본문**:
    ```json
    {
        "tempFileName": "temp-file-name",
        "part_spec_id": 1,
        "file_name": "final-file-name.jpg"
    }
    ```

### 4.3 생성

#### POST `/api/part-files`

-   **설명**: 부품 파일 레코드 생성
-   **요청 본문**: 부품 파일 데이터
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            part_spec_id: 1,
            file_name: "filename.jpg",
            file_path: "/uploads/path/to/file.jpg",
        }),
    });
    ```

### 4.4 수정

#### PUT `/api/part-files/:id`

-   **설명**: 부품 파일 수정
-   **파라미터**: `id` (부품 파일 ID)
-   **요청 본문**: 수정할 필드들

### 4.5 삭제

#### DELETE `/api/part-files/:id`

-   **설명**: 부품 파일 삭제
-   **파라미터**: `id` (부품 파일 ID)
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-files/1", {
        method: "DELETE",
    });
    ```

### 4.6 유지보수

#### POST `/api/part-files/cleanup-orphaned-editor-images`

-   **설명**: 고아 에디터 이미지 정리
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/part-files/cleanup-orphaned-editor-images", {
        method: "POST",
    });
    ```

---

## 5. 문서 파일 (Document Files) API

### 5.1 조회

#### GET `/api/docs/metadata`

-   **설명**: NEXA-Documentation 폴더의 모든 파일 메타데이터 조회
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/docs/metadata");
    ```
-   **응답**:
    ```json
    {
        "success": true,
        "files": [
            {
                "fileName": "문서.md",
                "relativePath": "Platform/01-기획/문서.md",
                "modifiedDate": "2024-01-01T00:00:00.000Z",
                "createdDate": "2024-01-01T00:00:00.000Z"
            }
        ]
    }
    ```

#### GET `/api/docs/:fileName`

-   **설명**: 문서 파일 내용 읽기
-   **파라미터**: `fileName` (상대 경로, URL 인코딩 필요)
-   **요청 예시**:
    ```javascript
    const fileName = encodeURIComponent("Platform/01-기획/문서.md");
    fetch(`http://localhost:3000/api/docs/${fileName}`);
    ```
-   **응답**: 파일 내용 (텍스트)

### 5.2 생성

#### POST `/api/docs`

-   **설명**: 새 문서 파일 생성
-   **요청 본문**:
    ```json
    {
        "fileName": "Platform/01-기획/새문서.md",
        "content": "# 새 문서\n\n내용..."
    }
    ```
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/docs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            fileName: "Platform/01-기획/새문서.md",
            content: "# 새 문서\n\n내용...",
        }),
    });
    ```

### 5.3 수정

#### PUT `/api/docs/:fileName`

-   **설명**: 문서 파일 내용 쓰기 또는 파일명 변경
-   **파라미터**: `fileName` (상대 경로, URL 인코딩 필요)

#### 파일 내용 쓰기

-   **요청 본문**: 파일 내용 (텍스트)
-   **요청 예시**:
    ```javascript
    const fileName = encodeURIComponent("Platform/01-기획/문서.md");
    fetch(`http://localhost:3000/api/docs/${fileName}`, {
        method: "PUT",
        headers: { "Content-Type": "text/plain" },
        body: "# 수정된 문서\n\n내용...",
    });
    ```

#### 파일명 변경

-   **요청 본문**:
    ```json
    {
        "newFileName": "Platform/01-기획/새이름.md"
    }
    ```
-   **요청 예시**:
    ```javascript
    const fileName = encodeURIComponent("Platform/01-기획/문서.md");
    fetch(`http://localhost:3000/api/docs/${fileName}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            newFileName: "Platform/01-기획/새이름.md",
        }),
    });
    ```

### 5.4 삭제

#### DELETE `/api/docs/:fileName`

-   **설명**: 문서 파일 영구 삭제
-   **파라미터**: `fileName` (상대 경로, URL 인코딩 필요)
-   **요청 예시**:
    ```javascript
    const fileName = encodeURIComponent("Platform/01-기획/문서.md");
    fetch(`http://localhost:3000/api/docs/${fileName}`, {
        method: "DELETE",
    });
    ```

### 5.5 유틸리티

#### POST `/api/docs/:fileName/touch`

-   **설명**: 파일 수정일(mtime)을 현재 시간으로 업데이트
-   **파라미터**: `fileName` (상대 경로, URL 인코딩 필요)
-   **요청 예시**:
    ```javascript
    const fileName = encodeURIComponent("Platform/01-기획/문서.md");
    fetch(`http://localhost:3000/api/docs/${fileName}/touch`, {
        method: "POST",
    });
    ```

### 5.6 설정

#### GET `/api/docs/config/extensions`

-   **설명**: 현재 지원 확장자 목록 조회
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/docs/config/extensions");
    ```
-   **응답**:
    ```json
    {
        "success": true,
        "extensions": [".md", ".mermaid.css", ".txt", ".markdown"]
    }
    ```

#### POST `/api/docs/config/extensions`

-   **설명**: 지원 확장자 목록 설정
-   **요청 본문**:
    ```json
    {
        "extensions": [".md", ".mermaid.css", ".txt", ".markdown"]
    }
    ```
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/docs/config/extensions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            extensions: [".md", ".mermaid.css", ".txt", ".markdown"],
        }),
    });
    ```

#### GET `/api/docs/config/folder`

-   **설명**: 현재 문서 폴더명 조회
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/docs/config/folder");
    ```
-   **응답**:
    ```json
    {
        "success": true,
        "folderName": "NEXA-Documentation"
    }
    ```

#### POST `/api/docs/config/folder`

-   **설명**: 문서 폴더명 설정
-   **요청 본문**:
    ```json
    {
        "folderName": "NEXA-Documentation"
    }
    ```
-   **요청 예시**:
    ```javascript
    fetch("http://localhost:3000/api/docs/config/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            folderName: "NEXA-Documentation",
        }),
    });
    ```

---

## 📝 참고사항

### 지원 확장자

문서 파일 API는 다음 확장자만 지원합니다:

-   `.md` (마크다운)
-   `.mermaid.css` (Mermaid 스타일)
-   `.txt` (텍스트)
-   `.markdown` (마크다운)

### URL 인코딩

한글 파일명이나 경로가 포함된 경우 URL 인코딩이 필요합니다:

```javascript
const fileName = encodeURIComponent("Platform/01-기획/문서.md");
```

### CORS

서버는 CORS를 허용하도록 설정되어 있습니다.

### 에러 응답

에러 발생 시 다음과 같은 형식으로 응답합니다:

```json
{
    "error": "에러 메시지"
}
```

---

**마지막 업데이트**: 2024년 12월
