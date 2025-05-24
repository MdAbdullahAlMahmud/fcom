# Contributing to fCommerce

## Code Style & Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow strict type checking
- Use interfaces for object shapes
- Use type inference where possible
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names
- Maximum line length: 100 characters

### React/Next.js
- Use functional components with hooks
- Follow the React hooks naming convention (use*)
- Keep components small and focused
- Use proper prop types/interfaces
- Implement error boundaries where necessary
- Use Next.js App Router conventions
- Follow the file-based routing structure

### CSS/Tailwind
- Use Tailwind CSS for styling
- Follow mobile-first approach
- Use semantic class names
- Group related classes logically
- Use custom components for repeated patterns
- Maintain consistent spacing and sizing

### Database
- Use prepared statements for all queries
- Follow the established table naming convention
- Document complex queries
- Use transactions for multiple operations
- Handle database errors appropriately
- Keep queries optimized and indexed

## File Organization

### Naming Conventions
- Files: kebab-case (e.g., `product-card.tsx`)
- Components: PascalCase (e.g., `ProductCard`)
- Functions: camelCase (e.g., `getProductDetails`)
- Constants: UPPER_SNAKE_CASE (e.g., `MAX_ITEMS`)
- Types/Interfaces: PascalCase (e.g., `ProductType`)

### Directory Structure
- Keep related files together
- Use feature-based organization
- Follow the established directory structure
- Maintain clear separation of concerns

## Git Workflow

### Branch Naming
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-description`
- Hotfixes: `hotfix/issue-description`
- Releases: `release/version-number`

### Commit Messages
- Use present tense
- Start with a verb
- Keep it concise but descriptive
- Reference issue numbers if applicable
- Format: `type(scope): description`

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructuring
- test: Testing
- chore: Maintenance

### Pull Requests
- Create from feature branches
- Include clear description
- Reference related issues
- Request reviews from team members
- Ensure CI passes
- Keep PRs focused and manageable

## Testing

### Unit Tests
- Write tests for all new features
- Maintain minimum 80% coverage
- Test edge cases
- Mock external dependencies
- Use meaningful test descriptions

### Integration Tests
- Test API endpoints
- Test database operations
- Test user flows
- Test error scenarios

## Documentation

### Code Documentation
- Document complex logic
- Use JSDoc for functions
- Keep comments up to date
- Document API endpoints
- Include usage examples

### Project Documentation
- Keep README updated
- Document setup process
- Include environment variables
- Document deployment process
- Maintain API documentation

## Performance

### Frontend
- Optimize images
- Implement lazy loading
- Minimize bundle size
- Use proper caching
- Monitor Core Web Vitals

### Backend
- Optimize database queries
- Implement proper caching
- Handle errors gracefully
- Monitor response times
- Use proper indexing

## Security

### Authentication
- Use secure password hashing
- Implement proper session management
- Use HTTPS
- Follow OWASP guidelines
- Regular security audits

### Data Protection
- Sanitize user inputs
- Use prepared statements
- Implement rate limiting
- Follow GDPR guidelines
- Regular backups

## Review Process

### Code Review
- Review for functionality
- Check for security issues
- Verify performance
- Ensure proper testing
- Check documentation

### Quality Assurance
- Test on multiple devices
- Verify responsive design
- Check accessibility
- Test error scenarios
- Verify data integrity

## Deployment

### Staging
- Test all features
- Verify database migrations
- Check environment variables
- Test third-party integrations
- Verify security measures

### Production
- Follow deployment checklist
- Monitor error logs
- Verify backups
- Check performance metrics
- Document deployment

## Support

### Issue Tracking
- Use clear issue templates
- Include reproduction steps
- Add relevant screenshots
- Specify environment details
- Label issues appropriately

### Communication
- Use project channels
- Keep discussions focused
- Document decisions
- Share knowledge
- Regular updates 