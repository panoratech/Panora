import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ServiceRegistry } from '../registry.service';
import { IUserService } from '@ticketing/user/types';
import { GithubUserInput, GithubUserOutput } from './types';
import { CommonUserService } from '@ticketing/@utils/@services/common';

//TODO
@Injectable()
export class GithubService
  extends CommonUserService<GithubUserOutput>
  implements IUserService
{
  constructor(
    prisma: PrismaService,
    logger: LoggerService,
    cryptoService: EncryptionService,
    registry: ServiceRegistry,
  ) {
    super(prisma, logger, cryptoService, registry, 'Github', 'github');
  }

  protected constructApiEndpoint(): string {
    return 'https://api.github.com/users';
  }

  protected mapResponse(data: any): GithubUserInput[] {
    return data;
  }
}
