import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';

@Injectable()
export class Utils {
  constructor(private readonly prisma: PrismaService) {}
}
