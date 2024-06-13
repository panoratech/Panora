import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

export class Utils {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async fetchFileStreamFromURL(file_url: string) {
    return fs.createReadStream(file_url);
  }

  async getUserUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.tcg_users.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res) throw ReferenceError('Tcg_User Undefined');
      return res.id_tcg_user;
    } catch (error) {
      throw error;
    }
  }

  async getUserRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_users.findFirst({
        where: {
          id_tcg_user: uuid,
        },
      });
<<<<<<< HEAD
      // if (!res) throw new Error(`tcg_user not found for uuid ${uuid}`);
      if (!res) return;
=======
      if (!res) throw new ReferenceError(`tcg_user not found for uuid ${uuid}`);
>>>>>>> 0a8f4472 (:ambulance: Errors fixing new format)
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }

  async getContactUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.tcg_contacts.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res)
        throw new ReferenceError(
          `tcg_account not found for remote_id ${remote_id}`,
        );
      return res.id_tcg_contact;
    } catch (error) {
      throw error;
    }
  }

  async getContactRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_contacts.findFirst({
        where: {
          id_tcg_contact: uuid,
        },
      });
<<<<<<< HEAD
      // if (!res) throw new Error(`tcg_contact not found for uuid ${uuid}`);
      if (!res) return;
=======
      if (!res)
        throw new ReferenceError(`tcg_contact not found for uuid ${uuid}`);
>>>>>>> 0a8f4472 (:ambulance: Errors fixing new format)
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }

  async getAsigneeRemoteIdFromUserUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_users.findFirst({
        where: {
          id_tcg_user: uuid,
        },
      });
      if (!res) throw new ReferenceError(`tcg_user not found for uuid ${uuid}`);
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }

  async getAssigneeMetadataFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_users.findUnique({
        where: {
          id_tcg_user: uuid,
        },
      });
<<<<<<< HEAD
      // if (!res) throw new Error(`tcg_user not found for uuid ${uuid}`);
      if (!res) return;
=======
      if (!res) throw new ReferenceError(`tcg_user not found for uuid ${uuid}`);
>>>>>>> 0a8f4472 (:ambulance: Errors fixing new format)
      return res.email_address;
    } catch (error) {
      throw error;
    }
  }

  async getCollectionUuidFromRemoteId(
    remote_id: string,
    remote_platform: string,
  ) {
    try {
      const res = await this.prisma.tcg_collections.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res)
        throw new ReferenceError(
          `tcg_collection not found for remote_id ${remote_id}`,
        );
      return res.id_tcg_collection;
    } catch (error) {
      throw error;
    }
  }

  async getCollectionRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_collections.findFirst({
        where: {
          id_tcg_collection: uuid,
        },
      });
      if (!res)
        throw new ReferenceError(`tcg_collection not found for uuid ${uuid}`);
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }

  async getTicketUuidFromRemoteId(remote_id: string, remote_platform: string) {
    try {
      const res = await this.prisma.tcg_tickets.findFirst({
        where: {
          remote_id: remote_id,
          remote_platform: remote_platform,
        },
      });
      if (!res)
        throw new ReferenceError(
          `tcg_ticket not found for remote_id ${remote_id}`,
        );
      return res.id_tcg_ticket;
    } catch (error) {
      throw error;
    }
  }

  async getTicketRemoteIdFromUuid(uuid: string) {
    try {
      const res = await this.prisma.tcg_tickets.findFirst({
        where: {
          id_tcg_ticket: uuid,
        },
      });
<<<<<<< HEAD
      // if (!res) throw new Error(`tcg_contact not found for uuid ${uuid}`);
      if (!res) return;
=======
      if (!res)
        throw new ReferenceError(`tcg_contact not found for uuid ${uuid}`);
>>>>>>> 0a8f4472 (:ambulance: Errors fixing new format)
      return res.remote_id;
    } catch (error) {
      throw error;
    }
  }
}
