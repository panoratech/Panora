# run directly from the repo root directory
# docker build -f ./apps/webapp/Dockerfile .
FROM node:20-alpine3.21 AS base
# =======================================================================
# Turbo: Prepare a standalone workspace for docker
FROM base AS builder
RUN apk add --no-cache libc6-compat openssl
RUN apk update

# Set pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
RUN pnpm add -g turbo@1.13.4
COPY . .
RUN turbo prune webapp --docker

#check content
RUN ls -la ./out/full/apps/webapp

# =======================================================================
# Install Deps and build project using PNPM
FROM base AS installer
RUN apk add --no-cache libc6-compat openssl
RUN apk update
# Set pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"


ARG NEXT_PUBLIC_DISTRIBUTION 
ARG NEXT_PUBLIC_BACKEND_DOMAIN
ARG NEXT_PUBLIC_MAGIC_LINK_DOMAIN
ARG NEXT_PUBLIC_WEBAPP_DOMAIN
ARG NEXT_PUBLIC_REDIRECT_WEBHOOK_INGRESS


ENV NEXT_PUBLIC_DISTRIBUTION="$NEXT_PUBLIC_DISTRIBUTION"
ENV NEXT_PUBLIC_BACKEND_DOMAIN="${NEXT_PUBLIC_BACKEND_DOMAIN}"
ENV NEXT_PUBLIC_MAGIC_LINK_DOMAIN="${NEXT_PUBLIC_MAGIC_LINK_DOMAIN}"
ENV NEXT_PUBLIC_WEBAPP_DOMAIN="${NEXT_PUBLIC_WEBAPP_DOMAIN}"
ENV NEXT_PUBLIC_REDIRECT_WEBHOOK_INGRESS="${NEXT_PUBLIC_REDIRECT_WEBHOOK_INGRESS}"

RUN corepack enable

WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .

# 🔴🔴🔴 possible bug due to missing dependencies here, when using "standalone mode"
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml

# install dependencies
RUN pnpm install --shamefully-hoist

# Build the project
COPY --from=builder ./app/out/full/ .
RUN pnpm run build

CMD cd /app/apps/webapp/ && pnpm run start