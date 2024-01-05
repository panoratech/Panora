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
import { FrontAttachmentInput, FrontAttachmentOutput } from './types';

@Injectable()
export class FrontService implements IAttachmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.attachment.toUpperCase() + ':' + FrontService.name,
    );
    this.registry.registerService('front', this);
  }

  async addAttachment(
    attachmentData: FrontAttachmentInput,
    linkedUserId: string,
  ): Promise<ApiResponse<FrontAttachmentOutput>> {
    return;
  }

  async syncAttachments(
    linkedUserId: string,
  ): Promise<ApiResponse<FrontAttachmentOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'front',
        },
      });

      const resp = await axios.get('https://api2.frontapp.com/teammates', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced front attachments !`);

      return {
        data: resp.data._results,
        message: 'Front attachments retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Front',
        TicketingObject.attachment,
        ActionType.GET,
      );
    }
  }
}
