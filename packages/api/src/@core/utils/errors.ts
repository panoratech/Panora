import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import axios, { AxiosError } from 'axios';
import { Prisma } from '@prisma/client';
import { TargetObject } from './types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

type ServiceError = AxiosError | PrismaClientKnownRequestError | Error;

export enum Action {
  oauthCallback = 'oauth-callback',
  oauthRefresh = 'oauth-refresh',
}

export enum ActionType {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

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

// Custom error for duplicate element inside Prisma DB errors
export class NotUniqueRecord extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotUniqueRecord';
  }
}

export function handleServiceError(
  error: ServiceError,
  logger: LoggerService,
  providerName?: string,
  action?: TargetObject | Action,
  actionType?: ActionType,
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
    message:
      action && providerName && actionType
        ? actionType == 'POST'
          ? `Failed to create ${action} for ${providerName}.`
          : actionType == 'GET'
          ? `Failed to retrieve ${action} for ${providerName}.`
          : actionType == 'PUT'
          ? `Failed to update ${action} for ${providerName}.`
          : `Failed to delete ${action} for ${providerName}.`
        : errorMessage,
    statusCode: statusCode,
  };
}
