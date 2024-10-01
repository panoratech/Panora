import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { AtsObject } from '@ats/@lib/@types';
import { IOfferService } from '@ats/offer/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { AshbyOfferOutput } from './types';

@Injectable()
export class AshbyService implements IOfferService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      AtsObject.offer.toUpperCase() + ':' + AshbyService.name,
    );
    this.registry.registerService('ashby', this);
  }

  async sync(data: SyncParam): Promise<ApiResponse<AshbyOfferOutput[]>> {
    try {
      const { connection } = data;

      const resp = await axios.post(`${connection.account_url}/offer.list`, {
        headers: {
          'Content-Type': 'offer/json',
          Authorization: `Basic ${Buffer.from(
            `${this.cryptoService.decrypt(connection.access_token)}:`,
          ).toString('base64')}`,
        },
      });
      const offers: AshbyOfferOutput[] = resp.data.results;
      this.logger.log(`Synced ashby offers !`);

      return {
        data: offers,
        message: 'Ashby offers retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
