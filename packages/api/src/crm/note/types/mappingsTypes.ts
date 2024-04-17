import { HubspotNoteMapper } from '../services/hubspot/mappers';
import { PipedriveNoteMapper } from '../services/pipedrive/mappers';
import { ZendeskNoteMapper } from '../services/zendesk/mappers';
import { ZohoNoteMapper } from '../services/zoho/mappers';

const hubspotNoteMapper = new HubspotNoteMapper();
const zendeskNoteMapper = new ZendeskNoteMapper();
const zohoNoteMapper = new ZohoNoteMapper();
const pipedriveNoteMapper = new PipedriveNoteMapper();

export const noteUnificationMapping = {
  hubspot: {
    unify: hubspotNoteMapper.unify.bind(hubspotNoteMapper),
    desunify: hubspotNoteMapper.desunify.bind(hubspotNoteMapper),
  },
  pipedrive: {
    unify: pipedriveNoteMapper.unify.bind(pipedriveNoteMapper),
    desunify: pipedriveNoteMapper.desunify.bind(pipedriveNoteMapper),
  },
  zoho: {
    unify: zohoNoteMapper.unify.bind(zohoNoteMapper),
    desunify: zohoNoteMapper.desunify.bind(zohoNoteMapper),
  },
  zendesk: {
    unify: zendeskNoteMapper.unify.bind(zendeskNoteMapper),
    desunify: zendeskNoteMapper.desunify.bind(zendeskNoteMapper),
  },
};
