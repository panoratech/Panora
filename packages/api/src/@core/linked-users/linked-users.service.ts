import { Injectable } from '@nestjs/common';
import { CreateLinkedUserDto } from './dto/create-linked-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LinkedUsersService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(LinkedUsersService.name);
  }
  async getLinkedUsers() {
    return await this.prisma.linked_users.findMany();
  }
  async getLinkedUser(id: string) {
    return await this.prisma.linked_users.findFirst({
      where: {
        id_linked_user: id,
      },
    });
  }
  async addLinkedUser(data: CreateLinkedUserDto) {
    const { id_project, ...rest } = data;
    const res = await this.prisma.linked_users.create({
      data: {
        ...rest,
        id_linked_user: uuidv4(),
        id_project: id_project,
      },
    });
    return res;
    //this.logger.log('Added new linked_user ' + data);
  }
}
