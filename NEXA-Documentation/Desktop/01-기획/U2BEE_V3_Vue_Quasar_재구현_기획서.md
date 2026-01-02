# U2BEE V3 Vue + Quasar 재구현 기획서

**작성일**: 2024년 12월  
**버전**: 3.0.0  
**상태**: 기획 단계  
**프레임워크**: Vue 3 + Quasar Framework  
**대상 플랫폼**: Chrome Extension (Manifest V3)

---

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [기존 시스템 분석](#기존-시스템-분석)
3. [기술 스택](#기술-스택)
4. [기능 명세](#기능-명세)
5. [아키텍처 설계](#아키텍처-설계)
6. [UI/UX 설계](#uiux-설계)
7. [데이터 모델](#데이터-모델)
8. [개발 로드맵](#개발-로드맵)
9. [마이그레이션 계획](#마이그레이션-계획)
10. [참고 자료](#참고-자료)

---

## 프로젝트 개요

### 목적

**U2BEE V3**는 YouTube 콘텐츠 관리 Chrome 확장 프로그램을 Vue 3와 Quasar Framework로 완전히 재구현하는 프로젝트입니다.

### 목표

1. **기존 기능 100% 유지**: React 기반 V2의 모든 기능을 Vue + Quasar로 완전히 이전
2. **코드 품질 개선**: 타입 안전성, 에러 처리, 성능 최적화
3. **유지보수성 향상**: 모듈화된 구조, 명확한 아키텍처
4. **새로운 기능 추가**: 사용자 경험 개선 및 고급 기능 제공
5. **NEXA 시스템 통합**: NEXA Platform과의 원활한 연동

### 핵심 가치

- **타입 안전성**: TypeScript 100% 적용
- **반응형 디자인**: Quasar의 반응형 컴포넌트 활용
- **성능 최적화**: Vue 3 Composition API 활용
- **확장성**: 모듈화된 구조로 기능 추가 용이
- **일관성**: NEXA 디자인 시스템 준수

---

## 기존 시스템 분석

### U2BEE V2 (React 기반) 기능 목록

#### ✅ 구현 완료 기능

1. **콘텐츠 수집 및 관리**
   - YouTube/Shorts/Website 자동 수집
   - DOM 변경 감지 (MutationObserver)
   - URL 변경 감지 (popstate)
   - 채널 정보 추출
   - 비디오 정보 추출

2. **카테고리 시스템**
   - 태그 기반 카테고리 (크롬)
   - 계층형 카테고리 (웹서버)
   - 카테고리 동기화 (level 0만)
   - 카테고리 정렬 (custom, recommended, asc, desc, mostUsed, recent, recentCreated)
   - 카테고리 강조 (none, recommended, mostUsed, recent, recentCreated)
   - 카테고리 사용 통계

3. **평가 시스템**
   - Like/Dislike 평가
   - 평가 카운트 관리
   - 비호감 채널 추적

4. **북마크 및 메모**
   - 북마크 기능
   - 메모 작성 및 관리
   - 자동 메모 (번역 시)

5. **썸네일 관리**
   - 썸네일 자동 생성
   - 썸네일 저장소 관리
   - 썸네일 정리 (기간/개수/크기 기준)

6. **번역 기능**
   - 자동 번역 (리스트/평가)
   - 번역 데이터 저장
   - 번역 데이터 정리

7. **PlayBox (플레이리스트)**
   - 플레이리스트 생성/관리
   - 자동 재생
   - 예약 재생
   - 재생 모드 (single, sequence, shuffle)
   - 반복 재생
   - 비디오 상태 추적

8. **히스토리 추적**
   - 방문 히스토리 자동 저장
   - 히스토리 필터링
   - 히스토리 삭제

9. **통계 및 시각화**
   - 콘텐츠 통계
   - 카테고리 통계
   - 채널 통계
   - Sankey 다이어그램
   - Dendrogram 차트
   - 시간 분포 차트

10. **데이터 관리**
    - 백업/복원
    - 휴지통 관리
    - 영구 삭제
    - 데이터 정리 (자동/수동)
    - 스토리지 사용량 분석

11. **설정 관리**
    - 테마 설정 (gray, light, dark)
    - 콘텐츠 추적 설정
    - 자동 쇼츠 스크롤
    - 자동 스킵
    - 지연 시간 설정
    - 표시 개수 설정
    - 히스토리 추적 설정
    - 숨김 도메인 관리
    - 저장소 관리 설정
    - 번역 설정
    - 필수 설정 (카테고리/평가)
    - 탭 관리 설정

12. **UI 기능**
    - 다중 탭 인터페이스
    - 리스트/썸네일/웹진 뷰
    - 검색 및 필터링
    - 정렬 기능
    - 컨텍스트 메뉴
    - 인터랙티브 튜토리얼

#### ⚠️ 미구현 기능 (TODO)

1. **자동 정리 기능**
   - 히스토리 자동 정리 (구현 필요)
   - 휴지통 자동 정리 (구현 필요)
   - 비호감 자동 정리 (구현 필요)

2. **메시지 전파**
   - 쇼츠 핸들러 메시지 전파 방식 개선 (구현 필요)

### 기존 시스템 문제점

1. **타입 안전성**: `any` 타입 159개 사용
2. **로깅 과다**: console.log 542개 (프로덕션 포함)
3. **에러 처리 부족**: 에러 무시 및 불일치
4. **성능 문제**: 전체 스토리지 조회, 비효율적 필터링
5. **메모리 누수**: 이벤트 리스너 정리 누락
6. **데이터 일관성**: 트랜잭션 부재, 동시성 제어 부족
7. **보안 문제**: CORS 프록시 하드코딩, 입력 검증 부족
8. **코드 중복**: 반복되는 패턴들
9. **테스트 부재**: 단위/통합/E2E 테스트 없음

---

## 기술 스택

### 프론트엔드

- **Vue 3.4+**: Composition API, `<script setup>` 문법
- **Quasar Framework 2.15+**: UI 컴포넌트 프레임워크
- **TypeScript 5.3+**: 타입 안전성
- **Pinia 2.1+**: 상태 관리 (Vuex 대체)
- **Vue Router 4.2+**: 라우팅 (필요 시)

### 빌드 도구

- **Vite 5.0+**: 빌드 도구
- **@quasar/vite-plugin**: Quasar Vite 플러그인
- **TypeScript**: 타입 체킹
- **ESLint**: 코드 린팅
- **Prettier**: 코드 포맷팅

### Chrome Extension

- **Manifest V3**: 최신 확장 프로그램 API
- **Chrome Storage API**: 데이터 저장
- **Chrome Tabs API**: 탭 관리
- **Chrome Runtime API**: 메시지 통신
- **Chrome Context Menus API**: 컨텍스트 메뉴

### 유틸리티

- **lodash-es**: 유틸리티 함수
- **date-fns**: 날짜 처리
- **d3**: 데이터 시각화
- **axios**: HTTP 클라이언트 (필요 시)

### 개발 도구

- **Vitest**: 단위 테스트
- **Playwright**: E2E 테스트
- **Vue DevTools**: 디버깅
- **Chrome Extension DevTools**: 확장 프로그램 디버깅

---

## 기능 명세

### 1. 콘텐츠 수집 및 관리

#### 1.1 자동 콘텐츠 수집

**기능 설명**
- YouTube, Shorts, 일반 웹사이트에서 콘텐츠 정보 자동 수집
- DOM 변경 감지 및 URL 변경 감지
- 채널 정보, 비디오 정보 자동 추출

**구현 요구사항**
- ✅ MutationObserver를 통한 DOM 변경 감지
- ✅ popstate 이벤트를 통한 URL 변경 감지
- ✅ YouTube/Shorts/Website 페이지 타입 자동 감지
- ✅ 채널명, 비디오 ID, 제목, 설명 추출
- ✅ 수집 실패 시 재시도 로직
- ✅ 중복 수집 방지

**새로운 기능**
- 🔥 **스마트 수집**: AI 기반 콘텐츠 중요도 판단
- 🔥 **수집 예약**: 특정 시간에 콘텐츠 수집 예약
- 🔥 **수집 히스토리**: 수집 실패 이력 추적

#### 1.2 콘텐츠 저장 및 관리

**기능 설명**
- 수집된 콘텐츠를 스토리지에 저장
- 콘텐츠 검색, 필터링, 정렬
- 콘텐츠 수정 및 삭제

**구현 요구사항**
- ✅ 세션 스토리지 (임시 데이터)
- ✅ 로컬 스토리지 (영구 데이터)
- ✅ 동기화 스토리지 (설정 및 카테고리)
- ✅ 페이지네이션 지원
- ✅ 검색 및 필터링
- ✅ 다중 정렬 옵션

**새로운 기능**
- 🔥 **스마트 태깅**: AI 기반 자동 태그 추천
- 🔥 **콘텐츠 그룹화**: 유사 콘텐츠 자동 그룹화
- 🔥 **콘텐츠 분석**: 콘텐츠 품질 점수 제공

### 2. 카테고리 시스템

#### 2.1 카테고리 관리

**기능 설명**
- 태그 기반 카테고리 생성/수정/삭제
- 카테고리 정렬 및 강조
- 카테고리 사용 통계

**구현 요구사항**
- ✅ 크롬: 단순 태그 (level 0)
- ✅ 웹서버: 계층형 구조 (다중 레벨)
- ✅ 카테고리 동기화 (level 0만)
- ✅ 카테고리 정렬 (custom, recommended, asc, desc, mostUsed, recent, recentCreated)
- ✅ 카테고리 강조 (none, recommended, mostUsed, recent, recentCreated)
- ✅ 카테고리 색상 및 아이콘
- ✅ 카테고리 사용 통계

**새로운 기능**
- 🔥 **스마트 카테고리**: AI 기반 카테고리 추천
- 🔥 **카테고리 템플릿**: 자주 사용하는 카테고리 조합 저장
- 🔥 **카테고리 자동 병합**: 유사 카테고리 자동 병합 제안
- 🔥 **카테고리 분석**: 카테고리별 콘텐츠 트렌드 분석

#### 2.2 카테고리 동기화

**기능 설명**
- 크롬과 웹서버 간 카테고리 동기화
- UUID 기반 식별자 관리
- 동기화 충돌 해결

**구현 요구사항**
- ✅ level 0 카테고리만 동기화
- ✅ UUID 기반 식별자
- ✅ 동기화 상태 추적
- ✅ 충돌 해결 로직

**새로운 기능**
- 🔥 **실시간 동기화**: WebSocket 기반 실시간 동기화
- 🔥 **동기화 히스토리**: 동기화 이력 추적
- 🔥 **자동 충돌 해결**: AI 기반 충돌 자동 해결

### 3. 평가 시스템

#### 3.1 콘텐츠 평가

**기능 설명**
- Like/Dislike 평가
- 평가 카운트 관리
- 평가 히스토리 추적

**구현 요구사항**
- ✅ Like/Dislike 평가
- ✅ 평가 카운트 증가/감소
- ✅ 평가 히스토리 저장
- ✅ 평가 통계

**새로운 기능**
- 🔥 **5점 평가 시스템**: Like/Dislike 외에 1-5점 평가 추가
- 🔥 **평가 이유**: 평가 이유 작성 및 분석
- 🔥 **평가 추천**: AI 기반 평가 추천
- 🔥 **평가 통계 대시보드**: 평가 트렌드 시각화

#### 3.2 비호감 채널 관리

**기능 설명**
- 비호감 채널 추적
- 비호감 채널 자동 필터링
- 비호감 통계

**구현 요구사항**
- ✅ 비호감 채널 저장
- ✅ 비호감 채널 목록 조회
- ✅ 비호감 채널 자동 정리 (설정 기반)

**새로운 기능**
- 🔥 **비호감 이유 분석**: 비호감 이유 카테고리화
- 🔥 **비호감 해제 알림**: 일정 기간 후 비호감 해제 제안

### 4. 북마크 및 메모

#### 4.1 북마크 기능

**기능 설명**
- 콘텐츠 북마크 추가/제거
- 북마크된 콘텐츠 목록
- 북마크 통계

**구현 요구사항**
- ✅ 북마크 추가/제거
- ✅ 북마크된 콘텐츠 필터링
- ✅ 북마크 통계

**새로운 기능**
- 🔥 **북마크 폴더**: 북마크를 폴더로 관리
- 🔥 **북마크 태그**: 북마크에 태그 추가
- 🔥 **북마크 공유**: 북마크 공유 기능

#### 4.2 메모 기능

**기능 설명**
- 콘텐츠에 메모 작성
- 메모 검색 및 필터링
- 자동 메모 (번역 시)

**구현 요구사항**
- ✅ 메모 작성/수정/삭제
- ✅ 메모 검색
- ✅ 자동 메모 (번역 시)

**새로운 기능**
- 🔥 **리치 텍스트 메모**: 마크다운 지원
- 🔥 **메모 템플릿**: 자주 사용하는 메모 템플릿
- 🔥 **메모 AI 요약**: 긴 메모 자동 요약
- 🔥 **메모 태그**: 메모에 태그 추가

### 5. 썸네일 관리

#### 5.1 썸네일 생성 및 저장

**기능 설명**
- 콘텐츠 썸네일 자동 생성
- 썸네일 저장소 관리
- 썸네일 정리

**구현 요구사항**
- ✅ 썸네일 자동 생성
- ✅ 썸네일 저장소 관리
- ✅ 썸네일 정리 (기간/개수/크기 기준)
- ✅ 썸네일 통계

**새로운 기능**
- 🔥 **썸네일 캐싱**: CDN 기반 썸네일 캐싱
- 🔥 **썸네일 품질 설정**: 썸네일 품질 선택 가능
- 🔥 **썸네일 자동 업데이트**: 오래된 썸네일 자동 갱신

### 6. 번역 기능

#### 6.1 자동 번역

**기능 설명**
- 콘텐츠 제목/설명 자동 번역
- 번역 데이터 저장
- 번역 설정

**구현 요구사항**
- ✅ 자동 번역 (리스트/평가)
- ✅ 번역 데이터 저장
- ✅ 번역 데이터 정리
- ✅ 번역 설정

**새로운 기능**
- 🔥 **다중 언어 지원**: 여러 언어 동시 번역
- 🔥 **번역 품질 평가**: 번역 품질 점수 제공
- 🔥 **번역 히스토리**: 번역 이력 추적
- 🔥 **번역 커스터마이징**: 번역 스타일 설정

### 7. PlayBox (플레이리스트)

#### 7.1 플레이리스트 관리

**기능 설명**
- 플레이리스트 생성/수정/삭제
- 플레이리스트 아이템 관리
- 플레이리스트 가져오기/내보내기

**구현 요구사항**
- ✅ 플레이리스트 CRUD
- ✅ 플레이리스트 아이템 추가/제거/재정렬
- ✅ 플레이리스트 가져오기/내보내기
- ✅ 플레이리스트 통계

**새로운 기능**
- 🔥 **스마트 플레이리스트**: AI 기반 플레이리스트 추천
- 🔥 **플레이리스트 템플릿**: 자주 사용하는 플레이리스트 템플릿
- 🔥 **플레이리스트 공유**: 플레이리스트 공유 기능
- 🔥 **플레이리스트 분석**: 플레이리스트 재생 패턴 분석

#### 7.2 재생 제어

**기능 설명**
- 자동 재생
- 예약 재생
- 재생 모드 (single, sequence, shuffle)
- 반복 재생

**구현 요구사항**
- ✅ 자동 재생
- ✅ 예약 재생
- ✅ 재생 모드 선택
- ✅ 반복 재생
- ✅ 비디오 상태 추적

**새로운 기능**
- 🔥 **재생 속도 조절**: 재생 속도 자동 조절
- 🔥 **스마트 스킵**: AI 기반 자동 스킵
- 🔥 **재생 통계**: 재생 패턴 분석
- 🔥 **재생 알림**: 재생 시작/종료 알림

### 8. 히스토리 추적

#### 8.1 히스토리 관리

**기능 설명**
- 방문 히스토리 자동 저장
- 히스토리 필터링 및 검색
- 히스토리 삭제 및 정리

**구현 요구사항**
- ✅ 히스토리 자동 저장
- ✅ 히스토리 필터링
- ✅ 히스토리 검색
- ✅ 히스토리 삭제
- ✅ 히스토리 자동 정리 (설정 기반)

**새로운 기능**
- 🔥 **히스토리 분석**: 방문 패턴 분석
- 🔥 **히스토리 시각화**: 히스토리 타임라인
- 🔥 **히스토리 통계**: 히스토리 통계 대시보드

### 9. 통계 및 시각화

#### 9.1 통계 기능

**기능 설명**
- 콘텐츠 통계
- 카테고리 통계
- 채널 통계
- 평가 통계

**구현 요구사항**
- ✅ 콘텐츠 통계 (개수, 타입별 분포)
- ✅ 카테고리 통계 (사용 빈도, 트렌드)
- ✅ 채널 통계 (인기 채널, 평가 분포)
- ✅ 평가 통계 (Like/Dislike 비율)
- ✅ 시간 분포 통계

**새로운 기능**
- 🔥 **AI 인사이트**: AI 기반 통계 인사이트
- 🔥 **예측 분석**: 콘텐츠 트렌드 예측
- 🔥 **비교 분석**: 기간별 비교 분석
- 🔥 **실시간 통계**: 실시간 통계 업데이트

#### 9.2 시각화

**기능 설명**
- Sankey 다이어그램
- Dendrogram 차트
- 시간 분포 차트
- 통계 대시보드

**구현 요구사항**
- ✅ Sankey 다이어그램 (카테고리-채널 관계)
- ✅ Dendrogram 차트 (계층 구조)
- ✅ 시간 분포 차트
- ✅ 통계 대시보드

**새로운 기능**
- 🔥 **인터랙티브 차트**: 사용자 상호작용 가능한 차트
- 🔥 **차트 커스터마이징**: 차트 스타일 커스터마이징
- 🔥 **차트 공유**: 차트 이미지 내보내기
- 🔥 **3D 시각화**: 3D 차트 지원

### 10. 데이터 관리

#### 10.1 백업 및 복원

**기능 설명**
- 데이터 백업
- 데이터 복원
- 백업 히스토리

**구현 요구사항**
- ✅ 데이터 백업 (JSON 파일)
- ✅ 데이터 복원
- ✅ 백업 히스토리
- ✅ 선택적 백업 (카테고리/콘텐츠/히스토리)

**새로운 기능**
- 🔥 **클라우드 백업**: 클라우드 스토리지 연동
- 🔥 **자동 백업**: 주기적 자동 백업
- 🔥 **백업 암호화**: 백업 파일 암호화
- 🔥 **백업 비교**: 백업 간 차이점 비교

#### 10.2 휴지통 관리

**기능 설명**
- 휴지통으로 이동
- 휴지통에서 복원
- 휴지통 비우기
- 영구 삭제

**구현 요구사항**
- ✅ 휴지통으로 이동
- ✅ 휴지통에서 복원
- ✅ 휴지통 비우기
- ✅ 영구 삭제
- ✅ 휴지통 자동 정리 (설정 기반)

**새로운 기능**
- 🔥 **휴지통 분석**: 휴지통 사용 패턴 분석
- 🔥 **삭제 예측**: 자주 삭제되는 콘텐츠 유형 분석

#### 10.3 데이터 정리

**기능 설명**
- 자동 데이터 정리
- 수동 데이터 정리
- 정리 설정

**구현 요구사항**
- ✅ 자동 정리 (크론 작업)
- ✅ 수동 정리
- ✅ 정리 설정 (기간/개수/크기)
- ✅ 정리 히스토리

**새로운 기능**
- 🔥 **스마트 정리**: AI 기반 정리 추천
- 🔥 **정리 미리보기**: 정리 전 미리보기
- 🔥 **정리 스케줄**: 정리 스케줄 설정

#### 10.4 스토리지 분석

**기능 설명**
- 스토리지 사용량 분석
- 스토리지 최적화 제안
- 스토리지 통계

**구현 요구사항**
- ✅ 스토리지 사용량 조회
- ✅ 타입별 사용량 분석
- ✅ 스토리지 통계

**새로운 기능**
- 🔥 **스토리지 예측**: 스토리지 사용량 예측
- 🔥 **자동 최적화**: 스토리지 자동 최적화
- 🔥 **스토리지 알림**: 스토리지 부족 알림

### 11. 설정 관리

#### 11.1 일반 설정

**기능 설명**
- 테마 설정
- 언어 설정
- 알림 설정

**구현 요구사항**
- ✅ 테마 설정 (gray, light, dark)
- ✅ 언어 설정
- ✅ 알림 설정

**새로운 기능**
- 🔥 **커스텀 테마**: 사용자 정의 테마 생성
- 🔥 **다크 모드 자동 전환**: 시간대별 자동 전환
- 🔥 **설정 프로필**: 여러 설정 프로필 관리

#### 11.2 콘텐츠 추적 설정

**기능 설명**
- 콘텐츠 추적 활성화/비활성화
- 추적 대상 설정
- 추적 주기 설정

**구현 요구사항**
- ✅ 콘텐츠 추적 활성화/비활성화
- ✅ 추적 대상 설정
- ✅ 추적 주기 설정

**새로운 기능**
- 🔥 **스마트 추적**: AI 기반 추적 최적화
- 🔥 **추적 통계**: 추적 패턴 분석

#### 11.3 저장소 관리 설정

**기능 설명**
- 저장소 정리 설정
- 저장소 제한 설정
- 자동 정리 설정

**구현 요구사항**
- ✅ 저장소 정리 설정 (히스토리/비호감/휴지통/썸네일/번역)
- ✅ 저장소 제한 설정 (개수/기간/크기)
- ✅ 자동 정리 설정

**새로운 기능**
- 🔥 **스마트 제한**: AI 기반 제한 추천
- 🔥 **저장소 알림**: 저장소 부족 알림

### 12. UI 기능

#### 12.1 다중 탭 인터페이스

**기능 설명**
- 평가, 리스트, 플레이박스, 히스토리, 통계, 데이터, 설정, 정보 탭
- 탭 전환 및 상태 저장

**구현 요구사항**
- ✅ 다중 탭 인터페이스
- ✅ 탭 전환
- ✅ 탭 상태 저장

**새로운 기능**
- 🔥 **커스텀 탭**: 사용자 정의 탭 추가
- 🔥 **탭 그룹**: 탭 그룹화
- 🔥 **탭 단축키**: 탭 전환 단축키

#### 12.2 뷰 모드

**기능 설명**
- 리스트 뷰
- 썸네일 뷰
- 웹진 뷰

**구현 요구사항**
- ✅ 리스트 뷰
- ✅ 썸네일 뷰
- ✅ 웹진 뷰
- ✅ 뷰 모드 전환

**새로운 기능**
- 🔥 **그리드 뷰**: 커스터마이징 가능한 그리드 뷰
- 🔥 **타임라인 뷰**: 시간순 타임라인 뷰
- 🔥 **맵 뷰**: 지도 기반 뷰 (채널 위치)

#### 12.3 검색 및 필터링

**기능 설명**
- 콘텐츠 검색
- 고급 필터링
- 정렬 기능

**구현 요구사항**
- ✅ 콘텐츠 검색
- ✅ 필터링 (타입, 카테고리, 평가, 날짜)
- ✅ 정렬 (제목, 날짜, 평가 등)

**새로운 기능**
- 🔥 **AI 검색**: 자연어 검색
- 🔥 **검색 제안**: 검색어 자동 완성
- 🔥 **검색 히스토리**: 검색 이력 저장
- 🔥 **저장된 검색**: 검색 조건 저장

#### 12.4 컨텍스트 메뉴

**기능 설명**
- 우클릭 컨텍스트 메뉴
- 빠른 작업 메뉴

**구현 요구사항**
- ✅ 우클릭 컨텍스트 메뉴
- ✅ 빠른 작업 메뉴

**새로운 기능**
- 🔥 **커스텀 메뉴**: 사용자 정의 메뉴 항목
- 🔥 **메뉴 단축키**: 메뉴 항목 단축키

### 13. 새로운 기능 (추가 제안)

#### 13.1 클라우드 동기화

**기능 설명**
- NEXA Platform과의 클라우드 동기화
- 다중 디바이스 지원
- 실시간 동기화

**구현 요구사항**
- ✅ WebSocket 기반 실시간 동기화
- ✅ 다중 디바이스 지원
- ✅ 동기화 충돌 해결
- ✅ 오프라인 모드 지원

#### 13.2 AI 기능

**기능 설명**
- AI 기반 콘텐츠 추천
- AI 기반 자동 태깅
- AI 기반 콘텐츠 분석

**구현 요구사항**
- ✅ 콘텐츠 추천 알고리즘
- ✅ 자동 태깅 시스템
- ✅ 콘텐츠 분석 엔진

#### 13.3 소셜 기능

**기능 설명**
- 플레이리스트 공유
- 카테고리 공유
- 통계 공유

**구현 요구사항**
- ✅ 플레이리스트 공유
- ✅ 카테고리 공유
- ✅ 통계 공유
- ✅ 공유 링크 생성

#### 13.4 알림 시스템

**기능 설명**
- 재생 알림
- 정리 알림
- 동기화 알림

**구현 요구사항**
- ✅ 브라우저 알림
- ✅ 알림 설정
- ✅ 알림 히스토리

#### 13.5 단축키 지원

**기능 설명**
- 전역 단축키
- 컨텍스트 단축키
- 커스텀 단축키

**구현 요구사항**
- ✅ 전역 단축키
- ✅ 컨텍스트 단축키
- ✅ 커스텀 단축키 설정

#### 13.6 내보내기/가져오기

**기능 설명**
- 다양한 형식으로 내보내기
- 다양한 형식에서 가져오기
- 일괄 작업

**구현 요구사항**
- ✅ JSON 내보내기/가져오기
- ✅ CSV 내보내기/가져오기
- ✅ Excel 내보내기/가져오기
- ✅ 일괄 작업

---

## 아키텍처 설계

### 전체 구조

```
┌─────────────────────────────────────────────────────────┐
│                    Chrome Extension                      │
│                    (Manifest V3)                        │
└──────────────┬──────────────────────────────────────────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───▼───┐ ┌───▼───┐ ┌───▼──────────┐
│Popup  │ │Content│ │Background    │
│(Vue)  │ │Script │ │(Service      │
│       │ │       │ │ Worker)      │
└───┬───┘ └───┬───┘ └───┬──────────┘
    │         │         │
    │    ┌────▼────┐    │
    │    │Message  │    │
    │    │Handler  │    │
    │    └────┬────┘    │
    │         │         │
┌───▼─────────▼─────────▼──────────┐
│         Core Services             │
│  - Storage Manager                │
│  - Data Handler                   │
│  - Category Manager               │
│  - PlayBox Manager               │
│  - Cleanup Manager                │
│  - Sync Manager                   │
└──────────────┬────────────────────┘
               │
┌──────────────▼────────────────────┐
│      Chrome Storage API            │
│  - chrome.storage.local            │
│  - chrome.storage.sync             │
│  - chrome.storage.session          │
└────────────────────────────────────┘
```

### 컴포넌트 구조

#### 1. Popup (Vue 3 + Quasar)

```
src/
├── popup/
│   ├── App.vue                    # 루트 컴포넌트
│   ├── main.ts                    # 진입점
│   ├── layouts/
│   │   ├── MainLayout.vue        # 메인 레이아웃
│   │   └── TabLayout.vue         # 탭 레이아웃
│   ├── pages/
│   │   ├── RatingPage.vue        # 평가 페이지
│   │   ├── ListPage.vue          # 리스트 페이지
│   │   ├── PlayBoxPage.vue       # 플레이박스 페이지
│   │   ├── HistoryPage.vue       # 히스토리 페이지
│   │   ├── StatisticsPage.vue   # 통계 페이지
│   │   ├── DataPage.vue         # 데이터 페이지
│   │   ├── ConfigPage.vue        # 설정 페이지
│   │   └── AboutPage.vue        # 정보 페이지
│   ├── components/
│   │   ├── common/               # 공통 컴포넌트
│   │   ├── content/              # 콘텐츠 컴포넌트
│   │   ├── category/             # 카테고리 컴포넌트
│   │   ├── playbox/              # 플레이박스 컴포넌트
│   │   ├── statistics/            # 통계 컴포넌트
│   │   └── charts/               # 차트 컴포넌트
│   ├── stores/                   # Pinia 스토어
│   │   ├── content.ts            # 콘텐츠 스토어
│   │   ├── category.ts           # 카테고리 스토어
│   │   ├── playbox.ts            # 플레이박스 스토어
│   │   ├── settings.ts           # 설정 스토어
│   │   └── statistics.ts         # 통계 스토어
│   ├── composables/              # Composable 함수
│   │   ├── useContent.ts         # 콘텐츠 관련
│   │   ├── useCategory.ts        # 카테고리 관련
│   │   ├── usePlayBox.ts         # 플레이박스 관련
│   │   └── useStorage.ts         # 스토리지 관련
│   ├── services/                 # 서비스 레이어
│   │   ├── messageService.ts    # 메시지 서비스
│   │   ├── storageService.ts    # 스토리지 서비스
│   │   └── syncService.ts       # 동기화 서비스
│   ├── types/                    # TypeScript 타입
│   │   ├── content.ts
│   │   ├── category.ts
│   │   ├── playbox.ts
│   │   └── settings.ts
│   └── utils/                    # 유틸리티
│       ├── helpers.ts
│       ├── validators.ts
│       └── formatters.ts
```

#### 2. Content Script

```
src/
├── content/
│   ├── content.ts                # 진입점
│   ├── collectors/
│   │   ├── ContentCollector.ts  # 콘텐츠 수집기
│   │   ├── YoutubeCollector.ts  # YouTube 수집기
│   │   ├── ShortsCollector.ts   # Shorts 수집기
│   │   └── WebsiteCollector.ts  # Website 수집기
│   ├── handlers/
│   │   ├── PlayBoxHandler.ts    # PlayBox 핸들러
│   │   ├── ShortsHandler.ts     # Shorts 핸들러
│   │   └── ContextMenuHandler.ts # 컨텍스트 메뉴 핸들러
│   ├── services/
│   │   └── MessageService.ts   # 메시지 서비스
│   └── utils/
│       └── DOMUtils.ts          # DOM 유틸리티
```

#### 3. Background (Service Worker)

```
src/
├── background/
│   ├── background.ts            # 진입점
│   ├── handlers/
│   │   ├── MessageHandler.ts   # 메시지 핸들러
│   │   └── EventHandler.ts     # 이벤트 핸들러
│   ├── managers/
│   │   ├── StorageManager.ts   # 스토리지 매니저
│   │   ├── DataManager.ts     # 데이터 매니저
│   │   ├── CategoryManager.ts # 카테고리 매니저
│   │   ├── PlayBoxManager.ts  # 플레이박스 매니저
│   │   ├── CleanupManager.ts  # 정리 매니저
│   │   ├── SyncManager.ts     # 동기화 매니저
│   │   └── ThumbnailManager.ts # 썸네일 매니저
│   ├── services/
│   │   ├── CronService.ts      # 크론 서비스
│   │   └── SyncService.ts     # 동기화 서비스
│   └── utils/
│       └── helpers.ts          # 유틸리티
```

### 데이터 흐름

```
1. Content Script
   └─> 콘텐츠 수집
       └─> MessageHandler.sendToBackground()
           └─> Background: MessageHandler
               └─> DataManager.saveTempContent()
                   └─> StorageManager.save()
                       └─> chrome.storage.session

2. Popup
   └─> 사용자 액션
       └─> Store Action
           └─> MessageService.sendMessage()
               └─> Background: MessageHandler
                   └─> Manager 처리
                       └─> StorageManager
                           └─> chrome.storage
                               └─> Store Mutation
                                   └─> UI 업데이트
```

### 상태 관리 (Pinia)

```typescript
// stores/content.ts
export const useContentStore = defineStore('content', () => {
  const contents = ref<Content[]>([])
  const currentContent = ref<Content | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchContents = async () => {
    // ...
  }

  const saveContent = async (content: Content) => {
    // ...
  }

  return {
    contents,
    currentContent,
    loading,
    error,
    fetchContents,
    saveContent
  }
})
```

---

## UI/UX 설계

### 디자인 원칙

1. **NEXA 디자인 시스템 준수**
   - NEXA 색상 팔레트 사용
   - NEXA 타이포그래피 사용
   - NEXA 컴포넌트 스타일 준수

2. **Quasar 컴포넌트 활용**
   - Quasar 기본 컴포넌트 최대한 활용
   - 커스터마이징은 최소화
   - 일관된 UI/UX 제공

3. **반응형 디자인**
   - 다양한 팝업 크기 지원
   - 모바일 친화적 (필요 시)

4. **접근성**
   - 키보드 네비게이션 지원
   - 스크린 리더 지원
   - 색상 대비 준수

### 주요 화면

#### 1. 평가 페이지 (Rating)

```
┌─────────────────────────────────────┐
│ [로고] U2BEE          [테마] [설정] │
├─────────────────────────────────────┤
│ [평가] [리스트] [플레이박스] [히스토리] │
├─────────────────────────────────────┤
│                                     │
│  현재 콘텐츠 정보                    │
│  ┌─────────────────────────────┐   │
│  │ [썸네일] 제목                │   │
│  │         채널명                │   │
│  │         URL                  │   │
│  └─────────────────────────────┘   │
│                                     │
│  카테고리 선택                       │
│  [태그1] [태그2] [+ 추가]           │
│                                     │
│  평가                                │
│  [👍 Like] [👎 Dislike]            │
│                                     │
│  메모                                │
│  [메모 입력란...]                    │
│                                     │
│  [저장] [취소]                      │
│                                     │
└─────────────────────────────────────┘
```

#### 2. 리스트 페이지 (List)

```
┌─────────────────────────────────────┐
│ [로고] U2BEE          [테마] [설정] │
├─────────────────────────────────────┤
│ [평가] [리스트] [플레이박스] [히스토리] │
├─────────────────────────────────────┤
│ [YouTube] [Shorts] [Website]      │
│ [검색...] [필터] [정렬] [뷰 모드]   │
├─────────────────────────────────────┤
│                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │썸네일│ │썸네일│ │썸네일│ │썸네일│      │
│  │제목 │ │제목 │ │제목 │ │제목 │      │
│  │채널 │ │채널 │ │채널 │ │채널 │      │
│  └────┘ └────┘ └────┘ └────┘      │
│                                     │
│  [이전] [1] [2] [3] [다음]         │
│                                     │
└─────────────────────────────────────┘
```

#### 3. 플레이박스 페이지 (PlayBox)

```
┌─────────────────────────────────────┐
│ [로고] U2BEE          [테마] [설정] │
├─────────────────────────────────────┤
│ [평가] [리스트] [플레이박스] [히스토리] │
├─────────────────────────────────────┤
│                                     │
│  현재 재생                            │
│  ┌─────────────────────────────┐   │
│  │ [썸네일] 제목                │   │
│  │         채널명                │   │
│  │         [재생바]              │   │
│  │         [◀] [▶] [⏸] [▶▶]    │   │
│  └─────────────────────────────┘   │
│                                     │
│  플레이리스트                         │
│  ┌─────────────────────────────┐   │
│  │ 1. 제목 - 채널명             │   │
│  │ 2. 제목 - 채널명             │   │
│  │ 3. 제목 - 채널명             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [재생 모드] [반복] [예약]          │
│                                     │
└─────────────────────────────────────┘
```

### Quasar 컴포넌트 활용

- **QLayout**: 레이아웃 구조
- **QPage**: 페이지 컨테이너
- **QToolbar**: 툴바
- **QTabs**: 탭 네비게이션
- **QCard**: 카드 컴포넌트
- **QList**: 리스트 컴포넌트
- **QTable**: 테이블 컴포넌트
- **QInput**: 입력 컴포넌트
- **QSelect**: 선택 컴포넌트
- **QBtn**: 버튼 컴포넌트
- **QDialog**: 다이얼로그
- **QMenu**: 메뉴
- **QTooltip**: 툴팁
- **QSpinner**: 로딩 스피너
- **QSeparator**: 구분선
- **QSpace**: 공간
- **QIcon**: 아이콘

---

## 데이터 모델

### 타입 정의

```typescript
// types/content.ts
export interface Content {
  contentId: string
  pageType: 'youtube' | 'shorts' | 'website'
  title: string
  url: string
  categories: string[]
  rating: 'like' | 'dislike' | null
  ratingCount: number
  memo?: string
  videoId?: string
  channelName?: string
  publisher?: string
  thumbnail?: string
  contentUpdateAt: number
  categoryUpdateAt: number
  bookmarkedAt?: number
  deletedAt?: number
  timestamp: number
}

// types/category.ts
export interface Category {
  id: string
  createPlatform: 'chrome' | 'python' | 'web'
  type: 'tag' | 'folder'
  name: string
  sort: number
  level: 0
  parentId?: string
  color?: string
  icon?: string
  createdAt: number
  updatedAt: number
  lastSyncAt?: number
  syncSource: 'chrome' | 'python' | 'web' | null
  isRecommended?: boolean
  isNew?: boolean
  newExpiryDate?: number
}

// types/playbox.ts
export interface PlaylistItem {
  contentId: string
  title: string
  url: string
  thumbnail?: string
  duration?: number
  order: number
}

export interface Playlist {
  id: string
  name: string
  items: PlaylistItem[]
  createdAt: number
  updatedAt: number
}

export interface PlayBoxState {
  currentPlaylist: string | null
  currentItem: PlaylistItem | null
  currentTabId: number | null
  isPlaying: boolean
  playMode: 'single' | 'sequence' | 'shuffle'
  repeat: boolean
  playlists: Record<string, Playlist>
  schedules: PlayScheduleItem[]
}

// types/settings.ts
export interface Settings {
  theme: 'gray' | 'light' | 'dark'
  contentTracking: {
    enabled: boolean
  }
  autoShorts: boolean
  autoSkip: boolean
  skipStrength: number
  delayTimeYoutube: number
  delayTimeShorts: number
  delayTimeWebsite: number
  listDisplayCount: number
  historyDisplayCount: number
  showCategoryColor: boolean
  showCategoryIcon: boolean
  historyTracking: {
    enabled: boolean
    privacyMode: boolean
    autoLockTime: number
  }
  hiddenDomains: HiddenDomain[]
  storageManagement: StorageManagementConfig
  historyAutoDelete: boolean
  trashAutoDelete: boolean
  dislikeAutoDelete: boolean
  translation: {
    autoTranslate: boolean
    ratingTranslation: boolean
    autoMemo: boolean
  }
  requiredSettings: {
    categoryRequired: boolean
    ratingRequired: boolean
  }
  tabManagement: {
    reuseExisting: boolean
    focusNewTab: boolean
    autoPlay: boolean
    autoPlayDelay: number
  }
  cateNewMarkDuration: number
  cateSortHighlightCount: number
  cateEmphasisHighlightCount: number
  categorySort: {
    type: CategorySortType
  }
  categoryEmphasis: {
    type: EmphasisType
  }
}
```

### 스토리지 키 구조

```typescript
// 스토리지 키 상수
export const StorageKeys = {
  // chrome.storage.local
  CONTENT: 'U2_Content_',        // U2_Content_[contentId]
  HISTORY: 'U2_History_',        // U2_History_[contentId]
  STATISTICS: 'U2_Statistics',  // 전체 통계 정보
  
  // chrome.storage.sync
  SETTINGS: 'U2_Settings',       // 사용자 설정
  CATEGORY: 'U2_Category_',      // U2_Category_[categoryId]
  CATEGORY_USAGE: 'U2_CategoryUsage', // 카테고리 사용 통계
  
  // chrome.storage.session
  TEMP: 'U2_Temp_',              // U2_Temp_[windowId]_[tabId]
  
  // PlayBox
  PLAYBOX: 'U2_PlayBox_',        // U2_PlayBox_[playlistId]
  PLAYBOX_STATE: 'U2_PlayBoxState', // PlayBox 상태
} as const
```

---

## 개발 로드맵

### Phase 1: 프로젝트 설정 및 기반 구조 (2주)

#### 1.1 프로젝트 초기 설정
- [ ] Vue 3 + Quasar 프로젝트 생성
- [ ] TypeScript 설정
- [ ] Vite 빌드 설정
- [ ] ESLint/Prettier 설정
- [ ] Git 저장소 설정

#### 1.2 Chrome Extension 구조 설정
- [ ] Manifest V3 설정
- [ ] Popup, Content Script, Background 구조 생성
- [ ] 빌드 스크립트 설정
- [ ] 개발 환경 설정

#### 1.3 핵심 서비스 구현
- [ ] StorageManager 구현
- [ ] MessageService 구현
- [ ] DataManager 구현
- [ ] 타입 정의

### Phase 2: 기본 기능 구현 (4주)

#### 2.1 콘텐츠 수집 및 관리
- [ ] ContentCollector 구현
- [ ] YouTube/Shorts/Website 수집기 구현
- [ ] 콘텐츠 저장 로직 구현
- [ ] 콘텐츠 조회 로직 구현

#### 2.2 카테고리 시스템
- [ ] 카테고리 CRUD 구현
- [ ] 카테고리 정렬/강조 구현
- [ ] 카테고리 동기화 구현
- [ ] 카테고리 UI 컴포넌트

#### 2.3 평가 시스템
- [ ] 평가 저장 로직 구현
- [ ] 평가 UI 컴포넌트
- [ ] 비호감 채널 관리

#### 2.4 기본 UI 구현
- [ ] 메인 레이아웃
- [ ] 탭 네비게이션
- [ ] 평가 페이지
- [ ] 리스트 페이지

### Phase 3: 고급 기능 구현 (4주)

#### 3.1 PlayBox 구현
- [ ] PlayBoxManager 구현
- [ ] 플레이리스트 CRUD
- [ ] 재생 제어 로직
- [ ] 예약 재생 기능
- [ ] PlayBox UI

#### 3.2 히스토리 및 통계
- [ ] 히스토리 추적 구현
- [ ] 통계 계산 로직
- [ ] 차트 시각화
- [ ] 통계 페이지

#### 3.3 데이터 관리
- [ ] 백업/복원 기능
- [ ] 휴지통 관리
- [ ] 데이터 정리 기능
- [ ] 스토리지 분석

#### 3.4 썸네일 및 번역
- [ ] 썸네일 관리자 구현
- [ ] 번역 기능 구현
- [ ] 썸네일/번역 정리

### Phase 4: UI/UX 개선 및 최적화 (3주)

#### 4.1 UI 개선
- [ ] Quasar 컴포넌트 적용
- [ ] 반응형 디자인
- [ ] 다크 모드 지원
- [ ] 애니메이션 추가

#### 4.2 UX 개선
- [ ] 로딩 상태 처리
- [ ] 에러 처리 및 표시
- [ ] 사용자 피드백
- [ ] 접근성 개선

#### 4.3 성능 최적화
- [ ] 코드 스플리팅
- [ ] 지연 로딩
- [ ] 메모이제이션
- [ ] 스토리지 최적화

### Phase 5: 새로운 기능 구현 (4주)

#### 5.1 클라우드 동기화
- [ ] SyncManager 구현
- [ ] WebSocket 통신
- [ ] 동기화 충돌 해결
- [ ] 오프라인 모드

#### 5.2 AI 기능 (선택적)
- [ ] AI 추천 시스템
- [ ] 자동 태깅
- [ ] 콘텐츠 분석

#### 5.3 소셜 기능
- [ ] 공유 기능
- [ ] 공유 링크 생성
- [ ] 공유 관리

#### 5.4 알림 및 단축키
- [ ] 알림 시스템
- [ ] 전역 단축키
- [ ] 커스텀 단축키

### Phase 6: 테스트 및 문서화 (2주)

#### 6.1 테스트
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] E2E 테스트 작성
- [ ] 성능 테스트

#### 6.2 문서화
- [ ] API 문서 작성
- [ ] 사용자 가이드 작성
- [ ] 개발자 가이드 작성
- [ ] 마이그레이션 가이드 작성

### Phase 7: 마이그레이션 및 배포 (2주)

#### 7.1 마이그레이션
- [ ] V2 데이터 마이그레이션 도구
- [ ] 마이그레이션 테스트
- [ ] 롤백 계획

#### 7.2 배포
- [ ] Chrome Web Store 준비
- [ ] 배포 스크립트
- [ ] 버전 관리
- [ ] 업데이트 알림

---

## 마이그레이션 계획

### 데이터 마이그레이션

#### 1. 스토리지 키 매핑

```typescript
// V2 → V3 키 매핑
const keyMapping = {
  'U2_Content_': 'U2_Content_',      // 동일
  'U2_History_': 'U2_History_',      // 동일
  'U2_Category_': 'U2_Category_',    // 동일
  'U2_Settings': 'U2_Settings',      // 동일
  'U2_Temp_': 'U2_Temp_',            // 동일
  'U2_Statistics': 'U2_Statistics',   // 동일
  'U2_CategoryUsage': 'U2_CategoryUsage', // 동일
}
```

#### 2. 데이터 형식 변환

```typescript
// V2 데이터 형식을 V3 형식으로 변환
function migrateContent(v2Data: any): Content {
  return {
    contentId: v2Data.contentId,
    pageType: v2Data.pageType.toLowerCase(),
    title: v2Data.title,
    url: v2Data.url,
    categories: v2Data.categories || [],
    rating: v2Data.rating || null,
    ratingCount: v2Data.ratingCount || 0,
    memo: v2Data.memo,
    videoId: v2Data.videoId,
    channelName: v2Data.channelName,
    publisher: v2Data.publisher,
    thumbnail: v2Data.thumbnail,
    contentUpdateAt: v2Data.contentUpdateAt || Date.now(),
    categoryUpdateAt: v2Data.categoryUpdateAt || Date.now(),
    bookmarkedAt: v2Data.bookmarkedAt,
    deletedAt: v2Data.deletedAt,
    timestamp: v2Data.timestamp || Date.now(),
  }
}
```

#### 3. 마이그레이션 도구

```typescript
// 마이그레이션 스크립트
async function migrateFromV2() {
  // 1. V2 데이터 백업
  const backup = await backupV2Data()
  
  // 2. 데이터 변환
  const v3Data = convertV2ToV3(backup)
  
  // 3. V3 스토리지에 저장
  await saveV3Data(v3Data)
  
  // 4. 마이그레이션 완료 표시
  await markMigrationComplete()
}
```

### 기능 마이그레이션 체크리스트

- [ ] 콘텐츠 데이터 마이그레이션
- [ ] 카테고리 데이터 마이그레이션
- [ ] 설정 데이터 마이그레이션
- [ ] 플레이리스트 데이터 마이그레이션
- [ ] 히스토리 데이터 마이그레이션
- [ ] 통계 데이터 마이그레이션
- [ ] 썸네일 데이터 마이그레이션
- [ ] 번역 데이터 마이그레이션

---

## 참고 자료

### 내부 문서

- [U2BEE V2 데이터 흐름 요약](../../../NEXA-Desktop/U2BEE V2 - 9-1/U2BEE 1차 작업과 데이타 흐름 요약.md)
- [U2BEE 카테고리 시스템 명세](../../../NEXA-Desktop/U2BEE V2 - 9-1/U2_Category.md)
- [썸네일 및 번역 데이터 관리 설계](../../../NEXA-Desktop/U2BEE V2 - 9-1/# 썸네일 및 번역 데이터 관리 설계.md)
- [NEXA Platform 아키텍처](../Platform/02-아키텍처/)

### 외부 자료

- [Vue 3 공식 문서](https://vuejs.org/)
- [Quasar Framework 문서](https://quasar.dev/)
- [Chrome Extension 문서](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 가이드](https://developer.chrome.com/docs/extensions/mv3/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 | 작성자 |
| ---- | ---- | --------- | ------ |
| 3.0.0 | 2024-12 | 초안 작성 | NEXA 개발팀 |

---

**작성자**: NEXA 개발팀  
**검토자**: -  
**승인자**: -
