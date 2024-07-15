import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CoreSyncService } from './sync.service';
import { LoggerService } from '../@core-services/logger/logger.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';

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
    operationId: 'getSyncStatus',
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
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Post('resync')
  async resync(
    @Body() data: { vertical: string; provider: string; linkedUserId: string },
  ) {
    const { vertical, provider, linkedUserId } = data;
    return await this.syncService.resync(vertical, provider, linkedUserId);
  }
}
