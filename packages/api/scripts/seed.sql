INSERT INTO organizations (id_organization, name, stripe_customer_id) VALUES
('55222419-795d-4183-8478-361626363e58', 'Acme Inc', 'cust_stripe_acme_56604f75-7bf8-4541-9ab4-5928aade4bb8' );

INSERT INTO users (id_user, email, password_hash, first_name, last_name, id_organization) VALUES
('0ce39030-2901-4c56-8db0-5e326182ec6b', 'audrey@aubry.io', 'my_password', 'Audrey', 'Aubry',  '55222419-795d-4183-8478-361626363e58'
(SELECT id_organization FROM organizations WHERE name = 'Acme Inc'));

DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id_organization INTO org_id FROM organizations WHERE name = 'Acme Inc';
    INSERT INTO projects (id_project, name, id_organization, sync_mode) VALUES
    ('1e468c15-aa57-4448-aa2b-7fed640d1e3d', 'Project 1', org_id, 'pool'),
    ('4c641a21-a7f8-4ffe-b7e8-e7d32db87557', 'Project 2', org_id, 'pool'),
    ('2b198012-c79c-4bb6-971e-9635830e8c15', 'Project 3', org_id, 'pool');
END $$;
