import { FreshsalesDealMapper } from '../services/freshsales/mappers';
import { HubspotDealMapper } from '../services/hubspot/mappers';
import { PipedriveDealMapper } from '../services/pipedrive/mappers';
import { ZendeskDealMapper } from '../services/zendesk/mappers';
import { ZohoDealMapper } from '../services/zoho/mappers';

const hubspotDealMapper = new HubspotDealMapper();
const zendeskDealMapper = new ZendeskDealMapper();
const zohoDealMapper = new ZohoDealMapper();
const pipedriveDealMapper = new PipedriveDealMapper();
const freshSalesDealMapper = new FreshsalesDealMapper();

export const dealUnificationMapping = {
  hubspot: {
    unify: hubspotDealMapper.unify,
    desunify: hubspotDealMapper.desunify,
  },
  pipedrive: {
    unify: pipedriveDealMapper.unify,
    desunify: pipedriveDealMapper.desunify,
  },
  zoho: {
    unify: zohoDealMapper.unify,
    desunify: zohoDealMapper.desunify,
  },
  zendesk: {
    unify: zendeskDealMapper.unify,
    desunify: zendeskDealMapper.desunify,
  },
  freshsales: {
    unify: freshSalesDealMapper.unify,
    desunify: freshSalesDealMapper.desunify,
  },
};
