import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(ProjectsService.name);
  }

  async getProjects() {
    return await this.prisma.projects.findMany();
  }
  async createProject(data: CreateProjectDto) {
    const { id_organization, ...rest } = data;
    const res = await this.prisma.projects.create({
      data: {
        ...rest,
        id_project: uuidv4(),
        id_organization: id_organization,
      },
    });
    return res;
  }
}
