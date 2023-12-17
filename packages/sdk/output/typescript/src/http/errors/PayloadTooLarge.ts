import { BaseHTTPError } from './base';

export default class PayloadTooLarge extends BaseHTTPError {
  statusCode = 413;

  title = 'Payload Too Large';

  retryAfter: number | null;

  constructor(detail: string = '', retryAfter: number | null = null) {
    super(detail);
    this.retryAfter = retryAfter;
  }
}
