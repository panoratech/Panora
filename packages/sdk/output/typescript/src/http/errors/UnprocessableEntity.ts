import { BaseHTTPError } from './base';

export default class UnprocessableEntity extends BaseHTTPError {
  statusCode = 422;

  title = 'Unprocessable Entity';

  constructor(detail: string = '') {
    super(detail);
  }
}
