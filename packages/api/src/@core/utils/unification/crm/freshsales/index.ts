import { CrmObject } from 'src/crm/@types';
import { CrmObjectInput, Unified } from '../../types';

export async function desunifyFreshsales<T extends Unified>({
  sourceObject,
  targetType_,
}: {
  sourceObject: T;
  targetType_: CrmObject;
}): Promise<CrmObjectInput> {
  return;
}
