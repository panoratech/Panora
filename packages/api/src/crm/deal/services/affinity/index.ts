import { Injectable } from '@nestjs/common';
import { IDealService } from '@crm/deal/types';
import { CrmObject } from '@crm/@lib/@types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';
import { AffinityDealInput, AffinityDealOutput } from './types';
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
            handleServiceError(
                error,
                this.logger,
                'Affinity',
                CrmObject.deal,
                ActionType.POST,
            );
        }
    }

    async syncDeals(
        linkedUserId: string,
        custom_properties?: string[],
    ): Promise<ApiResponse<AffinityDealOutput[]>> {
        try {
            //crm.schemas.deals.read","crm.objects.deals.read
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'affinity',
                    vertical: 'crm',
                },
            });

            const baseURL = `${connection.account_url}/opportunity/`;
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
            handleServiceError(
                error,
                this.logger,
                'Affinity',
                CrmObject.deal,
                ActionType.GET,
            );
        }
    }
}
