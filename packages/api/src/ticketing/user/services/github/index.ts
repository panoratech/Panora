import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { IUserService } from '@ticketing/user/types';
import { GithubUserOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class GithubService implements IUserService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            TicketingObject.user.toUpperCase() + ':' + GithubService.name,
        );
        this.registry.registerService('github', this);
    }

    async sync(data: SyncParam): Promise<ApiResponse<GithubUserOutput[]>> {
        const { linkedUserId } = data;

        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'github',
                    vertical: 'ticketing',
                },
            });

            const resp = await axios.get(`${connection.account_url}/users`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.cryptoService.decrypt(
                        connection.access_token,
                    )}`,
                },
            });
            this.logger.log(`Synced github users !`);

            return {
                data: resp.data,
                message: 'github users retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}
