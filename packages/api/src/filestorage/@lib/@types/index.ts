import { IDriveService } from '@filestorage/drive/types';
import { driveUnificationMapping } from '@filestorage/drive/types/mappingsTypes';
import {
  UnifiedDriveInput,
  UnifiedDriveOutput,
} from '@filestorage/drive/types/model.unified';
import { IFileService } from '@filestorage/file/types';
import { fileUnificationMapping } from '@filestorage/file/types/mappingsTypes';
import {
  UnifiedFileInput,
  UnifiedFileOutput,
} from '@filestorage/file/types/model.unified';
import { IFolderService } from '@filestorage/folder/types';
import { folderUnificationMapping } from '@filestorage/folder/types/mappingsTypes';
import {
  UnifiedFolderInput,
  UnifiedFolderOutput,
} from '@filestorage/folder/types/model.unified';
import { IPermissionService } from '@filestorage/permission/types';
import { permissionUnificationMapping } from '@filestorage/permission/types/mappingsTypes';
import {
  UnifiedPermissionInput,
  UnifiedPermissionOutput,
} from '@filestorage/permission/types/model.unified';
import { ISharedLinkService } from '@filestorage/sharedlink/types';
import { sharedlinkUnificationMapping } from '@filestorage/sharedlink/types/mappingsTypes';
import {
  UnifiedSharedLinkInput,
  UnifiedSharedLinkOutput,
} from '@filestorage/sharedlink/types/model.unified';

export enum FileStorageObject {
  file = 'file',
  folder = 'folder',
  permission = 'permission',
  drive = 'drive',
  sharedlink = 'sharedlink',
}

export type UnifiedFileStorage =
  | UnifiedFileInput
  | UnifiedFileOutput
  | UnifiedFolderInput
  | UnifiedFolderOutput
  | UnifiedPermissionInput
  | UnifiedPermissionOutput
  | UnifiedDriveInput
  | UnifiedDriveOutput
  | UnifiedSharedLinkInput
  | UnifiedSharedLinkOutput;

export const unificationMapping = {
  [FileStorageObject.drive]: driveUnificationMapping,
  [FileStorageObject.file]: fileUnificationMapping,
  [FileStorageObject.folder]: folderUnificationMapping,
  [FileStorageObject.permission]: permissionUnificationMapping,
  [FileStorageObject.sharedlink]: sharedlinkUnificationMapping,
};

export type IFileStorageService =
  | IFileService
  | IFolderService
  | IDriveService
  | IPermissionService
  | ISharedLinkService;
