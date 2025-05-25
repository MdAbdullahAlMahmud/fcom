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

## Authentication
- Use custom authentication with bcrypt
- Store sessions in cookies
- Implement role-based access control
- Use JWT for token management

## API Routes
- Follow RESTful conventions
- Use proper error handling
- Implement rate limiting
- Validate input data

## Components
- Use shadcn/ui components
- Follow atomic design principles
- Implement proper TypeScript types
- Use proper error boundaries

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