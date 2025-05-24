import { query, transaction } from './mysql.ts'
import bcrypt from 'bcryptjs'

export async function seedDatabase() {
  try {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await query(`
      INSERT INTO users (username, password, email, role, status)
      VALUES (?, ?, ?, 'admin', 'active')
      ON DUPLICATE KEY UPDATE
      password = VALUES(password),
      email = VALUES(email),
      role = VALUES(role),
      status = VALUES(status)
    `, ['admin', hashedPassword, 'admin@example.com'])

    // Create category
    await query(`
      INSERT INTO categories (name)
      VALUES (?)
      ON DUPLICATE KEY UPDATE name = VALUES(name)
    `, ['NEW ARRIVALS'])

    // Get category ID
    const [category] = await query<any[]>(`
      SELECT id FROM categories WHERE name = ?
    `, ['NEW ARRIVALS'])

    // Create product
    await query(`
      INSERT INTO products (category_id, title, description, regular_price, offer_price, stock, additional_text)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      category_id = VALUES(category_id),
      title = VALUES(title),
      description = VALUES(description),
      regular_price = VALUES(regular_price),
      offer_price = VALUES(offer_price),
      stock = VALUES(stock),
      additional_text = VALUES(additional_text)
    `, [
      category.id,
      'Sample Product',
      'This is a sample product description',
      99.99,
      79.99,
      100,
      'Limited time offer!'
    ])

    // Get product ID
    const [product] = await query<any[]>(`
      SELECT id FROM products WHERE title = ?
    `, ['Sample Product'])

    // Create product images
    await query(`
      INSERT INTO images (product_id, image_url)
      VALUES (?, ?), (?, ?), (?, ?)
      ON DUPLICATE KEY UPDATE
      image_url = VALUES(image_url)
    `, [
      product.id,
      '/images/products/sample1.jpg',
      product.id,
      '/images/products/sample2.jpg',
      product.id,
      '/images/products/sample3.jpg'
    ])

    // Create settings
    const settings = [
      ['site_name', 'Your Store Name'],
      ['contact_email', 'contact@example.com'],
      ['contact_phone', '+1234567890'],
      ['delivery_fee', '5.00'],
      ['min_order_amount', '50.00']
    ]

    for (const [key, value] of settings) {
      await query(`
        INSERT INTO settings (setting_key, setting_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
      `, [key, value])
    }

    console.log('Database seeded successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

// Execute the seeding if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
} 