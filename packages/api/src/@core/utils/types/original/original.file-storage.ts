import { DropboxGroupInput, DropboxGroupOutput } from '@filestorage/group/services/dropbox/types';

import { DropboxUserInput, DropboxUserOutput } from '@filestorage/user/services/dropbox/types';

import { DropboxFileInput, DropboxFileOutput } from '@filestorage/file/services/dropbox/types';

import { DropboxFolderInput, DropboxFolderOutput } from '@filestorage/folder/services/dropbox/types';

import {
  BoxSharedLinkInput,
  BoxSharedLinkOutput,
} from '@filestorage/sharedlink/services/box/types';
import {
  OnedriveSharedLinkInput,
  OnedriveSharedLinkOutput,
} from '@filestorage/sharedlink/services/onedrive/types';

import {
  OnedrivePermissionInput,
  OnedrivePermissionOutput,
} from '@filestorage/permission/services/onedrive/types';

import {
  OnedriveGroupInput,
  OnedriveGroupOutput,
} from '@filestorage/group/services/onedrive/types';

import {
  OnedriveUserInput,
  OnedriveUserOutput,
} from '@filestorage/user/services/onedrive/types';

import {
  OnedriveFileInput,
  OnedriveFileOutput,
} from '@filestorage/file/services/onedrive/types';

import {
  OnedriveFolderInput,
  OnedriveFolderOutput,
} from '@filestorage/folder/services/onedrive/types';

import {
  OnedriveDriveInput,
  OnedriveDriveOutput,
} from '@filestorage/drive/services/onedrive/types';

/* INPUT */

import {
  BoxFileInput,
  BoxFileOutput,
} from '@filestorage/file/services/box/types';
import {
  BoxFolderInput,
  BoxFolderOutput,
} from '@filestorage/folder/services/box/types';
import {
  BoxGroupInput,
  BoxGroupOutput,
} from '@filestorage/group/services/box/types';
import {
  BoxUserInput,
  BoxUserOutput,
} from '@filestorage/user/services/box/types';

/* file */
export type OriginalFileInput = BoxFileInput | OnedriveFileInput | DropboxFileInput;

/* folder */
export type OriginalFolderInput = BoxFolderInput | OnedriveFolderInput | DropboxFolderInput;

/* permission */
export type OriginalPermissionInput = any | OnedrivePermissionInput;

/* shared link */
export type OriginalSharedLinkInput = any;

/* drive */
export type OriginalDriveInput = any | OnedriveDriveInput;

/* group */
export type OriginalGroupInput = BoxGroupInput | OnedriveGroupInput | DropboxGroupInput;

/* user */
export type OriginalUserInput = BoxUserInput | OnedriveUserInput | DropboxUserInput;

export type FileStorageObjectInput =
  | OriginalFileInput
  | OriginalFolderInput
  | OriginalPermissionInput
  | OriginalSharedLinkInput
  | OriginalDriveInput
  | OriginalGroupInput
  | OriginalUserInput;

/* OUTPUT */

/* file */
export type OriginalFileOutput = BoxFileOutput | OnedriveFileOutput | DropboxFileOutput;

/* folder */
export type OriginalFolderOutput = BoxFolderOutput | OnedriveFolderOutput | DropboxFolderOutput;

/* permission */
export type OriginalPermissionOutput = any | OnedrivePermissionOutput;

/* shared link */
export type OriginalSharedLinkOutput = any;

/* drive */
export type OriginalDriveOutput = any | OnedriveDriveOutput;

/* group */
export type OriginalGroupOutput = BoxGroupOutput | OnedriveGroupOutput | DropboxGroupOutput;

/* user */
export type OriginalUserOutput = BoxUserOutput | OnedriveUserOutput | DropboxUserOutput;

export type FileStorageObjectOutput =
  | OriginalFileOutput
  | OriginalFolderOutput
  | OriginalPermissionOutput
  | OriginalSharedLinkOutput
  | OriginalDriveOutput
  | OriginalGroupOutput
  | OriginalUserOutput;

export type OriginalSharedlinkInput =
  | BoxSharedLinkInput
  | OnedriveSharedLinkInput;

export type OriginalSharedlinkOutput =
  | BoxSharedLinkOutput
  | OnedriveSharedLinkOutput;
