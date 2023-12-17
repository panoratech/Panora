import { BaseHTTPError } from './base';

export default class RequestHeaderFieldsTooLarge extends BaseHTTPError {
  statusCode = 431;

  title = 'Request Header Fields Too Large';

  constructor(detail: string = '') {
    super(detail);
  }
}
