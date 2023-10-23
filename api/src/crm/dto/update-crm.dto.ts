import { PartialType } from '@nestjs/mapped-types';
import { CreateCrmDto } from './create-crm.dto';

export class UpdateCrmDto extends PartialType(CreateCrmDto) {}
