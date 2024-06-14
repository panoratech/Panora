import { AffinityUserMapper } from '../services/affinity/mappers';
import { HubspotUserMapper } from '../services/hubspot/mappers';
import { PipedriveUserMapper } from '../services/pipedrive/mappers';
import { ZendeskUserMapper } from '../services/zendesk/mappers';
import { ZohoUserMapper } from '../services/zoho/mappers';
import { CloseUserMapper } from '../services/close/mappers';

const hubspotUserMapper = new HubspotUserMapper();
const zendeskUserMapper = new ZendeskUserMapper();
const zohoUserMapper = new ZohoUserMapper();
const pipedriveUserMapper = new PipedriveUserMapper();
const closeUserMapper = new CloseUserMapper();

const affinityUserMapper = new AffinityUserMapper();
export const userUnificationMapping = {
  hubspot: {
    unify: hubspotUserMapper.unify.bind(hubspotUserMapper),
    desunify: hubspotUserMapper.desunify.bind(hubspotUserMapper),
  },
  pipedrive: {
    unify: pipedriveUserMapper.unify.bind(pipedriveUserMapper),
    desunify: pipedriveUserMapper.desunify.bind(pipedriveUserMapper),
  },
  zoho: {
    unify: zohoUserMapper.unify.bind(zohoUserMapper),
    desunify: zohoUserMapper.desunify.bind(zohoUserMapper),
  },
  zendesk: {
    unify: zendeskUserMapper.unify.bind(zendeskUserMapper),
    desunify: zendeskUserMapper.desunify.bind(zendeskUserMapper),
  },
  close: {
    unify: closeUserMapper.unify.bind(closeUserMapper),
    desunify: closeUserMapper.desunify.bind(closeUserMapper),
  },
  affinity: {
    unify: affinityUserMapper.unify.bind(affinityUserMapper),
    desunify: affinityUserMapper.desunify.bind(affinityUserMapper),
  },
};
