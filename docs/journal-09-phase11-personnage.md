# Journal de tâche — 09

TÂCHE :
Phase 11 — premier personnage supplémentaire (section 11 du GDD), suite de la Phase 10.
Ajout d'un second personnage jouable avec un style de jeu différent, et de l'étape « choix
du personnage » qui manquait dans la boucle principale (section 2 : COMPTE → BASE →
CHOIX DU PERSONNAGE → EXPÉDITION → ...).

RAPPEL DU POINT EN SUSPENS (posé au journal 08, toujours pas confirmé) :
La Phase 9 (Boss) n'est toujours pas codée — seules les specs existent
(docs/journal-04-phase9-boss-da.md). J'ai continué sur votre confirmation, mais ça reste à
faire : sans boss, aucune expédition ne peut réellement se terminer par un combat de boss
comme le prévoit la section 10 du GDD. Je le note ici pour que ça ne se perde pas.

FICHIERS MODIFIÉS / CRÉÉS :
- /client/src/entities/characterTypes.ts (nouveau — définitions des personnages, data-driven comme enemyTypes.ts)
- /client/src/entities/Player.ts (modifié — les stats de départ viennent maintenant d'une CharacterDefinition au lieu d'être fixes)
- /client/src/scenes/CharacterSelectScreen.ts (nouveau — écran de choix entre Base et Expédition)
- /client/src/scenes/ExpeditionScene.ts (modifié — reçoit un `characterId`, HUD affiche le nom du personnage)
- /client/src/main.ts (modifié — la boucle passe maintenant par l'écran de choix de personnage)

CE QUI A ÉTÉ AJOUTÉ :
- Deuxième personnage jouable : le Colosse (Tank — plus de PV, plus lent, dégâts et cadence
  de tir plus faibles), à côté de l'Éclaireuse (DPS à distance — les stats du personnage MVP
  d'origine, Phase 7, inchangées).
- Écran de sélection affichant les deux personnages (nom, rôle, description, stats de base),
  inséré dans la boucle juste après la base et avant l'expédition, conformément à la section 2
  du GDD (cette étape manquait complètement avant cette phase).
- Le HUD en expédition affiche maintenant le nom du personnage utilisé.

DÉCISION / SIMPLIFICATION ASSUMÉE (à confirmer) :
La section 11 du GDD demande à chaque personnage : statistiques, arme, attaque, compétence,
compétence ultime, passif, niveau, équipement. Pour cette phase, seules les STATISTIQUES DE
BASE diffèrent (PV, dégâts, vitesse, cadence de tir) — le Colosse n'a ni compétence, ni ultime,
ni passif propre ; il réutilise exactement le même système de tir automatique que l'Éclaireuse,
juste avec des chiffres différents. C'est un choix pour rester dans l'esprit de la section 26
(avancer petit à petit) plutôt qu'un oubli, mais ça mérite votre confirmation avant la Phase 12 :
si vous voulez des compétences distinctes dès maintenant, il faudra une itération dédiée avant de
passer au multijoueur.

Autre simplification : les deux personnages sont débloqués par défaut, sans aucune notion de
« personnage possédé ». Il n'y a pas encore de système de recrutement (Phase 13) ni de
vérification côté serveur qu'un joueur a le droit d'utiliser tel personnage — à corriger quand
le recrutement arrivera, sinon un joueur pourrait en théorie forcer n'importe quel `characterId`
côté client sans que le serveur s'en aperçoive (pas grave aujourd'hui car ça n'affecte aucune
récompense serveur, mais à garder en tête).

CE QUI RESTE À FAIRE :
- Boss (Phase 9, toujours en attente — voir rappel ci-dessus).
- Compétences/ultime/passif par personnage (voir décision ci-dessus).
- Vrais visuels par personnage (actuellement deux cercles de couleurs différentes, en
  attendant la DA Neo-Retro Vectoriel).
- Vérification serveur du personnage utilisé, une fois le recrutement en place (Phase 13).
- Équilibrage des stats du Colosse vs Éclaireuse — première estimation, à tester en jouant.

PROBLÈMES CONNUS / ERREURS RENCONTRÉES :
- Aucune erreur de code introduite par cette phase : relecture manuelle ligne par ligne de
  tous les fichiers touchés, et `npx tsc --noEmit` ne remonte que les erreurs déjà connues et
  documentées depuis la Phase 6 (« Cannot find module 'pixi.js' ») — dues à l'absence d'accès
  réseau dans cet environnement pour installer les dépendances (`npm install` échoue avec une
  erreur 403 sur le registre npm), pas à du code cassé. Ces 4 lignes d'erreur (Enemy.ts,
  Player.ts, Projectile.ts, ExpeditionScene.ts) sont identiques avant et après cette phase.
- Aucun changement de schéma Prisma cette phase (le choix de personnage reste 100% côté
  client pour l'instant, voir la simplification notée plus haut) — pas de migration nécessaire.
- Le flux complet (base → choix du personnage → expédition avec les bonnes stats selon le
  personnage choisi → retour base) n'a pas pu être testé en conditions réelles ici faute de
  pouvoir lancer le jeu (mêmes restrictions réseau). À tester chez vous.

TESTS EFFECTUÉS :
- Relecture manuelle de characterTypes.ts, Player.ts, CharacterSelectScreen.ts,
  ExpeditionScene.ts et main.ts (cohérence des types, des imports, du flux d'appel).
- `npx tsc --noEmit` côté client : mêmes 4 erreurs pré-existantes liées à pixi.js non
  installable, aucune nouvelle erreur.

À FAIRE CHEZ VOUS AVANT DE JOUER :
1. `npm install` côté client (aucun changement de dépendances, juste au cas où ce ne soit pas
   déjà fait).
2. Lancer le client, se connecter, aller à la base, cliquer sur « Partir en expédition » :
   l'écran de choix de personnage doit apparaître avant le jeu.
3. Vérifier que le Colosse a bien plus de PV et se déplace plus lentement que l'Éclaireuse en jeu.
