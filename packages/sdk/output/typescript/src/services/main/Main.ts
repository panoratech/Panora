import BaseService from '../../BaseService';

export class MainService extends BaseService {
  async appControllerGetHello(): Promise<any> {
    const urlEndpoint = '/';
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
