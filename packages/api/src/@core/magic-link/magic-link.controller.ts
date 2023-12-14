import { LoggerService } from '@@core/logger/logger.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MagicLinkService } from './magic-link.service';
import { CreateMagicLinkDto } from './dto/create-magic-link.dto';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('magic-link')
@Controller('magic-link')
export class MagicLinkController {
  constructor(
    private readonly magicLinkService: MagicLinkService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(MagicLinkController.name);
  }

  @ApiBody({ type: CreateMagicLinkDto })
  @ApiResponse({ status: 201 })
  @Post('create')
  createLink(@Body() data: CreateMagicLinkDto) {
    return this.magicLinkService.createUniqueLink(data);
  }

  @ApiResponse({ status: 200 })
  @Get()
  getMagicLinks() {
    return this.magicLinkService.getMagicLinks();
  }

  @ApiQuery({ name: 'id', required: true, type: String })
  @ApiResponse({ status: 200 })
  @Get('single')
  getMagicLink(@Query('id') id: string) {
    return this.magicLinkService.getMagicLink(id);
  }
}
