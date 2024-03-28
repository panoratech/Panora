import { AttioCompanyMapper } from '../services/attio/mappers';
import { FreshsalesCompanyMapper } from '../services/freshsales/mappers';
import { HubspotCompanyMapper } from '../services/hubspot/mappers';
import { PipedriveCompanyMapper } from '../services/pipedrive/mappers';
import { ZendeskCompanyMapper } from '../services/zendesk/mappers';
import { ZohoCompanyMapper } from '../services/zoho/mappers';

const hubspotCompanyMapper = new HubspotCompanyMapper();
const zendeskCompanyMapper = new ZendeskCompanyMapper();
const zohoCompanyMapper = new ZohoCompanyMapper();
const pipedriveCompanyMapper = new PipedriveCompanyMapper();
const attioCompanyMapper = new AttioCompanyMapper();
const freshsalesCompanyMapper = new FreshsalesCompanyMapper();

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
    unify: freshsalesCompanyMapper.unify.bind(freshsalesCompanyMapper),
    desunify: freshsalesCompanyMapper.desunify.bind(freshsalesCompanyMapper),
  },
  attio: {
    unify: attioCompanyMapper.unify.bind(attioCompanyMapper),
    desunify: attioCompanyMapper.desunify.bind(attioCompanyMapper),
  },
};
