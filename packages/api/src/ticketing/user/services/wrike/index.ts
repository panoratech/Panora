import { EncryptionService } from "@@core/encryption/encryption.service";
import { LoggerService } from "@@core/logger/logger.service";
import { PrismaService } from "@@core/prisma/prisma.service";
import { ActionType, handle3rdPartyServiceError } from "@@core/utils/errors";
import { Injectable } from "@nestjs/common";
import { TicketingObject } from "@ticketing/@lib/@types";
import { IUserService } from "@ticketing/user/types";
import { ServiceRegistry } from "../registry.service";
import { ApiResponse } from "@@core/utils/types";
import axios from "axios";
import { WrikeUserOutput } from "./types";

@Injectable()
export class WrikeService implements IUserService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            TicketingObject.user.toUpperCase() + ':' + WrikeService.name,
        );
        this.registry.registerService('wrike', this);
    }

    async syncUsers(
        linkedUserId: string,
        remote_user_id?: string,
    ): Promise<ApiResponse<WrikeUserOutput[]>> {
        try {
            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'wrike',
                    vertical: 'ticketing',
                },
            });

            const resp = await axios.get(`${connection.account_url}/teammates`, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.cryptoService.decrypt(
                        connection.access_token,
                    )}`,
                },
            });
            this.logger.log(`Synced wrike users !`);

            return {
                data: resp.data._results,
                message: 'Wrike users retrieved',
                statusCode: 200,
            };
        } catch (error) {
            handle3rdPartyServiceError(
                error,
                this.logger,
                'wrike',
                TicketingObject.user,
                ActionType.GET,
            );
        }
    }
}