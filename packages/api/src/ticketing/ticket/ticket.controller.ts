import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { TicketService } from './services/ticket.service';
import { TicketResponse } from './types';
import { UnifiedTicketInput } from './types/model.unified';

@ApiTags('ticketing/ticket')
@Controller('ticketing/ticket')
export class TicketController {
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
  @ApiQuery({ name: 'integrationId', required: true, type: String })
  @ApiQuery({ name: 'linkedUserId', required: true, type: String })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  //@ApiCustomResponse(TicketResponse)
  @Get()
  getTickets(
    @Query('integrationId') integrationId: string,
    @Query('linkedUserId') linkedUserId: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.ticketService.getTickets(
      integrationId,
      linkedUserId,
      remote_data,
    );
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
  //@ApiCustomResponse(TicketResponse)
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
  @ApiQuery({
    name: 'integrationId',
    required: true,
    type: String,
    description: 'The integration ID',
    example: '6aa2acf3-c244-4f85-848b-13a57e7abf55',
  })
  @ApiQuery({
    name: 'linkedUserId',
    required: true,
    type: String,
    description: 'The linked user ID',
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
  //@ApiCustomResponse(TicketResponse)
  @Post()
  addTicket(
    @Body() unfiedContactData: UnifiedTicketInput,
    @Query('integrationId') integrationId: string,
    @Query('linkedUserId') linkedUserId: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.ticketService.addTicket(
      unfiedContactData,
      integrationId,
      linkedUserId,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'addTickets',
    summary: 'Add a batch of Tickets',
  })
  @ApiQuery({ name: 'integrationId', required: true, type: String })
  @ApiQuery({ name: 'linkedUserId', required: true, type: String })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiBody({ type: UnifiedTicketInput, isArray: true })
  //@ApiCustomResponse(TicketResponse)
  @Post('batch')
  addTickets(
    @Body() unfiedContactData: UnifiedTicketInput[],
    @Query('integrationId') integrationId: string,
    @Query('linkedUserId') linkedUserId: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.ticketService.batchAddTickets(
      unfiedContactData,
      integrationId,
      linkedUserId,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'updateTicket',
    summary: 'Update a Ticket',
  })
  @Patch()
  updateTicket(
    @Query('id') id: string,
    @Body() updateContactData: Partial<UnifiedTicketInput>,
  ) {
    return this.ticketService.updateTicket(id, updateContactData);
  }
}
