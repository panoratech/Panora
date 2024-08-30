// import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
// import { LoggerService } from '@@core/@core-services/logger/logger.service';
// import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
// import { Injectable } from '@nestjs/common';
// import { ServiceRegistry } from '../registry.service';

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
// export class My3rdPartyService implements IContactService {
//   constructor(
//     private prisma: PrismaService,
//     private logger: LoggerService,
//     private cryptoService: EncryptionService,
//     private registry: ServiceRegistry,
//   ) {
//     this.logger.setContext(
//       CrmObject.contact.toUpperCase() + ':' + My3rdPartyService.name,
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
