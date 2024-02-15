import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@@core/utils/dtos/pagination.dto';

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
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  @Get()
  async getEvents(@Query() dto: PaginationDto) {
    return await this.eventsService.findEvents(dto);
  }

  @ApiOperation({
    operationId: 'getEventsCount',
    summary: 'Retrieve Events Count',
  })
  @Get('count')
  async getEventsCount() {
    return await this.eventsService.getEventsCount();
  }
}
