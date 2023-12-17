import { BaseHTTPError } from './base';

export default class FailedDependency extends BaseHTTPError {
  statusCode = 424;

  title = 'Failed Dependency';

  constructor(detail: string = '') {
    super(detail);
  }
}
