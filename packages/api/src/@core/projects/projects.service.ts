import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { v4 as uuidv4 } from 'uuid';
import { handleServiceError } from '@@core/utils/errors';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(ProjectsService.name);
  }

  async getProjects() {
    try {
      return await this.prisma.projects.findMany();
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async getProjectsByUser(stytchUserId: string) {
    try {
      const user = await this.prisma.users.findUnique({
        where: {
          id_stytch: stytchUserId,
        },
      });
      return await this.prisma.projects.findMany({
        where: {
          id_user: user.id_user,
        },
      });
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }

  async createProject(data: CreateProjectDto) {
    try {
      const { id_organization, ...rest } = data;
      const res = await this.prisma.projects.create({
        data: {
          ...rest,
          sync_mode: 'pool',
          id_project: uuidv4(),
          id_user: data.id_user,
          //id_organization: id_organization,
        },
      });
      return res;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
