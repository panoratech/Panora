import { LoggerService } from '@@core/logger/logger.service';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { MagicLinkService } from './magic-link.service';
import { CreateMagicLinkDto } from './dto/create-magic-link.dto';
import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
@ApiTags('magic-links')
@Controller('magic-links')
export class MagicLinkController {
  constructor(
    private readonly magicLinkService: MagicLinkService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(MagicLinkController.name);
  }

  @ApiOperation({
    operationId: 'createMagicLink',
    summary: 'Create a Magic Link',
  })
  @ApiBody({ type: CreateMagicLinkDto })
  @ApiResponse({ status: 201 })
  @UseGuards(JwtAuthGuard)
  @Post()
  createLink(@Body() data: CreateMagicLinkDto) {
    return this.magicLinkService.createUniqueLink(data);
  }

  @ApiOperation({
    operationId: 'list',
    summary: 'Retrieve Magic Links',
  })
  @ApiResponse({ status: 200 })
  @Get()
  list() {
    return this.magicLinkService.getMagicLinks();
  }

  @ApiOperation({
    operationId: 'retrieve',
    summary: 'Retrieve a Magic Link',
  })
  @ApiQuery({ name: 'id', required: true, type: String })
  @ApiResponse({ status: 200 })
  @Get('single')
  retrieve(@Query('id') id: string) {
    return this.magicLinkService.getMagicLink(id);
  }
}
