import { AttioContactMapper } from '../services/attio/mappers';
import { HubspotContactMapper } from '../services/hubspot/mappers';
import { PipedriveContactMapper } from '../services/pipedrive/mappers';
import { ZendeskContactMapper } from '../services/zendesk/mappers';
import { ZohoContactMapper } from '../services/zoho/mappers';
import { AffinityMapper } from '../services/affinity/mappers';

const affinityContactMapper = new AffinityMapper();
const hubspotContactMapper = new HubspotContactMapper();
const zendeskContactMapper = new ZendeskContactMapper();
const zohoContactMapper = new ZohoContactMapper();
const pipedriveContactMapper = new PipedriveContactMapper();
const attioContactMapper = new AttioContactMapper();

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
  attio: {
    unify: attioContactMapper.unify.bind(attioContactMapper),
    desunify: attioContactMapper.desunify.bind(attioContactMapper),
  },
  affinity: {
    unify: affinityContactMapper.unify,
    desunify: affinityContactMapper.desunify,
  },
};
