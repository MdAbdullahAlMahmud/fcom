# fCommerce Architecture

## Directory Structure
```
fcommerce/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages (not (auth))
│   ├── shop/              # Shop pages (not (shop))
│   └── admin/             # Admin pages (not (admin))
├── components/            # Reusable components
├── lib/                   # Utility functions
│   ├── db/               # Database utilities
│   └── auth/             # Authentication utilities
├── types/                # TypeScript types
└── public/               # Static files
```

## Naming Conventions
1. Route Groups: Use direct naming (e.g., `auth/login` instead of `(auth)/login`)
2. Components: PascalCase (e.g., `UserProfile.tsx`)
3. Utilities: camelCase (e.g., `authUtils.ts`)
4. Types: PascalCase (e.g., `UserType.ts`)

## Database
- Use existing MySQL setup from `types/database.ts` and `lib/db`
- Extend table properties as needed for system requirements
- Follow existing database patterns and conventions
- Handle NULL vs Undefined values properly:
  ```typescript
  const params = {
    description: description || null,
    parent_id: parent_id === 'none' ? null : parseInt(parent_id),
    image_url: image_url || null
  }
  ```
- Convert types before database operations:
  ```typescript
  parent_id === null ? null : Number(parent_id)
  is_active ? 1 : 0  // Convert boolean to 0/1 for MySQL
  ```

## Authentication
- Use custom authentication with bcrypt
- Store sessions in cookies
- Implement role-based access control
- Use JWT for token management
- Consistent token verification:
  ```typescript
  const token = cookies().get('auth-token')?.value
  if (!token) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    )
  }
  ```

## API Routes
- Follow RESTful conventions
- Use proper error handling
- Implement rate limiting
- Validate input data
- Handle API responses properly:
  ```typescript
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to save category')
  }
  ```
- Validate relationships before database operations:
  ```typescript
  if (parent_id !== null && parent_id !== undefined) {
    const parentExists = await query(
      'SELECT id FROM categories WHERE id = ?',
      [parent_id]
    )
    if (parentExists.length === 0) {
      return NextResponse.json(
        { message: 'Parent category does not exist' },
        { status: 400 }
      )
    }
  }
  ```

## Components
- Use shadcn/ui components
- Follow atomic design principles
- Implement proper TypeScript types
- Use proper error boundaries
- Handle form data properly:
  ```typescript
  const parent_id = formData.get('parent_id') as string
  parent_id: parent_id === 'none' ? null : parseInt(parent_id)
  ```

## State Management
- Use React Context/Hooks
- Implement proper loading states
- Handle errors gracefully
- Use proper TypeScript types

## Security
- Implement proper CORS policies
- Use secure cookies
- Implement rate limiting
- Validate all inputs
- Sanitize all outputs

## Performance
- Implement proper caching
- Use proper image optimization
- Implement proper code splitting
- Use proper lazy loading

## Testing
- Write unit tests
- Write integration tests
- Write E2E tests
- Use proper testing patterns

## Documentation
- Document all components
- Document all utilities
- Document all types
- Document all API routes

## File Operations
- Create necessary directories for file operations:
  ```bash
  mkdir -p public/uploads
  ```
- Handle file uploads with proper error checking
- Use unique filenames for uploads
- Implement proper error logging:
  ```typescript
  console.error('Save error:', error)
  console.error('Upload error:', error)
  console.error('Token verification error:', error)
  ```

## Common Issues and Solutions

### 1. Database Type Mismatches
- Problem: String values in integer columns
- Solution: Convert types before database operations
- Example: `Number(parent_id)` or `parseInt(parent_id)`

### 2. File Upload Issues
- Problem: Missing upload directories
- Solution: Create directories if they don't exist
- Example: `mkdir -p public/uploads`

### 3. Authentication Problems
- Problem: Inconsistent token handling
- Solution: Use consistent token verification
- Example: Check `auth-token` cookie in all protected routes

### 4. Form Data Type Issues
- Problem: Form values as strings
- Solution: Convert types appropriately
- Example: `parent_id === 'none' ? null : parseInt(parent_id)` 

## Database Schema
All database schemas are centralized in the `db_schemas` directory. This includes:

- `01_users.sql`: User authentication and management
- `02_categories.sql`: Product categories and hierarchy
- `03_products.sql`: Product information and inventory
- `04_product_images.sql`: Product image management
- `05_settings.sql`: Site settings and configuration

### Table Configuration
TypeScript files for table creation and initial data setup are stored in `db_schemas/table_config`:

- `create-admin.ts`: Creates the initial admin user
- `create-categories-table.ts`: Creates the categories table
- `create-settings-table.ts`: Creates the settings table

These files use the SQL schemas from the parent directory and handle:
- Table creation
- Initial data setup
- Data migrations
- Admin user creation

### Schema Setup
To set up the database:

1. Navigate to the `db_schemas` directory
2. Run the setup script:
   ```bash
   ./setup.sh
   ```

The script will:
- Create the database if it doesn't exist
- Execute all schema files in order
- Set up all required tables and relationships

### Schema Rules
1. All schema files should be prefixed with a number (e.g., `01_`, `02_`) to ensure proper execution order
2. Each table should include:
   - `created_at` and `updated_at` timestamps
   - Appropriate foreign key constraints
   - Proper indexing
3. Use `IF NOT EXISTS` to prevent errors on re-runs
4. Include appropriate comments for complex fields or relationships
5. All database schemas should be maintained in the `db_schemas` directory
6. Do not store schema files in other directories (e.g., `api/schema` or `scripts`)
7. Table configuration files should be stored in `db_schemas/table_config` 