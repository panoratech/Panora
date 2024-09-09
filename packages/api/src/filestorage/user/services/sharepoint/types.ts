import { SharepointDriveOutput } from '@filestorage/drive/services/sharepoint/types';

/**
 * Represents the response from the OneDrive API for a specific user.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/user?view=graph-rest-1.0
 */
export interface SharepointUserInput {
  /** The unique identifier for the user. */
  readonly id?: string;
  /**
   * true if the account is enabled; otherwise, false. This property is required when a user is created. Returned only on
   * $select. Supports $filter (eq, ne, not, and in).
   */
  accountEnabled?: boolean;
  /**
   * The birthday of the user. The Timestamp type represents date and time information using ISO 8601 format and is always
   * in UTC. For example, midnight UTC on Jan 1, 2014, is 2014-01-01T00:00:00Z. Returned only on $select.
   */
  readonly birthday?: string;
  /**
   * The telephone numbers for the user. NOTE: Although it's a string collection, only one number can be set for this
   * property. Read-only for users synced from the on-premises directory. Returned by default. Supports $filter (eq, not,
   * ge, le, startsWith).
   */
  readonly businessPhones?: string[];
  /**
   * The city where the user is located. Maximum length is 128 characters. Returned only on $select. Supports $filter (eq,
   * ne, not, ge, le, in, startsWith, and eq on null values).
   */
  readonly city?: string;
  /**
   * The name of the company that the user is associated with. This property can be useful for describing the company that a
   * guest comes from. The maximum length is 64 characters.Returned only on $select. Supports $filter (eq, ne, not, ge, le,
   * in, startsWith, and eq on null values).
   */
  readonly companyName?: string;
  /**
   * The country/region where the user is located; for example, US or UK. Maximum length is 128 characters. Returned only on
   * $select. Supports $filter (eq, ne, not, ge, le, in, startsWith, and eq on null values).
   */
  readonly country?: string;
  /**
   * The date and time the user was created, in ISO 8601 format and UTC. The value can't be modified and is automatically
   * populated when the entity is created. Nullable. For on-premises users, the value represents when they were first
   * created in Microsoft Entra ID. Property is null for some users created before June 2018 and on-premises users that were
   * synced to Microsoft Entra ID before June 2018. Read-only. Returned only on $select. Supports $filter (eq, ne, not , ge,
   * le, in).
   */
  readonly createdDateTime?: string;
  /**
   * Indicates whether the user account was created through one of the following methods: As a regular school or work
   * account (null). As an external account (Invitation). As a local account for an Azure Active Directory B2C tenant
   * (LocalAccount). Through self-service sign-up by an internal user using email verification (EmailVerified). Through
   * self-service sign-up by a guest signing up through a link that is part of a user flow (SelfServiceSignUp).
   * Read-only.Returned only on $select. Supports $filter (eq, ne, not, in).
   */
  readonly creationType?: string;
  /**
   * The name displayed in the address book for the user. This value is usually the combination of the user's first name,
   * middle initial, and family name. This property is required when a user is created and it can't be cleared during
   * updates. Maximum length is 256 characters. Returned by default. Supports $filter (eq, ne, not , ge, le, in, startsWith,
   * and eq on null values), $orderby, and $search.
   */
  displayName?: string;
  /**
   * The user's job title. Maximum length is 128 characters. Returned by default. Supports $filter (eq, ne, not , ge, le,
   * in, startsWith, and eq on null values).
   */
  jobTitle?: string;
  /**
   * The given name (first name) of the user. Maximum length is 64 characters. Returned by default. Supports $filter (eq,
   * ne, not , ge, le, in, startsWith, and eq on null values).
   */
  givenName?: string;
  /**
   * The SMTP address for the user, for example, jeff@contoso.com. Changes to this property update the user's proxyAddresses
   * collection to include the value as an SMTP address. This property can't contain accent characters. NOTE: We don't
   * recommend updating this property for Azure AD B2C user profiles. Use the otherMails property instead. Returned by
   * default. Supports $filter (eq, ne, not, ge, le, in, startsWith, endsWith, and eq on null values).
   */
  mail?: string;
  /**
   * The mail alias for the user. This property must be specified when a user is created. Maximum length is 64 characters.
   * Returned only on $select. Supports $filter (eq, ne, not, ge, le, in, startsWith, and eq on null values).
   */
  mailNickname?: string;
  /**
   * The primary cellular telephone number for the user. Read-only for users synced from the on-premises directory. Maximum
   * length is 64 characters. Returned by default. Supports $filter (eq, ne, not, ge, le, in, startsWith, and eq on null
   * values) and $search.
   */
  mobilePhone?: string;
  /**
   * A list of other email addresses for the user; for example: ['bob@contoso.com', 'Robert@fabrikam.com']. NOTE: This
   * property can't contain accent characters. Returned only on $select. Supports $filter (eq, not, ge, le, in, startsWith,
   * endsWith, /$count eq 0, /$count ne 0).
   */
  otherMails?: string[];
  /**
   * The postal code for the user's postal address. The postal code is specific to the user's country/region. In the United
   * States of America, this attribute contains the ZIP code. Maximum length is 40 characters. Returned only on $select.
   * Supports $filter (eq, ne, not, ge, le, in, startsWith, and eq on null values).
   */
  postalCode?: string;
  /**
   * The preferred language for the user. The preferred language format is based on RFC 4646. The name is a combination of
   * an ISO 639 two-letter lowercase culture code associated with the language, and an ISO 3166 two-letter uppercase
   * subculture code associated with the country or region. Example: 'en-US', or 'es-ES'. Returned by default. Supports
   * $filter (eq, ne, not, ge, le, in, startsWith, and eq on null values)
   */
  preferredLanguage?: string;
  /**
   * The state or province in the user's address. Maximum length is 128 characters. Returned only on $select. Supports
   * $filter (eq, ne, not, ge, le, in, startsWith, and eq on null values).
   */
  state?: string;
  /**
   * The street address of the user's place of business. Maximum length is 1,024 characters. Returned only on $select.
   * Supports $filter (eq, ne, not, ge, le, in, startsWith, and eq on null values).
   */
  streetAddress?: string;
  /**
   * The user's surname (family name or last name). Maximum length is 64 characters. Returned by default. Supports $filter
   * (eq, ne, not, ge, le, in, startsWith, and eq on null values).
   */
  surname?: string;
  /**
   * The user principal name (UPN) of the user. The UPN is an Internet-style sign-in name for the user based on the Internet
   * standard RFC 822. By convention, this value should map to the user's email name. The general format is alias@domain,
   * where the domain must be present in the tenant's collection of verified domains. This property is required when a user
   * is created. The verified domains for the tenant can be accessed from the verifiedDomains property of organization.NOTE:
   * This property can't contain accent characters. Only the following characters are allowed A - Z, a - z, 0 - 9, ' . - _ !
   * # ^ ~. For the complete list of allowed characters, see username policies. Returned by default. Supports $filter (eq,
   * ne, not, ge, le, in, startsWith, endsWith) and $orderby.
   */
  userPrincipalName?: string;
  /**
   * The user's OneDrive. Read-only.
   */
  readonly drive?: SharepointDriveOutput;
  /**
   * A collection of drives available for this user. Read-only.
   */
  readonly drives?: SharepointDriveOutput[];
  /**
   * Specifies the password profile for the user. The profile contains the user's password. This property is required when a
   * user is created. The password in the profile must satisfy minimum requirements as specified by the passwordPolicies
   * property. By default, a strong password is required. Returned only on $select. Supports $filter (eq, ne, not, in, and
   * eq on null values).
   */
  passwordProfile?: PasswordProfile;
  /**
   * The user's profile photo. Read-only.
   */
  readonly photo?: ProfilePhoto;
  /**
   * The collection of the user's profile photos in different sizes. Read-only.
   */
  readonly photos?: ProfilePhoto[];
  /**
   * Sets the age group of the user. Allowed values: null, Minor, NotAdult, and Adult (or number). For more information, see legal age
   * group property definitions. Returned only on $select. Supports $filter (eq, ne, not, and in).
   */
  ageGroup?: string;
}

/**
 * Represents a profile photo.
 */
export interface ProfilePhoto {
  /**
   * The height of the photo. Read-only.
   */
  readonly height?: number;
  /**
   * The width of the photo. Read-only.
   */
  readonly width?: number;
  /**
   * The unique identifier for an entity. Read-only.
   */
  readonly id?: string;
}

export interface PasswordProfile {
  // true if the user must change their password on the next sign-in; otherwise false.
  forceChangePasswordNextSignIn?: boolean;
  /**
   * If true, at next sign-in, the user must perform a multifactor authentication (MFA) before being forced to change their
   * password. The behavior is identical to forceChangePasswordNextSignIn except that the user is required to first perform
   * a multifactor authentication before password change. After a password change, this property will be automatically reset
   * to false. If not set, default is false.
   */
  forceChangePasswordNextSignInWithMfa?: boolean;
  /**
   * The password for the user. This property is required when a user is created. It can be updated, but the user will be
   * required to change the password on the next sign-in. The password must satisfy minimum requirements as specified by the
   * user's passwordPolicies property. By default, a strong password is required.
   */
  password?: string;
}

export type SharepointUserOutput = Partial<SharepointUserInput>;
