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
    UsePipes,
    ValidationPipe,
  } from '@nestjs/common';
  import { LoggerService } from '@@core/@core-services/logger/logger.service';
  import {
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiHeader,
    ApiBearerAuth,
  } from '@nestjs/swagger';
  import { ApiCustomResponse } from '@@core/utils/types';
  import { OpportunityService } from './services/opportunity.service';
  import {
    UnifiedOpportunityInput,
    UnifiedOpportunityOutput,
  } from './types/model.unified';
  import { ConnectionUtils } from '@@core/connections/@utils';
  import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
  import { FetchObjectsQueryDto } from '@@core/utils/dtos/fetch-objects-query.dto';
  
  @ApiBearerAuth('JWT')
  @ApiTags('crm/opportunities')
  @Controller('crm/opportunities')
  export class OpportunityController {
    constructor(
      private readonly opportunityService: OpportunityService,
      private logger: LoggerService,
      private connectionUtils: ConnectionUtils,
    ) {
      this.logger.setContext(OpportunityController.name);
    }
  
    @ApiOperation({
      operationId: 'getOpportunities',
      summary: 'List a batch of Opportunities',
    })
    @ApiHeader({
      name: 'x-connection-token',
      required: true,
      description: 'The connection token',
      example: 'b008e199-eda9-4629-bd41-a01b6195864a',
    })
    @ApiCustomResponse(UnifiedOpportunityOutput)
    @UseGuards(ApiKeyAuthGuard)
    @Get()
    @UsePipes(new ValidationPipe({ transform: true, disableErrorMessages: false }))
    async getOpportunities(
      @Headers('x-connection-token') connection_token: string,
      @Query() query: FetchObjectsQueryDto,
    ) {
      try {
        const { linkedUserId, remoteSource, connectionId } =
          await this.connectionUtils.getConnectionMetadataFromConnectionToken(
            connection_token,
          );
        const { remote_data, limit, cursor } = query;
  
        return this.opportunityService.getOpportunities(
          connectionId,
          remoteSource,
          linkedUserId,
          limit,
          remote_data,
          cursor,
        );
      } catch (error) {
        this.logger.error('Error in getOpportunities method', error.stack);
        throw new InternalServerErrorException('Failed to retrieve opportunities');
      }
    }
  
    @ApiOperation({
      operationId: 'getOpportunity',
      summary: 'Retrieve an Opportunity',
      description: 'Retrieve an opportunity from any connected CRM software',
    })
    @ApiParam({
      name: 'id',
      required: true,
      type: String,
      description: 'ID of the opportunity you want to retrieve.',
    })
    @ApiQuery({
      name: 'remote_data',
      required: false,
      type: Boolean,
      description: 'Set to true to include data from the original CRM software.',
    })
    @ApiHeader({
      name: 'x-connection-token',
      required: true,
      description: 'The connection token',
      example: 'b008e199-eda9-4629-bd41-a01b6195864a',
    })
    @ApiCustomResponse(UnifiedOpportunityOutput)
    @UseGuards(ApiKeyAuthGuard)
    @Get(':id')
    async retrieve(
      @Headers('x-connection-token') connection_token: string,
      @Param('id') id: string,
      @Query('remote_data') remote_data?: boolean,
    ) {
      try {
        const { linkedUserId, remoteSource } =
          await this.connectionUtils.getConnectionMetadataFromConnectionToken(
            connection_token,
          );
        return this.opportunityService.getOpportunity(
          id,
          linkedUserId,
          remoteSource,
          remote_data,
        );
      } catch (error) {
        this.logger.error('Error in retrieve method', error.stack);
        throw new InternalServerErrorException('Failed to retrieve opportunity');
      }
    }
  
    @ApiOperation({
      operationId: 'addOpportunity',
      summary: 'Create an Opportunity',
      description: 'Create an opportunity in any supported CRM software',
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
      description: 'Set to true to include data from the original CRM software.',
    })
    @ApiBody({ type: UnifiedOpportunityInput })
    @ApiCustomResponse(UnifiedOpportunityOutput)
    @UseGuards(ApiKeyAuthGuard)
    @Post()
    async addOpportunity(
      @Body() unifiedOpportunityData: UnifiedOpportunityInput,
      @Headers('x-connection-token') connection_token: string,
      @Query('remote_data') remote_data?: boolean,
    ) {
      try {
        const { linkedUserId, remoteSource, connectionId } =
          await this.connectionUtils.getConnectionMetadataFromConnectionToken(
            connection_token,
          );
        return this.opportunityService.addOpportunity(
          unifiedOpportunityData,
          connectionId,
          remoteSource,
          linkedUserId,
          remote_data,
        );
      } catch (error) {
        this.logger.error('Error in addOpportunity method', error.stack);
        throw new InternalServerErrorException('Failed to create opportunity');
      }
    }
  }
  