<template>
  <div class="system-settings">
    <!-- 성능 설정 -->
    <div class="settings-section">
      <div class="text-h6 q-mb-md">성능 설정</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>자동 업데이트</q-item-label>
            <q-item-label caption>시스템 업데이트를 자동으로 확인합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="autoUpdate" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>업데이트 간격</q-item-label>
            <q-item-label caption>자동 업데이트 확인 간격을 설정합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model.number="updateInterval" type="number" dense outlined class="input-field" suffix="ms" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>캐시 사용</q-item-label>
            <q-item-label caption>성능 향상을 위해 캐시를 사용합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="cacheEnabled" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>캐시 크기</q-item-label>
            <q-item-label caption>캐시에 저장할 최대 항목 수입니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model.number="cacheSize" type="number" dense outlined class="input-field" suffix="개" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 보안 설정 -->
    <div class="settings-section">
      <div class="text-h6 q-mb-md">보안 설정</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>인증 필요</q-item-label>
            <q-item-label caption>시스템 접근 시 인증이 필요합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="requireAuth" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>세션 타임아웃</q-item-label>
            <q-item-label caption>세션 유지 시간을 설정합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model.number="sessionTimeout" type="number" dense outlined class="input-field" suffix="초" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>암호화 사용</q-item-label>
            <q-item-label caption>데이터 전송 시 암호화를 사용합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="enableEncryption" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>비밀번호 정책</q-item-label>
            <q-item-label caption>비밀번호 복잡도 요구사항을 설정합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select v-model="passwordPolicy" :options="['low', 'medium', 'high']" dense outlined class="input-field" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 네트워크 설정 -->
    <div class="settings-section">
      <div class="text-h6 q-mb-md">네트워크 설정</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>요청 타임아웃</q-item-label>
            <q-item-label caption>네트워크 요청의 최대 대기 시간입니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model.number="networkTimeout" type="number" dense outlined class="input-field" suffix="ms" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>재시도 횟수</q-item-label>
            <q-item-label caption>실패한 요청의 자동 재시도 횟수입니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model.number="retryCount" type="number" dense outlined class="input-field" suffix="회" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>프록시 사용</q-item-label>
            <q-item-label caption>프록시 서버를 통해 연결합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="enableProxy" />
          </q-item-section>
        </q-item>
        <q-item v-if="enableProxy">
          <q-item-section>
            <q-item-label>프록시 URL</q-item-label>
            <q-item-label caption>프록시 서버 주소를 입력합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model="proxyUrl" dense outlined class="input-field" placeholder="http://proxy.example.com:8080" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 저장소 설정 -->
    <div class="settings-section">
      <div class="text-h6 q-mb-md">저장소 설정</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>자동 저장</q-item-label>
            <q-item-label caption>작업 내용을 자동으로 저장합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="autoSave" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>저장 간격</q-item-label>
            <q-item-label caption>자동 저장 주기입니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model.number="saveInterval" type="number" dense outlined class="input-field" suffix="ms" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>최대 히스토리 크기</q-item-label>
            <q-item-label caption>저장할 최대 변경 이력 개수입니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model.number="maxHistorySize" type="number" dense outlined class="input-field" suffix="개" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>백업 활성화</q-item-label>
            <q-item-label caption>정기적으로 데이터를 백업합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="enableBackup" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 로깅 설정 -->
    <div class="settings-section">
      <div class="text-h6 q-mb-md">로깅 설정</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>로깅 활성화</q-item-label>
            <q-item-label caption>시스템 로그를 기록합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="enableLogging" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>로그 레벨</q-item-label>
            <q-item-label caption>기록할 최소 로그 레벨입니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select v-model="logLevel" :options="['debug', 'info', 'warn', 'error']" dense outlined class="input-field" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>최대 로그 크기</q-item-label>
            <q-item-label caption>로그 파일의 최대 크기입니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model.number="maxLogSize" type="number" dense outlined class="input-field" suffix="MB" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>로그 보관 기간</q-item-label>
            <q-item-label caption>로그를 보관할 기간입니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-input v-model.number="logRetention" type="number" dense outlined class="input-field" suffix="일" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 알림 설정 -->
    <div class="settings-section">
      <div class="text-h6 q-mb-md">알림 설정</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>알림 활성화</q-item-label>
            <q-item-label caption>시스템 알림을 표시합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="enableNotifications" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>소리 알림</q-item-label>
            <q-item-label caption>알림 시 소리를 재생합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="soundEnabled" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>데스크톱 알림</q-item-label>
            <q-item-label caption>브라우저 데스크톱 알림을 사용합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="desktopNotifications" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 접근성 설정 -->
    <div class="settings-section">
      <div class="text-h6 q-mb-md">접근성 설정</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>글자 크기</q-item-label>
            <q-item-label caption>인터페이스의 기본 글자 크기를 설정합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select v-model="fontSize" :options="['small', 'medium', 'large', 'xlarge']" dense outlined class="input-field" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>고대비 모드</q-item-label>
            <q-item-label caption>색상 대비를 높여 가독성을 개선합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="highContrast" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>애니메이션 감소</q-item-label>
            <q-item-label caption>시각적 효과를 줄여 부하를 감소시킵니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="reduceMotion" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>스크린 리더 지원</q-item-label>
            <q-item-label caption>스크린 리더 사용을 위한 최적화를 활성화합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="screenReader" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 개발자 도구 설정 -->
    <div class="settings-section">
      <div class="text-h6 q-mb-md">개발자 도구 설정</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>개발자 도구 활성화</q-item-label>
            <q-item-label caption>개발자 전용 기능을 활성화합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="enableDevTools" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>디버그 정보 표시</q-item-label>
            <q-item-label caption>화면에 디버그 정보를 표시합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="showDebugInfo" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>핫 리로드</q-item-label>
            <q-item-label caption>코드 변경 시 자동으로 새로고침합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-toggle v-model="enableHotReload" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 언어 및 지역 설정 -->
    <div class="settings-section">
      <div class="text-h6 q-mb-md">언어 및 지역 설정</div>
      <q-list>
        <q-item>
          <q-item-section>
            <q-item-label>언어</q-item-label>
            <q-item-label caption>인터페이스 언어를 선택합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select v-model="locale" :options="['ko', 'en', 'ja', 'zh']" dense outlined class="input-field" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>날짜 형식</q-item-label>
            <q-item-label caption>날짜 표시 형식을 설정합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select v-model="dateFormat" :options="['YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY']" dense outlined class="input-field" />
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            <q-item-label>시간 형식</q-item-label>
            <q-item-label caption>시간 표시 형식을 설정합니다</q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-select v-model="timeFormat" :options="['24h', '12h']" dense outlined class="input-field" />
          </q-item-section>
        </q-item>
      </q-list>
    </div>

    <!-- 브라우저 저장소 설정 -->
    <div class="settings-section">
      <div class="text-h6 q-mb-md">브라우저 저장소 설정</div>

      <!-- 로컬 스토리지 -->
      <div class="q-mb-md">
        <div class="text-subtitle2 q-mb-sm">로컬 스토리지</div>
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>로컬 스토리지 사용</q-item-label>
              <q-item-label caption>브라우저 로컬 스토리지를 사용합니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="localStorageEnabled" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>최대 크기</q-item-label>
              <q-item-label caption>로컬 스토리지 최대 사용량 제한입니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-input v-model.number="localStorageMaxSize" type="number" dense outlined class="input-field" suffix="MB" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>자동 정리</q-item-label>
              <q-item-label caption>오래된 데이터를 자동으로 정리합니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="localStorageAutoCleanup" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>정리 간격</q-item-label>
              <q-item-label caption>자동 정리 주기입니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-input v-model.number="localStorageCleanupInterval" type="number" dense outlined class="input-field" suffix="일" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>사용량 표시</q-item-label>
              <q-item-label caption>로컬 스토리지 사용량을 표시합니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="localStorageShowUsage" />
            </q-item-section>
          </q-item>
          <q-item v-if="localStorageShowUsage">
            <q-item-section>
              <q-item-label>현재 사용량</q-item-label>
              <q-item-label caption>{{ localStorageUsageText }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn color="negative" size="sm" label="정리" @click="clearLocalStorage" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- 브라우저 캐시 -->
      <div>
        <div class="text-subtitle2 q-mb-sm">브라우저 캐시</div>
        <q-list>
          <q-item>
            <q-item-section>
              <q-item-label>브라우저 캐시 사용</q-item-label>
              <q-item-label caption>브라우저 캐시를 사용합니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="browserCacheEnabled" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>최대 크기</q-item-label>
              <q-item-label caption>브라우저 캐시 최대 사용량 제한입니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-input v-model.number="browserCacheMaxSize" type="number" dense outlined class="input-field" suffix="MB" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>자동 정리</q-item-label>
              <q-item-label caption>오래된 캐시를 자동으로 정리합니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="browserCacheAutoCleanup" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>정리 간격</q-item-label>
              <q-item-label caption>자동 정리 주기입니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-input v-model.number="browserCacheCleanupInterval" type="number" dense outlined class="input-field" suffix="일" />
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label>사용량 표시</q-item-label>
              <q-item-label caption>브라우저 캐시 사용량을 표시합니다</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="browserCacheShowUsage" />
            </q-item-section>
          </q-item>
          <q-item v-if="browserCacheShowUsage">
            <q-item-section>
              <q-item-label>현재 사용량</q-item-label>
              <q-item-label caption>{{ browserCacheUsageText }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn color="negative" size="sm" label="정리" @click="clearBrowserCache" />
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const props = defineProps({
  settings: {
    type: Object,
    required: true,
  },
})

// 성능 설정
const autoUpdate = ref(props.settings.performance.autoUpdate)
const updateInterval = ref(props.settings.performance.updateInterval)
const cacheEnabled = ref(props.settings.performance.cacheEnabled)
const cacheSize = ref(props.settings.performance.cacheSize)

// 보안 설정
const requireAuth = ref(props.settings.security.requireAuth)
const sessionTimeout = ref(props.settings.security.sessionTimeout)
const enableEncryption = ref(props.settings.security.enableEncryption)
const passwordPolicy = ref(props.settings.security.passwordPolicy)

// 네트워크 설정
const networkTimeout = ref(props.settings.network.timeout)
const retryCount = ref(props.settings.network.retryCount)
const enableProxy = ref(props.settings.network.enableProxy)
const proxyUrl = ref(props.settings.network.proxyUrl)

// 저장소 설정
const autoSave = ref(props.settings.storage.autoSave)
const saveInterval = ref(props.settings.storage.saveInterval)
const maxHistorySize = ref(props.settings.storage.maxHistorySize)
const enableBackup = ref(props.settings.storage.enableBackup)

// 로깅 설정
const enableLogging = ref(props.settings.logging.enableLogging)
const logLevel = ref(props.settings.logging.logLevel)
const maxLogSize = ref(props.settings.logging.maxLogSize)
const logRetention = ref(props.settings.logging.logRetention)

// 알림 설정
const enableNotifications = ref(props.settings.notifications.enableNotifications)
const soundEnabled = ref(props.settings.notifications.soundEnabled)
const desktopNotifications = ref(props.settings.notifications.desktopNotifications)

// 접근성 설정
const fontSize = ref(props.settings.accessibility.fontSize)
const highContrast = ref(props.settings.accessibility.highContrast)
const reduceMotion = ref(props.settings.accessibility.reduceMotion)
const screenReader = ref(props.settings.accessibility.screenReader)

// 개발자 도구 설정
const enableDevTools = ref(props.settings.developer.enableDevTools)
const showDebugInfo = ref(props.settings.developer.showDebugInfo)
const enableHotReload = ref(props.settings.developer.enableHotReload)

// 언어 및 지역 설정
const locale = ref(props.settings.language.locale)
const dateFormat = ref(props.settings.language.dateFormat)
const timeFormat = ref(props.settings.language.timeFormat)

// 브라우저 저장소 설정
const localStorageEnabled = ref(props.settings.browserStorage?.localStorage?.enabled ?? true)
const localStorageMaxSize = ref(props.settings.browserStorage?.localStorage?.maxSize ?? 10)
const localStorageAutoCleanup = ref(props.settings.browserStorage?.localStorage?.autoCleanup ?? true)
const localStorageCleanupInterval = ref(props.settings.browserStorage?.localStorage?.cleanupInterval ?? 7)
const localStorageShowUsage = ref(props.settings.browserStorage?.localStorage?.showUsage ?? true)

const browserCacheEnabled = ref(props.settings.browserStorage?.browserCache?.enabled ?? true)
const browserCacheMaxSize = ref(props.settings.browserStorage?.browserCache?.maxSize ?? 100)
const browserCacheAutoCleanup = ref(props.settings.browserStorage?.browserCache?.autoCleanup ?? true)
const browserCacheCleanupInterval = ref(props.settings.browserStorage?.browserCache?.cleanupInterval ?? 30)
const browserCacheShowUsage = ref(props.settings.browserStorage?.browserCache?.showUsage ?? true)

// 로컬 스토리지 사용량 계산
const localStorageUsage = ref(0)
const localStorageUsageText = computed(() => {
  const sizeInMB = (localStorageUsage.value / (1024 * 1024)).toFixed(2)
  return `${sizeInMB} MB / ${localStorageMaxSize.value} MB`
})

// 브라우저 캐시 사용량 (추정값, 실제로는 Storage API로 확인 가능)
const browserCacheUsage = ref(0)
const browserCacheUsageText = computed(() => {
  const sizeInMB = (browserCacheUsage.value / (1024 * 1024)).toFixed(2)
  return `${sizeInMB} MB / ${browserCacheMaxSize.value} MB (추정값)`
})

// 로컬 스토리지 사용량 계산 함수
function calculateLocalStorageUsage() {
  try {
    let total = 0
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage[key].length + key.length
      }
    }
    localStorageUsage.value = total
  } catch (error) {
    console.error('로컬 스토리지 사용량 계산 실패:', error)
    localStorageUsage.value = 0
  }
}

// 로컬 스토리지 정리 함수
function clearLocalStorage() {
  $q.dialog({
    title: '로컬 스토리지 정리',
    message: '모든 로컬 스토리지 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    try {
      localStorage.clear()
      calculateLocalStorageUsage()
      $q.notify({
        type: 'positive',
        message: '로컬 스토리지가 정리되었습니다',
        position: 'top',
      })
    } catch (error) {
      console.error('로컬 스토리지 정리 실패:', error)
      $q.notify({
        type: 'negative',
        message: '로컬 스토리지 정리에 실패했습니다',
        position: 'top',
      })
    }
  })
}

// 브라우저 캐시 정리 함수
function clearBrowserCache() {
  $q.dialog({
    title: '브라우저 캐시 정리',
    message: '브라우저 캐시를 정리하시겠습니까? 페이지가 새로고침될 수 있습니다.',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    try {
      // Service Worker 캐시 정리 (있는 경우)
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name)
          })
        })
      }

      // 페이지 새로고침
      window.location.reload()
    } catch (error) {
      console.error('브라우저 캐시 정리 실패:', error)
      $q.notify({
        type: 'negative',
        message: '브라우저 캐시 정리에 실패했습니다',
        position: 'top',
      })
    }
  })
}

// 컴포넌트 마운트 시 사용량 계산
onMounted(() => {
  if (localStorageShowUsage.value) {
    calculateLocalStorageUsage()
  }

  // 브라우저 캐시 사용량은 정확히 측정하기 어려우므로 추정값 사용
  // 실제로는 Storage API나 Cache API를 통해 확인 가능
  if (browserCacheShowUsage.value && 'storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then((estimate) => {
      browserCacheUsage.value = estimate.usage || 0
    })
  }
})

// 모든 설정 변경 감시
watch(
  [
    autoUpdate,
    updateInterval,
    cacheEnabled,
    cacheSize,
    requireAuth,
    sessionTimeout,
    enableEncryption,
    passwordPolicy,
    networkTimeout,
    retryCount,
    enableProxy,
    proxyUrl,
    autoSave,
    saveInterval,
    maxHistorySize,
    enableBackup,
    enableLogging,
    logLevel,
    maxLogSize,
    logRetention,
    enableNotifications,
    soundEnabled,
    desktopNotifications,
    fontSize,
    highContrast,
    reduceMotion,
    screenReader,
    enableDevTools,
    showDebugInfo,
    enableHotReload,
    locale,
    dateFormat,
    timeFormat,
    localStorageEnabled,
    localStorageMaxSize,
    localStorageAutoCleanup,
    localStorageCleanupInterval,
    localStorageShowUsage,
    browserCacheEnabled,
    browserCacheMaxSize,
    browserCacheAutoCleanup,
    browserCacheCleanupInterval,
    browserCacheShowUsage,
  ],
  () => {
    // 시스템 설정 변경 처리
    const updatedSettings = {
      performance: {
        autoUpdate: autoUpdate.value,
        updateInterval: updateInterval.value,
        cacheEnabled: cacheEnabled.value,
        cacheSize: cacheSize.value,
      },
      security: {
        requireAuth: requireAuth.value,
        sessionTimeout: sessionTimeout.value,
        enableEncryption: enableEncryption.value,
        passwordPolicy: passwordPolicy.value,
      },
      network: {
        timeout: networkTimeout.value,
        retryCount: retryCount.value,
        enableProxy: enableProxy.value,
        proxyUrl: proxyUrl.value,
      },
      storage: {
        autoSave: autoSave.value,
        saveInterval: saveInterval.value,
        maxHistorySize: maxHistorySize.value,
        enableBackup: enableBackup.value,
      },
      logging: {
        enableLogging: enableLogging.value,
        logLevel: logLevel.value,
        maxLogSize: maxLogSize.value,
        logRetention: logRetention.value,
      },
      notifications: {
        enableNotifications: enableNotifications.value,
        soundEnabled: soundEnabled.value,
        desktopNotifications: desktopNotifications.value,
      },
      accessibility: {
        fontSize: fontSize.value,
        highContrast: highContrast.value,
        reduceMotion: reduceMotion.value,
        screenReader: screenReader.value,
      },
      developer: {
        enableDevTools: enableDevTools.value,
        showDebugInfo: showDebugInfo.value,
        enableHotReload: enableHotReload.value,
      },
      language: {
        locale: locale.value,
        dateFormat: dateFormat.value,
        timeFormat: timeFormat.value,
      },
      browserStorage: {
        localStorage: {
          enabled: localStorageEnabled.value,
          maxSize: localStorageMaxSize.value,
          autoCleanup: localStorageAutoCleanup.value,
          cleanupInterval: localStorageCleanupInterval.value,
          showUsage: localStorageShowUsage.value,
        },
        browserCache: {
          enabled: browserCacheEnabled.value,
          maxSize: browserCacheMaxSize.value,
          autoCleanup: browserCacheAutoCleanup.value,
          cleanupInterval: browserCacheCleanupInterval.value,
          showUsage: browserCacheShowUsage.value,
        },
      },
    }
    // TODO: 설정 변경 시 서버에 저장하는 로직 구현
    console.log('시스템 설정 변경:', updatedSettings)
  },
)

// 사용량 표시 토글이 변경될 때 사용량 재계산
watch(localStorageShowUsage, (newVal) => {
  if (newVal) {
    calculateLocalStorageUsage()
  }
})

watch(browserCacheShowUsage, (newVal) => {
  if (newVal && 'storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then((estimate) => {
      browserCacheUsage.value = estimate.usage || 0
    })
  }
})
</script>

<style lang="scss" scoped>
.system-settings {
  .settings-section {
    margin-bottom: 2rem;

    &:last-child {
      margin-bottom: 0;
    }

    .text-h6 {
      color: var(--nexa-text-primary);
      font-weight: 600;
    }

    .text-subtitle2 {
      color: var(--nexa-text-primary);
      font-weight: 500;
    }

    .q-item {
      .q-item__label {
        color: var(--nexa-text-primary);
      }

      .q-item__label--caption {
        color: var(--nexa-text-secondary);
      }
    }

    .q-item-label {
      color: var(--nexa-text-primary);
    }

    .q-item-label--caption {
      color: var(--nexa-text-secondary);
    }

    .input-field {
      width: 150px;

      // 입력 필드 텍스트 색상
      :deep(.q-field__native) {
        color: var(--nexa-text-hint);
      }

      // 셀렉트 선택된 값 색상
      :deep(.q-field__native) {
        color: var(--nexa-text-hint);
      }
    }
  }
}
</style>
