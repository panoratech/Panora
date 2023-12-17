import { AuthenticateChallenge, BaseHTTPError } from './base';

export default class Unauthorized extends BaseHTTPError {
  statusCode = 401;

  title = 'Unauthorized';

  wwwAuthenticate?: AuthenticateChallenge;

  constructor(detail: string = '', wwwAuthenticate?: AuthenticateChallenge) {
    super(detail);
    this.wwwAuthenticate = wwwAuthenticate;
  }
}
