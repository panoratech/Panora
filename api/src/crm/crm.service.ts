import { Injectable } from '@nestjs/common';
import { CreateCrmDto } from './dto/create-crm.dto';
import { UpdateCrmDto } from './dto/update-crm.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CrmService {
  constructor(private prisma: PrismaService) {}

  create(createCrmDto: CreateCrmDto) {
    return 'This action adds a new crm';
  }

  async findAllContacts() {
    const res = await this.prisma.crm_contacts.findMany();
    return res;
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
