import { Injectable } from '@nestjs/common';
import { CreateLinkedUserDto } from './dto/create-linked-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { handleServiceError } from '@@core/utils/errors';

@Injectable()
export class LinkedUsersService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(LinkedUsersService.name);
  }
  async getLinkedUsers() {
    try {
      return await this.prisma.linked_users.findMany();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
  async getLinkedUser(id: string) {
    try {
      return await this.prisma.linked_users.findFirst({
        where: {
          id_linked_user: id,
        },
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
  async addLinkedUser(data: CreateLinkedUserDto) {
    try {
      const { id_project, ...rest } = data;
      const res = await this.prisma.linked_users.create({
        data: {
          ...rest,
          id_linked_user: uuidv4(),
          id_project: id_project,
        },
      });
      return res;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
