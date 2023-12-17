import nock from 'nock';

import { Testsdk } from '../../../src';

import { FieldMappingService } from '../../../src/services/fieldMapping/FieldMapping';

describe('test FieldMappingService object', () => {
  it('should be an object', () => {
    expect(typeof FieldMappingService).toBe('function');
  });
});

describe('test FieldMapping', () => {
  let sdk: any;

  beforeEach(() => {
    sdk = new Testsdk({});

    nock.cleanAll();
  });

  describe('test fieldMappingControllerGetEntities', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/field-mapping/entities')
        .reply(200, { data: {} });
      return sdk.fieldMapping
        .fieldMappingControllerGetEntities()
        .then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test fieldMappingControllerGetAttributes', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/field-mapping/attribute')
        .reply(200, { data: {} });
      return sdk.fieldMapping
        .fieldMappingControllerGetAttributes()
        .then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test fieldMappingControllerGetValues', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/field-mapping/value')
        .reply(200, { data: {} });
      return sdk.fieldMapping
        .fieldMappingControllerGetValues()
        .then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test fieldMappingControllerDefineTargetField', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .post('/field-mapping/define')
        .reply(200, { data: {} });
      return sdk.fieldMapping
        .fieldMappingControllerDefineTargetField({})
        .then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test fieldMappingControllerMapFieldToProvider', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .post('/field-mapping/map')
        .reply(200, { data: {} });
      return sdk.fieldMapping
        .fieldMappingControllerMapFieldToProvider({})
        .then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test fieldMappingControllerGetCustomProperties', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .get('/field-mapping/properties?linkedUserId=sapiente&providerId=1519266763')
        .reply(200, { data: {} });
      return sdk.fieldMapping
        .fieldMappingControllerGetCustomProperties('sapiente', '1519266763')
        .then((r: any) => expect(r.data).toEqual({}));
    });

    test('test will throw error if required fields missing', () => {
      const scope = nock('http://api.example.com')
        .get('/field-mapping/properties?linkedUserId=distinctio&providerId=9158364132')
        .reply(200, { data: {} });
      return expect(
        async () => await sdk.fieldMapping.fieldMappingControllerGetCustomProperties(),
      ).rejects.toThrow();
    });

    test('test will throw error on a non-200 response', () => {
      const scope = nock('http://api.example.com')
        .get('/field-mapping/properties?linkedUserId=et&providerId=9578828306')
        .reply(404, { data: {} });
      return expect(
        async () =>
          await sdk.fieldMapping.fieldMappingControllerGetCustomProperties('et', '9578828306'),
      ).rejects.toThrow();
    });
  });
});
