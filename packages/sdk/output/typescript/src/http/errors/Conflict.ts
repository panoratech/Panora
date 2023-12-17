import { BaseHTTPError } from './base';

export default class Conflict extends BaseHTTPError {
  statusCode = 409;

  title = 'Conflict';

  constructor(detail: string = '') {
    super(detail);
  }
}
