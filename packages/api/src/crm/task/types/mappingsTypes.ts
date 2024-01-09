import { FreshsalesTaskMapper } from '../services/freshsales/mappers';
import { HubspotTaskMapper } from '../services/hubspot/mappers';
import { PipedriveTaskMapper } from '../services/pipedrive/mappers';
import { ZendeskTaskMapper } from '../services/zendesk/mappers';
import { ZohoTaskMapper } from '../services/zoho/mappers';

const hubspotTaskMapper = new HubspotTaskMapper();
const zendeskTaskMapper = new ZendeskTaskMapper();
const zohoTaskMapper = new ZohoTaskMapper();
const pipedriveTaskMapper = new PipedriveTaskMapper();
const freshSalesTaskMapper = new FreshsalesTaskMapper();

export const taskUnificationMapping = {
  hubspot: {
    unify: hubspotTaskMapper.unify,
    desunify: hubspotTaskMapper.desunify,
  },
  pipedrive: {
    unify: pipedriveTaskMapper.unify,
    desunify: pipedriveTaskMapper.desunify,
  },
  zoho: {
    unify: zohoTaskMapper.unify,
    desunify: zohoTaskMapper.desunify,
  },
  zendesk: {
    unify: zendeskTaskMapper.unify,
    desunify: zendeskTaskMapper.desunify,
  },
  freshsales: {
    unify: freshSalesTaskMapper.unify,
    desunify: freshSalesTaskMapper.desunify,
  },
};
