FROM alpine:3.24.2@sha256:294b683cb724975bec92580e1e685676bd4b50bda910ddb8c51d4cabeaec77e6
ENV NODE_ENV=development

RUN apk add --update --no-cache curl npm && \
addgroup -S node && adduser -S node -G node && \
mkdir /uploads && chown node:node /uploads

USER node
WORKDIR /app

COPY --chown=node:node package*.json .
RUN npm ci
COPY --chown=node:node . .

HEALTHCHECK --start-period=30s \
    CMD curl -f http://localhost:3000/healthz || exit 1

EXPOSE 3000
CMD ["npm", "start"]