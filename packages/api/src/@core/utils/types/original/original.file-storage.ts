import { GoogledrivePermissionInput, GoogledrivePermissionOutput } from '@filestorage/permission/services/googledrive/types';

import {
  DropboxGroupInput,
  DropboxGroupOutput,
} from '@filestorage/group/services/dropbox/types';

import {
  DropboxUserInput,
  DropboxUserOutput,
} from '@filestorage/user/services/dropbox/types';

import {
  DropboxFileInput,
  DropboxFileOutput,
} from '@filestorage/file/services/dropbox/types';

import {
  DropboxFolderInput,
  DropboxFolderOutput,
} from '@filestorage/folder/services/dropbox/types';

import {
  BoxSharedLinkInput,
  BoxSharedLinkOutput,
} from '@filestorage/sharedlink/services/box/types';

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
  GoogleDriveDriveInput,
  GoogleDriveDriveOutput,
} from '@filestorage/drive/services/googledrive/types';
import {
  GoogleDriveFileInput,
  GoogleDriveFileOutput,
} from '@filestorage/file/services/googledrive/types';
import {
  GoogleDriveFolderInput,
  GoogleDriveFolderOutput,
} from '@filestorage/folder/services/googledrive/types';
/* file */

/* folder */
export type OriginalFileInput =
  | BoxFileInput
  | OnedriveFileInput
  | SharepointFileInput
  | DropboxFileInput
  | SharepointFileInput
  | GoogleDriveFileInput;

/* folder */
export type OriginalFolderInput =
  | BoxFolderInput
  | OnedriveFolderInput
  | SharepointFolderInput
  | DropboxFolderInput
  | SharepointFolderInput
  | GoogleDriveFolderInput;

/* permission */
export type OriginalPermissionInput =
  | any
  | OnedrivePermissionInput
  | SharepointPermissionInput | GoogledrivePermissionInput;

/* shared link */
export type OriginalSharedLinkInput = any;

/* drive */
export type OriginalDriveInput =
  | GoogleDriveDriveInput
  | OnedriveDriveInput
  | SharepointDriveInput;

/* group */

/* user */
export type OriginalGroupInput =
  | BoxGroupInput
  | OnedriveGroupInput
  | SharepointGroupInput
  | DropboxGroupInput;

/* user */
export type OriginalUserInput =
  | BoxUserInput
  | OnedriveUserInput
  | SharepointUserInput
  | DropboxUserInput;

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

/* folder */
export type OriginalFileOutput =
  | BoxFileOutput
  | OnedriveFileOutput
  | SharepointFileOutput
  | DropboxFileOutput
  | SharepointFileOutput
  | GoogleDriveFileOutput;

/* folder */
export type OriginalFolderOutput =
  | BoxFolderOutput
  | OnedriveFolderOutput
  | SharepointFolderOutput
  | DropboxFolderOutput
  | SharepointFolderOutput
  | GoogleDriveFolderOutput;

/* permission */
export type OriginalPermissionOutput =
  | any
  | OnedrivePermissionOutput
  | SharepointPermissionOutput | GoogledrivePermissionOutput;

/* shared link */
export type OriginalSharedLinkOutput = any;

/* drive */
export type OriginalDriveOutput =
  | GoogleDriveDriveOutput
  | OnedriveDriveOutput
  | SharepointDriveOutput;

/* group */

/* user */
export type OriginalGroupOutput =
  | BoxGroupOutput
  | OnedriveGroupOutput
  | SharepointGroupOutput
  | DropboxGroupOutput;

/* user */
export type OriginalUserOutput =
  | BoxUserOutput
  | OnedriveUserOutput
  | SharepointUserOutput
  | DropboxUserOutput;

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
