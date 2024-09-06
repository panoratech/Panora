import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { CrmObject } from '@crm/@lib/@types';
import { IUserService } from '@crm/user/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { AffinityUserOutput } from './types';

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
        this.registry.registerService('affinity', this);
    }

    async sync(data: SyncParam): Promise<ApiResponse<AffinityUserOutput[]>> {
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
            throw error;
        }
    }
}
