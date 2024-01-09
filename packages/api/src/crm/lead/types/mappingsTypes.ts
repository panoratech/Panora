import { FreshsalesLeadMapper } from '../services/freshsales/mappers';
import { HubspotLeadMapper } from '../services/hubspot/mappers';
import { PipedriveLeadMapper } from '../services/pipedrive/mappers';
import { ZendeskLeadMapper } from '../services/zendesk/mappers';
import { ZohoLeadMapper } from '../services/zoho/mappers';

const hubspotLeadMapper = new HubspotLeadMapper();
const zendeskLeadMapper = new ZendeskLeadMapper();
const zohoLeadMapper = new ZohoLeadMapper();
const pipedriveLeadMapper = new PipedriveLeadMapper();
const freshSalesLeadMapper = new FreshsalesLeadMapper();

export const leadUnificationMapping = {
  hubspot: {
    unify: hubspotLeadMapper.unify,
    desunify: hubspotLeadMapper.desunify,
  },
  pipedrive: {
    unify: pipedriveLeadMapper.unify,
    desunify: pipedriveLeadMapper.desunify,
  },
  zoho: {
    unify: zohoLeadMapper.unify,
    desunify: zohoLeadMapper.desunify,
  },
  zendesk: {
    unify: zendeskLeadMapper.unify,
    desunify: zendeskLeadMapper.desunify,
  },
  freshsales: {
    unify: freshSalesLeadMapper.unify,
    desunify: freshSalesLeadMapper.desunify,
  },
};
