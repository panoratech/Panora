-- ************************************** webhooks_reponses

CREATE TABLE webhooks_reponses
(
 id_webhooks_reponse uuid NOT NULL,
 http_response_data  text NOT NULL,
 http_status_code    text NOT NULL,
 CONSTRAINT PK_webhooks_reponse PRIMARY KEY ( id_webhooks_reponse )
);



COMMENT ON COLUMN webhooks_reponses.http_status_code IS 'anything that is not 2xx is failed, and leads to retry';


-- ************************************** webhooks_payloads

CREATE TABLE webhooks_payloads
(
 id_webhooks_payload uuid NOT NULL,
 data                json NOT NULL,
 CONSTRAINT PK_webhooks_payload PRIMARY KEY ( id_webhooks_payload )
);








-- ************************************** webhook_endpoints

CREATE TABLE webhook_endpoints
(
 id_webhook_endpoint  uuid NOT NULL,
 endpoint_description text NULL,
 url                  text NOT NULL,
 secret               text NOT NULL,
 active               boolean NOT NULL,
 created_at           timestamp NOT NULL,
 "scope"              text[] NULL,
 id_project           uuid NOT NULL,
 last_update          timestamp NULL,
 CONSTRAINT PK_webhook_endpoint PRIMARY KEY ( id_webhook_endpoint )
);



COMMENT ON COLUMN webhook_endpoints.endpoint_description IS 'An optional description of what the webhook is used for';
COMMENT ON COLUMN webhook_endpoints.secret IS 'a shared secret for secure communication';
COMMENT ON COLUMN webhook_endpoints.active IS 'a flag indicating whether the webhook is active or not';
COMMENT ON COLUMN webhook_endpoints."scope" IS 'stringified array with events,';





-- ************************************** users

CREATE TABLE users
(
 id_user                 uuid NOT NULL,
 identification_strategy text NOT NULL,
 email                   text NULL,
 password_hash           text NULL,
 first_name              text NOT NULL,
 last_name               text NOT NULL,
 id_stytch               text NULL,
 created_at              timestamp NOT NULL DEFAULT NOW(),
 modified_at             timestamp NOT NULL DEFAULT NOW(),
 CONSTRAINT PK_users PRIMARY KEY ( id_user ),
 CONSTRAINT force_stytch_id_unique UNIQUE ( id_stytch )
);



COMMENT ON COLUMN users.identification_strategy IS 'can be:

PANORA_SELF_HOSTED
STYTCH_B2B
STYTCH_B2C';
COMMENT ON COLUMN users.created_at IS 'DEFAULT NOW() to automatically insert a value if nothing supplied';

COMMENT ON CONSTRAINT force_stytch_id_unique ON users IS 'force unique on stytch id';





-- ************************************** tcg_users

CREATE TABLE tcg_users
(
 id_tcg_user     uuid NOT NULL,
 name            text NULL,
 email_address   text NULL,
 remote_id       text NULL,
 remote_platform text NULL,
 teams           text[] NULL,
 created_at      timestamp NULL,
 modified_at     timestamp NULL,
 id_linked_user  uuid NULL,
 CONSTRAINT PK_tcg_users PRIMARY KEY ( id_tcg_user )
);

COMMENT ON TABLE tcg_users IS 'The User object is used to represent an employee within a company.';

COMMENT ON COLUMN tcg_users.teams IS 'array of id_tcg_team. Teams the support agent belongs to.';





-- ************************************** tcg_teams

CREATE TABLE tcg_teams
(
 id_tcg_team     uuid NOT NULL,
 remote_id       text NULL,
 remote_platform text NULL,
 name            text NULL,
 description     text NULL,
 created_at      timestamp NOT NULL,
 modified_at     timestamp NOT NULL,
 id_linked_user  uuid NULL,
 CONSTRAINT PK_tcg_teams PRIMARY KEY ( id_tcg_team )
);








-- ************************************** tcg_collections

CREATE TABLE tcg_collections
(
 id_tcg_collection uuid NOT NULL,
 name              text NULL,
 description       text NULL,
 remote_id         text NULL,
 remote_platform   text NULL,
 collection_type   text NULL,
 parent_collection uuid NULL,
 created_at        timestamp NOT NULL,
 modified_at       timestamp NOT NULL,
 id_linked_user    uuid NOT NULL,
 CONSTRAINT PK_tcg_collections PRIMARY KEY ( id_tcg_collection )
);








-- ************************************** tcg_accounts

CREATE TABLE tcg_accounts
(
 id_tcg_account  uuid NOT NULL,
 remote_id       text NULL,
 name            text NULL,
 domains         text[] NULL,
 remote_platform text NULL,
 created_at      timestamp NOT NULL,
 modified_at     timestamp NOT NULL,
 id_linked_user  uuid NULL,
 CONSTRAINT PK_tcg_account PRIMARY KEY ( id_tcg_account )
);



COMMENT ON COLUMN tcg_accounts.name IS 'company or customer name';





-- ************************************** remote_data

CREATE TABLE remote_data
(
 id_remote_data     uuid NOT NULL,
 ressource_owner_id uuid NULL,
 "format"           text NULL,
 data               text NULL,
 created_at         timestamp NULL,
 CONSTRAINT PK_remote_data PRIMARY KEY ( id_remote_data ),
 CONSTRAINT Force_Unique_ressourceOwnerId UNIQUE ( ressource_owner_id )
);



COMMENT ON COLUMN remote_data.ressource_owner_id IS 'uuid of the unified object that owns this remote data. UUID of the contact, or deal , etc...';
COMMENT ON COLUMN remote_data."format" IS 'can be json, xml';





-- ************************************** entity

CREATE TABLE entity
(
 id_entity          uuid NOT NULL,
 ressource_owner_id uuid NOT NULL,
 CONSTRAINT PK_entity PRIMARY KEY ( id_entity )
);



COMMENT ON COLUMN entity.ressource_owner_id IS 'uuid of the ressource owner - can be a a crm_contact, a crm_deal, etc...';





-- ************************************** cs_values

CREATE TABLE cs_values
(
 id_cs_value     uuid NOT NULL,
 value           text NOT NULL,
 id_cs_attribute uuid NOT NULL,
 CONSTRAINT PK_ct_values PRIMARY KEY ( id_cs_value )
);








-- ************************************** cs_entities

CREATE TABLE cs_entities
(
 id_cs_entity           uuid NOT NULL,
 id_connection_strategy uuid NOT NULL,
 CONSTRAINT PK_ct_entities PRIMARY KEY ( id_cs_entity )
);








-- ************************************** cs_attributes

CREATE TABLE cs_attributes
(
 id_cs_attribute uuid NOT NULL,
 attribute_slug  text NOT NULL,
 data_type       text NOT NULL,
 id_cs_entity    uuid NOT NULL,
 CONSTRAINT PK_ct_attributes PRIMARY KEY ( id_cs_attribute )
);








-- ************************************** crm_users

CREATE TABLE crm_users
(
 id_crm_user     uuid NOT NULL,
 name            text NULL,
 email           text NULL,
 created_at      timestamp NOT NULL,
 modified_at     timestamp NOT NULL,
 id_linked_user  uuid NULL,
 remote_id       text NULL,
 remote_platform text NULL,
 CONSTRAINT PK_crm_users PRIMARY KEY ( id_crm_user )
);








-- ************************************** crm_deals_stages

CREATE TABLE crm_deals_stages
(
 id_crm_deals_stage uuid NOT NULL,
 stage_name         text NULL,
 created_at         timestamp NOT NULL,
 modified_at        timestamp NOT NULL,
 id_linked_user     uuid NULL,
 remote_id          text NULL,
 remote_platform    text NULL,
 CONSTRAINT PK_crm_deal_stages PRIMARY KEY ( id_crm_deals_stage )
);








-- ************************************** connector_sets

CREATE TABLE connector_sets
(
 id_connector_set uuid NOT NULL,
 crm_hubspot      boolean NOT NULL,
 crm_freshsales   boolean NOT NULL,
 crm_zoho         boolean NOT NULL,
 crm_attio        boolean NOT NULL,
 crm_pipedrive    boolean NOT NULL,
 tcg_zendesk      boolean NOT NULL,
 tcg_jira         boolean NOT NULL,
 tcg_gorgias      boolean NOT NULL,
 tcg_gitlab       boolean NOT NULL,
 tcg_front        boolean NOT NULL,
 CONSTRAINT PK_project_connector PRIMARY KEY ( id_connector_set )
);








-- ************************************** connection_strategies

CREATE TABLE connection_strategies
(
 id_connection_strategy uuid NOT NULL,
 status                 boolean NOT NULL,
 type                   text NOT NULL,
 id_project             uuid NULL,
 CONSTRAINT PK_connection_strategies PRIMARY KEY ( id_connection_strategy )
);



COMMENT ON COLUMN connection_strategies.status IS 'if the connection strategy should overwrite default strategy (from env)';
COMMENT ON COLUMN connection_strategies.type IS 'OAUTH2, API_KEY, PIPEDRIVE_CLOUD_OAUTH, PIPEDRIVE_CLOUD_API, HUBSPOT_CLOUD';





-- ************************************** tcg_tickets

CREATE TABLE tcg_tickets
(
 id_tcg_ticket   uuid NOT NULL,
 name            text NULL,
 status          text NULL,
 description     text NULL,
 due_date        timestamp NULL,
 ticket_type     text NULL,
 parent_ticket   uuid NULL,
 tags            text[] NULL,
 collections     text[] NULL,
 completed_at    timestamp NULL,
 priority        text NULL,
 created_at      timestamp NOT NULL,
 modified_at     timestamp NOT NULL,
 assigned_to     text[] NULL,
 remote_id       text NULL,
 remote_platform text NULL,
 creator_type    text NULL,
 id_tcg_user     uuid NULL,
 id_linked_user  uuid NOT NULL,
 CONSTRAINT PK_tcg_tickets PRIMARY KEY ( id_tcg_ticket )
);

CREATE INDEX FK_tcg_ticket_tcg_user ON tcg_tickets
(
 id_tcg_user
);



COMMENT ON COLUMN tcg_tickets.name IS 'Name of the ticket. Usually very short.';
COMMENT ON COLUMN tcg_tickets.status IS 'OPEN, CLOSED, IN_PROGRESS, ON_HOLD';
COMMENT ON COLUMN tcg_tickets.tags IS 'array of tags uuid';
COMMENT ON COLUMN tcg_tickets.assigned_to IS 'Employees assigned to this ticket.

It is a stringified array containing tcg_users';
COMMENT ON COLUMN tcg_tickets.id_tcg_user IS 'id of the user who created the ticket';





-- ************************************** tcg_contacts

CREATE TABLE tcg_contacts
(
 id_tcg_contact  uuid NOT NULL,
 name            text NULL,
 email_address   text NULL,
 phone_number    text NULL,
 details         text NULL,
 remote_id       text NULL,
 remote_platform text NULL,
 created_at      timestamp NULL,
 modified_at     timestamp NULL,
 id_tcg_account  uuid NULL,
 id_linked_user  uuid NULL,
 CONSTRAINT PK_tcg_contact PRIMARY KEY ( id_tcg_contact ),
 CONSTRAINT FK_49 FOREIGN KEY ( id_tcg_account ) REFERENCES tcg_accounts ( id_tcg_account )
);

CREATE INDEX FK_tcg_contact_tcg_account_id ON tcg_contacts
(
 id_tcg_account
);








-- ************************************** projects

CREATE TABLE projects
(
 id_project            uuid NOT NULL,
 name                  text NOT NULL,
 sync_mode             text NOT NULL,
 pull_frequency        bigint NULL,
 redirect_url          text NULL,
 id_user               uuid NOT NULL,
 id_project_connectors uuid NOT NULL,
 CONSTRAINT PK_projects PRIMARY KEY ( id_project ),
 CONSTRAINT FK_47_2 FOREIGN KEY ( id_project_connectors ) REFERENCES connector_sets ( id_connector_set ),
 CONSTRAINT FK_46_1 FOREIGN KEY ( id_user ) REFERENCES users ( id_user )
);



COMMENT ON COLUMN projects.sync_mode IS 'can be realtime or periodic_pull';
COMMENT ON COLUMN projects.pull_frequency IS 'frequency in seconds for pulls

ex 3600 for one hour';





-- ************************************** crm_contacts

CREATE TABLE crm_contacts
(
 id_crm_contact  uuid NOT NULL,
 first_name      text NOT NULL,
 last_name       text NOT NULL,
 created_at      timestamp NOT NULL,
 modified_at     timestamp NOT NULL,
 remote_id       text NOT NULL,
 remote_platform text NOT NULL,
 id_crm_user     uuid NULL,
 id_linked_user  uuid NULL,
 CONSTRAINT PK_crm_contacts PRIMARY KEY ( id_crm_contact ),
 CONSTRAINT FK_23 FOREIGN KEY ( id_crm_user ) REFERENCES crm_users ( id_crm_user )
);

CREATE INDEX FK_crm_contact_userID ON crm_contacts
(
 id_crm_user
);



COMMENT ON COLUMN crm_contacts.remote_platform IS 'can be hubspot, zendesk, zoho...';





-- ************************************** crm_companies

CREATE TABLE crm_companies
(
 id_crm_company      uuid NOT NULL,
 name                text NULL,
 industry            text NULL,
 number_of_employees bigint NULL,
 created_at          timestamp NOT NULL,
 modified_at         timestamp NOT NULL,
 remote_id           text NULL,
 remote_platform     text NULL,
 id_crm_user         uuid NULL,
 id_linked_user      uuid NULL,
 CONSTRAINT PK_crm_companies PRIMARY KEY ( id_crm_company ),
 CONSTRAINT FK_24 FOREIGN KEY ( id_crm_user ) REFERENCES crm_users ( id_crm_user )
);

CREATE INDEX FK_crm_company_crm_userID ON crm_companies
(
 id_crm_user
);








-- ************************************** attribute

CREATE TABLE attribute
(
 id_attribute         uuid NOT NULL,
 status               text NOT NULL,
 ressource_owner_type text NOT NULL,
 slug                 text NOT NULL,
 description          text NOT NULL,
 data_type            text NOT NULL,
 remote_id            text NOT NULL,
 "source"             text NOT NULL,
 id_entity            uuid NULL,
 id_project           uuid NOT NULL,
 "scope"              text NOT NULL,
 id_consumer          uuid NULL,
 CONSTRAINT PK_attribute PRIMARY KEY ( id_attribute ),
 CONSTRAINT FK_32 FOREIGN KEY ( id_entity ) REFERENCES entity ( id_entity )
);

CREATE INDEX FK_attribute_entityID ON attribute
(
 id_entity
);



COMMENT ON COLUMN attribute.status IS 'NEED_REMOTE_ID
LINKED';
COMMENT ON COLUMN attribute.ressource_owner_type IS 'ressource_owner type:

crm_deal, crm_contact';
COMMENT ON COLUMN attribute.slug IS 'Custom field name,ex : SIZE, AGE, MIDDLE_NAME, HAS_A_CAR  ...';
COMMENT ON COLUMN attribute.description IS 'description of this custom field';
COMMENT ON COLUMN attribute.data_type IS 'INTEGER, STRING, BOOLEAN...';
COMMENT ON COLUMN attribute."source" IS 'can be hubspot, zendesk, etc';
COMMENT ON COLUMN attribute."scope" IS 'defines at which scope the ressource will be available

can be "ORGANIZATION", or "LINKED_USER"';
COMMENT ON COLUMN attribute.id_consumer IS 'Can be an organization iD , or linked user ID 

id_linked_user';





-- ************************************** value

CREATE TABLE value
(
 id_value     uuid NOT NULL,
 data         text NOT NULL,
 id_entity    uuid NOT NULL,
 id_attribute uuid NOT NULL,
 CONSTRAINT PK_value PRIMARY KEY ( id_value ),
 CONSTRAINT FK_33 FOREIGN KEY ( id_attribute ) REFERENCES attribute ( id_attribute ),
 CONSTRAINT FK_34 FOREIGN KEY ( id_entity ) REFERENCES entity ( id_entity )
);

CREATE INDEX FK_value_attributeID ON value
(
 id_attribute
);

CREATE INDEX FK_value_entityID ON value
(
 id_entity
);



COMMENT ON COLUMN value.data IS 'can be: true, false, 0, 1 , 2 3 , 4 , hello, world ...';





-- ************************************** tcg_tags

CREATE TABLE tcg_tags
(
 id_tcg_tag      uuid NOT NULL,
 name            text NULL,
 remote_id       text NULL,
 remote_platform text NULL,
 created_at      timestamp NOT NULL,
 modified_at     timestamp NOT NULL,
 id_tcg_ticket   uuid NULL,
 id_linked_user  uuid NULL,
 CONSTRAINT PK_tcg_tags PRIMARY KEY ( id_tcg_tag ),
 CONSTRAINT FK_48 FOREIGN KEY ( id_tcg_ticket ) REFERENCES tcg_tickets ( id_tcg_ticket )
);

CREATE INDEX FK_tcg_tag_tcg_ticketID ON tcg_tags
(
 id_tcg_ticket
);








-- ************************************** tcg_comments

CREATE TABLE tcg_comments
(
 id_tcg_comment    uuid NOT NULL,
 body              text NULL,
 html_body         text NULL,
 is_private        boolean NULL,
 remote_id         text NULL,
 remote_platform   text NULL,
 created_at        timestamp NULL,
 modified_at       timestamp NULL,
 creator_type      text NULL,
 id_tcg_attachment text[] NULL,
 id_tcg_ticket     uuid NULL,
 id_tcg_contact    uuid NULL,
 id_tcg_user       uuid NULL,
 id_linked_user    uuid NULL,
 CONSTRAINT PK_tcg_comments PRIMARY KEY ( id_tcg_comment ),
 CONSTRAINT FK_41 FOREIGN KEY ( id_tcg_contact ) REFERENCES tcg_contacts ( id_tcg_contact ),
 CONSTRAINT FK_40_1 FOREIGN KEY ( id_tcg_ticket ) REFERENCES tcg_tickets ( id_tcg_ticket ),
 CONSTRAINT FK_42 FOREIGN KEY ( id_tcg_user ) REFERENCES tcg_users ( id_tcg_user )
);

CREATE INDEX FK_tcg_comment_tcg_contact ON tcg_comments
(
 id_tcg_contact
);

CREATE INDEX FK_tcg_comment_tcg_ticket ON tcg_comments
(
 id_tcg_ticket
);

CREATE INDEX FK_tcg_comment_tcg_userID ON tcg_comments
(
 id_tcg_user
);

COMMENT ON TABLE tcg_comments IS 'The tcg_comment object represents a comment on a ticket.';

COMMENT ON COLUMN tcg_comments.creator_type IS 'Who created the comment. Can be a a id_tcg_contact or a id_tcg_user';





-- ************************************** linked_users

CREATE TABLE linked_users
(
 id_linked_user        uuid NOT NULL,
 linked_user_origin_id text NOT NULL,
 alias                 text NOT NULL,
 id_project            uuid NOT NULL,
 CONSTRAINT key_id_linked_users PRIMARY KEY ( id_linked_user ),
 CONSTRAINT FK_10 FOREIGN KEY ( id_project ) REFERENCES projects ( id_project )
);

CREATE INDEX FK_proectID_linked_users ON linked_users
(
 id_project
);



COMMENT ON COLUMN linked_users.linked_user_origin_id IS 'id of the customer, in our customers own systems';
COMMENT ON COLUMN linked_users.alias IS 'human-readable alias, for UI (ex ACME company)';





-- ************************************** crm_phone_numbers

CREATE TABLE crm_phone_numbers
(
 id_crm_phone_number uuid NOT NULL,
 phone_number        text NOT NULL,
 phone_type          text NOT NULL,
 owner_type          text NOT NULL,
 created_at          timestamp NOT NULL,
 modified_at         timestamp NOT NULL,
 id_crm_company      uuid NULL,
 id_crm_contact      uuid NULL,
 CONSTRAINT PK_crm_contacts_phone_numbers PRIMARY KEY ( id_crm_phone_number ),
 CONSTRAINT FK_phonenumber_crm_contactID FOREIGN KEY ( id_crm_contact ) REFERENCES crm_contacts ( id_crm_contact ),
 CONSTRAINT FK_17 FOREIGN KEY ( id_crm_company ) REFERENCES crm_companies ( id_crm_company )
);

CREATE INDEX crm_contactID_crm_contact_phone_number ON crm_phone_numbers
(
 id_crm_contact
);

CREATE INDEX FK_phone_number_companyID ON crm_phone_numbers
(
 id_crm_company
);



COMMENT ON COLUMN crm_phone_numbers.owner_type IS 'can be ''COMPANY'' or ''CONTACT'' - helps locate who to link the phone number to.';





-- ************************************** crm_engagements

CREATE TABLE crm_engagements
(
 id_crm_engagement uuid NOT NULL,
 content           text NULL,
 type              text NULL,
 direction         text NULL,
 subject           text NULL,
 start_at          timestamp NULL,
 end_time          timestamp NULL,
 created_at        timestamp NULL,
 modified_at       timestamp NULL,
 remote_id         text NULL,
 id_linked_user    uuid NULL,
 remote_platform   text NULL,
 id_crm_company    uuid NULL,
 id_crm_user       uuid NULL,
 CONSTRAINT PK_crm_engagement PRIMARY KEY ( id_crm_engagement ),
 CONSTRAINT FK_crm_engagement_crm_user FOREIGN KEY ( id_crm_user ) REFERENCES crm_users ( id_crm_user ),
 CONSTRAINT FK_29 FOREIGN KEY ( id_crm_company ) REFERENCES crm_companies ( id_crm_company )
);

CREATE INDEX FK_crm_engagement_crm_user_ID ON crm_engagements
(
 id_crm_user
);

CREATE INDEX FK_crm_engagement_crmCompanyID ON crm_engagements
(
 id_crm_company
);



COMMENT ON COLUMN crm_engagements.type IS 'can be (but not restricted to)

MEETING, CALL, EMAIL';





-- ************************************** crm_email_addresses

CREATE TABLE crm_email_addresses
(
 id_crm_email       uuid NOT NULL,
 email_address      text NOT NULL,
 email_address_type text NOT NULL,
 owner_type         text NOT NULL,
 created_at         timestamp NOT NULL,
 modified_at        timestamp NOT NULL,
 id_crm_company     uuid NULL,
 id_crm_contact     uuid NULL,
 CONSTRAINT PK_crm_contact_email_addresses PRIMARY KEY ( id_crm_email ),
 CONSTRAINT FK_3 FOREIGN KEY ( id_crm_contact ) REFERENCES crm_contacts ( id_crm_contact ),
 CONSTRAINT FK_16 FOREIGN KEY ( id_crm_company ) REFERENCES crm_companies ( id_crm_company )
);

CREATE INDEX crm_contactID_crm_contact_email_address ON crm_email_addresses
(
 id_crm_contact
);

CREATE INDEX FK_contact_email_adress_companyID ON crm_email_addresses
(
 id_crm_company
);



COMMENT ON COLUMN crm_email_addresses.owner_type IS 'can be ''COMPANY'' or ''CONTACT'' - helps locate who to link the email belongs to.';





-- ************************************** crm_deals

CREATE TABLE crm_deals
(
 id_crm_deal        uuid NOT NULL,
 name               text NOT NULL,
 description        text NOT NULL,
 amount             bigint NOT NULL,
 created_at         timestamp NOT NULL,
 modified_at        timestamp NOT NULL,
 remote_id          text NULL,
 remote_platform    text NULL,
 id_crm_user        uuid NULL,
 id_crm_deals_stage uuid NULL,
 id_linked_user     uuid NULL,
 id_crm_company     uuid NULL,
 CONSTRAINT PK_crm_deal PRIMARY KEY ( id_crm_deal ),
 CONSTRAINT FK_22 FOREIGN KEY ( id_crm_user ) REFERENCES crm_users ( id_crm_user ),
 CONSTRAINT FK_21 FOREIGN KEY ( id_crm_deals_stage ) REFERENCES crm_deals_stages ( id_crm_deals_stage ),
 CONSTRAINT FK_47_1 FOREIGN KEY ( id_crm_company ) REFERENCES crm_companies ( id_crm_company )
);

CREATE INDEX crm_deal_crm_userID ON crm_deals
(
 id_crm_user
);

CREATE INDEX crm_deal_deal_stageID ON crm_deals
(
 id_crm_deals_stage
);

CREATE INDEX FK_crm_deal_crmCompanyID ON crm_deals
(
 id_crm_company
);



COMMENT ON COLUMN crm_deals.amount IS 'AMOUNT IN CENTS';





-- ************************************** crm_addresses

CREATE TABLE crm_addresses
(
 id_crm_address uuid NOT NULL,
 street_1       text NULL,
 street_2       text NULL,
 city           text NULL,
 "state"        text NULL,
 postal_code    text NULL,
 country        text NULL,
 address_type   text NULL,
 created_at     timestamp NOT NULL,
 modified_at    timestamp NOT NULL,
 owner_type     text NOT NULL,
 id_crm_company uuid NULL,
 id_crm_contact uuid NULL,
 CONSTRAINT PK_crm_addresses PRIMARY KEY ( id_crm_address ),
 CONSTRAINT FK_14 FOREIGN KEY ( id_crm_contact ) REFERENCES crm_contacts ( id_crm_contact ),
 CONSTRAINT FK_15 FOREIGN KEY ( id_crm_company ) REFERENCES crm_companies ( id_crm_company )
);

CREATE INDEX FK_crm_addresses_to_crm_contacts ON crm_addresses
(
 id_crm_contact
);

CREATE INDEX FK_crm_adresses_to_crm_companies ON crm_addresses
(
 id_crm_company
);



COMMENT ON COLUMN crm_addresses.owner_type IS 'Can be a company or a contact''s address

''company''
''contact''';





-- ************************************** api_keys

CREATE TABLE api_keys
(
 id_api_key   uuid NOT NULL,
 api_key_hash text NOT NULL,
 name         text NULL,
 id_project   uuid NOT NULL,
 id_user      uuid NOT NULL,
 CONSTRAINT id_ PRIMARY KEY ( id_api_key ),
 CONSTRAINT unique_api_keys UNIQUE ( api_key_hash ),
 CONSTRAINT FK_8 FOREIGN KEY ( id_user ) REFERENCES users ( id_user ),
 CONSTRAINT FK_7 FOREIGN KEY ( id_project ) REFERENCES projects ( id_project )
);

CREATE INDEX FK_2 ON api_keys
(
 id_user
);

CREATE INDEX FK_api_keys_projects ON api_keys
(
 id_project
);








-- ************************************** tcg_attachments

CREATE TABLE tcg_attachments
(
 id_tcg_attachment uuid NOT NULL,
 remote_id         text NULL,
 remote_platform   text NULL,
 file_name         text NULL,
 file_url          text NULL,
 uploader          uuid NOT NULL,
 created_at        timestamp NOT NULL,
 modified_at       timestamp NOT NULL,
 id_linked_user    uuid NULL,
 id_tcg_ticket     uuid NULL,
 id_tcg_comment    uuid NULL,
 CONSTRAINT PK_tcg_attachments PRIMARY KEY ( id_tcg_attachment ),
 CONSTRAINT FK_51 FOREIGN KEY ( id_tcg_comment ) REFERENCES tcg_comments ( id_tcg_comment ),
 CONSTRAINT FK_50 FOREIGN KEY ( id_tcg_ticket ) REFERENCES tcg_tickets ( id_tcg_ticket )
);

CREATE INDEX FK_tcg_attachment_tcg_commentID ON tcg_attachments
(
 id_tcg_comment
);

CREATE INDEX FK_tcg_attachment_tcg_ticketID ON tcg_attachments
(
 id_tcg_ticket
);



COMMENT ON COLUMN tcg_attachments.remote_id IS 'If empty, means the file is stored is panora but not in the destination platform (often because the platform doesn''t support )';
COMMENT ON COLUMN tcg_attachments.uploader IS 'id_tcg_user  who uploaded the file';
COMMENT ON COLUMN tcg_attachments.id_tcg_ticket IS 'For cases where the ticketing platform does not specify which comment the attachment belongs to.';





-- ************************************** invite_links

CREATE TABLE invite_links
(
 id_invite_link uuid NOT NULL,
 status         text NOT NULL,
 email          text NULL,
 id_linked_user uuid NOT NULL,
 CONSTRAINT PK_invite_links PRIMARY KEY ( id_invite_link ),
 CONSTRAINT FK_37 FOREIGN KEY ( id_linked_user ) REFERENCES linked_users ( id_linked_user )
);

CREATE INDEX FK_invite_link_linkedUserID ON invite_links
(
 id_linked_user
);








-- ************************************** events

CREATE TABLE events
(
 id_event       uuid NOT NULL,
 status         text NOT NULL,
 type           text NOT NULL,
 direction      text NOT NULL,
 "timestamp"    timestamp NOT NULL DEFAULT NOW(),
 method         text NOT NULL,
 url            text NOT NULL,
 provider       text NOT NULL,
 id_linked_user uuid NOT NULL,
 CONSTRAINT PK_jobs PRIMARY KEY ( id_event ),
 CONSTRAINT FK_12 FOREIGN KEY ( id_linked_user ) REFERENCES linked_users ( id_linked_user )
);

CREATE INDEX FK_linkeduserID_projectID ON events
(
 id_linked_user
);



COMMENT ON COLUMN events.status IS 'pending,, retry_scheduled, failed, success';
COMMENT ON COLUMN events.type IS 'example crm_contact.created crm_contact.deleted';





-- ************************************** crm_tasks

CREATE TABLE crm_tasks
(
 id_crm_task     uuid NOT NULL,
 subject         text NULL,
 content         text NULL,
 status          text NULL,
 due_date        timestamp NULL,
 finished_date   timestamp NULL,
 created_at      timestamp NOT NULL,
 modified_at     timestamp NOT NULL,
 id_crm_user     uuid NULL,
 id_crm_company  uuid NULL,
 id_crm_deal     uuid NULL,
 id_linked_user  uuid NULL,
 remote_id       text NULL,
 remote_platform text NULL,
 CONSTRAINT PK_crm_task PRIMARY KEY ( id_crm_task ),
 CONSTRAINT FK_26 FOREIGN KEY ( id_crm_company ) REFERENCES crm_companies ( id_crm_company ),
 CONSTRAINT FK_25 FOREIGN KEY ( id_crm_user ) REFERENCES crm_users ( id_crm_user ),
 CONSTRAINT FK_27 FOREIGN KEY ( id_crm_deal ) REFERENCES crm_deals ( id_crm_deal )
);

CREATE INDEX FK_crm_task_companyID ON crm_tasks
(
 id_crm_company
);

CREATE INDEX FK_crm_task_userID ON crm_tasks
(
 id_crm_user
);

CREATE INDEX FK_crmtask_dealID ON crm_tasks
(
 id_crm_deal
);








-- ************************************** crm_notes

CREATE TABLE crm_notes
(
 id_crm_note     uuid NOT NULL,
 content         text NOT NULL,
 created_at      timestamp NOT NULL,
 modified_at     timestamp NOT NULL,
 id_crm_company  uuid NULL,
 id_crm_contact  uuid NULL,
 id_crm_deal     uuid NULL,
 id_linked_user  uuid NULL,
 remote_id       text NULL,
 remote_platform text NULL,
 id_crm_user     uuid NULL,
 CONSTRAINT PK_crm_notes PRIMARY KEY ( id_crm_note ),
 CONSTRAINT FK_19 FOREIGN KEY ( id_crm_contact ) REFERENCES crm_contacts ( id_crm_contact ),
 CONSTRAINT FK_18 FOREIGN KEY ( id_crm_company ) REFERENCES crm_companies ( id_crm_company ),
 CONSTRAINT FK_20 FOREIGN KEY ( id_crm_deal ) REFERENCES crm_deals ( id_crm_deal )
);

CREATE INDEX FK_crm_note_crm_companyID ON crm_notes
(
 id_crm_contact
);

CREATE INDEX FK_crm_note_crm_contactID ON crm_notes
(
 id_crm_company
);

CREATE INDEX FK_crm_note_crm_userID ON crm_notes
(
 id_crm_user
);

CREATE INDEX FK_crm_notes_crm_dealID ON crm_notes
(
 id_crm_deal
);








-- ************************************** crm_engagement_contacts

CREATE TABLE crm_engagement_contacts
(
 id_crm_engagement_contact uuid NOT NULL,
 id_crm_contact            uuid NULL,
 id_crm_engagement         uuid NOT NULL,
 CONSTRAINT PK_crm_engagement_contact PRIMARY KEY ( id_crm_engagement_contact ),
 CONSTRAINT FK_30 FOREIGN KEY ( id_crm_engagement ) REFERENCES crm_engagements ( id_crm_engagement )
);

CREATE INDEX FK_crm_engagement_contacts_crmEngagementID ON crm_engagement_contacts
(
 id_crm_engagement
);

CREATE INDEX FK_engagement_contact_crmContactID ON crm_engagement_contacts
(
 id_crm_contact
);








-- ************************************** connections

CREATE TABLE connections
(
 id_connection        uuid NOT NULL,
 status               text NOT NULL,
 provider_slug        text NOT NULL,
 vertical             text NOT NULL,
 account_url          text NULL,
 token_type           text NOT NULL,
 access_token         text NULL,
 refresh_token        text NULL,
 expiration_timestamp timestamp NULL,
 created_at           timestamp NOT NULL,
 connection_token     text NULL,
 id_project           uuid NOT NULL,
 id_linked_user       uuid NOT NULL,
 CONSTRAINT PK_connections PRIMARY KEY ( id_connection ),
 CONSTRAINT Index_3 UNIQUE ( access_token, refresh_token ),
 CONSTRAINT FK_9 FOREIGN KEY ( id_project ) REFERENCES projects ( id_project ),
 CONSTRAINT FK_11 FOREIGN KEY ( id_linked_user ) REFERENCES linked_users ( id_linked_user )
);

CREATE INDEX FK_1 ON connections
(
 id_project
);

CREATE INDEX FK_connections_to_LinkedUsersID ON connections
(
 id_linked_user
);



COMMENT ON COLUMN connections.status IS 'ONLY FOR INVITE LINK';
COMMENT ON COLUMN connections.token_type IS 'The type of the token, such as "Bearer," "JWT," or any other supported type.';
COMMENT ON COLUMN connections.connection_token IS 'Connection token users will put in their header to identify which service / linked_User they make request for';





-- ************************************** webhook_delivery_attempts

CREATE TABLE webhook_delivery_attempts
(
 id_webhook_delivery_attempt uuid NOT NULL,
 "timestamp"                 timestamp NOT NULL,
 status                      text NOT NULL,
 next_retry                  timestamp NULL,
 attempt_count               bigint NOT NULL,
 id_webhooks_payload         uuid NULL,
 id_webhook_endpoint         uuid NULL,
 id_event                    uuid NULL,
 id_webhooks_reponse         uuid NULL,
 CONSTRAINT PK_webhook_event PRIMARY KEY ( id_webhook_delivery_attempt ),
 CONSTRAINT FK_38_1 FOREIGN KEY ( id_webhooks_payload ) REFERENCES webhooks_payloads ( id_webhooks_payload ),
 CONSTRAINT FK_38_2 FOREIGN KEY ( id_webhook_endpoint ) REFERENCES webhook_endpoints ( id_webhook_endpoint ),
 CONSTRAINT FK_39 FOREIGN KEY ( id_event ) REFERENCES events ( id_event ),
 CONSTRAINT FK_40 FOREIGN KEY ( id_webhooks_reponse ) REFERENCES webhooks_reponses ( id_webhooks_reponse )
);

CREATE INDEX FK_we_payload_webhookID ON webhook_delivery_attempts
(
 id_webhooks_payload
);

CREATE INDEX FK_we_webhookEndpointID ON webhook_delivery_attempts
(
 id_webhook_endpoint
);

CREATE INDEX FK_webhook_delivery_attempt_eventID ON webhook_delivery_attempts
(
 id_event
);

CREATE INDEX FK_webhook_delivery_attempt_webhook_responseID ON webhook_delivery_attempts
(
 id_webhooks_reponse
);



COMMENT ON COLUMN webhook_delivery_attempts."timestamp" IS 'timestamp of the delivery attempt';
COMMENT ON COLUMN webhook_delivery_attempts.status IS 'status of the delivery attempt

can be success, retry, failure';
COMMENT ON COLUMN webhook_delivery_attempts.next_retry IS 'if null no next retry';
COMMENT ON COLUMN webhook_delivery_attempts.attempt_count IS 'Number of attempt

can be 0 1 2 3 4 5 6';





-- ************************************** jobs_status_history

CREATE TABLE jobs_status_history
(
 id_jobs_status_history uuid NOT NULL,
 "timestamp"            timestamp NOT NULL DEFAULT NOW(),
 previous_status        text NOT NULL,
 new_status             text NOT NULL,
 id_event               uuid NOT NULL,
 CONSTRAINT PK_jobs_status_history PRIMARY KEY ( id_jobs_status_history ),
 CONSTRAINT FK_4 FOREIGN KEY ( id_event ) REFERENCES events ( id_event )
);

CREATE INDEX id_job_jobs_status_history ON jobs_status_history
(
 id_event
);



COMMENT ON COLUMN jobs_status_history.previous_status IS 'void when first initialization';
COMMENT ON COLUMN jobs_status_history.new_status IS 'pending, retry_scheduled, failed, success';




