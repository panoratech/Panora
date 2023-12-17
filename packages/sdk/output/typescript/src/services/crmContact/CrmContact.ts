import BaseService from '../../BaseService';

import { ContactControllerAddContactsRequest } from './models/ContactControllerAddContactsRequest';

import { serializeQuery, serializePath } from '../../http/QuerySerializer';

export class CrmContactService extends BaseService {
  async contactControllerGetContacts(
    integrationId: string,
    linkedUserId: string,
    optionalParams: { remoteData?: boolean } = {},
  ): Promise<any> {
    const { remoteData } = optionalParams;
    if (integrationId === undefined || linkedUserId === undefined) {
      throw new Error(
        'The following are required parameters: integrationId,linkedUserId, cannot be empty or blank',
      );
    }
    const queryParams: string[] = [];
    if (integrationId) {
      queryParams.push(serializeQuery('form', true, 'integrationId', integrationId));
    }
    if (linkedUserId) {
      queryParams.push(serializeQuery('form', true, 'linkedUserId', linkedUserId));
    }
    if (remoteData) {
      queryParams.push(serializeQuery('form', true, 'remote_data', remoteData));
    }
    const urlEndpoint = '/crm/contact';
    const urlParams = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const finalUrl = encodeURI(`${this.baseUrl + urlEndpoint}${urlParams}`);
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

  async contactControllerAddContacts(
    input: ContactControllerAddContactsRequest,
    integrationId: string,
    linkedUserId: string,
    optionalParams: { remoteData?: boolean } = {},
  ): Promise<any> {
    const { remoteData } = optionalParams;
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
    if (remoteData) {
      queryParams.push(serializeQuery('form', true, 'remote_data', remoteData));
    }
    const urlEndpoint = '/crm/contact';
    const urlParams = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const finalUrl = encodeURI(`${this.baseUrl + urlEndpoint}${urlParams}`);
    const response: any = await this.httpClient.post(
      finalUrl,
      input,
      {
        ...headers,
        ...this.getAuthorizationHeader(),
      },
      true,
    );
    const responseModel = response.data;
    return responseModel;
  }

  async contactControllerUpdateContact(id: string): Promise<any> {
    if (id === undefined) {
      throw new Error('The following parameter is required: id, cannot be empty or blank');
    }
    const queryParams: string[] = [];
    if (id) {
      queryParams.push(serializeQuery('form', true, 'id', id));
    }
    const urlEndpoint = '/crm/contact';
    const finalUrl = encodeURI(`${this.baseUrl + urlEndpoint}?${queryParams.join('&')}`);
    const response: any = await this.httpClient.patch(
      finalUrl,
      { id },
      {
        ...this.getAuthorizationHeader(),
      },
      true,
    );
    const responseModel = response.data;
    return responseModel;
  }

  async contactControllerGetContact(
    id: string,
    optionalParams: { remoteData?: boolean } = {},
  ): Promise<any> {
    const { remoteData } = optionalParams;
    if (id === undefined) {
      throw new Error('The following parameter is required: id, cannot be empty or blank');
    }
    const queryParams: string[] = [];
    let urlEndpoint = '/crm/contact/{id}';
    urlEndpoint = urlEndpoint.replace('{id}', serializePath('simple', false, id, undefined));
    if (remoteData) {
      queryParams.push(serializeQuery('form', true, 'remote_data', remoteData));
    }
    const urlParams = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    const finalUrl = encodeURI(`${this.baseUrl + urlEndpoint}${urlParams}`);
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
