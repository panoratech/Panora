import nock from 'nock';

import { PanoraSDK } from '../../../src';

import { CrmContactService } from '../../../src/services/crmContact/CrmContact';

describe('test CrmContactService object', () => {
  it('should be an object', () => {
    expect(typeof CrmContactService).toBe('function');
  });
});

describe('test CrmContact', () => {
  let sdk: any;

  beforeEach(() => {
    sdk = new PanoraSDK({});

    nock.cleanAll();
  });

  describe('test contactControllerGetCustomProperties', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/properties?linkedUserId=provident&providerId=7519604779')
        .reply(200, { data: {} });
      return sdk.crmContact
        .contactControllerGetCustomProperties('provident', '7519604779')
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/properties?linkedUserId=et&providerId=3455852347')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerGetCustomProperties(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/properties?linkedUserId=excepturi&providerId=6794351074')
        .reply(404, { data: {} });
      return expect(
        async () =>
          await sdk.crmContact.contactControllerGetCustomProperties('excepturi', '6794351074'),
      ).rejects.toThrow();
    });
  });

  describe('test contactControllerGetContacts', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact?integrationId=voluptatum&linkedUserId=nihil&remote_data=true')
        .reply(200, { data: {} });
      return sdk.crmContact
        .contactControllerGetContacts('voluptatum', 'nihil', true)
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact?integrationId=possimus&linkedUserId=facilis&remote_data=true')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerGetContacts(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact?integrationId=fugit&linkedUserId=facere&remote_data=true')
        .reply(404, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerGetContacts('fugit', 'facere', true),
      ).rejects.toThrow();
    });
  });

  describe('test contactControllerAddContacts', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .post('/crm/contact?integrationId=vitae&linkedUserId=et&remote_data=true')
        .reply(200, { data: {} });
      return sdk.crmContact
        .contactControllerAddContacts({}, 'vitae', 'et', true)
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .post('/crm/contact?integrationId=nihil&linkedUserId=rerum&remote_data=true')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerAddContacts(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .post('/crm/contact?integrationId=laboriosam&linkedUserId=maiores&remote_data=true')
        .reply(404, { data: {} });
      return expect(
        async () =>
          await sdk.crmContact.contactControllerAddContacts({}, 'laboriosam', 'maiores', true),
      ).rejects.toThrow();
    });
  });

  describe('test contactControllerUpdateContact', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .patch('/crm/contact?id=8366315562')
        .reply(200, { data: {} });
      return sdk.crmContact
        .contactControllerUpdateContact('8366315562')
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .patch('/crm/contact?id=9485117236')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerUpdateContact(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .patch('/crm/contact?id=2096113866')
        .reply(404, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerUpdateContact('2096113866'),
      ).rejects.toThrow();
    });
  });

  describe('test contactControllerSyncContacts', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/sync?integrationId=soluta&linkedUserId=dolorum&remote_data=true')
        .reply(200, { data: {} });
      return sdk.crmContact
        .contactControllerSyncContacts('soluta', 'dolorum', true)
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/sync?integrationId=laborum&linkedUserId=amet&remote_data=true')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerSyncContacts(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/sync?integrationId=rem&linkedUserId=repellat&remote_data=true')
        .reply(404, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerSyncContacts('rem', 'repellat', true),
      ).rejects.toThrow();
    });
  });
});
