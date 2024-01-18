import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ZendeskUserOutput } from '@ticketing/@utils/@types';
import { EnvironmentService } from '@@core/environment/environment.service';
import { ServiceRegistry } from '../registry.service';
import { IUserService } from '@ticketing/user/types';
import { CommonUserService } from '@ticketing/@utils/@services/common';

@Injectable()
export class ZendeskService
  extends CommonUserService<ZendeskUserOutput>
  implements IUserService
{
  constructor(
    prisma: PrismaService,
    logger: LoggerService,
    cryptoService: EncryptionService,
    private env: EnvironmentService,
    registry: ServiceRegistry,
  ) {
    super(prisma, logger, cryptoService, registry, 'Zendesk', 'zendesk_tcg');
  }

  protected constructApiEndpoint(): string {
    return `https://${this.env.getZendeskTicketingSubdomain()}.zendesk.com/api/v2/users`;
  }

  protected mapResponse(data: any): ZendeskUserOutput[] {
    const users: ZendeskUserOutput[] = data.users;
    const filteredUsers = users.filter((user) => user.role === 'agent');

    return filteredUsers;
  }
}
