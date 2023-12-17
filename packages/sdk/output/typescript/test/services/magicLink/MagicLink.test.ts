import nock from 'nock';

import { Testsdk } from '../../../src';

import { MagicLinkService } from '../../../src/services/magicLink/MagicLink';

describe('test MagicLinkService object', () => {
  it('should be an object', () => {
    expect(typeof MagicLinkService).toBe('function');
  });
});

describe('test MagicLink', () => {
  let sdk: any;

  beforeEach(() => {
    sdk = new Testsdk({});

    nock.cleanAll();
  });

  describe('test magicLinkControllerCreateLink', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .post('/magic-link/create')
        .reply(200, { data: {} });
      return sdk.magicLink
        .magicLinkControllerCreateLink({})
        .then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test magicLinkControllerGetMagicLinks', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com').get('/magic-link').reply(200, { data: {} });
      return sdk.magicLink
        .magicLinkControllerGetMagicLinks()
        .then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test magicLinkControllerGetMagicLink', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/magic-link/single?id=5585664733')
        .reply(200, { data: {} });
      return sdk.magicLink
        .magicLinkControllerGetMagicLink('5585664733')
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .get('/magic-link/single?id=6005345069')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.magicLink.magicLinkControllerGetMagicLink(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .get('/magic-link/single?id=9348347296')
        .reply(404, { data: {} });
      return expect(
        async () => await sdk.magicLink.magicLinkControllerGetMagicLink('9348347296'),
      ).rejects.toThrow();
    });
  });
});
