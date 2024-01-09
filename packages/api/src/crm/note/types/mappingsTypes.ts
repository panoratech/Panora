import { FreshsalesNoteMapper } from '../services/freshsales/mappers';
import { HubspotNoteMapper } from '../services/hubspot/mappers';
import { PipedriveNoteMapper } from '../services/pipedrive/mappers';
import { ZendeskNoteMapper } from '../services/zendesk/mappers';
import { ZohoNoteMapper } from '../services/zoho/mappers';

const hubspotNoteMapper = new HubspotNoteMapper();
const zendeskNoteMapper = new ZendeskNoteMapper();
const zohoNoteMapper = new ZohoNoteMapper();
const pipedriveNoteMapper = new PipedriveNoteMapper();
const freshSalesNoteMapper = new FreshsalesNoteMapper();

export const noteUnificationMapping = {
  hubspot: {
    unify: hubspotNoteMapper.unify,
    desunify: hubspotNoteMapper.desunify,
  },
  pipedrive: {
    unify: pipedriveNoteMapper.unify,
    desunify: pipedriveNoteMapper.desunify,
  },
  zoho: {
    unify: zohoNoteMapper.unify,
    desunify: zohoNoteMapper.desunify,
  },
  zendesk: {
    unify: zendeskNoteMapper.unify,
    desunify: zendeskNoteMapper.desunify,
  },
  freshsales: {
    unify: freshSalesNoteMapper.unify,
    desunify: freshSalesNoteMapper.desunify,
  },
};
