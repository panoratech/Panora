--INSERT INTO organizations (id_organization, name, stripe_customer_id) VALUES
-- ('55222419-795d-4183-8478-361626363e58', 'Acme Inc', 'cust_stripe_acme_56604f75-7bf8-4541-9ab4-5928aade4bb8' );

INSERT INTO users (id_user, identification_strategy, email, password_hash, first_name, last_name) VALUES
('0ce39030-2901-4c56-8db0-5e326182ec6b', 'b2c','local@panora.dev', '$2b$10$Y7Q8TWGyGuc5ecdIASbBsuXMo3q/Rs3/cnY.mLZP4tUgfGUOCUBlG', 'local', 'Panora');

-- First, insert connector sets
INSERT INTO connector_sets (id_connector_set, crm_hubspot, crm_freshsales, crm_zoho, crm_pipedrive, crm_attio, tcg_zendesk, tcg_gorgias, tcg_front, tcg_jira, tcg_gitlab) VALUES
    ('1709da40-17f7-4d3a-93a0-96dc5da6ddd7', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
    ('852dfff8-ab63-4530-ae49-e4b2924407f8', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
    ('aed0f856-f802-4a79-8640-66d441581a99', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

-- Then, insert projects with a reference to the connector sets
INSERT INTO projects (id_project, name, sync_mode, id_user, id_connector_set) VALUES
    ('1e468c15-aa57-4448-aa2b-7fed640d1e3d', 'Project 1', 'pool', '0ce39030-2901-4c56-8db0-5e326182ec6b', '1709da40-17f7-4d3a-93a0-96dc5da6ddd7'),
    ('4c641a21-a7f8-4ffe-b7e8-e7d32db87557', 'Project 2', 'pool', '0ce39030-2901-4c56-8db0-5e326182ec6b', '852dfff8-ab63-4530-ae49-e4b2924407f8'),
    ('2b198012-c79c-4bb6-971e-9635830e8c15', 'Project 3', 'pool', '0ce39030-2901-4c56-8db0-5e326182ec6b', 'aed0f856-f802-4a79-8640-66d441581a99');

-- DO $$
-- DECLARE
    --org_id UUID;
--BEGIN
    --SELECT id_organization INTO org_id FROM organizations WHERE name = 'Acme Inc';
    --INSERT INTO projects (id_project, name, id_organization, sync_mode) VALUES
    --('1e468c15-aa57-4448-aa2b-7fed640d1e3d', 'Project 1', org_id, 'pool'),
    --('4c641a21-a7f8-4ffe-b7e8-e7d32db87557', 'Project 2', org_id, 'pool'),
    --('2b198012-c79c-4bb6-971e-9635830e8c15', 'Project 3', org_id, 'pool');
--END $$;