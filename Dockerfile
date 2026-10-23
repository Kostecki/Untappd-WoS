# Same Node version as CI (.github/actions/setup/action.yml)
FROM node:26.12.1-slim

ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
ENV CI=true

WORKDIR /app

# pnpm at the version in package.json's packageManager field
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /app/
RUN npm install -g "$(node -p "require('./package.json').packageManager.split('+')[0]")" \
	&& pnpm install --frozen-lockfile --prod

# The app (built in CI) is read-only to the app user
COPY . /app

RUN addgroup --system --gid 1001 wos \
	&& adduser --system --uid 1001 wos

# Temporary venues are stored here; mount a volume on it (see README). It must
# exist in the image, owned by wos, so a named volume inherits the ownership.
ENV DATA_DIR=/app/data
RUN mkdir -p /app/data && chown wos:wos /app/data

USER wos

EXPOSE 3000

# Last, as these change on every commit and would invalidate the layers above
ARG LATEST_COMMIT_HASH
ARG LATEST_COMMIT_MESSAGE
ENV LATEST_COMMIT_HASH=$LATEST_COMMIT_HASH
ENV LATEST_COMMIT_MESSAGE=$LATEST_COMMIT_MESSAGE

CMD ["./node_modules/.bin/react-router-serve", "./build/server/index.js"]
