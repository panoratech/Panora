import { Controller, Post, Body } from '@nestjs/common';
import { PassThroughRequestDto } from './@types';
import { CrmService } from './crm.service';

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  //TODO: how to know which provider we should make the call to
  @Post('passthrough')
  async passthroughRequest(@Body() requestParams: PassThroughRequestDto) {
    return this.crmService.sendPassthroughRequest(requestParams);
  }
}
