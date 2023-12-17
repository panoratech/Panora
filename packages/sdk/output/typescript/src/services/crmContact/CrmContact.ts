import BaseService from '../../BaseService';

import { serializeQuery } from '../../http/QuerySerializer';

export class CrmContactService extends BaseService {
  async contactControllerGetCustomProperties(
    linkedUserId: string,
    providerId: string,
  ): Promise<any> {
    if (linkedUserId === undefined || providerId === undefined) {
      throw new Error(
        'The following are required parameters: linkedUserId,providerId, cannot be empty or blank',
      );
    }
    const queryParams: string[] = [];
    if (linkedUserId) {
      queryParams.push(serializeQuery('form', true, 'linkedUserId', linkedUserId));
    }
    if (providerId) {
      queryParams.push(serializeQuery('form', true, 'providerId', providerId));
    }
    const urlEndpoint = '/crm/contact/properties';
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

  async contactControllerGetContacts(
    integrationId: string,
    linkedUserId: string,
    remoteData: boolean,
  ): Promise<any> {
    if (integrationId === undefined || linkedUserId === undefined || remoteData === undefined) {
      throw new Error(
        'The following are required parameters: integrationId,linkedUserId,remoteData, cannot be empty or blank',
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

  async contactControllerAddContacts(
    input: any,
    integrationId: string,
    linkedUserId: string,
    remoteData: boolean,
  ): Promise<any> {
    if (integrationId === undefined || linkedUserId === undefined || remoteData === undefined) {
      throw new Error(
        'The following are required parameters: integrationId,linkedUserId,remoteData, cannot be empty or blank',
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

  async contactControllerSyncContacts(
    integrationId: string,
    linkedUserId: string,
    remoteData: boolean,
  ): Promise<any> {
    if (integrationId === undefined || linkedUserId === undefined || remoteData === undefined) {
      throw new Error(
        'The following are required parameters: integrationId,linkedUserId,remoteData, cannot be empty or blank',
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
    const urlEndpoint = '/crm/contact/sync';
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
}
