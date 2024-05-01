import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/prisma/prisma.service';
import { LoggerService } from '@@core/logger/logger.service';
import { handleServiceError } from '@@core/utils/errors';

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
        throw new Error('Unauthorized call from sender');
      }
      return true;
    } catch (error) {
      handleServiceError(error, this.logger);
    }
  }
}
