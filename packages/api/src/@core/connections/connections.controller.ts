import {
  Controller,
  Get,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { Response } from 'express';

import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CategoryConnectionRegistry } from '@@core/@core-services/registries/connections-categories.registry';
import { ApiKeyAuthGuard } from '@@core/auth/guards/api-key.guard';
import { JwtAuthGuard } from '@@core/auth/guards/jwt-auth.guard';
import { CoreSyncService } from '@@core/sync/sync.service';
import { ApiGetArrayCustomResponse } from '@@core/utils/dtos/openapi.respone.dto';
import { ConnectionsError } from '@@core/utils/errors';
import { AuthStrategy, CONNECTORS_METADATA } from '@panora/shared';
import { Connection } from './@utils/types';

export type StateDataType = {
  projectId: string;
  vertical: string;
  linkedUserId: string;
  providerName: string;
  returnUrl?: string;
  [key: string]: any;
};

export class BodyDataType {
  apikey: string;
  [key: string]: any;
}

@ApiTags('connections')
@Controller('connections')
export class ConnectionsController {
  constructor(
    private categoryConnectionRegistry: CategoryConnectionRegistry,
    private coreSync: CoreSyncService,
    private logger: LoggerService,
    private prisma: PrismaService,
  ) {
    this.logger.setContext(ConnectionsController.name);
  }

  @ApiOperation({
    operationId: 'handleOAuthCallback',
    summary: 'Capture oAuth callback',
  })
  @ApiQuery({ name: 'state', required: true, type: String })
  @ApiQuery({ name: 'code', required: true, type: String })
  @ApiResponse({ status: 200 })
  @ApiExcludeEndpoint()
  @Get('oauth/callback')
  async handleOAuthCallback(@Res() res: Response, @Query() query: any) {
    try {
      const { state, code, spapi_oauth_code, ...otherQueryParams } = query;

      if (!code && !spapi_oauth_code) {
        throw new ConnectionsError({
          name: 'OAUTH_CALLBACK_CODE_NOT_FOUND_ERROR',
          message: `No Callback Params found for code, found ${
            code || spapi_oauth_code
          }`,
        });
      }

      if (!state) {
        throw new ConnectionsError({
          name: 'OAUTH_CALLBACK_STATE_NOT_FOUND_ERROR',
          message: `No Callback Params found for state, found ${state}`,
        });
      }

      const stateData: StateDataType = this.parseStateData(state);

      const {
        projectId,
        vertical,
        linkedUserId,
        providerName,
        returnUrl,
        ...dynamicStateParams
      } = stateData;

      const service = this.categoryConnectionRegistry.getService(
        vertical.toLowerCase(),
      );
      await service.handleCallBack(
        providerName,
        {
          linkedUserId,
          projectId,
          code,
          spapi_oauth_code,
          ...otherQueryParams,
          ...dynamicStateParams,
        },
        'oauth2',
      );

      if (providerName === 'shopify') {
        service.redirectUponConnection(res, ...otherQueryParams);
      } else {
        res.redirect(returnUrl);
      }

      await this.triggerInitialCoreSync(vertical, providerName, linkedUserId);
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({
    operationId: 'handleApiKeyCallback',
    summary: 'Capture api key or basic auth callback',
  })
  @ApiExcludeEndpoint()
  @ApiQuery({ name: 'state', required: true, type: String })
  @ApiBody({ type: BodyDataType })
  @ApiResponse({ status: 201 })
  @Post('basicorapikey/callback')
  async handleApiKeyCallback(
    @Res() res: Response,
    @Query() query: any,
    @Body() body: BodyDataType,
  ) {
    try {
      const { state } = query;
      if (!state) {
        throw new ConnectionsError({
          name: 'API_CALLBACK_STATE_NOT_FOUND_ERROR',
          message: `No Callback Params found for state, found ${state}`,
        });
      }

      const stateData: StateDataType = JSON.parse(decodeURIComponent(state));
      const { projectId, vertical, linkedUserId, providerName } = stateData;

      const strategy =
        CONNECTORS_METADATA[vertical.toLowerCase()][providerName.toLowerCase()]
          .authStrategy.strategy;
      const strategy_type =
        strategy === AuthStrategy.api_key ? 'apikey' : 'basic';

      const service = this.categoryConnectionRegistry.getService(
        vertical.toLowerCase(),
      );
      await service.handleCallBack(
        providerName,
        { projectId, linkedUserId, body },
        strategy_type,
      );

      res.redirect('/');
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({ operationId: 'getConnections', summary: 'List Connections' })
  @ApiExcludeEndpoint()
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Get('internal')
  async list_internal(@Request() req: any) {
    try {
      const { id_project } = req.user;
      return await this.prisma.connections.findMany({
        where: { id_project },
      });
    } catch (error) {
      throw error;
    }
  }

  @ApiOperation({
    operationId: 'listConnections',
    summary: 'List Connections',
  })
  @ApiGetArrayCustomResponse(Connection)
  @UseGuards(ApiKeyAuthGuard)
  @Get()
  async list(@Request() req: any) {
    try {
      const { id_project } = req.user;
      return await this.prisma.connections.findMany({
        where: { id_project },
      });
    } catch (error) {
      throw error;
    }
  }

  private parseStateData(state: string): StateDataType {
    if (state.includes('&quot;') || state.includes('&amp;')) {
      const decodedState = state.replace(/&quot;/g, '"').replace(/&amp;/g, '&');
      return JSON.parse(decodedState);
    } else if (
      state.includes('deel_delimiter') ||
      state.includes('squarespace_delimiter')
    ) {
      const [, base64Part] = decodeURIComponent(state).split(
        /deel_delimiter|squarespace_delimiter/,
      );
      const jsonString = Buffer.from(base64Part, 'base64').toString('utf-8');
      return JSON.parse(jsonString);
    } else {
      return JSON.parse(state);
    }
  }

  private async triggerInitialCoreSync(
    vertical: string,
    providerName: string,
    linkedUserId: string,
  ) {
    const isActive =
      CONNECTORS_METADATA[vertical.toLowerCase()][providerName.toLowerCase()]
        .active !== false;
    if (isActive) {
      this.logger.log('Triggering initial core sync for all objects...');
      await this.coreSync.initialSync(
        vertical.toLowerCase(),
        providerName,
        linkedUserId,
      );
    }
  }
}
