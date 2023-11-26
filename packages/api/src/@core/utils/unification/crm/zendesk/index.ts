import { CrmObject, ZendeskContactOutput } from 'src/crm/@types';
import { CrmObjectInput, Unified, UnifySourceType } from '../../../types';
import { mapToUnifiedContact, mapToZendeskContact } from './mappers/contact';
import { UnifiedContactInput } from '@contact/types/model.unified';

export async function desunifyZendesk<T extends Unified>({
  sourceObject,
  targetType_,
}: {
  sourceObject: T;
  targetType_: CrmObject;
}): Promise<CrmObjectInput> {
  switch (targetType_) {
    case CrmObject.contact:
      return mapToZendeskContact(sourceObject as UnifiedContactInput);
    case CrmObject.deal:
    //return mapToHubspotDeal(sourceObject);
    case CrmObject.company:
    //return mapToHubspotCompany(sourceObject);
    // Add other cases for different CrmObject types
    default:
      throw new Error(`Unsupported target type for Zendesk: ${targetType_}`);
  }
}
export async function unifyZendesk<
  T extends UnifySourceType | UnifySourceType[],
>({ sourceObject, targetType_ }: { sourceObject: T; targetType_: CrmObject }) {
  switch (targetType_) {
    case CrmObject.contact:
      return mapToUnifiedContact(
        sourceObject as ZendeskContactOutput | ZendeskContactOutput[],
      );
    case CrmObject.deal:
    //return mapToHubspotDeal(sourceObject);
    case CrmObject.company:
    //return mapToHubspotCompany(sourceObject);
    // Add other cases for different CrmObject types
    default:
      throw new Error(`Unsupported target type for Zendesk  : ${targetType_}`);
  }
}
