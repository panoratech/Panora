# Run from repository root folder
# This will import integration tables from codebase

# CRM
grep '^|' ./packages/api/src/crm/README.md > docs/snippets/crm-catalog.mdx
grep '^|' ./packages/api/src/crm/contact/README.md > docs/snippets/crm-contact-catalog.mdx

# Ticketing
grep '^|' ./packages/api/src/ticketing/README.md > docs/snippets/ticketing-catalog.mdx

npx @mintlify/scraping@latest openapi-file openapi-with-code-samples.yaml -o objects
echo "Copy Done!"