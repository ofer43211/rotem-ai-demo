/**
 * Basic Usage Examples for rotem-ai-demo
 *
 * This file demonstrates basic usage of the core features.
 */

import {
  User,
  UserService,
  Calculator,
  Validator,
  Logger,
  LogLevel,
  Cache,
  Database,
  ValidationError,
} from '../src';

// ============================================================================
// User Management Example
// ============================================================================

async function userManagementExample(): Promise<void> {
  console.log('\n=== User Management Example ===\n');

  const userService = new UserService();

  // Create users
  const user1 = userService.createUser('john@example.com', 'John Doe', 30);
  const user2 = userService.createUser('jane@example.com', 'Jane Smith', 25);

  console.log(`Created user: ${user1.getDisplayName()}`);
  console.log(`Is adult: ${user1.isAdult()}`);

  // Update user
  userService.updateUser(user1.id, { age: 31 });
  console.log(`Updated ${user1.name}'s age to ${user1.age}`);

  // Search users
  const johns = userService.searchUsersByName('John');
  console.log(`Found ${johns.length} users matching "John"`);

  // Get all adults
  const adults = userService.getAdultUsers();
  console.log(`Total adult users: ${adults.length}`);

  // Serialize to JSON
  const json = user1.toJSON();
  console.log('User JSON:', json);
}

// ============================================================================
// Calculator Example
// ============================================================================

function calculatorExample(): void {
  console.log('\n=== Calculator Example ===\n');

  const calc = new Calculator();

  // Basic operations
  console.log(`Addition: 5 + 3 = ${calc.add(5, 3)}`);
  console.log(`Multiplication: 5 * 3 = ${calc.multiply(5, 3)}`);
  console.log(`Division: 10 / 2 = ${calc.divide(10, 2)}`);

  // Advanced operations
  console.log(`Power: 2^8 = ${calc.power(2, 8)}`);
  console.log(`Square root: √16 = ${calc.sqrt(16)}`);
  console.log(`Factorial: 5! = ${calc.factorial(5)}`);

  // Array operations
  const numbers = [10, 20, 30, 40, 50];
  console.log(`Numbers: ${numbers.join(', ')}`);
  console.log(`Average: ${calc.average(numbers)}`);
  console.log(`Max: ${calc.max(numbers)}`);
  console.log(`Min: ${calc.min(numbers)}`);

  // Percentage
  console.log(`25% of 200 = ${calc.percentage(200, 25)}`);
}

// ============================================================================
// Validation Example
// ============================================================================

function validationExample(): void {
  console.log('\n=== Validation Example ===\n');

  const validator = new Validator();

  // Email validation
  const emails = ['valid@example.com', 'invalid-email', 'test@test.co.uk'];
  emails.forEach((email) => {
    console.log(`${email}: ${validator.isEmail(email) ? '✓ Valid' : '✗ Invalid'}`);
  });

  // Password strength
  const passwords = ['weak', 'StrongPass123!', 'NoNumber!'];
  passwords.forEach((password) => {
    console.log(
      `${password}: ${validator.isStrongPassword(password) ? '✓ Strong' : '✗ Weak'}`,
    );
  });

  // URL validation
  const urls = ['https://example.com', 'not-a-url'];
  urls.forEach((url) => {
    console.log(`${url}: ${validator.isURL(url) ? '✓ Valid URL' : '✗ Invalid URL'}`);
  });

  // Age validation
  const ages = [25, -5, 200];
  ages.forEach((age) => {
    const result = validator.validateAge(age);
    console.log(`Age ${age}: ${result.valid ? '✓ Valid' : `✗ ${result.message}`}`);
  });
}

// ============================================================================
// Logger Example
// ============================================================================

function loggerExample(): void {
  console.log('\n=== Logger Example ===\n');

  const logger = Logger.getInstance();
  logger.setLogLevel(LogLevel.DEBUG);

  // Different log levels
  logger.debug('This is a debug message', { module: 'example' });
  logger.info('Application started');
  logger.warn('This is a warning', { code: 'WARN_001' });

  try {
    throw new Error('Something went wrong');
  } catch (error) {
    logger.error('An error occurred', error as Error, { context: 'example' });
  }

  // Retrieve logs
  const errorLogs = logger.getLogs(LogLevel.ERROR);
  console.log(`Total error logs: ${errorLogs.length}`);

  const stats = {
    totalLogs: logger.getLogCount(),
    errorCount: logger.getLogs(LogLevel.ERROR).length,
    warnCount: logger.getLogs(LogLevel.WARN).length,
  };

  console.log('Logging stats:', stats);
}

// ============================================================================
// Cache Example
// ============================================================================

async function cacheExample(): Promise<void> {
  console.log('\n=== Cache Example ===\n');

  const cache = new Cache<string>({ ttl: 5000, maxSize: 100 });

  // Set and get values
  cache.set('user:1', 'John Doe');
  cache.set('user:2', 'Jane Smith');

  console.log(`Cached value: ${cache.get('user:1')}`);

  // Get or set pattern
  const value = cache.getOrSet('user:3', () => {
    console.log('Cache miss - fetching from database...');
    return 'Bob Johnson';
  });

  console.log(`Value: ${value}`);

  // Async get or set
  const asyncValue = await cache.getOrSetAsync('user:4', async () => {
    console.log('Async cache miss - fetching...');
    await new Promise((resolve) => setTimeout(resolve, 100));
    return 'Alice Williams';
  });

  console.log(`Async value: ${asyncValue}`);

  // Cache statistics
  cache.get('user:1'); // hit
  cache.get('user:99'); // miss

  const stats = cache.getStats();
  console.log('Cache stats:', {
    hits: stats.hits,
    misses: stats.misses,
    hitRate: `${(stats.hitRate * 100).toFixed(1)}%`,
    size: stats.size,
  });
}

// ============================================================================
// Database Example
// ============================================================================

async function databaseExample(): Promise<void> {
  console.log('\n=== Database Example ===\n');

  const db = new Database();
  await db.connect();
  db.createTable('users');

  // Insert records
  await db.insert('users', { id: '1', name: 'John Doe', age: 30 });
  await db.insert('users', { id: '2', name: 'Jane Smith', age: 25 });
  await db.insert('users', { id: '3', name: 'Bob Johnson', age: 35 });

  // Find by ID
  const user = await db.findById('users', '1');
  console.log('Found user:', user);

  // Find all with pagination
  const result = await db.findAll('users', {
    limit: 2,
    orderBy: 'age',
    orderDirection: 'DESC',
  });

  console.log(`Found ${result.data.length} users (total: ${result.total})`);
  console.log('Has more:', result.hasMore);

  // Transaction example
  await db.beginTransaction();
  try {
    await db.update('users', { id: '1', name: 'John Updated', age: 31 });
    await db.delete('users', '3');
    await db.commit();
    console.log('Transaction committed');
  } catch (error) {
    await db.rollback();
    console.log('Transaction rolled back');
  }

  // Cleanup
  await db.disconnect();
}

// ============================================================================
// Error Handling Example
// ============================================================================

function errorHandlingExample(): void {
  console.log('\n=== Error Handling Example ===\n');

  const validator = new Validator();

  try {
    const email = 'invalid-email';

    if (!validator.isEmail(email)) {
      throw new ValidationError('Invalid email format', { email });
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('Caught ValidationError:');
      console.log(`- Message: ${error.message}`);
      console.log(`- Code: ${error.code}`);
      console.log(`- Status: ${error.statusCode}`);
      console.log(`- Context:`, error.context);
      console.log(`- JSON:`, error.toJSON());
    }
  }
}

// ============================================================================
// Run All Examples
// ============================================================================

async function runAllExamples(): Promise<void> {
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║   rotem-ai-demo - Usage Examples         ║');
  console.log('╚═══════════════════════════════════════════╝');

  try {
    await userManagementExample();
    calculatorExample();
    validationExample();
    loggerExample();
    await cacheExample();
    await databaseExample();
    errorHandlingExample();

    console.log('\n✓ All examples completed successfully!\n');
  } catch (error) {
    console.error('\n✗ Error running examples:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllExamples();
}

export {
  userManagementExample,
  calculatorExample,
  validationExample,
  loggerExample,
  cacheExample,
  databaseExample,
  errorHandlingExample,
};
