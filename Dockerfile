FROM node:20.8 AS build
ARG OIDC_AUTHORITY
ARG OIDC_CLIENT_ID
ENV REACT_APP_OIDC_AUTHORITY=${OIDC_AUTHORITY}
ENV REACT_APP_OIDC_CLIENT_ID=${OIDC_CLIENT_ID}
COPY . /tmp/build
WORKDIR /tmp/build
RUN ls
RUN npm install -g pnpm meta @angular/cli
RUN pnpm install
RUN pnpm run build

FROM caddy:2.4.6-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /tmp/build/build /srv
