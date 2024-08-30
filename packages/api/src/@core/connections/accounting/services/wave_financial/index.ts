// import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
// import { LoggerService } from '@@core/@core-services/logger/logger.service';
// import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
// import { Injectable } from '@nestjs/common';
// import { ServiceRegistry } from '../registry.service';
// import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
// import { OriginalContactOutput } from '@@core/utils/types/original/original.accounting';
// import { ApiResponse } from '@@core/utils/types';
// import { AccountingObject } from '@lib/@types/index'

// export interface IContactService {
//   addContact(
//     contactData: DesunifyReturnType,
//     linkedUserId: string
//   ): Promise<ApiResponse<OriginalContactOutput>>;

//   syncContacts(
//     linkedUserId: string
//   ): Promise<ApiResponse<OriginalContactOutput[]>>;
// }

// @Injectable()
// export class WaveFinancial implements IContactService {
//   constructor(
//     private prisma: PrismaService,
//     private logger: LoggerService,
//     private cryptoService: EncryptionService,
//     private registry: ServiceRegistry,
//   ) {
//     this.logger.setContext(
//       CrmObject.contact.toUpperCase() + ':' + WaveFinancial.name,
//     );
//     this.registry.registerService('my3rdParty', this);

// export interface IContactService {
//     addContact(
//       contactData: DesunifyReturnType,
//       linkedUserId: string
//     ): Promise<ApiResponse<OriginalContactOutput>>;

//     syncContacts(
//       linkedUserId: string
//     ): Promise<ApiResponse<OriginalContactOutput[]>>;
//   }

// @Injectable()
// export class WaveFinancial implements IContactService {
//   constructor(
//     private prisma: PrismaService,
//     private logger: LoggerService,
//     private cryptoService: EncryptionService,
//     private registry: ServiceRegistry,
//   ) {
//     this.logger.setContext(
//         AccountingObject.contact.toUpperCase() + ':' + WaveFinancial.name,
//     );
//     this.registry.registerService('my3rdParty', this);
//   }
//   async addContact(
//     contactData: 3rdPartyContactInput,
//     linkedUserId: string,
//   ): Promise<ApiResponse<3rdPartyContactOutput>> {}

//   async syncContacts(
//     linkedUserId: string,
//   ): Promise<ApiResponse<3rdPartyContactOutput[]>> {}
// }
