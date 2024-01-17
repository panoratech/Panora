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
    unify: hubspotDealMapper.unify.bind(hubspotDealMapper),
    desunify: hubspotDealMapper.desunify.bind(hubspotDealMapper),
  },
  pipedrive: {
    unify: pipedriveDealMapper.unify.bind(pipedriveDealMapper),
    desunify: pipedriveDealMapper.desunify.bind(pipedriveDealMapper),
  },
  zoho: {
    unify: zohoDealMapper.unify.bind(zohoDealMapper),
    desunify: zohoDealMapper.desunify.bind(zohoDealMapper),
  },
  zendesk: {
    unify: zendeskDealMapper.unify.bind(zendeskDealMapper),
    desunify: zendeskDealMapper.desunify.bind(zendeskDealMapper),
  },
  freshsales: {
    unify: freshSalesDealMapper.unify.bind(freshSalesDealMapper),
    desunify: freshSalesDealMapper.desunify.bind(freshSalesDealMapper),
  },
};
