import { Address } from '@crm/@utils/@types';
import { v4 as uuidv4 } from 'uuid';

export function normalizeAddresses(addresses: Address[]) {
  const normalizedAddresses = addresses.map((addy) => ({
    ...addy,
    created_at: new Date(),
    modified_at: new Date(),
    id_crm_address: uuidv4(),
    owner_type: addy.owner_type ? addy.owner_type : '',
    address_type: addy.address_type === '' ? 'primary' : addy.address_type,
  }));

  return normalizedAddresses;
}
