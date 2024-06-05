import { Address } from '@crm/@lib/@types';
import {
  UnifiedContactInput,
  UnifiedContactOutput,
} from '@crm/contact/types/model.unified';
import { IContactMapper } from '@crm/contact/types';
import { Utils } from '@crm/@lib/@utils';
import { AffinityContactInput, AffinityContactOutput } from './types';

export class AffinityMapper implements IContactMapper {
    desunify(
      source: UnifiedContactInput,
      customFieldMappings?: {
        slug: string;
        remote_id: string;
      }[],
    ): AffinityContactInput {
      // Mapping from unified contact to Affinity contact
      return {
        firstName: source.firstName,
        lastName: source.lastName,
        email: source.email,
        phone: source.phone,
        company: source.company,
      };
    }
  
    unify(
      source: AffinityContactOutput | AffinityContactOutput[],
      customFieldMappings?: {
        slug: string;
        remote_id: string;
      }[],
    ): UnifiedContactOutput | UnifiedContactOutput[] {
      if (Array.isArray(source)) {
        return source.map(contact => this.unify(contact));
      }
      
      return {
        id: source.id,
        firstName: source.firstName,
        lastName: source.lastName,
        email: source.email,
        phone: source.phone,
        company: source.company,
      };
    }
  }