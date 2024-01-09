import { Injectable } from '@nestjs/common';
import { IUserService } from '@crm/user/types';
import {
  CrmObject,
  PipedriveUserInput,
  PipedriveUserOutput,
} from '@crm/@utils/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class PipedriveService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.user.toUpperCase() + ':' + PipedriveService.name,
    );
    this.registry.registerService('pipedrive', this);
  }

  async addUser(
    userData: PipedriveUserInput,
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveUserOutput>> {
    try {
      //TODO: check required scope  => crm.objects.users.write
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });
      const resp = await axios.post(
        `https://api.pipedrive.com/v1/persons`,
        JSON.stringify(userData),
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
        message: 'Pipedrive user created',
        statusCode: 201,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.user,
        ActionType.POST,
      );
    }
    return;
  }

  async syncUsers(
    linkedUserId: string,
  ): Promise<ApiResponse<PipedriveUserOutput[]>> {
    try {
      //TODO: check required scope  => crm.objects.users.READ
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'pipedrive',
        },
      });
      const resp = await axios.get(`https://api.pipedrive.com/v1/persons`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      return {
        data: resp.data.data,
        message: 'Pipedrive users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Pipedrive',
        CrmObject.user,
        ActionType.GET,
      );
    }
  }
}
