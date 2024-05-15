import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTicketInput, UnifiedTicketOutput } from './model.unified';
import { ApiResponse, Pagination } from '@@core/utils/types';
import { OriginalTicketOutput } from '@@core/utils/types/original/original.ticketing';

export interface ITicketService {
  addTicket(
    ticketData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTicketOutput>>;

  syncTickets(
    linkedUserId: string,
    custom_properties?: string[],
    pageMeta?: Pagination,
  ): Promise<ApiResponse<OriginalTicketOutput[]>>;
}
export interface ITicketMapper {
  desunify(
    source: UnifiedTicketInput,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: OriginalTicketOutput | OriginalTicketOutput[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Promise<UnifiedTicketOutput | UnifiedTicketOutput[]>;
}

export type Comment = {
  remote_id?: string;
  body: string;
  html_body: string;
  is_private: boolean;
};
