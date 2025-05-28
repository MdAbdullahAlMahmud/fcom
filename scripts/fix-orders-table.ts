import { query } from '@/lib/db/mysql'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function fixOrdersTable() {
  try {
    const sqlPath = path.join(__dirname, '../db_schemas/migrations/fix_orders_auto_increment.sql')
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

    console.log('Orders table schema updated successfully')
  } catch (error) {
    console.error('Error updating orders table schema:', error)
    process.exit(1)
  }
}

// Run the script
fixOrdersTable()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 