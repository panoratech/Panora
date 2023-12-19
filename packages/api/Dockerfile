# run directly from the repo root directory
# docker build -f ./packages/api/Dockerfile .
FROM node:20-alpine AS base
# =======================================================================
FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update

# Set pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune api --docker

# resulat: full/, json/ pnpm-lock.yaml , pnpm-workspace.yaml
# =======================================================================
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
# Set pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .
#RUN pnpm turbo run build --filter=api...
#avoid pulling from db
RUN pnpm run build 

# ========================================================================
FROM base AS runner
WORKDIR /app

COPY --from=installer ./app .



ENV HUBSPOT_CLIENT_ID="$HUBSPOT_CLIENT_ID"
ENV HUBSPOT_CLIENT_SECRET="$HUBSPOT_CLIENT_SECRET"
ENV ZOHOCRM_CLIENT_ID="$ZOHOCRM_CLIENT_ID"
ENV ZOHOCRM_CLIENT_SECRET="$ZOHOCRM_CLIENT_SECRET"
ENV PIPEDRIVE_CLIENT_ID="$PIPEDRIVE_CLIENT_ID"
ENV PIPEDRIVE_CLIENT_SECRET="$PIPEDRIVE_CLIENT_SECRET"
ENV ZENDESK_CLIENT_ID="$ZENDESK_CLIENT_ID"
ENV ZENDESK_CLIENT_SECRET="$ZENDESK_CLIENT_SECRET"
ENV OAUTH_REDIRECT_BASE="$OAUTH_REDIRECT_BASE"

# Launching the backend 
# Maintain the root api folder as context (Breaking)
CMD cd /app/packages/api && node dist/src/main.js