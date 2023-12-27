import { ApiPropertyOptional } from '@nestjs/swagger';

export class UnifiedTicketInput {}

export class UnifiedTicketOutput extends UnifiedTicketInput {
  @ApiPropertyOptional()
  id?: string;
}
