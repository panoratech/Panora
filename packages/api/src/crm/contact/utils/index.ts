import { Email, Phone } from '@crm/@utils/@types';
import { v4 as uuidv4 } from 'uuid';

import { PrismaClient } from '@prisma/client';

export class Utils {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  normalizeEmailsAndNumbers(email_addresses: Email[], phone_numbers: Phone[]) {
    const normalizedEmails = email_addresses.map((email) => ({
      ...email,
      owner_type: email.owner_type ? email.owner_type : '',
      created_at: new Date(),
      modified_at: new Date(),
      id_crm_email: uuidv4(), // This line is changed
      email_address_type:
        email.email_address_type === '' ? 'work' : email.email_address_type,
    }));

    const normalizedPhones = phone_numbers.map((phone) => ({
      ...phone,
      owner_type: phone.owner_type ? phone.owner_type : '',
      created_at: new Date(),
      modified_at: new Date(),
      id_crm_phone_number: uuidv4(), // This line is changed
      phone_type: phone.phone_type === '' ? 'work' : phone.phone_type,
    }));

    return {
      normalizedEmails,
      normalizedPhones,
    };
  }
  async getRemoteIdFromUserUuid(uuid: string) {
    try {
      const res = await this.prisma.crm_users.findFirst({
        where: {
          id_crm_user: uuid,
        },
      });
      if (!res) throw new Error(`crm_user not found for uuid ${uuid}`);
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUser(uuid: string) {
    try {
      const res = await this.prisma.crm_users.findFirst({
        where: {
          id_crm_user: uuid,
        },
      });
      if (!res) throw new Error(`crm_user not found for uuid ${uuid}`);
      return res;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getUserUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.crm_users.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res)
        throw new Error(
          `crm_user not found for remote_id ${remote_id} and integration ${remote_platform}`,
        );
      return res.id_crm_user;
    } catch (error) {
      throw new Error(error);
    }
  }
}
