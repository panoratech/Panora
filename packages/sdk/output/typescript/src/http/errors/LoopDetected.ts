import { BaseHTTPError } from './base';

export default class LoopDetected extends BaseHTTPError {
  statusCode = 508;

  title = 'Loop Detected';

  constructor(detail: string = '') {
    super(detail);
  }
}
