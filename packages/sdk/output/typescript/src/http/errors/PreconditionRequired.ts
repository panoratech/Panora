import { BaseHTTPError } from './base';

export default class PreconditionRequired extends BaseHTTPError {
  statusCode = 428;

  title = 'Precondition Required';

  constructor(detail: string = '') {
    super(detail);
  }
}
