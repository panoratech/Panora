/* INPUT */

/* file */
export type OriginalFileInput = '';

/* folder */
export type OriginalFolderInput = '';

/* permission */
export type OriginalPermissionInput = '';

/* shared link */
export type OriginalSharedLinkInput = '';

/* drive */
export type OriginalDriveInput = '';

/* group */
export type OriginalGroupInput = '';

/* user */
export type OriginalUserInput = '';

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
export type OriginalFileOutput = '';

/* folder */
export type OriginalFolderOutput = '';

/* permission */
export type OriginalPermissionOutput = '';

/* shared link */
export type OriginalSharedLinkOutput = '';

/* drive */
export type OriginalDriveOutput = '';

/* group */
export type OriginalGroupOutput = '';

/* user */
export type OriginalUserOutput = '';

export type FileStorageObjectOutput =
  | OriginalFileOutput
  | OriginalFolderOutput
  | OriginalPermissionOutput
  | OriginalSharedLinkOutput
  | OriginalDriveOutput
  | OriginalGroupOutput
  | OriginalUserOutput;
