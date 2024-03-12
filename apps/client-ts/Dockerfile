# run directly from the repo root directory
# docker build -f ./apps/client-ts/Dockerfile .
FROM node:20-alpine AS base
# =======================================================================
# Turbo: Prepare a standalone workspace for docker
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
RUN turbo prune client-ts --docker

#check content
RUN ls -la ./out/full/apps/client-ts

# =======================================================================
# Install Deps and build project using PNPM
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
# Set pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"


ARG NEXT_PUBLIC_STYTCH_PROJECT_ID
ARG NEXT_PUBLIC_STYTCH_SECRET
ARG NEXT_PUBLIC_STYTCH_PROJECT_ENV
ARG NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN
ARG NEXT_PUBLIC_DISTRIBUTION 
ARG NEXT_PUBLIC_BACKEND_DOMAIN

ENV NEXT_PUBLIC_STYTCH_PROJECT_ID="$NEXT_PUBLIC_STYTCH_PROJECT_ID"
ENV NEXT_PUBLIC_STYTCH_SECRET="$NEXT_PUBLIC_STYTCH_SECRET"
ENV NEXT_PUBLIC_STYTCH_PROJECT_ENV="$NEXT_PUBLIC_STYTCH_PROJECT_ENV"
ENV NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN="$NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN"
ENV NEXT_PUBLIC_DISTRIBUTION="$NEXT_PUBLIC_DISTRIBUTION"
ENV NEXT_PUBLIC_BACKEND_DOMAIN="${NEXT_PUBLIC_BACKEND_DOMAIN}"

RUN corepack enable

WORKDIR /app

# Tweak in case of symlink issue
#ARG node-linker="hoisted"
#ARG package-import-method="copy"
#ARG symlink="false"

RUN ls -la 

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

# check content
#RUN ls -la /app/apps/client-ts/
#RUN ls -la /app/apps/client-ts/.next/

CMD cd /app/apps/client-ts/ && pnpm run start

#RUN cd /app/apps/client-ts && node .next/standalone/server.js
#RUN ls -la /app/apps/client-ts/.next/standalone

# # Node.js server - serving dynamic content
# # # ========================================================================
# FROM node:20-alpine AS runner
# WORKDIR /app

# # set hostname to localhost
# ENV HOSTNAME "0.0.0.0"
# ENV PORT 3000

# # Import Standalone files
# COPY --from=installer ./app/apps/client-ts/public ./public
# COPY --from=installer ./app/apps/client-ts/.next/static ./.next/static
# COPY --from=installer ./app/apps/client-ts/.next/standalone ./

# RUN ls -a ./


# # Expose port and run
# EXPOSE 3000
# CMD ["node", "server.js"]


# # For serving static content - some nextjs features will be lost
# # ========================================================================
# FROM nginx:stable-alpine as runner

# #ARG VITE_BACKEND_DOMAIN
# #ARG VITE_FRONTEND_DOMAIN
# #ENV VITE_BACKEND_DOMAIN="$VITE_BACKEND_DOMAIN"
# #ENV VITE_FRONTEND_DOMAIN="$VITE_FRONTEND_DOMAIN"
# COPY --from=installer ./app/apps/client-ts/dist/standalone/ /usr/share/nginx/html
# RUN ls -l /usr/share/nginx/html/

# RUN echo "***********************"
# RUN cat /etc/nginx/conf.d/default.conf
# RUN echo "***********************"

# COPY apps/client-ts/nginx.conf /etc/nginx/conf.d/default.conf

# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]