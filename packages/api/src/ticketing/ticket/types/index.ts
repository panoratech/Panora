import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import {
  UnifiedTicketingTicketInput,
  UnifiedTicketingTicketOutput,
} from './model.unified';
import { ApiResponse } from '@@core/utils/types';
import { OriginalTicketOutput } from '@@core/utils/types/original/original.ticketing';
import { IBaseObjectService, SyncParam } from '@@core/utils/types/interface';

export interface ITicketService extends IBaseObjectService {
  addTicket(
    ticketData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTicketOutput>>;

  sync(data: SyncParam): Promise<ApiResponse<OriginalTicketOutput[]>>;
}
export interface ITicketMapper {
  desunify(
    source: UnifiedTicketingTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
    connection_id?: string,
  ): DesunifyReturnType;

  unify(
    source: OriginalTicketOutput | OriginalTicketOutput[],
    connectionId: string,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketingTicketOutput | UnifiedTicketingTicketOutput[]>;
}

export type Comment = {
  remote_id?: string;
  body: string;
  html_body: string;
  is_private: boolean;
};
