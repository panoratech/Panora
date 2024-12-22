
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
 created_at           timestamp with time zone NOT NULL,
 "scope"              text[] NULL,
 id_project           uuid NOT NULL,
 last_update          timestamp with time zone NULL,
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
 created_at              timestamp with time zone NOT NULL DEFAULT NOW(),
 modified_at             timestamp with time zone NOT NULL DEFAULT NOW(),
 reset_token             text NULL,
 reset_token_expires_at  timestamp with time zone NULL,
 CONSTRAINT PK_users PRIMARY KEY ( id_user ),
 CONSTRAINT force_stytch_id_unique UNIQUE ( id_stytch ),
 CONSTRAINT unique_email UNIQUE ( email )
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
 id_linked_user  uuid NULL,
 id_connection   uuid NOT NULL,
 created_at      timestamp with time zone NULL,
 modified_at     timestamp with time zone NULL,
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
 id_connection   uuid NOT NULL,
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
 id_tcg_ticket     uuid NULL,
 created_at        timestamp with time zone NOT NULL,
 modified_at       timestamp with time zone NOT NULL,
 id_linked_user    uuid NOT NULL,
 id_connection     uuid NOT NULL,
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
 created_at      timestamp with time zone NOT NULL,
 modified_at     timestamp with time zone NOT NULL,
 id_linked_user  uuid NULL,
 id_connection   uuid NOT NULL,
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
 created_at         timestamp with time zone NULL,
 CONSTRAINT PK_remote_data PRIMARY KEY ( id_remote_data ),
 CONSTRAINT Force_Unique_ressourceOwnerId UNIQUE ( ressource_owner_id )
);

COMMENT ON COLUMN remote_data.ressource_owner_id IS 'uuid of the unified object that owns this remote data. UUID of the contact, or deal , etc...';
COMMENT ON COLUMN remote_data."format" IS 'can be json, xml';


-- ************************************** managed_webhooks
CREATE TABLE managed_webhooks
(
 id_managed_webhook    uuid NOT NULL,
 active                boolean NOT NULL,
 id_connection         uuid NOT NULL,
 endpoint              uuid NOT NULL,
 api_version           text NULL,
 active_events         text[] NULL,
 remote_signing_secret text NULL,
 modified_at           timestamp with time zone NOT NULL,
 created_at            timestamp with time zone NOT NULL,
 CONSTRAINT PK_managed_webhooks PRIMARY KEY ( id_managed_webhook )
);

COMMENT ON COLUMN managed_webhooks.endpoint IS 'UUID that will be used in the final URL to help identify where to route data
 ex: api.panora.dev/mw/{managed_webhooks.endpoint}';


-- ************************************** fs_users
CREATE TABLE fs_users
(
 id_fs_user    uuid NOT NULL,
 name          text NULL,
 email         text NULL,
 is_me         boolean NOT NULL,
 remote_id     text NULL,
 created_at    timestamp with time zone NOT NULL,
 modified_at   timestamp with time zone NOT NULL,
 id_connection uuid NOT NULL,
 CONSTRAINT PK_fs_users PRIMARY KEY ( id_fs_user )
);


-- ************************************** fs_shared_links
CREATE TABLE fs_shared_links
(
 id_fs_shared_link  uuid NOT NULL,
 url                text NULL,
 download_url       text NULL,
 "scope"            text NULL,
 password_protected boolean NOT NULL,
 password           text NULL,
 expires_at         timestamp with time zone NULL,
 created_at         timestamp with time zone NOT NULL,
 modified_at        timestamp with time zone NOT NULL,
 id_connection      uuid NOT NULL,
 id_fs_folder       uuid NULL,
 id_fs_file         uuid NULL,
 remote_id          text NULL,
 CONSTRAINT PK_fs_shared_links PRIMARY KEY ( id_fs_shared_link )
);

COMMENT ON COLUMN fs_shared_links."scope" IS 'can be public, or company depending on the link';
COMMENT ON COLUMN fs_shared_links.password IS 'encrypted password';


-- ************************************** fs_permissions
CREATE TABLE fs_permissions
(
 id_fs_permission uuid NOT NULL,
 remote_id        text NULL,
 "user"           uuid NULL,
 "group"          uuid NULL,
 type             text NULL,
 roles            text[] NULL,
 created_at       timestamp with time zone NOT NULL,
 modified_at      timestamp with time zone NOT NULL,
 id_connection    uuid NOT NULL,
 CONSTRAINT PK_fs_permissions PRIMARY KEY ( id_fs_permission )
);

COMMENT ON COLUMN fs_permissions.roles IS 'read, write, owner';


-- ************************************** fs_groups
CREATE TABLE fs_groups
(
 id_fs_group        uuid NOT NULL,
 name               text NULL,
 users              uuid[] NULL,
 remote_id          text NULL,
 remote_was_deleted boolean NOT NULL,
 created_at         timestamp with time zone NOT NULL,
 modified_at        timestamp with time zone NOT NULL,
 id_connection      uuid NOT NULL,
 CONSTRAINT PK_fs_groups PRIMARY KEY ( id_fs_group )
);

COMMENT ON COLUMN fs_groups.remote_was_deleted IS 'set to true';


-- ************************************** fs_drives
CREATE TABLE fs_drives
(
 id_fs_drive       uuid NOT NULL,
 drive_url         text NULL,
 name              text NULL,
 remote_created_at timestamp with time zone NULL,
 remote_id         text NULL,
 remote_cursor     text NULL,
 created_at        timestamp with time zone NOT NULL,
 modified_at       timestamp with time zone NOT NULL,
 id_connection     uuid NOT NULL,
 CONSTRAINT PK_fs_drives PRIMARY KEY ( id_fs_drive )
);


-- ************************************** entity
CREATE TABLE entity
(
 id_entity          uuid NOT NULL,
 ressource_owner_id uuid NOT NULL,
 created_at         timestamp with time zone NOT NULL,
 modified_at        timestamp with time zone NOT NULL,
 CONSTRAINT PK_entity PRIMARY KEY ( id_entity )
);

COMMENT ON COLUMN entity.ressource_owner_id IS 'uuid of the ressource owner - can be a a crm_contact, a crm_deal, etc...';


-- ************************************** ecom_products
CREATE TABLE ecom_products
(
 id_ecom_product uuid NOT NULL,
 remote_id       text NULL,
 product_url     text NULL,
 product_type    text NULL,
 product_status  text NULL,
 images_urls     text[] NULL,
 description     text NULL,
 vendor          text NULL,
 tags            text[] NULL,
 modified_at     timestamp with time zone NOT NULL,
 created_at      timestamp with time zone NOT NULL,
 id_connection   uuid NOT NULL,
 remote_deleted  boolean NOT NULL,
 CONSTRAINT PK_ecom_products PRIMARY KEY ( id_ecom_product )
);


-- ************************************** ecom_order_line_items
CREATE TABLE ecom_order_line_items
(
 id_ecom_order_line_item uuid NOT NULL,
 CONSTRAINT PK_106 PRIMARY KEY ( id_ecom_order_line_item )
);


-- ************************************** ecom_fulfilment_orders
CREATE TABLE ecom_fulfilment_orders
(
 id_ecom_fulfilment_order uuid NOT NULL,
 CONSTRAINT PK_ecom_fulfilment_order PRIMARY KEY ( id_ecom_fulfilment_order )
);


-- ************************************** ecom_customers
CREATE TABLE ecom_customers
(
 id_ecom_customer uuid NOT NULL,
 remote_id        text NULL,
 email            text NULL,
 first_name       text NULL,
 last_name        text NULL,
 phone_number     text NULL,
 modified_at      timestamp with time zone NOT NULL,
 created_at       timestamp with time zone NOT NULL,
 id_connection    uuid NOT NULL,
 remote_deleted   boolean NOT NULL,
 CONSTRAINT PK_ecom_customers PRIMARY KEY ( id_ecom_customer )
);


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
 created_at      timestamp with time zone NOT NULL,
 modified_at     timestamp with time zone NOT NULL,
 id_linked_user  uuid NULL,
 remote_id       text NULL,
 remote_platform text NULL,
 id_connection   uuid NOT NULL,
 CONSTRAINT PK_crm_users PRIMARY KEY ( id_crm_user )
);


-- ************************************** crm_deals_stages
CREATE TABLE crm_deals_stages
(
 id_crm_deals_stage uuid NOT NULL,
 stage_name         text NULL,
 created_at         timestamp with time zone NOT NULL,
 modified_at        timestamp with time zone NOT NULL,
 id_linked_user     uuid NULL,
 remote_id          text NULL,
 remote_platform    text NULL,
 id_connection      uuid NOT NULL,
 CONSTRAINT PK_crm_deal_stages PRIMARY KEY ( id_crm_deals_stage )
);


-- ************************************** connector_sets
CREATE TABLE connector_sets
(
 id_connector_set uuid NOT NULL,
 crm_hubspot      boolean NULL,
 crm_zoho         boolean NULL,
 crm_attio        boolean NULL,
 crm_pipedrive    boolean NULL,
 tcg_zendesk      boolean NULL,
 tcg_jira         boolean NULL,
 tcg_gorgias      boolean NULL,
 tcg_gitlab       boolean NULL,
 tcg_front        boolean NULL,
 crm_zendesk      boolean NULL,
 crm_close        boolean NULL,
 fs_box           boolean NULL, 
 tcg_github       boolean NULL,
 ecom_woocommerce boolean NULL,
 ecom_shopify     boolean NULL,
 ecom_amazon      boolean NULL,
 ecom_squarespace boolean NULL,
 tcg_linear       boolean NULL,
 ecom_webflow boolean NULL,
 crm_microsoftdynamicssales boolean NULL,
 fs_dropbox boolean NULL,
 fs_googledrive boolean NULL,
 fs_sharepoint boolean NULL,
 fs_onedrive boolean NULL,
 crm_salesforce boolean NULL,
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

COMMENT ON COLUMN connection_strategies.id_connection_strategy IS 'Connection strategies are meant to overwrite default env variables for oauth strategies';
COMMENT ON COLUMN connection_strategies.status IS 'if the connection strategy should overwrite default strategy (from env)';
COMMENT ON COLUMN connection_strategies.type IS 'OAUTH2, API_KEY, PIPEDRIVE_CLOUD_OAUTH, PIPEDRIVE_CLOUD_API, HUBSPOT_CLOUD';



-- ************************************** acc_vendor_credits
CREATE TABLE acc_vendor_credits
(
 id_acc_vendor_credit uuid NOT NULL,
 id_connection        uuid NOT NULL,
 remote_id            text NULL,
 created_at           timestamp with time zone NOT NULL,
 modified_at          timestamp with time zone NOT NULL,
 "number"             text NULL,
 transaction_date     timestamp with time zone NULL,
 vendor               uuid NULL,
 total_amount         bigint NULL,
 currency             text NULL,
 exchange_rate        text NULL,
 company              uuid NULL,
 tracking_categories  text[] NULL,
 accounting_period    uuid NULL,
 CONSTRAINT PK_acc_vendor_credits PRIMARY KEY ( id_acc_vendor_credit )
);

COMMENT ON COLUMN acc_vendor_credits.company IS 'The company the vendor credit belongs to.';


-- ************************************** acc_vendor_credit_lines
CREATE TABLE acc_vendor_credit_lines
(
 id_acc_vendor_credit_line uuid NOT NULL,
 net_amount                bigint NULL,
 tracking_categories       text[] NULL,
 description               text NULL,
 account                   uuid NULL,
 id_acc_account            uuid NULL,
 exchange_rate             text NULL,
 id_acc_company_info       uuid NULL,
 remote_id                 text NULL,
 created_at                timestamp with time zone NOT NULL,
 modified_at               timestamp with time zone NOT NULL,
 id_acc_vendor_credit      uuid NULL,
 CONSTRAINT PK_acc_vendor_credit_lines PRIMARY KEY ( id_acc_vendor_credit_line )
);


-- ************************************** acc_transactions
CREATE TABLE acc_transactions
(
 id_acc_transaction       uuid NOT NULL,
 transaction_type         text NULL,
 "number"                 bigint NULL,
 transaction_date         timestamp with time zone NULL,
 total_amount             text NULL,
 exchange_rate            text NULL,
 currency                 text NULL,
 tracking_categories      text[] NULL,
 id_acc_account           uuid NULL,
 id_acc_contact           uuid NULL,
 id_acc_company_info      uuid NULL,
 id_acc_accounting_period uuid NULL,
 remote_id                text NOT NULL,
 created_at               timestamp with time zone NOT NULL,
 modified_at              timestamp with time zone NOT NULL,
 id_connection            uuid NOT NULL,
 CONSTRAINT PK_acc_transactions PRIMARY KEY ( id_acc_transaction )
);

COMMENT ON TABLE acc_transactions IS 'Transactions
The Transaction common model includes records of all types of transactions that do not appear in other common models. The type of transaction can be identified through the type field. More specifically, it will contain all types of transactions outside of:

Credit Notes
Expenses
Invoices
Journal Entries
Payments
Purchase Orders
Vendor Credits';

COMMENT ON COLUMN acc_transactions.total_amount IS 'The total amount being paid after taxes.';


-- ************************************** acc_tracking_categories
CREATE TABLE acc_tracking_categories
(
 id_acc_tracking_category uuid NOT NULL,
 remote_id                text NULL,
 name                     text NULL,
 status                   text NULL,
 category_type            text NULL,
 parent_category          uuid NULL,
 created_at               timestamp with time zone NOT NULL,
 modified_at              timestamp with time zone NOT NULL,
 id_connection            uuid NOT NULL,
 CONSTRAINT PK_acc_tracking_categories PRIMARY KEY ( id_acc_tracking_category )
);

COMMENT ON COLUMN acc_tracking_categories.status IS 'The tracking category''s status. Possible values include: ACTIVE, ARCHIVED. In cases where there is no clear mapping, the original value passed through will be returned.';
COMMENT ON COLUMN acc_tracking_categories.category_type IS 'The tracking category’s type. Possible values include: CLASS, DEPARTMENT. In cases where there is no clear mapping, the original value passed through will be returned.';
COMMENT ON COLUMN acc_tracking_categories.parent_category IS 'ID of the parent tracking category.';


-- ************************************** acc_tax_rates
CREATE TABLE acc_tax_rates
(
 id_acc_tax_rate    uuid NOT NULL,
 remote_id          text NULL,
 description        text NULL,
 total_tax_ratge    bigint NULL,
 effective_tax_rate bigint NULL,
 company            uuid NULL,
 id_connection      uuid NOT NULL,
 created_at         timestamp with time zone NOT NULL,
 modified_at        timestamp with time zone NOT NULL,
 CONSTRAINT PK_acc_tax_rates PRIMARY KEY ( id_acc_tax_rate )
);

COMMENT ON COLUMN acc_tax_rates.total_tax_ratge IS 'The tax’s total tax rate - sum of the tax components (not compounded).';
COMMENT ON COLUMN acc_tax_rates.company IS 'The subsidiary that the tax rate belongs to (in the case of multi-entity systems).';


-- ************************************** acc_report_items
CREATE TABLE acc_report_items
(
 id_acc_report_item uuid NOT NULL,
 name               text NULL,
 value              bigint NULL,
 company            uuid NULL,
 parent_item        uuid NULL,
 remote_id          text NULL,
 created_at         timestamp with time zone NOT NULL,
 modified_at        timestamp with time zone NOT NULL,
 CONSTRAINT PK_acc_report_items PRIMARY KEY ( id_acc_report_item )
);


-- ************************************** acc_income_statements
CREATE TABLE acc_income_statements
(
 id_acc_income_statement uuid NOT NULL,
 name                    text NULL,
 currency                text NULL,
 start_period            timestamp with time zone NULL,
 end_period              timestamp with time zone NULL,
 gross_profit            bigint NULL,
 net_operating_income    bigint NULL,
 net_income              bigint NULL,
 remote_id               text NULL,
 created_at              timestamp with time zone NOT NULL,
 modified_at             timestamp with time zone NOT NULL,
 id_connection           uuid NOT NULL,
 CONSTRAINT PK_acc_income_statements PRIMARY KEY ( id_acc_income_statement )
);


-- ************************************** acc_credit_notes
CREATE TABLE acc_credit_notes
(
 id_acc_credit_note       uuid NOT NULL,
 transaction_date         timestamp with time zone NULL,
 status                   text NULL,
 "number"                 text NULL,
 id_acc_contact           uuid NULL,
 company                  uuid NULL,
 exchange_rate            text NULL,
 total_amount             bigint NULL,
 remaining_credit         bigint NULL,
 tracking_categories      text[] NULL,
 currency                 text NULL,
 remote_created_at        timestamp with time zone NULL,
 remote_updated_at        timestamp with time zone NULL,
 payments                 text[] NULL,
 applied_payments         text[] NULL,
 id_acc_accounting_period uuid NULL,
 remote_id                text NULL,
 modified_at              time with time zone NOT NULL,
 created_at               time with time zone NOT NULL,
 id_connection            uuid NOT NULL,
 CONSTRAINT PK_acc_credit_notes PRIMARY KEY ( id_acc_credit_note )
);

COMMENT ON COLUMN acc_credit_notes.status IS 'The credit note''s status. Possible values include: SUBMITTED, AUTHORIZED, PAID. In cases where there is no clear mapping, the original value passed through will be returned.';
COMMENT ON COLUMN acc_credit_notes."number" IS 'The credit note''s number.';
COMMENT ON COLUMN acc_credit_notes.payments IS 'array of id_acc_payment';


-- ************************************** acc_company_infos
CREATE TABLE acc_company_infos
(
 id_acc_company_info   uuid NOT NULL,
 name                  text NULL,
 legal_name            text NULL,
 tax_number            text NULL,
 fiscal_year_end_month int NULL,
 fiscal_year_end_day   int NULL,
 currency              text NULL,
 remote_created_at     timestamp with time zone NULL,
 remote_id             text NULL,
 urls                  text[] NULL,
 created_at            timestamp with time zone NOT NULL,
 modified_at           timestamp with time zone NOT NULL,
 id_connection         uuid NOT NULL,
 tracking_categories   text[] NULL,
 CONSTRAINT PK_acc_company_infos PRIMARY KEY ( id_acc_company_info )
);


-- ************************************** acc_cash_flow_statements
CREATE TABLE acc_cash_flow_statements
(
 id_acc_cash_flow_statement  uuid NOT NULL,
 name                        text NULL,
 currency                    text NULL,
 company                     uuid NULL,
 start_period                timestamp with time zone NULL,
 end_period                  timestamp with time zone NULL,
 cash_at_beginning_of_period bigint NULL,
 cash_at_end_of_period       bigint NULL,
 remote_generated_at         timestamp with time zone NULL,
 remote_id                   text NULL,
 modified_at                 timestamp with time zone NOT NULL,
 created_at                  timestamp with time zone NOT NULL,
 id_connection               uuid NOT NULL,
 CONSTRAINT PK_acc_cash_flow_statements PRIMARY KEY ( id_acc_cash_flow_statement )
);


-- ************************************** acc_balance_sheets_report_items
CREATE TABLE acc_balance_sheets_report_items
(
 id_acc_balance_sheets_report_item uuid NOT NULL,
 remote_id                         text NULL,
 created_at                        timestamp with time zone NOT NULL,
 modified_at                       timestamp with time zone NOT NULL,
 name                              text NULL,
 value                             bigint NULL,
 parent_item                       uuid NULL,
 id_acc_company_info               uuid NULL,
 CONSTRAINT PK_acc_balance_sheets_report_items PRIMARY KEY ( id_acc_balance_sheets_report_item )
);

COMMENT ON COLUMN acc_balance_sheets_report_items.parent_item IS 'uuid of another id_acc_balance_sheets_report_item';


-- ************************************** acc_accounting_periods
CREATE TABLE acc_accounting_periods
(
 id_acc_accounting_period uuid NOT NULL,
 remote_id                text NULL,
 created_at               timestamp with time zone NOT NULL,
 modified_at              timestamp with time zone NOT NULL,
 name                     text NULL,
 status                   text NULL,
 start_date               timestamp with time zone NULL,
 end_date                 timestamp with time zone NULL,
 id_connection            uuid NOT NULL,
 CONSTRAINT PK_acc_accounting_periods PRIMARY KEY ( id_acc_accounting_period )
);

COMMENT ON COLUMN acc_accounting_periods.status IS 'Possible values include: ACTIVE, INACTIVE. In cases where there is no clear mapping, the original value passed through will be returned.';


-- ************************************** tcg_tickets
CREATE TABLE tcg_tickets
(
 id_tcg_ticket   uuid NOT NULL,
 name            text NULL,
 status          text NULL,
 description     text NULL,
 due_date        timestamp with time zone NULL,
 ticket_type     text NULL,
 parent_ticket   uuid NULL,
 tags            text[] NULL,
 collections     text[] NULL,
 completed_at    timestamp with time zone NULL,
 priority        text NULL,
 assigned_to     text[] NULL,
 remote_id       text NULL,
 remote_platform text NULL,
 creator_type    text NULL,
 id_tcg_user     uuid NULL,
 id_linked_user  uuid NULL,
 created_at      timestamp with time zone NOT NULL,
 modified_at     timestamp with time zone NOT NULL,
 id_connection   uuid NOT NULL,
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
 created_at      timestamp with time zone NULL,
 modified_at     timestamp with time zone NULL,
 id_tcg_account  uuid NULL,
 id_linked_user  uuid NULL,
 id_connection   uuid NOT NULL,
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
 id_project       uuid NOT NULL,
 name             text NOT NULL,
 sync_mode        text NOT NULL,
 pull_frequency   bigint NULL,
 redirect_url     text NULL,
 id_user          uuid NOT NULL,
 id_connector_set uuid NOT NULL,
 CONSTRAINT PK_projects PRIMARY KEY ( id_project ),
 CONSTRAINT FK_project_connectorsetid FOREIGN KEY ( id_connector_set ) REFERENCES connector_sets ( id_connector_set ),
 CONSTRAINT FK_46_1 FOREIGN KEY ( id_user ) REFERENCES users ( id_user )
);

CREATE INDEX FK_connectors_sets ON projects
(
 id_connector_set
);

CREATE TABLE projects_pull_frequency
(
 id_projects_pull_frequency uuid NOT NULL,
 crm                        bigint NULL,
 accounting                 bigint NULL,
 filestorage               bigint NULL,
 ecommerce                  bigint NULL,
 ticketing                  bigint NULL,
 created_at                 timestamp with time zone NOT NULL DEFAULT NOW(),
 modified_at                timestamp with time zone NOT NULL DEFAULT NOW(),
 id_project                 uuid NOT NULL,
 CONSTRAINT PK_projects_pull_frequency PRIMARY KEY ( id_projects_pull_frequency ),
 CONSTRAINT FK_projects_pull_frequency_project FOREIGN KEY ( id_project ) REFERENCES projects ( id_project ),
 CONSTRAINT UQ_projects_pull_frequency_project UNIQUE ( id_project )

);


COMMENT ON COLUMN projects.sync_mode IS 'Can be realtime or periodic_pull';
COMMENT ON COLUMN projects.pull_frequency IS 'Frequency in seconds for pulls

ex 3600 for one hour';


-- ************************************** fs_folders
CREATE TABLE fs_folders
(
 id_fs_folder       uuid NOT NULL,
 folder_url         text NULL,
 "size"             bigint NULL,
 name               text NULL,
 description        text NULL,
 parent_folder      uuid NULL,
 remote_id          text NULL,
 created_at         timestamp with time zone NOT NULL,
 modified_at        timestamp with time zone NOT NULL,
 remote_created_at  timestamp with time zone NULL,
 remote_modified_at timestamp with time zone NULL,
 remote_was_deleted boolean NOT NULL DEFAULT false,
 id_fs_drive        uuid NULL,
 id_connection      uuid NOT NULL,
 id_fs_permissions  uuid[] NULL,
 CONSTRAINT PK_fs_folders PRIMARY KEY ( id_fs_folder )
);

CREATE INDEX FK_fs_folder_driveID ON fs_folders
(
 id_fs_drive
);


-- ************************************** ecom_product_variants
CREATE TABLE ecom_product_variants
(
 id_ecom_product_variant uuid NOT NULL,
 id_connection           uuid NOT NULL,
 remote_id               text NULL,
 title                   text NULL,
 price                   bigint NULL,
 sku                     text NULL,
 options                 jsonb NULL,
 weight                  bigint NULL,
 inventory_quantity      bigint NULL,
 id_ecom_product         uuid NULL,
 modified_at             timestamp with time zone NOT NULL,
 created_at              timestamp with time zone NOT NULL,
 remote_deleted          boolean NOT NULL,
 CONSTRAINT PK_ecom_product_variants PRIMARY KEY ( id_ecom_product_variant ),
 CONSTRAINT FK_ecom_products_variants FOREIGN KEY ( id_ecom_product ) REFERENCES ecom_products ( id_ecom_product )
);

CREATE INDEX FK_index_ecom_products_variants ON ecom_product_variants
(
 id_ecom_product
);

COMMENT ON COLUMN ecom_product_variants.options IS 'an array of product options. ex [{color: blue}, {size: medium}] ...';


-- ************************************** ecom_orders
CREATE TABLE ecom_orders
(
 id_ecom_order      uuid NOT NULL,
 order_status       text NULL,
 order_number       text NULL,
 payment_status     text NULL,
 currency           text NULL,
 total_price        bigint NULL,
 total_discount     bigint NULL,
 total_shipping     bigint NULL,
 total_tax          bigint NULL,
 fulfillment_status text NULL,
 remote_id          text NULL,
 id_ecom_customer   uuid NULL,
 id_connection      uuid NOT NULL,
 modified_at        timestamp with time zone NOT NULL,
 created_at         timestamp with time zone NOT NULL,
 remote_deleted     boolean NOT NULL,
 CONSTRAINT PK_ecom_orders PRIMARY KEY ( id_ecom_order ),
 CONSTRAINT FK_ecom_customer_orders FOREIGN KEY ( id_ecom_customer ) REFERENCES ecom_customers ( id_ecom_customer )
);

CREATE INDEX FK_index_ecom_customer_orders ON ecom_orders
(
 id_ecom_customer
);


-- ************************************** crm_contacts
CREATE TABLE crm_contacts
(
 id_crm_contact  uuid NOT NULL,
 first_name      text NULL,
 last_name       text NULL,
 created_at      timestamp with time zone NULL,
 modified_at     timestamp with time zone NULL,
 remote_id       text NULL,
 remote_platform text NULL,
 id_crm_user     uuid NULL,
 id_linked_user  uuid NULL,
 id_connection   uuid NOT NULL,
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
 created_at          timestamp with time zone NOT NULL,
 modified_at         timestamp with time zone NOT NULL,
 remote_id           text NULL,
 remote_platform     text NULL,
 id_crm_user         uuid NULL,
 id_linked_user      uuid NULL,
 id_connection       uuid NOT NULL,
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
 created_at           timestamp with time zone NOT NULL,
 modified_at          timestamp with time zone NOT NULL,
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



-- ************************************** acc_transactions_lines_items
CREATE TABLE acc_transactions_lines_items
(
 id_acc_transactions_lines_item uuid NOT NULL,
 memo                           text NULL,
 unit_price                     text NULL,
 quantity                       text NULL,
 total_line_amount              text NULL,
 id_acc_tax_rate                uuid NULL,
 currency                       text NULL,
 exchange_rate                  text NULL,
 tracking_categories            text[] NULL,
 id_acc_company_info            uuid NULL,
 id_acc_item                    uuid NULL,
 id_acc_account                 uuid NULL,
 remote_id                      text NULL,
 created_at                     time with time zone NOT NULL,
 modified_at                    time with time zone NOT NULL,
 id_acc_transaction             uuid NULL,
 CONSTRAINT PK_acc_transactions_lines_items PRIMARY KEY ( id_acc_transactions_lines_item )
);

CREATE INDEX FK_acc_transactions_lineItems ON acc_transactions_lines_items
(
 id_acc_transaction
);

COMMENT ON COLUMN acc_transactions_lines_items.id_acc_company_info IS 'The company the line belongs to.';


-- ************************************** acc_purchase_orders
CREATE TABLE acc_purchase_orders
(
 id_acc_purchase_order    uuid NOT NULL,
 remote_id                text NULL,
 status                   text NULL,
 issue_date               timestamp with time zone NULL,
 purchase_order_number    text NULL,
 delivery_date            timestamp with time zone NULL,
 delivery_address         uuid NULL,
 customer                 uuid NULL,
 vendor                   uuid NULL,
 memo                     text NULL,
 company                  uuid NULL,
 total_amount             bigint NULL,
 currency                 text NULL,
 exchange_rate            text NULL,
 tracking_categories      text[] NULL,
 remote_created_at        timestamp with time zone NULL,
 remote_updated_at        timestamp with time zone NULL,
 created_at               timestamp with time zone NOT NULL,
 modified_at              timestamp with time zone NOT NULL,
 id_connection            uuid NOT NULL,
 id_acc_accounting_period uuid NULL,
 CONSTRAINT PK_acc_purchase_orders PRIMARY KEY ( id_acc_purchase_order )
);

CREATE INDEX FK_purchaseOrder_accountingPeriod ON acc_purchase_orders
(
 id_acc_accounting_period
);

COMMENT ON COLUMN acc_purchase_orders.status IS 'The purchase order''s status. Possible values include: DRAFT, SUBMITTED, AUTHORIZED, BILLED, DELETED. In cases where there is no clear mapping, the original value passed through will be returned.';
COMMENT ON COLUMN acc_purchase_orders.delivery_address IS 'contains a id_acc_address';
COMMENT ON COLUMN acc_purchase_orders.customer IS 'The contact making the purchase order.
Contains a id_acc_contact';
COMMENT ON COLUMN acc_purchase_orders.vendor IS 'contains a id_acc_contact';
COMMENT ON COLUMN acc_purchase_orders.id_acc_accounting_period IS 'The accounting period that the PurchaseOrder was generated in.';


-- ************************************** acc_journal_entries
CREATE TABLE acc_journal_entries
(
 id_acc_journal_entry     uuid NOT NULL,
 transaction_date         timestamp with time zone NULL,
 payments                 text[] NOT NULL,
 applied_payments         text[] NOT NULL,
 memo                     text NULL,
 currency                 text NULL,
 exchange_rate            text NULL,
 id_acc_company_info      uuid NOT NULL,
 journal_number           text NULL,
 tracking_categories      text[] NULL,
 id_acc_accounting_period uuid NULL,
 posting_status           text NULL,
 remote_created_at        timestamp with time zone NULL,
 remote_modiified_at      timestamp with time zone NULL,
 id_connection            uuid NOT NULL,
 remote_id                text NOT NULL,
 created_at               timestamp with time zone NOT NULL,
 modified_at              timestamp with time zone NOT NULL,
 CONSTRAINT PK_acc_journal_entries PRIMARY KEY ( id_acc_journal_entry )
);

CREATE INDEX FK_journal_entry_accounting_period ON acc_journal_entries
(
 id_acc_accounting_period
);

CREATE INDEX FK_journal_entry_companyInfo ON acc_journal_entries
(
 id_acc_company_info
);


-- ************************************** acc_contacts
CREATE TABLE acc_contacts
(
 id_acc_contact      uuid NOT NULL,
 name                text NULL,
 is_supplier         boolean NULL,
 is_customer         boolean NULL,
 email_address       text NULL,
 tax_number          text NULL,
 status              text NULL,
 currency            text NULL,
 remote_updated_at   text NULL,
 id_acc_company_info uuid NULL,
 id_connection       uuid NOT NULL,
 remote_id           text NULL,
 created_at          timestamp with time zone NOT NULL,
 modified_at         timestamp with time zone NOT NULL,
 CONSTRAINT PK_acc_contacts PRIMARY KEY ( id_acc_contact )
);

CREATE INDEX FK_acc_contact_company ON acc_contacts
(
 id_acc_company_info
);

COMMENT ON COLUMN acc_contacts.status IS 'The contact''s status Possible values include: ACTIVE, ARCHIVED. In cases where there is no clear mapping, the original value passed through will be returned.';


-- ************************************** acc_cash_flow_statement_report_items
CREATE TABLE acc_cash_flow_statement_report_items
(
 id_acc_cash_flow_statement_report_item uuid NOT NULL,
 name                                   text NULL,
 value                                  bigint NULL,
 type                                   text NULL,
 parent_item                            uuid NULL,
 remote_generated_at                    timestamp with time zone NULL,
 remote_id                              text NULL,
 modified_at                            timestamp with time zone NOT NULL,
 created_at                             timestamp with time zone NOT NULL,
 id_acc_cash_flow_statement             uuid NULL,
 CONSTRAINT PK_acc_cash_flow_statement_report_items PRIMARY KEY ( id_acc_cash_flow_statement_report_item )
);

CREATE INDEX FK_cashflow_statement_acc_cash_flow_statement_report_item ON acc_cash_flow_statement_report_items
(
 id_acc_cash_flow_statement
);

COMMENT ON COLUMN acc_cash_flow_statement_report_items.type IS 'can be operating, investing, financing';


-- ************************************** acc_balance_sheets
CREATE TABLE acc_balance_sheets
(
 id_acc_balance_sheet uuid NOT NULL,
 name                 text NULL,
 currency             text NULL,
 id_acc_company_info  uuid NULL,
 "date"               timestamp with time zone NULL,
 net_assets           bigint NULL,
 assets               text[] NULL,
 liabilities          text[] NULL,
 equity               text[] NULL,
 remote_generated_at  timestamp with time zone NULL,
 remote_id            text NULL,
 created_at           timestamp with time zone NOT NULL,
 modified_at          timestamp with time zone NOT NULL,
 id_connection        uuid NOT NULL,
 CONSTRAINT PK_acc_balance_sheets PRIMARY KEY ( id_acc_balance_sheet )
);

CREATE INDEX FK_balanceSheetCompanyInfoID ON acc_balance_sheets
(
 id_acc_company_info
);

COMMENT ON COLUMN acc_balance_sheets.net_assets IS 'The balance sheet''s net assets.';
COMMENT ON COLUMN acc_balance_sheets.assets IS 'array of id_acc_balance_sheets_report_item objects';
COMMENT ON COLUMN acc_balance_sheets.liabilities IS 'array of id_acc_balance_sheets_report_item objects';
COMMENT ON COLUMN acc_balance_sheets.equity IS 'array of id_acc_balance_sheets_report_item objects';


-- ************************************** acc_accounts
CREATE TABLE acc_accounts
(
 id_acc_account      uuid NOT NULL,
 name                text NULL,
 description         text NULL,
 classification      text NULL,
 type                text NULL,
 status              text NULL,
 current_balance     bigint NULL,
 currency            text NULL,
 account_number      text NULL,
 parent_account      uuid NULL,
 remote_id           text NULL,
 id_acc_company_info uuid NULL,
 created_at          timestamp with time zone NOT NULL,
 modified_at         timestamp with time zone NOT NULL,
 id_connection       uuid NOT NULL,
 CONSTRAINT PK_acc_accounts PRIMARY KEY ( id_acc_account )
);

CREATE INDEX FK_accounts_companyinfo_ID ON acc_accounts
(
 id_acc_company_info
);

COMMENT ON COLUMN acc_accounts.classification IS 'The account''s broadest grouping. Possible values include: ASSET, EQUITY, EXPENSE, LIABILITY, REVENUE. In cases where there is no clear mapping, the original value passed through will be returned.';
COMMENT ON COLUMN acc_accounts.type IS 'The account''s type is a narrower and more specific grouping within the account''s classification.';
COMMENT ON COLUMN acc_accounts.status IS 'The account''s status. Possible values include: ACTIVE, PENDING, INACTIVE. In cases where there is no clear mapping, the original value passed through will be returned.';
COMMENT ON COLUMN acc_accounts.current_balance IS 'Use cents. 100 USD would be 10000';
COMMENT ON COLUMN acc_accounts.currency IS 'Possible values include: XUA, AFN, AFA, ALL, ALK, DZD, ADP, AOA, AOK, AON, AOR, ARA, ARS, ARM, ARP, ARL, AMD, AWG, AUD, ATS, AZN, AZM, BSD, BHD, BDT, BBD, BYN, BYB, BYR, BEF, BEC, BEL, BZD, BMD, BTN, BOB, BOL, BOV, BOP, BAM, BAD, BAN, BWP, BRC, BRZ, BRE, BRR, BRN, BRB, BRL, GBP, BND, BGL, BGN, BGO, BGM, BUK, BIF, XPF, KHR, CAD, CVE, KYD, XAF, CLE, CLP, CLF, CNX, CNY, CNH, COP, COU, KMF, CDF, CRC, HRD, HRK, CUC, CUP, CYP, CZK, CSK, DKK, DJF, DOP, NLG, XCD, DDM, ECS, ECV, EGP, GQE, ERN, EEK, ETB, EUR, XBA, XEU, XBB, XBC, XBD, FKP, FJD, FIM, FRF, XFO, XFU, GMD, GEK, GEL, DEM, GHS, GHC, GIP, XAU, GRD, GTQ, GWP, GNF, GNS, GYD, HTG, HNL, HKD, HUF, IMP, ISK, ISJ, INR, IDR, IRR, IQD, IEP, ILS, ILP, ILR, ITL, JMD, JPY, JOD, KZT, KES, KWD, KGS, LAK, LVL, LVR, LBP, LSL, LRD, LYD, LTL, LTT, LUL, LUC, LUF, MOP, MKD, MKN, MGA, MGF, MWK, MYR, MVR, MVP, MLF, MTL, MTP, MRU, MRO, MUR, MXV, MXN, MXP, MDC, MDL, MCF, MNT, MAD, MAF, MZE, MZN, MZM, MMK, NAD, NPR, ANG, TWD, NZD, NIO, NIC, NGN, KPW, NOK, OMR, PKR, XPD, PAB, PGK, PYG, PEI, PEN, PES, PHP, XPT, PLN, PLZ, PTE, GWE, QAR, XRE, RHD, RON, ROL, RUB, RUR, RWF, SVC, WST, SAR, RSD, CSD, SCR, SLL, XAG, SGD, SKK, SIT, SBD, SOS, ZAR, ZAL, KRH, KRW, KRO, SSP, SUR, ESP, ESA, ESB, XDR, LKR, SHP, XSU, SDD, SDG, SDP, SRD, SRG, SZL, SEK, CHF, SYP, STN, STD, TVD, TJR, TJS, TZS, XTS, THB, XXX, TPE, TOP, TTD, TND, TRY, TRL, TMT, TMM, USD, USN, USS, UGX, UGS, UAH, UAK, AED, UYW, UYU, UYP, UYI, UZS, VUV, VES, VEB, VEF, VND, VNN, CHE, CHW, XOF, YDD, YER, YUN, YUD, YUM, YUR, ZWN, ZRN, ZRZ, ZMW, ZMK, ZWD, ZWR, ZWL. In cases where there is no clear mapping, the original value passed through will be returned.';


-- ************************************** value
CREATE TABLE value
(
 id_value     uuid NOT NULL,
 data         text NOT NULL,
 id_entity    uuid NOT NULL,
 id_attribute uuid NOT NULL,
 created_at   timestamp with time zone NOT NULL,
 modified_at  timestamp with time zone NOT NULL,
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
 id_tcg_ticket   uuid NULL,
 created_at      timestamp with time zone NOT NULL,
 modified_at     timestamp with time zone NOT NULL,
 id_linked_user  uuid NULL,
 id_connection   uuid NOT NULL,
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
 creator_type      text NULL,
 id_tcg_attachment text[] NULL,
 id_tcg_ticket     uuid NULL,
 id_tcg_contact    uuid NULL,
 id_tcg_user       uuid NULL,
 id_linked_user    uuid NULL,
 created_at        timestamp with time zone NULL,
 modified_at       timestamp with time zone NULL,
 id_connection     uuid NOT NULL,
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


-- ************************************** fs_files
CREATE TABLE fs_files
(
 id_fs_file         uuid NOT NULL,
 name               text NULL,
 file_url           text NULL,
 mime_type          text NULL,
 "size"             bigint NULL,
 remote_id          text NULL,
 id_fs_permissions  uuid[] NULL,
 id_fs_folder       uuid NULL,
 id_fs_drive        uuid NULL,
 remote_created_at  timestamp with time zone NULL,
 remote_modified_at timestamp with time zone NULL,
 remote_was_deleted boolean NOT NULL DEFAULT false,
 created_at         timestamp with time zone NOT NULL,
 modified_at        timestamp with time zone NOT NULL,
 id_connection      uuid NOT NULL,
 CONSTRAINT PK_fs_files PRIMARY KEY ( id_fs_file )
);

CREATE INDEX FK_fs_file_FolderID ON fs_files
(
 id_fs_folder
);

-- ************************************** ecom_fulfilments
CREATE TABLE ecom_fulfilments
(
 id_ecom_fulfilment uuid NOT NULL,
 carrier            text NULL,
 tracking_urls      text[] NULL,
 tracking_numbers   text[] NULL,
 items              jsonb NULL,
 remote_id          text NULL,
 id_ecom_order      uuid NULL,
 id_connection      uuid NOT NULL,
 modified_at        timestamp with time zone NOT NULL,
 created_at         timestamp with time zone NOT NULL,
 remote_deleted     boolean NOT NULL,
 CONSTRAINT PK_ecom_fulfilments PRIMARY KEY ( id_ecom_fulfilment ),
 CONSTRAINT FK_ecom_order_fulfilment FOREIGN KEY ( id_ecom_order ) REFERENCES ecom_orders ( id_ecom_order )
);

CREATE INDEX FK_index_ecom_order_fulfilment ON ecom_fulfilments
(
 id_ecom_order
);

COMMENT ON COLUMN ecom_fulfilments.items IS 'array of ecom_products info';


-- ************************************** ecom_addresses
CREATE TABLE ecom_addresses
(
 id_ecom_address  uuid NOT NULL,
 address_type     text NULL,
 street_1         text NULL,
 street_2         text NULL,
 city             text NULL,
 "state"          text NULL,
 postal_code      text NULL,
 country          text NULL,
 id_ecom_customer uuid NOT NULL,
 modified_at      timestamp with time zone NOT NULL,
 created_at       timestamp with time zone NOT NULL,
 remote_deleted   boolean NOT NULL,
 id_ecom_order    uuid NOT NULL,
 CONSTRAINT PK_ecom_customer_addresses PRIMARY KEY ( id_ecom_address ),
 CONSTRAINT FK_ecom_customer_customeraddress FOREIGN KEY ( id_ecom_customer ) REFERENCES ecom_customers ( id_ecom_customer ),
 CONSTRAINT FK_ecom_order_address FOREIGN KEY ( id_ecom_order ) REFERENCES ecom_orders ( id_ecom_order )
);

CREATE INDEX FK_index_ecom_customer_customeraddress ON ecom_addresses
(
 id_ecom_customer
);

CREATE INDEX FK_index_FK_ecom_order_address ON ecom_addresses
(
 id_ecom_order
);

COMMENT ON COLUMN ecom_addresses.address_type IS 'billing, shipping, other';


-- ************************************** crm_phone_numbers
CREATE TABLE crm_phone_numbers
(
 id_crm_phone_number uuid NOT NULL,
 phone_number        text NULL,
 phone_type          text NULL,
 owner_type          text NULL,
 created_at          timestamp with time zone NOT NULL,
 modified_at         timestamp with time zone NOT NULL,
 id_crm_company      uuid NULL,
 id_crm_contact      uuid NULL,
 id_connection       uuid NOT NULL,
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
 start_at          timestamp with time zone NULL,
 end_time          timestamp with time zone NULL,
 remote_id         text NULL,
 id_linked_user    uuid NULL,
 remote_platform   text NULL,
 id_crm_company    uuid NULL,
 id_crm_user       uuid NULL,
 id_connection     uuid NOT NULL,
 contacts          text[] NULL,
 created_at        timestamp with time zone NOT NULL,
 modified_at       timestamp with time zone NOT NULL,
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
COMMENT ON COLUMN crm_engagements.contacts IS 'array of id_crm_contact (uuids)';


-- ************************************** crm_email_addresses
CREATE TABLE crm_email_addresses
(
 id_crm_email       uuid NOT NULL,
 email_address      text NOT NULL,
 email_address_type text NOT NULL,
 owner_type         text NOT NULL,
 created_at         timestamp with time zone NOT NULL,
 modified_at        timestamp with time zone NOT NULL,
 id_crm_company     uuid NULL,
 id_crm_contact     uuid NULL,
 id_connection      uuid NOT NULL,
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
 description        text NULL,
 amount             bigint NOT NULL,
 created_at         timestamp with time zone NOT NULL,
 modified_at        timestamp with time zone NOT NULL,
 remote_id          text NULL,
 remote_platform    text NULL,
 id_crm_user        uuid NULL,
 id_crm_deals_stage uuid NULL,
 id_linked_user     uuid NULL,
 id_crm_company     uuid NULL,
 id_connection      uuid NOT NULL,
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
 id_crm_company uuid NULL,
 id_crm_contact uuid NULL,
 id_connection  uuid NOT NULL,
 created_at     timestamp with time zone NOT NULL,
 modified_at    timestamp with time zone NOT NULL,
 owner_type     text NOT NULL,
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
 CONSTRAINT FK_api_key_project_Id FOREIGN KEY ( id_project ) REFERENCES projects ( id_project ),
 CONSTRAINT FK_api_keys_user_Id FOREIGN KEY ( id_user ) REFERENCES users ( id_user )
);
CREATE INDEX FK_api_keys_projects ON api_keys
(
 id_project
);
CREATE INDEX FKx_api_keys_user_Id ON api_keys
(
 id_user
);

-- ************************************** acc_purchase_orders_line_items
CREATE TABLE acc_purchase_orders_line_items
(
 id_acc_purchase_orders_line_item uuid NOT NULL,
 id_acc_purchase_order            uuid NOT NULL,
 remote_id                        text NULL,
 modified_at                      timestamp with time zone NOT NULL,
 created_at                       timestamp with time zone NOT NULL,
 description                      text NULL,
 unit_price                       bigint NULL,
 quantity                         bigint NULL,
 tracking_categories              text[] NULL,
 tax_amount                       bigint NULL,
 total_line_amount                bigint NULL,
 currency                         text NULL,
 exchange_rate                    text NULL,
 id_acc_account                   uuid NULL,
 id_acc_company                   uuid NULL,
 CONSTRAINT PK_acc_purchase_orders_line_items PRIMARY KEY ( id_acc_purchase_orders_line_item )
);

CREATE INDEX FK_purchaseorder_purchaseorderLineItems ON acc_purchase_orders_line_items
(
 id_acc_purchase_order
);


-- ************************************** acc_phone_numbers
CREATE TABLE acc_phone_numbers
(
 id_acc_phone_number uuid NOT NULL,
 "number"            text NULL,
 type                text NULL,
 remote_id           text NULL,
 created_at          timestamp with time zone NOT NULL,
 modified_at         timestamp with time zone NOT NULL,
 id_acc_company_info uuid NULL,
 id_acc_contact      uuid NOT NULL,
 id_connection       uuid NOT NULL,
 CONSTRAINT PK_acc_phone_numbers PRIMARY KEY ( id_acc_phone_number )
);

CREATE INDEX FK_acc_phone_number_contact ON acc_phone_numbers
(
 id_acc_contact
);

CREATE INDEX FK_company_infos_phone_number ON acc_phone_numbers
(
 id_acc_company_info
);

COMMENT ON COLUMN acc_phone_numbers.id_acc_company_info IS 'holds a valueif  if the phone number belongs to a acc_company_infos objects';
COMMENT ON COLUMN acc_phone_numbers.id_acc_contact IS 'holds a valueif  if the phone number belongs to a acc_contact object';


-- ************************************** acc_journal_entries_lines
CREATE TABLE acc_journal_entries_lines
(
 id_acc_journal_entries_line uuid NOT NULL,
 net_amount                  bigint NULL,
 tracking_categories         text[] NULL,
 currency                    text NULL,
 description                 text NULL,
 company                     uuid NULL,
 contact                     uuid NULL,
 exchange_rate               text NULL,
 remote_id                   text NULL,
 created_at                  timestamp with time zone NOT NULL,
 modified_at                 timestamp with time zone NOT NULL,
 id_acc_journal_entry        uuid NOT NULL,
 CONSTRAINT PK_acc_journal_entries_lines PRIMARY KEY ( id_acc_journal_entries_line )
);

CREATE INDEX FK_journal_entries_entries_lines ON acc_journal_entries_lines
(
 id_acc_journal_entry
);


-- ************************************** acc_items
CREATE TABLE acc_items
(
 id_acc_item         uuid NOT NULL,
 name                text NULL,
 status              text NULL,
 unit_price          bigint NULL,
 purchase_price      bigint NULL,
 remote_updated_at   timestamp with time zone NULL,
 remote_id           text NULL,
 sales_account       uuid NULL,
 purchase_account    uuid NULL,
 id_acc_company_info uuid NULL,
 created_at          timestamp with time zone NOT NULL,
 modified_at         timestamp with time zone NOT NULL,
 id_connection       uuid NOT NULL,
 CONSTRAINT PK_acc_items PRIMARY KEY ( id_acc_item )
);

CREATE INDEX FK_acc_item_acc_account ON acc_items
(
 purchase_account
);

CREATE INDEX FK_acc_item_acc_company_infos ON acc_items
(
 id_acc_company_info
);

CREATE INDEX FK_acc_items_sales_account ON acc_items
(
 sales_account
);

COMMENT ON COLUMN acc_items.status IS 'The item''s status. Possible values include: ACTIVE, ARCHIVED. In cases where there is no clear mapping, the original value passed through will be returned.';


-- ************************************** acc_invoices
CREATE TABLE acc_invoices
(
 id_acc_invoice           uuid NOT NULL,
 type                     text NULL,
 "number"                 text NULL,
 issue_date               timestamp with time zone NULL,
 due_date                 timestamp with time zone NULL,
 paid_on_date             timestamp with time zone NULL,
 memo                     text NULL,
 currency                 text NULL,
 exchange_rate            text NULL,
 total_discount           bigint NULL,
 sub_total                bigint NULL,
 status                   text NULL,
 total_tax_amount         bigint NULL,
 total_amount             bigint NULL,
 balance                  bigint NULL,
 remote_updated_at        timestamp with time zone NULL,
 remote_id                text NULL,
 created_at               timestamp with time zone NOT NULL,
 modified_at              timestamp with time zone NOT NULL,
 id_connection            uuid NOT NULL,
 id_acc_contact           uuid NULL,
 id_acc_accounting_period uuid NULL,
 tracking_categories      text[] NULL,
 CONSTRAINT PK_acc_invoices PRIMARY KEY ( id_acc_invoice )
);

CREATE INDEX FK_acc_invoice_accounting_period_index ON acc_invoices
(
 id_acc_accounting_period
);

CREATE INDEX FK_invoice_contactID ON acc_invoices
(
 id_acc_contact
);

COMMENT ON COLUMN acc_invoices.type IS 'Whether the invoice is an accounts receivable or accounts payable. If type is ACCOUNTS_PAYABLE, the invoice is a bill. If type is ACCOUNTS_RECEIVABLE, it is an invoice. Possible values include: ACCOUNTS_RECEIVABLE, ACCOUNTS_PAYABLE. In cases where there is no clear mapping, the original value passed through will be returned.';
COMMENT ON COLUMN acc_invoices.total_discount IS 'The total discounts applied to the total cost.';
COMMENT ON COLUMN acc_invoices.status IS 'The status of the invoice. Possible values include: PAID, DRAFT, SUBMITTED, PARTIALLY_PAID, OPEN, VOID. In cases where there is no clear mapping, the original value passed through will be returned.';


-- ************************************** acc_expenses
CREATE TABLE acc_expenses
(
 id_acc_expense      uuid NOT NULL,
 transaction_date    timestamp with time zone NULL,
 total_amount        bigint NULL,
 sub_total           bigint NULL,
 total_tax_amount    bigint NULL,
 currency            text NULL,
 exchange_rate       text NULL,
 memo                text NULL,
 id_acc_account      uuid NULL,
 id_acc_contact      uuid NULL,
 id_acc_company_info uuid NULL,
 remote_id           text NULL,
 remote_created_at   timestamp with time zone NULL,
 created_at          timestamp with time zone NOT NULL,
 modified_at         timestamp with time zone NOT NULL,
 id_connection       uuid NOT NULL,
 tracking_categories text[] NULL,
 CONSTRAINT PK_acc_expenses PRIMARY KEY ( id_acc_expense )
);

CREATE INDEX FK_acc_account_acc_expense_index ON acc_expenses
(
 id_acc_account
);

CREATE INDEX FK_acc_expense_acc_company_index ON acc_expenses
(
 id_acc_company_info
);

CREATE INDEX FK_acc_expense_acc_contact_index ON acc_expenses
(
 id_acc_contact
);

COMMENT ON COLUMN acc_expenses.transaction_date IS 'When the transaction occurred.';
COMMENT ON COLUMN acc_expenses.remote_created_at IS 'When the expense was created.';
COMMENT ON COLUMN acc_expenses.tracking_categories IS 'array of id_acc_tracking_category';


-- ************************************** acc_attachments
CREATE TABLE acc_attachments
(
 id_acc_attachment uuid NOT NULL,
 file_name         text NULL,
 file_url          text NULL,
 remote_id         text NULL,
 id_acc_account    uuid NULL,
 created_at        timestamp with time zone NOT NULL,
 modified_at       timestamp with time zone NOT NULL,
 id_connection     uuid NOT NULL,
 CONSTRAINT PK_acc_attachments PRIMARY KEY ( id_acc_attachment )
);

CREATE INDEX FK_acc_attachments_accountID ON acc_attachments
(
 id_acc_account
);


-- ************************************** acc_addresses
CREATE TABLE acc_addresses
(
 id_acc_address      uuid NOT NULL,
 type                text NULL,
 street_1            text NULL,
 street_2            text NULL,
 city                text NULL,
 remote_id           text NULL,
 "state"             text NULL,
 country_subdivision text NULL,
 country             text NULL,
 zip                 text NULL,
 created_at          timestamp with time zone NOT NULL,
 modified_at         timestamp with time zone NOT NULL,
 id_acc_contact      uuid NULL,
 id_acc_company_info uuid NULL,
 id_connection       uuid NOT NULL,
 CONSTRAINT PK_acc_addresses PRIMARY KEY ( id_acc_address )
);

CREATE INDEX FK_acc_company_info_acc_adresses ON acc_addresses
(
 id_acc_company_info
);

CREATE INDEX FK_acc_contact_acc_addresses ON acc_addresses
(
 id_acc_contact
);

COMMENT ON TABLE acc_addresses IS 'The Address object is used to represent a contact''s or company''s address.';

COMMENT ON COLUMN acc_addresses.type IS 'can be SHIPPING, BILLING, OFFICES, PO....';
COMMENT ON COLUMN acc_addresses."state" IS 'can also be a region';
COMMENT ON COLUMN acc_addresses.country_subdivision IS 'Also called a  "departement" in some countries (ex: france)';
COMMENT ON COLUMN acc_addresses.id_acc_contact IS 'contains a value if the acc_address belongs to an acc_contact object';
COMMENT ON COLUMN acc_addresses.id_acc_company_info IS 'contains a value if the acc_address belongs to an acc_company_info object';


-- ************************************** tcg_attachments
CREATE TABLE tcg_attachments
(
 id_tcg_attachment uuid NOT NULL,
 remote_id         text NULL,
 remote_platform   text NULL,
 file_name         text NULL,
 file_url          text NULL,
 uploader          uuid NOT NULL,
 created_at        timestamp with time zone NOT NULL,
 modified_at       timestamp with time zone NOT NULL,
 id_linked_user    uuid NULL,
 id_tcg_ticket     uuid NULL,
 id_tcg_comment    uuid NULL,
 id_connection     uuid NOT NULL,
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
 id_invite_link      uuid NOT NULL,
 status              text NOT NULL,
 email               text NULL,
 id_linked_user      uuid NOT NULL,
 displayed_verticals text[] NULL,
 displayed_providers text[] NULL,
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
 id_connection  uuid NULL,
 id_project     uuid NOT NULL,
 type           text NOT NULL,
 status         text NOT NULL,
 direction      text NOT NULL,
 method         text NOT NULL,
 url            text NOT NULL,
 provider       text NOT NULL,
 "timestamp"    timestamp with time zone NOT NULL DEFAULT NOW(),
 id_linked_user uuid NULL,
 CONSTRAINT PK_jobs PRIMARY KEY ( id_event ),
 CONSTRAINT FK_12 FOREIGN KEY ( id_linked_user ) REFERENCES linked_users ( id_linked_user )
);

CREATE INDEX FK_linkeduserID_projectID ON events
(
 id_linked_user
);

COMMENT ON COLUMN events.type IS 'example crm_contact.created crm_contact.deleted';
COMMENT ON COLUMN events.status IS 'pending,, retry_scheduled, failed, success';


-- ************************************** crm_tasks
CREATE TABLE crm_tasks
(
 id_crm_task     uuid NOT NULL,
 subject         text NULL,
 content         text NULL,
 status          text NULL,
 due_date        timestamp with time zone NULL,
 finished_date   timestamp with time zone NULL,
 created_at      timestamp with time zone NOT NULL,
 modified_at     timestamp with time zone NOT NULL,
 id_crm_user     uuid NULL,
 id_crm_company  uuid NULL,
 id_crm_deal     uuid NULL,
 id_linked_user  uuid NULL,
 remote_id       text NULL,
 remote_platform text NULL,
 id_connection   uuid NOT NULL,
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
 created_at      timestamp with time zone NOT NULL,
 modified_at     timestamp with time zone NOT NULL,
 id_crm_company  uuid NULL,
 id_crm_contact  uuid NULL,
 id_crm_deal     uuid NULL,
 id_linked_user  uuid NULL,
 remote_id       text NULL,
 remote_platform text NULL,
 id_crm_user     uuid NULL,
 id_connection   uuid NOT NULL,
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
 expiration_timestamp timestamp with time zone NULL,
 created_at           timestamp with time zone NOT NULL,
 connection_token     text NULL,
 id_project           uuid NOT NULL,
 id_linked_user       uuid NOT NULL,
 CONSTRAINT PK_connections PRIMARY KEY ( id_connection ),
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



-- ************************************** acc_payments
CREATE TABLE acc_payments
(
 id_acc_payment           uuid NOT NULL,
 id_acc_invoice           uuid NULL,
 transaction_date         timestamp with time zone NULL,
 id_acc_contact           uuid NULL,
 id_acc_account           uuid NULL,
 currency                 text NULL,
 exchange_rate            text NULL,
 total_amount             bigint NULL,
 remote_id                text NULL,
 type                     text NULL,
 remote_updated_at        timestamp with time zone NULL,
 id_acc_company_info      uuid NULL,
 id_acc_accounting_period uuid NULL,
 created_at               timestamp with time zone NOT NULL,
 modified_at              timestamp with time zone NOT NULL,
 id_connection            uuid NOT NULL,
 tracking_categories      text[] NULL,
 CONSTRAINT PK_acc_payments PRIMARY KEY ( id_acc_payment )
);

CREATE INDEX FK_acc_payment_acc_account_index ON acc_payments
(
 id_acc_account
);

CREATE INDEX FK_acc_payment_acc_company_index ON acc_payments
(
 id_acc_company_info
);

CREATE INDEX FK_acc_payment_acc_contact ON acc_payments
(
 id_acc_contact
);

CREATE INDEX FK_acc_payment_accounting_period_index ON acc_payments
(
 id_acc_accounting_period
);

CREATE INDEX FK_acc_payment_invoiceID ON acc_payments
(
 id_acc_invoice
);

COMMENT ON COLUMN acc_payments.id_acc_contact IS 'The supplier, or customer involved in the payment.';
COMMENT ON COLUMN acc_payments.id_acc_account IS 'The supplier’s or customer’s account in which the payment is made.';
COMMENT ON COLUMN acc_payments.type IS 'The type of the invoice. Possible values include: ACCOUNTS_PAYABLE, ACCOUNTS_RECEIVABLE. In cases where there is no clear mapping, the original value passed through will be returned.';
COMMENT ON COLUMN acc_payments.id_acc_company_info IS 'The company the payment belongs to.';


-- ************************************** acc_invoices_line_items
CREATE TABLE acc_invoices_line_items
(
 id_acc_invoices_line_item uuid NOT NULL,
 remote_id                 text NULL,
 description               text NULL,
 unit_price                bigint NULL,
 quantity                  bigint NULL,
 total_amount              bigint NULL,
 currency                  text NULL,
 exchange_rate             text NULL,
 id_acc_invoice            uuid NOT NULL,
 id_acc_item               uuid NOT NULL,
 created_at                timestamp with time zone NOT NULL,
 modified_at               timestamp with time zone NOT NULL,
 id_connection             uuid NOT NULL,
 acc_tracking_categories   text[] NULL,
 CONSTRAINT PK_acc_invoices_line_items PRIMARY KEY ( id_acc_invoices_line_item )
);

CREATE INDEX FK_acc_invoice_line_items_index ON acc_invoices_line_items
(
 id_acc_invoice
);

CREATE INDEX FK_acc_items_lines_invoice_index ON acc_invoices_line_items
(
 id_acc_item
);


-- ************************************** acc_expense_lines
CREATE TABLE acc_expense_lines
(
 id_acc_expense_line uuid NOT NULL,
 id_acc_expense      uuid NOT NULL,
 remote_id           text NULL,
 net_amount          bigint NULL,
 currency            text NULL,
 description         text NULL,
 exchange_rate       text NULL,
 created_at          timestamp with time zone NOT NULL,
 modified_at         timestamp with time zone NOT NULL,
 id_connection       uuid NOT NULL,
 CONSTRAINT PK_acc_expense_lines PRIMARY KEY ( id_acc_expense_line )
);

CREATE INDEX FK_acc_expense_expense_lines_index ON acc_expense_lines
(
 id_acc_expense
);


-- ************************************** webhook_delivery_attempts
CREATE TABLE webhook_delivery_attempts
(
 id_webhook_delivery_attempt uuid NOT NULL,
 "timestamp"                 timestamp with time zone NOT NULL,
 status                      text NOT NULL,
 next_retry                  timestamp with time zone NULL,
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
 "timestamp"            timestamp with time zone NOT NULL DEFAULT NOW(),
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


-- ************************************** acc_payments_line_items
CREATE TABLE acc_payments_line_items
(
 acc_payments_line_item uuid NOT NULL,
 id_acc_payment         uuid NOT NULL,
 applied_amount         bigint NULL,
 applied_date           timestamp with time zone NULL,
 related_object_id      uuid NULL,
 related_object_type    text NULL,
 remote_id              text NULL,
 created_at             timestamp with time zone NOT NULL,
 modified_at            timestamp with time zone NOT NULL,
 id_connection          uuid NOT NULL,
 CONSTRAINT PK_acc_payments_line_items PRIMARY KEY ( acc_payments_line_item )
);

CREATE INDEX FK_acc_payment_line_items_index ON acc_payments_line_items
(
 id_acc_payment
);

COMMENT ON COLUMN acc_payments_line_items.related_object_type IS 'can either be a Invoice, CreditNote, or JournalEntry';


