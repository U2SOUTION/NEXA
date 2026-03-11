/**
 * Postgres 연결 설정 (마이그레이션 후)
 * @see [NEXA-MIGRATE-01] §2.10, §7
 */
import pg from 'pg'

const { Pool } = pg

export const dbConfig = {
  host: process.env.PGHOST || process.env.POSTGRES_HOST || 'localhost',
  user: process.env.PGUSER || process.env.POSTGRES_USER || 'postgres',
  password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD,
  database: process.env.PGDATABASE || process.env.POSTGRES_DATABASE || 'nexa_db',
  port: parseInt(process.env.PGPORT || process.env.POSTGRES_PORT || '5432', 10),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

export const pool = new Pool(dbConfig)

export default { pool, dbConfig }
