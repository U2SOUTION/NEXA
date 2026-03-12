/**
 * 루트(NEXA-Platform/) .env 로드
 * server.js에서 맨 먼저 import하여 dbConfig 등보다 먼저 process.env 설정
 *
 * - 로컬: server/ 기준 상위 .env (NEXA-Platform/.env)
 * - 컨테이너: 이미지에 .env가 없으므로 docker-compose의 env_file 또는 environment로 주입된 값을 사용.
 *   여러 경로를 시도해, 볼륨으로 .env가 마운트된 경우에도 로드되도록 함.
 */
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const cwd = process.cwd()

const candidates = [
  path.resolve(__dirname, '../.env'),           // server/ 기준 상위 = NEXA-Platform/.env
  path.resolve(cwd, '.env'),                    // cwd가 루트일 때
  path.resolve(cwd, '..', '.env'),              // cwd가 server/일 때 (npm run dev:server)
]

let loaded = false
let loadedPath: string | null = null
for (const envPath of candidates) {
  try {
    if (fs.existsSync(envPath)) {
      const result = config({ path: envPath })
      if (result.parsed && Object.keys(result.parsed).length > 0) {
        loaded = true
        loadedPath = envPath
        break
      }
    }
  } catch {
    // 다음 경로 시도
  }
}

if (process.env.NODE_ENV !== 'production') {
  if (loaded && loadedPath) {
    console.log('[loadEnv] .env 로드됨:', loadedPath)
  } else {
    console.warn('[loadEnv] .env 파일을 찾지 못함. 시도한 경로:', candidates)
    const hasPg = process.env.PGHOST ?? process.env.PGUSER ?? process.env.PGPASSWORD
    if (!hasPg) {
      console.warn('[loadEnv] PG* 환경 변수도 없음. 컨테이너라면 env_file 또는 environment 확인.')
    }
  }
}
