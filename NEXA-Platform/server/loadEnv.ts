/**
 * 루트(NEXA-Platform/) .env 로드
 * server.js에서 맨 먼저 import하여 dbConfig 등보다 먼저 process.env 설정
 */
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
config({ path: path.resolve(__dirname, '../.env') })
