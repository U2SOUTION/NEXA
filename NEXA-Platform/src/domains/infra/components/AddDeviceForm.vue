<template>
  <q-page padding class="bg-custom-dark-card flex flex-center">
    <q-card flat style="max-width: 700px; width: 100%" class="bg-transparent">
      <q-card-section class="q-pb-none">
        <div class="text-h6 text-center">새 디바이스 등록</div>
      </q-card-section>

      <q-card-section>
        <q-stepper
          v-model="registrationStep"
          ref="stepper"
          color="primary"
          animated
          flat
          bordered
          header-nav
          class="bg-transparent text-white"
        >
          <q-step :name="1" title="Wi-Fi 정보 입력" icon="wifi" :done="registrationStep > 1">
            <p class="text-caption q-mb-md text-grey-5">
              등록하려는 기기(ESP32)에서 등록 버튼(또는 특정 동작)을 실행하여<br />
              등록 대기 상태로 만든 후, 아래 정보를 입력하세요.
            </p>
            <q-form @submit="handleWifiSubmit" class="q-gutter-md">
              <q-input
                filled
                dark
                v-model="formData.deviceName"
                label="기기 이름 (식별용)"
                lazy-rules
                :rules="[(val) => !!val || '기기 이름을 입력하세요']"
              />
              <q-input
                filled
                dark
                v-model="formData.wifiSsid"
                label="Wi-Fi 아이디 (SSID)"
                autocomplete="username"
                lazy-rules
                :rules="[(val) => !!val || 'Wi-Fi 아이디를 입력하세요']"
              />
              <q-input
                filled
                dark
                v-model="formData.wifiPassword"
                label="Wi-Fi 비밀번호"
                type="password"
                autocomplete="new-password"
                lazy-rules
                :rules="[(val) => !!val || 'Wi-Fi 비밀번호를 입력하세요']"
              />
              <q-stepper-navigation class="q-pt-md">
                <q-btn
                  label="Wi-Fi 연결 시도"
                  type="submit"
                  color="primary"
                  :loading="loadingWifi"
                />
                <q-btn label="취소" color="grey" @click="cancelAndGoBack" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-form>
          </q-step>

          <q-step
            :name="2"
            title="연결 중"
            icon="settings_ethernet"
            :done="registrationStep > 2"
            caption="잠시만 기다려주세요"
          >
            <div class="text-center q-pa-md">
              <q-spinner-dots color="primary" size="40px" />
              <p class="q-mt-md">Wi-Fi 연결 및 기기 인증 중...</p>
              <p class="text-caption text-grey-5">
                ESP32에서 Wi-Fi 접속 및 서버 연결을 시도합니다.
              </p>
            </div>
            <!-- 이 단계에서는 자동으로 다음으로 넘어가므로 네비게이션 불필요 -->
          </q-step>

          <q-step :name="3" title="최종 등록" icon="check_circle">
            <p class="text-caption q-mb-sm text-grey-5">
              디바이스가 성공적으로 서버에 연결되었습니다.
            </p>
            <q-field
              filled
              dark
              label="디바이스 MAC 주소"
              stack-label
              dense
              readonly
              class="q-mb-md"
            >
              <template v-slot:control>
                <div class="self-center full-width no-outline" tabindex="0">
                  {{ formData.macAddress }}
                </div>
              </template>
            </q-field>
            <q-form @submit="handleFinalRegistration" class="q-gutter-md">
              <q-input
                filled
                dark
                v-model="formData.apiKey"
                label="발급된 API 키 (또는 연동 키)"
                lazy-rules
                :rules="[(val) => !!val || 'API 키를 입력하세요']"
                hint="플랫폼에서 이 디바이스용으로 생성/발급된 키를 입력하세요."
              />
              <q-stepper-navigation class="q-pt-md">
                <q-btn
                  label="등록 완료"
                  type="submit"
                  color="primary"
                  :loading="loadingRegistration"
                />
                <q-btn label="취소" color="grey" @click="cancelAndGoBack" class="q-ml-sm" />
              </q-stepper-navigation>
            </q-form>
          </q-step>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const registrationStep = ref(1)
const loadingWifi = ref(false)
const loadingRegistration = ref(false)

const initialFormData = () => ({
  deviceName: '',
  wifiSsid: '',
  wifiPassword: '',
  macAddress: '', // ESP32로부터 받을 가상 데이터
  apiKey: '',
})

const formData = ref(initialFormData())

const resetForm = () => {
  registrationStep.value = 1
  formData.value = initialFormData()
  loadingWifi.value = false
  loadingRegistration.value = false
}

const cancelAndGoBack = () => {
  resetForm()
  // 현재 경로에 따라 부모 도메인으로 이동
  const path = router.currentRoute.value.path
  if (path.includes('/nexa-board')) {
    router.push('/nexa-board')
  } else {
    router.push('/infra')
  }
}

const handleWifiSubmit = () => {
  loadingWifi.value = true
  registrationStep.value = 2
  console.log('Attempting Wi-Fi connection with:', formData.value)

  // 가상 Wi-Fi 연결 및 MAC 주소 수신 시뮬레이션
  setTimeout(() => {
    loadingWifi.value = false
    formData.value.macAddress = 'AA:BB:CC:DD:EE:FF' // 가상 MAC 주소
    registrationStep.value = 3
    console.log('Simulated MAC address received:', formData.value.macAddress)
  }, 3000) // 3초 후 MAC 주소 수신 및 다음 단계로
}

const handleFinalRegistration = () => {
  loadingRegistration.value = true
  console.log('Final device registration data:', formData.value)
  // TODO: 실제 디바이스 등록 로직 (API 호출 등)
  alert(`디바이스 '${formData.value.deviceName}' 등록 요청됨 (콘솔 확인)`)

  setTimeout(() => {
    // 가상 API 호출 시간
    loadingRegistration.value = false
    resetForm()
    router.push('/')
  }, 1500)
}

// 컴포넌트가 마운트될 때 (즉, 오른쪽 패널에 표시될 때) 폼 초기화
onMounted(() => {
  resetForm()
})
</script>

<style scoped>
/* 필요한 스타일 추가 */
.q-field__control {
  background-color: rgba(0, 0, 0, 0.05);
}
body.body--dark .q-field--readonly .q-field__control {
  background: rgba(255, 255, 255, 0.07) !important;
}
</style>
