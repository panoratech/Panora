import axios, { AxiosError } from 'axios';

import HTTPClient, { Headers } from './HTTPClient';
import throwHttpError from './httpExceptions';

export default class HTTPLibrary implements HTTPClient {
  readonly userAgentHeader: Headers = {
    'User-Agent': 'liblab/0.1.28 PanoraSDK/1.0.0 typescript/5.3.2',
  };

  readonly retryAttempts: number = 3;

  readonly retryDelayMs: number = 150;

  private static readonly responseMapper: Map<string, string> = new Map<string, string>([
    ['headers', 'headers_'],
  ]);

  private readonly requestMapper: Map<string, string> = new Map<string, string>([
    ['headers_', 'headers'],
  ]);

  async get(url: string, input: any, headers: Headers, retry: boolean = false): Promise<any> {
    const request = () =>
      axios.get(url, {
        headers: { ...headers, ...this.getUserAgentHeader() },
        data:
          Object.keys(input).length > 0
            ? HTTPLibrary.convertKeysWithMapper(input, this.requestMapper)
            : undefined,
      });

    const response = retry
      ? await this.retry(this.retryAttempts, request, this.retryDelayMs)
      : await request();
    return HTTPLibrary.handleResponse(response);
  }

  async post(url: string, input: any, headers: Headers, retry: boolean = false): Promise<any> {
    const request = () =>
      axios.post(url, HTTPLibrary.convertKeysWithMapper(input, this.requestMapper), {
        headers: { ...headers, ...this.getUserAgentHeader() },
      });

    const response = retry
      ? await this.retry(this.retryAttempts, request, this.retryDelayMs)
      : await request();

    return HTTPLibrary.handleResponse(response);
  }

  async delete(url: string, input: any, headers: Headers, retry: boolean = false): Promise<any> {
    const request = () =>
      axios.delete(url, {
        headers: { ...headers, ...this.getUserAgentHeader() },
        data: HTTPLibrary.convertKeysWithMapper(input, this.requestMapper),
      });

    const response = retry
      ? await this.retry(this.retryAttempts, request, this.retryDelayMs)
      : await request();

    return HTTPLibrary.handleResponse(response);
  }

  async put(url: string, input: any, headers: Headers, retry: boolean = false): Promise<any> {
    const request = () =>
      axios.put(url, HTTPLibrary.convertKeysWithMapper(input, this.requestMapper), {
        headers: { ...headers, ...this.getUserAgentHeader() },
      });

    const response = retry
      ? await this.retry(this.retryAttempts, request, this.retryDelayMs)
      : await request();

    return HTTPLibrary.handleResponse(response);
  }

  async patch(url: string, input: any, headers: Headers, retry: boolean = false): Promise<any> {
    const request = () =>
      axios.patch(url, HTTPLibrary.convertKeysWithMapper(input, this.requestMapper), {
        headers: { ...headers, ...this.getUserAgentHeader() },
      });

    const response = retry
      ? await this.retry(this.retryAttempts, request, this.retryDelayMs)
      : await request();

    return HTTPLibrary.handleResponse(response);
  }

  async retry(retries: number, callbackFn: () => any, delay: number): Promise<any> {
    let result: any;

    try {
      result = await callbackFn();
    } catch (e: any) {
      if ((e as AxiosError).isAxiosError) {
        if (e.response) {
          if (![500, 503, 504].includes(e.response.status)) {
            return e.response;
          }
        }
      }
      if (retries > 1) {
        // eslint-disable-next-line no-promise-executor-return
        await new Promise((resolve) => setTimeout(resolve, delay));
        result = await this.retry(retries - 1, callbackFn, delay * 2);
      } else {
        throw e;
      }
    }

    return result;
  }

  private static handleResponse(response: any) {
    if (response.status >= 400) {
      throwHttpError(response);
    }

    response.data = HTTPLibrary.convertKeysWithMapper(response.data, this.responseMapper);

    return response;
  }

  private getUserAgentHeader(): Headers {
    if (typeof window !== 'undefined') {
      return {};
    }
    return this.userAgentHeader;
  }

  /**
   *Converts keys in an object using a provided JSON mapper.
   * @param {any} obj - The object to convert keys for.
   * @param {Object} jsonMapper - The JSON mapper containing key mappings.
   * @returns {any} - The object with converted keys.
   */
  private static convertKeysWithMapper<T>(obj: T, jsonMapper: Map<string, string>): any {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => HTTPLibrary.convertKeysWithMapper(item, jsonMapper));
    }

    const convertedObj: Record<string, any> = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== undefined) {
        const convertedKey = jsonMapper.get(key) || key;
        convertedObj[convertedKey] = HTTPLibrary.convertKeysWithMapper(value, jsonMapper);
      }
    });

    return convertedObj;
  }
}
