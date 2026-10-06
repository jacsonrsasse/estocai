import { HttpStatus } from '@nestjs/common';

interface ApplicationExceptionJSON {
  message: string;
  code: string;
  statusCode: HttpStatus;
  metadata?: unknown;
  stack?: string;
}

export class ApplicationException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
    public readonly metadata?: unknown,
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ApplicationExceptionJSON {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      metadata: this.metadata,
      stack: this.stack,
    };
  }
}
