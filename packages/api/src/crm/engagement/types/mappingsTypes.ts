import { FreshsalesEngagementMapper } from '../services/freshsales/mappers';
import { HubspotEngagementMapper } from '../services/hubspot/mappers';
import { PipedriveEngagementMapper } from '../services/pipedrive/mappers';
import { ZendeskEngagementMapper } from '../services/zendesk/mappers';
import { ZohoEngagementMapper } from '../services/zoho/mappers';

const hubspotEngagementMapper = new HubspotEngagementMapper();
const zendeskEngagementMapper = new ZendeskEngagementMapper();
const zohoEngagementMapper = new ZohoEngagementMapper();
const pipedriveEngagementMapper = new PipedriveEngagementMapper();
const freshSalesEngagementMapper = new FreshsalesEngagementMapper();

export const engagementUnificationMapping = {
  hubspot: {
    unify: hubspotEngagementMapper.unify,
    desunify: hubspotEngagementMapper.desunify,
  },
  pipedrive: {
    unify: pipedriveEngagementMapper.unify,
    desunify: pipedriveEngagementMapper.desunify,
  },
  zoho: {
    unify: zohoEngagementMapper.unify,
    desunify: zohoEngagementMapper.desunify,
  },
  zendesk: {
    unify: zendeskEngagementMapper.unify,
    desunify: zendeskEngagementMapper.desunify,
  },
  freshsales: {
    unify: freshSalesEngagementMapper.unify,
    desunify: freshSalesEngagementMapper.desunify,
  },
};
