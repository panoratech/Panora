import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateMagicLinkDto } from './dto/create-magic-link.dto';
import { MagicLinksError, throwTypedError } from '@@core/utils/errors';

@Injectable()
export class MagicLinkService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(MagicLinkService.name);
  }

  async getMagicLinks() {
    try {
      return await this.prisma.invite_links.findMany();
    } catch (error) {
      throwTypedError(
        new MagicLinksError({
          name: 'GET_MAGIC_LINKS_ERROR',
          message: 'MagicLinkService.getMagicLinks() call failed',
          cause: error,
        }),
        this.logger,
      );
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
      throwTypedError(
        new MagicLinksError({
          name: 'GET_MAGIC_LINK_ERROR',
          message: 'MagicLinkService.getMagicLink() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }

  async createUniqueLink(data: CreateMagicLinkDto) {
    try {
      const checkDup = await this.prisma.linked_users.findFirst({
        where: {
          linked_user_origin_id: data.linked_user_origin_id,
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
      throwTypedError(
        new MagicLinksError({
          name: 'CREATE_MAGIC_LINK_ERROR',
          message: 'MagicLinkService.createUniqueLink() call failed',
          cause: error,
        }),
        this.logger,
      );
    }
  }
}
