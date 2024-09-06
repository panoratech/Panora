import { OnedriveFileInput, OnedriveFileOutput } from '@filestorage/file/services/onedrive/types';

import { OnedriveFolderInput, OnedriveFolderOutput } from '@filestorage/folder/services/onedrive/types';

import { OnedriveDriveInput, OnedriveDriveOutput } from '@filestorage/drive/services/onedrive/types';

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
export type OriginalFileInput = BoxFileInput | OnedriveFileInput;

/* folder */
export type OriginalFolderInput = BoxFolderInput | OnedriveFolderInput;

/* permission */
export type OriginalPermissionInput = any;

/* shared link */
export type OriginalSharedLinkInput = any;

/* drive */
export type OriginalDriveInput = any | OnedriveDriveInput;

/* group */
export type OriginalGroupInput = BoxGroupInput;

/* user */
export type OriginalUserInput = BoxUserInput;

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
export type OriginalFileOutput = BoxFileOutput | OnedriveFileOutput;

/* folder */
export type OriginalFolderOutput = BoxFolderOutput | OnedriveFolderOutput;

/* permission */
export type OriginalPermissionOutput = any;

/* shared link */
export type OriginalSharedLinkOutput = any;

/* drive */
export type OriginalDriveOutput = any | OnedriveDriveOutput;

/* group */
export type OriginalGroupOutput = BoxGroupOutput;

/* user */
export type OriginalUserOutput = BoxUserOutput;

export type FileStorageObjectOutput =
  | OriginalFileOutput
  | OriginalFolderOutput
  | OriginalPermissionOutput
  | OriginalSharedLinkOutput
  | OriginalDriveOutput
  | OriginalGroupOutput
  | OriginalUserOutput;
