import { Validator } from '../../../src/utils/Validator';

describe('Validator', () => {
  let validator: Validator;

  beforeEach(() => {
    validator = new Validator();
  });

  describe('isEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validator.isEmail('test@example.com')).toBe(true);
      expect(validator.isEmail('user.name@example.co.uk')).toBe(true);
      expect(validator.isEmail('user+tag@example.com')).toBe(true);
      expect(validator.isEmail('user_123@test-domain.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validator.isEmail('invalid')).toBe(false);
      expect(validator.isEmail('invalid@')).toBe(false);
      expect(validator.isEmail('@example.com')).toBe(false);
      expect(validator.isEmail('invalid@domain')).toBe(false);
      expect(validator.isEmail('invalid @example.com')).toBe(false);
      expect(validator.isEmail('')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('should validate strong passwords', () => {
      expect(validator.isStrongPassword('Password123!')).toBe(true);
      expect(validator.isStrongPassword('MyP@ssw0rd')).toBe(true);
      expect(validator.isStrongPassword('Str0ng!Pass')).toBe(true);
      expect(validator.isStrongPassword('C0mpl3x#Pass')).toBe(true);
    });

    it('should reject passwords shorter than 8 characters', () => {
      expect(validator.isStrongPassword('Pass1!')).toBe(false);
      expect(validator.isStrongPassword('Ab1!')).toBe(false);
    });

    it('should reject passwords without uppercase letters', () => {
      expect(validator.isStrongPassword('password123!')).toBe(false);
    });

    it('should reject passwords without lowercase letters', () => {
      expect(validator.isStrongPassword('PASSWORD123!')).toBe(false);
    });

    it('should reject passwords without numbers', () => {
      expect(validator.isStrongPassword('Password!')).toBe(false);
    });

    it('should reject passwords without special characters', () => {
      expect(validator.isStrongPassword('Password123')).toBe(false);
    });

    it('should reject empty password', () => {
      expect(validator.isStrongPassword('')).toBe(false);
    });
  });

  describe('isURL', () => {
    it('should validate correct URLs', () => {
      expect(validator.isURL('https://example.com')).toBe(true);
      expect(validator.isURL('http://example.com')).toBe(true);
      expect(validator.isURL('https://example.com/path/to/page')).toBe(true);
      expect(validator.isURL('https://example.com?query=value')).toBe(true);
      expect(validator.isURL('https://subdomain.example.com')).toBe(true);
      expect(validator.isURL('ftp://files.example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(validator.isURL('not-a-url')).toBe(false);
      expect(validator.isURL('example.com')).toBe(false);
      expect(validator.isURL('')).toBe(false);
      expect(validator.isURL('http://')).toBe(false);
    });
  });

  describe('isPhoneNumber', () => {
    it('should validate correct phone numbers', () => {
      expect(validator.isPhoneNumber('+1234567890')).toBe(true);
      expect(validator.isPhoneNumber('+12345678901234')).toBe(true);
      expect(validator.isPhoneNumber('+972501234567')).toBe(true);
      expect(validator.isPhoneNumber('12345678901')).toBe(true);
    });

    it('should validate phone numbers with formatting', () => {
      expect(validator.isPhoneNumber('+1 234 567 8901')).toBe(true);
      expect(validator.isPhoneNumber('+1-234-567-8901')).toBe(true);
      expect(validator.isPhoneNumber('+1 (234) 567-8901')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validator.isPhoneNumber('123')).toBe(false);
      expect(validator.isPhoneNumber('+0123456789')).toBe(false);
      expect(validator.isPhoneNumber('abcdefghijk')).toBe(false);
      expect(validator.isPhoneNumber('')).toBe(false);
      expect(validator.isPhoneNumber('+1 abc def ghij')).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should validate numbers within range', () => {
      expect(validator.isInRange(5, 1, 10)).toBe(true);
      expect(validator.isInRange(1, 1, 10)).toBe(true);
      expect(validator.isInRange(10, 1, 10)).toBe(true);
      expect(validator.isInRange(0, -10, 10)).toBe(true);
    });

    it('should reject numbers outside range', () => {
      expect(validator.isInRange(0, 1, 10)).toBe(false);
      expect(validator.isInRange(11, 1, 10)).toBe(false);
      expect(validator.isInRange(-5, 0, 10)).toBe(false);
    });

    it('should handle decimal numbers', () => {
      expect(validator.isInRange(5.5, 1.0, 10.0)).toBe(true);
      expect(validator.isInRange(0.5, 0, 1)).toBe(true);
    });
  });

  describe('isAlphanumeric', () => {
    it('should validate alphanumeric strings', () => {
      expect(validator.isAlphanumeric('abc123')).toBe(true);
      expect(validator.isAlphanumeric('ABC123')).toBe(true);
      expect(validator.isAlphanumeric('Test123')).toBe(true);
      expect(validator.isAlphanumeric('123')).toBe(true);
      expect(validator.isAlphanumeric('abc')).toBe(true);
    });

    it('should reject non-alphanumeric strings', () => {
      expect(validator.isAlphanumeric('abc 123')).toBe(false);
      expect(validator.isAlphanumeric('abc-123')).toBe(false);
      expect(validator.isAlphanumeric('abc_123')).toBe(false);
      expect(validator.isAlphanumeric('abc@123')).toBe(false);
      expect(validator.isAlphanumeric('')).toBe(false);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty strings', () => {
      expect(validator.isEmpty('')).toBe(true);
      expect(validator.isEmpty('   ')).toBe(true);
      expect(validator.isEmpty('\t\n')).toBe(true);
    });

    it('should return true for empty arrays', () => {
      expect(validator.isEmpty([])).toBe(true);
    });

    it('should return true for empty objects', () => {
      expect(validator.isEmpty({})).toBe(true);
    });

    it('should return true for null and undefined', () => {
      expect(validator.isEmpty(null)).toBe(true);
      expect(validator.isEmpty(undefined)).toBe(true);
    });

    it('should return false for non-empty strings', () => {
      expect(validator.isEmpty('hello')).toBe(false);
      expect(validator.isEmpty(' hello ')).toBe(false);
    });

    it('should return false for non-empty arrays', () => {
      expect(validator.isEmpty([1, 2, 3])).toBe(false);
      expect(validator.isEmpty([null])).toBe(false);
    });

    it('should return false for non-empty objects', () => {
      expect(validator.isEmpty({ key: 'value' })).toBe(false);
      expect(validator.isEmpty({ a: undefined })).toBe(false);
    });
  });

  describe('isCreditCard', () => {
    it('should validate correct credit card numbers', () => {
      expect(validator.isCreditCard('4532015112830366')).toBe(true); // Visa
      expect(validator.isCreditCard('6011111111111117')).toBe(true); // Discover
      expect(validator.isCreditCard('5425233430109903')).toBe(true); // Mastercard
    });

    it('should validate credit card numbers with spaces', () => {
      expect(validator.isCreditCard('4532 0151 1283 0366')).toBe(true);
    });

    it('should reject invalid credit card numbers', () => {
      expect(validator.isCreditCard('4532015112830367')).toBe(false); // Wrong checksum
      expect(validator.isCreditCard('1234567890123456')).toBe(false);
      expect(validator.isCreditCard('abcd efgh ijkl mnop')).toBe(false);
      expect(validator.isCreditCard('')).toBe(false);
    });
  });

  describe('validateAge', () => {
    it('should validate correct ages', () => {
      expect(validator.validateAge(0)).toEqual({ valid: true });
      expect(validator.validateAge(18)).toEqual({ valid: true });
      expect(validator.validateAge(65)).toEqual({ valid: true });
      expect(validator.validateAge(150)).toEqual({ valid: true });
    });

    it('should reject negative ages', () => {
      const result = validator.validateAge(-1);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Age cannot be negative');
    });

    it('should reject unrealistic ages', () => {
      const result = validator.validateAge(151);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Age seems unrealistic');
    });

    it('should reject non-integer ages', () => {
      const result = validator.validateAge(25.5);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Age must be an integer');
    });
  });
});
