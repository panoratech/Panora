import { AttioContactMapper } from '../services/attio/mappers';
import { FreshsalesContactMapper } from '../services/freshsales/mappers';
import { HubspotContactMapper } from '../services/hubspot/mappers';
import { PipedriveContactMapper } from '../services/pipedrive/mappers';
import { ZendeskContactMapper } from '../services/zendesk/mappers';
import { ZohoContactMapper } from '../services/zoho/mappers';

const hubspotContactMapper = new HubspotContactMapper();
const zendeskContactMapper = new ZendeskContactMapper();
const zohoContactMapper = new ZohoContactMapper();
const pipedriveContactMapper = new PipedriveContactMapper();
const attioContactMapper = new AttioContactMapper();
const freshsalesContactMapper = new FreshsalesContactMapper();

export const contactUnificationMapping = {
  hubspot: {
    unify: hubspotContactMapper.unify.bind(hubspotContactMapper),
    desunify: hubspotContactMapper.desunify,
  },
  pipedrive: {
    unify: pipedriveContactMapper.unify.bind(pipedriveContactMapper),
    desunify: pipedriveContactMapper.desunify.bind(pipedriveContactMapper),
  },
  zoho: {
    unify: zohoContactMapper.unify.bind(zohoContactMapper),
    desunify: zohoContactMapper.desunify.bind(zohoContactMapper),
  },
  zendesk: {
    unify: zendeskContactMapper.unify.bind(zendeskContactMapper),
    desunify: zendeskContactMapper.desunify.bind(zendeskContactMapper),
  },
  freshsales: {
    unify: freshsalesContactMapper.unify.bind(freshsalesContactMapper),
    desunify: freshsalesContactMapper.desunify.bind(freshsalesContactMapper),
  },
  attio: {
    unify: attioContactMapper.unify.bind(attioContactMapper),
    desunify: attioContactMapper.desunify.bind(attioContactMapper),
  },
};
