import nock from 'nock';

import { PanoraSDK } from '../../../src';

import { AuthService } from '../../../src/services/auth/Auth';

describe('test AuthService object', () => {
  it('should be an object', () => {
    expect(typeof AuthService).toBe('function');
  });
});

describe('test Auth', () => {
  let sdk: any;

  beforeEach(() => {
    sdk = new PanoraSDK({});

    nock.cleanAll();
  });

  describe('test authControllerRegisterUser', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com').post('/auth/register').reply(200, { data: {} });
      return sdk.auth.authControllerRegisterUser({}).then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test authControllerLogin', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com').post('/auth/login').reply(200, { data: {} });
      return sdk.auth.authControllerLogin({}).then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test authControllerUsers', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com').get('/auth/users').reply(200, { data: {} });
      return sdk.auth.authControllerUsers().then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test authControllerApiKeys', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com').get('/auth/api-keys').reply(200, { data: {} });
      return sdk.auth.authControllerApiKeys().then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test authControllerGenerateApiKey', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .post('/auth/generate-apikey')
        .reply(200, { data: {} });
      return sdk.auth.authControllerGenerateApiKey({}).then((r: any) => expect(r.data).toEqual({}));
    });
  });
});
