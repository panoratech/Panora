/**
 * Represents a file-specific entry in the Dropbox API.
 */
export interface DropboxFileOutput {
  /**
   * A constant tag indicating the entry is a file.
   * Value will always be `'file'`.
   */
  '.tag': 'file';

  /**
   * The name of the file.
   */
  name: string;

  /**
   * The lowercased path of the file, useful for case-insensitive comparisons.
   */
  path_lower: string;

  /**
   * The display path of the file, with original casing.
   */
  path_display: string;

  /**
   * The Dropbox unique identifier for the file.
   */
  id: string;

  /**
   * The size of the file in bytes.
   */
  size: number;

  /**
   * A hash of the file content, useful for detecting file changes.
   */
  content_hash: string;

  /**
   * The revision number of the file.
   * Useful for file versioning.
   */
  rev: string;

  /**
   * The timestamp of when the file was last modified on the client.
   */
  client_modified: string;

  /**
   * The timestamp of when the file was last modified on the Dropbox server.
   */
  server_modified: string;

  /**
   * Whether the file is downloadable.
   */
  is_downloadable: boolean;

  /**
   * Information about file sharing, such as if it is read-only or shared.
   * This field is present if the file is part of a shared folder.
   */
  sharing_info?: SharingInfo;

  /**
   * Information about the export of the file, if it's an exportable file (e.g., Google Docs).
   */
  export_info?: ExportInfo;

  /**
   * The property groups associated with the file.
   */
  property_groups?: PropertyGroup[];

  /**
   * Indicates whether the file has any explicit member policy.
   */
  has_explicit_shared_members?: boolean;

  /**
   * Information about file locking, if applicable.
   */
  file_lock_info?: FileLockInfo;
}

/**
 * Represents sharing information for a file.
 */
export interface SharingInfo {
  /**
   * Whether the file is read-only for the current user.
   */
  read_only: boolean;

  /**
   * The ID of the parent shared folder, if this file is inside a shared folder.
   */
  parent_shared_folder_id?: string;

  /**
   * The unique ID of the shared folder.
   */
  shared_folder_id?: string;

  /**
   * Whether the file can be shared externally.
   */
  traverse_only?: boolean;

  /**
   * Whether the user has permission to manage sharing.
   */
  no_access?: boolean;
}

/**
 * Represents export information for a file, if applicable.
 */
export interface ExportInfo {
  /**
   * The format to which the file can be exported (e.g., pdf, docx).
   */
  export_as: string;
}

/**
 * Represents a property group associated with the file.
 */
export interface PropertyGroup {
  /**
   * The template ID of the property group.
   */
  template_id: string;

  /**
   * The list of properties under this group.
   */
  fields: PropertyField[];
}

/**
 * Represents a property field in a property group.
 */
export interface PropertyField {
  /**
   * The name of the property.
   */
  name: string;

  /**
   * The value of the property.
   */
  value: string;
}
/**
 * Represents a file lock information.
 */
export interface FileLockInfo {
  /**
   * The timestamp when the lock was created.
   */
  created: string;

  /**
   * Whether the user is the lockholder.
   */
  is_lockholder: boolean;

  /**
   * The name of the lockholder.
   */
  lockholder_name: string;
}

/**
 * Represents the request body for uploading a new file in Dropbox.
 */
export interface DropboxFileInput {
  /**
   * The path in the user's Dropbox to save the file.
   * Must match the pattern `(/(.|[\r\n])*)|(ns:[0-9]+(/.*)?)|(id:.*)?`
   * Example: "/new_folder/myfile.txt"
   */
  path: string;

  /**
   * Selects what to do if the file already exists.
   * The default for this union is "add".
   * Options: "add", "overwrite", "update"
   */
  mode: 'add' | 'overwrite' | 'update';

  /**
   * If true, Dropbox will automatically rename the file in case of a conflict.
   * The default is false.
   */
  autorename?: boolean;

  /**
   * The value to store as the client_modified timestamp.
   * Optional field in ISO 8601 format (e.g., "2024-09-12T14:00:00Z").
   */
  client_modified?: string;

  /**
   * If true, suppresses user notifications about this file modification.
   * The default is false.
   */
  mute?: boolean;

  /**
   * List of custom properties to add to the file.
   * Optional field.
   */
  property_groups?: PropertyGroup[];

  /**
   * If true, enforces stricter conflict detection.
   * Defaults to false.
   */
  strict_conflict?: boolean;

  /**
   * A hash of the file content uploaded in this call.
   * If provided, the uploaded content must match this hash.
   * Optional field with length between 64 characters.
   */
  content_hash?: string;
}
