import nock from 'nock';

import { Testsdk } from '../../../src';

import { EventsService } from '../../../src/services/events/Events';

describe('test EventsService object', () => {
  it('should be an object', () => {
    expect(typeof EventsService).toBe('function');
  });
});

describe('test Events', () => {
  let sdk: any;

  beforeEach(() => {
    sdk = new Testsdk({});

    nock.cleanAll();
  });

  describe('test eventsControllerGetEvents', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com').get('/events').reply(200, { data: {} });
      return sdk.events.eventsControllerGetEvents().then((r: any) => expect(r.data).toEqual({}));
    });
  });
});
