const { query } = require('../../../lib/db/mysql')
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function createSettingsTable() {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, '../05_settings.sql'),
      'utf8'
    )

    await query(sql)
    console.log('Settings table created successfully')
  } catch (error) {
    console.error('Error creating settings table:', error)
    process.exit(1)
  }
}

createSettingsTable() 