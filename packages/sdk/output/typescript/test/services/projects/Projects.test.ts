import nock from 'nock';

import { Testsdk } from '../../../src';

import { ProjectsService } from '../../../src/services/projects/Projects';

describe('test ProjectsService object', () => {
  it('should be an object', () => {
    expect(typeof ProjectsService).toBe('function');
  });
});

describe('test Projects', () => {
  let sdk: any;

  beforeEach(() => {
    sdk = new Testsdk({});

    nock.cleanAll();
  });

  describe('test projectsControllerGetProjects', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com').get('/projects').reply(200, { data: {} });
      return sdk.projects
        .projectsControllerGetProjects()
        .then((r: any) => expect(r.data).toEqual({}));
    });
  });

  describe('test projectsControllerCreateProject', () => {
    test('test api call', () => {
      const scope = nock('http://api.example.com')
        .post('/projects/create')
        .reply(200, { data: {} });
      return sdk.projects
        .projectsControllerCreateProject({})
        .then((r: any) => expect(r.data).toEqual({}));
    });
  });
});
