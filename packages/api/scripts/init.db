

-- ************************************** organizations

CREATE TABLE organizations
(
 id_organization    bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
 name               text NOT NULL,
 stripe_customer_id text NOT NULL,
 CONSTRAINT PK_organizations PRIMARY KEY ( id_organization )
);








-- ************************************** jobs

CREATE TABLE jobs
(
 id_job    serial NOT NULL,
 status    text NOT NULL,
 "timestamp" timestamp NOT NULL DEFAULT NOW(),
 CONSTRAINT PK_jobs PRIMARY KEY ( id_job )
);



COMMENT ON COLUMN jobs.status IS 'pending,, retry_scheduled, failed, success';





-- ************************************** users

CREATE TABLE users
(
 id_user         serial NOT NULL,
 email           text NOT NULL,
 password_hash   text NOT NULL,
 first_name      text NOT NULL,
 last_name       text NOT NULL,
 created_at      timestamp NOT NULL DEFAULT NOW(),
 modified_at     timestamp NOT NULL DEFAULT NOW(),
 id_organization bigint NULL,
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
 id_project      serial NOT NULL,
 name            text NOT NULL,
 id_organization bigint NOT NULL,
 CONSTRAINT PK_projects PRIMARY KEY ( id_project ),
 CONSTRAINT FK_6 FOREIGN KEY ( id_organization ) REFERENCES organizations ( id_organization )
);

CREATE INDEX FK_1_projects ON projects
(
 id_organization
);








-- ************************************** jobs_status_history

CREATE TABLE jobs_status_history
(
 id_jobs_status_history serial NOT NULL,
 "timestamp"              timestamp NOT NULL DEFAULT NOW(),
 previous_status        text NOT NULL,
 new_status             text NOT NULL,
 id_job                 serial NOT NULL,
 CONSTRAINT PK_1 PRIMARY KEY ( id_jobs_status_history ),
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
 id_crm_contact serial NOT NULL,
 first_name     text NOT NULL,
 last_name      text NOT NULL,
 id_job         serial NOT NULL,
 CONSTRAINT PK_crm_contacts PRIMARY KEY ( id_crm_contact ),
 CONSTRAINT job_id_crm_contact FOREIGN KEY ( id_job ) REFERENCES jobs ( id_job )
);

CREATE INDEX crm_contact_id_job ON crm_contacts
(
 id_job
);








-- ************************************** crm_contacts_phone_numbers

CREATE TABLE crm_contacts_phone_numbers
(
 id_crm_contacts_phone_number serial NOT NULL,
 phone_number                 text NOT NULL,
 phone_type                   text NOT NULL,
 id_crm_contact               serial NOT NULL,
 CONSTRAINT PK_crm_contacts_phone_numbers PRIMARY KEY ( id_crm_contacts_phone_number ),
 CONSTRAINT FK_2 FOREIGN KEY ( id_crm_contact ) REFERENCES crm_contacts ( id_crm_contact )
);

CREATE INDEX crm_contactID_crm_contact_phone_number ON crm_contacts_phone_numbers
(
 id_crm_contact
);








-- ************************************** crm_contact_email_addresses

CREATE TABLE crm_contact_email_addresses
(
 id_crm_contact_email serial NOT NULL,
 email_address        text NOT NULL,
 email_address_type   text NOT NULL,
 id_crm_contact       serial NOT NULL,
 CONSTRAINT PK_crm_contact_email_addresses PRIMARY KEY ( id_crm_contact_email ),
 CONSTRAINT FK_3 FOREIGN KEY ( id_crm_contact ) REFERENCES crm_contacts ( id_crm_contact )
);

CREATE INDEX crm_contactID_crm_contact_email_address ON crm_contact_email_addresses
(
 id_crm_contact
);








-- ************************************** api_keys

CREATE TABLE api_keys
(
 id_api_key bigint NOT NULL GENERATED ALWAYS AS IDENTITY,
 api_key    text NOT NULL,
 id_project int NULL,
 id_user    int NULL,
 CONSTRAINT id_ PRIMARY KEY ( id_api_key ),
 CONSTRAINT unique_api_keys UNIQUE ( api_key ),
 CONSTRAINT FK_7 FOREIGN KEY ( id_project ) REFERENCES projects ( id_project ),
 CONSTRAINT FK_8 FOREIGN KEY ( id_user ) REFERENCES users ( id_user )
);

CREATE INDEX FK_1 ON api_keys
(
 id_project
);

CREATE INDEX FK_2 ON api_keys
(
 id_user
);







