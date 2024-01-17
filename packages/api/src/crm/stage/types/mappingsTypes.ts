import { FreshsalesStageMapper } from '../services/freshsales/mappers';
import { HubspotStageMapper } from '../services/hubspot/mappers';
import { PipedriveStageMapper } from '../services/pipedrive/mappers';
import { ZendeskStageMapper } from '../services/zendesk/mappers';
import { ZohoStageMapper } from '../services/zoho/mappers';

const hubspotStageMapper = new HubspotStageMapper();
const zendeskStageMapper = new ZendeskStageMapper();
const zohoStageMapper = new ZohoStageMapper();
const pipedriveStageMapper = new PipedriveStageMapper();
const freshSalesStageMapper = new FreshsalesStageMapper();

export const stageUnificationMapping = {
  hubspot: {
    unify: hubspotStageMapper.unify.bind(hubspotStageMapper),
    desunify: hubspotStageMapper.desunify.bind(hubspotStageMapper),
  },
  pipedrive: {
    unify: pipedriveStageMapper.unify.bind(pipedriveStageMapper),
    desunify: pipedriveStageMapper.desunify.bind(pipedriveStageMapper),
  },
  zoho: {
    unify: zohoStageMapper.unify.bind(zohoStageMapper),
    desunify: zohoStageMapper.desunify.bind(zohoStageMapper),
  },
  zendesk: {
    unify: zendeskStageMapper.unify.bind(zendeskStageMapper),
    desunify: zendeskStageMapper.desunify.bind(zendeskStageMapper),
  },
  freshsales: {
    unify: freshSalesStageMapper.unify.bind(freshSalesStageMapper),
    desunify: freshSalesStageMapper.desunify.bind(freshSalesStageMapper),
  },
};
