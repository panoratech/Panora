import { HttpException, HttpStatus } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import axios, { AxiosError } from 'axios';
import { Prisma } from '@prisma/client';
import { TargetObject } from './types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

type TypedError<T extends Error = Error> = AxiosError | PrismaClientKnownRequestError | T;

export class ErrorBase<T extends string> extends Error {
  name: T;
  message: string;
  cause: any;

  constructor({
    name, 
    message,
    cause
  }: {
    name: T;
    message: string;
    cause?: any;
  }) {
    super();
    this.name = name;
    this.message = message;
    this.cause = cause;
  }
}

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

export class ProjectError extends ErrorBase<
  "CREATE_PROJECT_ERROR" | 
  "GET_PROJECT_FOR_USER_ERROR" | 
  "GET_PROJECTS_ERROR"
>{}

export class ConnectorSetError extends ErrorBase<
  "CREATE_CONNECTOR_SET_ERROR" | 
  "GET_CONNECTOR_SET_BY_PROJECT_ERROR" |
  "UPDATE_CONNECTOR_SET_ERROR"
>{}
export class LinkedUserError extends ErrorBase<
  "CREATE_LINKED_USER_ERROR" | 
  "CREATE_BATCH_LINKED_USER_ERROR" |
  "GET_LINKED_USER_FROM_REMOTE_ID_ERROR" |
  "GET_LINKED_USERS_ERROR" |
  "GET_LINKED_USER_ERROR" 
>{}

export class ConnectionStrategiesError extends ErrorBase<
  "CREATE_CONNECTION_STRATEGY_ERROR" | 
  "DELETE_CONNECTION_STRATEGY_ERROR" |
  "UPDATE_CONNECTION_STRATEGY_ERROR" |
  "GET_CONNECTION_STRATEGIES_BY_PROJECT_ERROR" |
  "GET_CONNECTION_STRATEGY_STATUS_ERROR" |
  "GET_CREDENTIALS_ERROR" |
  "TOGGLE_CONNECTION_STRATEGY_ERROR" |
  "CONNECTION_STRATEGY_ALREADY_EXISTS" |
  "CUSTOM_CREDENTIALS_ERROR"
>{}

export class EncryptionError extends ErrorBase<
  "ENCRYPT_ERROR" | 
  "DECRYPT_ERROR" 
>{}

export class EventsError extends ErrorBase<
  "GET_EVENTS_ERROR" |
  "GET_EVENTS_COUNT_ERROR"
>{}

export class MagicLinksError extends ErrorBase<
  "CREATE_MAGIC_LINK_ERROR" | 
  "GET_MAGIC_LINKS_ERROR" |
  "GET_MAGIC_LINK_ERROR" 
>{}

export class CustomFieldsError extends ErrorBase<
  "CREATE_DEFINE_FIELD_ERROR" | 
  "CREATE_MAP_FIELD_ERROR" |
  "CREATE_CUSTOM_FIELD_ERROR" |
  "GET_CUSTOM_FIELDS_ERROR" |
  "GET_ENTITIES_ERROR" |
  "GET_ATTRIBUTES_ERROR" |
  "GET_VALUES_ERROR"
>{}

export class ConnectionsError extends ErrorBase<
  "GET_CONNECTIONS_ERROR" |
  "OAUTH_CALLBACK_STATE_NOT_FOUND_ERROR" |
  "OAUTH_CALLBACK_CODE_NOT_FOUND_ERROR" |
  "OAUTH_CALLBACK_ERROR" |
  "HANDLE_OAUTH_CALLBACK_TICKETING" |
  "HANDLE_OAUTH_CALLBACK_CRM" |
  "HANDLE_OAUTH_CALLBACK_MARKETINGAUTOMATION" |
  "HANDLE_OAUTH_CALLBACK_FILESTORAGE" |
  "HANDLE_OAUTH_CALLBACK_ACCOUNTING" |
  "HANDLE_OAUTH_CALLBACK_ATS" |
  "HANDLE_OAUTH_CALLBACK_HRIS" |
  "HANDLE_OAUTH_REFRESH_TICKETING" |
  "HANDLE_OAUTH_REFRESH_CRM" |
  "HANDLE_OAUTH_REFRESH_MARKETINGAUTOMATION" |
  "HANDLE_OAUTH_REFRESH_FILESTORAGE" |
  "HANDLE_OAUTH_REFRESH_ACCOUNTING" |
  "HANDLE_OAUTH_REFRESH_ATS" |
  "HANDLE_OAUTH_REFRESH_HRIS"
>{}

export class ManagedWebhooksError extends ErrorBase<
  "GET_MANAGED_WEBHOOKS_ERROR" |
  "CREATE_MANAGED_WEBHOOK_ERROR" |
  "UPDATE_MANAGED_WEBHOOK_STATUS_ERROR" |
  "CREATE_REMOTE_WEBHOOK_ERROR"
>{}

export class AuthError extends ErrorBase<
  "GET_API_KEYS_ERROR" |
  "GET_USERS_ERROR" |
  "VERIFY_USER_ERROR" |
  "LOGIN_USER_ERROR"|
  "REGISTER_USER_ERROR" |
  "CREATE_USER_ERROR" |
  "DELETE_API_KEY_ERROR" |
  "REFRESH_ACCESS_TOKEN_ERROR" |
  "HASH_API_KEY_ERROR" |
  "GENERATE_API_KEY_ERROR" |
  "VALIDATE_API_KEY_ERROR" |
  "EMAIL_ALREADY_EXISTS_ERROR"
>{}

export class PassthroughRequestError extends ErrorBase<
  "PASSTHROUGH_REMOTE_API_CALL_ERROR"
>{}

export class WebhooksError extends ErrorBase<
  "CREATE_WEBHOOK_ERROR" |
  "DELETE_WEBHOOK_ERROR" |
  "UPDATE_WEBHOOK_STATUS_ERROR" |
  "VERIFY_PAYLOAD_ERROR" |
  "GET_WEBHOOKS_ERROR" |
  "INVALID_SIGNATURE_ERROR" |
  "SIGNATURE_GENERATION_ERROR"
>{}

export class SyncError extends ErrorBase<
  "TICKETING_USER_SYNC_ERROR" |
  "TICKETING_TICKET_SYNC_ERROR" |
  "TICKETING_ACCOUNT_SYNC_ERROR" |
  "TICKETING_CONTACT_SYNC_ERROR" |
  "TICKETING_TEAM_SYNC_ERROR" |
  "TICKETING_TAG_SYNC_ERROR" |
  "TICKETING_COMMENT_SYNC_ERROR" |
  "TICKETING_ATTACHMENT_SYNC_ERROR" |
  "TICKETING_COLLECTION_SYNC_ERROR" |
  "CRM_COMPANY_SYNC_ERROR" |
  "CRM_CONTACT_SYNC_ERROR" |
  "CRM_DEAL_SYNC_ERROR" |
  "CRM_ENGAGEMENT_SYNC_ERROR" |
  "CRM_NOTE_SYNC_ERROR" |
  "CRM_STAGE_SYNC_ERROR" |
  "CRM_TASK_SYNC_ERROR" |
  "CRM_USER_SYNC_ERROR"
>{}

/* */
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

export class ThirdPartyApiCallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThirdPartyApiCallError';
  }
}

export class PrismaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrismaError';
  }
}

export function throwTypedError(
  error: TypedError,
  logger: LoggerService,
) {
  let errorMessage = error.message;
  logger.error('Error message: ', errorMessage);
  throw error;
}

export function format3rdPartyError(
  providerName: string,
  action: TargetObject | Action,
  actionType: ActionType,
){
  switch(actionType) {
    case 'POST':
      return `Failed to create ${action} for ${providerName}`
    case 'GET':
      return `Failed to retrieve ${action} for ${providerName}`
    case 'PUT':
      return `Failed to update ${action} for ${providerName}`
    case 'DELETE':
      return `Failed to delete ${action} for ${providerName}`
  }
}
 

export function handleServiceError(
  error: TypedError,
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
  } 
  
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error('Error with Prisma request:', errorMessage);
    throw new PrismaError(errorMessage);
  } 

  if (error instanceof HttpException) {
    throw error;
  }

  const message =
  action && providerName && actionType
    ? actionType == 'POST'
      ? `Failed to create ${action} for ${providerName} : ${errorMessage}`
      : actionType == 'GET'
      ? `Failed to retrieve ${action} for ${providerName} : ${errorMessage}`
      : actionType == 'PUT'
      ? `Failed to update ${action} for ${providerName} : ${errorMessage}`
      : `Failed to delete ${action} for ${providerName} : ${errorMessage}`
    : errorMessage;

  throw new ThirdPartyApiCallError(
    message
  )
}
