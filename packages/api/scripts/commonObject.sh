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
      throw new Error(`Service not found for integration ID: ${integrationId}`);
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
import { handleServiceError } from '@@core/utils/errors';
import { WebhookService } from '@@core/webhook/webhook.service';
import { Unified${ObjectCap}Input, Unified${ObjectCap}Output } from '../types/model.unified';
import { ${ObjectCap}Response } from '../types';
import { desunify } from '@@core/utils/unification/desunify';
import { ${VerticalCap}Object } from '@${VerticalLow}/@utils/@types';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from './registry.service';
import { Original${ObjectCap}Output } from '@@core/utils/types/original/original.${VerticalLow}';
import { unify } from '@@core/utils/unification/unify';

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
  ): Promise<${ObjectCap}Response> {
    return
  }

  async add${ObjectCap}(  
    unified${ObjectCap}Data: Unified${ObjectCap}Input,
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<${ObjectCap}Response> {
    return;
  }

  async get${ObjectCap}(
    id_${VerticalLow}_${objectType}: string,
    remote_data?: boolean,
  ): Promise<${ObjectCap}Response> {
    return;
  }

  async get${ObjectCap}s(
    integrationId: string,
    linkedUserId: string,
    remote_data?: boolean,
  ): Promise<${ObjectCap}Response> {
    return;
  }

  async update${ObjectCap}(
    id: string,
    update${ObjectCap}Data: Partial<Unified${ObjectCap}Input>,
  ): Promise<${ObjectCap}Response> {
    return;
  }
}
EOF

cat > "sync/sync.service.ts" <<EOF
import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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

export class ${ObjectCap}Response {
  @ApiProperty({ type: [Unified${ObjectCap}Output] })
  ${objectType}s: Unified${ObjectCap}Output[];

  @ApiPropertyOptional({ type: [{}] })
  remote_data?: Record<string, any>[]; // Data in original format
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
import { ${ObjectCap}Response } from './types';
import { Unified${ObjectCap}Input } from './types/model.unified';

@ApiTags('${VerticalLow}/${objectType}')
@Controller('${VerticalLow}/${objectType}')
export class ${ObjectCap}Controller {
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
  @ApiHeader({ name: 'integrationId', required: true })
  @ApiHeader({ name: 'linkedUserId', required: true })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original ${VerticalCap} software.',
  })
  //@ApiCustomResponse(${ObjectCap}Response)
  @Get()
  get${ObjectCap}s(
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.${objectType}Service.get${ObjectCap}s(
      integrationId,
      linkedUserId,
      remote_data,
    );
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
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original ${VerticalCap} software.',
  })
  //@ApiCustomResponse(${ObjectCap}Response)
  @Get(':id')
  get${ObjectCap}(
    @Param('id') id: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.${objectType}Service.get${ObjectCap}(id, remote_data);
  }

  @ApiOperation({
    operationId: 'add${ObjectCap}',
    summary: 'Create a ${ObjectCap}',
    description: 'Create a ${objectType} in any supported ${VerticalCap} software',
  })
  @ApiHeader({
    name: 'integrationId',
    required: true,
    description: 'The integration ID',
    example: '6aa2acf3-c244-4f85-848b-13a57e7abf55',
  })
  @ApiHeader({
    name: 'linkedUserId',
    required: true,
    description: 'The linked user ID',
    example: 'b008e199-eda9-4629-bd41-a01b6195864a',
  })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original ${VerticalCap} software.',
  })
  @ApiBody({ type: Unified${ObjectCap}Input })
  //@ApiCustomResponse(${ObjectCap}Response)
  @Post()
  add${ObjectCap}(
    @Body() unified${ObjectCap}Data: Unified${ObjectCap}Input,
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.${objectType}Service.add${ObjectCap}(
      unified${ObjectCap}Data,
      integrationId,
      linkedUserId,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'add${ObjectCap}s',
    summary: 'Add a batch of ${ObjectCap}s',
  })
  @ApiHeader({ name: 'integrationId', required: true })
  @ApiHeader({ name: 'linkedUserId', required: true })
  @ApiQuery({
    name: 'remoteData',
    required: false,
    type: Boolean,
    description:
      'Set to true to include data from the original ${VerticalCap} software.',
  })
  @ApiBody({ type: Unified${ObjectCap}Input, isArray: true })
  //@ApiCustomResponse(${ObjectCap}Response)
  @Post('batch')
  add${ObjectCap}s(
    @Body() unfied${ObjectCap}Data: Unified${ObjectCap}Input[],
    @Headers('integrationId') integrationId: string,
    @Headers('linkedUserId') linkedUserId: string,
    @Query('remoteData') remote_data?: boolean,
  ) {
    return this.${objectType}Service.batchAdd${ObjectCap}s(
      unfied${ObjectCap}Data,
      integrationId,
      linkedUserId,
      remote_data,
    );
  }

  @ApiOperation({
    operationId: 'update${ObjectCap}',
    summary: 'Update a ${ObjectCap}',
  })
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
