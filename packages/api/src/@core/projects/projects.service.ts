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

  async getProjectsByUser(userId: string) {
    try {
      console.log("UserId in getProjectsByUser : ", userId);

      // If userId is stytch_id then it should start with user

      if (userId.startsWith("user")) {
        const { id_user } = await this.prisma.users.findFirst({
          where: {
            id_stytch: userId
          }
        });
        if (!id_user) {
          throw new Error("User Not found");
        }

        return await this.prisma.projects.findMany({
          where: {
            id_user: id_user,
          },
        });


      }

      return await this.prisma.projects.findMany({
        where: {
          id_user: userId,
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
