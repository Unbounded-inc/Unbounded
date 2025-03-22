# Stage 1: Build the app
FROM node:18-alpine AS builder

# Enable corepack so we can use pnpm
RUN corepack enable

WORKDIR /app

# Copy everything and install dependencies
COPY . .

RUN pnpm install
RUN pnpm run build

# Stage 2: Serve the app with a static server
FROM node:18-alpine

# Install serve
RUN npm install -g serve

WORKDIR /app

# Copy only the build output
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
