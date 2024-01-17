import { FreshsalesCompanyMapper } from '@crm/company/services/freshsales/mappers';
import { HubspotCompanyMapper } from '@crm/company/services/hubspot/mappers';
import { PipedriveCompanyMapper } from '@crm/company/services/pipedrive/mappers';
import { ZendeskCompanyMapper } from '@crm/company/services/zendesk/mappers';
import { ZohoCompanyMapper } from '@crm/company/services/zoho/mappers';

const hubspotCompanyMapper = new HubspotCompanyMapper();
const zendeskCompanyMapper = new ZendeskCompanyMapper();
const zohoCompanyMapper = new ZohoCompanyMapper();
const pipedriveCompanyMapper = new PipedriveCompanyMapper();
const freshSalesCompanyMapper = new FreshsalesCompanyMapper();

export const companyUnificationMapping = {
  hubspot: {
    unify: hubspotCompanyMapper.unify.bind(hubspotCompanyMapper),
    desunify: hubspotCompanyMapper.desunify.bind(hubspotCompanyMapper),
  },
  pipedrive: {
    unify: pipedriveCompanyMapper.unify.bind(pipedriveCompanyMapper),
    desunify: pipedriveCompanyMapper.desunify.bind(pipedriveCompanyMapper),
  },
  zoho: {
    unify: zohoCompanyMapper.unify.bind(zohoCompanyMapper),
    desunify: zohoCompanyMapper.desunify.bind(zohoCompanyMapper),
  },
  zendesk: {
    unify: zendeskCompanyMapper.unify.bind(zendeskCompanyMapper),
    desunify: zendeskCompanyMapper.desunify.bind(zendeskCompanyMapper),
  },
  freshsales: {
    unify: freshSalesCompanyMapper.unify.bind(freshSalesCompanyMapper),
    desunify: freshSalesCompanyMapper.desunify.bind(freshSalesCompanyMapper),
  },
};
