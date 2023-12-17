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
        .get('/connections/oauth/callback?state=repellat&code=et&location=optio')
        .reply(200, { data: {} });
      return sdk.connections
        .connectionsControllerHandleCallback('repellat', 'et', 'optio')
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .get('/connections/oauth/callback?state=aperiam&code=in&location=amet')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.connections.connectionsControllerHandleCallback(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .get('/connections/oauth/callback?state=aliquam&code=doloribus&location=distinctio')
        .reply(404, { data: {} });
      return expect(
        async () =>
          await sdk.connections.connectionsControllerHandleCallback(
            'aliquam',
            'doloribus',
            'distinctio',
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
