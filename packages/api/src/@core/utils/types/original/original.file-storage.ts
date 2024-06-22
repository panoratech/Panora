/* INPUT */

/* file */
export type OriginalFileInput = any;

/* folder */
export type OriginalFolderInput = any;

/* permission */
export type OriginalPermissionInput = any;

/* shared link */
export type OriginalSharedLinkInput = any;

/* drive */
export type OriginalDriveInput = any;

/* group */
export type OriginalGroupInput = any;

/* user */
export type OriginalUserInput = any;

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
export type OriginalFileOutput = any;

/* folder */
export type OriginalFolderOutput = any;

/* permission */
export type OriginalPermissionOutput = any;

/* shared link */
export type OriginalSharedLinkOutput = any;

/* drive */
export type OriginalDriveOutput = any;

/* group */
export type OriginalGroupOutput = any;

/* user */
export type OriginalUserOutput = any;

export type FileStorageObjectOutput =
  | OriginalFileOutput
  | OriginalFolderOutput
  | OriginalPermissionOutput
  | OriginalSharedLinkOutput
  | OriginalDriveOutput
  | OriginalGroupOutput
  | OriginalUserOutput;
