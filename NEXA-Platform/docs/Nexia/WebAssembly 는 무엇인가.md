# WebAssembly는 무엇인가?

브라우저 안에서 **데스크톱급 연산(C/C++/Rust 등)** 을 돌리게 해 주는 기술입니다.  
NEXA Nexia에서 CAD·엔지니어링·IoT 데이터 처리를 **서버 없이** 웹에서 돌리려면 Wasm(와 그 위에 올라가는 **Pyodide**)을 이해하는 것이 출발점입니다.

> **제품·스택 구현 상세**는 별도 문서를 참고하세요.  
> [`AI 3D 제네레이터.md`](./AI%203D%20제네레이터.md) — React + Monaco + Pyodide + OCP.wasm + R3F + Ollama(C3Dv0)

---

## 1. WebAssembly(Wasm) 한 줄 정의

**WebAssembly**는 웹 브라우저가 실행할 수 있는 **이식 가능한 바이너리 명령 형식**입니다.

| 구분 | 설명 |
|------|------|
| **무엇이 아닌가** | JavaScript를 대체하는 새 언어가 아님 |
| **무엇인가** | JS와 **함께** 동작하는 고성능 실행 계층 |
| **어디서 쓰나** | Chrome, Firefox, Safari, Edge 등 주요 브라우저 |
| **왜 쓰나** | 영상·CAD·시뮬레이션·암호화처럼 **CPU 집약** 작업을 브라우저에서 처리 |

```
[ HTML / CSS / React UI ]  ← 사용자 인터페이스 (JavaScript)
         ↕  호출·데이터 교환
[ WebAssembly 모듈 ]       ← C/C++/Rust 등으로 빌드된 고성능 엔진
```

---

## 2. 왜 JavaScript만으로는 부족한가?

웹 표준 언어인 JavaScript만으로는 **OpenCascade** 같은 대형 C++ 기반 3D 엔진의 수학·기하 연산을 그대로 재구현하기 어렵습니다.  
CADQuery 역시 내부적으로 OpenCascade(C++)에 의존합니다.

| 접근 | 특징 |
|------|------|
| **순수 JS만** | 오리지널 CADQuery 수준의 엔진을 처음부터 구현하는 것은 비현실적 |
| **Wasm 이식** | 검증된 C/C++ 라이브러리를 브라우저용 바이너리로 컴파일해 **성능·정확도** 확보 |
| **서버 우회** | 같은 엔진을 클라우드가 아닌 **사용자 PC**에서 실행 → 비용·지연·유출 리스크 감소 |

Wasm은 “웹에서 CAD를 한다”는 목표의 **공통 기반층**이고, 그 위에 Python(Pyodide)이나 JS(OpenCascade.js)를 올리는 방식이 갈립니다.

---

## 3. Wasm이 바꾸는 것 (공통 가치)

Wasm·Pyodide를 쓰는 서비스의 공통점:

> 예전에는 비싼 서버 인프라가 필요했던 연산을, **가벼운 정적 웹(HTML/JS/Wasm)** 만으로 대체할 수 있다.

| 가치 | 설명 |
|------|------|
| **비용** | 연산을 사용자 브라우저로 분산 → CAD/미디어 서버 임대 감소 |
| **지연** | 업로드·API 왕복 없이 로컬 RAM에서 재계산 |
| **프라이버시** | 도면·영상·금융 데이터가 외부 서버로 나가지 않음 |
| **배포** | `npm run build` 후 GitHub Pages·Netlify 등 **정적 호스팅** 가능 |

---

## 4. Nexia에서 자주 쓰는 Wasm 계열 (CAD 맥락)

제품 구현은 [`AI 3D 제네레이터.md`](./AI%203D%20제네레이터.md)를 따르고, 여기서는 **Wasm 기술 분기**만 정리합니다.

### 4.1 Pyodide + OCP.wasm (파이썬 + OpenCascade를 Wasm으로)

| 항목 | 내용 |
|------|------|
| **Pyodide** | CPython을 Wasm으로 이식 → 브라우저 속 “가상 파이썬 PC” |
| **OCP.wasm** | OpenCascade/CADQuery 연산용 Wasm 모듈 |
| **흐름** | Monaco의 Python → Pyodide 실행 → 메시 JSON → Three.js/R3F |
| **장점** | CADQuery·C3Dv0(파이썬) **문법 일치**; **CAD 연산**은 클라이언트(Wasm) — LLM은 [`AI 3D 제네레이터.md`](./AI%203D%20제네레이터.md) §7.1대로 **플랫폼 서버** Ollama |
| **참고** | [Pyodide](https://pyodide.org/) · [OCP.wasm](https://github.com/Yeicor/OCP.wasm) · [Yet Another CAD Viewer 논의](https://github.com/CadQuery/cadquery/discussions/1876) |

**동작 요약**

1. 접속 시 Pyodide + OCP.wasm 등 Wasm 자산을 브라우저가 다운로드  
2. Monaco에 넣은 Python이 **로컬 메모리**에서 실행  
3. 결과 3D 데이터를 JS 객체로 넘겨 Three.js가 렌더  

### 4.2 OpenCascade.js (순수 JavaScript + Wasm OCC)

| 항목 | 내용 |
|------|------|
| **핵심** | OpenCascade를 Wasm으로 포팅한 **JS API** |
| **흐름** | Monaco의 JS CAD 코드 → OpenCascade.js → Three.js |
| **장점** | Pyodide 초기 로딩 없음, React/TS만으로 통일하기 쉬움 |
| **단점** | AI가 **CadQuery(Python)** 을 출력하는 파이프와는 별도 스택 |

NEXA Nexia **권장 스택**은 Pyodide + OCP.wasm 쪽이며, 상세는 `AI 3D 제네레이터.md`를 본다.

---

## 5. Pyodide — Wasm 위에서 도는 Python

Pyodide는 Wasm 생태계의 **대표적인 상위 래퍼**입니다. “Wasm이 뭔지”를 감으로 잡은 뒤, **파이썬 생태계를 브라우저로 옮기는 방법**으로 이해하면 됩니다.

### 5.1 정체성 (흔한 오해)

| 오해 | 실제 |
|------|------|
| “파이썬을 JS로 번역” | **아님** — CPython 본체를 Wasm으로 컴파일한 것 |
| “가짜 파이썬” | **진짜 CPython** — CadQuery·NumPy 등 C 확장과 호환 목표 |

유저가 사이트에 접속하면 브라우저 안에 **파이썬이 돌아가는 미니 VM**이 하나 뜬다고 보면 됩니다.

### 5.2 JS ↔ Python 데이터 교환 (FFI)

```
[ React: 슬라이더 width = 100 ]
        ↓
[ JS ]  pyodide.globals.set('w', 100)
        ↓
[ Pyodide ]  result = cq.Workplane().box(w, 50, 20)
        ↓
[ JS ]  runPythonAsync → ToMesh → JSON
        ↓
[ Three.js / R3F ]  메시 렌더
```

전 과정이 **서버를 거치지 않고** 사용자 RAM 안에서 완료됩니다.

### 5.3 React(Vite) 연동 예제 코드

CDN 등으로 `loadPyodide()`를 불러 초기화하고, 보정값·에디터 코드를 `runPythonAsync`로 실행하는 **최소 골격**입니다.

```javascript
import React, { useState, useEffect } from 'react';

export default function CadGenerator() {
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [threeJsonData, setThreeJsonData] = useState(null);

  // 1. 웹사이트 켜지자마자 브라우저 메모리에 파이썬(Pyodide) 장착하기
  useEffect(() => {
    async function initPyodide() {
      const py = await window.loadPyodide();

      await py.loadPackage('micropip');
      const micropip = py.pyimport('micropip');

      // 실제 구현 시: 빌드된 cadquery / OCP.wasm 경로로 설치
      // await micropip.install('cadquery');

      setPyodide(py);
      setLoading(false);
    }
    initPyodide();
  }, []);

  // 2. 보정값·에디터 코드 실행
  const runCadCode = async (userWidth) => {
    if (!pyodide) return;

    pyodide.globals.set('USER_WIDTH', userWidth);

    const pythonCode = `
import cadquery as cq
import json
from cadquery.occ_impl.geom import ToMesh

final_width = USER_WIDTH - 0.4
result = (
    cq.Workplane('XY')
    .box(final_width, 50, 20)
    .faces('>Z')
    .workplane()
    .hole(10)
)
threejs_json = json.dumps(ToMesh(result))
`;

    const resultJson = await pyodide.runPythonAsync(pythonCode);
    setThreeJsonData(JSON.parse(resultJson));
  };

  return (
    <div style={{ padding: '20px' }}>
      {loading ? (
        <p>브라우저 내부에 가상 파이썬 엔진 로딩 중… (최초 약 3초)</p>
      ) : (
        <div>
          <h3>Pyodide + CadQuery 스모크 테스트</h3>
          <button type="button" onClick={() => runCadCode(100)}>
            가로 100mm 부품 생성
          </button>
        </div>
      )}
    </div>
  );
}
```

### 5.4 도입 시 점검 사항

| 항목 | 내용 |
|------|------|
| **최초 로딩** | CPython·Wasm 번들 다운로드 → 약 수 초 (이후는 로컬만) |
| **캐시** | IndexedDB·CDN 캐시로 재방문 체감 개선 |
| **Worker** | 무거운 `runPythonAsync`는 Web Worker 분리 검토 (UI 프리즈 방지) |
| **배포** | 정적 호스팅만으로 전 세계 서비스 가능 |

Monaco·R3F·Ollama와의 **전체 배선**은 `AI 3D 제네레이터.md`를 참고한다.

---

## 6. Wasm 기반 웹 서비스 예제 10선

C, C++, Rust, Go 등 **고성능 데스크톱 엔진**을 브라우저에 이식한 사례입니다.

### 1. 웹 브라우저 완결형 동영상 에디터 (예: 캡컷 웹 버전)

- **원리:** FFmpeg를 Wasm으로 변환  
- **가치:** 기가바이트 영상을 서버에 올리지 않고, 브라우저에서 자르기·붙이기·보내기  

### 2. 클라우드 기반 협업형 UI/UX 디자인 툴 (예: Figma 대항마)

- **원리:** C++ 벡터 그래픽 엔진을 Wasm 컴파일  
- **가치:** 수천 레이어도 웹에서 실시간 렌더  

### 3. 웹 브라우저 기반 복고풍 콘솔 게임 에뮬레이터

- **원리:** PS·게임보이 등 에뮬레이터 C++ → Wasm  
- **가치:** 설치 없이 URL만으로 고전 게임 실행  

### 4. 클라이언트 사이드 개인정보 보호 PDF 변환기

- **원리:** PDFium 등을 Wasm으로 구동  
- **가치:** 보안 문서가 외부 서버로 유출되지 않음  

### 5. 실시간 웹 인공지능 음악 마스터링 및 오디오 믹서

- **원리:** 오디오 DSP C++ → Wasm + Web Audio API  
- **가치:** 업로드 없이 실시간 음질 처리  

### 6. Wasm 기반 고성능 클라이언트 사이드 데이터 시각화 엔진

- **원리:** Rust 등 → Wasm, 대용량 행렬 연산  
- **가치:** 빅데이터 차트를 서버 비용 없이 3D 줌  

### 7. 인터넷 브라우저 속 가상 컴퓨터 (Web OS / 가상 에뮬레이터)

- **원리:** 리눅스·구형 Windows 환경을 Wasm으로 패키징  
- **가치:** 탭 하나에서 OS·개발 환경 체험  

### 8. 무설치 레이저 각인기 / CNC 전용 공장 CAM 제어 프로그램

- **원리:** 2D/3D 벡터 → G-Code 변환 엔진 C++ → Wasm  
- **가치:** 공장 현장 크롬 + USB로 가공 데이터 전송  

### 9. 인터넷 브라우저 기반 대규모 멀티플레이어 3D 엔진 게임

- **원리:** Unity/Unreal C++ → 웹용 Wasm  
- **가치:** 다운로드 없이 고사양 3D 게임 진입  

### 10. 온디바이스 웹 보안 암호화 및 파일 압축 해제 툴

- **원리:** LZMA·7z·암호화 라이브러리 Wasm 빌드  
- **가치:** 테라바이트급 압축을 서버 없이 브라우저에서 해제  

---

## 7. Pyodide 활용 서비스 예제 10선

**파이썬 AI·엔지니어링 생태계**를 서버 없이 웹에 올린 사례입니다. (모두 Wasm 위에서 CPython이 동작)

### 1. AI 기반 자연어 제어 2D 전개도 / 3D CAD 플랫폼

- **구조:** LLM → Pyodide에서 CadQuery → Three.js  
- **가치:** CAD 서버 비용 없이 맞춤 도면 생성 — **Nexia [`AI 3D 제네레이터.md`](./AI%203D%20제네레이터.md)**  

### 2. 웹 브라우저 완결형 데이터 사이언스 연구실 (주피터 스타일)

- **구조:** 웹 에디터 → Pandas, NumPy, Matplotlib  
- **가치:** 로컬 Python 설치 없이 표·통계 분석  

### 3. 수치 해석 기반 기계 진동 및 소음 분석 시뮬레이터

- **구조:** 수치 입력 → SciPy → 그래프  
- **가치:** 미분방정식·물리 연산을 클라이언트에서  

### 4. 수학 및 공학 교육용 실시간 함수 그래프 수식 계산기

- **구조:** 수식 텍스트 → SymPy → 기하 렌더  
- **가치:** 적분·행렬 등 즉시 시각화  

### 5. IoT 센서 원시 데이터(Raw Data) 필터링 및 전처리 뷰어

- **구조:** 로그 업로드 → Pyodide 노이즈 제거·파싱  
- **가치:** 대용량 IoT 로그를 웹에서 전처리 (**NEXA IoT와 직접 연관**)  

### 6. 금융 자산 포트폴리오 시뮬레이션 및 백테스팅 툴

- **구조:** 자산 데이터 → 파이썬 분석 → 배분률  
- **가치:** 민감 정보를 서버로 보내지 않는 몬테카를로  

### 7. 파이썬 문법 교육용 실시간 웹 에디터 및 채점 플랫폼

- **구조:** 학생 코드 → Pyodide 실행·채점  
- **가치:** Docker 샌드박스 서버 비용 절감  

### 8. 웹 브라우저 기반 알고리즘 트레이딩 전략 검증 도구

- **구조:** 매매 조건 → Pyodide가 차트 배열 고속 순회  
- **가치:** 서버리스 백테스트 UI  

### 9. 텍스트 기반 이미지/문서 파이썬 크롤러 대시보드

- **구조:** HTML/텍스트 → BeautifulSoup·`re`  
- **가치:** 부품 규격·데이터시트에서 필드만 추출  

### 10. 경량 머신러닝(Scikit-Learn) 기반 스마트 팩토리 불량률 예측 데모

- **구조:** 라인 조건 입력 → Scikit-Learn 예측  
- **가치:** 서버 없이 공장 엔지니어용 ML 데모·마케팅  

---

## 8. 정리

| 레벨 | 기술 | 역할 |
|------|------|------|
| **기반** | WebAssembly | C/C++ 등 네이티브 엔진을 브라우저에서 실행 |
| **파이썬 경로** | Pyodide + OCP.wasm | CadQuery·과학 Python 스택을 클라이언트로 |
| **JS 경로** | OpenCascade.js | OCC를 Wasm+JS API로, Pyodide 없이 CAD |
| **Nexia 제품** | 위 + React·Monaco·R3F·Ollama | → `AI 3D 제네레이터.md` |

Wasm/Pyodide 예제들의 공통 메시지는 동일합니다: **무거운 연산을 사용자 브라우저로 옮기면**, 인프라 비용·지연·데이터 유출을 동시에 줄일 수 있다.  
IoT 로그 전처리(§7-5), 공장 CAM(§6-8), AI CAD(§7-1)는 NEXA 플랫폼 방향과 특히 잘 맞는 조합이다.

---

## 참고 링크

- [WebAssembly for CAD (Medium)](https://altersquare.medium.com/webassembly-for-cad-applications-when-javascript-isnt-fast-enough-56fcdc892004)
- [Running Python in the browser (Towards Data Science)](https://towardsdatascience.com/running-python-programs-in-your-browser/)
- [CadQuery — browser discussion](https://github.com/CadQuery/cadquery/discussions/1876)
- [OCP.wasm](https://github.com/Yeicor/OCP.wasm)
- [Run Python in browsers with Pyodide (The New Stack)](https://thenewstack.io/run-real-python-in-browsers-with-pyodide-and-webassembly/)
- [Pyodide](https://pyodide.org/) · [pyodide GitHub](https://github.com/pyodide/pyodide)
- [Understanding Pyodide (Medium)](https://thamizhelango.medium.com/understanding-pyodide-from-fundamentals-to-advanced-applications-41d72150f433)
- [OpenCascade.js (Reddit)](https://www.reddit.com/r/WebAssemblyDev/comments/1ta8tes/opencascadejs_a_port_of_the_opencascade_cad/)
- [Load 3D CAD into Three.js (Medium)](https://cadexchanger.medium.com/how-to-load-3d-cad-data-into-three-js-5308b0338afb)
- [py2wasm (Wasmer)](https://wasmer.io/posts/py2wasm-a-python-to-wasm-compiler)
