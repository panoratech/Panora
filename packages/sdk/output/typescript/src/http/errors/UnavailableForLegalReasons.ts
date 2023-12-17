import { BaseHTTPError } from './base';

export default class UnavailableForLegalReasons extends BaseHTTPError {
  statusCode = 451;

  title = 'Unavailable For Legal Reasons';

  constructor(detail: string = '') {
    super(detail);
  }
}
