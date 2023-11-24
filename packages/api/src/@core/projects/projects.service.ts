import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerService } from '../logger/logger.service';
import { CreateProjectDto } from './dto/create-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(ProjectsService.name);
  }
  async createProject(data: CreateProjectDto) {
    const { id_organization, ...rest } = data;
    const res = await this.prisma.projects.create({
      data: {
        ...rest,
        id_organization: Number(id_organization),
      },
    });
  }
}
