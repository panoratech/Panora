import { Injectable } from '@nestjs/common';
import { CreateCrmDto } from './dto/create-crm.dto';
import { UpdateCrmDto } from './dto/update-crm.dto';

@Injectable()
export class CrmService {
  create(createCrmDto: CreateCrmDto) {
    return 'This action adds a new crm';
  }

  findAll() {
    return `This action returns all crm`;
  }

  findOne(id: number) {
    return `This action returns a #${id} crm`;
  }

  update(id: number, updateCrmDto: UpdateCrmDto) {
    return `This action updates a #${id} crm`;
  }

  remove(id: number) {
    return `This action removes a #${id} crm`;
  }
}
