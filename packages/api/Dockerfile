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
WORKDIR /app/packages/api 

# # # # # # # # # # # # 
# Launching the backend 
# # # # # # # # # # # # 
# DEV: Maintain the /app/packages/api folder as context (Breaking)
# # # # # # # # # # # # 
CMD node dist/src/main.js

# # # # # # # # # # # # 
# Production: Injects env vars via Doppler - DOPPLER_TOKEN variable must be set
# Install Doppler CLI
# RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
#     echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
#     apk add doppler
# CMD doppler run --command="node dist/src/main.js"