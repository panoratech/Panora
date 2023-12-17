export interface Headers extends Record<string, string> {}

/**
 * Defines the basic operations for an HTTP client.
 */
export default interface HTTPClient {
  get(url: string, input: any, headers: Headers, retry?: boolean): Promise<any>;
  post(url: string, input: any, headers: Headers, retry?: boolean): Promise<any>;
  delete(url: string, input: any, headers: Headers, retry?: boolean): Promise<any>;
  put(url: string, input: any, headers: Headers, retry?: boolean): Promise<any>;
  patch(url: string, input: any, headers: Headers, retry?: boolean): Promise<any>;
}
