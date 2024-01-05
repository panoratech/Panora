import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@utils/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { IAttachmentService } from '@ticketing/attachment/types';
import { GithubAttachmentInput, GithubAttachmentOutput } from './types';

//TODO
@Injectable()
export class GithubService implements IAttachmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.attachment.toUpperCase() + ':' + GithubService.name,
    );
    this.registry.registerService('github', this);
  }
  async addAttachment(
    attachmentData: GithubAttachmentInput,
    linkedUserId: string,
  ): Promise<ApiResponse<GithubAttachmentOutput>> {
    return;
  }
  async syncAttachments(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<GithubAttachmentOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'github',
        },
      });
      const resp = await axios.get(`https://api.github.com/attachments`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced github attachments !`);

      return {
        data: resp.data,
        message: 'Github attachments retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Github',
        TicketingObject.attachment,
        ActionType.GET,
      );
    }
  }
}
