import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
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
  @ApiHeader({ name: 'integrationId', required: true })
  @ApiHeader({ name: 'linkedUserId', required: true })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  //@ApiCustomResponse(TicketResponse)
  @Get()
  getTickets(
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
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
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  //@ApiCustomResponse(TicketResponse)
  @Get(':id')
  getTicket(
    @Param('id') id: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.ticketService.getTicket(id, remote_data);
  }

  @ApiOperation({
    operationId: 'addTicket',
    summary: 'Create a Ticket',
    description: 'Create a ticket in any supported Ticketing software',
  })
  @ApiHeader({
    name: 'integrationId',
    required: true,
    description: 'The integration ID',
    example: '6aa2acf3-c244-4f85-848b-13a57e7abf55',
  })
  @ApiHeader({
    name: 'linkedUserId',
    required: true,
    description: 'The linked user ID',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remoteData',
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
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
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
  @ApiHeader({ name: 'integrationId', required: true })
  @ApiHeader({ name: 'linkedUserId', required: true })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiBody({ type: UnifiedTicketInput, isArray: true })
  //@ApiCustomResponse(TicketResponse)
  @Post('batch')
  addTickets(
    @Body() unfiedTicketData: UnifiedTicketInput[],
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.ticketService.batchAddTickets(
      unfiedTicketData,
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
    @Body() updateTicketData: Partial<UnifiedTicketInput>,
  ) {
    return this.ticketService.updateTicket(id, updateTicketData);
  }
}
