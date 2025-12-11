# -----------------------------
# 1. Base builder image
# -----------------------------
FROM node:18-alpine AS builder

WORKDIR /opt/app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

# Create required directories
RUN mkdir -p uploads logs

RUN yarn build


# -----------------------------
# 2. Production image (smaller)
# -----------------------------
FROM node:18-alpine AS production

WORKDIR /opt/app

# Only copy built output + node_modules + needed files
COPY --from=builder /opt/app/dist ./dist
COPY --from=builder /opt/app/node_modules ./node_modules
COPY --from=builder /opt/app/package.json ./package.json

# Create runtime directories (for mounted volumes)
RUN mkdir -p uploads logs

EXPOSE 4000

CMD ["yarn", "start"]
