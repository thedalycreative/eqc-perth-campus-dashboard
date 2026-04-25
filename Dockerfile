# syntax=docker/dockerfile:1.7

# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Cloud Run sends SIGTERM; tini handles it cleanly.
RUN apk add --no-cache tini

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy built artefacts and the server entrypoint.
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/server.ts ./server.ts

# Cloud Run injects PORT (default 8080). Host should listen on 0.0.0.0:$PORT.
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npx", "tsx", "server.ts"]
