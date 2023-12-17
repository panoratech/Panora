import { AuthenticateChallenge, BaseHTTPError } from './base';

export default class ProxyAuthenticationRequired extends BaseHTTPError {
  statusCode = 407;

  title = 'Proxy Authentication Required';

  proxyAuthenticate?: AuthenticateChallenge;

  constructor(detail: string = '', proxyAuthenticate?: AuthenticateChallenge) {
    super(detail);
    this.proxyAuthenticate = proxyAuthenticate;
  }
}
