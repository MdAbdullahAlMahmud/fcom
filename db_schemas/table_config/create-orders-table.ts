const { query } = require('../../../lib/db/mysql')
const fs = require('fs')
const path = require('path')

async function createOrdersTable() {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, '../06_orders.sql'),
      'utf8'
    )

    await query(sql)
    console.log('Orders tables created successfully')
  } catch (error) {
    console.error('Error creating orders tables:', error)
    process.exit(1)
  }
}

createOrdersTable() 