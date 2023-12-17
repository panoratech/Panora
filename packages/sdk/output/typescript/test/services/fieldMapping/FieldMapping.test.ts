import nock from 'nock';

import { PanoraSDK } from '../../../src';

import { FieldMappingService } from '../../../src/services/fieldMapping/FieldMapping';

describe('test FieldMappingService object', () => {
  it('should be an object', () => {
    expect(typeof FieldMappingService).toBe('function');
  });
});

describe('test FieldMapping', () => {
  let sdk: any;

  beforeEach(() => {
    sdk = new PanoraSDK({});

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
});
