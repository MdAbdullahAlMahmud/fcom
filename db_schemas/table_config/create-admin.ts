import { query } from '../../lib/db/mysql'
import { hash } from 'bcrypt'

async function createAdminUser() {
  try {
    // Hash the password
    const password = 'admin123'
    const hashedPassword = await hash(password, 10)

    // Insert admin user
    await query(`
      INSERT INTO admins (name, email, password, role)
      VALUES (?, ?, ?, 'admin')
      ON DUPLICATE KEY UPDATE
      password = VALUES(password),
      email = VALUES(email),
      role = VALUES(role)
    `, ['Admin User', 'admin@example.com', hashedPassword])

    console.log('Admin user created successfully')
    console.log('Email: admin@example.com')
    console.log('Password: admin123')
  } catch (error) {
    console.error('Error creating admin user:', error)
  }
}

// Run the script
createAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  }) 

