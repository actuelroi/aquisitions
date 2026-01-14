# --------------------
# Base image
# --------------------
FROM node:18-alpine AS base

WORKDIR /app

# Install openssl for Neon (SSL required)
RUN apk add --no-cache openssl

# --------------------
# Dependencies stage
# --------------------
FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

# --------------------
# Build stage (if you have TS / build step)
# --------------------
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Uncomment if you use TypeScript or build step
# RUN npm run build

# --------------------
# Production image
# --------------------
FROM base AS production

ENV NODE_ENV=production

# Copy only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy app source (or dist if built)
COPY --from=build /app ./

# Use built-in non-root node user
USER node

EXPOSE 3000

CMD ["node", "index.js"]
# or: CMD ["npm", "start"]
