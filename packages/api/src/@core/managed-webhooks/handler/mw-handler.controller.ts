import { Body, Controller, Post, Param, Headers } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@ApiTags('mw')
@Controller('mw')
export class MWHandlerController {
  constructor(
    @InjectQueue('realTimeWebhookQueue') private queue: Queue,
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
    await this.queue.add({ uuid, data, headers });
  }
}
