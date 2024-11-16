import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiResponse,
  ApiTags,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { LoggerService } from '../@core-services/logger/logger.service';
import { CoreSyncService } from './sync.service';
import { ApiPostCustomResponse } from '@@core/utils/dtos/openapi.respone.dto';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

export class UpdatePullFrequencyDto {
  @ApiProperty({
    type: Number,
    example: 1800,
    description: 'Frequency in seconds',
  })
  crm?: number;

  @ApiProperty({
    type: Number,
    example: 14400,
    description: 'Frequency in seconds',
  })
  accounting?: number;

  @ApiProperty({
    type: Number,
    example: 28800,
    description: 'Frequency in seconds',
  })
  filestorage?: number;

  @ApiProperty({
    type: Number,
    example: 43200,
    description: 'Frequency in seconds',
  })
  ecommerce?: number;

  @ApiProperty({
    type: Number,
    example: 86400,
    description: 'Frequency in seconds',
  })
  ticketing?: number;
}
export class ResyncStatusDto {
  @ApiProperty({ type: Date, example: '', nullable: true })
  timestamp: Date;

  @ApiProperty({
    type: String,
    example: 'ticketing',
    enum: [
      'ticketing',
      'accounting',
      'crm',
      'filestorage',
      'ecommerce',
      'marketingautomation',
    ],
    nullable: true,
  })
  vertical: string;

  @ApiProperty({ type: String, example: 'gitlab', nullable: true })
  provider: string;

  @ApiProperty({
    type: String,
    example: 'success',
    enum: ['success', 'fail'],
    nullable: true,
  })
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
  @ApiParam({
    name: 'vertical',
    type: String,
    example: 'ticketing',
    enum: [
      'ticketing',
      'marketingautomation',
      'crm',
      'filestorage',
      'accounting',
      'ecommerce',
    ],
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

  @ApiOperation({
    operationId: 'updatePullFrequency',
    summary: 'Update pull frequency for verticals',
  })
  @ApiResponse({
    status: 200,
    description: 'Pull frequency updated successfully',
  })
  @UseGuards(JwtAuthGuard)
  @ApiExcludeEndpoint()
  @Post('internal/pull_frequencies')
  async updateInternalPullFrequency(
    @Request() req: any,
    @Body() data: UpdatePullFrequencyDto,
  ) {
    const projectId = req.user.id_project;
    const result = await this.syncService.updatePullFrequency(data, projectId);

    // Convert BigInt values to numbers or strings
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );

    return serializedResult;
  }

  @ApiOperation({
    operationId: 'updatePullFrequency',
    summary: 'Update pull frequency for verticals',
  })
  @ApiResponse({
    status: 200,
    description: 'Pull frequency updated successfully',
  })
  @UseGuards(ApiKeyAuthGuard)
  @Post('pull_frequencies')
  async updatePullFrequency(
    @Request() req: any,
    @Body() data: UpdatePullFrequencyDto,
  ) {
    const projectId = req.user.id_project;
    const result = await this.syncService.updatePullFrequency(data, projectId);

    // Convert BigInt values to numbers or strings
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );

    return serializedResult;
  }

  @ApiOperation({
    operationId: 'getPullFrequency',
    summary: 'Get pull frequency for verticals',
  })
  @ApiResponse({ status: 200, type: UpdatePullFrequencyDto })
  @UseGuards(JwtAuthGuard)
  @ApiExcludeEndpoint()
  @Get('internal/pull_frequencies')
  async getInternalPullFrequency(@Request() req: any) {
    const projectId = req.user.id_project;
    const result = await this.syncService.getPullFrequency(projectId);
    // Convert BigInt values to numbers or strings
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );

    return serializedResult;
  }

  @ApiOperation({
    operationId: 'getPullFrequency',
    summary: 'Get pull frequency for verticals',
  })
  @ApiResponse({ status: 200, type: UpdatePullFrequencyDto })
  @UseGuards(ApiKeyAuthGuard)
  @Get('pull_frequencies')
  async getPullFrequency(@Request() req: any) {
    const projectId = req.user.id_project;
    const result = await this.syncService.getPullFrequency(projectId);
    // Convert BigInt values to numbers or strings
    const serializedResult = JSON.parse(
      JSON.stringify(result, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value,
      ),
    );

    return serializedResult;
  }
}
