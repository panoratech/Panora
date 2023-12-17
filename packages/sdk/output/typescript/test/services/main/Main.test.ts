import nock from 'nock';

import { Testsdk } from '../../../src';

import { MainService } from '../../../src/services/main/Main';

describe('test MainService object', () => {
  it('should be an object', () => {
    expect(typeof MainService).toBe('function');
  });
});

describe('test Main', () => {
  let sdk: any;

  beforeEach(() => {
    sdk = new Testsdk({});

    nock.cleanAll();
  });

  describe('test appControllerGetHello', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com').get('/').reply(200, { data: {} });
      return sdk.main.appControllerGetHello().then((r: any) => expect(r.data).toEqual({}));
    });
  });
});
