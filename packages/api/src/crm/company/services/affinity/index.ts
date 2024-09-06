/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CrmObject } from '@crm/@lib/@types';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ICompanyService } from '@crm/company/types';
import { ServiceRegistry } from '../registry.service';
import { AffinityCompanyInput, AffinityCompanyOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';
import { OriginalCompanyOutput } from '@@core/utils/types/original/original.crm';

@Injectable()
export class AffinityService implements ICompanyService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            CrmObject.company.toUpperCase() + ':' + AffinityService.name,
        );
        this.registry.registerService('affinity', this);
    }
    async addCompany(
        companyData: AffinityCompanyInput,
        linkedUserId: string,
    ): Promise<ApiResponse<AffinityCompanyOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'affinity',
                    vertical: 'crm',
                },
            });

            const resp = await axios.post(
                `${connection.account_url}/organizations`,
                JSON.stringify({
                    data: companyData,
                }),
                {
                    headers: {
                        Authorization: `Basic ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                        'Content-Type': 'application/json',
                    },
                },
            );
            return {
                data: resp.data,
                message: 'Affinity company created',
                statusCode: 201,
            };
        } catch (error) {
            throw error;
        }
    }

    async sync(data: SyncParam): Promise<ApiResponse<AffinityCompanyOutput[]>> {
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
                `${connection.account_url}/organizations`,
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
                data: resp.data,
                message: 'Affinity companies retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}
