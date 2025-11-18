import { User } from '../../../src/models/User';

describe('User Model', () => {
  describe('constructor', () => {
    it('should create a user with all properties', () => {
      const now = new Date();
      const user = new User('123', 'test@example.com', 'Test User', 25, now);

      expect(user.id).toBe('123');
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.age).toBe(25);
      expect(user.createdAt).toBe(now);
    });

    it('should create a user with default createdAt date', () => {
      const beforeCreate = new Date();
      const user = new User('123', 'test@example.com', 'Test User', 25);
      const afterCreate = new Date();

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });
  });

  describe('isAdult', () => {
    it('should return true for age 18 and above', () => {
      const user18 = new User('1', 'test@example.com', 'Test', 18);
      const user25 = new User('2', 'test@example.com', 'Test', 25);
      const user100 = new User('3', 'test@example.com', 'Test', 100);

      expect(user18.isAdult()).toBe(true);
      expect(user25.isAdult()).toBe(true);
      expect(user100.isAdult()).toBe(true);
    });

    it('should return false for age below 18', () => {
      const user0 = new User('1', 'test@example.com', 'Test', 0);
      const user10 = new User('2', 'test@example.com', 'Test', 10);
      const user17 = new User('3', 'test@example.com', 'Test', 17);

      expect(user0.isAdult()).toBe(false);
      expect(user10.isAdult()).toBe(false);
      expect(user17.isAdult()).toBe(false);
    });
  });

  describe('getDisplayName', () => {
    it('should return formatted display name', () => {
      const user = new User('123', 'john@example.com', 'John Doe', 30);

      expect(user.getDisplayName()).toBe('John Doe (john@example.com)');
    });

    it('should handle special characters in name and email', () => {
      const user = new User('123', 'test+tag@example.co.uk', "O'Brien", 30);

      expect(user.getDisplayName()).toBe("O'Brien (test+tag@example.co.uk)");
    });
  });

  describe('updateAge', () => {
    let user: User;

    beforeEach(() => {
      user = new User('123', 'test@example.com', 'Test User', 25);
    });

    it('should update age with valid value', () => {
      user.updateAge(30);
      expect(user.age).toBe(30);
    });

    it('should update age to 0', () => {
      user.updateAge(0);
      expect(user.age).toBe(0);
    });

    it('should update age to maximum realistic value', () => {
      user.updateAge(150);
      expect(user.age).toBe(150);
    });

    it('should throw error for negative age', () => {
      expect(() => user.updateAge(-1)).toThrow('Age cannot be negative');
      expect(() => user.updateAge(-100)).toThrow('Age cannot be negative');
    });

    it('should throw error for unrealistic age', () => {
      expect(() => user.updateAge(151)).toThrow('Age seems unrealistic');
      expect(() => user.updateAge(200)).toThrow('Age seems unrealistic');
    });

    it('should not update age if validation fails', () => {
      const originalAge = user.age;
      expect(() => user.updateAge(-5)).toThrow();
      expect(user.age).toBe(originalAge);
    });
  });

  describe('toJSON', () => {
    it('should serialize user to JSON object', () => {
      const now = new Date('2024-01-15T10:30:00.000Z');
      const user = new User('123', 'test@example.com', 'Test User', 25, now);

      const json = user.toJSON();

      expect(json).toEqual({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        age: 25,
        createdAt: '2024-01-15T10:30:00.000Z',
      });
    });

    it('should return object with string keys', () => {
      const user = new User('123', 'test@example.com', 'Test User', 25);
      const json = user.toJSON();

      expect(typeof json.id).toBe('string');
      expect(typeof json.email).toBe('string');
      expect(typeof json.name).toBe('string');
      expect(typeof json.age).toBe('number');
      expect(typeof json.createdAt).toBe('string');
    });
  });

  describe('immutability', () => {
    it('should have readonly id', () => {
      const user = new User('123', 'test@example.com', 'Test', 25);
      // TypeScript prevents this at compile time, but we can verify the property exists
      expect(user.id).toBe('123');
    });

    it('should have readonly createdAt', () => {
      const now = new Date();
      const user = new User('123', 'test@example.com', 'Test', 25, now);
      // TypeScript prevents this at compile time, but we can verify the property exists
      expect(user.createdAt).toBe(now);
    });
  });
});
