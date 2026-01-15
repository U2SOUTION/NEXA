import mysql from 'mysql2/promise'

// 단일 DB 설정을 공유하여 도메인별 서비스에서 재사용
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123412341234',
  database: 'nexa_db',
  port: 3306,
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
