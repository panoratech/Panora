import { CrmObject, FreshsalesContactOutput } from 'src/crm/@types';
import { CrmObjectInput, Unified, UnifySourceType } from '../../../types';
import { mapToFreshsalesContact, mapToUnifiedContact } from './mappers/contact';
import { UnifiedContactInput } from '@contact/types/model.unified';

export async function desunifyFreshsales<T extends Unified>({
  sourceObject,
  targetType_,
}: {
  sourceObject: T;
  targetType_: CrmObject;
}): Promise<CrmObjectInput> {
  switch (targetType_) {
    case CrmObject.contact:
      return mapToFreshsalesContact(sourceObject as UnifiedContactInput);
    case CrmObject.deal:
    //return mapToHubspotDeal(sourceObject);
    case CrmObject.company:
    //return mapToHubspotCompany(sourceObject);
    // Add other cases for different CrmObject types
    default:
      throw new Error(`Unsupported target type for Hubspot: ${targetType_}`);
  }
}
export async function unifyFreshsales<
  T extends UnifySourceType | UnifySourceType[],
>({ sourceObject, targetType_ }: { sourceObject: T; targetType_: CrmObject }) {
  switch (targetType_) {
    case CrmObject.contact:
      return mapToUnifiedContact(
        sourceObject as FreshsalesContactOutput | FreshsalesContactOutput[],
      );
    case CrmObject.deal:
    //return mapToHubspotDeal(sourceObject);
    case CrmObject.company:
    //return mapToHubspotCompany(sourceObject);
    // Add other cases for different CrmObject types
    default:
      throw new Error(`Unsupported target type for Freshsales: ${targetType_}`);
  }
}
