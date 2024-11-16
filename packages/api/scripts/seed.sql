INSERT INTO users (id_user, identification_strategy, email, password_hash, first_name, last_name) VALUES
('0ce39030-2901-4c56-8db0-5e326182ec6b', 'b2c','local@panora.dev', '$2b$10$Y7Q8TWGyGuc5ecdIASbBsuXMo3q/Rs3/cnY.mLZP4tUgfGUOCUBlG', 'local', 'Panora');
 

INSERT INTO connector_sets (id_connector_set, crm_hubspot, crm_zoho, crm_pipedrive, crm_attio, crm_zendesk, crm_close, tcg_zendesk, tcg_gorgias, tcg_front, tcg_jira, tcg_gitlab, fs_box, tcg_github, crm_microsoftdynamicssales, ecom_webflow, tcg_linear, ecom_shopify, ecom_woocommerce, ecom_amazon, ecom_squarespace, fs_googledrive, fs_dropbox, fs_sharepoint, fs_onedrive, crm_salesforce) VALUES
    ('1709da40-17f7-4d3a-93a0-96dc5da6ddd7', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
    ('852dfff8-ab63-4530-ae49-e4b2924407f8', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE),
    ('aed0f856-f802-4a79-8640-66d441581a99', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE);

INSERT INTO projects (id_project, name, sync_mode, id_user, id_connector_set) VALUES
    ('1e468c15-aa57-4448-aa2b-7fed640d1e3d', 'Project 1', 'pull', '0ce39030-2901-4c56-8db0-5e326182ec6b', '1709da40-17f7-4d3a-93a0-96dc5da6ddd7'),
    ('4c641a21-a7f8-4ffe-b7e8-e7d32db87557', 'Project 2', 'pull', '0ce39030-2901-4c56-8db0-5e326182ec6b', '852dfff8-ab63-4530-ae49-e4b2924407f8'),
    ('2b198012-c79c-4bb6-971e-9635830e8c15', 'Project 3', 'pull', '0ce39030-2901-4c56-8db0-5e326182ec6b', 'aed0f856-f802-4a79-8640-66d441581a99');
