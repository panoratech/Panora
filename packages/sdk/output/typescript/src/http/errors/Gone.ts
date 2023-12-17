import { BaseHTTPError } from './base';

export default class Gone extends BaseHTTPError {
  statusCode = 410;

  title = 'Gone';

  constructor(detail: string = '') {
    super(detail);
  }
}
