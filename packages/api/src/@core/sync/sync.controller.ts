import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoggerService } from '../@core-services/logger/logger.service';
import { CoreSyncService } from './sync.service';
import { ApiPostCustomResponse } from '@@core/utils/dtos/openapi.respone.dto';

export class ResyncStatusDto {
  @ApiProperty({ type: Date, nullable: true })
  timestamp: Date;

  @ApiProperty({ type: String, nullable: true })
  vertical: string;

  @ApiProperty({ type: String, nullable: true })
  provider: string;

  @ApiProperty({ type: String, nullable: true })
  status: string;
}
@ApiTags('sync')
@Controller('sync')
export class SyncController {
  constructor(
    private readonly syncService: CoreSyncService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(SyncController.name);
  }

  @ApiOperation({
    operationId: 'status',
    summary: 'Retrieve sync status of a certain vertical',
  })
  @ApiResponse({ status: 200 })
  @Get('status/:vertical')
  getSyncStatus(@Param('vertical') vertical: string) {
    return this.syncService.getSyncStatus(vertical);
  }

  //this route must be protected for premium users (regular sync is one every 24 hours)
  @ApiOperation({
    operationId: 'resync',
    summary: 'Resync common objects across a vertical',
  })
  @ApiPostCustomResponse(ResyncStatusDto)
  @UseGuards(JwtAuthGuard)
  @Post('resync')
  async resync(
    @Body() data: { vertical: string; provider: string; linkedUserId: string },
  ) {
    const { vertical, provider, linkedUserId } = data;
    return await this.syncService.resync(vertical, provider, linkedUserId);
  }
}
