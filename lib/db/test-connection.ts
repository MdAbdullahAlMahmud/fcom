import mysql from 'mysql2/promise'

async function testConnection() {
  try {
    // Create a connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'fcommerce'
    })

    console.log('Successfully connected to the database!')
    
    // Test a simple query
    const [rows] = await connection.query('SELECT 1 as test')
    console.log('Query test result:', rows)
    
    // Close the connection
    await connection.end()
    console.log('Connection closed successfully')
  } catch (error) {
    console.error('Error connecting to the database:', error)
    process.exit(1)
  }
}

// Run the test
testConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 