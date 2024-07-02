import { EncryptionService } from "@@core/encryption/encryption.service";
import { LoggerService } from "@@core/logger/logger.service";
import { PrismaService } from "@@core/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { ICommentService } from "@ticketing/comment/types";
import { ServiceRegistry } from "../registry.service";
import { Utils } from "@ticketing/@lib/@utils";
import { TicketingObject } from "@ticketing/@lib/@types";
import { ApiResponse } from "@@core/utils/types";
import axios from "axios";
import { ActionType, handle3rdPartyServiceError } from "@@core/utils/errors";
import { WrikeCommentInput, WrikeCommentOutput } from "./types";

@Injectable()
export class WrikeService implements ICommentService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
        private utils: Utils,
    ) {
        this.logger.setContext(
            TicketingObject.comment.toUpperCase() + ':' + WrikeService.name,
        );
        this.registry.registerService('wrike', this);
    }

    async addComment(
        commentData: WrikeCommentInput,
        linkedUserId: string,
        remoteIdTicket: string,
    ): Promise<ApiResponse<WrikeCommentOutput>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'wrike',
                    vertical: 'ticketing',
                },
            });

            let dataBody = commentData;

            const author_id = commentData.author_id;

            if (author_id) {
                dataBody = { ...dataBody, author_id: author_id };
            }

            let uploads = [];
            const uuids = commentData.attachments;
            if (uuids && uuids.length > 0) {
                uploads = await Promise.all(
                    uuids.map(async (uuid) => {
                        const attachment = await this.prisma.tcg_attachments.findUnique({
                            where: {
                                id_tcg_attachment: uuid,
                            },
                        });
                        if (!attachment) {
                            throw new ReferenceError(
                                `tcg_attachment not found for uuid ${uuid}`,
                            );
                        }

                        return await this.utils.fetchFileStreamFromURL(attachment.file_url);
                    }),
                );
            }

            let resp;
            if (uploads.length > 0) {
                const formData = new FormData();
                if (author_id) {
                    formData.append('author_id', author_id);
                }
                formData.append('body', commentData.body);
                uploads.forEach((fileStream, index) => {
                    formData.append(`attachments[${index}]`, fileStream);
                });

                resp = await axios.post(
                    `${connection.account_url}/conversations/${remoteIdTicket}/comments`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${this.cryptoService.decrypt(
                                connection.access_token,
                            )}`,
                        },
                    },
                );
            } else {
                resp = await axios.post(
                    `${connection.account_url}/conversations/${remoteIdTicket}/comments`,
                    JSON.stringify(dataBody),
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${this.cryptoService.decrypt(
                                connection.access_token,
                            )}`,
                        },
                    },
                );
            }

            return {
                data: resp.data,
                message: 'Wrike comment created',
                statusCode: 201,
            };
        } catch (error) {
            handle3rdPartyServiceError(
                error,
                this.logger,
                'wrike',
                TicketingObject.comment,
                ActionType.POST,
            );
        }
    }
    async syncComments(
        linkedUserId: string,
        id_ticket: string,
    ): Promise<ApiResponse<WrikeCommentOutput[]>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'wrike',
                    vertical: 'ticketing',
                },
            });

            const ticket = await this.prisma.tcg_tickets.findUnique({
                where: {
                    id_tcg_ticket: id_ticket,
                },
                select: {
                    remote_id: true,
                },
            });

            const resp = await axios.get(
                `${connection.account_url}/conversations/${ticket.remote_id}/comments`,
                {
                    headers: {
                        Authorization: `Bearer ${this.cryptoService.decrypt(
                            connection.access_token,
                        )}`,
                    },
                },
            );
            this.logger.log(`Synced wrike comments !`);

            return {
                data: resp.data._results,
                message: 'Wrike comments retrieved',
                statusCode: 200,
            };
        } catch (error) {
            handle3rdPartyServiceError(
                error,
                this.logger,
                'wrike',
                TicketingObject.comment,
                ActionType.GET,
            );
        }
    }
}