import { Injectable } from '@nestjs/common';
import { IUserService } from '@crm/user/types';
import { CrmObject } from '@crm/@lib/@types';
import { AffinityUserOutput } from './types';
import axios from 'axios';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import { ServiceRegistry } from '../registry.service';

@Injectable()
export class AffinityService implements IUserService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            CrmObject.user.toUpperCase() + ':' + AffinityService.name,
        );
        this.registry.registerService('close', this);
    }

    async syncUsers(
        linkedUserId: string,
        custom_properties?: string[],
    ): Promise<ApiResponse<AffinityUserOutput[]>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'close',
                    vertical: 'crm',
                },
            });

            const resp = await axios.get(
                `${connection.account_url}/auth/whoami`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                });

            this.logger.log(`Synced close users !`);

            return {
                data: resp?.data,
                message: 'Affinity users retrieved',
                statusCode: 200,
            };
        } catch (error) {
            handleServiceError(
                error,
                this.logger,
                'Affinity',
                CrmObject.user,
                ActionType.GET,
            );
        }
    }
}
