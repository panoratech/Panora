import { BaseHTTPError } from './base';

export default class NotImplemented extends BaseHTTPError {
  statusCode = 501;

  title = 'Not Implemented';

  constructor(detail: string = '') {
    super(detail);
  }
}
