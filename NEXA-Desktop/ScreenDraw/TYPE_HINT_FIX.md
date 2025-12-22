# 타입 힌트 색상 문제 해결 가이드

## 현재 상황
- `str` 타입 힌트의 scope가 `source.python`만 표시됨
- `foreground: No theme selector` - 테마 선택자가 없음
- 구체적인 타입 힌트 scope가 인식되지 않음

## 해결 방법

### 방법 1: Pylance 재시작 (가장 중요!)

1. `Ctrl+Shift+P` 누르기
2. "Python: Restart Language Server" 입력 후 실행
3. 또는 "Developer: Reload Window" 실행
4. `test_type_hints.py` 파일 다시 열기
5. 타입 힌트 색상 확인

### 방법 2: 다른 부분의 Scope 확인

다음 부분들의 scope도 확인해주세요:

1. **콜론(`:`)** - `name: str`에서 콜론 부분
   - 커서를 콜론에 두고 scope 확인

2. **화살표(`->`)** - `def get_name() -> str:`에서 화살표 부분
   - 커서를 화살표에 두고 scope 확인

3. **클래스 이름** - `widget: QWidget`에서 `QWidget` 부분
   - 커서를 `QWidget`에 두고 scope 확인

### 방법 3: Semantic Highlighting 확인

1. `Ctrl+Shift+P` 누르기
2. "Developer: Inspect Editor Tokens and Scopes" 실행
3. 타입 힌트 부분에 커서를 두고 확인
4. **"semantic token"** 정보가 있는지 확인
   - 있으면: semantic highlighting이 작동 중
   - 없으면: Pylance 재시작 필요

### 방법 4: Python 확장 프로그램 확인

1. 확장 프로그램 탭 열기 (`Ctrl+Shift+X`)
2. "Python" 검색
3. 다음 확장 프로그램 확인:
   - `Python` (ms-python.python) - 활성화
   - `Pylance` (ms-python.vscode-pylance) - 활성화
   - 나머지는 필요시만 사용

### 방법 5: 테마별 설정 확인

현재 다크 테마를 사용 중이므로, 테마가 타입 힌트를 제대로 인식하지 못할 수 있습니다.

1. `Ctrl+Shift+P` → "Preferences: Color Theme" 실행
2. 다른 다크 테마로 변경해보기 (예: "Dark+", "Monokai")
3. 타입 힌트 색상 확인

## 다음 단계

위 방법들을 시도한 후 결과를 알려주세요:
- Pylance 재시작 후 색상이 보이나요?
- 콜론, 화살표, 클래스 이름의 scope는 무엇인가요?
- Semantic token 정보가 표시되나요?











