/* INPUT */

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

import {
  SharepointSharedLinkInput,
  SharepointSharedLinkOutput,
} from '@filestorage/sharedlink/services/sharepoint/types';

import {
  SharepointPermissionInput,
  SharepointPermissionOutput,
} from '@filestorage/permission/services/sharepoint/types';

import {
  SharepointGroupInput,
  SharepointGroupOutput,
} from '@filestorage/group/services/sharepoint/types';

import {
  SharepointUserInput,
  SharepointUserOutput,
} from '@filestorage/user/services/sharepoint/types';

import {
  SharepointFolderInput,
  SharepointFolderOutput,
} from '@filestorage/folder/services/sharepoint/types';

import {
  SharepointFileInput,
  SharepointFileOutput,
} from '@filestorage/file/services/sharepoint/types';

import {
  SharepointDriveInput,
  SharepointDriveOutput,
} from '@filestorage/drive/services/sharepoint/types';

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
import {
  BoxSharedLinkInput,
  BoxSharedLinkOutput,
} from '@filestorage/sharedlink/services/box/types';

/* file */
export type OriginalFileInput =
  | BoxFileInput
  | OnedriveFileInput
  | SharepointFileInput;

/* folder */
export type OriginalFolderInput =
  | BoxFolderInput
  | OnedriveFolderInput
  | SharepointFolderInput;

/* permission */
export type OriginalPermissionInput =
  | any
  | OnedrivePermissionInput
  | SharepointPermissionInput;

/* shared link */
export type OriginalSharedLinkInput = any;

/* drive */
export type OriginalDriveInput =
  | any
  | OnedriveDriveInput
  | SharepointDriveInput;

/* group */
export type OriginalGroupInput =
  | BoxGroupInput
  | OnedriveGroupInput
  | SharepointGroupInput;

/* user */
export type OriginalUserInput =
  | BoxUserInput
  | OnedriveUserInput
  | SharepointUserInput;

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
export type OriginalFileOutput =
  | BoxFileOutput
  | OnedriveFileOutput
  | SharepointFileOutput;

/* folder */
export type OriginalFolderOutput =
  | BoxFolderOutput
  | OnedriveFolderOutput
  | SharepointFolderOutput;

/* permission */
export type OriginalPermissionOutput =
  | any
  | OnedrivePermissionOutput
  | SharepointPermissionOutput;

/* shared link */
export type OriginalSharedLinkOutput = any;

/* drive */
export type OriginalDriveOutput =
  | any
  | OnedriveDriveOutput
  | SharepointDriveOutput;

/* group */
export type OriginalGroupOutput =
  | BoxGroupOutput
  | OnedriveGroupOutput
  | SharepointGroupOutput;

/* user */
export type OriginalUserOutput =
  | BoxUserOutput
  | OnedriveUserOutput
  | SharepointUserOutput;

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
  | OnedriveSharedLinkInput
  | SharepointSharedLinkInput;

export type OriginalSharedlinkOutput =
  | BoxSharedLinkOutput
  | OnedriveSharedLinkOutput
  | SharepointSharedLinkOutput;
