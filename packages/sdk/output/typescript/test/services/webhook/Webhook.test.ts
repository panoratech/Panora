import nock from 'nock';

import { Testsdk } from '../../../src';

import { WebhookService } from '../../../src/services/webhook/Webhook';

describe('test WebhookService object', () => {
  it('should be an object', () => {
    expect(typeof WebhookService).toBe('function');
  });
});

describe('test Webhook', () => {
  let sdk: any;

  beforeEach(() => {
    sdk = new Testsdk({});

    nock.cleanAll();
  });

  describe('test webhookControllerGetWebhooks', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com').get('/webhook').reply(200, { data: {} });
      return sdk.webhook
        .webhookControllerGetWebhooks()
        .then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test webhookControllerAddWebhook', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com').post('/webhook').reply(200, { data: {} });
      return sdk.webhook
        .webhookControllerAddWebhook({})
        .then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test webhookControllerUpdateWebhookStatus', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .put('/webhook/2578090855')
        .reply(200, { data: {} });
      return sdk.webhook
        .webhookControllerUpdateWebhookStatus('2578090855')
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .put('/webhook/9823959652')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.webhook.webhookControllerUpdateWebhookStatus(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .put('/webhook/8383133423')
        .reply(404, { data: {} });
      return expect(
        async () => await sdk.webhook.webhookControllerUpdateWebhookStatus('8383133423'),
      ).rejects.toThrow();
    });
  });
});
