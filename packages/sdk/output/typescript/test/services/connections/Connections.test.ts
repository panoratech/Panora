import nock from 'nock';

import { PanoraSDK } from '../../../src';

import { ConnectionsService } from '../../../src/services/connections/Connections';

describe('test ConnectionsService object', () => {
  it('should be an object', () => {
    expect(typeof ConnectionsService).toBe('function');
  });
});

describe('test Connections', () => {
  let sdk: any;

  beforeEach(() => {
    sdk = new PanoraSDK({});

    nock.cleanAll();
  });

  describe('test connectionsControllerHandleCallback', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/connections/oauth/callback?state=quaerat&code=iure&location=optio')
        .reply(200, { data: {} });
      return sdk.connections
        .connectionsControllerHandleCallback('quaerat', 'iure', 'optio')
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .get('/connections/oauth/callback?state=quia&code=inventore&location=eos')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.connections.connectionsControllerHandleCallback(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .get('/connections/oauth/callback?state=repudiandae&code=ducimus&location=illo')
        .reply(404, { data: {} });
      return expect(
        async () =>
          await sdk.connections.connectionsControllerHandleCallback(
            'repudiandae',
            'ducimus',
            'illo',
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
