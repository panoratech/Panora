export interface GoogleDriveFolderInput {
  name: string;
  mimeType: string;
  parents?: string[];
}

export interface GoogleDriveFolderOutput {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  parents?: string[];
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  hasThumbnail?: boolean;
  thumbnailLink?: string;
  shared?: boolean;
  ownedByMe?: boolean;
  capabilities?: {
    canEdit?: boolean;
    canShare?: boolean;
    canDelete?: boolean;
    canAddChildren?: boolean;
    canRemoveChildren?: boolean;
    canRename?: boolean;
    canMoveItemWithinDrive?: boolean;
    canMoveItemOutOfDrive?: boolean;
    canTrash?: boolean;
    canUntrash?: boolean;
  };
  permissions?: any[]; // You can define a more specific type if needed
  trashed?: boolean;
  explicitlyTrashed?: boolean;
  spaces?: string[];
}
