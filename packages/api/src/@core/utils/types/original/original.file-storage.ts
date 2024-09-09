import {
  BoxSharedLinkInput,
  BoxSharedLinkOutput,
} from '@filestorage/sharedlink/services/box/types';
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
export type OriginalFileInput = BoxFileInput | SharepointFileInput;

/* folder */
export type OriginalFolderInput = BoxFolderInput | SharepointFolderInput;

/* permission */
export type OriginalPermissionInput = any | SharepointPermissionInput;

/* shared link */
export type OriginalSharedLinkInput = any;

/* drive */
export type OriginalDriveInput = any | SharepointDriveInput;

/* group */
export type OriginalGroupInput = BoxGroupInput | SharepointGroupInput;

/* user */
export type OriginalUserInput = BoxUserInput | SharepointUserInput;

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
export type OriginalFileOutput = BoxFileOutput | SharepointFileOutput;

/* folder */
export type OriginalFolderOutput = BoxFolderOutput | SharepointFolderOutput;

/* permission */
export type OriginalPermissionOutput = any | SharepointPermissionOutput;

/* shared link */
export type OriginalSharedLinkOutput = any;

/* drive */
export type OriginalDriveOutput = any | SharepointDriveOutput;

/* group */
export type OriginalGroupOutput = BoxGroupOutput | SharepointGroupOutput;

/* user */
export type OriginalUserOutput = BoxUserOutput | SharepointUserOutput;

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
  | SharepointSharedLinkInput;

export type OriginalSharedlinkOutput =
  | BoxSharedLinkOutput
  | SharepointSharedLinkOutput;
