import { Module } from '@nestjs/common';
import { ContactService } from './services/contact.service';
import { ContactController } from './contact.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { FreshSalesService } from './services/freshsales';

@Module({
  controllers: [ContactController],
  providers: [ContactService, PrismaService, FreshSalesService],
})
export class ContactModule {}
