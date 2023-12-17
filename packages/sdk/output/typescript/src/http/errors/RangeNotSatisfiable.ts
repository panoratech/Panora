import { BaseHTTPError } from './base';

export default class RangeNotSatisfiable extends BaseHTTPError {
  statusCode = 416;

  title = 'Range Not Satisfiable';

  constructor(detail: string = '') {
    super(detail);
  }
}
