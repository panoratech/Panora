import { CrmObject, UnifiedCrm } from '@crm/@lib/@types';
import { HrisObject } from '@hris/@lib/@types';
import { AtsObject } from '@ats/@lib/@types';
import { AccountingObject } from '@accounting/@lib/@types';
import { TicketingObject, UnifiedTicketing } from '@ticketing/@lib/@types';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';
import { Type, applyDecorators } from '@nestjs/common';
import { FileStorageObject } from '@filestorage/@lib/@types';
import { MarketingAutomationObject } from '@marketingautomation/@lib/@types';

export type Unified = UnifiedCrm | UnifiedTicketing;
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
