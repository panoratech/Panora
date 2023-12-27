import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { UnifiedTicketInput, UnifiedTicketOutput } from './model.unified';
import { OriginalTicketOutput } from '@@core/utils/types/original.output';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiResponse } from '@@core/utils/types';

export interface ITicketService {
  addTicket(
    ticketData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalTicketOutput>>;

  syncTickets(
    linkedUserId: string,
    custom_properties?: string[],
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
  ): UnifiedTicketOutput | UnifiedTicketOutput[];
}

export class TicketResponse {
  @ApiProperty({ type: [UnifiedTicketOutput] })
  tickets: UnifiedTicketOutput[];
  @ApiPropertyOptional({ type: [{}] })
  remote_data?: Record<string, any>[]; //data in original format
}
