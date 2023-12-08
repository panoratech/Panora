import { Injectable } from '@nestjs/common';
import { PassThroughRequestDto } from './dto/passthrough.dto';
import { domains, getProviderVertical } from '@@core/utils/types';
import { PassThroughResponse } from './types';
import axios, { AxiosResponse } from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { decrypt } from '@@core/utils/crypto';

@Injectable()
export class PassthroughService {
  constructor(private prisma: PrismaService) {}

  async sendPassthroughRequest(
    requestParams: PassThroughRequestDto,
    integrationId: string,
    linkedUserId: string,
  ): Promise<PassThroughResponse> {
    const job_resp_create = await this.prisma.events.create({
      data: {
        id_event: uuidv4(), // Generate a new UUID for each job
        status: 'initialized', // Use whatever status is appropriate
        type: 'pull',
        direction: '0',
        timestamp: new Date(),
        id_linked_user: linkedUserId,
      },
    });
    const { method, path, data, headers } = requestParams;
    const URL = `${
      domains[getProviderVertical(integrationId)][integrationId]
    }${path}`;

    const connection = await this.prisma.connections.findFirst({
      where: {
        id_linked_user: linkedUserId,
      },
    });

    let response: AxiosResponse;
    try {
      response = await axios({
        method,
        url: URL,
        data,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          Authorization: `Bearer ${decrypt(connection.access_token)}`,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
    const job_resp_update = await this.prisma.events.update({
      where: {
        id_event: job_resp_create.id_event,
      },
      data: {
        status: 'written',
      },
    });

    return {
      url: URL,
      status: response.status,
      data: response.data,
    };
  }
}
