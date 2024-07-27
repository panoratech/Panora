# run directly from the repo root directory
# docker build -f ./docs/Dockerfile .
FROM node:20-alpine AS base

# Set pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
RUN pnpm add -g mintlify
COPY ./docs .

# Documentation is served on port 3000.
EXPOSE 3000

# Run Documentation
CMD mintlify dev