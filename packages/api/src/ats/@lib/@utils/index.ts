import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { Email, Phone, Url } from '../@types';

@Injectable()
export class Utils {
  constructor(private readonly prisma: PrismaService) {}

  async getJobUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.ats_jobs.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.id_ats_job;
    } catch (error) {
      throw error;
    }
  }

  async getCandidateUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.ats_candidates.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.id_ats_candidate;
    } catch (error) {
      throw error;
    }
  }

  async getCandidateRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.ats_candidates.findUnique({
        where: {
          id_ats_candidate: uuid,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }
  async getUserRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.ats_users.findUnique({
        where: {
          id_ats_user: uuid,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }
  async getInterviewStageRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.ats_job_interview_stages.findUnique({
        where: {
          id_ats_job_interview_stage: uuid,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }
  async getJobRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.ats_jobs.findUnique({
        where: {
          id_ats_job: uuid,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }

  async getRejectReasonUuidFromRemoteId(
    remote_id: string,
    connection_id: string,
  ) {
    try {
      const res = await this.prisma.ats_reject_reasons.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.id_ats_reject_reason;
    } catch (error) {
      throw error;
    }
  }

  async getUserUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.ats_users.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.id_ats_user;
    } catch (error) {
      throw error;
    }
  }

  async getStageUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.ats_job_interview_stages.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.id_ats_job_interview_stage;
    } catch (error) {
      throw error;
    }
  }
  async getApplicationUuidFromRemoteId(
    remote_id: string,
    connection_id: string,
  ) {
    try {
      const res = await this.prisma.ats_applications.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.id_ats_application;
    } catch (error) {
      throw error;
    }
  }
  async getDepartmentUuidFromRemoteId(
    remote_id: string,
    connection_id: string,
  ) {
    try {
      const res = await this.prisma.ats_departments.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.id_ats_department;
    } catch (error) {
      throw error;
    }
  }

  async getOfficeUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.ats_offices.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.id_ats_office;
    } catch (error) {
      throw error;
    }
  }

  normalizeEmailsAndNumbers(email_addresses: Email[], phone_numbers: Phone[]) {
    let normalizedEmails = [];
    const normalizedPhones = [];

    if (email_addresses) {
      normalizedEmails = email_addresses.map((email) => ({
        value: email.email_address,
        created_at: new Date(),
        modified_at: new Date(),
        id_ats_candidate_email_address: uuidv4(),
        type:
          email.email_address_type === '' ? 'work' : email.email_address_type,
      }));
    }
    if (phone_numbers) {
      phone_numbers.forEach((phone) => {
        if (!phone.phone_number) return;
        normalizedPhones.push({
          created_at: new Date(),
          modified_at: new Date(),
          id_ats_candidate_phone_number: uuidv4(),
          type: phone.phone_type === '' ? 'work' : phone.phone_type,
          value: phone.phone_number,
        });
      });
    }
    return {
      normalizedEmails,
      normalizedPhones,
    };
  }
  normalizeUrls(urls: Url[]) {
    const normalizedUrls = [];
    if (urls) {
      urls.forEach((url) => {
        if (!url.url) return;
        normalizedUrls.push({
          created_at: new Date(),
          modified_at: new Date(),
          id_ats_candidate_url: uuidv4(),
          type: url.url_type || null,
          value: url.url,
        });
      });
    }
    return normalizedUrls;
  }
}
