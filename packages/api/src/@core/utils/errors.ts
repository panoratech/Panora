import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import axios, { AxiosError } from 'axios';
import { Prisma } from '@prisma/client';
import { TargetObject } from './unification/types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

type ServiceError = AxiosError | PrismaClientKnownRequestError | Error;

export function handleServiceError(
  error: ServiceError,
  logger: LoggerService,
  providerName: string,
  action: TargetObject,
) {
  let statusCode = 500; // Default to internal server error
  let errorMessage = error.message;

  if (axios.isAxiosError(error)) {
    statusCode = error.response?.status || 500; // Use HTTP status code from Axios error or default to 500
    errorMessage = error.response?.data || error.message;
    logger.error('Error with Axios request:', errorMessage);
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle Prisma errors
    logger.error('Error with Prisma request:', errorMessage);
  } else {
    logger.error('An unknown error occurred...', errorMessage);
  }

  return {
    data: null,
    error: errorMessage,
    message: `Failed to create ${action} for ${providerName}.`,
    statusCode: statusCode,
  };
}
