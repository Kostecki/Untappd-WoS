FROM node:23-slim

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

RUN npm install -g pnpm

COPY . /app
COPY .env /app
WORKDIR /app

RUN addgroup --system --gid 1001 wos
RUN adduser --system --uid 1001 wos
RUN chown -R wos:wos /app
RUN chmod 755 /app

USER wos

EXPOSE 3000

CMD ["pnpm", "run", "start"]