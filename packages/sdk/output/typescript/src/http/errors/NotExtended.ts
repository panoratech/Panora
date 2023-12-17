import { BaseHTTPError } from './base';

export default class NotExtended extends BaseHTTPError {
  statusCode = 510;

  title = 'Not Extended';

  constructor(detail: string = '') {
    super(detail);
  }
}
