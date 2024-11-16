# run directly from the repo root directory
# docker build -f ./apps/magic-link/Dockerfile .
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
RUN pnpm add -g turbo@1.13.4
COPY . .
RUN turbo prune magic-link --docker
RUN ls -la ./out/full/apps/magic-link

# =======================================================================
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
# Set pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

ARG VITE_BACKEND_DOMAIN
ARG VITE_WEBAPP_DOMAIN

ENV VITE_BACKEND_DOMAIN="$VITE_BACKEND_DOMAIN"
ENV VITE_WEBAPP_DOMAIN="$VITE_WEBAPP_DOMAIN"

RUN corepack enable

WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build the project
COPY --from=builder ./app/out/full/ .
RUN pnpm turbo run build --filter=magic-link...

# ========================================================================
FROM nginx:1.27.2-alpine3.20-slim as runner

COPY --from=installer ./app/apps/magic-link/dist/ /usr/share/nginx/html
COPY apps/magic-link/nginx.conf /etc/nginx/conf.d/default.conf


EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]