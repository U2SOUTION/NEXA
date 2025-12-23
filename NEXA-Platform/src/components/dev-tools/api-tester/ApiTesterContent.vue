<template>
  <div class="api-tester-content">
    <!-- 대형 타이틀 -->
    <div class="api-tester-header-title">API TESTER</div>

    <!-- 설명 섹션 -->
    <div class="api-tester-description q-pa-md">
      <div class="api-tester-description-content">
        <div class="api-tester-description-section">
          <q-icon name="info" size="20px" class="q-mr-sm api-tester-description-icon-info" />
          <div>
            <div class="api-tester-description-title">API란?</div>
            <div class="api-tester-description-text">API(Application Programming Interface)는 애플리케이션 간 통신을 위한 인터페이스입니다. 이 도구를 사용하여 서버의 API 엔드포인트를 테스트하고 응답을 확인할 수 있습니다.</div>
          </div>
        </div>
        <div class="api-tester-description-section">
          <q-icon name="help" size="20px" class="q-mr-sm api-tester-description-icon-help" />
          <div>
            <div class="api-tester-description-title">사용법</div>
            <div class="api-tester-description-text">
              <strong>1. 요청 설정:</strong> HTTP 메서드(GET, POST, PUT, DELETE 등)와 URL을 입력하세요.<br />
              <strong>2. 헤더 설정:</strong> 필요한 경우 요청 헤더를 추가하세요 (예: Content-Type).<br />
              <strong>3. 본문 설정:</strong> POST/PUT 요청의 경우 JSON 또는 텍스트 본문을 입력하세요.<br />
              <strong>4. 요청 전송:</strong> "요청 전송" 버튼을 클릭하거나 Enter 키를 누르세요.<br />
              <strong>5. 응답 확인:</strong> 오른쪽 패널에서 상태 코드, 응답 시간, 헤더, 본문을 확인하세요.
            </div>
          </div>
        </div>
        <div class="api-tester-description-section">
          <q-icon name="tips_and_updates" size="20px" class="q-mr-sm api-tester-description-icon-tip" />
          <div>
            <div class="api-tester-description-title">팁</div>
            <div class="api-tester-description-text">
              • 북마크 아이콘을 클릭하여 미리 정의된 API 목록에서 선택할 수 있습니다.<br />
              • 히스토리 아이콘을 클릭하여 이전 요청을 다시 사용할 수 있습니다.<br />
              • 모든 API 요청은 자동으로 성능 모니터에 기록됩니다.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 툴바 -->
    <div class="api-tester-toolbar q-pa-md row items-center justify-between">
      <div class="row items-center q-gutter-md">
        <q-icon name="api" size="24px" />
        <h3 class="api-tester-toolbar-title">API Tester</h3>
        <p class="api-tester-toolbar-subtitle">API 테스터</p>
      </div>
      <div class="row items-center q-gutter-sm">
        <q-btn color="primary" label="요청 전송" icon="send" @click="sendRequest" :loading="isLoading" />
        <q-btn flat icon="history" @click="showHistory = !showHistory" />
        <q-btn flat icon="bookmark" @click="showApiList = !showApiList" />
      </div>
    </div>

    <!-- 메인 컨텐츠 -->
    <div class="api-tester-request-section">
      <!-- 왼쪽: 요청 설정 -->
      <div class="api-tester-request-panel">
        <div class="api-tester-panel-header">
          <q-icon name="edit" size="20px" class="q-mr-sm" />
          <span class="api-tester-panel-title">요청 설정</span>
        </div>

        <div class="api-tester-panel-content">
          <!-- HTTP 메서드 및 URL -->
          <div class="q-mb-md">
            <div class="row q-col-gutter-sm">
              <div class="col-3">
                <q-select v-model="requestMethod" :options="httpMethods" outlined dense emit-value map-options />
              </div>
              <div class="col-9">
                <q-input v-model="requestUrl" placeholder="http://localhost:3000/api/..." outlined dense @keyup.enter="sendRequest">
                  <template v-slot:prepend>
                    <q-icon name="link" />
                  </template>
                </q-input>
              </div>
            </div>
          </div>

          <!-- API 목록에서 선택 -->
          <div v-if="showApiList" class="q-mb-md">
            <q-select v-model="selectedApi" :options="apiListOptions" option-label="label" option-value="value" placeholder="API 선택..." outlined dense @update:model-value="onApiSelected">
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.method }} {{ scope.opt.path }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- 헤더 설정 -->
          <div class="q-mb-md">
            <div class="api-tester-panel-subtitle q-mb-sm">
              <q-icon name="settings" size="16px" class="q-mr-xs" />
              헤더
            </div>
            <div v-for="(header, index) in requestHeaders" :key="index" class="row q-col-gutter-xs q-mb-xs">
              <div class="col-5">
                <q-input v-model="header.key" placeholder="키" outlined dense />
              </div>
              <div class="col-6">
                <q-input v-model="header.value" placeholder="값" outlined dense />
              </div>
              <div class="col-1">
                <q-btn flat dense icon="close" size="sm" @click="removeHeader(index)" />
              </div>
            </div>
            <q-btn flat dense icon="add" label="헤더 추가" size="sm" @click="addHeader" />
          </div>

          <!-- 요청 본문 -->
          <div v-if="hasRequestBody" class="q-mb-md">
            <div class="api-tester-panel-subtitle q-mb-sm">
              <q-icon name="code" size="16px" class="q-mr-xs" />
              요청 본문
            </div>
            <q-select v-model="bodyType" :options="bodyTypes" outlined dense class="q-mb-sm" />
            <q-input v-model="requestBody" type="textarea" :placeholder="bodyType === 'json' ? 'JSON 형식으로 입력하세요' : '텍스트를 입력하세요'" outlined rows="8" :class="{ 'api-tester-json-input': bodyType === 'json' }" />
          </div>
        </div>
      </div>
    </div>

    <!-- 응답 표시 -->
    <div class="api-tester-response-section">
      <div class="api-tester-panel-header">
        <q-icon name="description" size="20px" class="q-mr-sm" />
        <span class="api-tester-panel-title">응답</span>
        <q-space />
        <q-chip v-if="responseStatus" :color="getStatusColor(responseStatus)" text-color="white" :label="`${responseStatus} ${getStatusText(responseStatus)}`" size="sm" />
      </div>

      <div class="api-tester-panel-content">
        <div v-if="!response" class="api-tester-empty-response">
          <q-icon name="inbox" size="48px" class="q-mb-md" />
          <p>요청을 전송하면 응답이 여기에 표시됩니다.</p>
        </div>

        <div v-else>
          <!-- 응답 시간 -->
          <div v-if="responseTime" class="api-tester-response-time q-mb-md">
            <q-icon name="schedule" size="16px" class="q-mr-xs" />
            응답 시간: {{ responseTime }}ms
          </div>

          <!-- 응답 헤더 -->
          <div v-if="responseHeaders && Object.keys(responseHeaders).length > 0" class="q-mb-md">
            <div class="api-tester-panel-subtitle q-mb-sm">
              <q-icon name="settings" size="16px" class="q-mr-xs" />
              응답 헤더
            </div>
            <div class="api-tester-response-headers">
              <div v-for="(value, key) in responseHeaders" :key="key" class="api-tester-header-item">
                <span class="api-tester-header-key">{{ key }}:</span>
                <span class="api-tester-header-value">{{ value }}</span>
              </div>
            </div>
          </div>

          <!-- 응답 본문 -->
          <div>
            <div class="api-tester-panel-subtitle q-mb-sm">
              <q-icon name="code" size="16px" class="q-mr-xs" />
              응답 본문
            </div>
            <div class="api-tester-response-body">
              <pre v-if="isJsonResponse">{{ formattedResponse }}</pre>
              <pre v-else>{{ response }}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 요청 히스토리 -->
    <div v-if="showHistory" class="api-tester-history-section q-mt-md">
      <div class="api-tester-panel-header">
        <q-icon name="history" size="20px" class="q-mr-sm" />
        <span class="api-tester-panel-title">요청 히스토리</span>
        <q-space />
        <q-btn flat dense icon="clear_all" label="전체 삭제" size="sm" @click="clearHistory" />
      </div>
      <div class="api-tester-panel-content">
        <div v-if="requestHistory.length === 0" class="api-tester-empty-history">
          <p>요청 히스토리가 없습니다.</p>
        </div>
        <div v-else class="api-tester-history-list">
          <div v-for="(item, index) in requestHistory" :key="index" class="api-tester-history-item" @click="loadHistoryItem(item)">
            <div class="api-tester-history-method">{{ item.method }}</div>
            <div class="api-tester-history-url">{{ item.url }}</div>
            <div class="api-tester-history-time">{{ formatTime(item.timestamp) }}</div>
            <q-btn flat dense icon="delete" size="sm" @click.stop="removeHistoryItem(index)" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// 상태
const isLoading = ref(false)
const showHistory = ref(false)
const showApiList = ref(false)

// 요청 설정
const requestMethod = ref('GET')
const requestUrl = ref('http://localhost:3000/api/part-classes')
const requestHeaders = ref([{ key: 'Content-Type', value: 'application/json' }])
const bodyType = ref('json')
const requestBody = ref('')

// 응답
const response = ref(null)
const responseStatus = ref(null)
const responseHeaders = ref({})
const responseTime = ref(null)

// 히스토리
const requestHistory = ref([])

// 선택된 API
const selectedApi = ref(null)

// HTTP 메서드 목록
const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']

// 본문 타입
const bodyTypes = [
  { label: 'JSON', value: 'json' },
  { label: '텍스트', value: 'text' },
]

// 본문이 필요한 메서드
const hasRequestBody = computed(() => {
  return ['POST', 'PUT', 'PATCH'].includes(requestMethod.value)
})

// JSON 응답 여부
const isJsonResponse = computed(() => {
  if (!response.value) return false
  try {
    JSON.parse(response.value)
    return true
  } catch {
    return false
  }
})

// 포맷된 JSON 응답
const formattedResponse = computed(() => {
  if (!isJsonResponse.value) return response.value
  try {
    return JSON.stringify(JSON.parse(response.value), null, 2)
  } catch {
    return response.value
  }
})

// API 목록 옵션
const apiListOptions = computed(() => {
  const apis = []

  // 부품 클래스 API
  apis.push(
    { label: '부품 클래스 목록 조회', method: 'GET', path: '/api/part-classes', value: { method: 'GET', url: 'http://localhost:3000/api/part-classes' } },
    { label: '부품 클래스 조회', method: 'GET', path: '/api/part-classes/:id', value: { method: 'GET', url: 'http://localhost:3000/api/part-classes/1' } },
    { label: '부품 클래스 생성', method: 'POST', path: '/api/part-classes', value: { method: 'POST', url: 'http://localhost:3000/api/part-classes', body: JSON.stringify({ name: '새 부품 클래스', c_code: 'C001', category: '카테고리', sort_order: 1, sub_sort_order: 1 }, null, 2) } },
    { label: '부품 클래스 수정', method: 'PUT', path: '/api/part-classes/:id', value: { method: 'PUT', url: 'http://localhost:3000/api/part-classes/1', body: JSON.stringify({ name: '수정된 이름' }, null, 2) } },
    { label: '부품 클래스 삭제', method: 'DELETE', path: '/api/part-classes/:id', value: { method: 'DELETE', url: 'http://localhost:3000/api/part-classes/1' } },
  )

  // 문서 API
  apis.push(
    { label: '문서 메타데이터 조회', method: 'GET', path: '/api/docs/metadata', value: { method: 'GET', url: 'http://localhost:3000/api/docs/metadata' } },
    { label: '문서 파일 읽기', method: 'GET', path: '/api/docs/:fileName', value: { method: 'GET', url: 'http://localhost:3000/api/docs/' + encodeURIComponent('Platform/01-기획/문서.md') } },
    { label: '문서 파일 생성', method: 'POST', path: '/api/docs', value: { method: 'POST', url: 'http://localhost:3000/api/docs', body: JSON.stringify({ fileName: 'Platform/01-기획/새문서.md', content: '# 새 문서\n\n내용...' }, null, 2) } },
  )

  return apis
})

// 헤더 추가
function addHeader() {
  requestHeaders.value.push({ key: '', value: '' })
}

// 헤더 제거
function removeHeader(index) {
  requestHeaders.value.splice(index, 1)
}

// API 선택 시
function onApiSelected(api) {
  if (!api) return
  requestMethod.value = api.method
  requestUrl.value = api.url
  if (api.body) {
    requestBody.value = api.body
    bodyType.value = 'json'
  } else {
    requestBody.value = ''
  }
}

// 요청 전송
async function sendRequest() {
  if (!requestUrl.value) {
    $q.notify({
      type: 'negative',
      message: 'URL을 입력하세요.',
    })
    return
  }

  isLoading.value = true
  response.value = null
  responseStatus.value = null
  responseHeaders.value = {}
  responseTime.value = null

  try {
    const startTime = performance.now()

    // 헤더 구성
    const headers = {}
    requestHeaders.value.forEach((header) => {
      if (header.key && header.value) {
        headers[header.key] = header.value
      }
    })

    // 요청 옵션
    const options = {
      method: requestMethod.value,
      headers,
    }

    // 본문 추가
    if (hasRequestBody.value && requestBody.value) {
      if (bodyType.value === 'json') {
        // JSON 검증
        try {
          JSON.parse(requestBody.value)
          options.body = requestBody.value
        } catch {
          $q.notify({
            type: 'negative',
            message: 'JSON 형식이 올바르지 않습니다.',
          })
          isLoading.value = false
          return
        }
      } else {
        options.body = requestBody.value
      }
    }

    // 요청 전송
    const fetchResponse = await fetch(requestUrl.value, options)
    const endTime = performance.now()
    responseTime.value = Math.round(endTime - startTime)

    // 응답 헤더
    const responseHeadersObj = {}
    fetchResponse.headers.forEach((value, key) => {
      responseHeadersObj[key] = value
    })
    responseHeaders.value = responseHeadersObj

    // 응답 상태
    responseStatus.value = fetchResponse.status

    // 응답 본문
    const contentType = fetchResponse.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const json = await fetchResponse.json()
      response.value = JSON.stringify(json, null, 2)
    } else {
      response.value = await fetchResponse.text()
    }

    // 히스토리에 추가
    addToHistory({
      method: requestMethod.value,
      url: requestUrl.value,
      headers: headers,
      body: hasRequestBody.value ? requestBody.value : null,
      timestamp: Date.now(),
    })

    // 히스토리 저장
    saveHistory()
  } catch (error) {
    response.value = `에러: ${error.message}`
    responseStatus.value = 0
    $q.notify({
      type: 'negative',
      message: `요청 실패: ${error.message}`,
    })
  } finally {
    isLoading.value = false
  }
}

// 히스토리에 추가
function addToHistory(item) {
  requestHistory.value.unshift(item)
  // 최대 50개만 유지
  if (requestHistory.value.length > 50) {
    requestHistory.value = requestHistory.value.slice(0, 50)
  }
}

// 히스토리 로드
function loadHistoryItem(item) {
  requestMethod.value = item.method
  requestUrl.value = item.url
  if (item.body) {
    requestBody.value = item.body
    bodyType.value = 'json'
  } else {
    requestBody.value = ''
  }
  // 헤더 복원
  requestHeaders.value = Object.keys(item.headers || {}).map((key) => ({
    key,
    value: item.headers[key],
  }))
  if (requestHeaders.value.length === 0) {
    requestHeaders.value = [{ key: 'Content-Type', value: 'application/json' }]
  }
}

// 히스토리 항목 제거
function removeHistoryItem(index) {
  requestHistory.value.splice(index, 1)
  saveHistory()
}

// 히스토리 전체 삭제
function clearHistory() {
  $q.dialog({
    title: '확인',
    message: '모든 히스토리를 삭제하시겠습니까?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    requestHistory.value = []
    saveHistory()
  })
}

// 히스토리 저장
function saveHistory() {
  try {
    localStorage.setItem('api-tester-history', JSON.stringify(requestHistory.value))
  } catch (error) {
    console.error('히스토리 저장 실패:', error)
  }
}

// 히스토리 로드
function loadHistory() {
  try {
    const saved = localStorage.getItem('api-tester-history')
    if (saved) {
      requestHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('히스토리 로드 실패:', error)
  }
}

// 상태 코드 색상
function getStatusColor(status) {
  if (status >= 200 && status < 300) return 'positive'
  if (status >= 300 && status < 400) return 'info'
  if (status >= 400 && status < 500) return 'warning'
  if (status >= 500) return 'negative'
  return 'grey'
}

// 상태 코드 텍스트
function getStatusText(status) {
  const statusTexts = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
  }
  return statusTexts[status] || ''
}

// 시간 포맷
function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('ko-KR')
}

onMounted(() => {
  loadHistory()
})
</script>

<style lang="scss" scoped>
// 헤더 타이틀
.api-tester-header-title {
  font-size: 8rem;
  font-weight: 900;
  color: var(--nexa-text-primary);
  margin-bottom: 1rem;
}

// 설명 섹션
.api-tester-description {
  color: var(--nexa-text-secondary);
  margin-bottom: 1rem;

  strong {
    color: var(--nexa-text-primary);
  }

  ul {
    list-style-type: disc;
    margin-left: 1rem;
  }

  li {
    margin-bottom: 0.5rem;
  }
}

.api-tester-description-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.api-tester-description-section {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.api-tester-description-title {
  font-weight: 600;
  color: var(--nexa-text-primary);
  margin-bottom: 0.5rem;
}

.api-tester-description-text {
  color: var(--nexa-text-secondary);
  line-height: 1.6;
}

// 툴바
.api-tester-toolbar {
  background: var(--nexa-border-color);
}

.api-tester-toolbar-title,
.api-tester-toolbar-subtitle {
  margin: 0;
}

.api-tester-toolbar-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--nexa-text-primary);
}

.api-tester-toolbar-subtitle {
  font-size: 0.875rem;
  color: var(--nexa-text-secondary);
}

// 요청 섹션
.api-tester-request-section {
  display: flex;
  gap: 1rem;
  border: 1px solid var(--nexa-border-color);
  border-bottom-left-radius: 1rem;
  border-bottom-right-radius: 1rem;
  padding: 1rem;
  min-height: 400px;
}

.api-tester-request-panel {
  flex: 1;
}

// 응답 섹션
.api-tester-response-section {
  border: 1px solid var(--nexa-border-color);
  border-radius: 1rem;
  padding: 1rem;
  margin-top: 1rem;
}

// 히스토리 섹션
.api-tester-history-section {
  border: 1px solid var(--nexa-border-color);
  border-radius: 1rem;
  padding: 1rem;
}

// 공통 패널 요소
.api-tester-panel-header {
  background: var(--nexa-surface-hover);
  padding: 3px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.api-tester-panel-content {
  padding: 1rem;
}

.api-tester-panel-title {
  font-weight: 600;
  color: var(--nexa-text-primary);
}

.api-tester-panel-subtitle {
  font-weight: 500;
  color: var(--nexa-text-primary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

// 응답 관련
.api-tester-empty-response {
  text-align: center;
  padding: 2rem;
  color: var(--nexa-text-secondary);
}

.api-tester-response-time {
  display: flex;
  align-items: center;
  color: var(--nexa-text-secondary);
  font-size: 0.875rem;
}

.api-tester-response-headers {
  background: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 0.5rem;
  padding: 0.5rem;
}

.api-tester-header-item {
  display: flex;
  gap: 0.5rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid var(--nexa-border-color);

  &:last-child {
    border-bottom: none;
  }
}

.api-tester-header-key {
  font-weight: 600;
  color: var(--nexa-text-primary);
  min-width: 150px;
}

.api-tester-header-value {
  color: var(--nexa-text-secondary);
  word-break: break-all;
}

.api-tester-response-body {
  background: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 0.5rem;
  padding: 1rem;
  overflow-x: auto;

  pre {
    margin: 0;
    font-family: 'Courier New', monospace;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--nexa-text-primary);
    white-space: pre-wrap;
    word-wrap: break-word;
  }
}

// 히스토리 관련
.api-tester-empty-history {
  text-align: center;
  padding: 2rem;
  color: var(--nexa-text-secondary);
}

.api-tester-history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.api-tester-history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--nexa-surface);
  border: 1px solid var(--nexa-border-color);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: var(--nexa-surface-hover);
  }
}

.api-tester-history-method {
  font-weight: 600;
  color: var(--nexa-text-primary);
  min-width: 60px;
}

.api-tester-history-url {
  flex: 1;
  color: var(--nexa-text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.api-tester-history-time {
  font-size: 0.875rem;
  color: var(--nexa-text-secondary);
  min-width: 80px;
}

// 기타
.api-tester-json-input {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}
</style>
