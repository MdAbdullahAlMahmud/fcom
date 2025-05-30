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

class MCPClient {
  private baseUrl: string

  constructor(port: number = 3009) {
    this.baseUrl = `http://localhost:${port}`
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Request failed')
    }

    return response.json()
  }

  public async getSchema(): Promise<{ [key: string]: TableInfo }> {
    return this.fetch('/schema')
  }

  public async getRelations(): Promise<{ [key: string]: TableRelations }> {
    return this.fetch('/relations')
  }

  public async getTable(name: string): Promise<TableInfo> {
    return this.fetch(`/table?name=${encodeURIComponent(name)}`)
  }

  public async executeQuery(query: string, params: any[] = []): Promise<any> {
    return this.fetch('/query', {
      method: 'POST',
      body: JSON.stringify({ query, params })
    })
  }

  public async getTableRelations(tableName: string): Promise<TableRelations> {
    const relations = await this.getRelations()
    return relations[tableName]
  }

  public async getColumnInfo(tableName: string, columnName: string): Promise<ColumnInfo | null> {
    const table = await this.getTable(tableName)
    return table.columns.find(col => col.name === columnName) || null
  }

  public async getForeignKeyInfo(tableName: string, columnName: string): Promise<ForeignKeyInfo | null> {
    const table = await this.getTable(tableName)
    return table.foreignKeys.find(fk => fk.columns.includes(columnName)) || null
  }

  public async getIndexInfo(tableName: string, columnName: string): Promise<IndexInfo[]> {
    const table = await this.getTable(tableName)
    return table.indexes.filter(idx => idx.columns.includes(columnName))
  }

  public async getRelatedTables(tableName: string): Promise<string[]> {
    const relations = await this.getTableRelations(tableName)
    const relatedTables = new Set<string>()

    relations.references.forEach(ref => relatedTables.add(ref.table))
    relations.referencedBy.forEach(ref => relatedTables.add(ref.table))

    return Array.from(relatedTables)
  }

  public async getTableDescription(tableName: string): Promise<string | undefined> {
    const table = await this.getTable(tableName)
    return table.description
  }

  public async getColumnDescription(tableName: string, columnName: string): Promise<string | undefined> {
    const column = await this.getColumnInfo(tableName, columnName)
    return column?.description
  }
}

// Create and export a singleton instance
const mcpClient = new MCPClient()
export default mcpClient 