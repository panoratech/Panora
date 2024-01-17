import { FreshsalesUserMapper } from '../services/freshsales/mappers';
import { HubspotUserMapper } from '../services/hubspot/mappers';
import { PipedriveUserMapper } from '../services/pipedrive/mappers';
import { ZendeskUserMapper } from '../services/zendesk/mappers';
import { ZohoUserMapper } from '../services/zoho/mappers';

const hubspotUserMapper = new HubspotUserMapper();
const zendeskUserMapper = new ZendeskUserMapper();
const zohoUserMapper = new ZohoUserMapper();
const pipedriveUserMapper = new PipedriveUserMapper();
const freshSalesUserMapper = new FreshsalesUserMapper();

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
  freshsales: {
    unify: freshSalesUserMapper.unify.bind(freshSalesUserMapper),
    desunify: freshSalesUserMapper.desunify.bind(freshSalesUserMapper),
  },
};
