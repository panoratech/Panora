import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { BullQueueService } from '@@core/@core-services/queues/shared.service';
import { Body, Controller, Headers, Param, Post } from '@nestjs/common';
import {
  ApiExcludeController,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('mw')
@ApiExcludeController()
@Controller('mw')
export class MWHandlerController {
  constructor(
    private readonly queues: BullQueueService,
    private loggerService: LoggerService,
  ) {
    this.loggerService.setContext(MWHandlerController.name);
  }

  @ApiOperation({
    operationId: 'handleThirdPartyWebhook',
    summary: 'Handle Third Party Webhook',
  })
  @ApiResponse({ status: 201 })
  @Post(':endpoint_uuid')
  async handleThirdPartyWebhook(
    @Body() data: any,
    @Headers() headers: any,
    @Param('endpoint_uuid') uuid: string, // Changed 'uuid' to 'endpoint_uuid'
  ) {
    this.loggerService.log(
      'Realtime Webhook Received with Payload ---- ' + JSON.stringify(data),
    );
    await this.queues.getRealtimeWebhookReceiver().add({ uuid, data, headers });
  }
}
