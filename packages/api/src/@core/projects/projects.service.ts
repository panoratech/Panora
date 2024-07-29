import { Injectable } from '@nestjs/common';
import {
  ConnectorCategory,
  providersArray,
  slugFromCategory,
} from '@panora/shared';
import { v4 as uuidv4 } from 'uuid';
import { LoggerService } from '../@core-services/logger/logger.service';
import { PrismaService } from '../@core-services/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(ProjectsService.name);
  }

  async getProjects() {
    try {
      return await this.prisma.projects.findMany();
    } catch (error) {
      throw error;
    }
  }

  async getProjectsByUser(userId: string) {
    try {
      return await this.prisma.projects.findMany({
        where: {
          id_user: userId,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async createProject(data: CreateProjectDto) {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          id_user: data.id_user,
        },
      });
      if (!user) throw ReferenceError('User undefined');
      const ACTIVE_CONNECTORS = providersArray();
      // update project-connectors table for the project
      const updateData: any = {
        id_connector_set: uuidv4(),
      };

      ACTIVE_CONNECTORS.forEach((connector) => {
        if (connector.vertical) {
          // Construct the property name using the vertical name
          const propertyName = `${slugFromCategory(
            connector.vertical as ConnectorCategory,
          )}_`;
          // Add the property to updateData with a value of true
          updateData[propertyName + connector.name] = true;
        }
      });
      const cSet = await this.prisma.connector_sets.create({
        data: updateData,
      });

      const res = await this.prisma.projects.create({
        data: {
          name: data.name,
          sync_mode: 'pull',
          id_project: uuidv4(),
          id_user: data.id_user,
          id_connector_set: cSet.id_connector_set,
        },
      });
      return res;
    } catch (error) {
      throw error;
    }
  }
}
