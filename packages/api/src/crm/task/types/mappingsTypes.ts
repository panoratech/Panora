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
    unify: hubspotTaskMapper.unify.bind(hubspotTaskMapper),
    desunify: hubspotTaskMapper.desunify.bind(hubspotTaskMapper),
  },
  pipedrive: {
    unify: pipedriveTaskMapper.unify.bind(pipedriveTaskMapper),
    desunify: pipedriveTaskMapper.desunify.bind(pipedriveTaskMapper),
  },
  zoho: {
    unify: zohoTaskMapper.unify.bind(zohoTaskMapper),
    desunify: zohoTaskMapper.desunify.bind(zohoTaskMapper),
  },
  zendesk: {
    unify: zendeskTaskMapper.unify.bind(zendeskTaskMapper),
    desunify: zendeskTaskMapper.desunify.bind(zendeskTaskMapper),
  },
  freshsales: {
    unify: freshSalesTaskMapper.unify.bind(freshSalesTaskMapper),
    desunify: freshSalesTaskMapper.desunify.bind(freshSalesTaskMapper),
  },
};
