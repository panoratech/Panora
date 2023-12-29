import { EncryptionService } from '@@core/encryption/encryption.service';
import { EnvironmentService } from '@@core/environment/environment.service';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { OriginalContactOutput } from '@@core/utils/types/original/original.crm';
import { Injectable } from '@nestjs/common';
import { TicketingObject } from '@ticketing/@utils/@types';
import { IContactService } from '@ticketing/contact/types';

@Injectable()
export class ZendeskContactService implements IContactService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
  ) {
    this.logger.setContext(
      TicketingObject.contact.toUpperCase() + ':' + ZendeskContactService.name,
    );
  }
  addContact(
    contactData: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<OriginalContactOutput>> {
    throw new Error('Method not implemented.');
  }
  syncContacts(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<OriginalContactOutput[]>> {
    throw new Error('Method not implemented.');
  }
}
