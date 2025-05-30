import { createServer } from 'http'
import { pool } from './mysql'
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2'

interface TableInfo {
  name: string
  columns: ColumnInfo[]
  indexes: IndexInfo[]
  foreignKeys: ForeignKeyInfo[]
  description?: string
}

interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  defaultValue: string | null
  description?: string
  maxLength?: number
  precision?: number
  scale?: number
}

interface IndexInfo {
  name: string
  columns: string[]
  unique: boolean
  type: string
}

interface ForeignKeyInfo {
  name: string
  columns: string[]
  referencedTable: string
  referencedColumns: string[]
  onDelete: string
  onUpdate: string
}

interface TableRelations {
  table: string
  references: {
    table: string
    columns: string[]
    type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  }[]
  referencedBy: {
    table: string
    columns: string[]
    type: 'one-to-one' | 'one-to-many' | 'many-to-many'
  }[]
}

class MCPServer {
  private server: any
  private port: number
  private schema: { [key: string]: TableInfo } = {}
  private relations: { [key: string]: TableRelations } = {}
  private isInitialized: boolean = false

  constructor(port: number = 3009) {
    this.port = port
    this.server = createServer(this.handleRequest.bind(this))
    this.initializeSchema()
  }

  private async initializeSchema() {
    try {
      // Test database connection
      await pool.query('SELECT 1')
      console.log('Database connection successful')

      // Get all tables
      const [tables] = await pool.query<RowDataPacket[]>(`
        SELECT 
          table_name as TABLE_NAME,
          table_comment as TABLE_COMMENT
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
          AND table_type = 'BASE TABLE'
      `)

      console.log(`Found ${tables.length} tables`)

      for (const table of tables) {
        const tableName = table.TABLE_NAME
        const description = table.TABLE_COMMENT

        if (!tableName) {
          console.warn('Skipping table with undefined name')
          continue
        }

        console.log(`Processing table: ${tableName}`)

        // Get columns
        const [columns] = await pool.query<RowDataPacket[]>(`
          SELECT 
            column_name as COLUMN_NAME,
            data_type as DATA_TYPE,
            is_nullable as IS_NULLABLE,
            column_default as COLUMN_DEFAULT,
            column_comment as COLUMN_COMMENT,
            character_maximum_length as CHARACTER_MAXIMUM_LENGTH,
            numeric_precision as NUMERIC_PRECISION,
            numeric_scale as NUMERIC_SCALE
          FROM information_schema.columns 
          WHERE table_schema = DATABASE() 
          AND table_name = ?
          ORDER BY ordinal_position
        `, [tableName])

        // Get indexes
        const [indexes] = await pool.query<RowDataPacket[]>(`
          SELECT 
            index_name as INDEX_NAME,
            GROUP_CONCAT(column_name ORDER BY seq_in_index) as COLUMNS,
            non_unique as NON_UNIQUE,
            index_type as INDEX_TYPE
          FROM information_schema.statistics
          WHERE table_schema = DATABASE()
          AND table_name = ?
          GROUP BY index_name, non_unique, index_type
        `, [tableName])

        // Get foreign keys
        const [foreignKeys] = await pool.query<RowDataPacket[]>(`
          SELECT 
            kcu.constraint_name as CONSTRAINT_NAME,
            GROUP_CONCAT(kcu.column_name ORDER BY kcu.ordinal_position) as COLUMNS,
            kcu.referenced_table_name as REFERENCED_TABLE_NAME,
            GROUP_CONCAT(kcu.referenced_column_name ORDER BY kcu.ordinal_position) as REFERENCED_COLUMNS,
            rc.delete_rule as DELETE_RULE,
            rc.update_rule as UPDATE_RULE
          FROM information_schema.key_column_usage kcu
          JOIN information_schema.referential_constraints rc
            ON kcu.constraint_name = rc.constraint_name
            AND kcu.table_schema = rc.constraint_schema
          WHERE kcu.table_schema = DATABASE()
          AND kcu.table_name = ?
          AND kcu.referenced_table_name IS NOT NULL
          GROUP BY kcu.constraint_name, kcu.referenced_table_name, rc.delete_rule, rc.update_rule
        `, [tableName])

        this.schema[tableName] = {
          name: tableName,
          description,
          columns: columns.map((col: RowDataPacket) => ({
            name: col.COLUMN_NAME,
            type: col.DATA_TYPE,
            nullable: col.IS_NULLABLE === 'YES',
            defaultValue: col.COLUMN_DEFAULT,
            description: col.COLUMN_COMMENT,
            maxLength: col.CHARACTER_MAXIMUM_LENGTH,
            precision: col.NUMERIC_PRECISION,
            scale: col.NUMERIC_SCALE
          })),
          indexes: indexes.map((idx: RowDataPacket) => ({
            name: idx.INDEX_NAME,
            columns: idx.COLUMNS.split(','),
            unique: !idx.NON_UNIQUE,
            type: idx.INDEX_TYPE
          })),
          foreignKeys: foreignKeys.map((fk: RowDataPacket) => ({
            name: fk.CONSTRAINT_NAME,
            columns: fk.COLUMNS.split(','),
            referencedTable: fk.REFERENCED_TABLE_NAME,
            referencedColumns: fk.REFERENCED_COLUMNS.split(','),
            onDelete: fk.DELETE_RULE,
            onUpdate: fk.UPDATE_RULE
          }))
        }

        console.log(`Processed table ${tableName} with ${columns.length} columns, ${indexes.length} indexes, and ${foreignKeys.length} foreign keys`)
      }

      // Build relations
      this.buildRelations()
      this.isInitialized = true
      console.log('Schema initialization completed successfully')

    } catch (error) {
      console.error('Error initializing schema:', error instanceof Error ? error.message : 'Unknown error')
      throw error
    }
  }

  private buildRelations() {
    for (const [tableName, tableInfo] of Object.entries(this.schema)) {
      this.relations[tableName] = {
        table: tableName,
        references: [],
        referencedBy: []
      }

      // Add direct references
      for (const fk of tableInfo.foreignKeys) {
        this.relations[tableName].references.push({
          table: fk.referencedTable,
          columns: fk.columns,
          type: this.determineRelationType(tableName, fk.referencedTable)
        })
      }

      // Add reverse references
      for (const [otherTable, otherInfo] of Object.entries(this.schema)) {
        if (otherTable !== tableName) {
          const reverseFks = otherInfo.foreignKeys.filter(fk => fk.referencedTable === tableName)
          if (reverseFks.length > 0) {
            this.relations[tableName].referencedBy.push({
              table: otherTable,
              columns: reverseFks.flatMap(fk => fk.columns),
              type: this.determineRelationType(otherTable, tableName)
            })
          }
        }
      }
    }
  }

  private determineRelationType(fromTable: string, toTable: string): 'one-to-one' | 'one-to-many' | 'many-to-many' {
    const fromFks = this.schema[fromTable].foreignKeys.filter(fk => fk.referencedTable === toTable)
    const toFks = this.schema[toTable].foreignKeys.filter(fk => fk.referencedTable === fromTable)

    if (fromFks.length === 0 && toFks.length === 0) return 'many-to-many'
    if (fromFks.length === 1 && toFks.length === 0) return 'one-to-many'
    if (fromFks.length === 0 && toFks.length === 1) return 'one-to-many'
    return 'one-to-one'
  }

  private async handleRequest(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    if (!this.isInitialized) {
      res.writeHead(503)
      res.end(JSON.stringify({ error: 'Schema initialization in progress' }))
      return
    }

    const url = new URL(req.url, `http://${req.headers.host}`)
    const path = url.pathname

    try {
      switch (path) {
        case '/schema':
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(this.schema))
          break

        case '/relations':
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(this.relations))
          break

        case '/table':
          const tableName = url.searchParams.get('name')
          if (!tableName || !this.schema[tableName]) {
            res.writeHead(404)
            res.end(JSON.stringify({ error: 'Table not found' }))
            return
          }
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(this.schema[tableName]))
          break

        case '/query':
          if (req.method !== 'POST') {
            res.writeHead(405)
            res.end(JSON.stringify({ error: 'Method not allowed' }))
            return
          }

          let body = ''
          req.on('data', (chunk: any) => {
            body += chunk.toString()
          })

          req.on('end', async () => {
            try {
              const { query, params } = JSON.parse(body)
              const [results] = await pool.execute(query, params)
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify(results))
            } catch (error) {
              res.writeHead(400)
              res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }))
            }
          })
          break

        default:
          res.writeHead(404)
          res.end(JSON.stringify({ error: 'Not found' }))
      }
    } catch (error) {
      res.writeHead(500)
      res.end(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }))
    }
  }

  public start() {
    this.server.listen(this.port, () => {
      console.log(`MCP Server running on port ${this.port}`)
    })
  }
}

// Create and start the MCP server
const mcpServer = new MCPServer()
mcpServer.start()

export default mcpServer 