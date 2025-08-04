# Stage 1
FROM node:22-alpine AS builder

WORKDIR /build

COPY package*.json .
RUN npm install

COPY src src
COPY tsconfig.json .

RUN npm run build

# Stage 2
FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=builder build/package*.json .
COPY --from=builder build/dist dist
COPY --from=builder build/src/views src/views

RUN npm install --omit=dev

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system  --uid 1001 nodejs

USER nodejs

EXPOSE 4000

ENV PORT=4000

CMD [ "npm", "start" ]