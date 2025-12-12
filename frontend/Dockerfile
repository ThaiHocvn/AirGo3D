# -------- Stage 1: Builder --------
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build  


# -------- Stage 2: Production --------
FROM node:18-alpine AS production

WORKDIR /app

COPY --from=builder /app/build ./build


RUN yarn global add serve

EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
