# curl -o _snippets/sdk-typescript-readme.mdx -LJO https://raw.githubusercontent.com/panoratech/typescript-sdk/main/README.md
# curl -o _snippets/sdk-java-readme.mdx -LJO https://raw.githubusercontent.com/panoratech/java-sdk/main/README.md
# curl -o _snippets/sdk-python-readme.mdx -LJO https://raw.githubusercontent.com/panoratech/python-sdk/main/README.md


npx @mintlify/scraping@latest openapi-file https://raw.githubusercontent.com/panoratech/Panora/main/packages/api/swagger/swagger-spec.json -o api-reference

find . -type f -name "*.mdx" -exec bash -c 'if [[ "${1#./}" == *"api-reference"* ]]; then echo "${1#./}"; fi' _ {} \; | sed 's/\.mdx$//' | jq -sR '[split("\n")[:-1]]'
