import { BaseHTTPError } from './base';

export default class TooManyRequests extends BaseHTTPError {
  statusCode = 429;

  title = 'Too Many Requests';

  retryAfter: number | null;

  constructor(detail: string = '', retryAfter: number | null = null) {
    super(detail);
    this.retryAfter = retryAfter;
  }
}
