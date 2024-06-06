import { Address, countryPhoneFormats, Email, Phone } from '@crm/@lib/@types';
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

  normalizeAddresses(addresses: Address[]) {
    const normalizedAddresses = addresses.map((addy) => ({
      ...addy,
      created_at: new Date(),
      modified_at: new Date(),
      id_crm_address: uuidv4(),
      owner_type: addy.owner_type ? addy.owner_type : '',
      address_type: addy.address_type === '' ? 'primary' : addy.address_type,
    }));

    return normalizedAddresses;
  }

  async getRemoteIdFromUserUuid(uuid: string) {
    try {
      const res = await this.prisma.crm_users.findFirst({
        where: {
          id_crm_user: uuid,
        },
      });
      // if (!res) throw new Error(`crm_user not found for uuid ${uuid}`);
      if (!res) return;
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
      // if (!res) throw new Error(`crm_user not found for uuid ${uuid}`);
      if (!res) return;
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
      if (!res) {
        // throw new Error(
        //   `crm_user not found for remote_id ${remote_id} and integration ${remote_platform}`,
        // );
        return;
      }
      return res.id_crm_user;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getCompanyNameFromUuid(id: string, remote_platform: string) {
    try {
      const res = await this.prisma.crm_companies.findFirst({
        where: {
          id_crm_company: id,
          remote_platform: remote_platform,
        },
      });

      if (!res) return;

      return res.name;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getStageNameFromStageUuid(id: string, remote_platform: string) {
    try {
      const res = await this.prisma.crm_deals_stages.findFirst({
        where: {
          id_crm_deals_stage: id,
          remote_platform: remote_platform,
        },
      });

      if (!res) return;

      return res.stage_name;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getRemoteIdFromCompanyUuid(uuid: string) {
    try {
      const res = await this.prisma.crm_companies.findFirst({
        where: {
          id_crm_company: uuid,
        },
      });
      if (!res) {
        // throw new Error(`crm_companies not found for uuid ${uuid}`);
        return;
      }
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getCompanyUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.crm_companies.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res) {
        return;
        // throw new Error(
        //   `crm_companies not found for remote_id ${remote_id} and integration ${remote_platform}`,
        // );
      }
      return res.id_crm_company;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getStageIdFromStageUuid(uuid: string) {
    try {
      const res = await this.prisma.crm_deals_stages.findFirst({
        where: {
          id_crm_deals_stage: uuid,
        },
      });
      // if (!res) throw new Error(`crm_deals_stages not found for uuid ${uuid}`);
      if (!res) return;
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getStageUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.crm_deals_stages.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res) {
        return;
        // throw new Error(
        //   `crm_deals_stages not found for remote_id ${remote_id} and integration ${remote_platform}`,
        // );
      }
      return res.id_crm_deals_stage;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getRemoteIdFromContactUuid(uuid: string) {
    try {
      const res = await this.prisma.crm_contacts.findFirst({
        where: {
          id_crm_contact: uuid,
        },
      });
      // if (!res) throw new Error(`crm_contacts not found for uuid ${uuid}`);
      if (!res) return;
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getContactUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.crm_contacts.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      // if (!res)
      //   throw new Error(
      //     `crm_contacts not found for remote_id ${remote_id} and integration ${remote_platform}`,
      //   );
      if (!res) return;
      return res.id_crm_contact;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getRemoteIdFromDealUuid(uuid: string) {
    try {
      const res = await this.prisma.crm_deals.findFirst({
        where: {
          id_crm_deal: uuid,
        },
      });
      // if (!res) throw new Error(`crm_deals not found for uuid ${uuid}`);
      if (!res) return;
      return res.remote_id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getDealUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.crm_deals.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      // if (!res)
      //   throw new Error(
      //     `crm_deals not found for remote_id ${remote_id} and integration ${remote_platform}`,
      //   );
      if (!res) return;
      return res.id_crm_deal;
    } catch (error) {
      throw new Error(error);
    }
  }

  mapTaskStatus(status: string, provider_name: string): string {
    try {
      switch (provider_name.toLowerCase()) {
        default:
          throw new Error(
            'Provider not supported for status custom task mapping',
          );
      }
    } catch (error) {
      throw new Error(error);
    }
  }

  // not currently in use, but might be in the future
  mapTaskPriority(priority?: string): 'HIGH' | 'MEDIUM' | 'LOW' {
    return priority === 'High'
      ? 'HIGH'
      : priority === 'Medium'
      ? 'MEDIUM'
      : 'LOW';
  }
}
