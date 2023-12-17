import BaseService from '../../BaseService';

import { CreateUserDto } from './models/CreateUserDto';
import { LoginCredentials } from './models/LoginCredentials';

export class AuthService extends BaseService {
  async authControllerRegisterUser(input: CreateUserDto): Promise<any> {
    const headers: { [key: string]: string } = { 'Content-type': 'application/json' };
    const urlEndpoint = '/auth/register';
    const finalUrl = encodeURI(`${this.baseUrl + urlEndpoint}`);
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

  async authControllerLogin(input: LoginCredentials): Promise<any> {
    const headers: { [key: string]: string } = { 'Content-type': 'application/json' };
    const urlEndpoint = '/auth/login';
    const finalUrl = encodeURI(`${this.baseUrl + urlEndpoint}`);
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

  async authControllerUsers(): Promise<any> {
    const urlEndpoint = '/auth/users';
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

  async authControllerApiKeys(): Promise<any> {
    const urlEndpoint = '/auth/api-keys';
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

  async authControllerGenerateApiKey(input: any): Promise<any> {
    const headers: { [key: string]: string } = { 'Content-type': 'application/json' };
    const urlEndpoint = '/auth/generate-apikey';
    const finalUrl = encodeURI(`${this.baseUrl + urlEndpoint}`);
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
}
