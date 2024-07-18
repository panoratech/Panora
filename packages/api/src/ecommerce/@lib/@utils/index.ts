import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';

@Injectable()
export class Utils {
  constructor(private readonly prisma: PrismaService) {}
}
