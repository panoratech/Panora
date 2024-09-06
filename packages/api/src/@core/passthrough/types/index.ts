type BaseResponse = {
  status: number;
  statusText: string;
  headers: any;
  data: any;
};

export type PassthroughResponse =
  | BaseResponse
  | { statusCode: number; retryId: string };
