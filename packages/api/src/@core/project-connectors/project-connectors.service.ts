import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { ConnectorSetError, throwTypedError } from '@@core/utils/errors';

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
      const project = await this.prisma.projects.findFirst({
        where: {
          id_project: id_project,
        },
      });

      if (!project) {
        throw new ReferenceError('Project undefined!');
      }
      const existingPConnectors = await this.prisma.connector_sets.findFirst({
        where: {
          id_connector_set: project.id_connector_set,
        },
      });

      if (!existingPConnectors) {
        throw new ReferenceError(
          `No connector set entry found for project ${id_project}`,
        );
      }

      const updateData: any = {
        [column]: status, // Use computed property names to set the column dynamically
      };

      const res = await this.prisma.connector_sets.update({
        where: {
          id_connector_set: existingPConnectors.id_connector_set,
        },
        data: updateData,
      });
      return res;
    } catch (error) {
      throw error;
    }
  }

  /*async createProjectConnectors(data: TypeCustom) {
    try {
      const updateData: any = {
        id_connector_set: uuidv4(),
        crm_hubspot: data.crm_hubspot,
        crm_zoho: data.crm_zoho,
        crm_zendesk: data.crm_zendesk,
        crm_pipedrive: data.crm_pipedrive,
        crm_attio: data.crm_attio,
        tcg_zendesk: data.tcg_zendesk,
        tcg_gorgias: data.tcg_gorgias,
        tcg_front: data.tcg_front,
        tcg_jira: data.tcg_jira,
        tcg_gitlab: data.tcg_gitlab,
        crm_close: data.crm_close,
      };

      const res = await this.prisma.connector_sets.create({
        data: updateData,
      });
      return res;
    } catch (error) {
            throw error;

    }
  }*/

  async getConnectorsByProjectId(id_project: string) {
    try {
      const project = await this.prisma.projects.findFirst({
        where: {
          id_project,
        },
      });

      if (!project) {
        throw new ReferenceError('Project undefined!');
      }

      const res = await this.prisma.connector_sets.findFirst({
        where: {
          id_connector_set: project.id_connector_set,
        },
      });
      if (!res) {
        throw new ReferenceError('Connector set undefined!');
      }
      return res;
    } catch (error) {
      throw error;
    }
  }
}
