import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedAccountingPhonenumberInput,
  UnifiedAccountingPhonenumberOutput,
} from './model.unified';
import { OriginalPhoneNumberOutput } from '@@core/utils/types/original/original.accounting';
import { ApiResponse } from '@@core/utils/types';

export interface IPhoneNumberService {
  addPhoneNumber(
    phonenumberData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalPhoneNumberOutput>>;

  syncPhoneNumbers(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalPhoneNumberOutput[]>>;
}

export interface IPhoneNumberMapper {
  desunify(
    source: UnifiedAccountingPhonenumberInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalPhoneNumberOutput | OriginalPhoneNumberOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedAccountingPhonenumberOutput | UnifiedAccountingPhonenumberOutput[]>;
}
