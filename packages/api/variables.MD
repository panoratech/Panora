| Variable | Example                           | Purpose                           |
| -------- | ------------------------------------- | ------------------------------------- |
| JWT_SECRET      | secret_jwt  | Jwt token used to authenticate requests coming from the webapp to the server |
| ENCRYPT_CRYPTO_SECRET_KEY   | 0123456789abcdef0123456789abcdef | 256-Bit Encryption key used to encrypt sensitive data |
| ENV     | dev | Values are dev, prod or sandbox  |
| DISTRIBUTION      | selfhost  | Values are selfhost or managed |
| PANORA_BASE_API_URL   | <http://localhost:3000> | |
| REDIS_HOST     | redis  | The redis host  |
| REDIS_PASS      | A3vniod98Zbuvn9u5  | The redis password |
| REDIS_PORT   | 6379 |The redis port|
| SENTRY_DSN     | | Sentry Dsn |
| SENTRY_ENABLED      |  | Flag which indicates if you want to enable Sentry  |
| POSTGRES_USER     | my_user  |  username to get access access to the db |
| POSTGRES_DB      | panora_db   | database name to get access access to the db |
| POSTGRES_HOST      | postgres   | host to get access access to the db |
| POSTGRES_PASSWORD     | my_password | password to get access access to the db |
| REDIRECT_TUNNEL_INGRESS     | <https://MY-NGROK-DOMAIN.ngrok-free.app>  | Mandatory only when DISTRIBUTION=selfhost. Endpoint (an Ngrok tunnel domain) when you have to test your OAuth App and needs a HTTPS redirectUri that redirects to your localhost (useful for contributors that might need to test their oAuth flow)  |
| WEBHOOK_INGRESS      |  <https://MY-NGROK-DOMAIN.ngrok-free.app>  | Same job as REDIRECT_TUNNEL_INGRESS. You can use the same value for both if you prefer.  |
| NEXT_PUBLIC_BACKEND_DOMAIN     |  <http://localhost:3000> | Server url. Values are [http://localhost:3000, https://api-dev.panora.dev, https://api-sandbox.panora.dev, https://api.panora.dev] |
| NEXT_PUBLIC_MAGIC_LINK_DOMAIN      |  <http://localhost:81>   | Magic link server. Values are [http://localhost:81, https://connect-dev.panora.dev, https://connect.panora.dev ]  |
| NEXT_PUBLIC_DISTRIBUTION      | managed | Values are selfhost or managed |
| NEXT_PUBLIC_WEBAPP_DOMAIN      |  <http://localhost>  | Webapp client url. Values are [http://localhost, https://app-dev.panora.dev, https://app.panora.dev, ]  |
| NEXT_PUBLIC_POSTHOG_HOST      |    | Host domain of your posthog |
| NEXT_PUBLIC_POSTHOG_KEY      |    | Key of your posthog account |
| MINIO_ROOT_USER     | myaccesskey13 |  |
| MINIO_ROOT_PASSWORD      | mysecretkey12  |  |
| AWS_S3_REGION      | us-east-1  |  |
| S3_TCG_ATTACHMENTS_BUCKETNAME     | tcg-attachments|   |
| BUCKET_TCG_ATTACHMENTS_USER      | BUCKET_TCG_ATTACHMENTS_USER01 |  |
| BUCKET_TCG_ATTACHMENTS_PW      | BUCKET_TCG_ATTACHMENTS_PW01  |  |
| HUBSPOT_CRM_CLOUD_CLIENT_ID     |   |   |
| HUBSPOT_CRM_CLOUD_CLIENT_SECRET      |    |   |
| ZOHO_CRM_CLOUD_CLIENT_ID      |    |   |
| ZOHO_CRM_CLOUD_CLIENT_SECRET      |    |   |
| PIPEDRIVE_CRM_CLOUD_CLIENT_ID      |    |   |
| PIPEDRIVE_CRM_CLOUD_CLIENT_SECRET      |    |   |
| ZENDESK_CRM_CLOUD_CLIENT_ID      |    |   |
| ZENDESK_CRM_CLOUD_CLIENT_SECRET      |    |   |
| ATTIO_CRM_CLOUD_CLIENT_ID      |    |   |
| ATTIO_CRM_CLOUD_CLIENT_SECRET      |    |   |
| CLOSE_CRM_CLOUD_CLIENT_ID      |    |   |
| CLOSE_CRM_CLOUD_CLIENT_SECRET      |    |   |
| CAPSULE_CRM_CLOUD_CLIENT_ID     |    |   |
| CAPSULE_CRM_CLOUD_CLIENT_SECRET     |    |   |
| TEAMLEADER_CRM_CLOUD_CLIENT_ID      |    |   |
| TEAMLEADER_CRM_CLOUD_CLIENT_SECRET      |    |   |
| ZENDESK_TICKETING_CLOUD_CLIENT_ID      |    |   |
| ZENDESK_TICKETING_CLOUD_CLIENT_SECRET      |    |   |
| ZENDESK_TICKETING_CLOUD_SUBDOMAIN      |    |   |
| JIRA_TICKETING_CLOUD_CLIENT_ID      |    |   |
| JIRA_TICKETING_CLOUD_CLIENT_SECRET      |    |   |
| FRONT_TICKETING_CLOUD_CLIENT_ID      |    |   |
| FRONT_TICKETING_CLOUD_CLIENT_SECRET      |    |   |
| GORGIAS_TICKETING_CLOUD_CLIENT_ID      |    |   |
| GORGIAS_TICKETING_CLOUD_CLIENT_SECRET      |    |   |
| LINEAR_TICKETING_CLOUD_CLIENT_ID      |    |   |
| LINEAR_TICKETING_CLOUD_CLIENT_SECRET      |    |   |
| CLICKUP_TICKETING_CLOUD_CLIENT_ID      |    |   |
| CLICKUP_TICKETING_CLOUD_CLIENT_SECRET      |    |   |
| ASANA_TICKETING_CLOUD_CLIENT_ID      |    |   |
| ASANA_TICKETING_CLOUD_CLIENT_SECRET      |    |   |
| AHA_TICKETING_CLOUD_CLIENT_ID      |    |   |
| AHA_TICKETING_CLOUD_CLIENT_SECRET      |    |   |
| AHA_TICKETING_CLOUD_SUBDOMAIN      |    |   |
| HELPSCOUT_TICKETING_CLOUD_CLIENT_ID      |    |   |
| HELPSCOUT_TICKETING_CLOUD_CLIENT_SECRET      |    |   |
| IRONCLAD_TICKETING_CLOUD_CLIENT_ID      |    |   |
| IRONCLAD_TICKETING_CLOUD_CLIENT_SECRET      |    |   |
| GITHUB_TICKETING_CLOUD_CLIENT_ID      |    |   |
| GITHUB_TICKETING_CLOUD_CLIENT_SECRET      |    |   |
| WRIKE_TICKETING_CLOUD_CLIENT_ID      |    |   |
| WRIKE_TICKETING_CLOUD_CLIENT_SECRET      |    |   |
| GITLAB_TICKETING_CLOUD_CLIENT_ID      |    |   |
| GITLAB_TICKETING_CLOUD_CLIENT_SECRET      |    |   |
| SAGE_ACCOUNTING_CLOUD_CLIENT_ID      |    |   |
| SAGE_ACCOUNTING_CLOUD_CLIENT_SECRET      |    |   |
| PENNYLANE_ACCOUNTING_CLOUD_CLIENT_ID      |    |   |
| PENNYLANE_ACCOUNTING_CLOUD_CLIENT_SECRET      |    |   |
| FREEAGENT_ACCOUNTING_CLOUD_CLIENT_ID      |    |   |
| FREEAGENT_ACCOUNTING_CLOUD_CLIENT_SECRET      |    |   |
| FRESHBOOKS_ACCOUNTING_CLOUD_CLIENT_ID      |    |   |
| FRESHBOOKS_ACCOUNTING_CLOUD_CLIENT_SECRET      |    |   |
| MONEYBIRD_ACCOUNTING_CLOUD_CLIENT_ID      |    |   |
| MONEYBIRD_ACCOUNTING_CLOUD_CLIENT_SECRET      |    |   |
| QUICKBOOKS_ACCOUNTING_CLOUD_CLIENT_ID      |    |   |
| QUICKBOOKS_ACCOUNTING_CLOUD_CLIENT_SECRET      |    |   |
| XERO_ACCOUNTING_CLOUD_CLIENT_ID      |    |   |
| XERO_ACCOUNTING_CLOUD_CLIENT_SECRET      |    |   |
| GOOGLEDRIVE_FILESTORAGE_CLOUD_CLIENT_ID      |    |   |
| GOOGLEDRIVE_FILESTORAGE_CLOUD_CLIENT_SECRET      |    |   |
| ONEDRIVE_FILESTORAGE_CLOUD_CLIENT_ID      |    |   |
| ONEDRIVE_FILESTORAGE_CLOUD_CLIENT_SECRET      |    |   |
| SHAREPOINT_FILESTORAGE_CLOUD_CLIENT_ID      |    |   |
| SHAREPOINT_FILESTORAGE_CLOUD_CLIENT_SECRET      |    |   |
| DROPBOX_FILESTORAGE_CLOUD_CLIENT_ID      |    |   |
| DROPBOX_FILESTORAGE_CLOUD_CLIENT_SECRET      |    |   |
| BOX_FILESTORAGE_CLOUD_CLIENT_ID      |    |   |
| BOX_FILESTORAGE_CLOUD_CLIENT_SECRET      |    |   |
| KEAP_MARKETINGAUTOMATION_CLOUD_CLIENT_ID      |    |   |
| KEAP_MARKETINGAUTOMATION_CLOUD_CLIENT_SECRET      |    |   |
| MAILCHIMP_MARKETINGAUTOMATION_CLOUD_CLIENT_ID      |    |   |
| MAILCHIMP_MARKETINGAUTOMATION_CLOUD_CLIENT_SECRET      |    |   |
| KLAVIYO_TICKETING_CLOUD_CLIENT_ID      |    |   |
| KLAVIYO_TICKETING_CLOUD_CLIENT_SECRET      |    |   |
| NOTION_PRODUCTIVITY_CLOUD_CLIENT_ID      |    |   |
| NOTION_PRODUCTIVITY_CLOUD_CLIENT_SECRET      |    |   |
| SLACK_PRODUCTIVITY_CLOUD_CLIENT_ID      |    |   |
| SLACK_PRODUCTIVITY_CLOUD_CLIENT_SECRET      |    |   |
| GREENHOUSE_ATS_CLOUD_CLIENT_ID      |    |   |
| GREENHOUSE_ATS_CLOUD_CLIENT_SECRET      |    |   |
| JOBADDER_ATS_CLOUD_CLIENT_ID      |    |   |
| JOBADDER_ATS_CLOUD_CLIENT_SECRET      |    |   |
| LEVER_ATS_CLOUD_CLIENT_ID      |    |   |
| LEVER_ATS_CLOUD_CLIENT_SECRET      |    |   |
| SHOPIFY_ECOMMERCE_CLOUD_CLIENT_ID      |    |   |
| SHOPIFY_ECOMMERCE_CLOUD_CLIENT_SECRET      |    |   |
| SHOPIFY_ECOMMERCE_CLOUD_SUBDOMAIN      |    |   |
