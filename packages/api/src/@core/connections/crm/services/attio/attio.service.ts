import { Injectable } from "@nestjs/common";
import {
    AttioOAuthResponse,
    CallbackParams,
    ICrmConnectionService,
    RefreshParams,
} from "../../types";
import { PrismaService } from '@@core/prisma/prisma.service';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Action, handleServiceError } from '@@core/utils/errors';
import { EnvironmentService } from '@@core/environment/environment.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ServiceConnectionRegistry } from '../registry.service';
import { LoggerService } from '@@core/logger/logger.service';


@Injectable()
export class AttioConnectionService implements ICrmConnectionService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private env: EnvironmentService,
        private cryptoService: EncryptionService,
        private registry: ServiceConnectionRegistry
    ) {
        this.logger.setContext(AttioConnectionService.name);
        this.registry.registerService("attio", this);
    }

    async handleCallback(opts: CallbackParams) {
        try {
            console.log("Linked User iD : <MMMMKIIT")
            const { linkedUserId, projectId, code } = opts;
            this.logger.log(
                'linkeduserid is ' + linkedUserId + ' inside callback attio',
            );
            const isNotUnique = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'attio',
                },
            });
            if (isNotUnique) return;
            //reconstruct the redirect URI that was passed in the frontend it must be the same
            const REDIRECT_URI = `${this.env.getOAuthRredirectBaseUrl()}/connections/oauth/callback`;
            const formData = new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: this.env.getAttioAuth().CLIENT_ID,
                client_secret: this.env.getAttioAuth().CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                code: code,
            });

            const res = await axios.post(
                'https://app.attio.com/oauth/token',
                formData.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
                    },
                },
            );

            const data: AttioOAuthResponse = res.data;

            // Saving the token of customer inside db
            let db_res;
            const connection_token = uuidv4();

            if (isNotUnique) {
                // Update existing connection
                db_res = await this.prisma.connections.update({
                    where: {
                        id_connection: isNotUnique.id_connection,
                    },
                    data: {
                        access_token: this.cryptoService.encrypt(data.access_token),
                        status: 'valid',
                        created_at: new Date(),
                    },
                });
            } else {
                // Create new connection
                db_res = await this.prisma.connections.create({
                    data: {
                        id_connection: uuidv4(),
                        connection_token: connection_token,
                        provider_slug: 'attio',
                        token_type: 'oauth',
                        access_token: this.cryptoService.encrypt(data.access_token),
                        status: 'valid',
                        created_at: new Date(),
                        projects: {
                            connect: { id_project: projectId },
                        },
                        linked_users: {
                            connect: { id_linked_user: linkedUserId },
                        },
                    },
                });
            }
            this.logger.log('Successfully added tokens inside DB ' + db_res);
            return db_res;


        } catch (error) {
            handleServiceError(error, this.logger, 'attio', Action.oauthCallback);

        }
    }

    // It is not required for Attio as it does not provide refresh_token
    async handleTokenRefresh(opts: RefreshParams) {
        return;
    }
}
