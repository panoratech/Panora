import { CrmObject, HubspotContactOutput } from 'src/crm/@types';
import { CrmObjectInput, Unified, UnifySourceType } from '../../../types';
import { mapToHubspotContact, mapToUnifiedContact } from './mappers/contact';
import { UnifiedContactInput } from '@contact/types/model.unified';

export async function desunifyHubspot<T extends Unified>({
  sourceObject,
  targetType_,
  customFieldMappings,
}: {
  sourceObject: T;
  targetType_: CrmObject;
  customFieldMappings?: {
    slug: string;
    remote_id: string;
  }[];
}): Promise<CrmObjectInput> {
  switch (targetType_) {
    case CrmObject.contact:
      return mapToHubspotContact(
        sourceObject as UnifiedContactInput,
        customFieldMappings,
      );
    case CrmObject.deal:
    //return mapToHubspotDeal(sourceObject);
    case CrmObject.company:
    //return mapToHubspotCompany(sourceObject);
    // Add other cases for different CrmObject types
    default:
      throw new Error(`Unsupported target type for Hubspot: ${targetType_}`);
  }
}
export async function unifyHubspot<
  T extends UnifySourceType | UnifySourceType[],
>({
  sourceObject,
  targetType_,
  customFieldMappings,
}: {
  sourceObject: T;
  targetType_: CrmObject;
  customFieldMappings?: {
    slug: string;
    remote_id: string;
  }[];
}) {
  switch (targetType_) {
    case CrmObject.contact:
      return mapToUnifiedContact(
        sourceObject as HubspotContactOutput | HubspotContactOutput[],
        customFieldMappings,
      );
    case CrmObject.deal:
    //return mapToHubspotDeal(sourceObject);
    case CrmObject.company:
    //return mapToHubspotCompany(sourceObject);
    // Add other cases for different CrmObject types
    default:
      throw new Error(`Unsupported target type for Hubspot: ${targetType_}`);
  }
}
