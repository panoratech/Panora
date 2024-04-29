import { countryPhoneFormats, Email, Phone } from '@crm/@utils/@types';
import { v4 as uuidv4 } from 'uuid';

import { PrismaClient } from '@prisma/client';

export class Utils {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  normalizeEmailsAndNumbers(email_addresses: Email[], phone_numbers: Phone[]) {
    let normalizedEmails = [];
    const normalizedPhones = [];

    if (email_addresses) {
      normalizedEmails = email_addresses.map((email) => ({
        ...email,
        owner_type: email.owner_type ? email.owner_type : '',
        created_at: new Date(),
        modified_at: new Date(),
        id_crm_email: uuidv4(), // This line is changed
        email_address_type:
          email.email_address_type === '' ? 'work' : email.email_address_type,
      }));
    }
    if (phone_numbers) {
      phone_numbers.forEach((phone) => {
        if (!phone.phone_number) return;

        normalizedPhones.push({
          ...phone,
          owner_type: phone.owner_type ? phone.owner_type : '',
          created_at: new Date(),
          modified_at: new Date(),
          id_crm_phone_number: uuidv4(), // This line is changed
          phone_type: phone.phone_type === '' ? 'work' : phone.phone_type,
        });
      });
    }
    return {
      normalizedEmails,
      normalizedPhones,
    };
  }

  extractPhoneDetails(phone_number: string): {
    country_code: string;
    base_number: string;
  } {
    let country_code = '';
    let base_number: string = phone_number;

    // Find the matching country code
    for (const [countryCode, _] of Object.entries(countryPhoneFormats)) {
      if (phone_number.startsWith(countryCode)) {
        country_code = countryCode;
        base_number = phone_number.substring(countryCode.length);
        break;
      }
    }

    return { country_code, base_number };
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
      if (!res) return;
      /*TODO: throw new Error(
          `crm_user not found for remote_id ${remote_id} and integration ${remote_platform}`,
        );*/
      return res.id_crm_user;
    } catch (error) {
      throw new Error(error);
    }
  }
}
