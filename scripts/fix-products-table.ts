import { query } from '@/lib/db/mysql'
import fs from 'fs'
import path from 'path'

async function fixProductsTable() {
  try {
    const sqlPath = path.join(process.cwd(), 'app/api/schema/products.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')

    // Split the SQL file into individual statements
    const statements = sql
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0)

    // Execute each statement
    for (const statement of statements) {
      await query(statement)
      console.log('Executed:', statement)
    }

    console.log('Products table schema updated successfully')
  } catch (error) {
    console.error('Error updating products table schema:', error)
    process.exit(1)
  }
}

fixProductsTable() 