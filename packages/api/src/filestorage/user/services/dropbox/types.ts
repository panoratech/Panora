/**
 * Represents the profile information for a Dropbox team member.
 */
export interface DropboxUserProfile {
  /**
   * The unique identifier for the member within Dropbox as a team member.
   */
  team_member_id: string;

  /**
   * The email address of the member.
   */
  email: string;

  /**
   * Whether the email address has been verified.
   */
  email_verified: boolean;

  /**
   * The status of the member.
   */
  status: {
    /**
     * The status of the member.
     * Possible values: 'active', 'inactive', 'suspended', 'invited', etc.
     */
    '.tag': 'active' | 'inactive' | 'suspended' | 'invited';
  };

  /**
   * The name details of the member.
   */
  name: {
    /**
     * The abbreviated name of the member.
     */
    abbreviated_name?: string;

    /**
     * The display name of the member.
     */
    display_name?: string;

    /**
     * The familiar name of the member.
     */
    familiar_name?: string;

    /**
     * The given name of the member.
     */
    given_name?: string;

    /**
     * The surname of the member.
     */
    surname?: string;
  };

  /**
   * The membership type of the member.
   */
  membership_type: {
    /**
     * The type of membership.
     * Possible values: 'full' (normal team member), 'limited' (does not use a license), etc.
     */
    '.tag': 'full' | 'limited';
  };

  /**
   * List of group IDs that the member belongs to.
   */
  groups?: string[];

  /**
   * The namespace ID of the member's folder.
   */
  member_folder_id: string;

  /**
   * The namespace ID of the member's root folder.
   */
  root_folder_id: string;

  /**
   * An external ID that a team can attach to the member.
   */
  external_id?: string;

  /**
   * A user's account identifier.
   */
  account_id?: string;

  /**
   * List of secondary email addresses for the member.
   */
  secondary_emails?: {
    /**
     * A secondary email address.
     */
    email: string;

    /**
     * Whether the secondary email address has been verified.
     */
    is_verified: boolean;
  }[];

  /**
   * The date and time the member was invited to the team.
   */
  invited_on?: string; // ISO 8601 timestamp

  /**
   * The date and time the member joined the team.
   */
  joined_on?: string; // ISO 8601 timestamp

  /**
   * The date and time the member was suspended from the team.
   */
  suspended_on?: string; // ISO 8601 timestamp

  /**
   * A unique ID used for SAML authentication.
   */
  persistent_id?: string;

  /**
   * Whether the member is a directory restricted user.
   */
  is_directory_restricted?: boolean;

  /**
   * URL for the photo representing the member.
   */
  profile_photo_url?: string;
}

/**
 * Represents a role assigned to a Dropbox team member.
 */
export interface DropboxUserRole {
  /**
   * The unique ID of the role.
   */
  role_id: string;

  /**
   * The display name of the role.
   */
  name: string;

  /**
   * Description of the role and its permissions.
   */
  description: string;
}

/**
 * Represents a Dropbox team member entry returned from the /team/members/list_v2 API.
 */
export interface DropboxUserOutput {
  /**
   * The profile information of the team member.
   */
  profile: DropboxUserProfile;

  /**
   * List of roles assigned to the team member.
   */
  roles?: DropboxUserRole[];
}

/**
 * Represents the input information for adding a new team member in Dropbox.
 */
export interface DropboxUserInput {
  /**
   * The email address of the member to be added.
   */
  member_email: string;

  /**
   * The given (first) name of the member.
   * This field is optional.
   */
  member_given_name?: string;

  /**
   * The surname (last name) of the member.
   * This field is optional.
   */
  member_surname?: string;

  /**
   * An external ID to associate with the member.
   * This field is optional.
   */
  member_external_id?: string;

  /**
   * A persistent ID for the member, used for SAML authentication.
   * This field is optional and only available for teams using persistent ID SAML configuration.
   */
  member_persistent_id?: string;

  /**
   * Whether to send a welcome email to the member.
   * If set to false, no email invitation will be sent to the user. Defaults to true.
   */
  send_welcome_email?: boolean;

  /**
   * Whether the user is directory restricted.
   * This field is optional.
   */
  is_directory_restricted?: boolean;

  /**
   * List of role IDs to assign to the member.
   * This field is optional and can have a maximum of one role ID.
   */
  role_ids?: string[];
}
