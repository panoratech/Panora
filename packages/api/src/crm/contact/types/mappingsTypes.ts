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
    unify: hubspotContactMapper.unify.bind(hubspotContactMapper),
    desunify: hubspotContactMapper.desunify,
  },
  pipedrive: {
    unify: pipedriveContactMapper.unify.bind(pipedriveContactMapper),
    desunify: pipedriveContactMapper.desunify.bind(pipedriveContactMapper),
  },
  zoho: {
    unify: zohoContactMapper.unify.bind(zohoContactMapper),
    desunify: zohoContactMapper.desunify.bind(zohoContactMapper),
  },
  zendesk: {
    unify: zendeskContactMapper.unify.bind(zendeskContactMapper),
    desunify: zendeskContactMapper.desunify.bind(zendeskContactMapper),
  },
  freshsales: {
    unify: freshSalesContactMapper.unify.bind(freshSalesContactMapper),
    desunify: freshSalesContactMapper.desunify.bind(freshSalesContactMapper),
  },
};
