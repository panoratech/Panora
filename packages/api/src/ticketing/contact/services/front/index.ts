import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { IContactService } from '@ticketing/contact/types';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { FrontContactOutput } from './types';

@Injectable()
export class FrontService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      TicketingObject.contact.toUpperCase() + ':' + FrontService.name,
    );
    this.registry.registerService('front', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<FrontContactOutput[]>> {
    try {
      const { linkedUserId, account_id, webhook_remote_identifier } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'front',
          vertical: 'ticketing',
        },
      });
      /*let remote_account_id;
      if (account_id) {
        // account_id can either be the remote or the panora id
        // if the call is made from real time webhook trigger then it is a remote id
        const res = await this.prisma.tcg_accounts.findFirst({
          where: {
            id_tcg_account: account_id,
          },
        });
        if (res) {
          remote_account_id = res.remote_id;
        }
      }*/

      const resp = await axios.get(`${connection.account_url}/contacts`, {
        headers: {
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });
      this.logger.log(`Synced front contacts !`);

      return {
        data: resp.data._results,
        message: 'Front contacts retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
