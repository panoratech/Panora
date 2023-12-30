/* EXAMPLE ONCE YOU HAVE DEFINED YOUR SERVICE PROVIDER UNDER /services/myProvider

import { MyProviderDealMapper } from '../services/myProvider/mappers';

const myProviderDealMapper = new MyProviderDealMapper();

export const dealUnificationMapping = {
  myProvider: {
    unify: myProviderDealMapper.unify,
    desunify: myProviderDealMapper.desunify,
  },
}; */
