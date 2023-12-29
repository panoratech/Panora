import { EncryptionService } from '@@core/encryption/encryption.service';
import { EnvironmentService } from '@@core/environment/environment.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { Injectable } from '@nestjs/common';
import { TicketingObject, ZendeskUserInput } from '@ticketing/@utils/@types';
import { IUserService } from '@ticketing/user/types';

@Injectable()
export class ZendeskUserService implements IUserService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
  ) {
    this.logger.setContext(
      TicketingObject.user.toUpperCase() + ':' + ZendeskUserService.name,
    );
  }
  addUser(
    userData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<ZendeskUserInput>> {
    throw new Error('Method not implemented.');
  }
  syncUsers(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<ZendeskUserInput[]>> {
    throw new Error('Method not implemented.');
  }
}
