import { BaseHTTPError } from './base';

export default class HttpVersionNotSupported extends BaseHTTPError {
  statusCode = 505;

  title = 'HTTP Version Not Supported';

  constructor(detail: string = '') {
    super(detail);
  }
}
