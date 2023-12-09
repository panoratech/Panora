import { Controller, Get } from '@nestjs/common';
import { EventsService } from './events.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private logger: LoggerService,
    private prisma: PrismaService,
  ) {
    this.logger.setContext(EventsController.name);
  }

  @ApiResponse({ status: 200 })
  @Get()
  async getEvents() {
    return await this.prisma.events.findMany();
  }
}
