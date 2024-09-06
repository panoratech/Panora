import { IDriveService } from '@filestorage/drive/types';
import {
  UnifiedFilestorageDriveInput,
  UnifiedFilestorageDriveOutput,
} from '@filestorage/drive/types/model.unified';
import { IFileService } from '@filestorage/file/types';
import {
  UnifiedFilestorageFileInput,
  UnifiedFilestorageFileOutput,
} from '@filestorage/file/types/model.unified';
import { IFolderService } from '@filestorage/folder/types';
import {
  UnifiedFilestorageFolderInput,
  UnifiedFilestorageFolderOutput,
} from '@filestorage/folder/types/model.unified';
import { IGroupService } from '@filestorage/group/types';
import {
  UnifiedFilestorageGroupInput,
  UnifiedFilestorageGroupOutput,
} from '@filestorage/group/types/model.unified';
import { IPermissionService } from '@filestorage/permission/types';
import {
  UnifiedFilestoragePermissionInput,
  UnifiedFilestoragePermissionOutput,
} from '@filestorage/permission/types/model.unified';
import { ISharedLinkService } from '@filestorage/sharedlink/types';
import {
  UnifiedFilestorageSharedlinkInput,
  UnifiedFilestorageSharedlinkOutput,
} from '@filestorage/sharedlink/types/model.unified';
import { IUserService } from '@filestorage/user/types';
import {
  UnifiedFilestorageUserInput,
  UnifiedFilestorageUserOutput,
} from '@filestorage/user/types/model.unified';

export enum FileStorageObject {
  file = 'file',
  folder = 'folder',
  permission = 'permission',
  drive = 'drive',
  sharedlink = 'sharedlink',
  group = 'group',
  user = 'user',
}

export type UnifiedFileStorage =
  | UnifiedFilestorageFileInput
  | UnifiedFilestorageFileOutput
  | UnifiedFilestorageFolderInput
  | UnifiedFilestorageFolderOutput
  | UnifiedFilestoragePermissionInput
  | UnifiedFilestoragePermissionOutput
  | UnifiedFilestorageDriveInput
  | UnifiedFilestorageDriveOutput
  | UnifiedFilestorageGroupInput
  | UnifiedFilestorageGroupOutput
  | UnifiedFilestorageUserInput
  | UnifiedFilestorageUserOutput
  | UnifiedFilestorageSharedlinkInput
  | UnifiedFilestorageSharedlinkOutput;

export type IFileStorageService =
  | IFileService
  | IFolderService
  | IDriveService
  | IGroupService
  | IUserService
  | IPermissionService
  | ISharedLinkService;
