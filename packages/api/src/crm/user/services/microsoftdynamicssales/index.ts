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
import { MicrosoftdynamicssalesUserOutput } from './types';

@Injectable()
export class MicrosoftdynamicssalesService implements IUserService {
    constructor(
        private prisma: PrismaService,
        private logger: LoggerService,
        private cryptoService: EncryptionService,
        private registry: ServiceRegistry,
    ) {
        this.logger.setContext(
            CrmObject.user.toUpperCase() + ':' + MicrosoftdynamicssalesService.name,
        );
        this.registry.registerService('microsoftdynamicssales', this);
    }

    async sync(data: SyncParam): Promise<ApiResponse<MicrosoftdynamicssalesUserOutput[]>> {
        try {
            const { linkedUserId } = data;

            const connection = await this.prisma.connections.findFirst({
                where: {
                    id_linked_user: linkedUserId,
                    provider_slug: 'microsoftdynamicssales',
                    vertical: 'crm',
                },
            });

            this.logger.log("===========");
            this.logger.log(this.cryptoService.decrypt(
                connection.access_token,
            ));
            this.logger.log("===========");


            const baseURL = `${connection.account_url}/api/data/v9.2/systemusers`;
            const resp = await axios.get(baseURL, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.cryptoService.decrypt(
                        connection.access_token,
                    )}`,
                },
            });

            this.logger.log(`Synced microsoftdynamicssales users ! : ${JSON.stringify(resp.data.value)}`);

            return {
                data: resp.data.value,
                message: 'Microsoftdynamicssales users retrieved',
                statusCode: 200,
            };
        } catch (error) {
            throw error;
        }
    }
}
