export interface IHTTPError extends Error {
  statusCode: number;
}

export interface IHTTPErrorDescription extends IHTTPError {
  type?: string;
  title: string;
  detail?: string;
  instance?: string;
}

export function isHTTPError(error: unknown): error is IHTTPError {
  if (!error) {
    return false;
  }
  return Number.isInteger((error as IHTTPError).statusCode);
}

export function isHTTPIssue(error: unknown): error is IHTTPErrorDescription {
  if (!error) {
    return false;
  }
  return (error as IHTTPErrorDescription).title !== undefined && isHTTPError(error);
}

export class BaseHTTPError extends Error implements IHTTPError {
  public type?: string;

  public title: string = 'Internal Server Error';

  public detail?: string;

  public instance?: string;

  public statusCode: number = 500;

  constructor(detail: string = '') {
    super(detail || 'An Unknown HTTP Error Occurred');
    this.detail = detail;
    this.stack = (<any>new Error()).stack;
  }
}

export function isClientError(error: Error): boolean {
  return isHTTPError(error);
}

export function isServerError(e: Error): boolean {
  return isHTTPError(e) && e.statusCode >= 500 && e.statusCode <= 599;
}

export type AuthenticateChallenge = string | string[];
