import { Injectable } from '@nestjs/common';
import { LoggerService } from 'src/@core/logger/logger.service';
import { PrismaService } from 'src/@core/prisma/prisma.service';

@Injectable()
export class DealService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(DealService.name);
  }
}
