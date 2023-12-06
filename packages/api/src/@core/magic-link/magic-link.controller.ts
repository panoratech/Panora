import { LoggerService } from '@@core/logger/logger.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MagicLinkService } from './magic-link.service';
import { CreateMagicLinkDto } from './dto/create-magic-link.dto';

@Controller('magic-link')
export class MagicLinkController {
  constructor(
    private readonly magicLinkService: MagicLinkService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(MagicLinkController.name);
  }

  @Post('create')
  createLink(@Body() data: CreateMagicLinkDto) {
    return this.magicLinkService.createUniqueLink(data);
  }

  @Get()
  getMagicLinks() {
    return this.magicLinkService.getMagicLinks();
  }

  @Get()
  getMagicLink(@Query('id') id: string) {
    return this.magicLinkService.getMagicLink(id);
  }
}
