# Production image for Forge (and any Docker host): a plain Node Remix server.
# Debian-based on purpose: some build tooling ships glibc-only binaries that do not run on Alpine.
FROM node:22-bookworm-slim
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["pnpm", "start"]
