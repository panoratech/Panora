import { IDriveService } from '@filestorage/drive/types';
import {
  UnifiedDriveInput,
  UnifiedDriveOutput,
} from '@filestorage/drive/types/model.unified';
import { IFileService } from '@filestorage/file/types';
import {
  UnifiedFileInput,
  UnifiedFileOutput,
} from '@filestorage/file/types/model.unified';
import { IFolderService } from '@filestorage/folder/types';
import {
  UnifiedFolderInput,
  UnifiedFolderOutput,
} from '@filestorage/folder/types/model.unified';
import { IGroupService } from '@filestorage/group/types';
import {
  UnifiedGroupInput,
  UnifiedGroupOutput,
} from '@filestorage/group/types/model.unified';
import { IPermissionService } from '@filestorage/permission/types';
import {
  UnifiedPermissionInput,
  UnifiedPermissionOutput,
} from '@filestorage/permission/types/model.unified';
import { ISharedLinkService } from '@filestorage/sharedlink/types';
import {
  UnifiedSharedLinkInput,
  UnifiedSharedLinkOutput,
} from '@filestorage/sharedlink/types/model.unified';
import { IUserService } from '@filestorage/user/types';
import {
  UnifiedUserInput,
  UnifiedUserOutput,
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
  | UnifiedFileInput
  | UnifiedFileOutput
  | UnifiedFolderInput
  | UnifiedFolderOutput
  | UnifiedPermissionInput
  | UnifiedPermissionOutput
  | UnifiedDriveInput
  | UnifiedDriveOutput
  | UnifiedGroupInput
  | UnifiedGroupOutput
  | UnifiedUserInput
  | UnifiedUserOutput
  | UnifiedSharedLinkInput
  | UnifiedSharedLinkOutput;

export type IFileStorageService =
  | IFileService
  | IFolderService
  | IDriveService
  | IGroupService
  | IUserService
  | IPermissionService
  | ISharedLinkService;
