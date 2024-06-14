# (USED BY PANORA INTERNAL TEAM)
# THIS SCRIPT GENRATES THE BOILERPLATE FOR A NEW COMMON OBJECT
#  ./commonObject.sh comment crm

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <object_type> <vertical_object>"
    exit 1
fi

objectType=$1
verticalObject=$2

capitalize() {
    echo "$(tr '[:lower:]' '[:upper:]' <<< ${1:0:1})${1:1}"
}

ObjectCap=$(capitalize $objectType)
VerticalCap=$(capitalize $verticalObject)
VerticalLow=$(tr '[:upper:]' '[:lower:]' <<< ${verticalObject:0:1})${verticalObject:1}

baseDir="./$objectType"
directories=("services" "sync" "types" "utils")

# Create base directory and subdirectories
mkdir -p $baseDir
for dir in "${directories[@]}"; do
    mkdir -p "$baseDir/$dir"
done

# Change to base directory
cd $baseDir

# Create and fill files

cat > "services/registry.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { I${ObjectCap}Service } from '../types';

@Injectable()
export class ServiceRegistry {
  private serviceMap: Map<string, I${ObjectCap}Service>;

  constructor() {
    this.serviceMap = new Map<string, I${ObjectCap}Service>();
  }

  registerService(serviceKey: string, service: I${ObjectCap}Service) {
    this.serviceMap.set(serviceKey, service);
  }

  getService(integrationId: string): I${ObjectCap}Service {
    const service = this.serviceMap.get(integrationId);
    if (!service) {
      throw new ReferenceError(`Service not found for integration ID: ${integrationId}`);
    }
    return service;
  }
}
EOF 

cat > "services/${objectType}.service.ts" <<EOF
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponse } from '@@core/utils/types';
import { throwTypedError, Unified${VerticalCap}Error } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { Unified${ObjectCap}Input, Unified${ObjectCap}Output } from '../types/model.unified';
import { desunify } from '@@core/utils/unification/desunify';
import { ${VerticalCap}Object } from '@${VerticalLow}/@utils/@types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { Original${ObjectCap}Output } from '@@core/utils/types/original/original.${VerticalLow}';
import { unify } from '@@core/utils/unification/unify';
import { I${ObjectCap}Service } from '../types';

@Injectable()
export class ${ObjectCap}Service {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(${ObjectCap}Service.name);
  }

  async batchAdd${ObjectCap}s(
    unified${ObjectCap}Data: Unified${ObjectCap}Input[],
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<Unified${ObjectCap}Output[]> {
    try {
      const responses = await Promise.all(
        unified${ObjectCap}Data.map((unifiedData) =>
          this.add${ObjectCap}(
            unifiedData,
            integrationId.toLowerCase(),
            linkedUserId,
            remote_data,
          ),
        ),
      );

      return responses;
    } catch (error) {
      throwTypedError(
        new Unified${VerticalCap}Error({
          name: 'CREATE_${ObjectCap}S_ERROR',
          message: '${ObjectCap}Service.batchAdd${ObjectCap}s() call failed',
          cause: error,
        }),
      );
    }
  }

  async add${ObjectCap}(
    unified${ObjectCap}Data: Unified${ObjectCap}Input,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<Unified${ObjectCap}Output> {
    try {
      const linkedUser = await this.prisma.linked_users.findUnique({
        where: {
          id_linked_user: linkedUserId,
        },
      });

      //CHECKS
      if (!linkedUser) throw new ReferenceError('Linked User Not Found');
      const tick = unified${ObjectCap}Data.ticket_id;
      //check if contact_id and account_id refer to real uuids
      if (tick) {
        const search = await this.prisma.tcg_tickets.findUnique({
          where: {
            id_tcg_ticket: tick,
          },
        });
        if (!search)
          throw new ReferenceError('You inserted a ticket_id which does not exist');
      }

      const contact = unified${ObjectCap}Data.contact_id;
      //check if contact_id and account_id refer to real uuids
      if (contact) {
        const search = await this.prisma.tcg_contacts.findUnique({
          where: {
            id_tcg_contact: contact,
          },
        });
        if (!search)
          throw new ReferenceError('You inserted a contact_id which does not exist');
      }
      const user = unified${ObjectCap}Data.user_id;
      //check if contact_id and account_id refer to real uuids
      if (user) {
        const search = await this.prisma.tcg_users.findUnique({
          where: {
            id_tcg_user: user,
          },
        });
        if (!search)
          throw new ReferenceError('You inserted a user_id which does not exist');
      }

      const attachmts = unified${ObjectCap}Data.attachments;
      //CHEK IF attachments contains valid Attachment uuids
      if (attachmts && attachmts.length > 0) {
        attachmts.map(async (attachmt) => {
          const search = await this.prisma.tcg_attachments.findUnique({
            where: {
              id_tcg_attachment: attachmt,
            },
          });
          if (!search)
            throw new ReferenceError(
              'You inserted an attachment_id which does not exist',
            );
        });
      }

      //desunify the data according to the target obj wanted
      const desunifiedObject = await desunify<Unified${ObjectCap}Input>({
        sourceObject: unified${ObjectCap}Data,
        targetType: ${VerticalCap}Object.${objectType},
        providerName: integrationId,
        vertical: "${VerticalLow}",
        customFieldMappings: [],
      });

      const service: I${ObjectCap}Service =
        this.serviceRegistry.getService(integrationId);
      //get remote_id of the ticket so the ${objectType} is inserted successfully
      const ticket = await this.prisma.tcg_tickets.findUnique({
        where: {
          id_tcg_ticket: unified${ObjectCap}Data.ticket_id,
        },
        select: {
          remote_id: true,
        },
      });
      if (!ticket)
        throw new ReferenceError(
          'ticket does not exist for the ${objectType} you try to create',
        );
      const resp: ApiResponse<Original${ObjectCap}Output> = await service.add${ObjectCap}(
        desunifiedObject,
        linkedUserId,
        ticket.remote_id,
      );

      //unify the data according to the target obj wanted
      const unifiedObject = (await unify<Original${ObjectCap}Output[]>({
        sourceObject: [resp.data],
        targetType: ${VerticalCap}Object.${objectType},
        providerName: integrationId, 
        vertical: "${VerticalLow}",
        customFieldMappings: [],
      })) as Unified${ObjectCap}Output[];

      // add the ${objectType} inside our db
      const source_${objectType} = resp.data;
      const target_${objectType} = unifiedObject[0];
      const originId =
        'id' in source_${objectType} ? String(source_${objectType}.id) : undefined; //TODO

      const existing${ObjectCap} = await this.prisma.tcg_${objectType}s.findFirst({
        where: {
          remote_id: originId,
          remote_platform: integrationId,
          id_linked_user: linkedUserId,
        },
      });

      let unique_ticketing_${objectType}_id: string;
      const opts =
        target_${objectType}.creator_type === 'contact'
          ? {
              id_tcg_contact: unified${ObjectCap}Data.contact_id,
            }
          : target_${objectType}.creator_type === 'user'
          ? {
              id_tcg_user: unified${ObjectCap}Data.user_id,
            }
          : {}; //case where nothing is passed for creator or a not authorized value;

      if (existing${ObjectCap}) {
        // Update the existing ${objectType}
        let data: any = {
          id_tcg_ticket: unified${ObjectCap}Data.ticket_id,
          modified_at: new Date(),
        };
        if (target_${objectType}.body) {
          data = { ...data, body: target_${objectType}.body };
        }
        if (target_${objectType}.html_body) {
          data = { ...data, html_body: target_${objectType}.html_body };
        }
        if (target_${objectType}.is_private) {
          data = { ...data, is_private: target_${objectType}.is_private };
        }
        if (target_${objectType}.creator_type) {
          data = { ...data, creator_type: target_${objectType}.creator_type };
        }
        data = { ...data, ...opts };

        const res = await this.prisma.tcg_${objectType}s.update({
          where: {
            id_tcg_${objectType}: existing${ObjectCap}.id_tcg_${objectType},
          },
          data: data,
        });
        unique_ticketing_${objectType}_id = res.id_tcg_${objectType};
      } else {
        // Create a new ${objectType}
        this.logger.log('${objectType} not exists');
        let data: any = {
          id_tcg_${objectType}: uuidv4(),
          created_at: new Date(),
          modified_at: new Date(),
          id_tcg_ticket: unified${ObjectCap}Data.ticket_id,
          id_linked_user: linkedUserId,
          remote_id: originId,
          remote_platform: integrationId,
        };

        if (target_${objectType}.body) {
          data = { ...data, body: target_${objectType}.body };
        }
        if (target_${objectType}.html_body) {
          data = { ...data, html_body: target_${objectType}.html_body };
        }
        if (target_${objectType}.is_private) {
          data = { ...data, is_private: target_${objectType}.is_private };
        }
        if (target_${objectType}.creator_type) {
          data = { ...data, creator_type: target_${objectType}.creator_type };
        }
        data = { ...data, ...opts };

        const res = await this.prisma.tcg_${objectType}s.create({
          data: data,
        });
        unique_ticketing_${objectType}_id = res.id_tcg_${objectType};
      }

      //insert remote_data in db
      await this.prisma.remote_data.upsert({
        where: {
          ressource_owner_id: unique_ticketing_${objectType}_id,
        },
        create: {
          id_remote_data: uuidv4(),
          ressource_owner_id: unique_ticketing_${objectType}_id,
          format: 'json',
          data: JSON.stringify(source_${objectType}),
          created_at: new Date(),
        },
        update: {
          data: JSON.stringify(source_${objectType}),
          created_at: new Date(),
        },
      });

      const result_${objectType} = await this.get${ObjectCap}(
        unique_ticketing_${objectType}_id,
        remote_data,
      );

      const status_resp = resp.statusCode === 201 ? 'success' : 'fail';

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: status_resp,
          type: 'ticketing.${objectType}.push', //sync, push or pull
          method: 'POST',
          url: '/ticketing/${objectType}',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      await this.webhook.handleWebhook(
        result_${objectType},
        'ticketing.${objectType}.created',
        linkedUser.id_project,
        event.id_event,
      );
      return result_${objectType};
    } catch (error) {
      throwTypedError(
        new Unified${VerticalCap}Error({
          name: 'CREATE_${ObjectCap}_ERROR',
          message: '${ObjectCap}Service.add${ObjectCap}() call failed',
          cause: error,
        }),
      );
    }
  }

  async get${ObjectCap}(
    id_${objectType}ing_${objectType}: string,
    remote_data?: boolean,
  ): Promise<Unified${ObjectCap}Output> {
    try {
      const ${objectType} = await this.prisma.tcg_${objectType}s.findUnique({
        where: {
          id_tcg_${objectType}: id_${objectType}ing_${objectType},
        },
      });

      // WE SHOULDNT HAVE FIELD MAPPINGS TO COMMENT

      // Fetch field mappings for the ${objectType}
      /*const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: ${objectType}.id_tcg_${objectType},
          },
        },
        include: {
          attribute: true,
        },
      });

      Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Array.from(fieldMappingsMap, ([key, value]) => ({
        [key]: value,
      }));*/

      // Transform to Unified${ObjectCap}Output format
      const unified${ObjectCap}: Unified${ObjectCap}Output = {
        id: ${objectType}.id_tcg_${objectType},
        body: ${objectType}.body,
        html_body: ${objectType}.html_body,
        is_private: ${objectType}.is_private,
        creator_type: ${objectType}.creator_type,
        ticket_id: ${objectType}.id_tcg_ticket,
        contact_id: ${objectType}.id_tcg_contact, // uuid of Contact object
        user_id: ${objectType}.id_tcg_user, // uuid of User object
      };

      let res: Unified${ObjectCap}Output = {
        ...unified${ObjectCap},
      };

      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: ${objectType}.id_tcg_${objectType},
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }

      return res;
    } catch (error) {
      throwTypedError(
        new Unified${VerticalCap}Error({
          name: 'GET_${ObjectCap}_ERROR',
          message: '${ObjectCap}Service.get${ObjectCap}() call failed',
          cause: error,
        }),
      );    
    }
  }


  async get${ObjectCap}s(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<Unified${ObjectCap}Output[]> {
    try {
      const ${objectType}s = await this.prisma.tcg_${objectType}s.findMany({
        where: {
          remote_platform: integrationId.toLowerCase(),
          id_linked_user: linkedUserId,
        },
      });

      const unified${ObjectCap}s: Unified${ObjectCap}Output[] = await Promise.all(
        ${objectType}s.map(async (${objectType}) => {
          //WE SHOULDNT HAVE FIELD MAPPINGS FOR COMMENT
          // Fetch field mappings for the ticket
          /*const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: ${objectType}.id_tcg_ticket,
              },
            },
            include: {
              attribute: true,
            },
          });
          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          const field_mappings = Array.from(
            fieldMappingsMap,
            ([key, value]) => ({ [key]: value }),
          );*/

          // Transform to Unified${ObjectCap}Output format
          return {
            id: ${objectType}.id_tcg_${objectType},
            body: ${objectType}.body,
            html_body: ${objectType}.html_body,
            is_private: ${objectType}.is_private,
            creator_type: ${objectType}.creator_type,
            ticket_id: ${objectType}.id_tcg_ticket,
            contact_id: ${objectType}.id_tcg_contact, // uuid of Contact object
            user_id: ${objectType}.id_tcg_user, // uuid of User object
          };
        }),
      );

      let res: Unified${ObjectCap}Output[] = unified${ObjectCap}s;

      if (remote_data) {
        const remote_array_data: Unified${ObjectCap}Output[] = await Promise.all(
          res.map(async (${objectType}) => {
            const resp = await this.prisma.remote_data.findFirst({
              where: {
                ressource_owner_id: ${objectType}.id,
              },
            });
            const remote_data = JSON.parse(resp.data);
            return { ...${objectType}, remote_data };
          }),
        );
        res = remote_array_data;
      }

      const event = await this.prisma.events.create({
        data: {
          id_event: uuidv4(),
          status: 'success',
          type: 'ticketing.${objectType}.pulled',
          method: 'GET',
          url: '/ticketing/${objectType}',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return res;
    } catch (error) {
      throwTypedError(
        new Unified${VerticalCap}Error({
          name: 'GET_${ObjectCap}S_ERROR',
          message: '${ObjectCap}Service.get${ObjectCap}s() call failed',
          cause: error,
        }),
      );
    }
  }
}
EOF

cat > "sync/sync.service.ts" <<EOF
import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { ReferenceError } from '@@core/utils/errors';
import { Cron } from '@nestjs/schedule';
import { ApiResponse } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '../services/registry.service';
import { unify } from '@@core/utils/unification/unify';
import { ${VerticalCap}Object } from '@${VerticalLow}/@utils/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { Unified${ObjectCap}Output } from '../types/model.unified';
import { I${ObjectCap}Service } from '../types';
 
@Injectable()
export class SyncService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(SyncService.name);
  }

  async onModuleInit() {
    // Initialization logic
  }

  // Additional methods and logic
}
EOF

cat > "types/index.ts" <<EOF
import { DesunifyReturnType } from '@@core/utils/types/desunify.input';
import { Unified${ObjectCap}Input, Unified${ObjectCap}Output } from './model.unified';
import { Original${ObjectCap}Output } from '@@core/utils/types/original/original.${VerticalLow}';
import { ApiResponse } from '@@core/utils/types';

export interface I${ObjectCap}Service {
  add${ObjectCap}(
    ${objectType}Data: DesunifyReturnType,
    linkedUserId: string,
  ): Promise<ApiResponse<Original${ObjectCap}Output>>;

  sync${ObjectCap}s(
    linkedUserId: string,
    custom_properties?: string[],
  ): Promise<ApiResponse<Original${ObjectCap}Output[]>>;
}

export interface I${ObjectCap}Mapper {
  desunify(
    source: Unified${ObjectCap}Input,
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): DesunifyReturnType;

  unify(
    source: Original${ObjectCap}Output | Original${ObjectCap}Output[],
    customFieldMappings?: {
      slug: string;
      remote_id: string;
    }[],
  ): Unified${ObjectCap}Output | Unified${ObjectCap}Output[];
}
EOF

cat > "types/mappingsTypes.ts" <<EOF
/* EXAMPLE ONCE YOU HAVE DEFINED YOUR SERVICE PROVIDER UNDER /services/myProvider

import { MyProvider${ObjectCap}Mapper } from '../services/myProvider/mappers';

const myProvider${ObjectCap}Mapper = new MyProvider${ObjectCap}Mapper();

export const ${objectType}UnificationMapping = {
  myProvider: {
    unify: myProvider${ObjectCap}Mapper.unify,
    desunify: myProvider${ObjectCap}Mapper.desunify,
  },
}; */
EOF

cat > "types/model.unified.ts" <<EOF
export class Unified${ObjectCap}Input {}

export class Unified${ObjectCap}Output extends Unified${ObjectCap}Input {}
EOF

cat > "utils/index.ts" <<EOF
/* PUT ALL UTILS FUNCTIONS USED IN YOUR OBJECT METHODS HERE */
EOF

cd ..

# NestJS CLI commands to generate module and controller
nest g module $objectType
nest g controller $objectType

cd $baseDir
rm "${objectType}.controller.spec.ts"

# Overwrite the module file with custom content
cat > "${objectType}.module.ts" <<EOF
import { Module } from '@nestjs/common';
import { ${ObjectCap}Controller } from './${objectType}.controller';
import { SyncService } from './sync/sync.service';
import { LoggerService } from '@@core/logger/logger.service';
import { ${ObjectCap}Service } from './services/${objectType}.service';
import { ServiceRegistry } from './services/registry.service';
import { EncryptionService } from '@@core/encryption/encryption.service';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { WebhookService } from '@@core/webhook/webhook.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'webhookDelivery',
    }),
  ],
  controllers: [${ObjectCap}Controller],
  providers: [
    ${ObjectCap}Service,
    PrismaService,
    LoggerService,
    SyncService,
    WebhookService,
    EncryptionService,
    FieldMappingService,
    ServiceRegistry,
    /* PROVIDERS SERVICES */

  ],
  exports: [SyncService],
})
export class ${ObjectCap}Module {}

EOF

# Overwrite the controller file with custom content
cat > "${objectType}.controller.ts" <<EOF
import {
  Controller,
  Post,
  Body,
  Query,
  Get,
  Patch,
  Param,
  Headers,
} from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { ApiCustomResponse } from '@@core/utils/types';
import { ${ObjectCap}Service } from './services/${objectType}.service';
import { Unified${ObjectCap}Input, Unified${ObjectCap}Output  } from './types/model.unified';
import { ConnectionUtils } from '@@core/connections/@utils';

@ApiTags('${VerticalLow}/${objectType}')
@Controller('${VerticalLow}/${objectType}')
export class ${ObjectCap}Controller {
  private readonly connectionUtils = new ConnectionUtils();

  constructor(
    private readonly ${objectType}Service: ${ObjectCap}Service,
    private logger: LoggerService,
  ) {
    this.logger.setContext(${ObjectCap}Controller.name);
  }

  @ApiOperation({
    operationId: 'get${ObjectCap}s',
    summary: 'List a batch of ${ObjectCap}s',
  })
   @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original ${VerticalCap} software.',
  })
  @ApiCustomResponse(Unified${ObjectCap}Output)
  //@UseGuards(ApiKeyAuthGuard)
  @Get()
  async get${ObjectCap}s(
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.${objectType}Service.get${ObjectCap}s(
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'get${ObjectCap}',
    summary: 'Retrieve a ${ObjectCap}',
    description: 'Retrieve a ${objectType} from any connected ${VerticalCap} software',
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: String,
    description: 'id of the ${objectType} you want to retrieve.',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original ${VerticalCap} software.',
  })
  @ApiCustomResponse(Unified${ObjectCap}Output)
  //@UseGuards(ApiKeyAuthGuard)
  @Get(':id')
  get${ObjectCap}(
    @Param('id') id: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    return this.${objectType}Service.get${ObjectCap}(id, remote_data);
  }

  @ApiOperation({
    operationId: 'add${ObjectCap}',
    summary: 'Create a ${ObjectCap}',
    description: 'Create a ${objectType} in any supported ${VerticalCap} software',
  })
   @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original ${VerticalCap} software.',
  })
  @ApiBody({ type: Unified${ObjectCap}Input })
  @ApiCustomResponse(Unified${ObjectCap}Output)
  //@UseGuards(ApiKeyAuthGuard)
  @Post()
  async add${ObjectCap}(
    @Body() unified${ObjectCap}Data: Unified${ObjectCap}Input,
    @Headers('x-connection-token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.${objectType}Service.add${ObjectCap}(
        unified${ObjectCap}Data,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
  }

  @ApiOperation({
    operationId: 'add${ObjectCap}s',
    summary: 'Add a batch of ${ObjectCap}s',
  })
   @ApiHeader({
    name: 'x-connection-token',
    required: true,
    description: 'The connection token',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remote_data',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original ${VerticalCap} software.',
  })
  @ApiBody({ type: Unified${ObjectCap}Input, isArray: true })
  @ApiCustomResponse(Unified${ObjectCap}Output)
  //@UseGuards(ApiKeyAuthGuard)
  @Post('batch')
  async add${ObjectCap}s(
    @Body() unfied${ObjectCap}Data: Unified${ObjectCap}Input[],
    @Headers('connection_token') connection_token: string,
    @Query('remote_data') remote_data?: boolean,
  ) {
    try{
      const { linkedUserId, remoteSource } =
        await this.connectionUtils.getConnectionMetadataFromConnectionToken(
          connection_token,
      );
      return this.${objectType}Service.batchAdd${ObjectCap}s(
        unfied${ObjectCap}Data,
        remoteSource,
        linkedUserId,
        remote_data,
      );
    }catch(error){
      throw new Error(error);
    }
    
  }

  @ApiOperation({
    operationId: 'update${ObjectCap}',
    summary: 'Update a ${ObjectCap}',
  })
  @ApiCustomResponse(Unified${ObjectCap}Output)
  //@UseGuards(ApiKeyAuthGuard)
  @Patch()
  update${ObjectCap}(
    @Query('id') id: string,
    @Body() update${ObjectCap}Data: Partial<Unified${ObjectCap}Input>,
  ) {
    return this.${objectType}Service.update${ObjectCap}(id, update${ObjectCap}Data);
  }
}
EOF

cd ..
# File to be modified
file="${VerticalLow}.module.ts"

# Extract the imports line, transform it to exports format, and remove any trailing comma
exportsLine=$(grep 'imports:' $file | sed 's/imports/exports/g' | sed 's/,$//')

# Replace the exports line in the file
sed -i '' "/exports:/c\\
$exportsLine" $file

# Correctly format the file
sed -i '' 's/},})/}])/' $file



echo "Folders and files for $objectType object with $verticalObject replacements created successfully."
