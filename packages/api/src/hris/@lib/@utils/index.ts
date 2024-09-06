import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';

@Injectable()
export class Utils {
  constructor(private readonly prisma: PrismaService) {}

  async getEmployeeUuidFromRemoteId(id: string, connection_id: string) {
    try {
      const res = await this.prisma.hris_employees.findFirst({
        where: {
          remote_id: id,
          id_connection: connection_id,
        },
      });
      if (!res) return;
      return res.id_hris_employee;
    } catch (error) {
      throw error;
    }
  }

  async getCompanyUuidFromRemoteId(id: string, connection_id: string) {
    try {
      const res = await this.prisma.hris_companies.findFirst({
        where: {
          remote_id: id,
          id_connection: connection_id,
        },
      });
      if (!res) return;
      return res.id_hris_company;
    } catch (error) {
      throw error;
    }
  }

  async getGroupUuidFromRemoteId(id: string, connection_id: string) {
    try {
      const res = await this.prisma.hris_groups.findFirst({
        where: {
          remote_id: id,
          id_connection: connection_id,
        },
      });
      if (!res) return;
      return res.id_hris_group;
    } catch (error) {
      throw error;
    }
  }

  async getEmployerBenefitUuidFromRemoteId(id: string, connection_id: string) {
    try {
      const res = await this.prisma.hris_employer_benefits.findFirst({
        where: {
          remote_id: id,
          id_connection: connection_id,
        },
      });
      if (!res) return;
      return res.id_hris_employer_benefit;
    } catch (error) {
      throw error;
    }
  }
}
