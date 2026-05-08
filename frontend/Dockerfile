FROM node:22-alpine as builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY tsconfig.json vite.config.ts index.html tsconfig.node.json tsconfig.app.json tsconfig.vitest.json env.d.ts ./
COPY src ./src

RUN mkdir -p src/__test__

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
