import { BaseHTTPError } from './base';

export default class TooEarly extends BaseHTTPError {
  statusCode = 425;

  title = 'Too Early';

  constructor(detail: string = '') {
    super(detail);
  }
}
