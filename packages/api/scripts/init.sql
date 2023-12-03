-- ************************************** organizations

CREATE TABLE organizations
(
 id_organization    uuid NOT NULL,
 name               text NOT NULL,
 stripe_customer_id text NOT NULL,
 CONSTRAINT PK_organizations PRIMARY KEY ( id_organization )
);








-- ************************************** entity

CREATE TABLE entity
(
 id_entity          uuid NOT NULL,
 ressource_owner_id text NOT NULL,
 CONSTRAINT PK_entity PRIMARY KEY ( id_entity )
);



COMMENT ON COLUMN entity.ressource_owner_id IS 'uuid of the ressource owner - can be a a crm_contact, a crm_deal, etc...';





-- ************************************** crm_users

CREATE TABLE crm_users
(
 id_crm_user uuid NOT NULL,
 name        text NULL,
 email       text NULL,
 created_at  timestamp NOT NULL,
 modified_at timestamp NOT NULL,
 CONSTRAINT PK_crm_users PRIMARY KEY ( id_crm_user )
);








-- ************************************** crm_engagement_types

CREATE TABLE crm_engagement_types
(
 id_crm_engagement_type uuid NOT NULL,
 name                   text NULL,
 engagement_type        text NULL,
 remote_id              text NULL,
 created_at             timestamp NOT NULL,
 modified_at            timestamp NOT NULL,
 CONSTRAINT PK_crm_engagement_type PRIMARY KEY ( id_crm_engagement_type )
);



COMMENT ON COLUMN crm_engagement_types.name IS 'example: first call, or follow-up call';
COMMENT ON COLUMN crm_engagement_types.engagement_type IS 'can be (but not restricted to)

MEETING, CALL, EMAIL';





-- ************************************** crm_deals_stages

CREATE TABLE crm_deals_stages
(
 id_crm_deals_stage uuid NOT NULL,
 stage_name         text NULL,
 created_at         timestamp NOT NULL,
 modified_at        timestamp NOT NULL,
 CONSTRAINT PK_crm_deal_stages PRIMARY KEY ( id_crm_deals_stage )
);








-- ************************************** users

CREATE TABLE users
(
 id_user         uuid NOT NULL,
 email           text NOT NULL,
 password_hash   text NOT NULL,
 first_name      text NOT NULL,
 last_name       text NOT NULL,
 created_at      timestamp NOT NULL DEFAULT NOW(),
 modified_at     timestamp NOT NULL DEFAULT NOW(),
 id_organization uuid NULL,
 CONSTRAINT PK_users PRIMARY KEY ( id_user ),
 CONSTRAINT FK_5 FOREIGN KEY ( id_organization ) REFERENCES organizations ( id_organization )
);

CREATE INDEX FK_1_users ON users
(
 id_organization
);



COMMENT ON COLUMN users.created_at IS 'DEFAULT NOW() to automatically insert a value if nothing supplied';





-- ************************************** projects

CREATE TABLE projects
(
 id_project      uuid NOT NULL,
 name            text NOT NULL,
 id_organization uuid NOT NULL,
 CONSTRAINT PK_projects PRIMARY KEY ( id_project ),
 CONSTRAINT FK_6 FOREIGN KEY ( id_organization ) REFERENCES organizations ( id_organization )
);

CREATE INDEX FK_1_projects ON projects
(
 id_organization
);








-- ************************************** crm_deals

CREATE TABLE crm_deals
(
 id_crm_deal        uuid NOT NULL,
 name               text NOT NULL,
 description        text NOT NULL,
 amount             bigint NOT NULL,
 created_at         timestamp NOT NULL,
 modified_at        timestamp NOT NULL,
 id_crm_user        uuid NULL,
 id_crm_deals_stage uuid NULL,
 CONSTRAINT PK_crm_deal PRIMARY KEY ( id_crm_deal ),
 CONSTRAINT FK_22 FOREIGN KEY ( id_crm_user ) REFERENCES crm_users ( id_crm_user ),
 CONSTRAINT FK_21 FOREIGN KEY ( id_crm_deals_stage ) REFERENCES crm_deals_stages ( id_crm_deals_stage )
);

CREATE INDEX crm_deal_crm_userID ON crm_deals
(
 id_crm_user
);

CREATE INDEX crm_deal_deal_stageID ON crm_deals
(
 id_crm_deals_stage
);



COMMENT ON COLUMN crm_deals.amount IS 'AMOUNT IN CENTS';





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
 "source"               text NOT NULL,
 id_entity            uuid NOT NULL,
 "scope"                text NOT NULL,
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





-- ************************************** api_keys

CREATE TABLE api_keys
(
 id_api_key   uuid NOT NULL,
 api_key_hash text NOT NULL,
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








-- ************************************** jobs

CREATE TABLE jobs
(
 id_job         uuid NOT NULL,
 status         text NOT NULL,
 "timestamp"      timestamp NOT NULL DEFAULT NOW(),
 id_linked_user uuid NOT NULL,
 CONSTRAINT PK_jobs PRIMARY KEY ( id_job ),
 CONSTRAINT FK_12 FOREIGN KEY ( id_linked_user ) REFERENCES linked_users ( id_linked_user )
);

CREATE INDEX FK_linkeduserID_projectID ON jobs
(
 id_linked_user
);



COMMENT ON COLUMN jobs.status IS 'pending,, retry_scheduled, failed, success';





-- ************************************** connections

CREATE TABLE connections
(
 id_connection        uuid NOT NULL,
 status               text NOT NULL,
 provider_slug        text NOT NULL,
 account_url          text NULL,
 token_type           text NOT NULL,
 access_token         text NULL,
 refresh_token        text NULL,
 expiration_timestamp timestamp NULL,
 created_at           timestamp NOT NULL,
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





-- ************************************** jobs_status_history

CREATE TABLE jobs_status_history
(
 id_jobs_status_history uuid NOT NULL,
 "timestamp"              timestamp NOT NULL DEFAULT NOW(),
 previous_status        text NOT NULL,
 new_status             text NOT NULL,
 id_job                 uuid NOT NULL,
 CONSTRAINT PK_jobs_status_history PRIMARY KEY ( id_jobs_status_history ),
 CONSTRAINT FK_4 FOREIGN KEY ( id_job ) REFERENCES jobs ( id_job )
);

CREATE INDEX id_job_jobs_status_history ON jobs_status_history
(
 id_job
);



COMMENT ON COLUMN jobs_status_history.previous_status IS 'void when first initialization';
COMMENT ON COLUMN jobs_status_history.new_status IS 'pending, retry_scheduled, failed, success';





-- ************************************** crm_contacts

CREATE TABLE crm_contacts
(
 id_crm_contact uuid NOT NULL,
 first_name     text NOT NULL,
 last_name      text NOT NULL,
 created_at     timestamp NOT NULL,
 modified_at    timestamp NOT NULL,
 id_job         uuid NOT NULL,
 id_crm_user    uuid NULL,
 CONSTRAINT PK_crm_contacts PRIMARY KEY ( id_crm_contact ),
 CONSTRAINT job_id_crm_contact FOREIGN KEY ( id_job ) REFERENCES jobs ( id_job ),
 CONSTRAINT FK_23 FOREIGN KEY ( id_crm_user ) REFERENCES crm_users ( id_crm_user )
);

CREATE INDEX crm_contact_id_job ON crm_contacts
(
 id_job
);

CREATE INDEX FK_crm_contact_userID ON crm_contacts
(
 id_crm_user
);








-- ************************************** crm_companies

CREATE TABLE crm_companies
(
 id_crm_company      uuid NOT NULL,
 name                text NULL,
 industry            text NULL,
 number_of_employees bigint NULL,
 created_at          timestamp NOT NULL,
 modified_at         timestamp NOT NULL,
 id_job              uuid NOT NULL,
 id_crm_user         uuid NULL,
 CONSTRAINT PK_crm_companies PRIMARY KEY ( id_crm_company ),
 CONSTRAINT FK_24 FOREIGN KEY ( id_crm_user ) REFERENCES crm_users ( id_crm_user ),
 CONSTRAINT FK_13 FOREIGN KEY ( id_job ) REFERENCES jobs ( id_job )
);

CREATE INDEX FK_crm_company_crm_userID ON crm_companies
(
 id_crm_user
);

CREATE INDEX FK_crm_company_jobID ON crm_companies
(
 id_job
);








-- ************************************** crm_tasks

CREATE TABLE crm_tasks
(
 id_crm_task    uuid NOT NULL,
 subject        text NULL,
 content        text NULL,
 status         text NULL,
 due_date       timestamp NULL,
 finished_date  timestamp NULL,
 created_at     timestamp NOT NULL,
 modified_at    timestamp NOT NULL,
 id_crm_user    uuid NULL,
 id_crm_company uuid NULL,
 id_crm_deal    uuid NULL,
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





-- ************************************** crm_notes

CREATE TABLE crm_notes
(
 id_crm_note    uuid NOT NULL,
 content        text NOT NULL,
 created_at     timestamp NOT NULL,
 modified_at    timestamp NOT NULL,
 id_crm_company uuid NULL,
 id_crm_contact uuid NULL,
 id_crm_deal    uuid NULL,
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

CREATE INDEX FK_crm_notes_crm_dealID ON crm_notes
(
 id_crm_deal
);








-- ************************************** crm_engagements

CREATE TABLE crm_engagements
(
 id_crm_engagement      uuid NOT NULL,
 content                text NULL,
 direction              text NULL,
 subject                text NULL,
 start_at               timestamp NULL,
 end_time               timestamp NULL,
 created_at             timestamp NULL,
 modified_at            timestamp NULL,
 remote_id              text NULL,
 id_crm_engagement_type uuid NOT NULL,
 id_crm_company         uuid NULL,
 CONSTRAINT PK_crm_engagement PRIMARY KEY ( id_crm_engagement ),
 CONSTRAINT FK_29 FOREIGN KEY ( id_crm_company ) REFERENCES crm_companies ( id_crm_company ),
 CONSTRAINT FK_28 FOREIGN KEY ( id_crm_engagement_type ) REFERENCES crm_engagement_types ( id_crm_engagement_type )
);

CREATE INDEX FK_crm_engagement_crmCompanyID ON crm_engagements
(
 id_crm_company
);

CREATE INDEX FK_crm_engagement_CrmEngagementTypeID ON crm_engagements
(
 id_crm_engagement_type
);








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





-- ************************************** crm_addresses

CREATE TABLE crm_addresses
(
 id_crm_address uuid NOT NULL,
 street_1       text NULL,
 street_2       text NULL,
 city           text NULL,
 "state"          text NULL,
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







