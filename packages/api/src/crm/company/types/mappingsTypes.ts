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
    unify: hubspotCompanyMapper.unify,
    desunify: hubspotCompanyMapper.desunify,
  },
  pipedrive: {
    unify: pipedriveCompanyMapper.unify,
    desunify: pipedriveCompanyMapper.desunify,
  },
  zoho: {
    unify: zohoCompanyMapper.unify,
    desunify: zohoCompanyMapper.desunify,
  },
  zendesk: {
    unify: zendeskCompanyMapper.unify,
    desunify: zendeskCompanyMapper.desunify,
  },
  freshsales: {
    unify: freshSalesCompanyMapper.unify,
    desunify: freshSalesCompanyMapper.desunify,
  },
};
