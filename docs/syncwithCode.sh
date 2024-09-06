# Run from repository root folder
# This will import integration tables from codebase

# CRM
grep '^|' ../packages/api/src/crm/README.md > snippets/crm-catalog.mdx
grep '^|' ../packages/api/src/crm/contact/README.md > snippets/crm-contact-catalog.mdx

# Ticketing
grep '^|' ../packages/api/src/ticketing/README.md > snippets/ticketing-catalog.mdx

#ATS 
grep '^|' ../packages/api/src/ats/README.md > snippets/ats-catalog.mdx

# File Storage
grep '^|' ../packages/api/src/filestorage/README.md > snippets/filestorage-catalog.mdx

# Ecommerce
grep '^|' ../packages/api/src/ecommerce/README.md > snippets/ecommerce-catalog.mdx

npx @mintlify/scraping@latest openapi-file openapi-with-code-samples.yaml -o objects

echo "Copy Done!"