import { CrmObject } from 'src/crm/@types';
import { CrmObjectInput } from '../../types';

export async function desunifyPipedrive<T extends Record<string, any>>({
  sourceObject,
  targetType_,
}: {
  sourceObject: T;
  targetType_: CrmObject;
}): Promise<CrmObjectInput> {
  return;
}
