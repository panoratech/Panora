import { ICompanyService } from '@crm/company/types';
import {
  UnifiedCrmCompanyInput,
  UnifiedCrmCompanyOutput,
} from '@crm/company/types/model.unified';
import { IContactService } from '@crm/contact/types';
import {
  UnifiedCrmContactInput,
  UnifiedCrmContactOutput,
} from '@crm/contact/types/model.unified';
import { IDealService } from '@crm/deal/types';
import {
  UnifiedCrmDealInput,
  UnifiedCrmDealOutput,
} from '@crm/deal/types/model.unified';
import { IEngagementService } from '@crm/engagement/types';
import {
  UnifiedCrmEngagementInput,
  UnifiedCrmEngagementOutput,
} from '@crm/engagement/types/model.unified';

import { INoteService } from '@crm/note/types';
import {
  UnifiedCrmNoteInput,
  UnifiedCrmNoteOutput,
} from '@crm/note/types/model.unified';
import { IStageService } from '@crm/stage/types';
import {
  UnifiedCrmStageInput,
  UnifiedCrmStageOutput,
} from '@crm/stage/types/model.unified';
import { ITaskService } from '@crm/task/types';
import {
  UnifiedCrmTaskInput,
  UnifiedCrmTaskOutput,
} from '@crm/task/types/model.unified';
import { IUserService } from '@crm/user/types/';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  UnifiedCrmUserInput,
  UnifiedCrmUserOutput,
} from '@crm/user/types/model.unified';
import { IsIn, IsOptional, IsString } from 'class-validator';

export enum CrmObject {
  company = 'company',
  contact = 'contact',
  deal = 'deal',
  lead = 'lead',
  note = 'note',
  task = 'task',
  engagement = 'engagement',
  stage = 'stage',
  user = 'user',
}

export type UnifiedCrm =
  | UnifiedCrmContactInput
  | UnifiedCrmContactOutput
  | UnifiedCrmCompanyInput
  | UnifiedCrmCompanyOutput
  | UnifiedCrmDealInput
  | UnifiedCrmDealOutput
  | UnifiedCrmEngagementInput
  | UnifiedCrmEngagementOutput
  | UnifiedCrmNoteInput
  | UnifiedCrmNoteOutput
  | UnifiedCrmStageInput
  | UnifiedCrmStageOutput
  | UnifiedCrmTaskInput
  | UnifiedCrmTaskOutput
  | UnifiedCrmUserInput
  | UnifiedCrmUserOutput;

export type ICrmService =
  | IContactService
  | IUserService
  | IEngagementService
  | INoteService
  | IDealService
  | ITaskService
  | IStageService
  | ICompanyService;

export const ENGAGEMENTS_TYPE = ['CALL', 'MEETING', 'EMAIL'];

export enum Industry {
  ACCOUNTING = 'ACCOUNTING',
  AIRLINES_AVIATION = 'AIRLINES_AVIATION',
  ALTERNATIVE_DISPUTE_RESOLUTION = 'ALTERNATIVE_DISPUTE_RESOLUTION',
  ALTERNATIVE_MEDICINE = 'ALTERNATIVE_MEDICINE',
  ANIMATION = 'ANIMATION',
  APPAREL_FASHION = 'APPAREL_FASHION',
  ARCHITECTURE_PLANNING = 'ARCHITECTURE_PLANNING',
  ARTS_AND_CRAFTS = 'ARTS_AND_CRAFTS',
  AUTOMOTIVE = 'AUTOMOTIVE',
  AVIATION_AEROSPACE = 'AVIATION_AEROSPACE',
  BANKING = 'BANKING',
  BIOTECHNOLOGY = 'BIOTECHNOLOGY',
  BROADCAST_MEDIA = 'BROADCAST_MEDIA',
  BUILDING_MATERIALS = 'BUILDING_MATERIALS',
  BUSINESS_SUPPLIES_AND_EQUIPMENT = 'BUSINESS_SUPPLIES_AND_EQUIPMENT',
  CAPITAL_MARKETS = 'CAPITAL_MARKETS',
  CHEMICALS = 'CHEMICALS',
  CIVIC_SOCIAL_ORGANIZATION = 'CIVIC_SOCIAL_ORGANIZATION',
  CIVIL_ENGINEERING = 'CIVIL_ENGINEERING',
  COMMERCIAL_REAL_ESTATE = 'COMMERCIAL_REAL_ESTATE',
  COMPUTER_NETWORK_SECURITY = 'COMPUTER_NETWORK_SECURITY',
  COMPUTER_GAMES = 'COMPUTER_GAMES',
  COMPUTER_HARDWARE = 'COMPUTER_HARDWARE',
  COMPUTER_NETWORKING = 'COMPUTER_NETWORKING',
  COMPUTER_SOFTWARE = 'COMPUTER_SOFTWARE',
  INTERNET = 'INTERNET',
  CONSTRUCTION = 'CONSTRUCTION',
  CONSUMER_ELECTRONICS = 'CONSUMER_ELECTRONICS',
  CONSUMER_GOODS = 'CONSUMER_GOODS',
  CONSUMER_SERVICES = 'CONSUMER_SERVICES',
  COSMETICS = 'COSMETICS',
  DAIRY = 'DAIRY',
  DEFENSE_SPACE = 'DEFENSE_SPACE',
  DESIGN = 'DESIGN',
  EDUCATION_MANAGEMENT = 'EDUCATION_MANAGEMENT',
  E_LEARNING = 'E_LEARNING',
  ELECTRICAL_ELECTRONIC_MANUFACTURING = 'ELECTRICAL_ELECTRONIC_MANUFACTURING',
  ENTERTAINMENT = 'ENTERTAINMENT',
  ENVIRONMENTAL_SERVICES = 'ENVIRONMENTAL_SERVICES',
  EVENTS_SERVICES = 'EVENTS_SERVICES',
  EXECUTIVE_OFFICE = 'EXECUTIVE_OFFICE',
  FACILITIES_SERVICES = 'FACILITIES_SERVICES',
  FARMING = 'FARMING',
  FINANCIAL_SERVICES = 'FINANCIAL_SERVICES',
  FINE_ART = 'FINE_ART',
  FISHERY = 'FISHERY',
  FOOD_BEVERAGES = 'FOOD_BEVERAGES',
  FOOD_PRODUCTION = 'FOOD_PRODUCTION',
  FUND_RAISING = 'FUND_RAISING',
  FURNITURE = 'FURNITURE',
  GAMBLING_CASINOS = 'GAMBLING_CASINOS',
  GLASS_CERAMICS_CONCRETE = 'GLASS_CERAMICS_CONCRETE',
  GOVERNMENT_ADMINISTRATION = 'GOVERNMENT_ADMINISTRATION',
  GOVERNMENT_RELATIONS = 'GOVERNMENT_RELATIONS',
  GRAPHIC_DESIGN = 'GRAPHIC_DESIGN',
  HEALTH_WELLNESS_AND_FITNESS = 'HEALTH_WELLNESS_AND_FITNESS',
  HIGHER_EDUCATION = 'HIGHER_EDUCATION',
  HOSPITAL_HEALTH_CARE = 'HOSPITAL_HEALTH_CARE',
  HOSPITALITY = 'HOSPITALITY',
  HUMAN_RESOURCES = 'HUMAN_RESOURCES',
  IMPORT_AND_EXPORT = 'IMPORT_AND_EXPORT',
  INDIVIDUAL_FAMILY_SERVICES = 'INDIVIDUAL_FAMILY_SERVICES',
  INDUSTRIAL_AUTOMATION = 'INDUSTRIAL_AUTOMATION',
  INFORMATION_SERVICES = 'INFORMATION_SERVICES',
  INFORMATION_TECHNOLOGY_AND_SERVICES = 'INFORMATION_TECHNOLOGY_AND_SERVICES',
  INSURANCE = 'INSURANCE',
  INTERNATIONAL_AFFAIRS = 'INTERNATIONAL_AFFAIRS',
  INTERNATIONAL_TRADE_AND_DEVELOPMENT = 'INTERNATIONAL_TRADE_AND_DEVELOPMENT',
  INVESTMENT_BANKING = 'INVESTMENT_BANKING',
  INVESTMENT_MANAGEMENT = 'INVESTMENT_MANAGEMENT',
  JUDICIARY = 'JUDICIARY',
  LAW_ENFORCEMENT = 'LAW_ENFORCEMENT',
  LAW_PRACTICE = 'LAW_PRACTICE',
  LEGAL_SERVICES = 'LEGAL_SERVICES',
  LEGISLATIVE_OFFICE = 'LEGISLATIVE_OFFICE',
  LEISURE_TRAVEL_TOURISM = 'LEISURE_TRAVEL_TOURISM',
  LIBRARIES = 'LIBRARIES',
  LOGISTICS_AND_SUPPLY_CHAIN = 'LOGISTICS_AND_SUPPLY_CHAIN',
  LUXURY_GOODS_JEWELRY = 'LUXURY_GOODS_JEWELRY',
  MACHINERY = 'MACHINERY',
  MANAGEMENT_CONSULTING = 'MANAGEMENT_CONSULTING',
  MARITIME = 'MARITIME',
  MARKET_RESEARCH = 'MARKET_RESEARCH',
  MARKETING_AND_ADVERTISING = 'MARKETING_AND_ADVERTISING',
  MECHANICAL_OR_INDUSTRIAL_ENGINEERING = 'MECHANICAL_OR_INDUSTRIAL_ENGINEERING',
  MEDIA_PRODUCTION = 'MEDIA_PRODUCTION',
  MEDICAL_DEVICES = 'MEDICAL_DEVICES',
  MEDICAL_PRACTICE = 'MEDICAL_PRACTICE',
  MENTAL_HEALTH_CARE = 'MENTAL_HEALTH_CARE',
  MILITARY = 'MILITARY',
  MINING_METALS = 'MINING_METALS',
  MOTION_PICTURES_AND_FILM = 'MOTION_PICTURES_AND_FILM',
  MUSEUMS_AND_INSTITUTIONS = 'MUSEUMS_AND_INSTITUTIONS',
  MUSIC = 'MUSIC',
  NANOTECHNOLOGY = 'NANOTECHNOLOGY',
  NEWSPAPERS = 'NEWSPAPERS',
  NON_PROFIT_ORGANIZATION_MANAGEMENT = 'NON_PROFIT_ORGANIZATION_MANAGEMENT',
  OIL_ENERGY = 'OIL_ENERGY',
  ONLINE_MEDIA = 'ONLINE_MEDIA',
  OUTSOURCING_OFFSHORING = 'OUTSOURCING_OFFSHORING',
  PACKAGE_FREIGHT_DELIVERY = 'PACKAGE_FREIGHT_DELIVERY',
  PACKAGING_AND_CONTAINERS = 'PACKAGING_AND_CONTAINERS',
  PAPER_FOREST_PRODUCTS = 'PAPER_FOREST_PRODUCTS',
  PERFORMING_ARTS = 'PERFORMING_ARTS',
  PHARMACEUTICALS = 'PHARMACEUTICALS',
  PHILANTHROPY = 'PHILANTHROPY',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  PLASTICS = 'PLASTICS',
  POLITICAL_ORGANIZATION = 'POLITICAL_ORGANIZATION',
  PRIMARY_SECONDARY_EDUCATION = 'PRIMARY_SECONDARY_EDUCATION',
  PRINTING = 'PRINTING',
  PROFESSIONAL_TRAINING_COACHING = 'PROFESSIONAL_TRAINING_COACHING',
  PROGRAM_DEVELOPMENT = 'PROGRAM_DEVELOPMENT',
  PUBLIC_POLICY = 'PUBLIC_POLICY',
  PUBLIC_RELATIONS_AND_COMMUNICATIONS = 'PUBLIC_RELATIONS_AND_COMMUNICATIONS',
  PUBLIC_SAFETY = 'PUBLIC_SAFETY',
  PUBLISHING = 'PUBLISHING',
  RAILROAD_MANUFACTURE = 'RAILROAD_MANUFACTURE',
  RANCHING = 'RANCHING',
  REAL_ESTATE = 'REAL_ESTATE',
  RECREATIONAL_FACILITIES_AND_SERVICES = 'RECREATIONAL_FACILITIES_AND_SERVICES',
  RELIGIOUS_INSTITUTIONS = 'RELIGIOUS_INSTITUTIONS',
  RENEWABLES_ENVIRONMENT = 'RENEWABLES_ENVIRONMENT',
  RESEARCH = 'RESEARCH',
  RESTAURANTS = 'RESTAURANTS',
  RETAIL = 'RETAIL',
  SECURITY_AND_INVESTIGATIONS = 'SECURITY_AND_INVESTIGATIONS',
  SEMICONDUCTORS = 'SEMICONDUCTORS',
  SHIPBUILDING = 'SHIPBUILDING',
  SPORTING_GOODS = 'SPORTING_GOODS',
  SPORTS = 'SPORTS',
  STAFFING_AND_RECRUITING = 'STAFFING_AND_RECRUITING',
  SUPERMARKETS = 'SUPERMARKETS',
  TELECOMMUNICATIONS = 'TELECOMMUNICATIONS',
  TEXTILES = 'TEXTILES',
  THINK_TANKS = 'THINK_TANKS',
  TOBACCO = 'TOBACCO',
  TRANSLATION_AND_LOCALIZATION = 'TRANSLATION_AND_LOCALIZATION',
  TRANSPORTATION_TRUCKING_RAILROAD = 'TRANSPORTATION_TRUCKING_RAILROAD',
  UTILITIES = 'UTILITIES',
  VENTURE_CAPITAL_PRIVATE_EQUITY = 'VENTURE_CAPITAL_PRIVATE_EQUITY',
  VETERINARY = 'VETERINARY',
  WAREHOUSING = 'WAREHOUSING',
  WHOLESALE = 'WHOLESALE',
  WINE_AND_SPIRITS = 'WINE_AND_SPIRITS',
  WIRELESS = 'WIRELESS',
  WRITING_AND_EDITING = 'WRITING_AND_EDITING',
}

export const countryPhoneFormats: { [countryCode: string]: string } = {
  '+1': 'NNN-NNN-NNNN', // USA
  '+44': 'NNNN NNNNNN', // UK
  '+49': 'NNN NNNNNNN', // Germany
  '+33': 'N NN NN NN NN', // France
  '+81': 'NNN NNNN NNNN', // Japan
  '+91': 'NNNNN NNNNNN', // India
  '+86': 'NNN NNNN NNNN', // China
  '+7': 'NNN NNN-NN-NN', // Russia
  '+55': 'NN NNNNN-NNNN', // Brazil
  '+61': 'N NNNN NNNN', // Australia
  '+39': 'NNN NNNN NNNN', // Italy
  '+34': 'N NNN NNNN', // Spain
  '+62': 'NNN NNN-NNNN', // Indonesia
  '+27': 'NNN NNN NNNN', // South Africa
  '+82': 'NNN-NNNN-NNNN', // South Korea
  '+52': 'NN NNNN NNNN', // Mexico
  '+31': 'NN NNN NNNN', // Netherlands
  '+90': 'NNN NNN NN NN', // Turkey
  '+966': 'N NNN NNNN', // Saudi Arabia
  '+48': 'NN NNN NN NN', // Poland
  '+47': 'NNN NN NNN', // Norway
  '+46': 'NNN-NNN NN NN', // Sweden
  '+41': 'NNN NNN NN NN', // Switzerland
  '+60': 'NN NNN NNNN', // Malaysia
  '+66': 'N NNN NNNN', // Thailand
  '+63': 'NNN NNN NNNN', // Philippines
  '+64': 'NN NNN NNNN', // New Zealand
  '+358': 'NNN NNNNNNN', // Finland
  '+32': 'NNN NN NN NN', // Belgium
  '+43': 'NNN NNNNNNN', // Austria
  '+20': 'NNN NNNN NNNN', // Egypt
  '+98': 'NNN NNN NNNN', // Iran
  '+54': 'NN NNNN-NNNN', // Argentina
  '+84': 'NNN NNNN NNNN', // Vietnam
  '+380': 'NN NNN NNNN', // Ukraine
  '+234': 'NNN NNN NNNN', // Nigeria
  '+92': 'NNN NNNNNNN', // Pakistan
  '+880': 'NNNN NNNNNN', // Bangladesh
  '+30': 'NNN NNN NNNN', // Greece
  '+351': 'NN NNN NNNN', // Portugal
  '+36': 'NNN NNN NNN', // Hungary
  '+40': 'NNN NNN NNN', // Romania
  '+56': 'N NNNN NNNN', // Chile
  '+94': 'NN NNN NNNN', // Sri Lanka
  '+65': 'NNNN NNNN', // Singapore
  '+375': 'NNN NN-NN-NN', // Belarus
  '+353': 'NN NNN NNNN', // Ireland
  '+45': 'NN NN NN NN', // Denmark
  '+421': 'NNN NNN NNN', // Slovakia
  '+386': 'NNN NNN NNN', // Slovenia
  '+971': 'NN NNN NNNN', // UAE
  '+972': 'NNN NNN NNNN', // Israel
  '+852': 'NNNN NNNN', // Hong Kong
  '+385': 'NNN NNNN', // Croatia
  '+387': 'NNN NNNN', // Bosnia and Herzegovina
  '+389': 'NN NNN NNN', // North Macedonia
  '+381': 'NNN NNNN', // Serbia
  '+373': 'NNN NNNN', // Moldova
  '+995': 'NNN NNN NNN', // Georgia
  '+374': 'NN NNNNNN', // Armenia
  '+993': 'NNN NNNNN', // Turkmenistan
  '+996': 'NNN NNNNNN', // Kyrgyzstan
  '+998': 'NN NNN NNNN', // Uzbekistan
  '+976': 'NN NNN NNNN', // Mongolia
  '+855': 'NNN NNN NNN', // Cambodia
  '+856': 'NNN NNN NNNN', // Laos
};

export class Email {
  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The email address',
  })
  @IsString()
  email_address: string;

  @ApiProperty({
    type: String,
    //enum: ['PERSONAL', 'WORK'],
    nullable: true,
    description:
      'The email address type. Authorized values are either PERSONAL or WORK.',
  })
  ////@IsIn(['PERSONAL', 'WORK'])
  @IsString()
  email_address_type: string;

  @ApiPropertyOptional({
    type: String,
    enum: ['COMPANY', 'CONTACT'],
    nullable: true,
    description: 'The owner type of an email',
  })
  @IsString()
  @IsOptional()
  //@IsIn(['COMPANY', 'CONTACT'])
  owner_type?: string;
}

export class Phone {
  @ApiProperty({
    type: String,
    nullable: true,
    description:
      'The phone number starting with a plus (+) followed by the country code (e.g +336676778890 for France)',
  })
  @IsString()
  phone_number: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The phone type. Authorized values are either MOBILE or WORK',
  })
  @IsString()
  phone_type: string;

  @ApiPropertyOptional({
    type: String,
    nullable: true,
    description: 'The owner type of a phone number',
  })
  @IsString()
  @IsOptional()
  owner_type?: string;
}
export class Address {
  @ApiProperty({
    type: String,
    nullable: true,
    example: '5th Avenue',
    description: 'The street',
  })
  @IsString()
  street_1: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'Street 2',
    description: 'More information about the street ',
  })
  @IsString()
  @IsOptional()
  street_2?: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'New York',
    description: 'The city',
  })
  @IsString()
  city: string;

  @ApiProperty({
    type: String,
    example: 'New York',
    nullable: true,
    description: 'The state',
  })
  @IsString()
  state: string;

  @ApiProperty({
    type: String,
    example: '10001',
    nullable: true,
    description: 'The postal code',
  })
  @IsString()
  postal_code: string;

  @ApiProperty({
    type: String,
    example: 'United States of America',
    nullable: true,
    description: 'The country',
  })
  @IsString()
  country: string;

  @ApiProperty({
    type: String,
    nullable: true,
    example: 'PERSONAL',
    description:
      'The address type. Authorized values are either PERSONAL or WORK.',
  })
  @IsOptional()
  @IsString()
  address_type?: string;

  @ApiProperty({
    type: String,
    nullable: true,
    description: 'The owner type of the address',
  })
  @IsOptional()
  @IsString()
  owner_type?: string;
}

export type NormalizedContactInfo = {
  normalizedEmails: Email[];
  normalizedPhones: Phone[];
};
