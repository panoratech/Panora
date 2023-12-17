import { BaseHTTPError } from './base';

export default class MisdirectedRequest extends BaseHTTPError {
  statusCode = 421;

  title = 'Misdirected Request';

  constructor(detail: string = '') {
    super(detail);
  }
}
