import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { PaginationDto } from '@@core/utils/dtos/pagination.dto';
import { EventsError, throwTypedError } from '@@core/utils/errors';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(EventsService.name);
  }
  async findEvents(dto: PaginationDto, project_id: string) {
    try {
      // First, fetch the linked_users related to the project_id
      const linkedUsers = await this.prisma.linked_users.findMany({
        where: {
          id_project: project_id,
        },
        select: {
          id_linked_user: true,
        },
      });

      // Extract the ids of the linked_users
      const linkedUserIds = linkedUsers.map((user) => user.id_linked_user);

      // Then, use those ids to filter the events
      return await this.prisma.events.findMany({
        orderBy: { timestamp: 'desc' },
        skip: (dto.page - 1) * dto.limit,
        take: dto.limit,
        where: {
          id_linked_user: {
            in: linkedUserIds,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getEventsCount(id_project: string) {
    try {
      const linkedUsers = await this.prisma.linked_users.findMany({
        where: {
          id_project,
        },
        select: {
          id_linked_user: true,
        },
      });

      // Extract the ids of the linked_users
      const linkedUserIds = linkedUsers.map((user) => user.id_linked_user);

      return await this.prisma.events.count({
        where: {
          id_linked_user: {
            in: linkedUserIds,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
