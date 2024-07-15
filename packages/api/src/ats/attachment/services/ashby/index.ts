import { Injectable } from '@nestjs/common';
import { AtsObject } from '@ats/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { AshbyAttachmentInput, AshbyAttachmentOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import { IAttachmentService } from '@ats/attachment/types';
import { AttachmentType } from '@ats/attachment/types/model.unified';
import * as fs from 'fs';
import * as FormData from 'form-data';

@Injectable()
export class AshbyService implements IAttachmentService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      AtsObject.attachment.toUpperCase() + ':' + AshbyService.name,
    );
    this.registry.registerService('ashby', this);
  }
  async addAttachment(
    attachmentData: AshbyAttachmentInput,
    linkedUserId: string,
    attachment_type: AttachmentType,
  ): Promise<ApiResponse<AshbyAttachmentOutput>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'ashby',
          vertical: 'ats',
        },
      });
      let resp;
      let result: AshbyAttachmentOutput[] = [];
      const formData = new FormData();
      if (attachment_type === 'RESUME') {
        formData.append('resume', fs.createReadStream(attachmentData.file));
        resp = await axios.post(
          `${connection.account_url}/candidate.uploadResume`,
          JSON.stringify(formData),
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${this.cryptoService.decrypt(
                connection.access_token,
              )}`,
            },
          },
        );
        result = [resp.data.results.resumeFileHandle];
      } else {
        formData.append('file', fs.createReadStream(attachmentData.file));
        resp = await axios.post(
          `${connection.account_url}/candidate.uploadFile`,
          JSON.stringify(formData),
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${this.cryptoService.decrypt(
                connection.access_token,
              )}`,
            },
          },
        );
        result = resp.data.results.fileHandles;
      }

      return {
        data: result,
        message: 'Ashby attachment created',
        statusCode: 201,
      };
    } catch (error) {
      throw error;
    }
  }

  async sync(data: SyncParam): Promise<ApiResponse<AshbyAttachmentOutput[]>> {
    return;
  }
}
