import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import {
  TicketingObject,
  ZendeskAttachmentInput,
  ZendeskAttachmentOutput,
} from '@ticketing/@utils/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { EnvironmentService } from '@@core/environment/environment.service';
import { ServiceRegistry } from '../registry.service';
import { IAttachmentService } from '@ticketing/attachment/types';
import { OriginalAttachmentOutput } from '@@core/utils/types/original/original.ticketing';

@Injectable()
export class ZendeskService implements IAttachmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.attachment.toUpperCase() + ':' + ZendeskService.name,
    );
    this.registry.registerService('zendesk_t', this);
  }

  addAttachment(
    attachmentData: ZendeskAttachmentInput,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskAttachmentOutput>> {
    return;
  }
  async syncAttachments(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<ZendeskAttachmentOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'zendesk_t',
        },
      });

      const resp = await axios.get(
        `https://${this.env.getZendeskTicketingSubdomain()}.zendesk.com/api/v2/attachments`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );
      this.logger.log(`Synced zendesk attachments !`);

      return {
        data: resp.data.attachments,
        message: 'Zendesk attachments retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Zendesk',
        TicketingObject.attachment,
        ActionType.GET,
      );
    }
  }
}
