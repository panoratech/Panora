import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../@core-services/logger/logger.service';
import { PrismaService } from '../@core-services/prisma/prisma.service';
import {
  CreateBatchLinkedUserDto,
  CreateLinkedUserDto,
} from './dto/create-linked-user.dto';

@Injectable()
export class LinkedUsersService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(LinkedUsersService.name);
  }
  async getLinkedUsers(project_id: string) {
    try {
      return await this.prisma.linked_users.findMany({
        where: {
          id_project: project_id,
        },
      });
    } catch (error) {
      throw error;
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
      throw error;
    }
  }
  async getLinkedUserV2(originId: string) {
    try {
      return await this.prisma.linked_users.findFirst({
        where: {
          linked_user_origin_id: originId,
        },
      });
    } catch (error) {
      throw error;
    }
  }
  async addLinkedUser(data: CreateLinkedUserDto, id_project: string) {
    try {
      const res = await this.prisma.linked_users.create({
        data: {
          ...data,
          id_linked_user: uuidv4(),
          id_project: id_project,
        },
      });
      return res;
    } catch (error) {
      throw error;
    }
  }
  async addBatchLinkedUsers(
    data: CreateBatchLinkedUserDto,
    id_project: string,
  ) {
    try {
      const { linked_user_origin_ids, alias } = data;

      const linkedUsersData = linked_user_origin_ids.map((id) => ({
        id_linked_user: uuidv4(), // Ensure each user gets a unique ID
        linked_user_origin_id: id,
        alias,
        id_project,
      }));

      const res = await this.prisma.linked_users.createMany({
        data: linkedUsersData,
        skipDuplicates: true, // Optional: skip entries if they already exist
      });

      return res;
    } catch (error) {
      throw error;
    }
  }
}
