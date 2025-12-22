import { spawn } from 'child_process'
import http from 'http'
import fs from 'fs'

const frontendUrl = 'http://localhost:9000'
const splashUrl = 'http://localhost:9000/splash.html'
const profileName = 'NEXA-Dev' // 브라우저 프로필 이름

// 바탕화면 아이콘으로 실행되었는지 구분 (바탕화면 아이콘 = 프레젠테이션 모드)
const isDesktopIconMode = process.env.DESKTOP_ICON_MODE === 'true'

// Windows에서 Chrome 경로 찾기
function findChromePath() {
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
    process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe',
  ].filter(Boolean)

  for (const path of possiblePaths) {
    if (fs.existsSync(path)) {
      return path
    }
  }
  return null
}

// 프론트엔드 서버가 준비될 때까지 대기
function waitForFrontend(maxAttempts = 60, interval = 500) {
  return new Promise((resolve) => {
    let attempts = 0
    let resolved = false
    let timeoutId = null

    const checkFrontend = () => {
      if (resolved) return

      attempts++

      if (attempts % 5 === 0) {
        console.log(`🔍 프론트엔드 서버 준비 확인 중... (${attempts}/${maxAttempts})`)
      }

      const req = http.get(frontendUrl, (res) => {
        if (resolved) return

        if (res.statusCode === 200 || res.statusCode === 304) {
          if (!resolved) {
            resolved = true
            console.log('✅ 프론트엔드 서버 준비 완료! (포트 9000)')
            if (timeoutId) clearTimeout(timeoutId)
            resolve()
          }
          return
        }

        if (!resolved && attempts < maxAttempts) {
          timeoutId = setTimeout(checkFrontend, interval)
        } else if (!resolved) {
          resolved = true
          console.log('⚠️  프론트엔드 서버 시작 시간 초과.')
          if (timeoutId) clearTimeout(timeoutId)
          resolve()
        }
      })

      req.on('error', (err) => {
        if (resolved) return

        if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT' || err.code === 'ECONNRESET') {
          if (attempts >= maxAttempts) {
            if (!resolved) {
              resolved = true
              console.log('⚠️  프론트엔드 서버 시작 시간 초과.')
              if (timeoutId) clearTimeout(timeoutId)
              resolve()
            }
          } else {
            timeoutId = setTimeout(checkFrontend, interval)
          }
        } else {
          if (!resolved) {
            resolved = true
            console.error('❌ 프론트엔드 서버 확인 중 오류 발생:', err.message)
            if (timeoutId) clearTimeout(timeoutId)
            resolve()
          }
        }
      })

      req.setTimeout(1000, () => {
        if (resolved) return
        req.destroy()
      })
    }

    checkFrontend()
  })
}

// 브라우저 열기 (바탕화면 아이콘 여부에 따라 다르게 실행)
function openBrowser() {
  const mode = isDesktopIconMode ? '프레젠테이션' : '개발'
  console.log(`🚀 브라우저를 ${mode} 모드로 엽니다... (프로필: ${profileName})`)

  const chromePath = findChromePath()

  if (!chromePath) {
    console.log('⚠️  Chrome을 찾을 수 없습니다. 기본 브라우저로 열겠습니다.')
    const defaultBrowser = spawn('cmd', ['/c', 'start', frontendUrl], {
      detached: true,
      stdio: 'ignore',
    })
    defaultBrowser.unref()
    console.log('✅ 기본 브라우저로 열기 완료!')
    return
  }

  console.log(`✅ Chrome 경로 발견: ${chromePath}`)

  let args = []
  let targetUrl = frontendUrl

  if (isDesktopIconMode) {
    // 바탕화면 아이콘 모드: 전체화면 + 스플래시
    // --app 모드: 주소줄/탭 숨김 (작동함)
    // --start-fullscreen: 전체화면 모드로 시작 (현재 작동하지 않음 - Chrome 옵션 제한)
    // --start-maximized: 창을 최대화 (현재 작동하지 않음 - Chrome 옵션 제한)
    // splash.html에서 JavaScript로 추가 전체화면 요청 (부분적으로만 작동)
    //
    // ⚠️ 알려진 문제:
    // - Chrome의 --start-fullscreen과 --start-maximized 옵션이 --app 모드와 함께 사용될 때
    //   제대로 작동하지 않아 화면이 모니터 전체를 채우지 못함
    // - splash.html의 JavaScript requestFullscreen()도 보안 정책으로 인해
    //   사용자 상호작용 없이는 완전한 전체화면이 보장되지 않음
    //
    // 💡 향후 개선 방안:
    // - Windows API를 사용한 창 크기 강제 조정
    // - 또는 --kiosk 모드 재검토 (개발자 도구와의 호환성 문제 있음)
    console.log('🎬 바탕화면 아이콘 모드: 전체화면 + 스플래시 화면')
    targetUrl = splashUrl
    // 앱 모드 + 전체화면 시도 + 개발자 도구 자동 열기
    // --app: 주소줄/탭 숨김 (✅ 작동함)
    // --start-fullscreen: 전체화면 모드로 시작 (❌ 작동하지 않음)
    // --start-maximized: 창을 최대화 (❌ 작동하지 않음)
    // splash.html에서 JavaScript로 추가 전체화면 요청 시도 (⚠️ 부분적으로만 작동)
    args = [`--profile-directory=${profileName}`, `--app=${targetUrl}`, '--start-fullscreen', '--start-maximized', '--auto-open-devtools-for-tabs', '--disable-infobars']
    // #region agent log
    fetch('http://127.0.0.1:7245/ingest/1f829f3f-c48b-49e7-938a-b15fa607d4c4', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: 'open-browser.js:130', message: 'Desktop icon mode args', data: { args: args.join(' '), targetUrl, isDesktopIconMode }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }),
    }).catch(() => {})
    // #endregion
  } else {
    // 개발 모드 (VS Code 태스크): 일반 창 + 개발자 도구 + 스플래시 없이 바로 메인 페이지
    console.log('💻 개발 모드: 일반 창 + 개발자 도구')
    args = [`--profile-directory=${profileName}`, '--auto-open-devtools-for-tabs', targetUrl]
  }

  console.log(`실행 명령: "${chromePath}" ${args.join(' ')}`)
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/1f829f3f-c48b-49e7-938a-b15fa607d4c4', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location: 'open-browser.js:140', message: 'Chrome spawn command', data: { chromePath, args: args.join(' '), isDesktopIconMode }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }),
  }).catch(() => {})
  // #endregion

  const chromeProcess = spawn(chromePath, args, {
    detached: true,
    stdio: 'ignore',
  })
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/1f829f3f-c48b-49e7-938a-b15fa607d4c4', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location: 'open-browser.js:147', message: 'Chrome process spawned', data: { pid: chromeProcess.pid, spawned: true }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }),
  }).catch(() => {})
  // #endregion

  chromeProcess.unref()

  chromeProcess.on('error', (error) => {
    console.log('⚠️  Chrome 실행 실패:', error.message)
    console.log('기본 브라우저로 열겠습니다...')
    const defaultBrowser = spawn('cmd', ['/c', 'start', targetUrl], {
      detached: true,
      stdio: 'ignore',
    })
    defaultBrowser.unref()
  })

  setTimeout(() => {
    console.log(`✅ Chrome ${mode} 모드로 브라우저 열기 완료!`)
    console.log(`📍 URL: ${targetUrl}`)
    console.log(`📌 프로필: ${profileName}`)
  }, 500)
}

// 메인 실행
async function main() {
  console.log('📋 브라우저 스크립트 시작...')
  try {
    await waitForFrontend()
    openBrowser()
  } catch (error) {
    console.error('❌ 오류 발생:', error)
  } finally {
    process.exit(0)
  }
}

main()
