import { Injectable } from '@nestjs/common';
import { PassThroughRequestDto } from './dto/passthrough.dto';
import { domains, getProviderVertical } from '@@core/utils/types';
import { PassThroughResponse } from './types';
import axios, { AxiosResponse } from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '@@core/logger/logger.service';
import { handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';

@Injectable()
export class PassthroughService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
  ) {
    this.logger.setContext(PassthroughService.name);
  }

  async sendPassthroughRequest(
    requestParams: PassThroughRequestDto,
    integrationId: string,
    linkedUserId: string,
  ): Promise<PassThroughResponse> {
    try {
      const { method, path, data, headers } = requestParams;

      const job_resp_create = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'initialized', // Use whatever status is appropriate
          type: 'pull',
          method: method,
          url: '/pasthrough',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      const intId = integrationId.toLowerCase();
      const URL = `${domains[getProviderVertical(intId)][intId]}${path}`;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });

      const response: AxiosResponse = await axios({
        method,
        url: URL,
        data,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      const status_resp =
        method == 'GET'
          ? response.status === 200
            ? 'success'
            : 'fail'
          : 'POST'
          ? response.status === 200
            ? 'success'
            : 'fail'
          : 'success';

      await this.prisma.events.update({
        where: {
          id_event: job_resp_create.id_event,
        },
        data: {
          status: status_resp,
        },
      });

      return {
        url: URL,
        status: response.status,
        data: response.data,
      };
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
