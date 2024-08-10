import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@lib/@types';
import { Utils } from '@ticketing/@lib/@utils';
import { ICommentService } from '@ticketing/comment/types';
import axios from 'axios';
import * as fs from 'fs';
import { ServiceRegistry } from '../registry.service';
import { GithubCommentInput, GithubCommentOutput } from './types';
import { GithubTicketOutput } from '@ticketing/ticket/services/github/types';

@Injectable()
export class GithubService implements ICommentService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
        private utils: Utils,
    ) {
        this.logger.setContext(
            TicketingObject.comment.toUpperCase() + ':' + GithubService.name,
        );
        this.registry.registerService('github', this);
    }

    async addComment(
        commentData: GithubCommentInput,
        linkedUserId: string,
        remoteIdTicket: string,
    ): Promise<ApiResponse<GithubCommentOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'github',
                    vertical: 'ticketing',
                },
            });

            // Here Github represent Attachment as URL in body of comment as Markdown so we do not have to store in attachement unified object.


            const ticket = await this.prisma.tcg_tickets.findFirst({
                where: {
                    remote_id: remoteIdTicket,
                    id_connection: connection.id_connection,
                },
                select: {
                    collections: true,
                    id_tcg_ticket: true,
                },
            });



            // Retrieve the uuid of issue from remote_data
            const remote_data = await this.prisma.remote_data.findFirst({
                where: {
                    ressource_owner_id: ticket.id_tcg_ticket as string,
                },
            });

            let res: any = []

            const githubTicketOutput = JSON.parse(remote_data.data) as GithubTicketOutput;


            if (githubTicketOutput.number && githubTicketOutput.repository.name && githubTicketOutput.repository.owner.login) {
                const resp = await axios.post(
                    `${connection.account_url}/repos/${githubTicketOutput.repository.owner.login}/${githubTicketOutput.repository.name}/issues/${githubTicketOutput.number}/comments`,
                    JSON.stringify(commentData),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${this.cryptoService.decrypt(
                                connection.access_token,
                            )}`,
                        },
                    },
                );

                res = resp.data;
            }


            //   const resp = await axios.post(
            //     `${connection.account_url}/projects/${remote_project_id}/issues/${iid}/notes`,
            //     JSON.stringify(data),
            //     {
            //       headers: {
            //         'Content-Type': 'application/json',
            //         Authorization: `Bearer ${this.cryptoService.decrypt(
            //           connection.access_token,
            //         )}`,
            //       },
            //     },
            //   );

            return {
                data: res,
                message: 'Github comment created',
                statusCode: 201,
            };
        } catch (error) {
            throw error;
        }
    }
    async sync(data: SyncParam): Promise<ApiResponse<GithubCommentOutput[]>> {
        try {
            const { linkedUserId, id_ticket } = data;

            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'github',
                    vertical: 'ticketing',
                },
            });
            //retrieve ticket remote id so we can retrieve the comments in the original software
            const ticket = await this.prisma.tcg_tickets.findUnique({
                where: {
                    id_tcg_ticket: id_ticket as string,
                },
                select: {
                    remote_id: true,
                    collections: true,
                },
            });

            // Retrieve the uuid of issue from remote_data
            const remote_data = await this.prisma.remote_data.findFirst({
                where: {
                    ressource_owner_id: id_ticket as string,
                },
            });
            const githubTicketOutput = JSON.parse(remote_data.data) as GithubTicketOutput;

            let res = [];
            if (githubTicketOutput.number && githubTicketOutput.repository.name && githubTicketOutput.repository.owner.login) {
                const resp = await axios.get(
                    `${connection.account_url}/repos/${githubTicketOutput.repository.owner.login}/${githubTicketOutput.repository.name}/issues/${githubTicketOutput.number}/comments`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${this.cryptoService.decrypt(
                                connection.access_token,
                            )}`,
                        },
                    },
                );
                res = resp.data;
            }

            this.logger.log(`Synced github comments !`);

            return {
                data: res,
                message: 'Github comments retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}
