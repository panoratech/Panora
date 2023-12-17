import { AuthService } from './services/auth/Auth';
import { ConnectionsService } from './services/connections/Connections';
import { CrmContactService } from './services/crmContact/CrmContact';
import { EventsService } from './services/events/Events';
import { FieldMappingService } from './services/fieldMapping/FieldMapping';
import { LinkedUsersService } from './services/linkedUsers/LinkedUsers';
import { MagicLinkService } from './services/magicLink/MagicLink';
import { MainService } from './services/main/Main';
import { OrganisationsService } from './services/organisations/Organisations';
import { PassthroughService } from './services/passthrough/Passthrough';
import { ProjectsService } from './services/projects/Projects';

export * from './models';

export * as AuthModels from './services/auth';
export * as FieldMappingModels from './services/fieldMapping';
export * as LinkedUsersModels from './services/linkedUsers';
export * as MagicLinkModels from './services/magicLink';
export * as OrganisationsModels from './services/organisations';
export * as PassthroughModels from './services/passthrough';
export * as ProjectsModels from './services/projects';

type Config = {
  accessToken?: string;
};

export * from './http/errors';

/**
 * The Panora API description
 */
export class PanoraSDK {
  public auth: AuthService;
  public connections: ConnectionsService;
  public crmContact: CrmContactService;
  public events: EventsService;
  public fieldMapping: FieldMappingService;
  public linkedUsers: LinkedUsersService;
  public magicLink: MagicLinkService;
  public main: MainService;
  public organisations: OrganisationsService;
  public passthrough: PassthroughService;
  public projects: ProjectsService;

  constructor({ accessToken = '' }: Config) {
    this.auth = new AuthService(accessToken);
    this.connections = new ConnectionsService(accessToken);
    this.crmContact = new CrmContactService(accessToken);
    this.events = new EventsService(accessToken);
    this.fieldMapping = new FieldMappingService(accessToken);
    this.linkedUsers = new LinkedUsersService(accessToken);
    this.magicLink = new MagicLinkService(accessToken);
    this.main = new MainService(accessToken);
    this.organisations = new OrganisationsService(accessToken);
    this.passthrough = new PassthroughService(accessToken);
    this.projects = new ProjectsService(accessToken);
  }

  /**
   * Sets the baseUrl that the SDK will use for its requests.
   * @param {string} url
   */
  setBaseUrl(url: string): void {
    this.auth.setBaseUrl(url);
    this.connections.setBaseUrl(url);
    this.crmContact.setBaseUrl(url);
    this.events.setBaseUrl(url);
    this.fieldMapping.setBaseUrl(url);
    this.linkedUsers.setBaseUrl(url);
    this.magicLink.setBaseUrl(url);
    this.main.setBaseUrl(url);
    this.organisations.setBaseUrl(url);
    this.passthrough.setBaseUrl(url);
    this.projects.setBaseUrl(url);
  }

  /**
   * Sets the access token used to authenticate.
   * @param {string} accessToken
   */
  setAccessToken(accessToken: string) {
    this.auth.setAccessToken(accessToken);
    this.connections.setAccessToken(accessToken);
    this.crmContact.setAccessToken(accessToken);
    this.events.setAccessToken(accessToken);
    this.fieldMapping.setAccessToken(accessToken);
    this.linkedUsers.setAccessToken(accessToken);
    this.magicLink.setAccessToken(accessToken);
    this.main.setAccessToken(accessToken);
    this.organisations.setAccessToken(accessToken);
    this.passthrough.setAccessToken(accessToken);
    this.projects.setAccessToken(accessToken);
  }
}
