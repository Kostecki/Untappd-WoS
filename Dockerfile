FROM node:18-alpine3.15 AS builder
ENV NODE_ENV production

WORKDIR /app

COPY package.json .
RUN npm install --production

COPY . .

RUN --mount=type=secret,id=CLIENT_ID \
  --mount=type=secret,id=CLIENT_SECRET \
  export CLIENT_ID=$(cat /run/secrets/CLIENT_ID) && \
  export CLIENT_SECRET=$(cat /run/secrets/CLIENT_SECRET)

RUN npm run build

FROM nginx:1.21.0-alpine as production
ENV NODE_ENV production

COPY --from=builder /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]