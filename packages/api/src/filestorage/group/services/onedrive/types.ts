export interface OnedriveGroupInput {
  /** Unique identifier for the group. */
  id?: string;
  /**
   * Timestamp of when the group was created. The value can't be modified and is automatically populated when the group is
   * created. The Timestamp type represents date and time information using ISO 8601 format and is always in UTC time. For
   * example, midnight UTC on January 1, 2014 is 2014-01-01T00:00:00Z. Returned by default. Read-only.
   */
  createdDateTime?: string;
  /**
   * An optional description for the group. Returned by default. Supports $filter (eq, ne, not, ge, le, startsWith) and
   * $search.
   */
  description?: string;
  /**
   * Date and time when this object was deleted. Always null when the object hasn't been deleted.
   */
  deletedDateTime?: string;
  /**
   * The display name for the group. This property is required when a group is created and can't be cleared during updates.
   * Maximum length is 256 characters. Returned by default. Supports $filter (eq, ne, not, ge, le, in, startsWith, and eq on
   * null values), $search, and $orderby.
   */
  displayName?: string;
  /**
   * Timestamp of when the group is set to expire. It's null for security groups, but for Microsoft 365 groups, it
   * represents when the group is set to expire as defined in the groupLifecyclePolicy. The Timestamp type represents date
   * and time information using ISO 8601 format and is always in UTC. For example, midnight UTC on January 1, 2014 is
   * 2014-01-01T00:00:00Z. Returned by default. Supports $filter (eq, ne, not, ge, le, in). Read-only.
   */
  expirationDateTime?: string;
  /**
   * Specifies the group type and its membership. If the collection contains Unified, the group is a Microsoft 365 group;
   * otherwise, it's either a security group or a distribution group. For details, see groups overview.If the collection
   * includes DynamicMembership, the group has dynamic membership; otherwise, membership is static. Returned by default.
   * Supports $filter (eq, not).
   */
  groupTypes?: string[];
  /**
   * When a group is associated with a team, this property determines whether the team is in read-only mode.To read this
   * property, use the /group/{groupId}/team endpoint or the Get team API. To update this property, use the archiveTeam and
   * unarchiveTeam APIs.
   */
  isArchived?: boolean;
  /**
   * The SMTP address for the group, for example, 'serviceadmins@contoso.com'. Returned by default. Read-only. Supports
   * $filter (eq, ne, not, ge, le, in, startsWith, and eq on null values).
   */
  mail?: string;
  // Specifies whether the group is mail-enabled. Required. Returned by default. Supports $filter (eq, ne, not).
  mailEnabled?: boolean;
  /**
   * The mail alias for the group, unique for Microsoft 365 groups in the organization. Maximum length is 64 characters.
   * This property can contain only characters in the ASCII character set 0 - 127 except the following characters: @ () / []
   * ' ; : &amp;lt;&amp;gt; , SPACE. Required. Returned by default. Supports $filter (eq, ne, not, ge, le, in, startsWith,
   * and eq on null values).
   */
  mailNickname?: string;
  /**
   * The preferred data location for the Microsoft 365 group. By default, the group inherits the group creator's preferred
   * data location. To set this property, the calling app must be granted the Directory.ReadWrite.All permission and the
   * user be assigned at least one of the following Microsoft Entra roles: User Account Administrator Directory Writer
   * Exchange Administrator SharePoint Administrator For more information about this property, see OneDrive Online
   * Multi-Geo. Nullable. Returned by default.
   */
  preferredDataLocation?: string;
  /**
   * The preferred language for a Microsoft 365 group. Should follow ISO 639-1 Code; for example, en-US. Returned by
   * default. Supports $filter (eq, ne, not, ge, le, in, startsWith, and eq on null values).
   */
  preferredLanguage?: string;
  /**
   * Email addresses for the group that direct to the same group mailbox. For example: ['SMTP: bob@contoso.com', 'smtp:
   * bob@sales.contoso.com']. The any operator is required to filter expressions on multi-valued properties. Returned by
   * default. Read-only. Not nullable. Supports $filter (eq, not, ge, le, startsWith, endsWith, /$count eq 0, /$count ne 0).
   */
  proxyAddresses?: string[];
  /**
   * Timestamp of when the group was last renewed. This value can't be modified directly and is only updated via the renew
   * service action. The Timestamp type represents date and time information using ISO 8601 format and is always in UTC. For
   * example, midnight UTC on January 1, 2014 is 2014-01-01T00:00:00Z. Returned by default. Supports $filter (eq, ne, not,
   * ge, le, in). Read-only.
   */

  renewedDateTime?: string;
  /**
   * Specifies whether the group is a security group. Required. Returned by default. Supports $filter (eq, ne, not, in).
   */
  securityEnabled?: boolean;
  /**
   * Security identifier of the group, used in Windows scenarios. Read-only. Returned by default.
   */
  securityIdentifier?: string;
  // The unique identifier that can be assigned to a group and used as an alternate key. Immutable. Read-only.
  uniqueName?: string;
  /**
   * Specifies the group join policy and group content visibility for groups. Possible values are: Private, Public, or
   * HiddenMembership. HiddenMembership can be set only for Microsoft 365 groups when the groups are created. It can't be
   * updated later. Other values of visibility can be updated after group creation. If visibility value isn't specified
   * during group creation on Microsoft Graph, a security group is created as Private by default, and the Microsoft 365
   * group is Public. Groups assignable to roles are always Private. To learn more, see group visibility options. Returned
   * by default. Nullable.
   */
  visibility?: string;
  /**
   * The user (or application) that created the group. NOTE: This property isn't set if the user is an administrator.
   * Read-only.
   */
  createdOnBehalfOf?: DirectoryObject;
  /**
   * Groups that this group is a member of. HTTP Methods: GET (supported for all groups). Read-only. Nullable. Supports
   * $expand.
   */
  memberOf?: DirectoryObject[];
  /**
   * The members of this group, who can be users, devices, other groups, or service principals. Supports the List members,
   * Add member, and Remove member operations. Nullable. Supports $expand including nested $select. For example,
   * /groups?$filter=startsWith(displayName,'Role')&amp;$select=id,displayName&amp;$expand=members($select=id,userPrincipalName,displayName).
   */
  members?: DirectoryObject[];
  /**
   * The owners of the group. Limited to 100 owners. Nullable. If this property isn't specified when creating a Microsoft
   * 365 group, the calling user is automatically assigned as the group owner. Supports $filter (/$count eq 0, /$count ne 0,
   * /$count eq 1, /$count ne 1). Supports $expand including nested $select. For example,
   * /groups?$filter=startsWith(displayName,'Role')&amp;$select=id,displayName&amp;$expand=owners($select=id,userPrincipalName,displayName).
   */
  owners?: DirectoryObject[];

  // INTERNAL
  /**
   * Internal UUIDs of users that are members of this group.
   */
  internal_users?: string[];
}

/**
 * Base type for all directory objects.
 * @interface
 */
export interface DirectoryObject {
  /**
   * The unique identifier for an entity. Read-only.
   */
  id?: string;
  /**
   * Date and time when this object was deleted. Always null when the object hasn't been deleted.
   */
  deletedDateTime?: string;
}

export type OnedriveGroupOutput = Partial<OnedriveGroupInput>;
