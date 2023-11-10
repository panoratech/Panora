import { HttpException, HttpStatus } from '@nestjs/common';

// Custom error for general application errors
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}

// Custom error for not found (404) errors
export class NotFoundError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

// Custom error for bad request (400) errors
export class BadRequestError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
    this.name = 'BadRequestError';
  }
}

// Custom error for unauthorized (401) errors
export class UnauthorizedError extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}
