/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CrmObject } from '@crm/@lib/@types';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ICompanyService } from '@crm/company/types';
import { ServiceRegistry } from '../registry.service';
import { AffinityCompanyInput, AffinityCompanyOutput } from './types';

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
            handleServiceError(
                error,
                this.logger,
                'Affinity',
                CrmObject.company,
                ActionType.POST,
            );
        }
    }

    async syncCompanies(
        linkedUserId: string,
    ): Promise<ApiResponse<AffinityCompanyOutput[]>> {
        try {
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
            handleServiceError(
                error,
                this.logger,
                'Affinity',
                CrmObject.company,
                ActionType.GET,
            );
        }
    }
}
