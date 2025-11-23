import { UserService } from '../../src/services/UserService';
import { Calculator } from '../../src/utils/Calculator';
import { Validator } from '../../src/utils/Validator';

describe('User Workflow Integration Tests', () => {
  let userService: UserService;
  let calculator: Calculator;
  let validator: Validator;

  beforeEach(() => {
    userService = new UserService();
    calculator = new Calculator();
    validator = new Validator();
  });

  afterEach(() => {
    userService.clearAllUsers();
  });

  describe('Complete user registration and management workflow', () => {
    it('should handle complete user lifecycle', () => {
      // Create users
      const user1 = userService.createUser('john@example.com', 'John Doe', 25);
      userService.createUser('jane@example.com', 'Jane Smith', 30);
      const user3 = userService.createUser('bob@example.com', 'Bob Johnson', 17);

      // Verify user creation
      expect(userService.getUserCount()).toBe(3);

      // Test search functionality
      const johnResults = userService.searchUsersByName('John');
      expect(johnResults).toHaveLength(2); // John Doe and Bob Johnson

      // Test filtering
      const adults = userService.getAdultUsers();
      expect(adults).toHaveLength(2);
      expect(adults.map((u) => u.email)).toContain('john@example.com');
      expect(adults.map((u) => u.email)).toContain('jane@example.com');

      const minors = userService.getMinorUsers();
      expect(minors).toHaveLength(1);
      expect(minors[0].email).toBe('bob@example.com');

      // Update user
      const updatedUser = userService.updateUser(user3.id, {
        age: 18,
        name: 'Bob Johnson Jr.',
      });
      expect(updatedUser.isAdult()).toBe(true);
      expect(userService.getAdultUsers()).toHaveLength(3);

      // Delete user
      userService.deleteUser(user1.id);
      expect(userService.getUserCount()).toBe(2);
      expect(userService.getUserById(user1.id)).toBeUndefined();
    });

    it('should validate user data using Validator', () => {
      const email = 'test@example.com';
      const invalidEmail = 'invalid-email';
      const age = 25;

      // Validate email before user creation
      expect(validator.isEmail(email)).toBe(true);
      expect(validator.isEmail(invalidEmail)).toBe(false);

      // Validate age
      const ageValidation = validator.validateAge(age);
      expect(ageValidation.valid).toBe(true);

      // Create user with valid data
      const user = userService.createUser(email, 'Test User', age);
      expect(user).toBeDefined();

      // Attempt to create user with invalid email should fail
      expect(() => userService.createUser(invalidEmail, 'Test', 25)).toThrow();
    });

    it('should calculate statistics using Calculator', () => {
      // Create multiple users
      userService.createUser('user1@example.com', 'User 1', 20);
      userService.createUser('user2@example.com', 'User 2', 30);
      userService.createUser('user3@example.com', 'User 3', 40);
      userService.createUser('user4@example.com', 'User 4', 50);

      const users = userService.getAllUsers();
      const ages = users.map((u) => u.age);

      // Calculate average age
      const avgAge = calculator.average(ages);
      expect(avgAge).toBe(35);

      // Find min and max ages
      const minAge = calculator.min(ages);
      const maxAge = calculator.max(ages);
      expect(minAge).toBe(20);
      expect(maxAge).toBe(50);

      // Calculate percentage of users over 30
      const usersOver30 = users.filter((u) => u.age > 30).length;
      const percentageOver30 = calculator.percentage(users.length, (usersOver30 / users.length) * 100);
      expect(percentageOver30).toBe(2); // 50% of 4 users
    });
  });

  describe('User data validation and transformation', () => {
    it('should validate and create users with various data formats', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach((email, index) => {
        expect(validator.isEmail(email)).toBe(true);
        const user = userService.createUser(email, `User ${index}`, 25);
        expect(user.email).toBe(email);
      });

      expect(userService.getUserCount()).toBe(validEmails.length);
    });

    it('should handle bulk user operations', () => {
      const usersData = [
        { email: 'alice@example.com', name: 'Alice', age: 25 },
        { email: 'bob@example.com', name: 'Bob', age: 30 },
        { email: 'charlie@example.com', name: 'Charlie', age: 35 },
        { email: 'david@example.com', name: 'David', age: 40 },
        { email: 'eve@example.com', name: 'Eve', age: 45 },
      ];

      // Bulk create
      const createdUsers = usersData.map((data) =>
        userService.createUser(data.email, data.name, data.age),
      );

      expect(userService.getUserCount()).toBe(5);

      // Bulk retrieve
      const allUsers = userService.getAllUsers();
      expect(allUsers).toHaveLength(5);

      // Calculate group statistics
      const ages = allUsers.map((u) => u.age);
      const avgAge = calculator.average(ages);
      expect(avgAge).toBe(35);

      // Bulk delete
      createdUsers.slice(0, 2).forEach((user) => {
        userService.deleteUser(user.id);
      });

      expect(userService.getUserCount()).toBe(3);
    });
  });

  describe('Error handling across components', () => {
    it('should handle validation errors consistently', () => {
      // Invalid email
      expect(() => userService.createUser('invalid', 'Test', 25)).toThrow('Invalid email format');

      // Invalid age
      expect(() => userService.createUser('test@example.com', 'Test', -1)).toThrow(
        'Age cannot be negative',
      );

      // Empty name
      expect(() => userService.createUser('test@example.com', '', 25)).toThrow(
        'Name cannot be empty',
      );

      // Verify no users were created
      expect(userService.getUserCount()).toBe(0);
    });

    it('should handle update errors without corrupting data', () => {
      const user = userService.createUser('test@example.com', 'Test User', 25);
      const originalEmail = user.email;
      const originalName = user.name;
      const originalAge = user.age;

      // Attempt invalid update
      expect(() => userService.updateUser(user.id, { email: 'invalid' })).toThrow();

      // Verify user data unchanged
      const unchangedUser = userService.getUserById(user.id);
      expect(unchangedUser?.email).toBe(originalEmail);
      expect(unchangedUser?.name).toBe(originalName);
      expect(unchangedUser?.age).toBe(originalAge);
    });
  });

  describe('Complex user filtering and search', () => {
    beforeEach(() => {
      // Create diverse set of users
      userService.createUser('john.doe@example.com', 'John Doe', 25);
      userService.createUser('jane.doe@example.com', 'Jane Doe', 30);
      userService.createUser('john.smith@example.com', 'John Smith', 17);
      userService.createUser('alice.johnson@example.com', 'Alice Johnson', 45);
      userService.createUser('bob.williams@example.com', 'Bob Williams', 16);
    });

    it('should filter and search users by multiple criteria', () => {
      // Get all Johns
      const johns = userService.searchUsersByName('John');
      expect(johns).toHaveLength(3); // John Doe, John Smith, Alice Johnson (contains 'john')

      // Get adults
      const adults = userService.getAdultUsers();
      expect(adults).toHaveLength(3);

      // Get minors
      const minors = userService.getMinorUsers();
      expect(minors).toHaveLength(2);

      // Calculate average age of adults
      const adultAges = adults.map((u) => u.age);
      const avgAdultAge = calculator.average(adultAges);
      expect(avgAdultAge).toBeCloseTo(33.33, 1);

      // Calculate average age of minors
      const minorAges = minors.map((u) => u.age);
      const avgMinorAge = calculator.average(minorAges);
      expect(avgMinorAge).toBe(16.5);
    });
  });

  describe('User data serialization and transformation', () => {
    it('should serialize users and validate JSON structure', () => {
      const user = userService.createUser('test@example.com', 'Test User', 25);
      const json = user.toJSON();

      // Validate JSON structure
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('email');
      expect(json).toHaveProperty('name');
      expect(json).toHaveProperty('age');
      expect(json).toHaveProperty('createdAt');

      // Validate data types
      expect(typeof json.id).toBe('string');
      expect(typeof json.email).toBe('string');
      expect(typeof json.name).toBe('string');
      expect(typeof json.age).toBe('number');
      expect(typeof json.createdAt).toBe('string');

      // Validate email format in JSON
      expect(validator.isEmail(json.email as string)).toBe(true);
    });

    it('should handle multiple users serialization', () => {
      userService.createUser('user1@example.com', 'User 1', 25);
      userService.createUser('user2@example.com', 'User 2', 30);
      userService.createUser('user3@example.com', 'User 3', 35);

      const users = userService.getAllUsers();
      const serialized = users.map((u) => u.toJSON());

      expect(serialized).toHaveLength(3);
      serialized.forEach((json) => {
        expect(validator.isEmail(json.email as string)).toBe(true);
        expect(typeof json.age).toBe('number');
      });
    });
  });
});
