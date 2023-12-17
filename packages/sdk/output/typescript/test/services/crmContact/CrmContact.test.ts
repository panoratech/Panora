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

  describe('test contactControllerGetContacts', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact?integrationId=sequi&linkedUserId=possimus&remote_data=true')
        .reply(200, { data: {} });
      return sdk.crmContact
        .contactControllerGetContacts('sequi', 'possimus', { remoteData: true })
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact?integrationId=esse&linkedUserId=consequuntur&remote_data=true')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerGetContacts(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact?integrationId=culpa&linkedUserId=hic&remote_data=true')
        .reply(404, { data: {} });
      return expect(
        async () =>
          await sdk.crmContact.contactControllerGetContacts('culpa', 'hic', { remoteData: true }),
      ).rejects.toThrow();
    });
  });

  describe('test contactControllerAddContacts', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .post('/crm/contact?integrationId=eaque&linkedUserId=nesciunt&remote_data=true')
        .reply(200, { data: {} });
      return sdk.crmContact
        .contactControllerAddContacts({}, 'eaque', 'nesciunt', { remoteData: true })
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .post('/crm/contact?integrationId=suscipit&linkedUserId=ipsa&remote_data=true')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerAddContacts(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .post('/crm/contact?integrationId=delectus&linkedUserId=accusamus&remote_data=true')
        .reply(404, { data: {} });
      return expect(
        async () =>
          await sdk.crmContact.contactControllerAddContacts({}, 'delectus', 'accusamus', {
            remoteData: true,
          }),
      ).rejects.toThrow();
    });
  });

  describe('test contactControllerUpdateContact', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .patch('/crm/contact?id=5736120745')
        .reply(200, { data: {} });
      return sdk.crmContact
        .contactControllerUpdateContact('5736120745')
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .patch('/crm/contact?id=9900368907')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerUpdateContact(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .patch('/crm/contact?id=8266024676')
        .reply(404, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerUpdateContact('8266024676'),
      ).rejects.toThrow();
    });
  });

  describe('test contactControllerGetContact', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/5281087660?remote_data=true')
        .reply(200, { data: {} });
      return sdk.crmContact
        .contactControllerGetContact('5281087660', { remoteData: true })
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/8073472005?remote_data=true')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.crmContact.contactControllerGetContact(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .get('/crm/contact/2246703175?remote_data=true')
        .reply(404, { data: {} });
      return expect(
        async () =>
          await sdk.crmContact.contactControllerGetContact('2246703175', { remoteData: true }),
      ).rejects.toThrow();
    });
  });
});
