import {
  IdentitySet,
  SharepointIds,
} from '@filestorage/drive/services/onedrive/types';
import { OnedrivePermissionOutput } from '@filestorage/permission/services/onedrive/types';

/**
 * Represents the input for a folder item in OneDrive.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/driveitem?view=graph-rest-1.0
 */
export interface OnedriveFolderInput {
  /** The unique identifier of the item within the Drive. */
  readonly id?: string;
  /** The name of the item (filename and extension). */
  name?: string;
  /** The URL that displays the resource in the browser. */
  readonly webUrl?: string;
  /** Folder metadata. */
  folder?: Folder;
  /** File system information on the client. */
  fileSystemInfo?: FileSystemInfo;
  /** Parent information, if the item has a parent. */
  parentReference?: ItemReference;
  /** The unique identifier of the drive instance that contains the driveItem. */
  readonly driveId?: string;
  /** Identifies the type of drive. */
  readonly driveType?: string;
  /** Information about the deleted state of the item. */
  deleted?: Deleted;
  /** Description of the item. */
  description?: string;
  /** Indicates the number of children contained immediately within this folder. */
  readonly childCount?: number;
  /** Information about pending operations on the item. */
  pendingOperations?: PendingOperations;
  /** View recommendations for the folder. */
  folderView?: FolderView;
  /** SharePoint identifiers useful for REST compatibility. */
  readonly sharepointIds?: SharepointIds;
  /** Special folder metadata. */
  readonly specialFolder?: SpecialFolder;
  /** Identity of the user who created the folder. */
  readonly createdByUser?: IdentitySet;
  /** Identity of the user who last modified the folder. */
  readonly lastModifiedByUser?: IdentitySet;
  /** Permissions associated with the folder. */
  permissions?: OnedrivePermissionOutput[];
  /** Date and time the item was last modified. Read-only. */
  readonly lastModifiedDateTime?: string;
  /** Date and time of item creation. Read-only. */
  readonly createdDateTime?: string;
  /** Size of the item in bytes. Read-only. */
  readonly size?: number;
  /** Identity of the user, device, and application that created the item. Read-only. */
  readonly createdBy?: IdentitySet;
  /** Identity of the user, device, and application that last modified the item. Read-only. */
  readonly lastModifiedBy?: IdentitySet;
  /** If this property is non-null, it indicates that the driveItem is the top-most driveItem in the drive. */
  readonly root?: any;

  // internal fields
  internal_id?: string;
  internal_parent_folder_id?: string;
  internal_permissions?: string[];
}

/**
 * Represents the folder metadata.
 */
export interface Folder {
  /** The number of children contained immediately within this container. */
  readonly childCount?: number;
  /** A collection of properties defining the recommended view for the folder. */
  view?: FolderView;
}

/**
 * Represents file system information for a client.
 */
export interface FileSystemInfo {
  /** The UTC date and time the file was created on a client. */
  readonly createdDateTime?: string;
  /** The UTC date and time the file was last accessed. */
  readonly lastAccessedDateTime?: string;
  /** The UTC date and time the file was last modified on a client. */
  readonly lastModifiedDateTime?: string;
}

/**
 * Represents folder view recommendations.
 */
export interface FolderView {
  /** How items in the folder are sorted. */
  sortBy?:
    | 'default'
    | 'name'
    | 'type'
    | 'size'
    | 'takenOrCreatedDateTime'
    | 'lastModifiedDateTime'
    | 'sequence';
  /** The order in which items are sorted. */
  sortOrder?: 'ascending' | 'descending';
  /** The type of view recommended for the folder. */
  viewType?: 'default' | 'icons' | 'details' | 'thumbnails';
}

/**
 * Represents the reference to an item.
 */
export interface ItemReference {
  /** Unique identifier of the drive instance that contains the driveItem. */
  readonly driveId?: string;
  /** Identifies the type of drive. */
  readonly driveType?: string;
  /** Unique identifier of the driveItem in the drive or listItem in a list. */
  readonly id?: string;
  /** The name of the item being referenced. */
  readonly name?: string;
  /** Percent-encoded path to navigate to the item. */
  readonly path?: string;
  /** Unique identifier for a shared resource. */
  readonly shareId?: string;
  /** SharePoint identifiers useful for REST compatibility. */
  readonly sharepointIds?: SharepointIds;
  /** ID of the site containing the parent document library or list. */
  readonly siteId?: string;
}

/**
 * Represents information about pending operations on an item.
 */
export interface PendingOperations {
  /** Indicates that an operation that might update the binary content of a file is pending completion. */
  readonly pendingContentUpdate?: PendingContentUpdate;
}

/**
 * Represents information about an operation that might affect the binary content of the driveItem.
 */
export interface PendingContentUpdate {
  /** Date and time the pending binary operation was queued in UTC time. */
  readonly queuedDateTime?: string;
}

/**
 * Represents special folder metadata.
 */
export interface SpecialFolder {
  /** The unique identifier for this item in the /drive/special collection. */
  readonly name?: string;
}

/**
 * Represents information about the deleted state of an item.
 */
export interface Deleted {
  /** Represents the state of the deleted item. */
  state?: string;
}

export type OnedriveFolderOutput = OnedriveFolderInput;
