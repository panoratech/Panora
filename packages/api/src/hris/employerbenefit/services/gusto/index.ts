import { EncryptionService } from '@@core/@core-services/encryption/encryption.service';
import { EnvironmentService } from '@@core/@core-services/environment/environment.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { ApiResponse } from '@@core/utils/types';
import { SyncParam } from '@@core/utils/types/interface';
import { HrisObject } from '@hris/@lib/@types';
import { IEmployerBenefitService } from '@hris/employerbenefit/types';
import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ServiceRegistry } from '../registry.service';
import { GustoEmployerbenefitOutput } from './types';

@Injectable()
export class GustoService implements IEmployerBenefitService {
  constructor(
    private prisma: PrismaService,
    private logger: LoggerService,
    private cryptoService: EncryptionService,
    private env: EnvironmentService,
    private registry: ServiceRegistry,
  ) {
    this.logger.setContext(
      HrisObject.employerbenefit.toUpperCase() + ':' + GustoService.name,
    );
    this.registry.registerService('gusto', this);
  }

  async sync(
    data: SyncParam,
  ): Promise<ApiResponse<GustoEmployerbenefitOutput[]>> {
    try {
      const { linkedUserId, id_company } = data;

      const connection = await this.prisma.connections.findFirst({
        where: {
          id_linked_user: linkedUserId,
          provider_slug: 'gusto',
          vertical: 'hris',
        },
      });

      const company = await this.prisma.hris_companies.findUnique({
        where: {
          id_hris_company: id_company as string,
        },
        select: {
          remote_id: true,
        },
      });

      const resp = await axios.get(
        `${connection.account_url}/v1/companies/${company.remote_id}/company_benefits`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.cryptoService.decrypt(
              connection.access_token,
            )}`,
          },
        },
      );

      const resp_ = await axios.get(`${connection.account_url}/v1/benefits`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.cryptoService.decrypt(
            connection.access_token,
          )}`,
        },
      });

      const res = [];
      for (const employerBenefit of resp.data) {
        const pick = resp_.data.filter(
          (item) => item.benefit_type == employerBenefit.benefit_type,
        );
        res.push({
          ...employerBenefit,
          category: pick.category,
          name: pick.name,
        });
      }

      this.logger.log(`Synced gusto employerbenefits !`);

      return {
        data: res,
        message: 'Gusto employerbenefits retrieved',
        statusCode: 200,
      };
    } catch (error) {
      throw error;
    }
  }
}
