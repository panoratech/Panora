import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';

@Injectable()
export class ValidateUserService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {}

  async validate(user_id: string, project_id: string) {
    try {
      const project = await this.prisma.projects.findUnique({
        where: {
          id_project: project_id,
        },
      });
      if (project.id_user !== user_id) {
        throw new ReferenceError('User mismatch');
      }
      return true;
    } catch (error) {
      throw error;
    }
  }
}
