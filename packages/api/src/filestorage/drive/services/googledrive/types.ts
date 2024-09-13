export interface GoogleDriveDriveOutput {
  id: string;
  name: string;
  colorRgb?: string;
  kind: string;
  backgroundImageLink?: string;
  capabilities?: {
    canAddChildren?: boolean;
    canComment?: boolean;
    canCopy?: boolean;
    canDeleteDrive?: boolean;
    canDownload?: boolean;
    canEdit?: boolean;
    canListChildren?: boolean;
    canManageMembers?: boolean;
    canReadRevisions?: boolean;
    canRename?: boolean;
    canRenameDrive?: boolean;
    canChangeDriveBackground?: boolean;
    canShare?: boolean;
    canChangeCopyRequiresWriterPermissionRestriction?: boolean;
    canChangeDomainUsersOnlyRestriction?: boolean;
    canChangeDriveMembersOnlyRestriction?: boolean;
    canChangeSharingFoldersRequiresOrganizerPermissionRestriction?: boolean;
    canResetDriveRestrictions?: boolean;
    canDeleteChildren?: boolean;
    canTrashChildren?: boolean;
  };
  themeId?: string;
  backgroundImageFile?: {
    id: string;
    xCoordinate: number;
    yCoordinate: number;
    width: number;
  };
  createdTime?: string;
  hidden?: boolean;
  restrictions?: {
    copyRequiresWriterPermission?: boolean;
    domainUsersOnly?: boolean;
    driveMembersOnly?: boolean;
    adminManagedRestrictions?: boolean;
    sharingFoldersRequiresOrganizerPermission?: boolean;
  };
  orgUnitId?: string;
}

export type GoogleDriveDriveInput = Partial<GoogleDriveDriveOutput>;
