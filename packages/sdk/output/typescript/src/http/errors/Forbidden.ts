import { BaseHTTPError } from './base';

export default class Forbidden extends BaseHTTPError {
  statusCode = 403;

  title = 'Forbidden';

  constructor(detail: string = '') {
    super(detail);
  }
}
