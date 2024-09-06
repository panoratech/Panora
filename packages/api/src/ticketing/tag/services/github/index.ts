import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { TicketingObject } from '@ticketing/@lib/@types';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handle3rdPartyServiceError } from '@@core/utils/errors';
import { ServiceRegistry } from '../registry.service';
import { ITagService } from '@ticketing/tag/types';
import { GithubTagOutput } from './types';
import { SyncParam } from '@@core/utils/types/interface';

@Injectable()
export class GithubService implements ITagService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            TicketingObject.tag.toUpperCase() + ':' + GithubService.name,
        );
        this.registry.registerService('github', this);
    }

    async sync(data: SyncParam): Promise<ApiResponse<GithubTagOutput[]>> {
        try {
            const { linkedUserId } = data;

            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'github',
                    vertical: 'ticketing',
                },
            });

            const repos = await axios.get(`${connection.account_url}/user/repos`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.cryptoService.decrypt(
                        connection.access_token,
                    )}`,
                },
            });
            let resp: any = [];
            for (const repo of repos.data) {
                if (repo.id) {
                    const tags = await axios.get(
                        `${connection.account_url}/repos/${repo.owner.login}/${repo.name}/labels`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${this.cryptoService.decrypt(
                                    connection.access_token,
                                )}`,
                            },
                        },
                    );
                    resp = [...resp, tags.data];
                }
            }
            this.logger.log(`Synced github tags !`);

            return {
                data: resp.flat(),
                message: 'Github tags retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}
