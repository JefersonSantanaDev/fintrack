FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

FROM node:20-alpine AS dev
WORKDIR /app

ENV NODE_ENV=development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

EXPOSE 3000

CMD ["sh", "-c", "npm run prisma:generate && npx prisma migrate deploy && npm run start"]
