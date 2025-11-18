# Testing Guide

This document provides comprehensive information about testing in the rotem-ai-demo project.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [Testing Best Practices](#testing-best-practices)
- [Troubleshooting](#troubleshooting)

## Testing Philosophy

This project follows these testing principles:

1. **Test-Driven Development (TDD)**: Write tests before implementation when possible
2. **High Coverage**: Maintain 80%+ code coverage across all metrics
3. **Clear Test Names**: Tests should describe what they verify
4. **Independent Tests**: Tests should not depend on each other
5. **Fast Execution**: Unit tests should run quickly
6. **Readable Assertions**: Use clear, descriptive assertions

## Test Types

### Unit Tests

Unit tests verify individual components in isolation.

**Location**: `tests/unit/`

**What to test**:
- Individual functions and methods
- Class behavior
- Edge cases and error conditions
- Input validation
- Return values

**Example**:
```typescript
describe('Calculator', () => {
  it('should add two numbers correctly', () => {
    const calculator = new Calculator();
    expect(calculator.add(2, 3)).toBe(5);
  });
});
```

### Integration Tests

Integration tests verify that multiple components work together correctly.

**Location**: `tests/integration/`

**What to test**:
- Component interactions
- Data flow between modules
- End-to-end workflows
- System behavior

**Example**:
```typescript
describe('User Workflow', () => {
  it('should create and validate user', () => {
    const userService = new UserService();
    const validator = new Validator();

    const email = 'test@example.com';
    expect(validator.isEmail(email)).toBe(true);

    const user = userService.createUser(email, 'Test', 25);
    expect(user).toBeDefined();
  });
});
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode
```bash
npm run test:watch
```

### With Coverage
```bash
npm run test:coverage
```

### Specific Test File
```bash
npm test -- Calculator.test.ts
```

### Specific Test Suite
```bash
npm test -- --testNamePattern="Calculator"
```

## Writing Tests

### Test Structure

Use the **Arrange-Act-Assert (AAA)** pattern:

```typescript
it('should update user age', () => {
  // Arrange: Set up test data
  const user = new User('1', 'test@example.com', 'Test', 25);

  // Act: Perform the action
  user.updateAge(30);

  // Assert: Verify the result
  expect(user.age).toBe(30);
});
```

### Descriptive Test Names

Test names should clearly describe what is being tested:

**Good**:
```typescript
it('should throw error when dividing by zero', () => { ... });
it('should return empty array when no users exist', () => { ... });
it('should validate email format correctly', () => { ... });
```

**Bad**:
```typescript
it('test1', () => { ... });
it('works', () => { ... });
it('should work correctly', () => { ... });
```

### Testing Error Conditions

Always test error cases:

```typescript
it('should throw error for invalid email', () => {
  expect(() => {
    userService.createUser('invalid-email', 'Test', 25);
  }).toThrow('Invalid email format');
});
```

### Testing Async Code

Use async/await for asynchronous tests:

```typescript
it('should fetch data from API', async () => {
  const apiClient = new ApiClient('https://api.example.com');
  const response = await apiClient.get('/users');

  expect(response.status).toBe(200);
});
```

### Setup and Teardown

Use `beforeEach` and `afterEach` for common setup:

```typescript
describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  afterEach(() => {
    userService.clearAllUsers();
  });

  it('should create user', () => {
    const user = userService.createUser('test@example.com', 'Test', 25);
    expect(user).toBeDefined();
  });
});
```

## Test Coverage

### Coverage Metrics

The project tracks four coverage metrics:

1. **Lines**: Percentage of code lines executed
2. **Branches**: Percentage of conditional branches taken
3. **Functions**: Percentage of functions called
4. **Statements**: Percentage of statements executed

### Coverage Thresholds

Minimum coverage requirements (enforced by Jest):

- Lines: 80%
- Branches: 80%
- Functions: 80%
- Statements: 80%

### Viewing Coverage

Generate coverage report:
```bash
npm run test:coverage
```

Open the HTML report:
```bash
open coverage/index.html
```

### Improving Coverage

To improve coverage:

1. **Identify uncovered code**:
   - Check the HTML coverage report
   - Look for red/yellow highlighted lines

2. **Write tests for uncovered code**:
   - Focus on branches (if/else conditions)
   - Test error paths
   - Test all function parameters

3. **Test edge cases**:
   - Null/undefined values
   - Empty arrays/objects
   - Boundary values

## Testing Best Practices

### 1. Test Behavior, Not Implementation

**Good**:
```typescript
it('should return display name with email', () => {
  const user = new User('1', 'test@example.com', 'John', 25);
  expect(user.getDisplayName()).toBe('John (test@example.com)');
});
```

**Bad**:
```typescript
it('should concatenate name and email with parentheses', () => {
  // Testing implementation details
});
```

### 2. One Assertion Per Test (When Possible)

**Good**:
```typescript
it('should set user email', () => {
  expect(user.email).toBe('test@example.com');
});

it('should set user name', () => {
  expect(user.name).toBe('Test User');
});
```

**Acceptable** (related assertions):
```typescript
it('should create user with all properties', () => {
  expect(user.email).toBe('test@example.com');
  expect(user.name).toBe('Test User');
  expect(user.age).toBe(25);
});
```

### 3. Test Edge Cases

Always test:
- Null/undefined
- Empty strings/arrays/objects
- Zero and negative numbers
- Very large numbers
- Special characters
- Boundary values

### 4. Keep Tests Independent

Each test should be able to run independently:

```typescript
// Good: Each test has its own data
it('should create user 1', () => {
  const user = userService.createUser('user1@example.com', 'User 1', 25);
  expect(user).toBeDefined();
});

it('should create user 2', () => {
  const user = userService.createUser('user2@example.com', 'User 2', 30);
  expect(user).toBeDefined();
});
```

### 5. Use Descriptive Variables

```typescript
// Good
it('should reject underage users', () => {
  const minorAge = 17;
  const legalAge = 18;

  expect(validator.validateAge(minorAge).valid).toBe(true);
  expect(new User('1', 'test@example.com', 'Test', minorAge).isAdult()).toBe(false);
  expect(new User('2', 'test@example.com', 'Test', legalAge).isAdult()).toBe(true);
});
```

### 6. Don't Test Third-Party Libraries

Focus on testing your own code, not libraries:

```typescript
// Don't test that Math.pow works
it('should use Math.pow correctly', () => {
  expect(Math.pow(2, 3)).toBe(8); // ❌
});

// Test your own logic
it('should calculate power using base and exponent', () => {
  expect(calculator.power(2, 3)).toBe(8); // ✅
});
```

## Troubleshooting

### Tests Failing Intermittently

**Problem**: Tests pass sometimes and fail other times.

**Solution**:
- Check for shared state between tests
- Ensure proper cleanup in `afterEach`
- Look for timing issues with async code
- Check for random data generation

### Coverage Not Meeting Threshold

**Problem**: Coverage is below 80%.

**Solution**:
```bash
# Generate coverage report
npm run test:coverage

# Open HTML report to see uncovered lines
open coverage/index.html

# Add tests for red/yellow highlighted code
```

### Tests Running Slowly

**Problem**: Test suite takes too long to run.

**Solution**:
- Use `test.only` to run specific tests during development
- Mock expensive operations
- Reduce test data size
- Use `beforeAll` instead of `beforeEach` when appropriate

### Import Errors in Tests

**Problem**: Cannot import modules in test files.

**Solution**:
- Check `tsconfig.json` includes test files
- Verify Jest configuration in `jest.config.js`
- Ensure proper file extensions (.ts, not .js)

### Async Test Timeout

**Problem**: Async tests timing out.

**Solution**:
```typescript
// Increase timeout for specific test
it('should handle long operation', async () => {
  // test code
}, 10000); // 10 second timeout

// Or in beforeEach
beforeEach(() => {
  jest.setTimeout(10000);
});
```

## Running Tests in CI

Tests run automatically in GitHub Actions on:
- Every push to main, develop, or claude/** branches
- Every pull request to main or develop

CI runs:
1. Linting
2. Format checking
3. All tests with coverage
4. Coverage threshold validation
5. Build

To replicate CI locally:
```bash
npm run lint
npm run format:check
npm run test:coverage
npm run build
```

## Coverage Reports

Coverage reports are:
- Generated in `coverage/` directory
- Uploaded to Codecov (in CI)
- Archived as artifacts (in CI)

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [TypeScript Testing](https://basarat.gitbook.io/typescript/intro-1/jest)

---

**Happy Testing!**
