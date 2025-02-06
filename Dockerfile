FROM node:20-alpine as builder

ENV NODE_ENV build

RUN apk --no-cache add protoc protobuf-dev

USER node
WORKDIR /home/node

COPY --chown=node:node . .

RUN yarn install --frozen-lockfile \
    && ./gen-proto-schema.sh \
    && yarn build

FROM node:20-alpine

ENV NODE_ENV=production

RUN apk --no-cache add postgresql-client

USER node
WORKDIR /home/node

COPY --from=builder /home/node/package*.json /home/node/
COPY --from=builder /home/node/node_modules/ /home/node/node_modules/
COPY --from=builder /home/node/dist/ /home/node/dist/

CMD ["node", "dist/src/main.js"]
