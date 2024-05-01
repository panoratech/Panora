import {
  Controller,
  Get,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@@core/utils/dtos/pagination.dto';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import { ValidateUserGuard } from '@@core/utils/guards/validate-user.guard';

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
  @UseGuards(JwtAuthGuard, ValidateUserGuard)
  @Get()
  async getEvents(
    @Query() dto: PaginationDto,
    @Query('project_id') project_id: string,
  ) {
    return await this.eventsService.findEvents(dto, project_id);
  }

  // todo
  @ApiOperation({
    operationId: 'getEventsCount',
    summary: 'Retrieve Events Count',
  })
  @Get('count')
  @UseGuards(JwtAuthGuard)
  async getEventsCount() {
    return await this.eventsService.getEventsCount();
  }
}
