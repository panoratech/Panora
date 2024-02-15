import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { PaginationDto } from '@@core/utils/dtos/pagination.dto';
import { handleServiceError } from '@@core/utils/errors';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(EventsService.name);
  }
  async findEvents(dto: PaginationDto) {
    try {
      return await this.prisma.events.findMany({
        orderBy: { timestamp: 'desc' },
        skip: (dto.page - 1) * dto.pageSize,
        take: dto.pageSize,
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getEventsCount() {
    try {
      return await this.prisma.events.count();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
