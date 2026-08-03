FROM node:26-slim

ARG LATEST_COMMIT_HASH
ARG LATEST_COMMIT_MESSAGE

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV LATEST_COMMIT_HASH=$LATEST_COMMIT_HASH
ENV LATEST_COMMIT_MESSAGE=$LATEST_COMMIT_MESSAGE
ENV CI=true

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
RUN pnpm install --frozen-lockfile --prod

COPY . /app

RUN addgroup --system --gid 1001 wos
RUN adduser --system --uid 1001 wos
RUN chown -R wos:wos /app
RUN chmod 755 /app

USER wos

EXPOSE 3000

CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]