# 무료 API 데이터 소스 목록

차트 표현을 위한 일반적인 데이터를 제공하는 무료 API 목록입니다.

---

## 📋 목차

1. [날씨 데이터](#1-날씨-데이터)
2. [금융/경제 데이터](#2-금융경제-데이터)
3. [공공 데이터](#3-공공-데이터)
4. [뉴스/미디어](#4-뉴스미디어)
5. [개발자/기술](#5-개발자기술)
6. [건강/의료](#6-건강의료)
7. [교통/위치](#7-교통위치)
8. [환경](#8-환경)
9. [인구/통계](#9-인구통계)
10. [시간/날짜](#10-시간날짜)
11. [추천 조합](#추천-조합-차트에-적합)

---

## 1. 날씨 데이터

### OpenWeatherMap

- **URL**: https://openweathermap.org/api
- **제공 데이터**: 현재 날씨, 예보, 기온, 습도, 풍속, 기압
- **무료 제한**: 1,000 calls/day
- **API 키**: 필요
- **사용 예시**: 시간별 기온, 일별 습도, 주간 날씨 예보

### WeatherAPI

- **URL**: https://www.weatherapi.com/
- **제공 데이터**: 현재 날씨, 예보, 기온, 습도, 강수량
- **무료 제한**: 1,000,000 calls/month
- **API 키**: 필요
- **사용 예시**: 실시간 날씨, 시간별 강수량

### Open-Meteo

- **URL**: https://open-meteo.com/
- **제공 데이터**: 날씨, 기온, 습도, 풍속
- **무료 제한**: 제한 없음
- **API 키**: 불필요
- **사용 예시**: 과거 날씨 데이터, 장기 예보

---

## 2. 금융/경제 데이터

### Alpha Vantage

- **URL**: https://www.alphavantage.co/
- **제공 데이터**: 주식 가격, 환율, 암호화폐
- **무료 제한**: 25 calls/day
- **API 키**: 필요
- **사용 예시**: 일별 주가, 실시간 환율, 암호화폐 가격 변동

### ExchangeRate-API

- **URL**: https://www.exchangerate-api.com/
- **제공 데이터**: 실시간 환율
- **무료 제한**: 1,500 calls/month
- **API 키**: 필요
- **사용 예시**: 일별 환율 변동, 통화별 비교

### CoinGecko

- **URL**: https://www.coingecko.com/api
- **제공 데이터**: 암호화폐 가격, 시가총액
- **무료 제한**: 10-50 calls/minute
- **API 키**: 불필요
- **사용 예시**: 비트코인 가격 추이, 시가총액 순위

### Fixer.io

- **URL**: https://fixer.io/
- **제공 데이터**: 환율 데이터
- **무료 제한**: 100 calls/month
- **API 키**: 필요
- **사용 예시**: 다중 통화 환율, 과거 환율 데이터

---

## 3. 공공 데이터

### 공공데이터포털

- **URL**: https://www.data.go.kr/
- **제공 데이터**: 대기질, 교통, 인구, 부동산 등
- **무료 제한**: API별 상이
- **API 키**: 필요 (인증키 발급)
- **사용 예시**:
  - 대기질 실시간 데이터
  - 지하철/버스 실시간 위치
  - 인구 통계
  - 부동산 가격

### World Bank API

- **URL**: https://datahelpdesk.worldbank.org/
- **제공 데이터**: 국가별 통계, GDP, 인구
- **무료 제한**: 제한 없음
- **API 키**: 불필요
- **사용 예시**: 국가별 GDP 추이, 연도별 인구 증가율

### REST Countries

- **URL**: https://restcountries.com/
- **제공 데이터**: 국가 정보, 인구, 면적
- **무료 제한**: 제한 없음
- **API 키**: 불필요
- **사용 예시**: 국가별 인구 비교, 면적 통계

---

## 4. 뉴스/미디어

### NewsAPI

- **URL**: https://newsapi.org/
- **제공 데이터**: 뉴스 헤드라인, 기사
- **무료 제한**: 100 calls/day
- **API 키**: 필요
- **사용 예시**: 일별 뉴스 기사 수, 카테고리별 통계

### The Guardian API

- **URL**: https://open-platform.theguardian.com/
- **제공 데이터**: 가디언 뉴스
- **무료 제한**: 제한 없음
- **API 키**: 필요
- **사용 예시**: 주제별 뉴스 통계, 시간별 기사 수

---

## 5. 개발자/기술

### GitHub API

- **URL**: https://docs.github.com/en/rest
- **제공 데이터**: 저장소 통계, 커밋, 이슈
- **무료 제한**: 5,000 calls/hour
- **API 키**: 필요 (인증 토큰)
- **사용 예시**:
  - 일별 커밋 수
  - 저장소별 스타 수
  - 언어별 통계

### Stack Overflow API

- **URL**: https://api.stackexchange.com/
- **제공 데이터**: 질문/답변 통계
- **무료 제한**: 300 calls/day
- **API 키**: 선택적
- **사용 예시**: 태그별 질문 수, 시간별 활동량

---

## 6. 건강/의료

### disease.sh

- **URL**: https://disease.sh/
- **제공 데이터**: COVID-19 통계
- **무료 제한**: 제한 없음
- **API 키**: 불필요
- **사용 예시**: 일별 확진자 수, 국가별 통계

### OpenFDA

- **URL**: https://open.fda.gov/
- **제공 데이터**: FDA 의약품 데이터
- **무료 제한**: 제한 없음
- **API 키**: 불필요
- **사용 예시**: 의약품 승인 통계, 부작용 데이터

---

## 7. 교통/위치

### OpenStreetMap Nominatim

- **URL**: https://nominatim.org/
- **제공 데이터**: 지오코딩, 역지오코딩
- **무료 제한**: 1 request/second
- **API 키**: 불필요
- **사용 예시**: 주소 좌표 변환, 위치 검색

### 공공데이터포털 - 대중교통

- **URL**: https://www.data.go.kr/
- **제공 데이터**: 버스/지하철 실시간 위치
- **무료 제한**: API별 상이
- **API 키**: 필요
- **사용 예시**: 실시간 버스 위치, 지하철 도착 시간

---

## 8. 환경

### OpenAQ

- **URL**: https://openaq.org/
- **제공 데이터**: 공기질 데이터
- **무료 제한**: 제한 없음
- **API 키**: 불필요
- **사용 예시**: 시간별 공기질 지수, 지역별 비교

### 공공데이터포털 - 환경

- **URL**: https://www.data.go.kr/
- **제공 데이터**: 대기질, 수질
- **무료 제한**: API별 상이
- **API 키**: 필요
- **사용 예시**: 실시간 대기질, 수질 측정 데이터

---

## 9. 인구/통계

### REST Countries

- **URL**: https://restcountries.com/
- **제공 데이터**: 국가별 인구, 면적
- **무료 제한**: 제한 없음
- **API 키**: 불필요
- **사용 예시**: 국가별 인구 비교, 면적 통계

### World Bank API

- **URL**: https://datahelpdesk.worldbank.org/
- **제공 데이터**: 국가별 통계 데이터
- **무료 제한**: 제한 없음
- **API 키**: 불필요
- **사용 예시**: 연도별 인구 증가율, GDP 성장률

---

## 10. 시간/날짜

### WorldTimeAPI

- **URL**: http://worldtimeapi.org/
- **제공 데이터**: 세계 시간대, 현재 시간
- **무료 제한**: 제한 없음
- **API 키**: 불필요
- **사용 예시**: 시간대별 현재 시간, 날짜 변환

### TimeZoneDB

- **URL**: https://timezonedb.com/api
- **제공 데이터**: 시간대 정보
- **무료 제한**: 1 call/second
- **API 키**: 필요
- **사용 예시**: 시간대 변환, 일출/일몰 시간

---

## 추천 조합 (차트에 적합)

### 1. 날씨 + 시간

- **API**: OpenWeatherMap + 시간별 데이터
- **차트 타입**: 라인 차트
- **데이터**: 시간별 기온, 습도, 풍속
- **사용 예시**: 24시간 기온 변화, 주간 습도 추이

### 2. 주식 가격

- **API**: Alpha Vantage
- **차트 타입**: 라인 차트, 캔들스틱 차트
- **데이터**: 일별 주가, 거래량
- **사용 예시**: 일주일 주가 변동, 월별 종가 추이

### 3. 환율

- **API**: ExchangeRate-API
- **차트 타입**: 라인 차트
- **데이터**: 일별 환율
- **사용 예시**: USD/KRW 환율 변동, 다중 통화 비교

### 4. 공기질

- **API**: OpenAQ
- **차트 타입**: 라인 차트, 바 차트
- **데이터**: 시간별 대기질 지수
- **사용 예시**: 일별 PM2.5 수치, 지역별 비교

### 5. 인구 통계

- **API**: World Bank API
- **차트 타입**: 라인 차트, 바 차트
- **데이터**: 연도별 인구
- **사용 예시**: 국가별 인구 증가 추이, 연도별 GDP

### 6. 암호화폐

- **API**: CoinGecko
- **차트 타입**: 라인 차트
- **데이터**: 시간별 가격, 시가총액
- **사용 예시**: 비트코인 가격 추이, 시가총액 순위

### 7. COVID-19 통계

- **API**: disease.sh
- **차트 타입**: 라인 차트, 바 차트
- **데이터**: 일별 확진자, 사망자
- **사용 예시**: 국가별 확진자 추이, 일별 증가율

### 8. GitHub 통계

- **API**: GitHub API
- **차트 타입**: 라인 차트, 바 차트
- **데이터**: 일별 커밋, 저장소 통계
- **사용 예시**: 프로젝트별 커밋 수, 언어별 사용률

---

## 사용 시 주의사항

1. **API 키 관리**: 환경 변수나 설정 파일에 저장, 절대 코드에 하드코딩하지 않기
2. **Rate Limit**: 무료 플랜의 호출 제한 확인 및 적절한 캐싱 전략 수립
3. **에러 처리**: API 호출 실패 시 적절한 에러 핸들링 및 폴백 데이터 제공
4. **CORS**: 브라우저에서 직접 호출 시 CORS 문제 확인 (필요시 프록시 서버 사용)
5. **데이터 캐싱**: 동일 데이터 반복 요청 방지를 위한 캐싱 구현
6. **데이터 변환**: API 응답 데이터를 차트 형식에 맞게 변환하는 로직 필요

---

## 구현 예시 구조

```javascript
// API 호출 함수 예시
async function fetchWeatherData(city) {
  const apiKey = process.env.VUE_APP_WEATHER_API_KEY
  const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`)
  return await response.json()
}

// 차트 데이터 변환 함수
function transformToChartData(weatherData) {
  return weatherData.list.map((item) => ({
    x: new Date(item.dt * 1000).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    y: item.main.temp - 273.15, // 켈빈을 섭씨로 변환
    count: item.main.temp - 273.15,
  }))
}
```

---

## 참고 자료

- [Public APIs](https://github.com/public-apis/public-apis) - 무료 API 종합 목록
- [API List](https://apilist.fun/) - API 검색 및 비교 사이트
- [RapidAPI](https://rapidapi.com/) - API 마켓플레이스 (무료/유료 혼합)

---

**마지막 업데이트**: 2024년
