import { Injectable } from '@nestjs/common';
import { PrismaService } from '@@core/@core-services/prisma/prisma.service';
import { LoggerService } from '@@core/@core-services/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';
import { UnifiedFilestorageDriveOutput } from '../types/model.unified';

@Injectable()
export class DriveService {
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.logger.setContext(DriveService.name);
  }

  async getDrive(
    id_fs_drive: string,
    linkedUserId: string,
    integrationId: string,
    connectionId: string,
    projectId: string,
    remote_data?: boolean,
  ): Promise<UnifiedFilestorageDriveOutput> {
    try {
      const drive = await this.prisma.fs_drives.findUnique({
        where: {
          id_fs_drive: id_fs_drive,
        },
      });

      // Fetch field mappings for the contact
      const values = await this.prisma.value.findMany({
        where: {
          entity: {
            ressource_owner_id: drive.id_fs_drive,
          },
        },
        include: {
          attribute: true,
        },
      });

      // Create a map to store unique field mappings
      const fieldMappingsMap = new Map();

      values.forEach((value) => {
        fieldMappingsMap.set(value.attribute.slug, value.data);
      });

      // Convert the map to an array of objects
      const field_mappings = Object.fromEntries(fieldMappingsMap);

      // Transform to UnifiedContactInput format
      const unifiedDrive: UnifiedFilestorageDriveOutput = {
        id: drive.id_fs_drive,
        remote_created_at: String(drive.remote_created_at),
        name: drive.name,
        drive_url: drive.drive_url,
        field_mappings: field_mappings,
        remote_id: drive.remote_id,
        created_at: drive.created_at,
        modified_at: drive.modified_at,
      };

      let res: UnifiedFilestorageDriveOutput = unifiedDrive;
      if (remote_data) {
        const resp = await this.prisma.remote_data.findFirst({
          where: {
            ressource_owner_id: drive.id_fs_drive,
          },
        });
        const remote_data = JSON.parse(resp.data);

        res = {
          ...res,
          remote_data: remote_data,
        };
      }
      await this.prisma.events.create({
        data: {
          id_connection: connectionId,
          id_project: projectId,
          id_event: uuidv4(),
          status: 'success',
          type: 'filestorage.drive.pull',
          method: 'GET',
          url: '/filestorage/drive',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });

      return res;
    } catch (error) {
      throw error;
    }
  }

  async getDrives(
    connection_id: string,
    project_id: string,
    integrationId: string,
    linkedUserId: string,
    pageSize: number,
    remote_data?: boolean,
    cursor?: string,
  ): Promise<{
    data: UnifiedFilestorageDriveOutput[];
    prev_cursor: null | string;
    next_cursor: null | string;
  }> {
    try {
      let prev_cursor = null;
      let next_cursor = null;

      if (cursor) {
        const isCursorPresent = await this.prisma.fs_drives.findFirst({
          where: {
            id_connection: connection_id,
            id_fs_drive: cursor,
          },
        });
        if (!isCursorPresent) {
          throw new ReferenceError(`The provided cursor does not exist!`);
        }
      }

      const drives = await this.prisma.fs_drives.findMany({
        take: pageSize + 1,
        cursor: cursor
          ? {
              id_fs_drive: cursor,
            }
          : undefined,
        orderBy: {
          created_at: 'asc',
        },
        where: {
          id_connection: connection_id,
        },
      });

      if (drives.length === pageSize + 1) {
        next_cursor = Buffer.from(
          drives[drives.length - 1].id_fs_drive,
        ).toString('base64');
        drives.pop();
      }

      if (cursor) {
        prev_cursor = Buffer.from(cursor).toString('base64');
      }

      const unifiedDrives: UnifiedFilestorageDriveOutput[] = await Promise.all(
        drives.map(async (drive) => {
          // Fetch field mappings for the drive
          const values = await this.prisma.value.findMany({
            where: {
              entity: {
                ressource_owner_id: drive.id_fs_drive,
              },
            },
            include: {
              attribute: true,
            },
          });
          // Create a map to store unique field mappings
          const fieldMappingsMap = new Map();

          values.forEach((value) => {
            fieldMappingsMap.set(value.attribute.slug, value.data);
          });

          // Convert the map to an array of objects
          const field_mappings = Object.fromEntries(fieldMappingsMap);

          // Transform to UnifiedFilestorageDriveInput format
          return {
            id: drive.id_fs_drive,
            drive_url: drive.drive_url,
            name: drive.name,
            remote_created_at: String(drive.remote_created_at),
            field_mappings: field_mappings,
            remote_id: drive.remote_id,
            created_at: drive.created_at,
            modified_at: drive.modified_at,
          };
        }),
      );

      let res: UnifiedFilestorageDriveOutput[] = unifiedDrives;

      if (remote_data) {
        const remote_array_data: UnifiedFilestorageDriveOutput[] =
          await Promise.all(
            res.map(async (drive) => {
              const resp = await this.prisma.remote_data.findFirst({
                where: {
                  ressource_owner_id: drive.id,
                },
              });
              const remote_data = JSON.parse(resp.data);
              return { ...drive, remote_data };
            }),
          );

        res = remote_array_data;
      }
      await this.prisma.events.create({
        data: {
          id_connection: connection_id,
          id_project: project_id,
          id_event: uuidv4(),
          status: 'success',
          type: 'filestorage.drive.pull',
          method: 'GET',
          url: '/filestorage/drives',
          provider: integrationId,
          direction: '0',
          timestamp: new Date(),
          id_linked_user: linkedUserId,
        },
      });
      return {
        data: res,
        prev_cursor,
        next_cursor,
      };
    } catch (error) {
      throw error;
    }
  }
}
