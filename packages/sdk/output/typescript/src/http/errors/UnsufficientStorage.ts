import { BaseHTTPError } from './base';

export default class UnsufficientStorage extends BaseHTTPError {
  statusCode = 507;

  title = 'Unsufficient Storage';

  constructor(detail: string = '') {
    super(detail);
  }
}
