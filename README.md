# rotem-ai-demo

A comprehensive TypeScript demo project showcasing testing best practices, clean architecture, and modern development workflows.

[![CI](https://github.com/ofer43211/rotem-ai-demo/workflows/CI/badge.svg)](https://github.com/ofer43211/rotem-ai-demo/actions)
[![Coverage](https://img.shields.io/badge/coverage-80%25+-green.svg)](https://github.com/ofer43211/rotem-ai-demo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Testing](#testing)
- [Development](#development)
- [CI/CD](#cicd)
- [Contributing](#contributing)
- [License](#license)

## Features

- **TypeScript**: Fully typed codebase for better developer experience
- **Comprehensive Testing**: Unit and integration tests with Jest
- **High Code Coverage**: 80%+ coverage threshold enforced
- **Automated CI/CD**: GitHub Actions workflow for testing and building
- **Code Quality**: ESLint and Prettier for consistent code style
- **Pre-commit Hooks**: Husky ensures code quality before commits
- **Modern Architecture**: Clean separation of concerns (Models, Services, Utils, API)

## Project Structure

```
rotem-ai-demo/
├── src/                      # Source code
│   ├── models/              # Data models
│   │   └── User.ts          # User model with business logic
│   ├── services/            # Business logic services
│   │   └── UserService.ts   # User management service
│   ├── utils/               # Utility functions
│   │   ├── Calculator.ts    # Mathematical operations
│   │   └── Validator.ts     # Input validation utilities
│   ├── api/                 # API client
│   │   └── ApiClient.ts     # HTTP client wrapper
│   └── index.ts             # Main entry point
├── tests/                   # Test files
│   ├── unit/                # Unit tests
│   │   ├── models/          # Model tests
│   │   ├── services/        # Service tests
│   │   ├── utils/           # Utility tests
│   │   └── api/             # API tests
│   └── integration/         # Integration tests
│       ├── UserWorkflow.test.ts
│       └── ApiWorkflow.test.ts
├── .github/                 # GitHub configuration
│   └── workflows/           # CI/CD workflows
│       └── ci.yml           # Main CI workflow
├── .husky/                  # Git hooks
│   └── pre-commit           # Pre-commit validation
├── dist/                    # Compiled output (generated)
├── coverage/                # Test coverage reports (generated)
├── jest.config.js           # Jest configuration
├── tsconfig.json            # TypeScript configuration
├── .eslintrc.js             # ESLint configuration
├── .prettierrc.json         # Prettier configuration
├── .gitignore               # Git ignore rules
└── package.json             # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ofer43211/rotem-ai-demo.git
cd rotem-ai-demo
```

2. Install dependencies:
```bash
npm install
```

3. Set up git hooks:
```bash
npm run prepare
```

### Build

Compile TypeScript to JavaScript:
```bash
npm run build
```

The compiled code will be in the `dist/` directory.

## Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run Unit Tests Only

```bash
npm run test:unit
```

### Run Integration Tests Only

```bash
npm run test:integration
```

### Generate Coverage Report

```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory. Open `coverage/index.html` in a browser to view detailed coverage information.

### Coverage Thresholds

The project enforces minimum coverage thresholds (configured in `jest.config.js`):
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

Tests will fail if coverage drops below these thresholds.

## Test Coverage Analysis

### Current Coverage

The project includes comprehensive tests covering:

1. **User Model** (`src/models/User.ts`)
   - Constructor and property initialization
   - Age validation (isAdult method)
   - Display name formatting
   - Age updates with validation
   - JSON serialization
   - Immutability of readonly properties

2. **Calculator Utility** (`src/utils/Calculator.ts`)
   - Basic operations (add, subtract, multiply, divide)
   - Advanced operations (power, sqrt, factorial)
   - Array operations (average, max, min)
   - Percentage calculations
   - Edge cases and error handling

3. **Validator Utility** (`src/utils/Validator.ts`)
   - Email validation
   - Password strength validation
   - URL validation
   - Phone number validation
   - Range validation
   - Credit card validation (Luhn algorithm)
   - Empty value detection

4. **UserService** (`src/services/UserService.ts`)
   - User CRUD operations
   - Email uniqueness validation
   - User search and filtering
   - Adult/minor user filtering
   - Bulk operations

5. **ApiClient** (`src/api/ApiClient.ts`)
   - HTTP methods (GET, POST, PUT, DELETE)
   - Header management
   - Error handling
   - Timeout handling
   - URL building

### Integration Tests

Integration tests verify that multiple components work together correctly:

- **UserWorkflow**: Tests user creation, validation, updates, and statistics
- **ApiWorkflow**: Tests API requests with validation and error handling

## Development

### Code Formatting

Format code with Prettier:
```bash
npm run format
```

Check if code is formatted:
```bash
npm run format:check
```

### Linting

Run ESLint:
```bash
npm run lint
```

Fix auto-fixable issues:
```bash
npm run lint:fix
```

### Pre-commit Hooks

The project uses Husky to run checks before each commit:
1. Linting
2. Format checking
3. Tests

If any check fails, the commit will be rejected.

## CI/CD

### GitHub Actions

The project uses GitHub Actions for continuous integration. On every push and pull request:

1. **Test Job**
   - Runs on Node.js 18.x and 20.x
   - Executes linting
   - Checks code formatting
   - Runs all tests with coverage
   - Uploads coverage to Codecov
   - Archives coverage reports

2. **Build Job**
   - Compiles TypeScript
   - Archives build artifacts

3. **Coverage Check Job**
   - Verifies coverage thresholds are met

### Running CI Locally

You can run the same checks locally:
```bash
npm run lint
npm run format:check
npm run test:coverage
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Ensure all tests pass (`npm test`)
5. Ensure code is formatted (`npm run format`)
6. Ensure linting passes (`npm run lint`)
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## Areas for Test Improvement

While the project has comprehensive test coverage, here are areas where tests could be enhanced:

### 1. Edge Cases
- Test extreme values (e.g., very large numbers in Calculator)
- Test Unicode and special characters in names and emails
- Test timezone-related issues in date handling

### 2. Performance Testing
- Add tests for large datasets (thousands of users)
- Test memory usage and potential leaks
- Benchmark critical operations

### 3. Error Recovery
- Test recovery from partial failures
- Test transaction rollback scenarios
- Test error propagation through the stack

### 4. Concurrency
- Test concurrent user modifications
- Test race conditions in async operations
- Test parallel API requests

### 5. Security
- Add tests for XSS prevention
- Test SQL injection prevention (if database is added)
- Test authentication and authorization flows

### 6. End-to-End Testing
- Add E2E tests with tools like Playwright or Cypress
- Test complete user journeys
- Test UI interactions (if UI is added)

### 7. Mock Improvements
- Test with more realistic mock data
- Test network failure scenarios
- Test third-party API failures

### 8. Documentation Tests
- Add tests to verify code examples in documentation
- Test README code snippets

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with best practices in mind. Happy coding!**