import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { MagicLinkService } from './magic-link.service';
import { CreateMagicLinkDto } from './dto/create-magic-link.dto';
import {
  ApiBody,
  ApiExcludeController,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
@ApiTags('magic_links')
@ApiExcludeController()
@Controller('magic_links')
export class MagicLinkController {
  constructor(
    private readonly magicLinkService: MagicLinkService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(MagicLinkController.name);
  }

  @ApiOperation({
    operationId: 'createMagicLink',
    summary: 'Create Magic Links',
  })
  @ApiBody({ type: CreateMagicLinkDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post()
  createLink(@Body() data: CreateMagicLinkDto) {
    return this.magicLinkService.createUniqueLink(data);
  }

  @ApiOperation({
    operationId: 'getMagicLinks',
    summary: 'List Magic Links',
  })
  @ApiResponse({ status: 200 })
  @Get()
  getMagicLinks() {
    return this.magicLinkService.getMagicLinks();
  }

  @ApiOperation({
    operationId: 'getMagicLink',
    summary: 'Retrieve Magic Links',
  })
  @ApiQuery({ name: 'id', required: true, type: String })
  @ApiResponse({ status: 200 })
  @Get('single')
  getMagicLink(@Query('id') id: string) {
    return this.magicLinkService.getMagicLink(id);
  }
}
