# OUTPOST — Revue d'architecture Phase 7

## Périmètre
Relecture du ZIP actuel : Prisma, authentification, route Base et démarrage Express.

## 🔴 Priorité haute

### 1. Secret JWT de secours dangereux
Fichier : `/server/src/auth/jwt.ts`

Le code utilise un secret par défaut (`dev-secret-change-me`) si `JWT_SECRET` n'existe pas.

Décision :
- En développement local, ce fallback peut rester temporairement.
- Avant déploiement, le serveur doit refuser de démarrer si `JWT_SECRET` est absent ou trop faible.
- Ne jamais publier le vrai secret dans Git.

### 2. CORS ouvert
Fichier : `/server/src/index.ts`

`cors()` autorise actuellement toutes les origines.

Décision :
- acceptable pour le prototype local ;
- avant production, limiter `origin` au domaine du client.

### 3. Upgrade de base non atomique
Fichier : `/server/src/api/base.ts`

La route :
1. lit le joueur ;
2. vérifie l'or ;
3. fait un `update` avec la valeur calculée.

Deux requêtes simultanées pourraient théoriquement utiliser le même ancien solde.

Décision :
- remplacer plus tard par une opération transactionnelle/conditionnelle côté serveur ;
- ne pas considérer la vérification client comme une protection.

## 🟠 Priorité moyenne

### 4. Validation des entrées
L'authentification valide la longueur du pseudo et du mot de passe, mais :
- l'email est seulement vérifié avec `includes("@")` ;
- aucune normalisation claire de username/email n'est définie ;
- il manque une limite de taille générale du JSON.

À faire avant production :
- normaliser email/pseudo ;
- utiliser une validation de schéma ;
- limiter la taille du body.

### 5. Rate limiting
Les routes `/register` et `/login` n'ont pas encore de rate limiting.

À ajouter avant une vraie mise en ligne :
- limitation des tentatives de connexion ;
- limitation des inscriptions ;
- éventuellement protection anti-abus.

### 6. Erreurs serveur
Les routes Prisma n'ont pas de gestion centralisée des exceptions.

À ajouter :
- middleware d'erreur Express ;
- réponses génériques côté client ;
- logs serveur sans données sensibles.

## 🟢 Points corrects

- Mot de passe hashé avec bcrypt.
- Token vérifié côté serveur.
- Routes de base protégées par `requireAuth`.
- Le client ne décide pas du nouveau niveau ou du coût.
- Le serveur récupère l'utilisateur via l'identifiant contenu dans le token.
- Le schéma Prisma garde les données de progression côté serveur.

## Schéma Prisma : constat
Le modèle `User` reste volontairement simple :
- compte ;
- niveau ;
- QG ;
- or.

Pour la suite, éviter d'ajouter toutes les ressources/personnages directement dans `User`. Prévoir des tables dédiées, par exemple :
- `PlayerResource`
- `Building`
- `Character`
- `PlayerCharacter`
- `Inventory`
- `GachaPity`

Cela permettra de faire évoluer le jeu sans transformer `User` en énorme objet de progression.

## Conclusion
L'architecture est suffisante pour continuer le prototype.

Avant une phase multijoueur ou un déploiement public, les priorités sont :
1. JWT secret obligatoire en production ;
2. CORS restreint ;
3. upgrade atomique/transactionnel ;
4. validation structurée ;
5. rate limiting ;
6. gestion centralisée des erreurs.

Aucune modification du code source n'est proposée ici : ce document sert à Claude et au développeur humain.
