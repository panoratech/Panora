import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { ITeamService } from '@ticketing/team/types';
import { GithubTeamOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class GithubService implements ITeamService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            TicketingObject.team.toUpperCase() + ':' + GithubService.name,
        );
        this.registry.registerService('github', this);
    }

    async sync(data: SyncParam): Promise<ApiResponse<GithubTeamOutput[]>> {
        try {
            const { linkedUserId } = data;

            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'github',
                    vertical: 'ticketing',
                },
            });

            const resp = await axios.get(`${connection.account_url}/user/teams`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.cryptoService.decrypt(
                        connection.access_token,
                    )}`,
                },
            });
            this.logger.log(`Synced github teams !`);

            return {
                data: resp.data,
                message: 'Github teams retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}
