# -------- Stage 1: Builder --------
FROM node:18-alpine AS builder

WORKDIR /opt/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build 


# -------- Stage 2: Production --------
FROM node:18-alpine AS production

WORKDIR /opt/app

COPY --from=builder /opt/app/build ./build
COPY --from=builder /opt/app/node_modules ./node_modules
COPY --from=builder /opt/app/package.json ./package.json

COPY .env.development .env.development

EXPOSE 4000
CMD ["yarn", "start"]
