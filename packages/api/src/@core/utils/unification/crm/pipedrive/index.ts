import { CrmObject, PipedriveContactOutput } from 'src/crm/@types';
import { CrmObjectInput, Unified, UnifySourceType } from '../../../types';
import { mapToPipedriveContact, mapToUnifiedContact } from './mappers/contact';
import { UnifiedContactInput } from '@contact/types/model.unified';

export async function desunifyPipedrive<T extends Unified>({
  sourceObject,
  targetType_,
}: {
  sourceObject: T;
  targetType_: CrmObject;
}): Promise<CrmObjectInput> {
  switch (targetType_) {
    case CrmObject.contact:
      return mapToPipedriveContact(sourceObject as UnifiedContactInput);
    case CrmObject.deal:
    //return mapToHubspotDeal(sourceObject);
    case CrmObject.company:
    //return mapToHubspotCompany(sourceObject);
    // Add other cases for different CrmObject types
    default:
      throw new Error(`Unsupported target type for Pipedrive: ${targetType_}`);
  }
}
export async function unifyPipedrive<
  T extends UnifySourceType | UnifySourceType[],
>({ sourceObject, targetType_ }: { sourceObject: T; targetType_: CrmObject }) {
  switch (targetType_) {
    case CrmObject.contact:
      return mapToUnifiedContact(
        sourceObject as PipedriveContactOutput | PipedriveContactOutput[],
      );
    case CrmObject.deal:
    //return mapToHubspotDeal(sourceObject);
    case CrmObject.company:
    //return mapToHubspotCompany(sourceObject);
    // Add other cases for different CrmObject types
    default:
      throw new Error(`Unsupported target type for Pipedrive: ${targetType_}`);
  }
}
