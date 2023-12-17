import { BaseHTTPError } from './base';

export default class Locked extends BaseHTTPError {
  statusCode = 423;

  title = 'Locked';

  constructor(detail: string = '') {
    super(detail);
  }
}
