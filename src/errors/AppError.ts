export enum ErrorCode {
  // Validation errors (1000-1999)
  VALIDATION_ERROR = 1000,
  INVALID_EMAIL = 1001,
  INVALID_AGE = 1002,
  INVALID_INPUT = 1003,
  EMPTY_FIELD = 1004,

  // Resource errors (2000-2999)
  NOT_FOUND = 2000,
  USER_NOT_FOUND = 2001,
  RESOURCE_NOT_FOUND = 2002,
  ALREADY_EXISTS = 2003,
  USER_ALREADY_EXISTS = 2004,

  // Authentication/Authorization errors (3000-3999)
  UNAUTHORIZED = 3000,
  FORBIDDEN = 3003,
  INVALID_CREDENTIALS = 3001,
  TOKEN_EXPIRED = 3002,

  // Server errors (4000-4999)
  INTERNAL_ERROR = 4000,
  DATABASE_ERROR = 4001,
  NETWORK_ERROR = 4002,
  TIMEOUT_ERROR = 4003,

  // Business logic errors (5000-5999)
  BUSINESS_RULE_VIOLATION = 5000,
  INSUFFICIENT_PERMISSIONS = 5001,
  OPERATION_NOT_ALLOWED = 5002,
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
    };
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, true, context);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.NOT_FOUND, 404, true, context);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.UNAUTHORIZED, 401, true, context);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.FORBIDDEN, 403, true, context);
  }
}

export class InternalError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.INTERNAL_ERROR, 500, false, context);
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.DATABASE_ERROR, 500, false, context);
  }
}

export class NetworkError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.NETWORK_ERROR, 503, true, context);
  }
}

export class TimeoutError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.TIMEOUT_ERROR, 408, true, context);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.BUSINESS_RULE_VIOLATION, 422, true, context);
  }
}
