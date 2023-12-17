import nock from 'nock';

import { Testsdk } from '../../../src';

import { CrmContactService } from '../../../src/services/crmContact/CrmContact';

describe('test CrmContactService object', () => {
  it('should be an object', () => {
    expect(typeof CrmContactService).toBe('function');
  });
});

describe('test CrmContact', () => {
  let sdk: any;

  beforeEach(() => {
    sdk = new Testsdk({});

    nock.cleanAll();
  });

  describe('test contactControllerGetCustomProperties', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/properties?linkedUserId=aliquid&providerId=4231725949')
        .reply(200, { data: {} });
      return sdk.crmContact
        .contactControllerGetCustomProperties('aliquid', '4231725949')
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/properties?linkedUserId=illo&providerId=7134117784')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerGetCustomProperties(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/properties?linkedUserId=neque&providerId=8317378491')
        .reply(404, { data: {} });
      return expect(
        async () =>
          await sdk.crmContact.contactControllerGetCustomProperties('neque', '8317378491'),
      ).rejects.toThrow();
    });
  });

  describe('test contactControllerGetContacts', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact?integrationId=sequi&linkedUserId=optio&remote_data=true')
        .reply(200, { data: {} });
      return sdk.crmContact
        .contactControllerGetContacts('sequi', 'optio', true)
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact?integrationId=eaque&linkedUserId=libero&remote_data=true')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerGetContacts(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact?integrationId=nostrum&linkedUserId=harum&remote_data=true')
        .reply(404, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerGetContacts('nostrum', 'harum', true),
      ).rejects.toThrow();
    });
  });

  describe('test contactControllerAddContacts', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .post('/crm/contact?integrationId=accusamus&linkedUserId=possimus&remote_data=true')
        .reply(200, { data: {} });
      return sdk.crmContact
        .contactControllerAddContacts({}, 'accusamus', 'possimus', true)
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .post('/crm/contact?integrationId=sunt&linkedUserId=nobis&remote_data=true')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerAddContacts(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .post('/crm/contact?integrationId=minima&linkedUserId=eos&remote_data=true')
        .reply(404, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerAddContacts({}, 'minima', 'eos', true),
      ).rejects.toThrow();
    });
  });

  describe('test contactControllerUpdateContact', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .patch('/crm/contact?id=1075761720')
        .reply(200, { data: {} });
      return sdk.crmContact
        .contactControllerUpdateContact('1075761720')
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .patch('/crm/contact?id=7731434860')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerUpdateContact(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .patch('/crm/contact?id=6738263734')
        .reply(404, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerUpdateContact('6738263734'),
      ).rejects.toThrow();
    });
  });

  describe('test contactControllerSyncContacts', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/sync?integrationId=neque&linkedUserId=assumenda&remote_data=true')
        .reply(200, { data: {} });
      return sdk.crmContact
        .contactControllerSyncContacts('neque', 'assumenda', true)
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/sync?integrationId=nisi&linkedUserId=eum&remote_data=true')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerSyncContacts(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/sync?integrationId=dicta&linkedUserId=animi&remote_data=true')
        .reply(404, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerSyncContacts('dicta', 'animi', true),
      ).rejects.toThrow();
    });
  });
});
