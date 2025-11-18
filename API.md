# API Documentation

Complete API reference for rotem-ai-demo.

## Table of Contents

- [Models](#models)
- [Services](#services)
- [Utils](#utils)
- [Database](#database)
- [Errors](#errors)

---

## Models

### User

Represents a user entity with validation and business logic.

#### Constructor

```typescript
new User(id: string, email: string, name: string, age: number, createdAt?: Date)
```

**Parameters:**

- `id` (string): Unique identifier
- `email` (string): User's email address
- `name` (string): User's full name
- `age` (number): User's age
- `createdAt` (Date, optional): Creation timestamp (defaults to now)

#### Properties

| Property    | Type   | Readonly | Description           |
| ----------- | ------ | -------- | --------------------- |
| `id`        | string | Yes      | Unique identifier     |
| `email`     | string | No       | Email address         |
| `name`      | string | No       | Full name             |
| `age`       | number | No       | Age in years          |
| `createdAt` | Date   | Yes      | Creation timestamp    |

#### Methods

##### `isAdult(): boolean`

Checks if user is 18 or older.

**Returns:** `true` if age >= 18, `false` otherwise

**Example:**

```typescript
const user = new User('1', 'john@example.com', 'John', 25);
console.log(user.isAdult()); // true
```

##### `getDisplayName(): string`

Gets formatted display name.

**Returns:** String in format "Name (email)"

**Example:**

```typescript
user.getDisplayName(); // "John (john@example.com)"
```

##### `updateAge(newAge: number): void`

Updates user's age with validation.

**Parameters:**

- `newAge` (number): New age value

**Throws:**

- Error if age is negative
- Error if age > 150

**Example:**

```typescript
user.updateAge(30);
```

##### `toJSON(): Record<string, unknown>`

Serializes user to JSON object.

**Returns:** Object with all user properties

**Example:**

```typescript
const json = user.toJSON();
// { id: '1', email: 'john@example.com', name: 'John', age: 25, createdAt: '2025-01-15T10:00:00.000Z' }
```

---

## Services

### UserService

Manages user CRUD operations with validation.

#### Constructor

```typescript
new UserService()
```

#### Methods

##### `createUser(email: string, name: string, age: number): User`

Creates a new user.

**Parameters:**

- `email` (string): Valid email address
- `name` (string): Non-empty name
- `age` (number): Valid age (0-150)

**Returns:** Created User instance

**Throws:**

- Error for invalid email
- Error for empty name
- Error for invalid age
- Error for duplicate email

**Example:**

```typescript
const service = new UserService();
const user = service.createUser('john@example.com', 'John Doe', 30);
```

##### `getUserById(id: string): User | undefined`

Finds user by ID.

**Example:**

```typescript
const user = service.getUserById('123');
```

##### `getAllUsers(): User[]`

Gets all users.

**Example:**

```typescript
const users = service.getAllUsers();
```

##### `updateUser(id: string, updates: Partial<IUser>): User`

Updates user properties.

**Example:**

```typescript
service.updateUser('123', { age: 31, name: 'John Updated' });
```

##### `deleteUser(id: string): boolean`

Deletes a user.

**Returns:** `true` if deleted, `false` if not found

##### `searchUsersByName(searchTerm: string): User[]`

Searches users by name (case-insensitive).

##### `getAdultUsers(): User[]`

Gets all users aged 18+.

##### `getMinorUsers(): User[]`

Gets all users under 18.

---

## Utils

### Calculator

Mathematical operations utility.

#### Basic Operations

- `add(a: number, b: number): number`
- `subtract(a: number, b: number): number`
- `multiply(a: number, b: number): number`
- `divide(a: number, b: number): number` - Throws on division by zero

#### Advanced Operations

- `power(base: number, exponent: number): number`
- `sqrt(n: number): number` - Throws for negative numbers
- `factorial(n: number): number` - Throws for negative or non-integer numbers

#### Array Operations

- `average(numbers: number[]): number` - Throws for empty array
- `max(numbers: number[]): number` - Throws for empty array
- `min(numbers: number[]): number` - Throws for empty array
- `percentage(value: number, percent: number): number`

**Examples:**

```typescript
const calc = new Calculator();
calc.add(5, 3); // 8
calc.factorial(5); // 120
calc.average([1, 2, 3, 4, 5]); // 3
```

---

### Validator

Input validation utility.

#### Methods

- `isEmail(email: string): boolean`
- `isStrongPassword(password: string): boolean` - Requires 8+ chars, uppercase, lowercase, number, special char
- `isURL(url: string): boolean`
- `isPhoneNumber(phone: string): boolean`
- `isInRange(value: number, min: number, max: number): boolean`
- `isAlphanumeric(str: string): boolean`
- `isEmpty(value: string | unknown[] | object | null | undefined): boolean`
- `isCreditCard(cardNumber: string): boolean` - Luhn algorithm validation
- `validateAge(age: number): { valid: boolean; message?: string }`

**Examples:**

```typescript
const validator = new Validator();
validator.isEmail('test@example.com'); // true
validator.isStrongPassword('Weak'); // false
validator.isCreditCard('4532015112830366'); // true
```

---

### Logger

Singleton logger with multiple log levels.

#### Log Levels

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}
```

#### Methods

- `getInstance(): Logger` - Get singleton instance
- `setLogLevel(level: LogLevel): void`
- `debug(message: string, context?: Record<string, unknown>): void`
- `info(message: string, context?: Record<string, unknown>): void`
- `warn(message: string, context?: Record<string, unknown>): void`
- `error(message: string, error?: Error, context?: Record<string, unknown>): void`
- `fatal(message: string, error?: Error, context?: Record<string, unknown>): void`
- `getLogs(level?: LogLevel): LogEntry[]`
- `clearLogs(): void`
- `getLogCount(): number`
- `getLogsByTimeRange(start: Date, end: Date): LogEntry[]`

**Example:**

```typescript
const logger = Logger.getInstance();
logger.setLogLevel(LogLevel.DEBUG);
logger.info('App started', { version: '1.0.0' });
logger.error('Failed to connect', new Error('Connection timeout'));
```

---

### Cache

Generic caching utility with TTL support.

#### Constructor

```typescript
new Cache<T>(options?: CacheOptions)
```

**Options:**

- `ttl` (number): Default TTL in milliseconds (default: 60000)
- `maxSize` (number): Maximum entries (default: 100)

#### Methods

- `set(key: string, value: T, ttl?: number): void`
- `get(key: string): T | undefined`
- `has(key: string): boolean`
- `delete(key: string): boolean`
- `clear(): void`
- `size(): number`
- `keys(): string[]`
- `values(): T[]`
- `getStats(): { hits, misses, hitRate, size }`
- `getOrSet(key: string, factory: () => T, ttl?: number): T`
- `getOrSetAsync(key: string, factory: () => Promise<T>, ttl?: number): Promise<T>`
- `setMultiple(entries: Array<{ key, value, ttl? }>): void`
- `getMultiple(keys: string[]): Map<string, T>`
- `deleteMultiple(keys: string[]): number`
- `touch(key: string, ttl?: number): boolean`

**Example:**

```typescript
const cache = new Cache<User>({ ttl: 5000, maxSize: 100 });
cache.set('user:1', user);
const cached = cache.get('user:1');
const stats = cache.getStats();
```

---

## Database

Mock database layer with transaction support.

### Database

#### Methods

- `connect(): Promise<void>`
- `disconnect(): Promise<void>`
- `isConnected(): boolean`
- `createTable(tableName: string): void`
- `dropTable(tableName: string): void`
- `insert<T>(tableName: string, record: T): Promise<T>`
- `findById<T>(tableName: string, id: string): Promise<T | null>`
- `findAll<T>(tableName: string, options?: QueryOptions): Promise<QueryResult<T>>`
- `update<T>(tableName: string, record: T): Promise<T>`
- `delete(tableName: string, id: string): Promise<boolean>`
- `count(tableName: string): Promise<number>`
- `clear(tableName: string): Promise<void>`
- `beginTransaction(): Promise<void>`
- `commit(): Promise<void>`
- `rollback(): Promise<void>`
- `isTransactionActive(): boolean`

**Query Options:**

```typescript
interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}
```

**Example:**

```typescript
const db = new Database();
await db.connect();
db.createTable('users');

await db.insert('users', { id: '1', name: 'John', age: 30 });
const result = await db.findAll('users', { limit: 10, orderBy: 'age' });

await db.beginTransaction();
await db.update('users', { id: '1', name: 'John Updated', age: 31 });
await db.commit();

await db.disconnect();
```

---

## Errors

Custom error hierarchy for better error handling.

### Error Codes

```typescript
enum ErrorCode {
  VALIDATION_ERROR = 1000,
  INVALID_EMAIL = 1001,
  NOT_FOUND = 2000,
  UNAUTHORIZED = 3000,
  INTERNAL_ERROR = 4000,
  // ... and more
}
```

### Error Classes

#### AppError

Base error class.

```typescript
new AppError(
  message: string,
  code: ErrorCode,
  statusCode?: number,
  isOperational?: boolean,
  context?: Record<string, unknown>
)
```

#### Specialized Errors

- `ValidationError` - For validation failures (400)
- `NotFoundError` - For missing resources (404)
- `UnauthorizedError` - For auth failures (401)
- `ForbiddenError` - For permission failures (403)
- `InternalError` - For server errors (500)
- `DatabaseError` - For database errors (500)
- `NetworkError` - For network failures (503)
- `TimeoutError` - For timeout errors (408)
- `BusinessRuleError` - For business logic violations (422)

**Properties:**

- `message` (string): Error message
- `code` (ErrorCode): Error code
- `statusCode` (number): HTTP status code
- `isOperational` (boolean): Whether error is operational
- `context` (object): Additional context
- `timestamp` (Date): When error occurred

**Methods:**

- `toJSON()`: Serialize to JSON

**Example:**

```typescript
import { ValidationError, ErrorCode } from 'rotem-ai-demo';

throw new ValidationError('Invalid email', { email: 'test@' });

// Catching
try {
  // ...
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(error.code); // 1000
    console.log(error.statusCode); // 400
    console.log(error.toJSON());
  }
}
```

---

## Complete Example

```typescript
import {
  UserService,
  Calculator,
  Validator,
  Logger,
  LogLevel,
  Cache,
  Database,
  ValidationError,
} from 'rotem-ai-demo';

async function example() {
  // Setup
  const userService = new UserService();
  const validator = new Validator();
  const logger = Logger.getInstance();
  const cache = new Cache({ ttl: 60000 });
  const db = new Database();

  // Configure logger
  logger.setLogLevel(LogLevel.INFO);

  // Connect database
  await db.connect();
  db.createTable('users');

  // Validate and create user
  const email = 'john@example.com';
  if (!validator.isEmail(email)) {
    throw new ValidationError('Invalid email', { email });
  }

  const user = userService.createUser(email, 'John Doe', 30);

  // Cache user
  cache.set(`user:${user.id}`, user);

  // Log action
  logger.info('User created', { userId: user.id, email: user.email });

  // Store in database
  await db.insert('users', user.toJSON());

  // Query database
  const result = await db.findAll('users', {
    orderBy: 'age',
    orderDirection: 'DESC',
  });

  console.log(`Found ${result.total} users`);

  // Cleanup
  await db.disconnect();
}
```

---

For more examples, see the [examples](./examples/) directory.
