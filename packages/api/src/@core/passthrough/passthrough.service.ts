import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { CategoryConnectionRegistry } from '@@core/@core-services/registries/connections-categories.registry';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { PassThroughRequestDto } from './dto/passthrough.dto';
import { PassthroughResponse } from './types';

@Injectable()
export class PassthroughService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private categoryConnectionRegistry: CategoryConnectionRegistry,
  ) {
    this.logger.setContext(PassthroughService.name);
  }

  async sendPassthroughRequest(
    requestParams: PassThroughRequestDto,
    integrationId: string,
    linkedUserId: string,
    vertical: string,
    connectionId: string,
    projectId: string,
  ): Promise<PassthroughResponse> {
    try {
      const {
        method,
        path,
        data,
        request_format = 'JSON',
        overrideBaseUrl,
        headers,
      } = requestParams;

      const job_resp_create = await this.prisma.events.create({
        data: {
          id_connection: connectionId,
          id_project: projectId,
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

      const service = this.categoryConnectionRegistry.getService(
        vertical.toLowerCase(),
      );
      const response = await service.passthrough(
        {
          method,
          path,
          headers,
          req_type: request_format,
          overrideBaseUrl: overrideBaseUrl,
          data: data,
        },
        connectionId,
      );
      let status;
      if ('retryId' in response) {
        //failed
        status = 429;
      }
      await this.prisma.events.update({
        where: {
          id_event: job_resp_create.id_event,
        },
        data: {
          status: String(status) || String((response as AxiosResponse).status),
        },
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
}
