import { HubspotStageMapper } from '../services/hubspot/mappers';
import { PipedriveStageMapper } from '../services/pipedrive/mappers';
import { ZendeskStageMapper } from '../services/zendesk/mappers';
import { ZohoStageMapper } from '../services/zoho/mappers';
import { CloseStageMapper } from '../services/close/mappers';

const hubspotStageMapper = new HubspotStageMapper();
const zendeskStageMapper = new ZendeskStageMapper();
const zohoStageMapper = new ZohoStageMapper();
const pipedriveStageMapper = new PipedriveStageMapper();
const closeStageMapper = new CloseStageMapper();

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
  close: {
    unify: closeStageMapper.unify.bind(closeStageMapper),
    desunify: closeStageMapper.desunify.bind(closeStageMapper),
  },
};
