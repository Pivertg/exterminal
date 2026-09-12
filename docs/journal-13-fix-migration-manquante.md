# Journal de tâche — 13

TÂCHE :
Correction rapide — la Phase 10 (progression : accountXp, expeditionsCompleted) avait modifié
le schéma Prisma sans qu'aucune migration n'ait jamais été générée (la session concernée
n'avait pas accès réseau pour exécuter `prisma migrate dev`). Résultat chez l'utilisateur :
erreur `PrismaClientKnownRequestError` — colonne `accountXp` inexistante dans la base locale.

RÉSOLUTION :
Pas de changement de code nécessaire, juste une migration à générer côté utilisateur :
`npx prisma migrate dev --name add-progression`

LEÇON POUR LA SUITE :
Avant d'adopter le travail d'une session parallèle qui a modifié `schema.prisma` sans pouvoir
exécuter de vraie migration, vérifier systématiquement le dossier `prisma/migrations/` pour
repérer ce genre de décalage avant de livrer, plutôt que de le découvrir via une erreur
utilisateur après coup.
