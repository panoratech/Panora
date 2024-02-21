# run directly from the repo root directory
# docker build -f ./apps/webapp/Dockerfile .
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
RUN turbo prune webapp --docker
RUN ls -la ./out/full/apps/webapp

# =======================================================================
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
# Set pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

ARG VITE_BACKEND_DOMAIN
ARG VITE_FRONTEND_DOMAIN
ARG VITE_STYTCH_TOKEN
ENV VITE_BACKEND_DOMAIN="$VITE_BACKEND_DOMAIN"
ENV VITE_FRONTEND_DOMAIN="$VITE_FRONTEND_DOMAIN"
ENV VITE_STYTCH_TOKEN="$VITE_STYTCH_TOKEN"
RUN corepack enable

WORKDIR /app

# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install

# Build the project
COPY --from=builder ./app/out/full/ .
RUN pnpm turbo run build --filter=webapp...

# ========================================================================
FROM nginx:stable-alpine as runner

#ARG VITE_BACKEND_DOMAIN
#ARG VITE_FRONTEND_DOMAIN
#ENV VITE_BACKEND_DOMAIN="$VITE_BACKEND_DOMAIN"
#ENV VITE_FRONTEND_DOMAIN="$VITE_FRONTEND_DOMAIN"
COPY --from=installer ./app/apps/webapp/dist/ /usr/share/nginx/html

RUN echo "***********************"
RUN cat /etc/nginx/conf.d/default.conf
RUN echo "***********************"

COPY apps/webapp/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]