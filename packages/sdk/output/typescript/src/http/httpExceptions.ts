import {
  BaseHTTPError,
  BadRequest,
  Unauthorized,
  PaymentRequired,
  Forbidden,
  NotFound,
  MethodNotAllowed,
  NotAcceptable,
  ProxyAuthenticationRequired,
  RequestTimeout,
  Conflict,
  Gone,
  LengthRequired,
  PreconditionFailed,
  PayloadTooLarge,
  UriTooLong,
  UnsupportedMediaType,
  RangeNotSatisfiable,
  ExpectationFailed,
  MisdirectedRequest,
  UnprocessableEntity,
  Locked,
  FailedDependency,
  TooEarly,
  UpgradeRequired,
  PreconditionRequired,
  TooManyRequests,
  RequestHeaderFieldsTooLarge,
  UnavailableForLegalReasons,
  InternalServerError,
  NotImplemented,
  BadGateway,
  ServiceUnavailable,
  GatewayTimeout,
  HttpVersionNotSupported,
  VariantAlsoNegotiates,
  UnsufficientStorage,
  LoopDetected,
  NotExtended,
  NetworkAuthenticationRequired,
} from './errors';

interface HttpResponseWithError {
  status: number;
  headers: any;
  data?: any;
}

interface NumberToClass {
  [key: number]: any;
}

const statusCodeToErrorFunction: NumberToClass = {
  400: BadRequest,
  401: Unauthorized,
  402: PaymentRequired,
  403: Forbidden,
  404: NotFound,
  405: MethodNotAllowed,
  406: NotAcceptable,
  407: ProxyAuthenticationRequired,
  408: RequestTimeout,
  409: Conflict,
  410: Gone,
  411: LengthRequired,
  412: PreconditionFailed,
  413: PayloadTooLarge,
  414: UriTooLong,
  415: UnsupportedMediaType,
  416: RangeNotSatisfiable,
  417: ExpectationFailed,
  421: MisdirectedRequest,
  422: UnprocessableEntity,
  423: Locked,
  424: FailedDependency,
  425: TooEarly,
  426: UpgradeRequired,
  428: PreconditionRequired,
  429: TooManyRequests,
  431: RequestHeaderFieldsTooLarge,
  451: UnavailableForLegalReasons,
  500: InternalServerError,
  501: NotImplemented,
  502: BadGateway,
  503: ServiceUnavailable,
  504: GatewayTimeout,
  505: HttpVersionNotSupported,
  506: VariantAlsoNegotiates,
  507: UnsufficientStorage,
  508: LoopDetected,
  510: NotExtended,
  511: NetworkAuthenticationRequired,
};

/**
 * @summary This function will throw an error.
 *
 * @param {HttpResponseWithError} response - the response from a request, must contain a status and data fields
 * @throws {Error} - an http error
 */
export default function throwHttpError(response: HttpResponseWithError): never {
  let error: BaseHTTPError = new BaseHTTPError(response.data);
  switch (response.status) {
    case 401:
      error = new Unauthorized(response.data, response.headers['WWW-Authenticate']);
    case 405:
      // this indicates a bug in the spec if it allows a method that the server rejects
      error = new MethodNotAllowed(response.data, response.headers.allowed);
    case 407:
      error = new ProxyAuthenticationRequired(
        response.data,
        response.headers['Proxy-Authenticate'],
      );
    case 413:
      error = new PayloadTooLarge(response.data, response.headers['Retry-After']);
    case 429:
      error = new TooManyRequests(response.data, response.headers['Retry-After']);
    case 503:
      error = new ServiceUnavailable(response.data, response.headers['Retry-After']);
    default:
      if (response.status in statusCodeToErrorFunction) {
        error = new statusCodeToErrorFunction[response.status](response.data);
      } else {
        const error = new BaseHTTPError(response.data);
        error.statusCode = response.status;
        error.title = 'unknown error';
      }
  }

  throw error;
}
