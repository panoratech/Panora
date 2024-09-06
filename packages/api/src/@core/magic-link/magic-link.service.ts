import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../@core-services/logger/logger.service';
import { PrismaService } from '../@core-services/prisma/prisma.service';
import { CreateMagicLinkDto } from './dto/create-magic-link.dto';

@Injectable()
export class MagicLinkService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(MagicLinkService.name);
  }

  async getMagicLinks() {
    try {
      return await this.prisma.invite_links.findMany();
    } catch (error) {
      throw error;
    }
  }

  async getMagicLink(id: string) {
    try {
      const inviteLink = await this.prisma.invite_links.findFirst({
        where: {
          id_invite_link: id,
        },
      });
      if (!inviteLink) throw new ReferenceError('Magic link undefined');
      const linkedUser = await this.prisma.linked_users.findFirst({
        where: {
          id_linked_user: inviteLink.id_linked_user,
        },
      });
      if (!linkedUser) throw new ReferenceError('Linked User undefined');
      return {
        ...inviteLink,
        id_project: linkedUser.id_project,
      };
    } catch (error) {
      throw error;
    }
  }

  async createUniqueLink(data: CreateMagicLinkDto) {
    try {
      const checkDup = await this.prisma.linked_users.findFirst({
        where: {
          linked_user_origin_id: data.linked_user_origin_id,
          id_project: data.id_project,
        },
      });
      let linked_user_id: string;
      if (checkDup) {
        linked_user_id = checkDup.id_linked_user;
      } else {
        const res = await this.prisma.linked_users.create({
          data: {
            linked_user_origin_id: data.linked_user_origin_id,
            alias: data.alias,
            id_linked_user: uuidv4(),
            id_project: data.id_project,
          },
        });
        linked_user_id = res.id_linked_user;
      }
      //todo : handle status of links
      const res = await this.prisma.invite_links.create({
        data: {
          id_invite_link: uuidv4(),
          status: 'generated',
          email: data.email,
          id_linked_user: linked_user_id,
        },
      });
      return res;
    } catch (error) {
      throw error;
    }
  }
}
