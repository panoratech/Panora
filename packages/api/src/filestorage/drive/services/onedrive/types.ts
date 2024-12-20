/**
 * Represents the response from the OneDrive API for a specific drive.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/drive?view=graph-rest-1.0
 */
export interface OnedriveDriveOutput {
  /** The date and time when the drive was created. */
  readonly createdDateTime: string;
  /** A user-visible description of the drive. */
  description: string;
  /** The unique identifier of the drive. */
  readonly id: string;
  /** The date and time when the drive was last modified. */
  readonly lastModifiedDateTime: string;
  /** The name of the drive. */
  name: string;
  /** URL that displays the resource in the browser. */
  readonly webUrl: string;
  /** Describes the type of drive represented by this resource. */
  readonly driveType: 'personal' | 'business' | 'documentLibrary';
  /** Identity of the user, device, or application which created the item. Read-only. */
  readonly createdBy: IdentitySet;
  /** Identity of the user, device, and application which last modified the item. Read-only. */
  readonly lastModifiedBy: IdentitySet;
  /** The user account that owns the drive. */
  readonly owner?: IdentitySet;
  /** Information about the drive's storage space quota. */
  readonly quota?: Quota;
  /** SharePoint identifiers for REST compatibility. */
  readonly sharepointIds?: SharepointIds;
  /** Indicates that this is a system-managed drive. */
  readonly system?: SystemFacet;
}

/**
 * Represents a set of identities, such as user, device, or application identities.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/identityset?view=graph-rest-1.0
 */
export interface IdentitySet {
  /** Identity representing an application. */
  readonly application?: Identity;
  /** Identity representing an application instance. */
  readonly applicationInstance?: Identity;
  /** Identity representing a conversation. */
  readonly conversation?: Identity;
  /** Identity representing a conversation identity type. */
  readonly conversationIdentityType?: Identity;
  /** Identity representing a device. */
  readonly device?: Identity;
  /** Identity representing encrypted identity information. */
  readonly encrypted?: Identity;
  /** Identity representing an on-premises identity. */
  readonly onPremises?: Identity;
  /** Identity representing a guest user. */
  readonly guest?: Identity;
  /** Identity representing a phone identity. */
  readonly phone?: Identity;
  /** Identity representing a user. */
  readonly user?: Identity;
  /** Identity representing a group. */
  readonly group?: Identity;
}

/**
 * Represents a generic identity used in various identity sets.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/identity?view=graph-rest-1.0
 */
export interface Identity {
  /** The display name of the identity. */
  readonly displayName?: string;
  /** The ID of the identity. */
  readonly id?: string;
  /** The identity type (such as user, application, or device). */
  readonly identityType?: string;
  /** The email address of the identity. */
  readonly email?: string;
}

/**
 * Represents the storage quota information of a drive.
 */
export interface Quota {
  /** The total number of bytes deleted from the drive. */
  readonly deleted: number;
  /** The total number of bytes remaining in the drive's quota. */
  readonly remaining: number;
  /** The state of the drive's quota (e.g., normal, nearing, exceeded). */
  readonly state: 'normal' | 'nearing' | 'critical' | 'exceeded';
  /** The total number of bytes in the drive's quota. */
  readonly total: number;
  /** The total number of bytes used in the drive. */
  readonly used: number;
  /** Information about storage plan upgrades, if available. */
  readonly storagePlanInformation?: StoragePlanInformation;
}

/**
 * Represents storage plan upgrade information.
 */
export interface StoragePlanInformation {
  /** Indicates whether an upgrade is available for the storage plan. */
  readonly upgradeAvailable: boolean;
}

/**
 * Represents SharePoint-specific identifiers for an item.
 */
export interface SharepointIds {
  /** The unique identifier (GUID) for the item's list in SharePoint. */
  readonly listId: string;
  /** An integer identifier for the item within the containing list. */
  readonly listItemId: string;
  /** The unique identifier (GUID) for the item within OneDrive for Business or a SharePoint site. */
  readonly listItemUniqueId: string;
  /** The unique identifier (GUID) for the item's site collection (SPSite). */
  readonly siteId: string;
  /** The SharePoint URL for the site that contains the item. */
  readonly siteUrl: string;
  /** The unique identifier (GUID) for the tenancy. */
  readonly tenantId: string;
  /** The unique identifier (GUID) for the item's site (SPWeb). */
  readonly webId: string;
}

/**
 * Represents system-related metadata for the drive.
 */
export interface SystemFacet {
  // Add properties specific to the system facet if needed.
  readonly [key: string]: any;
}

export type OnedriveDriveInput = Partial<OnedriveDriveOutput>;
