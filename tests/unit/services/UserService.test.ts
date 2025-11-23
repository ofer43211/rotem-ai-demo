import { UserService } from '../../../src/services/UserService';
import { User } from '../../../src/models/User';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('createUser', () => {
    it('should create a user with valid data', () => {
      const user = userService.createUser('test@example.com', 'Test User', 25);

      expect(user).toBeInstanceOf(User);
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.age).toBe(25);
      expect(user.id).toBeDefined();
    });

    it('should generate unique IDs for different users', () => {
      const user1 = userService.createUser('user1@example.com', 'User 1', 25);
      const user2 = userService.createUser('user2@example.com', 'User 2', 30);

      expect(user1.id).not.toBe(user2.id);
    });

    it('should throw error for invalid email', () => {
      expect(() => userService.createUser('invalid-email', 'Test User', 25)).toThrow(
        'Invalid email format',
      );
      expect(() => userService.createUser('', 'Test User', 25)).toThrow('Invalid email format');
      expect(() => userService.createUser('test@', 'Test User', 25)).toThrow(
        'Invalid email format',
      );
    });

    it('should throw error for empty name', () => {
      expect(() => userService.createUser('test@example.com', '', 25)).toThrow(
        'Name cannot be empty',
      );
      expect(() => userService.createUser('test@example.com', '   ', 25)).toThrow(
        'Name cannot be empty',
      );
    });

    it('should throw error for invalid age', () => {
      expect(() => userService.createUser('test@example.com', 'Test User', -1)).toThrow(
        'Age cannot be negative',
      );
      expect(() => userService.createUser('test@example.com', 'Test User', 151)).toThrow(
        'Age seems unrealistic',
      );
    });

    it('should throw error for duplicate email', () => {
      userService.createUser('duplicate@example.com', 'User 1', 25);

      expect(() => userService.createUser('duplicate@example.com', 'User 2', 30)).toThrow(
        'User with this email already exists',
      );
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', () => {
      const createdUser = userService.createUser('test@example.com', 'Test User', 25);
      const foundUser = userService.getUserById(createdUser.id);

      expect(foundUser).toBe(createdUser);
    });

    it('should return undefined for non-existent ID', () => {
      const user = userService.getUserById('non-existent-id');

      expect(user).toBeUndefined();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', () => {
      const createdUser = userService.createUser('test@example.com', 'Test User', 25);
      const foundUser = userService.getUserByEmail('test@example.com');

      expect(foundUser).toBe(createdUser);
    });

    it('should return undefined for non-existent email', () => {
      const user = userService.getUserByEmail('nonexistent@example.com');

      expect(user).toBeUndefined();
    });

    it('should be case-sensitive', () => {
      userService.createUser('test@example.com', 'Test User', 25);
      const user = userService.getUserByEmail('TEST@EXAMPLE.COM');

      expect(user).toBeUndefined();
    });
  });

  describe('getAllUsers', () => {
    it('should return empty array when no users exist', () => {
      const users = userService.getAllUsers();

      expect(users).toEqual([]);
    });

    it('should return all users', () => {
      const user1 = userService.createUser('user1@example.com', 'User 1', 25);
      const user2 = userService.createUser('user2@example.com', 'User 2', 30);
      const user3 = userService.createUser('user3@example.com', 'User 3', 35);

      const users = userService.getAllUsers();

      expect(users).toHaveLength(3);
      expect(users).toContain(user1);
      expect(users).toContain(user2);
      expect(users).toContain(user3);
    });
  });

  describe('updateUser', () => {
    let userId: string;

    beforeEach(() => {
      const user = userService.createUser('test@example.com', 'Test User', 25);
      userId = user.id;
    });

    it('should update user email', () => {
      const updatedUser = userService.updateUser(userId, { email: 'new@example.com' });

      expect(updatedUser.email).toBe('new@example.com');
    });

    it('should update user name', () => {
      const updatedUser = userService.updateUser(userId, { name: 'New Name' });

      expect(updatedUser.name).toBe('New Name');
    });

    it('should update user age', () => {
      const updatedUser = userService.updateUser(userId, { age: 30 });

      expect(updatedUser.age).toBe(30);
    });

    it('should update multiple fields', () => {
      const updatedUser = userService.updateUser(userId, {
        email: 'new@example.com',
        name: 'New Name',
        age: 30,
      });

      expect(updatedUser.email).toBe('new@example.com');
      expect(updatedUser.name).toBe('New Name');
      expect(updatedUser.age).toBe(30);
    });

    it('should throw error for non-existent user', () => {
      expect(() => userService.updateUser('non-existent-id', { name: 'New Name' })).toThrow(
        'User not found',
      );
    });

    it('should throw error for invalid email', () => {
      expect(() => userService.updateUser(userId, { email: 'invalid-email' })).toThrow(
        'Invalid email format',
      );
    });

    it('should throw error for empty name', () => {
      expect(() => userService.updateUser(userId, { name: '' })).toThrow('Name cannot be empty');
    });

    it('should throw error for duplicate email', () => {
      userService.createUser('other@example.com', 'Other User', 30);

      expect(() => userService.updateUser(userId, { email: 'other@example.com' })).toThrow(
        'Another user with this email already exists',
      );
    });

    it('should allow updating to same email', () => {
      const updatedUser = userService.updateUser(userId, { email: 'test@example.com' });

      expect(updatedUser.email).toBe('test@example.com');
    });
  });

  describe('deleteUser', () => {
    it('should delete existing user', () => {
      const user = userService.createUser('test@example.com', 'Test User', 25);
      const result = userService.deleteUser(user.id);

      expect(result).toBe(true);
      expect(userService.getUserById(user.id)).toBeUndefined();
    });

    it('should return false for non-existent user', () => {
      const result = userService.deleteUser('non-existent-id');

      expect(result).toBe(false);
    });

    it('should decrease user count after deletion', () => {
      const user = userService.createUser('test@example.com', 'Test User', 25);
      expect(userService.getUserCount()).toBe(1);

      userService.deleteUser(user.id);
      expect(userService.getUserCount()).toBe(0);
    });
  });

  describe('getUserCount', () => {
    it('should return 0 when no users exist', () => {
      expect(userService.getUserCount()).toBe(0);
    });

    it('should return correct count of users', () => {
      userService.createUser('user1@example.com', 'User 1', 25);
      expect(userService.getUserCount()).toBe(1);

      userService.createUser('user2@example.com', 'User 2', 30);
      expect(userService.getUserCount()).toBe(2);

      userService.createUser('user3@example.com', 'User 3', 35);
      expect(userService.getUserCount()).toBe(3);
    });
  });

  describe('getAdultUsers', () => {
    it('should return only adult users', () => {
      const adult1 = userService.createUser('adult1@example.com', 'Adult 1', 18);
      const minor = userService.createUser('minor@example.com', 'Minor', 17);
      const adult2 = userService.createUser('adult2@example.com', 'Adult 2', 25);

      const adults = userService.getAdultUsers();

      expect(adults).toHaveLength(2);
      expect(adults).toContain(adult1);
      expect(adults).toContain(adult2);
      expect(adults).not.toContain(minor);
    });

    it('should return empty array when no adult users exist', () => {
      userService.createUser('minor1@example.com', 'Minor 1', 10);
      userService.createUser('minor2@example.com', 'Minor 2', 17);

      const adults = userService.getAdultUsers();

      expect(adults).toEqual([]);
    });
  });

  describe('getMinorUsers', () => {
    it('should return only minor users', () => {
      const minor1 = userService.createUser('minor1@example.com', 'Minor 1', 10);
      const adult = userService.createUser('adult@example.com', 'Adult', 18);
      const minor2 = userService.createUser('minor2@example.com', 'Minor 2', 17);

      const minors = userService.getMinorUsers();

      expect(minors).toHaveLength(2);
      expect(minors).toContain(minor1);
      expect(minors).toContain(minor2);
      expect(minors).not.toContain(adult);
    });

    it('should return empty array when no minor users exist', () => {
      userService.createUser('adult1@example.com', 'Adult 1', 18);
      userService.createUser('adult2@example.com', 'Adult 2', 25);

      const minors = userService.getMinorUsers();

      expect(minors).toEqual([]);
    });
  });

  describe('searchUsersByName', () => {
    beforeEach(() => {
      userService.createUser('john@example.com', 'John Doe', 25);
      userService.createUser('jane@example.com', 'Jane Smith', 30);
      userService.createUser('johnny@example.com', 'Johnny Cash', 35);
    });

    it('should find users by partial name match', () => {
      const results = userService.searchUsersByName('John');

      expect(results).toHaveLength(2);
      expect(results.map((u) => u.name)).toContain('John Doe');
      expect(results.map((u) => u.name)).toContain('Johnny Cash');
    });

    it('should be case-insensitive', () => {
      const results = userService.searchUsersByName('john');

      expect(results).toHaveLength(2);
    });

    it('should return empty array when no matches found', () => {
      const results = userService.searchUsersByName('Bob');

      expect(results).toEqual([]);
    });

    it('should find exact matches', () => {
      const results = userService.searchUsersByName('Jane Smith');

      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Jane Smith');
    });
  });

  describe('clearAllUsers', () => {
    it('should remove all users', () => {
      userService.createUser('user1@example.com', 'User 1', 25);
      userService.createUser('user2@example.com', 'User 2', 30);
      userService.createUser('user3@example.com', 'User 3', 35);

      expect(userService.getUserCount()).toBe(3);

      userService.clearAllUsers();

      expect(userService.getUserCount()).toBe(0);
      expect(userService.getAllUsers()).toEqual([]);
    });

    it('should do nothing when no users exist', () => {
      expect(() => userService.clearAllUsers()).not.toThrow();
      expect(userService.getUserCount()).toBe(0);
    });
  });
});
