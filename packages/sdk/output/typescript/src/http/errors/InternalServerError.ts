import { BaseHTTPError } from './base';

export default class InternalServerError extends BaseHTTPError {
  statusCode = 500;

  title = 'Internal Server Error';

  constructor(detail: string = '') {
    super(detail);
  }
}
