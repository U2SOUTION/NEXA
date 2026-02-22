import mysql from 'mysql2/promise'

// 단일 DB 설정을 공유하여 도메인별 서비스에서 재사용
// - 비밀번호 통일(개발 MySQL / NAS MariaDB 둘 다 1234) → 관리 편의
// - NAS에서는 MYSQL_HOST 등만 환경 변수로 넘기면 됨
export const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '1234',
  database: process.env.MYSQL_DATABASE || 'nexa_db',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// 공용 풀
export const pool = mysql.createPool(dbConfig)

export default {
  pool,
  dbConfig,
}
