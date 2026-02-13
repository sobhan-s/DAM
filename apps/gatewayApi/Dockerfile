FROM node:22.22.0-alpine AS builder

WORKDIR /app

RUN npm i -g pnpm

COPY pnpm-workspace.yml pnpm-lock.yaml package.json ../../

RUN pnpm install

COPY . .

RUN pnpm run build


# ---------- Runtime Stage ----------
FROM node:22.22.0-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8000

CMD ["npm", "run", "start"]