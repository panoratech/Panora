import { AxiosResponse } from 'axios';

export type PassthroughResponse =
  | AxiosResponse
  | { statusCode: number; retryId: string };
