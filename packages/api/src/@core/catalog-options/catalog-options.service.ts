import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { handleServiceError } from '@@core/utils/errors';
import { CreateCatalogOptionsDto } from './dto/catalog-options.dto';

@Injectable()
export class CatalogOptionsService {
    constructor(private prisma: PrismaService, private logger: LoggerService) {
        this.logger.setContext(CatalogOptionsService.name);
    }

    async createCatalogOptions(data: CreateCatalogOptionsDto) {
        try {
            const { id_user, selected_catalog } = data;
            const existingCatalogOptions = await this.prisma.catalog_options.findFirst({
                where: {
                    id_user
                }
            });

            if (!existingCatalogOptions) {
                const res = await this.prisma.catalog_options.create({
                    data: {
                        id_catalog_option: uuidv4(),
                        selected_catalog: selected_catalog,
                        id_user: id_user
                    }
                });

                return res;
            }
            const res = await this.prisma.catalog_options.update({
                where: {
                    id_catalog_option: existingCatalogOptions.id_catalog_option
                },
                data: {
                    selected_catalog: selected_catalog
                }
            });

            return res;

        } catch (error) {
            handleServiceError(error, this.logger);
        }
    }

    async getCatalogByProjectId(id_project: string) {
        try {
            const user = await this.prisma.projects.findFirst({
                where: {
                    id_project
                },
                select: {
                    id_user: true
                }
            });

            if (!user) {
                throw new NotFoundException("Project Id does not exist!")
            }

            const res = await this.prisma.catalog_options.findFirst({
                where: {
                    id_user: user.id_user
                }
            });
            if (!res) {
                throw new NotFoundException("Catalog Options not found for current User!")
            }

            return res


        } catch (error) {
            handleServiceError(error, this.logger);
        }
    }


    async getCatalogByUserId(id_user: string) {

        try {

            const res = await this.prisma.catalog_options.findFirst({
                where: {
                    id_user: id_user
                }
            });
            if (!res) {
                throw new NotFoundException("Catalog Options not found for current User!")
            }

            return res;


        } catch (error) {
            handleServiceError(error, this.logger);
        }

    }



}
