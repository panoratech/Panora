/**
 * Represents a folder-specific entry in the Dropbox API.
 */
export interface DropboxFolderOutput {
  /**
   * A constant tag indicating the entry is a folder.
   * Value will always be `'folder'`.
   */
  '.tag': 'folder';

  /**
   * The name of the folder.
   */
  name: string;

  /**
   * The lowercased path of the folder, useful for case-insensitive comparisons.
   */
  path_lower: string;

  /**
   * The display path of the folder, with original casing.
   */
  path_display: string;

  /**
   * The Dropbox unique identifier for the folder.
   */
  id: string;

  /**
   * Information about folder sharing, such as if it is read-only or shared.
   * This field is present if the folder is part of a shared folder.
   */
  sharing_info?: SharingInfo;
}

/**
 * Represents sharing information for a folder.
 */
export interface SharingInfo {
  /**
   * Whether the folder is read-only for the current user.
   */
  read_only: boolean;

  /**
   * The ID of the parent shared folder, if this folder is inside a shared folder.
   */
  parent_shared_folder_id?: string;

  /**
   * The unique ID of the shared folder.
   */
  shared_folder_id?: string;
}

/**
 * Represents the request body for creating a new folder in Dropbox.
 */
export interface DropboxFolderInput {
  /**
   * The path to the folder you want to create, including the new folder's name.
   * Example: "/new_folder_name"
   */
  path: string;

  /**
   * If true, the folder will be automatically renamed if a conflict occurs (i.e., if a folder with the same name already exists).
   * Defaults to false.
   */
  autorename?: boolean;
}
