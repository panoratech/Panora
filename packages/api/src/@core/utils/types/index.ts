import { CrmObject, UnifiedCrm } from '@crm/@utils/@types';
import { HrisObject } from '@hris/@types';
import { AtsObject, UnifiedAts } from '@ats/@types';
import { AccountingObject } from '@accounting/@types';
import { MarketingAutomationObject } from '@marketing-automation/@types';
import { TicketingObject, UnifiedTicketing } from '@ticketing/@utils/@types';
import { FileStorageObject } from '@file-storage/@types';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { Type, applyDecorators } from '@nestjs/common';

export type Unified = UnifiedCrm | UnifiedAts | UnifiedTicketing;
export type UnifyReturnType = Unified | Unified[];
export type TargetObject =
  | CrmObject
  | HrisObject
  | AtsObject
  | AccountingObject
  | FileStorageObject
  | MarketingAutomationObject
  | TicketingObject;

export type StandardObject = TargetObject;

//API RESPONSE
export class ApiResponse<T> {
  data: T;
  @ApiPropertyOptional()
  message?: string;
  @ApiPropertyOptional()
  error?: string;
  @ApiProperty({ type: Number })
  statusCode: number;
}

export const ApiCustomResponse = <DataDto extends Type<unknown>>(
  dataDto: DataDto,
) =>
  applyDecorators(
    ApiExtraModels(ApiResponse, dataDto),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(dataDto) },
            },
          },
        ],
      },
    }),
  );
