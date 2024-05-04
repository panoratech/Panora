import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { CollectionService } from './services/collection.service';
import {
  UnifiedCollectionInput,
  UnifiedCollectionOutput,
} from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';

@ApiTags('ticketing/collections')
@Controller('ticketing/collections')
export class CollectionController {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly collectionService: CollectionService,
    private logger: LoggerService,
  ) {
    this.logger.setContext(CollectionController.name);
  }

  @ApiOperation({
    operationId: 'getCollections',
    summary: 'List a batch of Collections',
  })
  @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiCustomResponse(UnifiedCollectionOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async getCollections(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try {
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
        );
      return this.collectionService.getCollections(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    } catch (error) {
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'getCollection',
    summary: 'Retrieve a Collection',
    description: 'Retrieve a collection from any connected Ticketing software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the collection you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original Ticketing software.',
  })
  @ApiCustomResponse(UnifiedCollectionOutput)
  @UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  getCollection(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.collectionService.getCollection(id, remote_data);
  }
}
