import { BaseHTTPError } from './base';

export default class BadGateway extends BaseHTTPError {
  statusCode = 502;

  title = 'Bad Gateway';

  constructor(detail: string = '') {
    super(detail);
  }
}
