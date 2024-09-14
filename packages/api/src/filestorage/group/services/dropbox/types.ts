/**
 * Represents a group in Dropbox.
 */
export interface DropboxGroupOutput {
  /**
   * The name of the group.
   */
  group_name: string;

  /**
   * The unique identifier for the group.
   */
  group_id: string;

  /**
   * The management type of the group.
   * This field indicates who is allowed to manage the group.
   */
  group_management_type: {
    '.tag': GroupManagementType;
  };

  /**
   * An external ID associated with the group.
   * This field is optional and allows an admin to attach an arbitrary ID to the group.
   */
  group_external_id?: string;

  /**
   * The number of members in the group.
   * This field is optional.
   */
  member_count?: number;
}

/**
 * Represents the type of management for a group in Dropbox.
 * This determines who is allowed to manage the group.
 */
type GroupManagementType =
  | 'user_managed'
  | 'company_managed'
  | 'system_managed';

/**
 * Represents the input data for creating or updating a group in Dropbox.
 */
export interface DropboxGroupInput {
  /**
   * The name of the group.
   */
  group_name: string;

  /**
   * Whether to automatically add the creator of the group as an owner.
   * The default value is `false`.
   */
  add_creator_as_owner?: boolean;

  /**
   * An external ID associated with the group.
   * This field allows the creator of a team to attach an arbitrary external ID to the group.
   * This field is optional.
   */
  group_external_id?: string;

  /**
   * The management type of the group.
   * Determines whether the group can be managed by selected users or only by team admins.
   * This field is optional.
   */
  group_management_type?: GroupManagementType;
}
