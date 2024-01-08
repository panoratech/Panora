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

export const domains = {
  CRM: {
    hubspot: 'https://api.hubapi.com',
    zoho: 'https://www.zohoapis.eu/crm/v3',
    zendesk: 'https://api.getbase.com/v2',
    freshsales: '',
    pipedrive: 'https://api.pipedrive.com',
  },
};

export const customPropertiesUrls = {
  CRM: {
    hubspot: `${domains['CRM']['hubspot']}/properties/v1/contacts/properties`,
    zoho: `${domains['CRM']['zoho']}/settings/fields?module=Contact`,
    zendesk: `${domains['CRM']['zendesk']}/contact/custom_fields`,
    freshsales: `${domains['CRM']['freshsales']}`, //TODO
    pipedrive: `${domains['CRM']['pipedrive']}/v1/personFields`,
  },
};

//TMP: its shared

export enum ProviderVertical {
  CRM = 'CRM',
  HRIS = 'HRIS',
  ATS = 'ATS',
  Accounting = 'Accounting',
  Ticketing = 'Ticketing',
  MarketingAutomation = 'Marketing Automation',
  FileStorage = 'File Storage',
  Unknown = 'Unknown',
}

export enum CrmProviders {
  ZOHO = 'zoho',
  ZENDESK = 'zendesk',
  HUBSPOT = 'hubspot',
  PIPEDRIVE = 'pipedrive',
  FRESHSALES = 'freshsales',
}

export enum AccountingProviders {
  PENNYLANE = 'pennylane',
  FRESHBOOKS = 'freshbooks',
  CLEARBOOKS = 'clearbooks',
  FREEAGENT = 'freeagent',
  SAGE = 'sage',
}

export const categoriesVerticals = Object.values(ProviderVertical);

export const CRM_PROVIDERS = [
  'zoho',
  'zendesk',
  'hubspot',
  'pipedrive',
  'freshsales',
];

export const HRIS_PROVIDERS = [''];
export const ATS_PROVIDERS = [''];
export const ACCOUNTING_PROVIDERS = [''];
export const TICKETING_PROVIDERS = ['zendesk_tcg', 'front']; //TODO: add github
export const MARKETING_AUTOMATION_PROVIDERS = [''];
export const FILE_STORAGE_PROVIDERS = [''];

export function getProviderVertical(providerName: string): ProviderVertical {
  if (CRM_PROVIDERS.includes(providerName)) {
    return ProviderVertical.CRM;
  }
  if (HRIS_PROVIDERS.includes(providerName)) {
    return ProviderVertical.HRIS;
  }
  if (ATS_PROVIDERS.includes(providerName)) {
    return ProviderVertical.ATS;
  }
  if (ACCOUNTING_PROVIDERS.includes(providerName)) {
    return ProviderVertical.Accounting;
  }
  if (TICKETING_PROVIDERS.includes(providerName)) {
    return ProviderVertical.Ticketing;
  }
  if (MARKETING_AUTOMATION_PROVIDERS.includes(providerName)) {
    return ProviderVertical.MarketingAutomation;
  }
  if (FILE_STORAGE_PROVIDERS.includes(providerName)) {
    return ProviderVertical.FileStorage;
  }
  return ProviderVertical.Unknown;
}

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
