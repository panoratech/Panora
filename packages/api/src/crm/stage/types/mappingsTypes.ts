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
    unify: hubspotStageMapper.unify,
    desunify: hubspotStageMapper.desunify,
  },
  pipedrive: {
    unify: pipedriveStageMapper.unify,
    desunify: pipedriveStageMapper.desunify,
  },
  zoho: {
    unify: zohoStageMapper.unify,
    desunify: zohoStageMapper.desunify,
  },
  zendesk: {
    unify: zendeskStageMapper.unify,
    desunify: zendeskStageMapper.desunify,
  },
  freshsales: {
    unify: freshSalesStageMapper.unify,
    desunify: freshSalesStageMapper.desunify,
  },
};
