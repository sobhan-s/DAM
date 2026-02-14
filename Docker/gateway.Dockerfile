
FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

COPY apps ./apps
COPY packages ./packages

RUN pnpm install --frozen-lockfile

RUN pnpm --filter gatewayApi... build

FROM node:22-alpine AS runtime

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

COPY --from=builder /app/apps/gatewayApi ./apps/gatewayApi
COPY --from=builder /app/packages ./packages

RUN pnpm install --prod --frozen-lockfile

EXPOSE 8000

CMD ["pnpm", "--filter", "gatewayApi", "start"]
