export * from './../services/freshsales/types';
export * from './../services/hubspot/types';
export * from './../services/zoho/types';
export * from './../services/zendesk/types';
export * from './../services/pipedrive/types';

export class ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  statusCode: number;
}
