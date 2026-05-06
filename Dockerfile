FROM node:23-slim

ARG LATEST_COMMIT_HASH
ARG LATEST_COMMIT_MESSAGE

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV LATEST_COMMIT_HASH=$LATEST_COMMIT_HASH
ENV LATEST_COMMIT_MESSAGE=$LATEST_COMMIT_MESSAGE

RUN npm install -g pnpm

COPY . /app
WORKDIR /app

RUN addgroup --system --gid 1001 wos
RUN adduser --system --uid 1001 wos
RUN chown -R wos:wos /app
RUN chmod 755 /app

USER wos

EXPOSE 3000

CMD ["pnpm", "run", "start"]