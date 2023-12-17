import { BaseHTTPError } from './base';

export default class ServiceUnavailable extends BaseHTTPError {
  statusCode = 503;

  title = 'Service Unavailable';

  retryAfter: number | null;

  constructor(detail: string = '', retryAfter: number | null = null) {
    super(detail);
    this.retryAfter = retryAfter;
  }
}
