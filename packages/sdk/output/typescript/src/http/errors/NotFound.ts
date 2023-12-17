import { BaseHTTPError } from './base';

export default class NotFound extends BaseHTTPError {
  statusCode = 404;

  title = 'Not Found';

  constructor(detail: string = '') {
    super(detail);
  }
}
