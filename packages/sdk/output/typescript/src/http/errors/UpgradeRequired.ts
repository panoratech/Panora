import { BaseHTTPError } from './base';

export default class UpgradeRequired extends BaseHTTPError {
  statusCode = 426;

  title = 'Upgrade Required';

  constructor(detail: string = '') {
    super(detail);
  }
}
