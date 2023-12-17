import nock from 'nock';

import { Testsdk } from '../../../src';

import { OrganisationsService } from '../../../src/services/organisations/Organisations';

describe('test OrganisationsService object', () => {
  it('should be an object', () => {
    expect(typeof OrganisationsService).toBe('function');
  });
});

describe('test Organisations', () => {
  let sdk: any;

  beforeEach(() => {
    sdk = new Testsdk({});

    nock.cleanAll();
  });

  describe('test organisationsControllerGetOragnisations', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com').get('/organisations').reply(200, { data: {} });
      return sdk.organisations
        .organisationsControllerGetOragnisations()
        .then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test organisationsControllerCreateOrg', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .post('/organisations/create')
        .reply(200, { data: {} });
      return sdk.organisations
        .organisationsControllerCreateOrg({})
        .then((r: any) => expect(r.data).toEqual({}));
    });
  });
});
