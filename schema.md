# Database Schema for `fcommerce`

## Table: `addresses`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  | auto_increment |
| user_id | int(11) | NO | MUL |  |  |
| address_type | enum('shipping','billing') | NO |  |  |  |
| full_name | varchar(255) | NO |  |  |  |
| address_line1 | varchar(255) | NO |  |  |  |
| address_line2 | varchar(255) | YES |  |  |  |
| city | varchar(100) | NO |  |  |  |
| state | varchar(100) | NO |  |  |  |
| postal_code | varchar(20) | NO |  |  |  |
| country | varchar(100) | NO |  |  |  |
| phone | varchar(20) | NO |  |  |  |
| is_default | tinyint(1) | YES |  | 0 |  |
| created_at | timestamp | NO |  | current_timestamp() |  |
| updated_at | timestamp | NO |  | current_timestamp() | on update current_timestamp() |

## Table: `cart_items`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  | auto_increment |
| cart_id | int(11) | NO | MUL |  |  |
| product_id | int(11) | NO | MUL |  |  |
| quantity | int(11) | NO |  |  |  |
| created_at | timestamp | NO |  | current_timestamp() |  |
| updated_at | timestamp | NO |  | current_timestamp() | on update current_timestamp() |

## Table: `carts`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  | auto_increment |
| user_id | int(11) | YES | MUL |  |  |
| created_at | timestamp | NO |  | current_timestamp() |  |
| updated_at | timestamp | NO |  | current_timestamp() | on update current_timestamp() |

## Table: `categories`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  | auto_increment |
| name | varchar(255) | NO |  |  |  |
| slug | varchar(255) | NO | UNI |  |  |
| description | text | YES |  |  |  |
| parent_id | int(11) | YES | MUL |  |  |
| image_url | varchar(255) | YES |  |  |  |
| is_active | tinyint(1) | YES |  | 1 |  |
| created_at | timestamp | NO |  | current_timestamp() |  |
| updated_at | timestamp | NO |  | current_timestamp() | on update current_timestamp() |

## Table: `order_items`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  | auto_increment |
| order_id | int(11) | NO | MUL |  |  |
| product_id | int(11) | NO | MUL |  |  |
| quantity | int(11) | NO |  |  |  |
| unit_price | decimal(10,2) | NO |  |  |  |
| total_price | decimal(10,2) | NO |  |  |  |
| created_at | timestamp | NO |  | current_timestamp() |  |
| updated_at | timestamp | NO |  | current_timestamp() | on update current_timestamp() |

## Table: `order_status_history`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  | auto_increment |
| order_id | int(11) | NO | MUL |  |  |
| status | enum('pending','processing','shipped','delivered','cancelled','refunded') | NO |  |  |  |
| notes | text | YES |  |  |  |
| created_by | int(11) | NO | MUL |  |  |
| created_at | timestamp | NO |  | current_timestamp() |  |

## Table: `orders`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  | auto_increment |
| user_id | int(11) | NO | MUL |  |  |
| order_number | varchar(50) | NO | UNI |  |  |
| tracking_id | varchar(50) | YES |  |  |  |
| status | enum('pending','processing','shipped','delivered','cancelled','refunded') | NO |  | pending |  |
| total_amount | decimal(10,2) | NO |  |  |  |
| shipping_fee | decimal(10,2) | NO |  | 0.00 |  |
| tax_amount | decimal(10,2) | NO |  | 0.00 |  |
| discount_amount | decimal(10,2) | NO |  | 0.00 |  |
| payment_status | enum('pending','paid','failed','refunded') | NO |  | pending |  |
| payment_method | varchar(50) | YES |  |  |  |
| shipping_address_id | int(11) | YES | MUL |  |  |
| billing_address_id | int(11) | YES | MUL |  |  |
| notes | text | YES |  |  |  |
| tracking_number | varchar(100) | YES |  |  |  |
| estimated_delivery_date | date | YES |  |  |  |
| created_at | timestamp | NO |  | current_timestamp() |  |
| updated_at | timestamp | NO |  | current_timestamp() | on update current_timestamp() |

## Table: `product_attribute_values`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  | auto_increment |
| product_id | int(11) | NO | MUL |  |  |
| attribute_id | int(11) | NO | MUL |  |  |
| value | text | NO |  |  |  |
| created_at | timestamp | NO |  | current_timestamp() |  |

## Table: `product_attributes`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  | auto_increment |
| name | varchar(100) | NO |  |  |  |
| slug | varchar(100) | NO | UNI |  |  |
| created_at | timestamp | NO |  | current_timestamp() |  |

## Table: `product_images`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  | auto_increment |
| product_id | int(11) | NO | MUL |  |  |
| image_url | varchar(255) | NO |  |  |  |
| alt_text | varchar(255) | YES |  |  |  |
| sort_order | int(11) | YES |  | 0 |  |
| is_primary | tinyint(1) | YES |  | 0 |  |
| created_at | timestamp | NO |  | current_timestamp() |  |

## Table: `product_variant_attributes`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  | auto_increment |
| variant_id | int(11) | NO | MUL |  |  |
| attribute_id | int(11) | NO | MUL |  |  |
| value | text | NO |  |  |  |
| created_at | timestamp | NO |  | current_timestamp() |  |

## Table: `product_variants`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  | auto_increment |
| product_id | int(11) | NO | MUL |  |  |
| sku | varchar(100) | YES | UNI |  |  |
| price | decimal(10,2) | YES |  |  |  |
| sale_price | decimal(10,2) | YES |  |  |  |
| stock_quantity | int(11) | NO |  | 0 |  |
| weight | decimal(10,2) | YES |  |  |  |
| dimensions | varchar(50) | YES |  |  |  |
| is_active | tinyint(1) | YES |  | 1 |  |
| created_at | timestamp | NO |  | current_timestamp() |  |
| updated_at | timestamp | NO |  | current_timestamp() | on update current_timestamp() |

## Table: `products`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  | auto_increment |
| name | varchar(255) | NO |  |  |  |
| slug | varchar(255) | NO | UNI |  |  |
| description | text | YES |  |  |  |
| short_description | varchar(500) | YES |  |  |  |
| sku | varchar(100) | YES | UNI |  |  |
| price | decimal(10,2) | NO |  |  |  |
| sale_price | decimal(10,2) | YES |  |  |  |
| stock_quantity | int(11) | NO |  | 0 |  |
| weight | decimal(10,2) | YES |  |  |  |
| dimensions | varchar(50) | YES |  |  |  |
| is_active | tinyint(1) | YES | MUL | 1 |  |
| is_featured | tinyint(1) | YES |  | 0 |  |
| category_id | int(11) | YES | MUL |  |  |
| created_at | timestamp | NO |  | current_timestamp() |  |
| updated_at | timestamp | NO |  | current_timestamp() | on update current_timestamp() |

## Table: `settings`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  |  |
| site_name | varchar(255) | NO |  |  |  |
| contact_email | varchar(255) | NO |  |  |  |
| contact_phone | varchar(50) | NO |  |  |  |
| delivery_fee | decimal(10,2) | NO |  |  |  |
| min_order_amount | decimal(10,2) | NO |  |  |  |
| created_at | timestamp | NO |  | current_timestamp() |  |
| updated_at | timestamp | NO |  | current_timestamp() | on update current_timestamp() |

## Table: `users`

| Column | Type | Null | Key | Default | Extra |
|--------|------|------|-----|---------|-------|
| id | int(11) | NO | PRI |  | auto_increment |
| username | varchar(50) | NO | UNI |  |  |
| password | varchar(255) | NO |  |  |  |
| email | varchar(100) | NO |  |  |  |
| phone | varchar(20) | YES |  |  |  |
| role | enum('user','admin') | YES |  | user |  |
| status | enum('active','inactive') | YES |  | active |  |
| created_at | timestamp | NO |  | current_timestamp() |  |

