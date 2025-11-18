import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalError,
  DatabaseError,
  NetworkError,
  TimeoutError,
  BusinessRuleError,
  ErrorCode,
} from '../../../src/errors/AppError';

describe('AppError', () => {
  describe('Base AppError', () => {
    it('should create error with all properties', () => {
      const error = new AppError(
        'Test error',
        ErrorCode.VALIDATION_ERROR,
        400,
        true,
        { field: 'email' },
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.context).toEqual({ field: 'email' });
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should have default values', () => {
      const error = new AppError('Test error', ErrorCode.INTERNAL_ERROR);

      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.context).toBeUndefined();
    });

    it('should have stack trace', () => {
      const error = new AppError('Test error', ErrorCode.INTERNAL_ERROR);

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });

    it('should serialize to JSON', () => {
      const error = new AppError('Test error', ErrorCode.VALIDATION_ERROR, 400, true, {
        field: 'email',
      });

      const json = error.toJSON();

      expect(json.name).toBe('AppError');
      expect(json.message).toBe('Test error');
      expect(json.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(json.statusCode).toBe(400);
      expect(json.context).toEqual({ field: 'email' });
      expect(typeof json.timestamp).toBe('string');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid input', { field: 'email' });

      expect(error.message).toBe('Invalid input');
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
      expect(error.context).toEqual({ field: 'email' });
    });

    it('should be instance of AppError', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ValidationError);
    });

    it('should have correct name', () => {
      const error = new ValidationError('Invalid input');

      expect(error.name).toBe('ValidationError');
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error', () => {
      const error = new NotFoundError('Resource not found', { id: '123' });

      expect(error.message).toBe('Resource not found');
      expect(error.code).toBe(ErrorCode.NOT_FOUND);
      expect(error.statusCode).toBe(404);
      expect(error.isOperational).toBe(true);
    });

    it('should be instance of AppError', () => {
      const error = new NotFoundError('Not found');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NotFoundError);
    });
  });

  describe('UnauthorizedError', () => {
    it('should create unauthorized error', () => {
      const error = new UnauthorizedError('Not authenticated');

      expect(error.message).toBe('Not authenticated');
      expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
      expect(error.statusCode).toBe(401);
      expect(error.isOperational).toBe(true);
    });

    it('should be instance of AppError', () => {
      const error = new UnauthorizedError('Unauthorized');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(UnauthorizedError);
    });
  });

  describe('ForbiddenError', () => {
    it('should create forbidden error', () => {
      const error = new ForbiddenError('Access denied');

      expect(error.message).toBe('Access denied');
      expect(error.code).toBe(ErrorCode.FORBIDDEN);
      expect(error.statusCode).toBe(403);
      expect(error.isOperational).toBe(true);
    });

    it('should be instance of AppError', () => {
      const error = new ForbiddenError('Forbidden');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(ForbiddenError);
    });
  });

  describe('InternalError', () => {
    it('should create internal error', () => {
      const error = new InternalError('Server error');

      expect(error.message).toBe('Server error');
      expect(error.code).toBe(ErrorCode.INTERNAL_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });

    it('should be instance of AppError', () => {
      const error = new InternalError('Internal error');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(InternalError);
    });
  });

  describe('DatabaseError', () => {
    it('should create database error', () => {
      const error = new DatabaseError('Query failed');

      expect(error.message).toBe('Query failed');
      expect(error.code).toBe(ErrorCode.DATABASE_ERROR);
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });

    it('should be instance of AppError', () => {
      const error = new DatabaseError('DB error');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(DatabaseError);
    });
  });

  describe('NetworkError', () => {
    it('should create network error', () => {
      const error = new NetworkError('Connection failed');

      expect(error.message).toBe('Connection failed');
      expect(error.code).toBe(ErrorCode.NETWORK_ERROR);
      expect(error.statusCode).toBe(503);
      expect(error.isOperational).toBe(true);
    });

    it('should be instance of AppError', () => {
      const error = new NetworkError('Network error');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(NetworkError);
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error', () => {
      const error = new TimeoutError('Request timeout');

      expect(error.message).toBe('Request timeout');
      expect(error.code).toBe(ErrorCode.TIMEOUT_ERROR);
      expect(error.statusCode).toBe(408);
      expect(error.isOperational).toBe(true);
    });

    it('should be instance of AppError', () => {
      const error = new TimeoutError('Timeout');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(TimeoutError);
    });
  });

  describe('BusinessRuleError', () => {
    it('should create business rule error', () => {
      const error = new BusinessRuleError('Rule violation');

      expect(error.message).toBe('Rule violation');
      expect(error.code).toBe(ErrorCode.BUSINESS_RULE_VIOLATION);
      expect(error.statusCode).toBe(422);
      expect(error.isOperational).toBe(true);
    });

    it('should be instance of AppError', () => {
      const error = new BusinessRuleError('Business error');

      expect(error).toBeInstanceOf(AppError);
      expect(error).toBeInstanceOf(BusinessRuleError);
    });
  });

  describe('Error throwing', () => {
    it('should be throwable', () => {
      expect(() => {
        throw new ValidationError('Invalid input');
      }).toThrow(ValidationError);
    });

    it('should be catchable as Error', () => {
      try {
        throw new ValidationError('Invalid input');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ValidationError);
      }
    });
  });

  describe('Context handling', () => {
    it('should store complex context', () => {
      const context = {
        userId: '123',
        action: 'update',
        timestamp: new Date().toISOString(),
        nested: {
          field: 'value',
        },
      };

      const error = new ValidationError('Error', context);

      expect(error.context).toEqual(context);
    });

    it('should handle undefined context', () => {
      const error = new ValidationError('Error');

      expect(error.context).toBeUndefined();
    });
  });

  describe('Timestamp', () => {
    it('should have recent timestamp', () => {
      const before = new Date();
      const error = new ValidationError('Error');
      const after = new Date();

      expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(error.timestamp.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
