# Stage: monolith-builder
# Purpose: Uses the Rust image to build monolith
# Notes:
#  - Fine to leave extra here, as only the resulting binary is copied out
#FROM docker.io/rust:1.80-bullseye AS monolith-builder

#RUN set -eux && cargo install --locked monolith

# Stage: main-app
# Purpose: Compiles the frontend and
# Notes:
#  - Nothing extra should be left here.  All commands should cleanup
FROM node:18.18-bullseye-slim AS main-app

ARG DEBIAN_FRONTEND=noninteractive

ENV NEXT_PUBLIC_EMAIL_PROVIDER=true
ENV EMAIL_FROM=""
ENV EMAIL_SERVER=""

RUN mkdir /data

WORKDIR /data

COPY ./package.json ./yarn.lock ./playwright.config.ts ./

RUN --mount=type=cache,sharing=locked,target=/usr/local/share/.cache/yarn \
    set -eux && \
    yarn install --network-timeout 10000000

# Copy the compiled monolith binary from the builder stage
#COPY --from=monolith-builder /usr/local/cargo/bin/monolith /usr/local/bin/monolith

RUN apt-get update && apt-get install curl -y

# Copy the monolith binary from the github release directly
RUN DOWNLOAD_URL=$(curl -s https://api.github.com/repos/Y2Z/monolith/releases/latest \
    | grep browser_download_url \
    | grep monolith-gnu-linux-x86_64 \
    | cut -d '"' -f 4) \
    && curl -L --create-dirs -o /usr/local/bin/monolith "$DOWNLOAD_URL" \
    && chmod +x /usr/local/bin/monolith

RUN set -eux && \
    npx playwright install --with-deps chromium && \
    apt-get clean && \
    yarn cache clean

COPY . .

RUN yarn prisma generate && \
    yarn build

EXPOSE 3000

CMD yarn prisma migrate deploy && yarn start
