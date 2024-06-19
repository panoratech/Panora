import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@@core/utils/dtos/pagination.dto';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(EventsController.name);
  }

  @ApiOperation({
    operationId: 'getPanoraCoreEvents',
    summary: 'Retrieve Events',
  })
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
  @UseGuards(JwtAuthGuard)
  @Get()
  async getEvents(@Query() dto: PaginationDto, @Request() req: any) {
    const { id_project } = req.user;
    return await this.eventsService.findEvents(dto, id_project);
  }

  @ApiOperation({
    operationId: 'getEventsCount',
    summary: 'Retrieve Events Count',
  })
  @Get('count')
  @UseGuards(JwtAuthGuard)
  async getEventsCount(@Request() req: any) {
    const { id_project } = req.user;
    return await this.eventsService.getEventsCount(id_project);
  }
}
