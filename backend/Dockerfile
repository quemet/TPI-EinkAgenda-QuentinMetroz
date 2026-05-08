FROM node:22-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY package.json package-lock.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/swagger.yaml ./src/swagger.yaml

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

CMD [ "node", "dist/server.js" ]
