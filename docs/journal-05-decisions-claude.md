# Journal de tâche — 05

TÂCHE :
Validation des points laissés en attente par la relecture ChatGPT (journal-04-chatgpt-review-phase7.md), avant de démarrer la Phase 7.

DÉCISIONS :
1. Durée cible d'une expédition : 2 à 4 minutes → retenu tel quel.
2. Revenu moyen par run : 40-70 or en fin de run, retenu tel quel pour le prototype. Généré et validé côté serveur (pas par le client).
3. Rythme d'amélioration : 1-2 runs pour la première amélioration de bâtiment → retenu.
4. Architecture Prisma future (PlayerResource, Building, Character, PlayerCharacter, Inventory, GachaPity) : approuvée en principe, mais implémentation reportée — on continue à étendre le modèle `User` seulement tant que ça reste simple (section 26 du GDD : simple → fonctionnel → testé → amélioré). On basculera vers des tables séparées à partir de la Phase 11 (personnages) et Phase 13 (recrutement), pas avant.
5. Colyseus pour la Phase 12 : confirmé comme choix définitif, avec architecture serveur autoritaire. Pas d'installation avant la Phase 12.

CE QUI SUIT :
Phase 7 — première expédition réelle : une map, des ennemis qui apparaissent progressivement, un système de combat basique (attaque automatique façon Brotato), et une récompense en or calculée et attribuée par le serveur à la fin de l'expédition (répond directement au point d'architecture soulevé sur le fait que le client ne doit jamais décider de son propre gain).

FICHIERS AJOUTÉS À CETTE ÉTAPE :
- /docs/journal-04-chatgpt-review-phase7.md (copié depuis la revue ChatGPT)
- /docs/analysis/architecture-review-phase7.md
- /docs/analysis/economy-balance-phase7.md
- /docs/analysis/multiplayer-colyseus-vs-websocket.md
- /docs/journal-04-phase9-boss-da.md (copié depuis la proposition Gemini)
- /docs/moodboard-da.md
- /shared/types/index.ts mis à jour avec les types Boss (préparés en avance, non utilisés avant la Phase 9)
