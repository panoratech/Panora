import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Put,
} from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TicketService } from './services/ticket.service';
import {
  UnifiedTicketingTicketInput,
  UnifiedTicketingTicketOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';
import {
  ApiGetCustomResponse,
  ApiPaginatedResponse,
  ApiPostCustomResponse,
} from '@@core/utils/dtos/openapi.respone.dto';
import { UnifiedCrmContactOutput } from '@crm/contact/types/model.unified';

@ApiBearerAuth('bearer')
@ApiTags('ticketing/tickets')
@Controller('ticketing/tickets')
export class TicketController {
  constructor(
    private readonly ticketService: TicketService,
    private logger: LoggerService,
    private connectionUtils: ConnectionUtils,
  ) {
    this.logger.setContext(TicketController.name);
  }

  @ApiOperation({
    operationId: 'listTicketingTicket',
    summary: 'List a batch of Tickets',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiPaginatedResponse(UnifiedTicketingTicketOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, disableErrorMessages: true }))
  async getTickets(
    @Headers('x-connection-token') connection_token: string,
    @Query() query: FetchObjectsQueryDto,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      const { remote_data, limit, cursor } = query;
      return this.ticketService.getTickets(
        connectionId,
        remoteSource,
        linkedUserId,
        limit,
        remote_data,
        cursor,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'retrieveTicketingTicket',
    summary: 'Retrieve a Ticket',
    description: 'Retrieve a ticket from any connected Ticketing software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the `ticket` you want to retrive.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiGetCustomResponse(UnifiedTicketingTicketOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  async retrieve(
    @Headers('x-connection-token') connection_token: string,
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    const { linkedUserId, remoteSource } =
      await this.connectionUtils.getConnectionMetadataFromConnectionToken(
        connection_token,
      );
    return this.ticketService.getTicket(
      id,
      linkedUserId,
      remoteSource,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'createTicketingTicket',
    summary: 'Create a Ticket',
    description: 'Create a ticket in any supported Ticketing software',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiBody({ type: UnifiedTicketingTicketInput })
  @ApiPostCustomResponse(UnifiedTicketingTicketOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addTicket(
    @Body() unifiedTicketData: UnifiedTicketingTicketInput,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource, connectionId } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.ticketService.addTicket(
        unifiedTicketData,
        connectionId,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }
}
