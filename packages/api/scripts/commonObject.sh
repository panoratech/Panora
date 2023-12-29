# Check if object type and Ticketing replacement are provided
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
import { ServiceRegistry } from '@${VerticalLow}/@utils/@registry/registry.service';
import { Original${ObjectCap}Output } from '@@core/utils/types/original.output';
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

  // Additional methods and logic
}
EOF

cat > "sync/sync.service.ts" <<EOF
import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { NotFoundError, handleServiceError } from '@@core/utils/errors';
import { Cron } from '@nestjs/schedule';
import { ApiResponse, TICKETING_PROVIDERS } from '@@core/utils/types';
import { v4 as uuidv4 } from 'uuid';
import { FieldMappingService } from '@@core/field-mapping/field-mapping.service';
import { ServiceRegistry } from '@${VerticalLow}/@utils/@registry/registry.service';
import { Original${ObjectCap}Output } from '@@core/utils/types/original.output';
import { unify } from '@@core/utils/unification/unify';
import { ${VerticalCap}Object } from '@${VerticalLow}/@utils/@types';
import { WebhookService } from '@@core/webhook/webhook.service';
import { Unified${ObjectCap}Output } from '../types/model.unified';
import { I${ObjectCap}Service } from '../types';

@Injectable()
export class Sync${ObjectCap}sService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private webhook: WebhookService,
    private fieldMappingService: FieldMappingService,
    private serviceRegistry: ServiceRegistry,
  ) {
    this.logger.setContext(Sync${ObjectCap}sService.name);
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
import { Original${ObjectCap}Output } from '@@core/utils/types/original.output';
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
// Content for mappingsTypes.ts
EOF

cat > "types/model.unified.ts" <<EOF
export class Unified${ObjectCap}Input {}

export class Unified${ObjectCap}Output extends Unified${ObjectCap}Input {}
EOF

cat > "utils/index.ts" <<EOF
EOF

cd ..

# NestJS CLI commands to generate module and controller
nest g module $objectType
nest g controller $objectType

cd $baseDir
rm "${objectType}.controller.spec.ts"


echo "Folders and files for $objectType object with $verticalObject replacements created successfully."
