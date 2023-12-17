export interface Request {
  method: string;
  url: string;
  input?: object;
  headers: object;
}

export interface Response {
  data: object;
  headers: object;
  status: number;
}

export interface Exception extends Error {
  title: string;
  type?: string;
  detail?: string;
  instance?: string;
  statusCode: number;
}

export interface Hook {
  beforeRequest(request: Request): Promise<void>;

  afterResponse(request: Request, response: Response): Promise<void>;

  onError(error: Exception): Promise<void>;
}
