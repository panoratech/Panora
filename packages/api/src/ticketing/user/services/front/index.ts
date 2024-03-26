import { Injectable } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { ServiceRegistry } from '../registry.service';
import { IUserService } from '@ticketing/user/types';
import { FrontUserOutput } from './types';
import { CommonUserService } from '@ticketing/@utils/@services/common';

@Injectable()
export class FrontService
  extends CommonUserService<FrontUserOutput>
  implements IUserService
{
  constructor(
    prisma: PrismaService,
    logger: LoggerService,
    cryptoService: EncryptionService,
    registry: ServiceRegistry,
  ) {
    super(prisma, logger, cryptoService, registry, 'Front', 'front');
  }

  protected constructApiEndpoint(): string {
    return 'https://api2.frontapp.com/teammates';
  }

  protected mapResponse(data: any): FrontUserOutput[] {
    return data._results;
  }
}
