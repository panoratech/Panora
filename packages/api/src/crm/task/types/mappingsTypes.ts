import { HubspotTaskMapper } from '../services/hubspot/mappers';
import { PipedriveTaskMapper } from '../services/pipedrive/mappers';
import { ZendeskTaskMapper } from '../services/zendesk/mappers';
import { ZohoTaskMapper } from '../services/zoho/mappers';
import { CloseTaskMapper } from '../services/close/mappers';

const hubspotTaskMapper = new HubspotTaskMapper();
const zendeskTaskMapper = new ZendeskTaskMapper();
const zohoTaskMapper = new ZohoTaskMapper();
const pipedriveTaskMapper = new PipedriveTaskMapper();
const closeTaskMapper = new CloseTaskMapper();

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
  close: {
    unify: closeTaskMapper.unify.bind(closeTaskMapper),
    desunify: closeTaskMapper.desunify.bind(closeTaskMapper),
  },
};
