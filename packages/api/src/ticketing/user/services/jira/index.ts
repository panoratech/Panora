import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { IUserService } from '@ticketing/user/types';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { JiraUserOutput } from './types';

@Injectable()
export class JiraService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.user.toUpperCase() + ':' + JiraService.name,
    );
    this.registry.registerService('jira', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<JiraUserOutput[]>> {
    try {
      const { connection } = data;

      const resp = await axios.get(`${connection.account_url}/3/users/search`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      //todo: ratelimiting in jira ?
      const userEmailPromises = resp.data.map(async (user) => {
        const accountId = user.account_id;
        if (accountId) {
          const emailResp = await axios.get(
            `${connection.account_url}/3/users/email?accountId=${accountId}`,
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
            ...user,
            email: emailResp.data.email,
          };
        } else {
          return user;
        }
      });
      const dataPromise = await Promise.all(userEmailPromises);

      this.logger.log(`Synced jira users !`);

      return {
        data: dataPromise,
        message: 'Jira users retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
