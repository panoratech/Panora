import { BaseHTTPError } from './base';

export default class ExpectationFailed extends BaseHTTPError {
  statusCode = 417;

  title = 'Expectation Failed';

  constructor(detail: string = '') {
    super(detail);
  }
}
