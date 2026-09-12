# Guide de déploiement — Phase 19

Ce guide explique comment mettre le jeu en ligne. C'est la première phase où des décisions et
actions de votre côté sont nécessaires (créer des comptes, choisir un hébergeur) — je ne peux
pas la faire entièrement à votre place, mais tout le code/config nécessaire est prêt.

## 1. Vue d'ensemble de l'architecture à déployer

Le jeu a 2 parties à héberger séparément :

- **Le serveur** (`/server`) : Node.js + Express + Colyseus (WebSocket). A besoin d'un hébergeur
  qui garde un **processus persistant** (pas de "serverless pur" comme les fonctions Vercel,
  qui ne supportent pas les connexions WebSocket de longue durée nécessaires à Colyseus).
- **Le client** (`/client`) : fichiers statiques (HTML/JS/CSS) générés par `npm run build`.
  N'importe quel hébergeur de sites statiques convient.

## 2. Choisir un hébergeur pour le serveur

Options adaptées à un processus persistant + WebSocket, avec un tier gratuit ou pas cher pour
démarrer (comme demandé section 19 du GDD) :

- **Railway** (railway.app) — simple, détecte automatiquement Node.js, PostgreSQL intégré.
- **Fly.io** (fly.io) — un peu plus technique (utilise le Dockerfile fourni), bon tier gratuit.
- **Render** (render.com) — simple aussi, PostgreSQL disponible en add-on.

N'importe lequel des trois convient pour un prototype. Railway est probablement le plus rapide
à prendre en main si vous n'avez jamais déployé de serveur Node.js.

## 3. Base de données : passer de SQLite à PostgreSQL

**Important** : SQLite (utilisé en développement) ne convient PAS à la plupart des hébergeurs
cloud, car leur système de fichiers est souvent réinitialisé à chaque redéploiement (vous
perdriez toutes les données des joueurs). Il faut passer à PostgreSQL pour la production —
c'était d'ailleurs le choix d'origine recommandé (voir la toute première réponse sur
l'architecture).

Étapes :

1. Créez une base PostgreSQL chez votre hébergeur (Railway/Render en proposent une intégrée en
   un clic ; Fly.io a `fly postgres create`).
2. Récupérez l'URL de connexion (`DATABASE_URL`).
3. Dans `/server/prisma/schema.prisma`, changez temporairement le datasource pour la prod :
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
   (Le fichier actuel utilise SQLite avec un chemin fixe, adapté au développement local — voir
   les commentaires dans le fichier.)
4. Lancez `npx prisma migrate deploy` (pas `migrate dev`) contre cette nouvelle base pour créer
   toutes les tables à partir des migrations déjà existantes.

## 4. Variables d'environnement du serveur

Copiez `/server/.env.production.example` en `.env` sur votre hébergeur (ou renseignez les
variables directement dans son interface, ce qui est plus courant et plus sûr) :

- `DATABASE_URL` — l'URL PostgreSQL de l'étape 3.
- `JWT_SECRET` — une vraie valeur aléatoire et secrète, différente de celle de développement.
- `PORT` — généralement fourni automatiquement par l'hébergeur.
- `ALLOWED_ORIGINS` — le(s) domaine(s) où le client sera hébergé (étape 6), pour que CORS
  n'autorise que votre propre site (voir le correctif de sécurité de cette même session).

## 5. Déployer le serveur

Le `/server/Dockerfile` fourni fonctionne pour Railway, Fly.io et Render (tous supportent le
déploiement par Dockerfile). Si votre hébergeur préfère détecter Node.js automatiquement
(Railway le fait bien), vous pouvez aussi le laisser faire sans Dockerfile — il utilisera
`npm install` puis `npm run build` puis `npm start` automatiquement grâce à `package.json`.

Après le premier déploiement, vérifiez que `https://votre-serveur.exemple.com/health` répond
bien `{"status":"ok",...}`.

## 6. Choisir un hébergeur pour le client (statique)

- **Vercel** (vercel.com) ou **Netlify** (netlify.com) — les deux ont un tier gratuit généreux
  et détectent automatiquement un projet Vite.

Étapes :

1. Copiez `/client/.env.production.example` en `.env.production`, avec les vraies URLs de votre
   serveur déployé (étape 5).
2. `npm run build` génère `/client/dist`.
3. Déployez ce dossier (Vercel/Netlify le font automatiquement si vous connectez votre dépôt Git
   et configurez la commande de build sur `npm run build` et le dossier de sortie sur `dist`).

## 7. Vérification finale

- Ouvrez le client déployé, inscrivez-vous, jouez une expédition complète.
- Testez le multijoueur avec 2 appareils/navigateurs différents.
- Vérifiez que `/health` et les routes API répondent bien depuis le domaine de production (pas
  d'erreur CORS dans la console du navigateur).

## Limites connues à ce stade (pour la suite, pas bloquant pour un premier déploiement)

- Pas de nom de domaine personnalisé configuré par défaut — les hébergeurs donnent une URL
  gratuite (`*.railway.app`, `*.vercel.app`, etc.), suffisante pour commencer.
- Pas de CI/CD automatique (chaque déploiement est manuel ou déclenché par un push Git selon
  la configuration de votre hébergeur).
- Le WebSocket de Colyseus n'a pas de restriction d'origine configurée (contrairement aux
  routes REST, qui sont maintenant protégées par `ALLOWED_ORIGINS`) — acceptable pour un
  prototype, à durcir avant une vraie ouverture publique.
