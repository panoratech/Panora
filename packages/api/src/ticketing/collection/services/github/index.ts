import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { ICollectionService } from '@ticketing/collection/types';
import { GithubCollectionInput, GithubCollectionOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class GithubService implements ICollectionService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            TicketingObject.collection.toUpperCase() + ':' + GithubService.name,
        );
        this.registry.registerService('github', this);
    }

    async sync(data: SyncParam): Promise<ApiResponse<GithubCollectionOutput[]>> {
        try {
            const { linkedUserId } = data;

            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'github',
                    vertical: 'ticketing',
                },
            });
            const resp = await axios.get(
                `${connection.account_url}/user/repos`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );
            this.logger.log(`Synced github collections !`);

            return {
                data: resp.data,
                message: 'Github collections retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}
