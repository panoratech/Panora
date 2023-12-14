import { LoggerService } from '@@core/logger/logger.service';
import { PrismaService } from '@@core/prisma/prisma.service';
import { handleServiceError } from '@@core/utils/errors';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(EventsService.name);
  }
  async findEvents() {
    try {
      return await this.prisma.events.findMany();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
