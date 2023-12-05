import { LoggerService } from '@@core/logger/logger.service';
import { Body, Controller, Post } from '@nestjs/common';
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
}
