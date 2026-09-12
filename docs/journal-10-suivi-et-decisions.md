# Journal de tâche — 10

TÂCHE :
Prise en compte du travail réalisé en parallèle (Phases 8, 10, 11 par une autre session) et réponse aux points laissés en suspens dans journal-08 et journal-09.

VÉRIFICATIONS FAITES AVANT DE CONTINUER :
- `npm install` + `npx tsc --noEmit` + `npx vite build` côté client : OK, aucune erreur.
- `npm install` + `npx tsc --noEmit` côté serveur (avec le schéma Prisma étendu `accountXp`/`expeditionsCompleted`) : OK.
- Relecture manuelle de CharacterSelectScreen.ts, Enemy.ts, expedition.ts, progressionService.ts : cohérent avec le reste du projet, rien à corriger.

DÉCISIONS (réponses aux points en suspens) :
1. Phase 9 (Boss) sautée deux fois signalée → CONFIRMÉ COMME OUBLI À CORRIGER, pas un choix assumé.
   On l'implémente maintenant, avant toute autre nouvelle fonctionnalité, pour ne pas creuser l'écart
   avec l'ordre de phases de la section 25 du GDD.
2. Personnages sans compétence/ultime/passif propre (stats de base uniquement) → CONFIRMÉ comme
   simplification acceptable pour l'instant (cohérent avec la section 26 : avancer petit à petit).
   Les compétences distinctes seront ajoutées avant la Phase 12 (multijoueur) si le jeu se sent
   trop "générique" une fois testé — à revoir après avoir joué.

SUITE :
Implémentation de la Phase 9 — un boss en fin d'expédition, avec plusieurs attaques et phases,
conformément aux specs déjà préparées par Gemini dans docs/journal-04-phase9-boss-da.md
(Automate Surchauffé, Série X-88).
