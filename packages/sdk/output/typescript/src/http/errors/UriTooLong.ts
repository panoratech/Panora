import { BaseHTTPError } from './base';

export default class UriTooLong extends BaseHTTPError {
  statusCode = 414;

  title = 'URI Too Long';

  constructor(detail: string = '') {
    super(detail);
  }
}
