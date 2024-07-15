import { Body, Controller, Post, Query } from '@nestjs/common';
import { PassThroughRequestDto } from './dto/passthrough.dto';
import { PassThroughResponse } from './types';
import { PassthroughService } from './passthrough.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('passthrough')
@Controller('passthrough')
export class PassthroughController {
  constructor(
    private passthroughService: PassthroughService,
    private loggerSeervice: LoggerService,
  ) {
    this.loggerSeervice.setContext(PassthroughController.name);
  }

  @ApiOperation({
    operationId: 'passthroughRequest',
    summary: 'Make a passthrough request',
  })
  @ApiQuery({ name: 'integrationId', required: true, type: String })
  @ApiQuery({ name: 'linkedUserId', required: true, type: String })
  @ApiQuery({ name: 'vertical', required: true, type: String })
  @ApiBody({ type: PassThroughRequestDto })
  @ApiResponse({ status: 200, type: PassThroughResponse })
  @Post()
  async passthroughRequest(
    @Query('integrationId') integrationId: string,
    @Query('linkedUserId') linkedUserId: string,
    @Query('vertical') vertical: string,
    @Body() requestParams: PassThroughRequestDto,
  ): Promise<PassThroughResponse> {
    return this.passthroughService.sendPassthroughRequest(
      requestParams,
      integrationId,
      linkedUserId,
      vertical,
    );
  }
}
