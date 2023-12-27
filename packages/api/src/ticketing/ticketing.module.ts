import { Module } from '@nestjs/common';
import { TicketModule } from './ticket/ticket.module';

@Module({
  imports: [TicketModule],
  providers: [],
  controllers: [],
  exports: [TicketModule],
})
export class TicketingModule {}
