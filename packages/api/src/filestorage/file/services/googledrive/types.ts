export type GoogleDriveFileInput = Partial<GoogleDriveFileOutput>;

export interface GoogleDriveFileOutput {
  kind?: string;
  id: string;
  name: string;
  mimeType: string;
  description?: string;
  starred?: boolean;
  trashed?: boolean;
  explicitlyTrashed?: boolean;
  parents?: string[];
  properties?: { [key: string]: string };
  appProperties?: { [key: string]: string };
  spaces?: string[];
  version?: string;
  webContentLink?: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  viewedByMe?: boolean;
  viewedByMeTime?: string;
  createdTime?: string;
  modifiedTime?: string;
  modifiedByMeTime?: string;
  sharedWithMeTime?: string;
  sharingUser?: any;
  owners?: any[];
  teamDriveId?: string;
  driveId?: string;
  lastModifyingUser?: any;
  shared?: boolean;
  ownedByMe?: boolean;
  capabilities?: {
    canEdit?: boolean;
    canComment?: boolean;
    canShare?: boolean;
    canCopy?: boolean;
    canDownload?: boolean;
    canListChildren?: boolean;
    canAddChildren?: boolean;
    canRemoveChildren?: boolean;
    canDelete?: boolean;
    canRename?: boolean;
    canTrash?: boolean;
    canUntrash?: boolean;
    canMoveItemWithinDrive?: boolean;
    canMoveItemOutOfDrive?: boolean;
    canAddFolderFromAnotherDrive?: boolean;
    canMoveItemIntoTeamDrive?: boolean;
    canMoveItemOutOfTeamDrive?: boolean;
    canModifyContent?: boolean;
    canModifyContentRestriction?: boolean;
    canReadRevisions?: boolean;
    canChangeCopyRequiresWriterPermission?: boolean;
    canModifyLabels?: boolean;
    [key: string]: boolean | undefined;
  };
  viewersCanCopyContent?: boolean;
  writersCanShare?: boolean;
  permissions?: any[];
  permissionIds?: string[];
  hasAugmentedPermissions?: boolean;
  folderColorRgb?: string;
  originalFilename?: string;
  fullFileExtension?: string;
  fileExtension?: string;
  md5Checksum?: string;
  size?: string;
  quotaBytesUsed?: string;
  headRevisionId?: string;
  contentHints?: {
    thumbnail?: {
      image?: string;
      mimeType?: string;
    };
    indexableText?: string;
  };
  imageMediaMetadata?: {
    width?: number;
    height?: number;
    rotation?: number;
    // Add other image metadata fields as needed
  };
  videoMediaMetadata?: {
    width?: number;
    height?: number;
    durationMillis?: string;
  };
  isAppAuthorized?: boolean;
  exportLinks?: { [key: string]: string };
  shortcutDetails?: {
    targetId?: string;
    targetMimeType?: string;
    targetResourceKey?: string;
  };
  contentRestrictions?: any[];
  resourceKey?: string;
  linkShareMetadata?: {
    securityUpdateEligible?: boolean;
    securityUpdateEnabled?: boolean;
  };
  labelInfo?: {
    labels?: any[];
  };
  sha1Checksum?: string;
  sha256Checksum?: string;

  // Internal fields
  internal_permissions?: string[]; // Permissions ID in panora db
}
