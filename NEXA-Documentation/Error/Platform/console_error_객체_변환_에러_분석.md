---
errorId: "1766811365433ttj86lxbh"
errorMessage: "Cannot convert object to primitive value"
errorFile: "NEXA-Platform/src/utils/error-tracking/lintCollector.js"
errorLine: 152
errorColumn: 28
project: "Platform"
savePath: "NEXA-Documentation/Error/Platform/"
createdAt: "2024-12-20T10:30:00Z"
updatedAt: "2024-12-20T10:30:00Z"
tags: ["TypeError", "console.error", "lintCollector", "객체변환"]
status: "resolved"
---

# console.error 객체 변환 에러 분석

## 에러 개요

**에러 ID**: `1766811365433ttj86lxbh`  
**에러 타입**: `TypeError`  
**에러 메시지**: `Cannot convert object to primitive value`  
**발생 위치**: `NEXA-Platform/src/utils/error-tracking/lintCollector.js:152:28`  
**발생 횟수**: 28회  
**상태**: 해결됨

## 에러 발생 컨텍스트

### 스택 트레이스

```
TypeError: Cannot convert object to primitive value
    at Array.join (<anonymous>)
    at console.error (NEXA-Platform/src/utils/error-tracking/lintCollector.js:152:28)
    at app.config.errorHandler (NEXA-Platform/src/boot/errorTracking.js:19:13)
    at callWithErrorHandling (http://localhost:9000/node_modules/.q-cache/dev-spa/vite-spa/deps/chunk-EPASFQWC.js:2263:19)
    at handleError (http://localhost:9000/node_modules/.q-cache/dev-spa/vite-spa/deps/chunk-EPASFQWC.js:2310:7)
    at callWithErrorHandling (http://localhost:9000/node_modules/.q-cache/dev-spa/vite-spa/deps/chunk-EPASFQWC.js:2265:5)
    at setupStatefulComponent (http://localhost:9000/node_modules/.q-cache/dev-spa/vite-spa/deps/chunk-EPASFQWC.js:9983:25)
    at setupComponent (http://localhost:9000/node_modules/.q-cache/dev-spa/vite-spa/deps/chunk-EPASFQWC.js:9944:36)
    at mountComponent (http://localhost:9000/node_modules/.q-cache/dev-spa/vite-spa/deps/chunk-EPASFQWC.js:7300:7)
    at processComponent (http://localhost:9000/node_modules/.q-cache/dev-spa/vite-spa/deps/chunk-EPASFQWC.js:7266:9)
```

### 발생 환경

- **URL**: `http://localhost:9000/#/dev`
- **User Agent**: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36`
- **발생 시간**: 2024-12-20 10:30:00 (KST)

## 원인 분석

### 문제 코드

```javascript
// lintCollector.js:152
const message = args.join(' ')
```

### 원인 설명

1. **직접적인 원인**: `console.error()`에 전달된 인자 중 하나 이상이 객체인데, `Array.join()`이 이를 문자열로 변환하려고 시도할 때 발생합니다.

2. **근본 원인**: 
   - `console.error`를 오버라이드하여 ESLint 오류를 수집하는 과정에서
   - 다양한 타입의 인자(문자열, 숫자, 객체, 배열 등)가 전달될 수 있음
   - `join()` 메서드는 각 요소를 문자열로 변환하려고 시도하지만, 객체의 경우 `Symbol.toPrimitive` 또는 `valueOf()`, `toString()` 메서드가 제대로 구현되지 않으면 이 에러가 발생

3. **발생 시나리오**:
   - Vue 컴포넌트에서 에러가 발생
   - `errorHandler`가 호출되어 `console.error`에 에러 객체 전달
   - 오버라이드된 `console.error`에서 `args.join(' ')` 실행
   - 에러 객체가 primitive 값으로 변환되지 않아 TypeError 발생

## 해결 방법

### 해결 코드

```javascript
// lintCollector.js:152 수정
const message = args
  .map(arg => {
    if (arg === null || arg === undefined) {
      return String(arg)
    }
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg)
      } catch {
        return String(arg)
      }
    }
    return String(arg)
  })
  .join(' ')
```

### 해결 방법 설명

1. **안전한 변환**: 각 인자를 개별적으로 처리하여 객체를 안전하게 문자열로 변환
2. **JSON.stringify 사용**: 객체의 경우 JSON 문자열로 변환 (순환 참조 처리 포함)
3. **예외 처리**: JSON.stringify가 실패하는 경우(순환 참조 등) `String()`으로 폴백

### 대안 방법

```javascript
// 더 간단한 방법
const message = args
  .map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2)
      } catch {
        return '[Object]'
      }
    }
    return String(arg)
  })
  .join(' ')
```

## 학습 내용

### JavaScript 타입 변환

1. **Primitive 변환 규칙**:
   - `String()`: 모든 값을 문자열로 변환
   - `Number()`: 숫자로 변환 시도
   - `Boolean()`: 불린으로 변환

2. **객체의 Primitive 변환**:
   - 객체는 `Symbol.toPrimitive`, `valueOf()`, `toString()` 메서드를 통해 변환 시도
   - 이 메서드들이 제대로 구현되지 않으면 변환 실패

3. **Array.join()의 동작**:
   - 각 요소를 문자열로 변환하려고 시도
   - 변환 실패 시 TypeError 발생

### console.error 오버라이드 주의사항

1. **인자 타입 다양성**: `console.error`는 다양한 타입의 인자를 받을 수 있음
2. **원본 함수 호출**: 오버라이드 시 원본 함수도 호출해야 함
3. **에러 처리**: 오버라이드 함수 자체에서 에러가 발생하지 않도록 주의

## 참고 자료

- [MDN: Array.prototype.join()](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/join)
- [MDN: Symbol.toPrimitive](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toPrimitive)
- [MDN: Object.prototype.toString()](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Object/toString)
- [JavaScript Type Conversion](https://www.w3schools.com/js/js_type_conversion.asp)

## 관련 에러

- 동일한 패턴의 에러가 다른 위치에서도 발생할 수 있음
- `console.log`, `console.warn` 등 다른 console 메서드 오버라이드 시에도 동일한 문제 발생 가능

## 해결 상태

✅ **해결 완료** (2024-12-20)

수정된 코드가 적용되어 더 이상 발생하지 않습니다.

