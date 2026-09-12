# Journal de bord - Phase 9 : Spécifications Boss & Direction Artistique

## 1. Concept du Boss (Phase 9)
- **Nom** : Automate Surchauffé (Série X-88)
- **Rôle** : Boss de la Zone 1 (Laboratoire / Ruines industrielles)
- **Mécaniques principales** :
  - Phase 1 (100% - 50% PV) : Balayage Laser (esquive circulaire), Salve de Mortiers (zones au sol DoT), Choc Fracassant (AOE de zone).
  - Phase 2 (50% - 0% PV) : Vitesse +20%, Mode Ventilateur (aspiration des joueurs + orbes de chaleur), Surcharge Électrique (pylônes à détruire en solo, lien de charge en multi).

## 2. Choix Validé pour la Direction Artistique
- **Piste sélectionnée** : Option A — Neo-Retro Vectoriel.
- **Style visuel** : Aplats de couleurs dynamiques, silhouettes marquées (*outlines* épais), décors épurés à fort contraste.
- **Raison du choix** : Rendu fluide sous Canvas/WebGL, lisibilité maximale des *telegraphs* d'attaque, production rapide des *sprite sheets*.

## 3. Règle de Coordination
- Code rédigé exclusivement par le développeur principal.
- ChatGPT/Gemini utilisés uniquement pour le design, le QA, la relecture et la recherche.

## 4. Statut
Document de conception uniquement (Phase 9, pas encore atteinte dans le développement). Les types TypeScript correspondants ont été ajoutés à `/shared/types/index.ts` pour que l'architecture future n'ait pas à être repensée, mais aucun code de gameplay du boss n'est implémenté à ce stade — on en est à la Phase 7 (première expédition).
