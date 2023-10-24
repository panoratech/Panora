import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CrmService } from './crm.service';
import { CreateCrmDto } from './dto/create-crm.dto';
import { UpdateCrmDto } from './dto/update-crm.dto';

@Controller('crm')
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post()
  create(@Body() createCrmDto: CreateCrmDto) {
    return this.crmService.create(createCrmDto);
  }

  @Get()
  findAll() {
    return this.crmService.findAllContacts();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.crmService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCrmDto: UpdateCrmDto) {
    return this.crmService.update(+id, updateCrmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.crmService.remove(+id);
  }
}
