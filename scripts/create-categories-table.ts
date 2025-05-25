import { query } from '../lib/db/mysql'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function createCategoriesTable() {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, 'create-categories-table.sql'),
      'utf8'
    )

    await query(sql)
    console.log('Categories table created successfully')
  } catch (error) {
    console.error('Error creating categories table:', error)
    process.exit(1)
  }
}

createCategoriesTable() 