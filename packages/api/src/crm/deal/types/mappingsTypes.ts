import { FreshsalesContactMapper } from '@contact/services/freshsales/mappers';
import { HubspotContactMapper } from '@contact/services/hubspot/mappers';
import { PipedriveContactMapper } from '@contact/services/pipedrive/mappers';
import { ZendeskContactMapper } from '@contact/services/zendesk/mappers';
import { ZohoContactMapper } from '@contact/services/zoho/mappers';

const hubspotContactMapper = new HubspotContactMapper();
const zendeskContactMapper = new ZendeskContactMapper();
const zohoContactMapper = new ZohoContactMapper();
const pipedriveContactMapper = new PipedriveContactMapper();
const freshSalesContactMapper = new FreshsalesContactMapper();

export const dealUnificationMapping = {
  hubspot: {
    unify: hubspotContactMapper.unify,
    desunify: hubspotContactMapper.desunify,
  },
  pipedrive: {
    unify: pipedriveContactMapper.unify,
    desunify: pipedriveContactMapper.desunify,
  },
  zoho: {
    unify: zohoContactMapper.unify,
    desunify: zohoContactMapper.desunify,
  },
  zendesk: {
    unify: zendeskContactMapper.unify,
    desunify: zendeskContactMapper.desunify,
  },
  freshsales: {
    unify: freshSalesContactMapper.unify,
    desunify: freshSalesContactMapper.desunify,
  },
};
