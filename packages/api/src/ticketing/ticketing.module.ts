import { Module } from '@nestjs/common';
import { TicketModule } from './ticket/ticket.module';

@Module({
  imports: [TicketModule],
})
export class TicketingModule {}
