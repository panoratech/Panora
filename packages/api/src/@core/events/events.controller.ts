import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import { ApiGetArrayCustomResponse } from '@@core/utils/dtos/openapi.respone.dto';
import { PaginationDto } from '@@core/utils/dtos/webapp.event.pagination.dto';
import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EventResponse } from './dto/index.dto';
import { EventsService } from './events.service';

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
    summary: 'List Events',
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
  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard)
  @Get('internal')
  async getInternalEvents(@Query() dto: PaginationDto, @Request() req: any) {
    const { id_project } = req.user;
    return await this.eventsService.findEvents(dto, id_project);
  }

  @ApiOperation({
    operationId: 'getPanoraCoreEvents',
    summary: 'List Events',
  })
  @ApiGetArrayCustomResponse(EventResponse)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  @UseGuards(ApiKeyAuthGuard)
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
  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard)
  async getEventsCount(@Request() req: any) {
    const { id_project } = req.user;
    return await this.eventsService.getEventsCount(id_project);
  }
}
