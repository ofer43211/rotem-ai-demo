# Contributing to rotem-ai-demo

First off, thank you for considering contributing to rotem-ai-demo! It's people like you that make this project great.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/rotem-ai-demo.git`
3. Add upstream remote: `git remote add upstream https://github.com/ofer43211/rotem-ai-demo.git`
4. Install dependencies: `npm install`
5. Create a branch: `git checkout -b feature/your-feature-name`

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the problem
- **Expected behavior** vs **actual behavior**
- **Code samples** or test cases if applicable
- **Environment details** (OS, Node version, etc.)
- **Screenshots** if relevant

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** or problem it solves
- **Proposed solution** or implementation approach
- **Alternatives considered**
- **Additional context** or examples

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Simple issues perfect for beginners
- `help wanted` - Issues where we need community help
- `documentation` - Documentation improvements

### Pull Requests

1. Follow the [development process](#development-process)
2. Follow the [style guidelines](#style-guidelines)
3. Write or update tests as needed
4. Update documentation as needed
5. Ensure all tests pass
6. Follow the [pull request process](#pull-request-process)

## Development Process

### 1. Setup Development Environment

```bash
# Install dependencies
npm install

# Set up git hooks
npm run prepare
```

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add tests for new features
- Update documentation

### 3. Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### 4. Check Code Quality

```bash
# Run linter
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Check formatting
npm run format:check

# Fix formatting
npm run format
```

### 5. Build

```bash
# Build the project
npm run build
```

## Style Guidelines

### Code Style

This project uses ESLint and Prettier for code style enforcement.

**Key principles:**

- Use TypeScript strict mode
- Prefer explicit types over `any`
- Use meaningful variable and function names
- Keep functions small and focused
- Write self-documenting code
- Add comments for complex logic only

**Example:**

```typescript
// Good
function calculateUserAge(birthDate: Date): number {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  return age;
}

// Bad
function calc(d: any): any {
  const t = new Date();
  const a = t.getFullYear() - d.getFullYear();
  return a;
}
```

### TypeScript Guidelines

- Always use explicit return types for functions
- Use interfaces for object shapes
- Use type aliases for unions and complex types
- Avoid using `as` type assertions when possible
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### File Organization

```
src/
├── models/       # Data models and entities
├── services/     # Business logic
├── utils/        # Utility functions
├── api/          # API clients
├── database/     # Database layer
└── errors/       # Custom error classes
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```
feat(user): add email validation to user creation

- Implement email format validation
- Add tests for valid/invalid emails
- Update user service documentation

Closes #123
```

```
fix(calculator): handle division by zero correctly

Previously division by zero would crash the application.
Now it throws a descriptive error.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. **Update your branch**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run all checks**

   ```bash
   npm run lint
   npm run format:check
   npm run test:coverage
   npm run build
   ```

3. **Update documentation**
   - Update README if needed
   - Add/update JSDoc comments
   - Update TESTING.md if adding tests

### Pull Request Guidelines

1. **Fill out the PR template completely**
2. **Link related issues** using keywords (Fixes #123, Closes #456)
3. **Add screenshots** for UI changes
4. **Keep PRs focused** - one feature/fix per PR
5. **Write descriptive title and description**
6. **Request review** from maintainers

### PR Title Format

```
<type>(<scope>): <description>
```

Examples:

- `feat(cache): add TTL support for cache entries`
- `fix(validator): correct email regex pattern`
- `docs(readme): update installation instructions`

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made

- Change 1
- Change 2
- Change 3

## Testing

Describe the tests you ran

## Checklist

- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally
- [ ] Coverage is maintained or improved
```

## Testing Guidelines

### Writing Tests

- **Test coverage**: Aim for 80%+ coverage
- **Test names**: Should describe what they test
- **Arrange-Act-Assert**: Structure tests clearly
- **Independence**: Tests should not depend on each other
- **Edge cases**: Test boundary conditions and errors

### Test Structure

```typescript
describe('Component/Feature', () => {
  describe('specific functionality', () => {
    it('should behave in expected way', () => {
      // Arrange
      const input = setupTestData();

      // Act
      const result = performAction(input);

      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Test Types

1. **Unit Tests** - Test individual functions/classes
2. **Integration Tests** - Test component interactions
3. **Edge Cases** - Test boundary conditions
4. **Error Cases** - Test error handling

## Review Process

1. **Automated Checks**: CI must pass
2. **Code Review**: At least one approval required
3. **Testing**: Reviewer verifies tests are adequate
4. **Documentation**: Reviewer checks docs are updated

## Questions?

Feel free to:

- Open an issue for discussion
- Ask in pull request comments
- Reach out to maintainers

## Recognition

Contributors are recognized in:

- GitHub contributors page
- Release notes (for significant contributions)
- Project README (for major contributions)

---

Thank you for contributing! 🎉
