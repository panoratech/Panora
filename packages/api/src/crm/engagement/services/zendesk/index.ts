import { Injectable } from '@nestjs/common';
import { IEngagementService } from '@crm/engagement/types';
import {
  CrmObject,
  ZendeskEngagementInput,
  ZendeskEngagementOutput,
} from '@crm/@utils/@types';
import axios from 'axios';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
@Injectable()
export class ZendeskService implements IEngagementService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.engagement.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk', this);
  }

  async addEngagement(
    engagementData: ZendeskEngagementInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskEngagementOutput>> {
    try {
      //TODO: check required scope  => crm.objects.engagements.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
        },
      });
      const resp = await axios.post(
        `https://api.getbase.com/v2/engagements`,
        {
          data: engagementData,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      return {
        data: resp.data.data,
        message: 'Zendesk engagement created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.engagement,
        ActionType.POST,
      );
    }
    return;
  }

  async syncEngagements(
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskEngagementOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.engagements.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk',
        },
      });
      const resp = await axios.get(`https://api.getbase.com/v2/engagements`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      const finalData = resp.data.items.map((item) => {
        return item.data;
      });
      this.logger.log(`Synced zendesk engagements !`);

      return {
        data: finalData,
        message: 'Zendesk engagements retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        CrmObject.engagement,
        ActionType.GET,
      );
    }
  }
}
