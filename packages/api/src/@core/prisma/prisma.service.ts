import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      console.log('new connection started...');
      await this.$connect();
    } catch (error) {
      throw new Error(error);
    }
  }
}
