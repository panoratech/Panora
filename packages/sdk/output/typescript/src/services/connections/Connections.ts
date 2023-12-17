import BaseService from '../../BaseService';

import { serializeQuery } from '../../http/QuerySerializer';

export class ConnectionsService extends BaseService {
  async connectionsControllerHandleCallback(
    state: string,
    code: string,
    location: string,
  ): Promise<any> {
    if (state === undefined || code === undefined || location === undefined) {
      throw new Error(
        'The following are required parameters: state,code,location, cannot be empty or blank',
      );
    }
    const queryParams: string[] = [];
    if (state) {
      queryParams.push(serializeQuery('form', true, 'state', state));
    }
    if (code) {
      queryParams.push(serializeQuery('form', true, 'code', code));
    }
    if (location) {
      queryParams.push(serializeQuery('form', true, 'location', location));
    }
    const urlEndpoint = '/connections/oauth/callback';
    const finalUrl = encodeURI(`${this.baseUrl + urlEndpoint}?${queryParams.join('&')}`);
    const response: any = await this.httpClient.get(
      finalUrl,
      {},
      {
        ...this.getAuthorizationHeader(),
      },
      true,
    );
    const responseModel = response.data;
    return responseModel;
  }

  async connectionsControllerGetConnections(): Promise<any> {
    const urlEndpoint = '/connections';
    const finalUrl = encodeURI(`${this.baseUrl + urlEndpoint}`);
    const response: any = await this.httpClient.get(
      finalUrl,
      {},
      {
        ...this.getAuthorizationHeader(),
      },
      true,
    );
    const responseModel = response.data;
    return responseModel;
  }
}
