import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedHrisTimesheetEntryInput,
  UnifiedHrisTimesheetEntryOutput,
} from './model.unified';
import { OriginalTimesheetentryOutput } from '@@core/utils/types/original/original.hris';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';

export interface ITimesheetentryService {
  addTimesheetentry(
    timesheetentryData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTimesheetentryOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalTimesheetentryOutput[]>>;
}

export interface ITimesheetentryMapper {
  desunify(
    source: UnifiedHrisTimesheetEntryInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTimesheetentryOutput | OriginalTimesheetentryOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<
    UnifiedHrisTimesheetEntryOutput | UnifiedHrisTimesheetEntryOutput[]
  >;
}
