<template>
  <q-page class="erp-page">
    <div class="q-pa-lg">
      <div class="page-header q-mb-lg">
        <h1 class="text-h4 text-primary" style="margin-bottom: 2px">ERP</h1>
        <p class="text-body1 text-grey-7">프로젝트 및 업무 관리</p>
      </div>

      <!-- 전용 에디터 개발 안내 -->
      <div class="q-mb-md q-pa-md" style="border: 1px solid var(--nexa-border-color); border-radius: 8px">
        <div class="text-subtitle2 q-mb-xs text-primary">
          <q-icon name="edit" size="18px" class="q-mr-xs" />
          전용 에디터 개발 예정
        </div>
        <p class="text-body2 text-grey-7 q-mb-none">NEXA ERP의 각 기능은 기존 에디터(Tiptap 등)를 커스터마이징한 전용 에디터로 개발될 예정입니다. 프로젝트 문서, 작업 문서, 참고자료 등 각 항목별로 특화된 에디터 기능을 제공합니다.</p>
      </div>

      <!-- 메인 탭 -->
      <q-tabs v-model="mainTab" dense class="text-grey-7" active-color="primary" indicator-color="primary" align="left" narrow-indicator>
        <q-tab name="project" label="프로젝트" icon="folder" />
        <q-tab name="work-document" label="작업 문서" icon="description" />
        <q-tab name="schedule" label="일정 관리" icon="event" />
        <q-tab name="collaboration" label="실시간 협업" icon="chat" />
        <q-tab name="reference" label="참고자료" icon="attach_file" />
        <q-tab name="logbook" label="로그북" icon="book" />
        <q-tab name="parts" label="부품관리" icon="inventory_2" />
        <q-tab name="finance" label="재무 관리" icon="account_balance" />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="mainTab" animated>
        <!-- 프로젝트 탭 -->
        <q-tab-panel name="project" class="network-tab-panel">
          <div class="q-mt-md">
            <h3 class="text-h6 q-mb-md">
              <q-icon name="folder" size="24px" class="q-mr-sm" />
              프로젝트 관리
            </h3>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">프로젝트 등록 및 관리</h4>
              <p class="text-body2 text-grey-7">프로젝트 등록 및 독립적 관리. 필요시 다른 항목과 연결</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">주요 기능</h4>
              <p class="text-body2 text-grey-7">프로젝트 타입, 프로젝트 상태, 우선순위, 프로젝트 분류, 팀/담당자, 예산 관리</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">프로젝트 타입</h4>
              <p class="text-body2 text-grey-7">개발 프로젝트(제품 개발, 소프트웨어 개발), 연구 프로젝트(R&D, 실험, 프로토타입 개발), 유지보수(기존 시스템 개선, 버그 수정), 인프라(시스템 구축, 네트워크 구성)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">프로젝트 상태</h4>
              <p class="text-body2 text-grey-7">계획(초기 기획 단계), 진행중(현재 활발히 진행 중), 보류(일시 중단), 완료(프로젝트 종료), 취소(프로젝트 취소)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">연결 가능한 항목</h4>
              <p class="text-body2 text-grey-7">작업 문서(프로젝트와 연결된 작업 항목), 일정 관리(프로젝트 일정 및 마일스톤), 재무 관리(프로젝트 예산 및 비용 추적), 참고자료(프로젝트 관련 문서 및 자료), 로그북(프로젝트 진행 기록)</p>
            </div>
          </div>
        </q-tab-panel>

        <!-- 작업 문서 탭 -->
        <q-tab-panel name="work-document" class="network-tab-panel">
          <div class="q-mt-md">
            <h3 class="text-h6 q-mb-md">
              <q-icon name="description" size="24px" class="q-mr-sm" />
              작업 문서 관리
            </h3>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">작업 문서 등록 및 관리</h4>
              <p class="text-body2 text-grey-7">작업 항목의 제원(가로, 세로, 높이 등), 수량, 작업 순서/절차 등 등록 및 관리. 프로젝트와 선택적 연결. Automation에서 워크플로우로 변환</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">주요 기능</h4>
              <p class="text-body2 text-grey-7">작업 항목 등록(제원, 수량, 작업 순서 등 상세 정보 입력), 제원 관리(가로, 세로, 높이, 무게 등 물리적 제원 기록), 작업 절차(단계별 작업 순서 및 절차 문서화), 프로젝트 연결(특정 프로젝트와 연결하여 관리), Automation 연동(자동화 워크플로우로 변환)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">작업 문서 구조</h4>
              <p class="text-body2 text-grey-7">기본 정보(작업명, 설명, 카테고리), 제원 정보(치수, 무게, 재질 등), 수량 정보(필요 수량, 단위), 작업 순서(단계별 작업 절차 및 요구사항), 연결 정보(프로젝트, 부품, 장비 등 연결 항목)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">Automation 연동</h4>
              <p class="text-body2 text-grey-7">작업 문서를 Automation 메뉴에서 노드 기반 워크플로우로 변환. 각 작업 단계는 노드로 표현되며, CNC 장비 등과 연동하여 자동 실행 가능</p>
            </div>
          </div>
        </q-tab-panel>

        <!-- 일정 관리 탭 -->
        <q-tab-panel name="schedule" class="network-tab-panel">
          <div class="q-mt-md">
            <h3 class="text-h6 q-mb-md">
              <q-icon name="event" size="24px" class="q-mr-sm" />
              일정 관리
            </h3>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">일정 등록 및 관리</h4>
              <p class="text-body2 text-grey-7">스케줄, 마일스톤 등 일정 등록 및 관리. 프로젝트와 선택적 연결</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">주요 기능</h4>
              <p class="text-body2 text-grey-7">일정 등록(시작일, 종료일, 기간 설정), 마일스톤 관리(주요 단계별 목표 지점 설정), 반복 일정(주간, 월간 등 반복 일정 설정), 알림 설정(일정 알림 및 리마인더), 프로젝트 연결(프로젝트별 일정 그룹화)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">일정 타입</h4>
              <p class="text-body2 text-grey-7">일반 일정(회의, 미팅, 데드라인), 마일스톤(프로젝트 주요 단계 완료 지점), 반복 일정(정기적인 작업 및 점검), 긴급 일정(우선 처리 필요한 일정)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">캘린더 뷰</h4>
              <p class="text-body2 text-grey-7">월간, 주간, 일간 캘린더 뷰를 통한 일정 시각화. 프로젝트별 색상 구분 표시</p>
            </div>
          </div>
        </q-tab-panel>

        <!-- 협업 탭 -->
        <q-tab-panel name="collaboration" class="network-tab-panel">
          <div class="q-mt-md">
            <h3 class="text-h6 q-mb-md">
              <q-icon name="chat" size="24px" class="q-mr-sm" />
              협업 및 소통
            </h3>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">실시간 협업 시스템</h4>
              <p class="text-body2 text-grey-7">소음이 심한 환경이나 전화보다 정확한 의사소통을 위한 멀티미디어 협업 도구</p>
              <p class="text-body2 text-grey-7 q-mb-sm"><strong>WebSocket 기반 실시간 통신:</strong> 양방향 실시간 메시지 교환. 넥사 서버를 통한 WebSocket 중계(표준 구조)</p>
              <p class="text-body2 text-grey-7 q-mb-sm"><strong>공유 모듈 통합:</strong> 차트, 블록, 패널, 노드 등 모든 공유 모듈을 쳇팅 내에서 사용 가능. 공유 모듈의 실시간 렌더링 및 상호작용</p>
              <p class="text-body2 text-grey-7"><strong>프로젝트 연동:</strong> 프로젝트별 채널 생성 및 관리. 프로젝트 컨텍스트 기반 자동 채널 생성. 멀티미디어 메시지 타입 지원(텍스트, 차트, 블록, 패널, 노드 등). 실시간 동기화 및 상태 공유</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">활용 시나리오</h4>
              <p class="text-body2 text-grey-7">소음이 심한 현장 환경에서 정확한 의사소통. 원격 협업 시 실시간 데이터 및 차트 공유. 프로젝트 진행 중 즉시 피드백 및 의견 교환. 기술적 문제 해결을 위한 시각적 자료 공유. 자동화 워크플로우 노드를 쳇팅에서 직접 공유 및 설명</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">히스토리 관리</h4>
              <p class="text-body2 text-grey-7">대화 내용 및 공유된 자료의 히스토리 저장</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">구현 예정</h4>
              <p class="text-body2 text-grey-7">현재 아이디어 단계이며, 향후 구현 예정</p>
            </div>
          </div>
        </q-tab-panel>

        <!-- 참고자료 탭 -->
        <q-tab-panel name="reference" class="network-tab-panel">
          <div class="q-mt-md">
            <h3 class="text-h6 q-mb-md">
              <q-icon name="attach_file" size="24px" class="q-mr-sm" />
              참고자료 관리
            </h3>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">자료 등록 및 관리</h4>
              <p class="text-body2 text-grey-7">아이디어, 인문지식, 참고 문서 등 모든 종류의 자료 등록 및 관리. 프로젝트와 독립적으로 관리 가능. 필요시 프로젝트와 선택적 연결</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">주요 기능</h4>
              <p class="text-body2 text-grey-7">다양한 자료 유형 지원(문서, 이미지, 링크, 아이디어 등), 태그 시스템(자료를 태그로 분류 및 검색), 독립 관리(프로젝트와 무관하게 독립적으로 관리), 선택적 연결(필요시 프로젝트와 연결하여 참조), 검색 기능(키워드, 태그, 카테고리로 검색)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">자료 유형</h4>
              <p class="text-body2 text-grey-7">아이디어(프로젝트 아이디어, 개선 사항), 인문지식(일반 지식, 참고 정보), 기술 문서(기술 자료, 매뉴얼, 스펙), 참고 링크(외부 자료 링크), 이미지/파일(첨부 파일 및 미디어)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">관리 방식</h4>
              <p class="text-body2 text-grey-7">프로젝트와 독립적으로 관리하여 여러 프로젝트에서 재사용하거나 프로젝트와 무관한 일반적인 지식도 체계적으로 관리</p>
            </div>
          </div>
        </q-tab-panel>

        <!-- 로그북 탭 -->
        <q-tab-panel name="logbook" class="network-tab-panel">
          <div class="q-mt-md">
            <h3 class="text-h6 q-mb-md">
              <q-icon name="book" size="24px" class="q-mr-sm" />
              로그북 관리
            </h3>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">작업 기록 관리</h4>
              <p class="text-body2 text-grey-7">특수 목적의 작업 기록을 시간별로 관리. 식물 키우기, 양봉, 실험 등 관찰 및 활동 기록에 사용. 프로젝트와 선택적 연결</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">주요 기능</h4>
              <p class="text-body2 text-grey-7">시간별 기록(날짜 및 시간 기반 기록), 관찰 기록(상태, 변화, 측정값 등 상세 기록), 이미지 첨부(관찰 결과 사진 및 자료), 데이터 추적(시간에 따른 변화 추적 및 그래프), 프로젝트 연결(특정 프로젝트와 연결하여 관리)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">사용 사례</h4>
              <p class="text-body2 text-grey-7">식물 키우기(성장 과정, 물주기, 온도/습도 기록), 양봉(벌집 상태, 수확, 건강 상태 기록), 실험(실험 조건, 결과, 관찰 사항 기록), 장비 모니터링(장비 상태, 유지보수 기록)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">데이터 시각화</h4>
              <p class="text-body2 text-grey-7">시간별로 기록된 데이터를 그래프로 시각화하여 추세 파악. 온도, 습도, 성장률 등 수치 데이터를 시간에 따라 추적</p>
            </div>
          </div>
        </q-tab-panel>

        <!-- 부품관리 탭 -->
        <q-tab-panel name="parts" class="network-tab-panel">
          <div class="q-mt-md">
            <h3 class="text-h6 q-mb-md">
              <q-icon name="inventory_2" size="24px" class="q-mr-sm" />
              부품관리
            </h3>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">부품 재고 관리</h4>
              <p class="text-body2 text-grey-7">부품 재고 관리 및 입출고 관리. 특정 장비 개발 프로젝트에서 활용</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">주요 기능</h4>
              <p class="text-body2 text-grey-7">재고 관리(부품별 재고 현황 추적), 입출고 관리(입고, 출고, 이동 기록), 부품 분류(카테고리별 부품 관리), 프로젝트 연결(프로젝트별 부품 사용 추적), 재고 알림(최소 재고 알림 및 자동 주문)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">부품 정보</h4>
              <p class="text-body2 text-grey-7">기본 정보(부품명, 제조사, 모델명, 스펙), 재고 정보(현재 재고, 최소/최대 재고), 가격 정보(단가, 총 가치), 위치 정보(보관 위치, 창고 정보)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">프로젝트 연동</h4>
              <p class="text-body2 text-grey-7">특정 장비 개발 프로젝트와 연결하여 해당 프로젝트에서 사용하는 부품을 추적하고, 프로젝트별 부품 소요량을 관리</p>
            </div>
          </div>
        </q-tab-panel>

        <!-- 재무 관리 탭 -->
        <q-tab-panel name="finance" class="network-tab-panel">
          <div class="q-mt-md">
            <h3 class="text-h6 q-mb-md">
              <q-icon name="account_balance" size="24px" class="q-mr-sm" />
              재무 관리
            </h3>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">재무 통합 관리</h4>
              <p class="text-body2 text-grey-7">회계, 예산, 비용, 매출/매입, 자금, 견적 관리를 통합하여 재무 관리. 프로젝트와 연결하여 프로젝트별 재무 현황 추적</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">주요 기능</h4>
              <p class="text-body2 text-grey-7">회계 관리, 예산 관리, 비용 관리, 매출/매입, 자금 관리, 견적 관리</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">회계 관리</h4>
              <p class="text-body2 text-grey-7">일반/총계정원장(계정별 거래 기록), 분개(거래별 분개 처리), 결산(월별/연도별 결산 처리)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">예산 관리</h4>
              <p class="text-body2 text-grey-7">예산 계획(프로젝트별 예산 수립), 예산 집행(예산 사용 현황 추적), 예산 분석(예산 대비 실적 분석)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">비용 관리</h4>
              <p class="text-body2 text-grey-7">비용 발생(각종 비용 등록), 비용 배분(프로젝트별 비용 배분), 비용 분석(비용 구조 및 추이 분석)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">매출/매입 관리</h4>
              <p class="text-body2 text-grey-7">매출/매입 전표(거래 전표 처리), 세금 관리(부가세, 원가세 처리), 거래 내역(매출/매입 내역 조회)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">자금 관리</h4>
              <p class="text-body2 text-grey-7">현금 흐름(현금 유입/유출 추적), 자금 계획(자금 계획 수립 및 관리), 예금/대출(금융 거래 관리)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">견적 관리</h4>
              <p class="text-body2 text-grey-7">프로젝트 견적(프로젝트별 견적 작성), 구매 견적(구매 견적 요청 및 비교), 판매 견적(고객 견적 작성 및 관리)</p>
            </div>

            <div class="q-mb-md description-item">
              <h4 class="text-subtitle1 q-mb-sm">프로젝트 연동</h4>
              <p class="text-body2 text-grey-7">프로젝트와 연결하여 프로젝트별 재무 현황 추적. 예산, 비용, 매출 등을 프로젝트 단위로 관리하고 분석</p>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>

      <!-- 일반 ERP 항목 참고 -->
      <div class="q-mt-xl">
        <div class="text-h6 q-mb-md text-grey-7">일반 ERP 시스템 항목 참고</div>
        <div class="row q-gutter-md">
          <div class="col-12 col-md-6 col-lg-4">
            <div class="text-subtitle2 q-mb-sm text-grey-6">재무 관리</div>
            <ul class="text-caption text-grey-5">
              <li>회계 관리 (일반/총계정원장, 분개, 결산)</li>
              <li>예산 관리 (예산 계획, 집행, 분석)</li>
              <li>비용 관리 (비용 발생, 배분, 분석)</li>
              <li>매출/매입 관리 (매출/매입 전표, 세금)</li>
              <li>자금 관리 (현금 흐름, 자금 계획)</li>
              <li>견적 관리 (프로젝트/구매/판매 견적)</li>
            </ul>
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <div class="text-subtitle2 q-mb-sm text-grey-6">인사 관리</div>
            <ul class="text-caption text-grey-5">
              <li>인사 정보 관리 (직원 등록, 조직도)</li>
              <li>급여 관리 (급여 계산, 지급, 세무)</li>
              <li>출퇴근 관리 (근태, 휴가, 연차)</li>
              <li>평가 관리 (성과 평가, 인사고과)</li>
              <li>채용 관리 (채용 공고, 지원자 관리)</li>
            </ul>
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <div class="text-subtitle2 q-mb-sm text-grey-6">구매 관리</div>
            <ul class="text-caption text-grey-5">
              <li>구매 요청 (PR: Purchase Request)</li>
              <li>구매 발주 (PO: Purchase Order)</li>
              <li>입고 관리 (입고 처리, 검수)</li>
              <li>공급업체 관리 (협력사 정보, 평가)</li>
              <li>구매 계약 관리</li>
            </ul>
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <div class="text-subtitle2 q-mb-sm text-grey-6">판매 관리</div>
            <ul class="text-caption text-grey-5">
              <li>주문 관리 (주문 접수, 처리)</li>
              <li>배송 관리 (출하, 배송 추적)</li>
              <li>청구 관리 (인보이스, 세금계산서)</li>
              <li>고객 관리 (CRM 연계)</li>
              <li>매출 분석</li>
            </ul>
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <div class="text-subtitle2 q-mb-sm text-grey-6">재고 관리</div>
            <ul class="text-caption text-grey-5">
              <li>재고 현황 (재고 조회, 실사)</li>
              <li>입출고 관리 (입고, 출고, 이동)</li>
              <li>창고 관리 (창고별 재고, 위치)</li>
              <li>재고 분석 (ABC 분석, 회전율)</li>
              <li>재고 알림 (부족 알림, 최소 재고)</li>
            </ul>
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <div class="text-subtitle2 q-mb-sm text-grey-6">생산 관리</div>
            <ul class="text-caption text-grey-5">
              <li>BOM 관리 (Bill of Materials)</li>
              <li>생산 계획 (MPS: Master Production Schedule)</li>
              <li>작업 지시 (작업 지시서, 공정 관리)</li>
              <li>생산 실적 (생산량, 불량률)</li>
              <li>설비 관리 (설비 등록, 유지보수)</li>
            </ul>
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <div class="text-subtitle2 q-mb-sm text-grey-6">자산 관리</div>
            <ul class="text-caption text-grey-5">
              <li>고정 자산 등록</li>
              <li>자산 감가상각</li>
              <li>자산 이동/처분</li>
              <li>유지보수 관리</li>
            </ul>
          </div>

          <div class="col-12 col-md-6 col-lg-4">
            <div class="text-subtitle2 q-mb-sm text-grey-6">보고서 및 분석</div>
            <ul class="text-caption text-grey-5">
              <li>재무 보고서</li>
              <li>영업 보고서</li>
              <li>재고 보고서</li>
              <li>대시보드 (KPI, 지표)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'

const mainTab = ref('project')
</script>

<style lang="scss" scoped>
.erp-page {
  //background: var(--nexa-background);
  min-height: 100vh;
}

.page-header {
  border-bottom: 1px solid var(--nexa-border-color);
  padding-bottom: 16px;
}

// 탭 패널 배경 제거 및 보더 추가
:deep(.q-tab-panels) {
  background: transparent;
}

:deep(.q-tab-panel) {
  background: transparent;
  border: 1px solid var(--nexa-border-color);
  border-radius: 4px;
  padding: 50px;
}

.network-tab-panel {
  counter-reset: section-counter;
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
}

.description-item {
  counter-increment: section-counter;
  counter-reset: detail-counter;

  h4::before {
    content: counter(section-counter) '. ';
    font-weight: 600;
    color: var(--q-primary);
  }

  > p:not(:has(strong)) {
    position: relative;
    margin-left: 0.5rem;
    padding-left: 1rem;

    &::before {
      content: '⌦';
      position: absolute;
      left: 0;
      color: var(--q-primary);
      font-size: 0.7em;
    }
  }

  p:has(strong) {
    margin-left: 2.5rem;
    margin-top: 0.5rem;
  }

  p strong {
    counter-increment: detail-counter;

    &::before {
      content: '• ';
      font-weight: 600;
      color: var(--q-primary);
      margin-right: 0.1rem;
    }
  }
}
</style>
