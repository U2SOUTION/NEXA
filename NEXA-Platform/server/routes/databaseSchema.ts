// 데이터베이스 스키마 조회 API 라우트
import { Router } from 'express'
import { errMessage } from '@/utils/errUtils.js'
import type { ResponseLike } from '@/types/request-response.js'

const router = Router()

type DbConnection = { query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }> }
interface DbInfoRow { dbName?: string }
interface VersionRow { version?: string }
interface CharsetRow { charset?: string }
interface TableRow { name: string; [k: string]: unknown }
interface CountRow { count?: string | number }

/**
 * 데이터베이스 스키마 라우터 생성
 */
export default function createDatabaseSchemaRouter(getDbConnection: () => DbConnection | null) {
  function checkConnection(res: ResponseLike): DbConnection | null {
    const dbConnection = getDbConnection()
    if (!dbConnection) {
      res.status(503).json({
        error: '데이터베이스 연결이 없습니다.',
        message: '서버가 데이터베이스에 연결되지 않았습니다.',
      })
      return null
    }
    return dbConnection
  }

  // POST /api/db/query - SQL 쿼리 실행
  router.post('/query', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const { query } = req.body

      // 유효성 검사
      if (!query || !query.trim()) {
        return res.status(400).json({
          error: '쿼리가 필요합니다.',
        })
      }

      // 위험한 쿼리 차단 (선택적)
      const dangerousKeywords = ['DROP DATABASE', 'TRUNCATE DATABASE', 'DELETE FROM', 'DROP TABLE']
      const upperQuery = query.toUpperCase()
      const hasDangerousKeyword = dangerousKeywords.some((keyword) => upperQuery.includes(keyword))

      // DELETE와 DROP TABLE은 허용하되, 주의 메시지 포함
      // 실제로는 더 세밀한 권한 관리가 필요할 수 있음

      console.log('[DB Schema] 쿼리 실행:', query.substring(0, 100) + '...')

      // 쿼리 실행 (Postgres: pool.query → result.rows)
      const result = await dbConnection.query(query)
      const data = Array.isArray(result.rows) ? result.rows : [result.rows]

      res.json({
        success: true,
        data,
        message: '쿼리가 성공적으로 실행되었습니다.',
      })
    } catch (error: unknown) {
      console.error('[DB Schema] 쿼리 실행 실패:', error)
      res.status(500).json({
        error: '쿼리 실행 실패',
        message: errMessage(error),
      })
    }
  })

  // GET /api/db/info - 데이터베이스 정보 조회 (Postgres)
  router.get('/info', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const { rows: dbRows } = await dbConnection.query('SELECT current_database() as "dbName"')
      const dbRow = dbRows[0] as DbInfoRow | undefined
      const dbName = dbRow?.dbName ?? null

      const { rows: versionRows } = await dbConnection.query('SELECT version() as version')
      const verRow = versionRows[0] as VersionRow | undefined
      const version = verRow?.version ?? null

      const { rows: encRows } = await dbConnection.query('SELECT current_setting(\'server_encoding\') as charset')
      const encRow = encRows[0] as CharsetRow | undefined
      const charset = encRow?.charset ?? null

      res.json({
        success: true,
        data: {
          databaseName: dbName,
          version,
          charset,
        },
      })
    } catch (error: unknown) {
      console.error('[DB Schema] 데이터베이스 정보 조회 실패:', error)
      res.status(500).json({
        error: '데이터베이스 정보 조회 실패',
        message: errMessage(error),
      })
    }
  })

  // GET /api/db/tables - 테이블 목록 조회 (Postgres)
  router.get('/tables', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const { rows: tables } = await dbConnection.query(`
        SELECT
          t.tablename as name,
          'BASE TABLE' as type,
          COALESCE(s.n_live_tup::bigint, 0) as "rowCount",
          COALESCE(pg_total_relation_size(quote_ident(t.schemaname)||'.'||quote_ident(t.tablename)), 0) as "dataLength",
          0 as "indexLength",
          NULL as "createTime",
          NULL as "updateTime",
          obj_description((quote_ident(t.schemaname)||'.'||quote_ident(t.tablename))::regclass, 'pg_class') as comment
        FROM pg_tables t
        LEFT JOIN pg_stat_user_tables s ON s.schemaname = t.schemaname AND s.relname = t.tablename
        WHERE t.schemaname = 'public'
        ORDER BY t.tablename
      `)

      const tablesTyped = tables as TableRow[]
      const tablesWithColumnCount = await Promise.all(
        tablesTyped.map(async (table) => {
          const { rows: colRows } = await dbConnection.query(
            'SELECT COUNT(*) as count FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2',
            ['public', table.name],
          )
          const cr = colRows[0] as CountRow | undefined
          return {
            ...table,
            columnCount: parseInt(String(cr?.count ?? 0), 10),
          }
        }),
      )

      res.json({
        success: true,
        data: tablesWithColumnCount,
      })
    } catch (error: unknown) {
      console.error('[DB Schema] 테이블 목록 조회 실패:', error)
      res.status(500).json({
        error: '테이블 목록 조회 실패',
        message: errMessage(error),
      })
    }
  })

  // POST /api/db/tables - 테이블 생성
  router.post('/tables', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const { tableName, columns, comment } = req.body

      // 유효성 검사
      if (!tableName || !tableName.trim()) {
        return res.status(400).json({
          error: '테이블명이 필요합니다.',
        })
      }

      if (!columns || !Array.isArray(columns) || columns.length === 0) {
        return res.status(400).json({
          error: '최소 1개 이상의 컬럼이 필요합니다.',
        })
      }

      // CREATE TABLE 쿼리 생성
      const sanitizedTableName = tableName.trim().replace(/[^a-zA-Z0-9_]/g, '')
      if (!sanitizedTableName) {
        return res.status(400).json({
          error: '유효하지 않은 테이블명입니다.',
        })
      }

      // 컬럼 정의 생성
      const columnDefinitions = columns
        .map((col) => {
          if (!col.name || !col.name.trim()) {
            return null
          }
          const sanitizedColumnName = col.name.trim().replace(/[^a-zA-Z0-9_]/g, '')
          if (!sanitizedColumnName) {
            return null
          }

          const dataType = col.dataType || 'VARCHAR(255)'
          const nullable = col.isNullable !== false ? 'NULL' : 'NOT NULL'
          const defaultValue = col.defaultValue ? `DEFAULT '${col.defaultValue.replace(/'/g, "''")}'` : ''
          // Postgres: COMMENT is separate (COMMENT ON COLUMN); omit from column def
          return `${sanitizedColumnName} ${dataType} ${nullable} ${defaultValue}`.trim()
        })
        .filter((def) => def !== null)

      if (columnDefinitions.length === 0) {
        return res.status(400).json({
          error: '유효한 컬럼이 없습니다.',
        })
      }

      // CREATE TABLE 쿼리 (Postgres: 백틱 없음, ENGINE/CHARSET 없음)
      const createTableQuery = `CREATE TABLE "${sanitizedTableName.replace(/"/g, '""')}" (\n  ${columnDefinitions.join(',\n  ')}\n)`
      console.log('[DB Schema] 테이블 생성 쿼리:', createTableQuery)
      await dbConnection.query(createTableQuery)

      res.json({
        success: true,
        message: `테이블 "${sanitizedTableName}"이(가) 생성되었습니다.`,
        data: {
          tableName: sanitizedTableName,
        },
      })
    } catch (error: unknown) {
      console.error('[DB Schema] 테이블 생성 실패:', error)
      res.status(500).json({
        error: '테이블 생성 실패',
        message: errMessage(error),
      })
    }
  })

  // GET /api/db/tables/:tableName/structure - 테이블 구조 조회 (컬럼, 인덱스, 제약조건 포함)
  router.get('/tables/:tableName/structure', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const tableName = req.params.tableName

      const { rows: tableCheck } = await dbConnection.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`,
        [tableName],
      )

      if (tableCheck.length === 0) {
        return res.status(404).json({
          error: '테이블을 찾을 수 없습니다.',
          tableName: tableName,
        })
      }

      let columns = []
      try {
        const { rows: columnsResult } = await dbConnection.query(
          `SELECT column_name as name, data_type as "dataType", udt_name as "columnType",
           is_nullable as "isNullable", column_default as "defaultValue", NULL as "columnKey",
           NULL as extra, NULL as comment, ordinal_position as position
           FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
          [tableName],
        )
        columns = columnsResult
      } catch (err: unknown) {
        console.error('[DB Schema] 컬럼 정보 조회 실패:', err)
        throw new Error(`컬럼 정보 조회 실패: ${errMessage(err)}`)
      }

      let indexes = []
      try {
        const { rows: indexesResult } = await dbConnection.query(
          `SELECT i.relname as name, a.attname as "columnName", NOT ix.indisunique as "nonUnique",
           row_number() OVER (PARTITION BY i.relname ORDER BY array_position(ix.indkey, a.attnum))::int as "seqInIndex",
           am.amname as type, NULL as comment
           FROM pg_index ix
           JOIN pg_class i ON i.oid = ix.indexrelid AND i.relkind = 'i'
           JOIN pg_class t ON t.oid = ix.indrelid AND t.relname = $1
           JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname = 'public'
           JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey) AND a.attisdropped = false
           JOIN pg_am am ON am.oid = i.relam
           ORDER BY i.relname, "seqInIndex"`,
          [tableName],
        )
        indexes = indexesResult
      } catch (err: unknown) {
        console.error('[DB Schema] 인덱스 정보 조회 실패:', err)
        throw new Error(`인덱스 정보 조회 실패: ${errMessage(err)}`)
      }

      let constraints = []
      try {
        const { rows: constraintsResult } = await dbConnection.query(
          `SELECT tc.constraint_name as name, tc.constraint_type as type, kcu.column_name as "columnName"
           FROM information_schema.table_constraints tc
           LEFT JOIN information_schema.key_column_usage kcu
             ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema AND tc.table_name = kcu.table_name
           WHERE tc.table_schema = 'public' AND tc.table_name = $1
           ORDER BY tc.constraint_type, tc.constraint_name, kcu.ordinal_position`,
          [tableName],
        )
        constraints = constraintsResult
      } catch (err: unknown) {
        console.error('[DB Schema] 제약조건 정보 조회 실패:', err)
        throw new Error(`제약조건 정보 조회 실패: ${errMessage(err)}`)
      }

      let tableMeta = []
      try {
        const { rows: tableMetaResult } = await dbConnection.query(
          `SELECT COALESCE(s.n_live_tup::bigint, 0) as "rowCount",
           COALESCE(pg_total_relation_size(('public.'||$1)::regclass), 0) as "dataLength", 0 as "indexLength",
           NULL as "createTime", NULL as "updateTime", obj_description(('public.'||$1)::regclass, 'pg_class') as comment
           FROM pg_stat_user_tables s WHERE s.schemaname = 'public' AND s.relname = $1`,
          [tableName],
        )
        tableMeta = tableMetaResult.length ? tableMetaResult : [{ rowCount: 0, dataLength: 0, indexLength: 0, createTime: null, updateTime: null, comment: null }]
      } catch (err: unknown) {
        console.error('[DB Schema] 테이블 메타데이터 조회 실패:', err)
        throw new Error(`테이블 메타데이터 조회 실패: ${errMessage(err)}`)
      }

      res.json({
        success: true,
        data: {
          tableName: tableName,
          metadata: tableMeta[0] || {},
          columns: columns,
          indexes: indexes,
          constraints: constraints,
        },
      })
    } catch (error: unknown) {
      console.error('[DB Schema] 테이블 구조 조회 실패:', error)
      console.error('[DB Schema] 에러 스택:', error instanceof Error ? error.stack : String(error))
      res.status(500).json({
        error: '테이블 구조 조회 실패',
        message: errMessage(error),
        tableName: req.params.tableName,
      })
    }
  })

  // GET /api/db/tables/:tableName/columns - 컬럼 정보만 조회
  router.get('/tables/:tableName/columns', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const tableName = req.params.tableName

      const { rows: columns } = await dbConnection.query(
        `SELECT column_name as name, data_type as "dataType", udt_name as "columnType",
         is_nullable as "isNullable", column_default as "defaultValue", NULL as "columnKey", NULL as extra, NULL as comment, ordinal_position as position
         FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 ORDER BY ordinal_position`,
        [tableName],
      )

      res.json({
        success: true,
        data: columns,
      })
    } catch (error: unknown) {
      console.error('[DB Schema] 컬럼 정보 조회 실패:', error)
      res.status(500).json({
        error: '컬럼 정보 조회 실패',
        message: errMessage(error),
      })
    }
  })

  // GET /api/db/tables/:tableName/indexes - 인덱스 정보만 조회
  router.get('/tables/:tableName/indexes', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const tableName = req.params.tableName

      const { rows: indexes } = await dbConnection.query(
        `SELECT i.relname as name, a.attname as "columnName", NOT ix.indisunique as "nonUnique",
         row_number() OVER (PARTITION BY i.relname ORDER BY array_position(ix.indkey, a.attnum))::int as "seqInIndex",
         am.amname as type, NULL as comment
         FROM pg_index ix
         JOIN pg_class i ON i.oid = ix.indexrelid AND i.relkind = 'i'
         JOIN pg_class t ON t.oid = ix.indrelid AND t.relname = $1
         JOIN pg_namespace n ON n.oid = t.relnamespace AND n.nspname = 'public'
         JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey) AND a.attisdropped = false
         JOIN pg_am am ON am.oid = i.relam
         ORDER BY i.relname, "seqInIndex"`,
        [tableName],
      )

      res.json({
        success: true,
        data: indexes,
      })
    } catch (error: unknown) {
      console.error('[DB Schema] 인덱스 정보 조회 실패:', error)
      res.status(500).json({
        error: '인덱스 정보 조회 실패',
        message: errMessage(error),
      })
    }
  })

  // GET /api/db/tables/:tableName/constraints - 제약조건 정보만 조회
  router.get('/tables/:tableName/constraints', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const tableName = req.params.tableName

      const { rows: constraints } = await dbConnection.query(
        `SELECT tc.constraint_name as name, tc.constraint_type as type, kcu.column_name as "columnName"
         FROM information_schema.table_constraints tc
         LEFT JOIN information_schema.key_column_usage kcu
           ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema AND tc.table_name = kcu.table_name
         WHERE tc.table_schema = 'public' AND tc.table_name = $1
         ORDER BY tc.constraint_type, tc.constraint_name, kcu.ordinal_position`,
        [tableName],
      )

      res.json({
        success: true,
        data: constraints,
      })
    } catch (error: unknown) {
      console.error('[DB Schema] 제약조건 정보 조회 실패:', error)
      res.status(500).json({
        error: '제약조건 정보 조회 실패',
        message: errMessage(error),
      })
    }
  })

  // GET /api/db/relationships - 외래키 관계 조회
  router.get('/relationships', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const tableName = req.query.tableName // 선택적: 특정 테이블의 관계만 조회

      let query = `
        SELECT kcu.table_name as "fromTable", kcu.column_name as "fromColumn",
          ccu.table_name as "toTable", ccu.column_name as "toColumn",
          tc.constraint_name as "constraintName", rc.update_rule as "updateRule", rc.delete_rule as "deleteRule"
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
        JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name AND tc.table_schema = rc.constraint_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
      `
      const params = []
      if (tableName) {
        query += ` AND (kcu.table_name = $1 OR ccu.table_name = $2)`
        params.push(tableName, tableName)
      }
      query += ` ORDER BY kcu.table_name, kcu.column_name`
      const { rows: relationships } = await dbConnection.query(query, params)

      res.json({
        success: true,
        data: relationships,
      })
    } catch (error: unknown) {
      console.error('[DB Schema] 외래키 관계 조회 실패:', error)
      res.status(500).json({
        error: '외래키 관계 조회 실패',
        message: errMessage(error),
      })
    }
  })

  // GET /api/db/relationships/:tableName - 특정 테이블의 관계만 조회
  router.get('/relationships/:tableName', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const tableName = req.params.tableName

      const { rows: relationships } = await dbConnection.query(
        `SELECT kcu.table_name as "fromTable", kcu.column_name as "fromColumn",
         ccu.table_name as "toTable", ccu.column_name as "toColumn",
         tc.constraint_name as "constraintName", rc.update_rule as "updateRule", rc.delete_rule as "deleteRule"
         FROM information_schema.table_constraints tc
         JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
         JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
         JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name AND tc.table_schema = rc.constraint_schema
         WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
         AND (kcu.table_name = $1 OR ccu.table_name = $2)
         ORDER BY kcu.table_name, kcu.column_name`,
        [tableName, tableName],
      )

      res.json({
        success: true,
        data: relationships,
      })
    } catch (error: unknown) {
      console.error('[DB Schema] 테이블 관계 조회 실패:', error)
      res.status(500).json({
        error: '테이블 관계 조회 실패',
        message: errMessage(error),
      })
    }
  })

  // GET /api/db/schema - 전체 스키마 정보 조회 (테이블 목록 + 관계)
  router.get('/schema', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const { rows: tables } = await dbConnection.query(`
        SELECT t.tablename as name, 'BASE TABLE' as type,
          COALESCE(s.n_live_tup::bigint, 0) as "rowCount",
          COALESCE(pg_total_relation_size(quote_ident(t.schemaname)||'.'||quote_ident(t.tablename)), 0) as "dataLength",
          0 as "indexLength", NULL as "createTime", NULL as "updateTime",
          obj_description((quote_ident(t.schemaname)||'.'||quote_ident(t.tablename))::regclass, 'pg_class') as comment
        FROM pg_tables t
        LEFT JOIN pg_stat_user_tables s ON s.schemaname = t.schemaname AND s.relname = t.tablename
        WHERE t.schemaname = 'public' ORDER BY t.tablename
      `)

      const { rows: relationships } = await dbConnection.query(`
        SELECT kcu.table_name as "fromTable", kcu.column_name as "fromColumn",
          ccu.table_name as "toTable", ccu.column_name as "toColumn",
          tc.constraint_name as "constraintName", rc.update_rule as "updateRule", rc.delete_rule as "deleteRule"
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name AND tc.table_schema = ccu.table_schema
        JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name AND tc.table_schema = rc.constraint_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
        ORDER BY kcu.table_name, kcu.column_name
      `)

      res.json({
        success: true,
        data: {
          tables: tables,
          relationships: relationships,
        },
      })
    } catch (error: unknown) {
      console.error('[DB Schema] 전체 스키마 정보 조회 실패:', error)
      res.status(500).json({
        error: '전체 스키마 정보 조회 실패',
        message: errMessage(error),
      })
    }
  })

  // GET /api/db/statistics - 데이터베이스 통계 조회
  router.get('/statistics', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const { rows: tableStats } = await dbConnection.query(`
        SELECT COUNT(*)::bigint as "totalTables",
          COALESCE(SUM(n_live_tup), 0)::bigint as "totalRows",
          COALESCE(SUM(pg_total_relation_size((schemaname||'.'||relname)::regclass)), 0)::bigint as "totalSize"
        FROM pg_stat_user_tables WHERE schemaname = 'public'
      `)

      const { rows: fkStats } = await dbConnection.query(`
        SELECT COUNT(DISTINCT tc.constraint_name)::bigint as "totalForeignKeys"
        FROM information_schema.table_constraints tc
        JOIN information_schema.referential_constraints rc ON tc.constraint_name = rc.constraint_name
        WHERE tc.table_schema = 'public' AND tc.constraint_type = 'FOREIGN KEY'
      `)

      res.json({
        success: true,
        data: {
          tables: tableStats[0] || {},
          foreignKeys: fkStats[0] || {},
        },
      })
    } catch (error: unknown) {
      console.error('[DB Schema] 데이터베이스 통계 조회 실패:', error)
      res.status(500).json({
        error: '데이터베이스 통계 조회 실패',
        message: errMessage(error),
      })
    }
  })

  // POST /api/db/backup - Postgres: pg_dump 또는 DBeaver 사용 안내
  router.post('/backup', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return
      const { rows: r } = await dbConnection.query('SELECT current_database() as db')
      const dbRow = r[0] as { db?: string } | undefined
      const dbName = dbRow?.db ?? 'nexa_db'
      const dateStr = new Date().toISOString().split('T')[0]
      const hint = `-- Postgres 백업은 서버에서 pg_dump 또는 DBeaver(Tools → Backup)를 사용하세요.\n`
        + `-- 예: pg_dump -U postgres -d ${dbName} -F c -f ${dbName}_backup_${dateStr}.dump\n`
      res.setHeader('Content-Type', 'application/sql')
      res.setHeader('Content-Disposition', `attachment; filename="${dbName}_backup_${dateStr}.sql"`)
      res.send(hint)
    } catch (error: unknown) {
      console.error('[DB Schema] 백업 안내 실패:', error)
      res.status(500).json({ error: '백업 안내 실패', message: errMessage(error) })
    }
  })

  return router
}
