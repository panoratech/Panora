import BaseService from '../../BaseService';

import { PassThroughResponse } from './models/PassThroughResponse';
import { PassThroughRequestDto } from './models/PassThroughRequestDto';

import { serializeQuery } from '../../http/QuerySerializer';

export class PassthroughService extends BaseService {
  async passthroughControllerPassthroughRequest(
    input: PassThroughRequestDto,
    integrationId: string,
    linkedUserId: string,
  ): Promise<PassThroughResponse> {
    if (integrationId === undefined || linkedUserId === undefined) {
      throw new Error(
        'The following are required parameters: integrationId,linkedUserId, cannot be empty or blank',
      );
    }
    const queryParams: string[] = [];
    const headers: { [key: string]: string } = { 'Content-type': 'application/json' };
    if (integrationId) {
      queryParams.push(serializeQuery('form', true, 'integrationId', integrationId));
    }
    if (linkedUserId) {
      queryParams.push(serializeQuery('form', true, 'linkedUserId', linkedUserId));
    }
    const urlEndpoint = '/passthrough';
    const finalUrl = encodeURI(`${this.baseUrl + urlEndpoint}?${queryParams.join('&')}`);
    const response: any = await this.httpClient.post(
      finalUrl,
      input,
      {
        ...headers,
        ...this.getAuthorizationHeader(),
      },
      true,
    );
    const responseModel = response.data as PassThroughResponse;
    return responseModel;
  }
}
