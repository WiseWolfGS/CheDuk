# Stage 1: Install all monorepo dependencies
FROM node:20-alpine AS deps
WORKDIR /app
RUN npm i -g pnpm

# Copy only files needed for 'pnpm install' to leverage Docker cache
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY cheduk-frontend/package.json ./cheduk-frontend/
COPY remix-app/package.json ./remix-app/
COPY packages/core-logic/package.json ./packages/core-logic/
COPY packages/geometry-hex/package.json ./packages/geometry-hex/

RUN pnpm install --frozen-lockfile

# Stage 2: Build the 'remix-app'
FROM deps AS builder
WORKDIR /app
# Copy the rest of the source code
COPY . .
RUN pnpm --filter remix-app build

# Stage 3: Production image
FROM node:20-alpine
WORKDIR /app

# Copy built app and necessary package files
COPY --from=builder /app/remix-app/build ./build
COPY --from=builder /app/remix-app/public ./public
COPY --from=builder /app/remix-app/package.json ./package.json

# Install production dependencies only
RUN npm i -g pnpm && pnpm install --prod

EXPOSE 3000
CMD ["pnpm", "start"]