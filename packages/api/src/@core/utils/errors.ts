import { LoggerService } from '../logger/logger.service';
import { AxiosError } from 'axios';
import { TargetObject } from './types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

type TypedError<T extends Error = Error> =
  | AxiosError
  | PrismaClientKnownRequestError
  | T;

export class ErrorBase<T extends string> extends Error {
  name: T;
  message: string;
  cause: any;

  constructor({
    name,
    message,
    cause,
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
  webhookCreation = 'webhook-creation',
}

export enum ActionType {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export class ProjectError extends ErrorBase<
  'CREATE_PROJECT_ERROR' | 'GET_PROJECT_FOR_USER_ERROR' | 'GET_PROJECTS_ERROR'
> {}

export class ConnectorSetError extends ErrorBase<
  | 'CREATE_CONNECTOR_SET_ERROR'
  | 'GET_CONNECTOR_SET_BY_PROJECT_ERROR'
  | 'UPDATE_CONNECTOR_SET_ERROR'
> {}
export class LinkedUserError extends ErrorBase<
  | 'CREATE_LINKED_USER_ERROR'
  | 'CREATE_BATCH_LINKED_USER_ERROR'
  | 'GET_LINKED_USER_FROM_REMOTE_ID_ERROR'
  | 'GET_LINKED_USERS_ERROR'
  | 'GET_LINKED_USER_ERROR'
> {}

export class ConnectionStrategiesError extends ErrorBase<
  | 'CREATE_CONNECTION_STRATEGY_ERROR'
  | 'DELETE_CONNECTION_STRATEGY_ERROR'
  | 'UPDATE_CONNECTION_STRATEGY_ERROR'
  | 'GET_CONNECTION_STRATEGIES_BY_PROJECT_ERROR'
  | 'GET_CONNECTION_STRATEGY_STATUS_ERROR'
  | 'GET_CREDENTIALS_ERROR'
  | 'TOGGLE_CONNECTION_STRATEGY_ERROR'
  | 'CONNECTION_STRATEGY_ALREADY_EXISTS'
  | 'CUSTOM_CREDENTIALS_ERROR'
> {}

export class EncryptionError extends ErrorBase<
  'ENCRYPT_ERROR' | 'DECRYPT_ERROR'
> {}

export class EventsError extends ErrorBase<
  'GET_EVENTS_ERROR' | 'GET_EVENTS_COUNT_ERROR'
> {}

export class MagicLinksError extends ErrorBase<
  'CREATE_MAGIC_LINK_ERROR' | 'GET_MAGIC_LINKS_ERROR' | 'GET_MAGIC_LINK_ERROR'
> {}

export class CustomFieldsError extends ErrorBase<
  | 'GET_3RD_PARTY_REMOTE_PROPERTIES'
  | 'CREATE_DEFINE_FIELD_ERROR'
  | 'CREATE_MAP_FIELD_ERROR'
  | 'CREATE_CUSTOM_FIELD_ERROR'
  | 'GET_CUSTOM_FIELDS_ERROR'
  | 'GET_ENTITIES_ERROR'
  | 'GET_ATTRIBUTES_ERROR'
  | 'GET_VALUES_ERROR'
> {}

export class ConnectionsError extends ErrorBase<
  | 'GET_CONNECTION_FROM_CONNECTION_TOKEN_ERROR'
  | 'GET_CONNECTIONS_ERROR'
  | 'OAUTH_CALLBACK_STATE_NOT_FOUND_ERROR'
  | 'OAUTH_CALLBACK_CODE_NOT_FOUND_ERROR'
  | 'OAUTH_CALLBACK_ERROR'
  | 'HANDLE_OAUTH_CALLBACK_TICKETING'
  | 'HANDLE_OAUTH_CALLBACK_CRM'
  | 'HANDLE_OAUTH_CALLBACK_MARKETINGAUTOMATION'
  | 'HANDLE_OAUTH_CALLBACK_FILESTORAGE'
  | 'HANDLE_OAUTH_CALLBACK_ACCOUNTING'
  | 'HANDLE_OAUTH_CALLBACK_ATS'
  | 'HANDLE_OAUTH_CALLBACK_HRIS'
  | 'HANDLE_OAUTH_REFRESH_TICKETING'
  | 'HANDLE_OAUTH_REFRESH_CRM'
  | 'HANDLE_OAUTH_REFRESH_MARKETINGAUTOMATION'
  | 'HANDLE_OAUTH_REFRESH_FILESTORAGE'
  | 'HANDLE_OAUTH_REFRESH_ACCOUNTING'
  | 'HANDLE_OAUTH_REFRESH_ATS'
  | 'HANDLE_OAUTH_REFRESH_HRIS'
> {}

export class ManagedWebhooksError extends ErrorBase<
  | 'GET_MANAGED_WEBHOOKS_ERROR'
  | 'CREATE_MANAGED_WEBHOOK_ERROR'
  | 'UPDATE_MANAGED_WEBHOOK_STATUS_ERROR'
  | 'CREATE_REMOTE_WEBHOOK_ERROR'
  | 'SIGNATURE_VERIFICATION_AUTHENTICITY_ERROR'
  | 'RECEIVING_WEBHOOK_PAYLOAD_ERROR'
> {}

export class AuthError extends ErrorBase<
  | 'GET_API_KEYS_ERROR'
  | 'GET_USERS_ERROR'
  | 'VERIFY_USER_ERROR'
  | 'LOGIN_USER_ERROR'
  | 'REGISTER_USER_ERROR'
  | 'CREATE_USER_ERROR'
  | 'DELETE_API_KEY_ERROR'
  | 'REFRESH_ACCESS_TOKEN_ERROR'
  | 'HASH_API_KEY_ERROR'
  | 'GENERATE_API_KEY_ERROR'
  | 'VALIDATE_API_KEY_ERROR'
  | 'EMAIL_ALREADY_EXISTS_ERROR'
> {}

export class PassthroughRequestError extends ErrorBase<'PASSTHROUGH_REMOTE_API_CALL_ERROR'> {}

export class WebhooksError extends ErrorBase<
  | 'CREATE_WEBHOOK_ERROR'
  | 'DELETE_WEBHOOK_ERROR'
  | 'UPDATE_WEBHOOK_STATUS_ERROR'
  | 'VERIFY_PAYLOAD_ERROR'
  | 'GET_WEBHOOKS_ERROR'
  | 'INVALID_SIGNATURE_ERROR'
  | 'SIGNATURE_GENERATION_ERROR'
  | 'DELIVERING_WEBHOOK_ERROR'
  | 'DELIVERING_FAILED_WEBHOOK_ERROR'
  | 'DELIVERING_PRIORITY_WEBHOOK_ERROR'
> {}

export class SyncError extends ErrorBase<
  | 'TICKETING_USER_SYNC_ERROR'
  | 'TICKETING_TICKET_SYNC_ERROR'
  | 'TICKETING_ACCOUNT_SYNC_ERROR'
  | 'TICKETING_CONTACT_SYNC_ERROR'
  | 'TICKETING_TEAM_SYNC_ERROR'
  | 'TICKETING_TAG_SYNC_ERROR'
  | 'TICKETING_COMMENT_SYNC_ERROR'
  | 'TICKETING_ATTACHMENT_SYNC_ERROR'
  | 'TICKETING_COLLECTION_SYNC_ERROR'
  | 'CRM_COMPANY_SYNC_ERROR'
  | 'CRM_CONTACT_SYNC_ERROR'
  | 'CRM_DEAL_SYNC_ERROR'
  | 'CRM_ENGAGEMENT_SYNC_ERROR'
  | 'CRM_NOTE_SYNC_ERROR'
  | 'CRM_STAGE_SYNC_ERROR'
  | 'CRM_TASK_SYNC_ERROR'
  | 'CRM_USER_SYNC_ERROR'
> {}

export class CoreSyncError extends ErrorBase<
  | 'INITIAL_SYNC_ERROR'
  | 'GET_SYNC_STATUS_ERROR'
  | 'RESYNC_ERROR'
  | 'CRM_INITIAL_SYNC_ERROR'
  | 'TICKETING_INITIAL_SYNC_ERROR'
  | 'MARKETINGAUTOMATION_INITIAL_SYNC_ERROR'
  | 'FILESTORAGE_INITIAL_SYNC_ERROR'
  | 'ACCOUNTING_INITIAL_SYNC_ERROR'
  | 'HRIS_INITIAL_SYNC_ERROR'
  | 'ATS_INITIAL_SYNC_ERROR'
  | 'MARKETINGAUTOMATION_INITIAL_SYNC_ERROR'
> {}

export class UnifiedTicketingError extends ErrorBase<
  | 'GET_USER_ERROR'
  | 'GET_USERS_ERROR'
  | 'GET_TICKET_ERROR'
  | 'GET_TICKETS_ERROR'
  | 'CREATE_TICKET_ERROR'
  | 'CREATE_TICKETS_ERROR'
  | 'GET_TEAM_ERROR'
  | 'GET_TEAMS_ERROR'
  | 'GET_TAG_ERROR'
  | 'GET_TAGS_ERROR'
  | 'GET_CONTACT_ERROR'
  | 'GET_CONTACTS_ERROR'
  | 'GET_ACCOUNTS_ERROR'
  | 'GET_ACCOUNT_ERROR'
  | 'GET_COMMENT_ERROR'
  | 'GET_COMMENTS_ERROR'
  | 'CREATE_COMMENTS_ERROR'
  | 'CREATE_COMMENT_ERROR'
  | 'GET_ATTACHMENTS_ERROR'
  | 'GET_ATTACHMENT_ERROR'
  | 'CREATE_ATTACHMENTS_ERROR'
  | 'CREATE_ATTACHMENT_ERROR'
  | 'GET_COLLECTION_ERROR'
  | 'GET_COLLECTIONS_ERROR'
> {}

export class UnifiedCrmError extends ErrorBase<
  | 'GET_COMPANY_ERROR'
  | 'GET_COMPANIES_ERROR'
  | 'CREATE_COMPANY_ERROR'
  | 'CREATE_COMPANIES_ERROR'
  | 'GET_CONTACTS_ERROR'
  | 'GET_CONTACT_ERROR'
  | 'CREATE_CONTACT_ERROR'
  | 'CREATE_CONTACTS_ERROR'
  | 'GET_DEAL_ERROR'
  | 'GET_DEALS_ERROR'
  | 'CREATE_DEAL_ERROR'
  | 'CREATE_DEALS_ERROR'
  | 'GET_ENGAGEMENT_ERROR'
  | 'GET_ENGAGEMENTS_ERROR'
  | 'CREATE_ENGAGEMENTS_ERROR'
  | 'CREATE_ENGAGEMENT_ERROR'
  | 'GET_NOTES_ERROR'
  | 'GET_NOTE_ERROR'
  | 'CREATE_NOTES_ERROR'
  | 'CREATE_NOTE_ERROR'
  | 'GET_STAGE_ERROR'
  | 'GET_STAGES_ERROR'
  | 'GET_TASKS_ERROR'
  | 'GET_TASK_ERROR'
  | 'CREATE_TASKS_ERROR'
  | 'CREATE_TASK_ERROR'
  | 'GET_USERS_ERROR'
  | 'GET_USER_ERROR'
> {}

export class ThirdPartyApiServiceError extends Error {
  cause: any;
  constructor(message: string, cause?: any) {
    super(message);
    this.name = 'ThirdPartyApiServiceError';
    this.cause = cause;
  }
}

export function throwTypedError(error: TypedError, logger?: LoggerService) {
  const errorMessage = error.message;
  if (logger) {
    logger.error('Error message: ', errorMessage);
  }
  throw error;
}

export function format3rdPartyError(
  providerName: string,
  action: TargetObject | Action,
  actionType: ActionType,
) {
  switch (actionType) {
    case 'POST':
      return `Failed to create ${action} for ${providerName}`;
    case 'GET':
      return `Failed to retrieve ${action} for ${providerName}`;
    case 'PUT':
      return `Failed to update ${action} for ${providerName}`;
    case 'DELETE':
      return `Failed to delete ${action} for ${providerName}`;
  }
}

export function handle3rdPartyServiceError(
  error: any,
  logger: LoggerService,
  providerName: string,
  action: TargetObject | Action,
  actionType: ActionType,
) {
  throwTypedError(
    new ThirdPartyApiServiceError(
      format3rdPartyError(providerName, action, actionType),
      error,
    ),
    logger,
  );
}
