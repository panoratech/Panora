import nock from 'nock';

import { Testsdk } from '../../../src';

import { ConnectionsService } from '../../../src/services/connections/Connections';

describe('test ConnectionsService object', () => {
  it('should be an object', () => {
    expect(typeof ConnectionsService).toBe('function');
  });
});

describe('test Connections', () => {
  let sdk: any;

  beforeEach(() => {
    sdk = new Testsdk({});

    nock.cleanAll();
  });

  describe('test connectionsControllerHandleCallback', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/connections/oauth/callback?state=omnis&code=accusantium&location=a')
        .reply(200, { data: {} });
      return sdk.connections
        .connectionsControllerHandleCallback('omnis', 'accusantium', 'a')
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .get('/connections/oauth/callback?state=facilis&code=unde&location=fugiat')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.connections.connectionsControllerHandleCallback(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .get('/connections/oauth/callback?state=nemo&code=illum&location=perspiciatis')
        .reply(404, { data: {} });
      return expect(
        async () =>
          await sdk.connections.connectionsControllerHandleCallback(
            'nemo',
            'illum',
            'perspiciatis',
          ),
      ).rejects.toThrow();
    });
  });

  describe('test connectionsControllerGetConnections', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com').get('/connections').reply(200, { data: {} });
      return sdk.connections
        .connectionsControllerGetConnections()
        .then((r: any) => expect(r.data).toEqual({}));
    });
  });
});
