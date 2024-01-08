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
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { TicketService } from './services/ticket.service';
import { UnifiedTicketInput, UnifiedTicketOutput } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

@ApiTags('ticketing/ticket')
@Controller('ticketing/ticket')
export class TicketController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly ticketService: TicketService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(TicketController.name);
  }

  @ApiOperation({
    operationId: 'getTickets',
    summary: 'List a batch of Tickets',
  })
  @ApiHeader({
    name: 'connection_token',
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
  @ApiCustomResponse(UnifiedTicketOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getTickets(
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.ticketService.getTickets(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {}
  }

  @ApiOperation({
    operationId: 'getTicket',
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
  @ApiCustomResponse(UnifiedTicketOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getTicket(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.ticketService.getTicket(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addTicket',
    summary: 'Create a Ticket',
    description: 'Create a ticket in any supported Ticketing software',
  })
  @ApiHeader({
    name: 'connection_token',
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
  @ApiBody({ type: UnifiedTicketInput })
  @ApiCustomResponse(UnifiedTicketOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post()
  async addTicket(
    @Body() unfiedTicketData: UnifiedTicketInput,
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.ticketService.addTicket(
        unfiedTicketData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {}
  }

  @ApiOperation({
    operationId: 'addTickets',
    summary: 'Add a batch of Tickets',
  })
  @ApiHeader({
    name: 'connection_token',
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
  @ApiBody({ type: UnifiedTicketInput, isArray: true })
  @ApiCustomResponse(UnifiedTicketOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async addTickets(
    @Body() unfiedTicketData: UnifiedTicketInput[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.ticketService.batchAddTickets(
        unfiedTicketData,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {}
  }

  @ApiOperation({
    operationId: 'updateTicket',
    summary: 'Update a Ticket',
  })
  @UseGuards(ApiKeyAuthGuard)
  @Patch()
  updateTicket(
    @Query('id') id: string,
    @Body() updateTicketData: Partial<UnifiedTicketInput>,
  ) {
    return this.ticketService.updateTicket(id, updateTicketData);
  }
}
