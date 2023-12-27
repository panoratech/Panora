import { FreshsalesContactMapper } from '@crm/contact/services/freshsales/mappers';
import { HubspotContactMapper } from '@crm/contact/services/hubspot/mappers';
import { PipedriveContactMapper } from '@crm/contact/services/pipedrive/mappers';
import { ZendeskContactMapper } from '@crm/contact/services/zendesk/mappers';
import { ZohoContactMapper } from '@crm/contact/services/zoho/mappers';

const hubspotContactMapper = new HubspotContactMapper();
const zendeskContactMapper = new ZendeskContactMapper();
const zohoContactMapper = new ZohoContactMapper();
const pipedriveContactMapper = new PipedriveContactMapper();
const freshSalesContactMapper = new FreshsalesContactMapper();

export const contactUnificationMapping = {
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
