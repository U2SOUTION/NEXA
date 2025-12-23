// 데이터베이스 스키마 조회 API 라우트
import express from 'express'

const router = express.Router()

/**
 * 데이터베이스 스키마 라우터 생성
 * @param {Function} getDbConnection - 데이터베이스 연결을 반환하는 함수
 * @returns {express.Router} Express 라우터 인스턴스
 */
export default function createDatabaseSchemaRouter(getDbConnection) {
  // 데이터베이스 연결 확인 헬퍼 함수
  function checkConnection(res) {
    const dbConnection = getDbConnection()
    if (!dbConnection) {
      return res.status(503).json({
        error: '데이터베이스 연결이 없습니다.',
        message: '서버가 데이터베이스에 연결되지 않았습니다.',
      })
    }
    return dbConnection
  }

  // GET /api/db/info - 데이터베이스 정보 조회
  router.get('/info', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      // 데이터베이스 이름 조회
      const [dbResult] = await dbConnection.execute('SELECT DATABASE() as dbName')
      const dbName = dbResult[0]?.dbName || null

      // MySQL 버전 조회
      const [versionResult] = await dbConnection.execute('SELECT VERSION() as version')
      const version = versionResult[0]?.version || null

      // 문자셋 정보 조회
      const [charsetResult] = await dbConnection.execute("SHOW VARIABLES LIKE 'character_set_database'")
      const charset = charsetResult[0]?.Value || null

      res.json({
        success: true,
        data: {
          databaseName: dbName,
          version: version,
          charset: charset,
        },
      })
    } catch (error) {
      console.error('[DB Schema] 데이터베이스 정보 조회 실패:', error)
      res.status(500).json({
        error: '데이터베이스 정보 조회 실패',
        message: error.message,
      })
    }
  })

  // GET /api/db/tables - 테이블 목록 조회
  router.get('/tables', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      // 테이블 목록 조회 (INFORMATION_SCHEMA 사용)
      const [tables] = await dbConnection.execute(`
        SELECT
          TABLE_NAME as name,
          TABLE_TYPE as type,
          TABLE_ROWS as rowCount,
          DATA_LENGTH as dataLength,
          INDEX_LENGTH as indexLength,
          CREATE_TIME as createTime,
          UPDATE_TIME as updateTime,
          TABLE_COMMENT as comment
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `)

      // 각 테이블의 컬럼 수 조회
      const tablesWithColumnCount = await Promise.all(
        tables.map(async (table) => {
          const [columns] = await dbConnection.execute(
            `
            SELECT COUNT(*) as count
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
          `,
            [table.name],
          )
          return {
            ...table,
            columnCount: columns[0]?.count || 0,
          }
        }),
      )

      res.json({
        success: true,
        data: tablesWithColumnCount,
      })
    } catch (error) {
      console.error('[DB Schema] 테이블 목록 조회 실패:', error)
      res.status(500).json({
        error: '테이블 목록 조회 실패',
        message: error.message,
      })
    }
  })

  // GET /api/db/tables/:tableName/structure - 테이블 구조 조회 (컬럼, 인덱스, 제약조건 포함)
  router.get('/tables/:tableName/structure', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const tableName = req.params.tableName

      // 테이블 존재 확인
      const [tableCheck] = await dbConnection.execute(
        `
        SELECT TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
      `,
        [tableName],
      )

      if (tableCheck.length === 0) {
        return res.status(404).json({
          error: '테이블을 찾을 수 없습니다.',
          tableName: tableName,
        })
      }

      // 컬럼 정보 조회
      let columns = []
      try {
        const [columnsResult] = await dbConnection.execute(
          `
          SELECT
            COLUMN_NAME as name,
            DATA_TYPE as dataType,
            COLUMN_TYPE as columnType,
            IS_NULLABLE as isNullable,
            COLUMN_DEFAULT as defaultValue,
            COLUMN_KEY as columnKey,
            EXTRA as extra,
            COLUMN_COMMENT as comment,
            ORDINAL_POSITION as position
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
          ORDER BY ORDINAL_POSITION
        `,
          [tableName],
        )
        columns = columnsResult
      } catch (err) {
        console.error('[DB Schema] 컬럼 정보 조회 실패:', err)
        throw new Error(`컬럼 정보 조회 실패: ${err.message}`)
      }

      // 인덱스 정보 조회
      let indexes = []
      try {
        const [indexesResult] = await dbConnection.execute(
          `
          SELECT
            INDEX_NAME as name,
            COLUMN_NAME as columnName,
            NON_UNIQUE as nonUnique,
            SEQ_IN_INDEX as seqInIndex,
            INDEX_TYPE as type,
            INDEX_COMMENT as comment
          FROM INFORMATION_SCHEMA.STATISTICS
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
          ORDER BY INDEX_NAME, SEQ_IN_INDEX
        `,
          [tableName],
        )
        indexes = indexesResult
      } catch (err) {
        console.error('[DB Schema] 인덱스 정보 조회 실패:', err)
        throw new Error(`인덱스 정보 조회 실패: ${err.message}`)
      }

      // 제약조건 정보 조회 (외래키, 기본키, 유니크 등)
      let constraints = []
      try {
        const [constraintsResult] = await dbConnection.execute(
          `
          SELECT
            tc.CONSTRAINT_NAME as name,
            tc.CONSTRAINT_TYPE as type,
            kcu.COLUMN_NAME as columnName
          FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
          LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
            ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
            AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
            AND tc.TABLE_NAME = kcu.TABLE_NAME
          WHERE tc.TABLE_SCHEMA = DATABASE()
            AND tc.TABLE_NAME = ?
          ORDER BY tc.CONSTRAINT_TYPE, tc.CONSTRAINT_NAME, COALESCE(kcu.ORDINAL_POSITION, 0)
        `,
          [tableName],
        )
        constraints = constraintsResult
      } catch (err) {
        console.error('[DB Schema] 제약조건 정보 조회 실패:', err)
        throw new Error(`제약조건 정보 조회 실패: ${err.message}`)
      }

      // 테이블 메타데이터
      let tableMeta = []
      try {
        const [tableMetaResult] = await dbConnection.execute(
          `
          SELECT
            TABLE_ROWS as rowCount,
            DATA_LENGTH as dataLength,
            INDEX_LENGTH as indexLength,
            CREATE_TIME as createTime,
            UPDATE_TIME as updateTime,
            TABLE_COMMENT as comment
          FROM INFORMATION_SCHEMA.TABLES
          WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = ?
        `,
          [tableName],
        )
        tableMeta = tableMetaResult
      } catch (err) {
        console.error('[DB Schema] 테이블 메타데이터 조회 실패:', err)
        throw new Error(`테이블 메타데이터 조회 실패: ${err.message}`)
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
    } catch (error) {
      console.error('[DB Schema] 테이블 구조 조회 실패:', error)
      console.error('[DB Schema] 에러 스택:', error.stack)
      res.status(500).json({
        error: '테이블 구조 조회 실패',
        message: error.message,
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

      const [columns] = await dbConnection.execute(
        `
        SELECT
          COLUMN_NAME as name,
          DATA_TYPE as dataType,
          COLUMN_TYPE as columnType,
          IS_NULLABLE as isNullable,
          COLUMN_DEFAULT as defaultValue,
          COLUMN_KEY as columnKey,
          EXTRA as extra,
          COLUMN_COMMENT as comment,
          ORDINAL_POSITION as position
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `,
        [tableName],
      )

      res.json({
        success: true,
        data: columns,
      })
    } catch (error) {
      console.error('[DB Schema] 컬럼 정보 조회 실패:', error)
      res.status(500).json({
        error: '컬럼 정보 조회 실패',
        message: error.message,
      })
    }
  })

  // GET /api/db/tables/:tableName/indexes - 인덱스 정보만 조회
  router.get('/tables/:tableName/indexes', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const tableName = req.params.tableName

      const [indexes] = await dbConnection.execute(
        `
        SELECT
          INDEX_NAME as name,
          COLUMN_NAME as columnName,
          NON_UNIQUE as nonUnique,
          SEQ_IN_INDEX as seqInIndex,
          INDEX_TYPE as type,
          INDEX_COMMENT as comment
        FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ?
        ORDER BY INDEX_NAME, SEQ_IN_INDEX
      `,
        [tableName],
      )

      res.json({
        success: true,
        data: indexes,
      })
    } catch (error) {
      console.error('[DB Schema] 인덱스 정보 조회 실패:', error)
      res.status(500).json({
        error: '인덱스 정보 조회 실패',
        message: error.message,
      })
    }
  })

  // GET /api/db/tables/:tableName/constraints - 제약조건 정보만 조회
  router.get('/tables/:tableName/constraints', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const tableName = req.params.tableName

      const [constraints] = await dbConnection.execute(
        `
        SELECT
          CONSTRAINT_NAME as name,
          CONSTRAINT_TYPE as type,
          COLUMN_NAME as columnName
        FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
        LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
          ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
          AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA
          AND tc.TABLE_NAME = kcu.TABLE_NAME
        WHERE tc.TABLE_SCHEMA = DATABASE()
          AND tc.TABLE_NAME = ?
        ORDER BY tc.CONSTRAINT_TYPE, tc.CONSTRAINT_NAME, kcu.ORDINAL_POSITION
      `,
        [tableName],
      )

      res.json({
        success: true,
        data: constraints,
      })
    } catch (error) {
      console.error('[DB Schema] 제약조건 정보 조회 실패:', error)
      res.status(500).json({
        error: '제약조건 정보 조회 실패',
        message: error.message,
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
        SELECT
          kcu.TABLE_NAME as fromTable,
          kcu.COLUMN_NAME as fromColumn,
          kcu.REFERENCED_TABLE_NAME as toTable,
          kcu.REFERENCED_COLUMN_NAME as toColumn,
          kcu.CONSTRAINT_NAME as constraintName,
          rc.UPDATE_RULE as updateRule,
          rc.DELETE_RULE as deleteRule
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        INNER JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
          ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
          AND kcu.TABLE_SCHEMA = rc.CONSTRAINT_SCHEMA
        WHERE kcu.TABLE_SCHEMA = DATABASE()
          AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
      `

      const params = []
      if (tableName) {
        query += ` AND (kcu.TABLE_NAME = ? OR kcu.REFERENCED_TABLE_NAME = ?)`
        params.push(tableName, tableName)
      }

      query += ` ORDER BY kcu.TABLE_NAME, kcu.COLUMN_NAME`

      const [relationships] = await dbConnection.execute(query, params)

      res.json({
        success: true,
        data: relationships,
      })
    } catch (error) {
      console.error('[DB Schema] 외래키 관계 조회 실패:', error)
      res.status(500).json({
        error: '외래키 관계 조회 실패',
        message: error.message,
      })
    }
  })

  // GET /api/db/relationships/:tableName - 특정 테이블의 관계만 조회
  router.get('/relationships/:tableName', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      const tableName = req.params.tableName

      const [relationships] = await dbConnection.execute(
        `
        SELECT
          kcu.TABLE_NAME as fromTable,
          kcu.COLUMN_NAME as fromColumn,
          kcu.REFERENCED_TABLE_NAME as toTable,
          kcu.REFERENCED_COLUMN_NAME as toColumn,
          kcu.CONSTRAINT_NAME as constraintName,
          rc.UPDATE_RULE as updateRule,
          rc.DELETE_RULE as deleteRule
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        INNER JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
          ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
          AND kcu.TABLE_SCHEMA = rc.CONSTRAINT_SCHEMA
        WHERE kcu.TABLE_SCHEMA = DATABASE()
          AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
          AND (kcu.TABLE_NAME = ? OR kcu.REFERENCED_TABLE_NAME = ?)
        ORDER BY kcu.TABLE_NAME, kcu.COLUMN_NAME
      `,
        [tableName, tableName],
      )

      res.json({
        success: true,
        data: relationships,
      })
    } catch (error) {
      console.error('[DB Schema] 테이블 관계 조회 실패:', error)
      res.status(500).json({
        error: '테이블 관계 조회 실패',
        message: error.message,
      })
    }
  })

  // GET /api/db/schema - 전체 스키마 정보 조회 (테이블 목록 + 관계)
  router.get('/schema', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      // 테이블 목록 조회
      const [tables] = await dbConnection.execute(`
        SELECT
          TABLE_NAME as name,
          TABLE_TYPE as type,
          TABLE_ROWS as rowCount,
          DATA_LENGTH as dataLength,
          INDEX_LENGTH as indexLength,
          CREATE_TIME as createTime,
          UPDATE_TIME as updateTime,
          TABLE_COMMENT as comment
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_NAME
      `)

      // 외래키 관계 조회
      const [relationships] = await dbConnection.execute(`
        SELECT
          kcu.TABLE_NAME as fromTable,
          kcu.COLUMN_NAME as fromColumn,
          kcu.REFERENCED_TABLE_NAME as toTable,
          kcu.REFERENCED_COLUMN_NAME as toColumn,
          kcu.CONSTRAINT_NAME as constraintName,
          rc.UPDATE_RULE as updateRule,
          rc.DELETE_RULE as deleteRule
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        INNER JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
          ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
          AND kcu.TABLE_SCHEMA = rc.CONSTRAINT_SCHEMA
        WHERE kcu.TABLE_SCHEMA = DATABASE()
          AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
        ORDER BY kcu.TABLE_NAME, kcu.COLUMN_NAME
      `)

      res.json({
        success: true,
        data: {
          tables: tables,
          relationships: relationships,
        },
      })
    } catch (error) {
      console.error('[DB Schema] 전체 스키마 정보 조회 실패:', error)
      res.status(500).json({
        error: '전체 스키마 정보 조회 실패',
        message: error.message,
      })
    }
  })

  // GET /api/db/statistics - 데이터베이스 통계 조회
  router.get('/statistics', async (req, res) => {
    try {
      const dbConnection = checkConnection(res)
      if (!dbConnection) return

      // 테이블 통계
      const [tableStats] = await dbConnection.execute(`
        SELECT
          COUNT(*) as totalTables,
          SUM(TABLE_ROWS) as totalRows,
          SUM(DATA_LENGTH + INDEX_LENGTH) as totalSize
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_TYPE = 'BASE TABLE'
      `)

      // 외래키 통계
      const [fkStats] = await dbConnection.execute(`
        SELECT COUNT(DISTINCT CONSTRAINT_NAME) as totalForeignKeys
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `)

      res.json({
        success: true,
        data: {
          tables: tableStats[0] || {},
          foreignKeys: fkStats[0] || {},
        },
      })
    } catch (error) {
      console.error('[DB Schema] 데이터베이스 통계 조회 실패:', error)
      res.status(500).json({
        error: '데이터베이스 통계 조회 실패',
        message: error.message,
      })
    }
  })

  return router
}
