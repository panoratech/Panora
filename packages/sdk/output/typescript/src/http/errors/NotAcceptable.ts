import { BaseHTTPError } from './base';

export default class NotAcceptable extends BaseHTTPError {
  statusCode = 406;

  title = 'Not Acceptable';

  constructor(detail: string = '') {
    super(detail);
  }
}
