--INSERT INTO organizations (id_organization, name, stripe_customer_id) VALUES
-- ('55222419-795d-4183-8478-361626363e58', 'Acme Inc', 'cust_stripe_acme_56604f75-7bf8-4541-9ab4-5928aade4bb8' );

INSERT INTO users (id_user, identification_strategy, email, password_hash, first_name, last_name) VALUES
('0ce39030-2901-4c56-8db0-5e326182ec6b', 'b2c','audrey@aubry.io', '$2b$10$Nxcp3x0yDaCrMrhZQ6IiNeqk0BxxDTnfn9iGG2UK5nWMh/UB6LgZu', 'Audrey', 'Aubry');


INSERT INTO projects (id_project, name, sync_mode, id_user) VALUES
    ('1e468c15-aa57-4448-aa2b-7fed640d1e3d', 'Project 1', 'pool', '0ce39030-2901-4c56-8db0-5e326182ec6b'),
    ('4c641a21-a7f8-4ffe-b7e8-e7d32db87557', 'Project 2', 'pool', '0ce39030-2901-4c56-8db0-5e326182ec6b'),
    ('2b198012-c79c-4bb6-971e-9635830e8c15', 'Project 3', 'pool', '0ce39030-2901-4c56-8db0-5e326182ec6b');

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