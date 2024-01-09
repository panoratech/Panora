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
    unify: hubspotUserMapper.unify,
    desunify: hubspotUserMapper.desunify,
  },
  pipedrive: {
    unify: pipedriveUserMapper.unify,
    desunify: pipedriveUserMapper.desunify,
  },
  zoho: {
    unify: zohoUserMapper.unify,
    desunify: zohoUserMapper.desunify,
  },
  zendesk: {
    unify: zendeskUserMapper.unify,
    desunify: zendeskUserMapper.desunify,
  },
  freshsales: {
    unify: freshSalesUserMapper.unify,
    desunify: freshSalesUserMapper.desunify,
  },
};
