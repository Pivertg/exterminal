# Build multi-étapes : on compile le TS, puis on ne garde que le nécessaire pour tourner.

FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma
RUN npm install --omit=dev
RUN npx prisma generate
COPY --from=build /app/dist ./dist

EXPOSE 3000

# En production, exécuter les migrations au démarrage garantit que la base est toujours à jour
# avec le schéma du code déployé (voir DEPLOYMENT.md pour le détail).
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
