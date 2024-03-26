/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CrmObject } from '@crm/@utils/@types';
import { FreshsalesUserOutput } from './types';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { IUserService } from '@crm/user/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class FreshsalesService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      CrmObject.user.toUpperCase() + ':' + FreshsalesService.name,
    );
    this.registry.registerService('freshsales', this);
  }

  async syncUsers(
    linkedUserId: string,
  ): Promise<ApiResponse<FreshsalesUserOutput[]>> {
    try {
      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
        },
      });
      const resp = await axios.get(`https://domain.freshsales.io/api/users`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      return {
        data: resp.data,
        message: 'Freshsales users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      handleServiceError(
        error,
        this.logger,
        'Freshsales',
        CrmObject.user,
        ActionType.GET,
      );
    }
  }
}
