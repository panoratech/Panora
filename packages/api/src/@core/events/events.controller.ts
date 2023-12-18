import { Controller, Get } from '@nestjs/common';
import { EventsService } from './events.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(EventsController.name);
  }

  @ApiOperation({ operationId: 'getEvents', summary: 'Retrieve Events' })
  @ApiResponse({ status: 200 })
  @Get()
  async getEvents() {
    return await this.eventsService.findEvents();
  }
}
