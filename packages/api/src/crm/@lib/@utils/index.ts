import { Address, countryPhoneFormats, Email, Phone } from '@crm/@lib/@types';
import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';

@Injectable()
export class Utils {
  constructor(private readonly prisma: PrismaService) {}

  normalizeEmailsAndNumbers(email_addresses: Email[], phone_numbers: Phone[]) {
    let normalizedEmails = [];
    const normalizedPhones = [];

    if (email_addresses) {
      normalizedEmails = email_addresses.map((email) => ({
        ...email,
        email_address: email.email_address ?? '',
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
    if (addresses) {
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
    return [];
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
      throw error;
    }
  }

  async getEmailFromUserUuid(uuid: string) {
    try {
      const res = await this.prisma.crm_users.findFirst({
        where: {
          id_crm_user: uuid,
        },
      });
      // if (!res) throw new Error(`crm_user not found for uuid ${uuid}`);
      if (!res) return;
      return res.email;
    } catch (error) {
      throw error;
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
      throw error;
    }
  }

  async getUserUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.crm_users.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.id_crm_user;
    } catch (error) {
      throw error;
    }
  }
  async getStageUuidFromStageName(stage_name: string, connection_id: string) {
    try {
      const res = await this.prisma.crm_deals_stages.findFirst({
        where: {
          stage_name: stage_name,
          id_connection: connection_id,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.id_crm_deals_stage;
    } catch (error) {
      throw error;
    }
  }

  async getCompanyNameFromUuid(id: string) {
    try {
      const res = await this.prisma.crm_companies.findFirst({
        where: {
          id_crm_company: id,
        },
      });

      if (!res) {
        return undefined;
      }
      return res.name;
    } catch (error) {
      throw error;
    }
  }

  async getStageNameFromStageUuid(id: string) {
    try {
      const res = await this.prisma.crm_deals_stages.findFirst({
        where: {
          id_crm_deals_stage: id,
        },
      });
      if (!res) return undefined;

      return res.stage_name;
    } catch (error) {
      throw error;
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
        return undefined;
      }
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }

  async getCompanyUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.crm_companies.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) {
        return undefined;
      }
      return res.id_crm_company;
    } catch (error) {
      throw error;
    }
  }

  async getStageIdFromStageUuid(uuid: string) {
    try {
      const res = await this.prisma.crm_deals_stages.findFirst({
        where: {
          id_crm_deals_stage: uuid,
        },
      });
      if (!res) return undefined;
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }

  async getStageUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.crm_deals_stages.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) {
        return undefined;
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
      if (!res) return undefined;
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }

  async getContactUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.crm_contacts.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) return undefined;
      return res.id_crm_contact;
    } catch (error) {
      throw error;
    }
  }

  async getRemoteIdFromDealUuid(uuid: string) {
    try {
      const res = await this.prisma.crm_deals.findFirst({
        where: {
          id_crm_deal: uuid,
        },
      });
      if (!res) return undefined;
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }

  async getDealUuidFromRemoteId(remote_id: string, connection_id: string) {
    try {
      const res = await this.prisma.crm_deals.findFirst({
        where: {
          remote_id: remote_id,
          id_connection: connection_id,
        },
      });
      if (!res) return undefined;
      return res.id_crm_deal;
    } catch (error) {
      throw error;
    }
  }

  mapTaskStatus(status: string, provider_name: string): string {
    try {
      switch (provider_name.toLowerCase()) {
        default:
          throw new ReferenceError(
            'Provider not supported for status custom task mapping',
          );
      }
    } catch (error) {
      throw error;
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
