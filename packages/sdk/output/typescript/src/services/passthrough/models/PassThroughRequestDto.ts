type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'PUT';

export interface PassThroughRequestDto {
  method: Method;
  path: string;
  data?: Data;
  headers_?: Headers_;
}
interface Data {
  [k: string]: unknown;
}
interface Headers_ {
  [k: string]: unknown;
}
