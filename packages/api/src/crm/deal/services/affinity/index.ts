/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CrmObject } from '@crm/@lib/@types';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { IDealService } from '@crm/deal/types';
import { ServiceRegistry } from '../registry.service';
import { AffinityDealInput, AffinityDealOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import { OriginalDealOutput } from '@@core/utils/types/original/original.crm';

@Injectable()
export class AffinityService implements IDealService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            CrmObject.deal.toUpperCase() + ':' + AffinityService.name,
        );
        this.registry.registerService('affinity', this);
    }
    async addDeal(
        dealData: AffinityDealInput,
        linkedUserId: string,
    ): Promise<ApiResponse<AffinityDealOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'affinity',
                    vertical: 'crm',
                },
            });

            const list_resp = await axios.get(
                `${connection.account_url}/lists`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );

            for (const list of list_resp.data) {
                if (list.type === 8) {
                    dealData.list_id = list.id;
                }

            }

            const resp = await axios.post(
                `${connection.account_url}/opportunities`,
                JSON.stringify(dealData),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );

            return {
                data: resp?.data,
                message: 'Affinity deal created',
                statusCode: 201,
            };
        } catch (error) {
            throw error;
        }
    }

    async sync(data: SyncParam): Promise<ApiResponse<AffinityDealOutput[]>> {
        try {
            const { linkedUserId } = data;

            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'affinity',
                    vertical: 'crm',
                },
            });
            const resp = await axios.get(
                `${connection.account_url}/opportunities`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                });
            this.logger.log(`Synced affinity deals !`);

            return {
                data: resp?.data?.data,
                message: 'Affinity deals retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}
