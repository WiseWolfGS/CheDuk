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

# Stage 2: Build the 'cheduk-frontend' app
FROM deps AS builder
WORKDIR /app
# Copy the rest of the source code
COPY . .
RUN pnpm --filter cheduk-frontend build

# Stage 3: Production image
FROM nginx:stable-alpine
COPY --from=builder /app/cheduk-frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]