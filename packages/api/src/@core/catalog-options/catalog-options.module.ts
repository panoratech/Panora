import { Module } from '@nestjs/common';
import { CatalogOptionsService } from './catalog-options.service';
import { CatalogOptionsController } from './catalog-options.controller';
import { LoggerService } from '../logger/logger.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    providers: [CatalogOptionsService, LoggerService, PrismaService],
    controllers: [CatalogOptionsController],
})
export class CatalogOptionsModule { }
