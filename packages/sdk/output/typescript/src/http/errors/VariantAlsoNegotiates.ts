import { BaseHTTPError } from './base';

export default class VariantAlsoNegotiates extends BaseHTTPError {
  statusCode = 506;

  title = 'Variant Also Negotiates';

  constructor(detail: string = '') {
    super(detail);
  }
}
