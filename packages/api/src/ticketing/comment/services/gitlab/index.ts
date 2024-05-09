import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ApiResponse } from '@@core/utils/types';
import axios from 'axios';
import { ActionType, handleServiceError } from '@@core/utils/errors';
import { ICommentService } from '@ticketing/comment/types';
import { TicketingObject } from '@ticketing/@lib/@types';
import { GitlabCommentInput, GitlabCommentOutput } from './types';
import { ServiceRegistry } from '../registry.service';
import { Utils } from '@ticketing/@lib/@utils';;
import * as fs from 'fs';

@Injectable()
export class GitlabService implements ICommentService {
    private readonly utils: Utils;

    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            TicketingObject.comment.toUpperCase() + ':' + GitlabService.name,
        );
        this.registry.registerService('gitlab', this);
        this.utils = new Utils();
    }

    async addComment(
        commentData: GitlabCommentInput,
        linkedUserId: string,
        remoteIdTicket: string,
    ): Promise<ApiResponse<GitlabCommentOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'gitlab',
                    vertical: 'ticketing',
                },
            });

            let uploads = [];
            const uuids = commentData.attachment as any[];
            if (uuids && uuids.length > 0) {
                const attachmentPromises = uuids.map(async (uuid) => {
                    const res = await this.prisma.tcg_attachments.findUnique({
                        where: {
                            id_tcg_attachment: uuid.extra,
                        },
                    });
                    if (!res) {
                        throw new Error(`tcg_attachment not found for uuid ${uuid}`);
                    }
                    // Assuming you want to construct the right binary attachment here
                    // For now, we'll just return the URL
                    const stats = fs.statSync(res.file_url);
                    return {
                        url: res.file_url,
                        name: res.file_name,
                        size: stats.size,
                        content_type: 'application/pdf', //todo
                    };
                });
                uploads = await Promise.all(attachmentPromises);
            }

            // Assuming you want to modify the comment object here
            // For now, we'll just add the uploads to the comment
            const data = {
                ...commentData,
                attachments: uploads,
            };

            const ticket = await this.prisma.tcg_tickets.findUnique({
                where: {
                    id_tcg_ticket: remoteIdTicket,
                },
                select: {
                    collections: true
                },
            });

            const remote_project_id = await this.utils.getCollectionRemoteIdFromUuid(ticket.collections[0])






            const resp = await axios.post(
                `${connection.account_url}/projects/${remote_project_id}/issues/${remoteIdTicket}/notes`,
                JSON.stringify(data),
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );

            return {
                data: resp.data,
                message: 'Gitlab comment created',
                statusCode: 201,
            };
        } catch (error) {
            handleServiceError(
                error,
                this.logger,
                'Gitlab',
                TicketingObject.comment,
                ActionType.POST,
            );
        }
    }
    async syncComments(
        linkedUserId: string,
        id_ticket: string,
    ): Promise<ApiResponse<GitlabCommentOutput[]>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'gitlab',
                    vertical: 'ticketing',
                },
            });
            //retrieve ticket remote id so we can retrieve the comments in the original software
            const ticket = await this.prisma.tcg_tickets.findUnique({
                where: {
                    id_tcg_ticket: id_ticket,
                },
                select: {
                    remote_id: true,
                    collections: true
                },
            });

            // retrieve the remote_id of project from collections
            const remote_project_id = await this.utils.getCollectionRemoteIdFromUuid(ticket.collections[0])


            const resp = await axios.get(
                `${connection.account_url}/projects/${remote_project_id}/issues/${ticket.remote_id}/notes`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );
            this.logger.log(`Synced gitlab comments !`);

            return {
                data: resp.data._results,
                message: 'Gitlab comments retrieved',
                statusCode: 200,
            };
        } catch (error) {
            handleServiceError(
                error,
                this.logger,
                'Gitlab',
                TicketingObject.comment,
                ActionType.GET,
            );
        }
    }
}
