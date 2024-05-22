import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { handleServiceError } from '@@core/utils/errors';

@Injectable()
export class ProjectConnectorsService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(ProjectConnectorsService.name);
  }

  // TODO: create a function that accepts a "vertical_connector" and insert it inside the table for all projects setting to true by default
  // it would be used when a new connector is built and needs to be insert inside our tbale
  async updateProjectConnectors(
    column: string,
    status: boolean,
    id_project: string,
  ) {
    try {
      const existingPConnectors =
        await this.prisma.project_connectors.findFirst({
          where: {
            id_project: id_project,
          },
        });

      if (!existingPConnectors) {
        throw new Error(
          `No project connector entry found for project ${id_project}`,
        );
      }

      const updateData = {
        [column]: status, // Use computed property names to set the column dynamically
      };

      const res = await this.prisma.project_connectors.update({
        where: {
          id_project_connector: existingPConnectors.id_project_connector,
        },
        data: updateData,
      });
      return res;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getConnectorsByProjectId(id_project: string) {
    try {
      const project = await this.prisma.projects.findFirst({
        where: {
          id_project,
        },
      });

      if (!project) {
        throw new NotFoundException('Project does not exist!');
      }

      const res = await this.prisma.project_connectors.findFirst({
        where: {
          id_project: id_project,
        },
      });
      if (!res) {
        throw new NotFoundException(
          'Connectors not found for current project!',
        );
      }
      return res;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
