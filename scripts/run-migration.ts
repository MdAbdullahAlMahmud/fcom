import { createPool } from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create database connection
const pool = createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fcommerce',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

async function tableExists(tableName: string): Promise<boolean> {
  const [rows] = await pool.query(`
    SELECT COUNT(*) as count
    FROM information_schema.tables
    WHERE table_schema = DATABASE()
    AND table_name = ?
  `, [tableName])
  return (rows as any)[0].count > 0
}

async function getForeignKeys(tableName: string) {
  const [rows] = await pool.query(`
    SELECT CONSTRAINT_NAME
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = ?
    AND CONSTRAINT_TYPE = 'FOREIGN KEY'
  `, [tableName])
  return rows as { CONSTRAINT_NAME: string }[]
}

async function runMigration() {
  try {
    console.log('Starting migration...')
    
    // Check if users table exists
    const usersExists = await tableExists('users')
    const adminsExists = await tableExists('admins')
    
    if (!usersExists && adminsExists) {
      console.log('Table has already been renamed from users to admins')
    } else if (usersExists) {
      console.log('Renaming users table to admins...')
      await pool.query('RENAME TABLE users TO admins')
      console.log('Table renamed successfully')
    } else {
      console.log('Neither users nor admins table exists. Skipping rename step.')
    }
    
    // Handle foreign keys
    console.log('Checking foreign keys in orders table...')
    const foreignKeys = await getForeignKeys('orders')
    console.log('Found foreign keys:', foreignKeys)
    
    if (foreignKeys.length > 0) {
      for (const fk of foreignKeys) {
        console.log(`Dropping foreign key: ${fk.CONSTRAINT_NAME}`)
        await pool.query(`ALTER TABLE orders DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`)
      }
    } else {
      console.log('No foreign keys found to drop')
    }
    
    // Add new foreign keys
    console.log('Adding new foreign keys...')
    await pool.query(`
      ALTER TABLE orders
      ADD CONSTRAINT orders_user_id_fk FOREIGN KEY (user_id) REFERENCES admins(id) ON DELETE CASCADE,
      ADD CONSTRAINT orders_created_by_fk FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE RESTRICT,
      ADD CONSTRAINT orders_updated_by_fk FOREIGN KEY (updated_by) REFERENCES admins(id) ON DELETE RESTRICT
    `)
    console.log('New foreign keys added successfully')
    
    console.log('Migration completed successfully!')
    await pool.end()
  } catch (error) {
    console.error('Migration failed:', error)
    await pool.end()
    process.exit(1)
  }
}

// Run the migration
runMigration() 