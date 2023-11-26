import { CrmObject, ZohoContactOutput } from 'src/crm/@types';
import { CrmObjectInput, Unified, UnifySourceType } from '../../../types';
import { mapToUnifiedContact, mapToZohoContact } from './mappers/contact';
import { UnifiedContactInput } from 'src/crm/contact/types/model.unified';

export async function desunifyZoho<T extends Unified>({
  sourceObject,
  targetType_,
}: {
  sourceObject: T;
  targetType_: CrmObject;
}): Promise<CrmObjectInput> {
  switch (targetType_) {
    case CrmObject.contact:
      return mapToZohoContact(sourceObject as UnifiedContactInput);
    case CrmObject.deal:
    //return mapToHubspotDeal(sourceObject);
    case CrmObject.company:
    //return mapToHubspotCompany(sourceObject);
    // Add other cases for different CrmObject types
    default:
      throw new Error(`Unsupported target type for Zoho: ${targetType_}`);
  }
}
export async function unifyZoho<T extends UnifySourceType | UnifySourceType[]>({
  sourceObject,
  targetType_,
}: {
  sourceObject: T;
  targetType_: CrmObject;
}) {
  switch (targetType_) {
    case CrmObject.contact:
      return mapToUnifiedContact(
        sourceObject as ZohoContactOutput | ZohoContactOutput[],
      );
    case CrmObject.deal:
    //return mapToHubspotDeal(sourceObject);
    case CrmObject.company:
    //return mapToHubspotCompany(sourceObject);
    // Add other cases for different CrmObject types
    default:
      throw new Error(`Unsupported target type for Zoho: ${targetType_}`);
  }
}
