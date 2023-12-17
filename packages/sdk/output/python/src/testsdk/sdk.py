"""
Creates a Testsdk class.
Generates the main SDK with all available queries as attributes.

Class:
    Testsdk
"""
from .net.environment import Environment

from .services.auth import Auth
from .services.connections import Connections
from .services.crm_contact import CrmContact
from .services.events import Events
from .services.field_mapping import FieldMapping
from .services.linked_users import LinkedUsers
from .services.magic_link import MagicLink
from .services.main import Main
from .services.organisations import Organisations
from .services.passthrough import Passthrough
from .services.projects import Projects
from .services.webhook import Webhook


class Testsdk:
    """
    A class representing the full Testsdk SDK

    Attributes
    ----------
    auth : Auth
    connections : Connections
    crm_contact : CrmContact
    events : Events
    field_mapping : FieldMapping
    linked_users : LinkedUsers
    magic_link : MagicLink
    main : Main
    organisations : Organisations
    passthrough : Passthrough
    projects : Projects
    webhook : Webhook

    Methods
    -------
    set_base_url(url: str)
        Sets the end URL
    set_access_token(access_token)
        Set the access token
    """

    def __init__(self, access_token="", environment=Environment.DEFAULT) -> None:
        """
        Initializes the Testsdk SDK class.
        Parameters
        ----------
        environment: str
            The environment that the SDK is accessing
        access_token : str
            The access token
        """
        self.auth = Auth(access_token)
        self.connections = Connections(access_token)
        self.crm_contact = CrmContact(access_token)
        self.events = Events(access_token)
        self.field_mapping = FieldMapping(access_token)
        self.linked_users = LinkedUsers(access_token)
        self.magic_link = MagicLink(access_token)
        self.main = Main(access_token)
        self.organisations = Organisations(access_token)
        self.passthrough = Passthrough(access_token)
        self.projects = Projects(access_token)
        self.webhook = Webhook(access_token)

        self.set_base_url(environment.value)

    def set_base_url(self, url: str) -> None:
        """
        Sets the end URL

        Parameters
        ----------
            url:
                The end URL
        """
        self.auth.set_base_url(url)
        self.connections.set_base_url(url)
        self.crm_contact.set_base_url(url)
        self.events.set_base_url(url)
        self.field_mapping.set_base_url(url)
        self.linked_users.set_base_url(url)
        self.magic_link.set_base_url(url)
        self.main.set_base_url(url)
        self.organisations.set_base_url(url)
        self.passthrough.set_base_url(url)
        self.projects.set_base_url(url)
        self.webhook.set_base_url(url)

    def set_access_token(self, token: str) -> None:
        """
        Sets auth token key

        Parameters
        ----------
        token: string
            Auth token value
        """
        self.auth.set_access_token(token)
        self.connections.set_access_token(token)
        self.crm_contact.set_access_token(token)
        self.events.set_access_token(token)
        self.field_mapping.set_access_token(token)
        self.linked_users.set_access_token(token)
        self.magic_link.set_access_token(token)
        self.main.set_access_token(token)
        self.organisations.set_access_token(token)
        self.passthrough.set_access_token(token)
        self.projects.set_access_token(token)
        self.webhook.set_access_token(token)
