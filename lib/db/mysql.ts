import mysql from 'mysql2/promise'

// Create a connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'fcommerce',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// Helper function to execute queries
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows as T
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// Helper function to execute transactions
export async function transaction<T>(callback: (connection: mysql.Connection) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection()
  await connection.beginTransaction()

  try {
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// Export the pool for direct access if needed
export { pool } 