# OUTPOST — Analyse économique Phase 7

## Contexte vérifié
Analyse basée sur le projet actuel et les journaux 01–03. Le prototype possède actuellement uniquement le QG et de l'or. Les coûts actuels du QG sont [100, 250, 500, 900, 1500].

## 1. Principe de progression
Objectif : éviter que les premières améliorations soient trop rapides tout en gardant une boucle claire.

Hypothèse de référence pour le prototype :
- 1 expédition courte = environ 2 à 4 minutes.
- Récompense moyenne d'une expédition réussie : 70–100 ressources monétaires équivalentes.
- Une amélioration importante doit demander environ 2–4 expéditions au début, puis davantage.
- Les ressources de gameplay doivent rester séparées de la monnaie premium.

## 2. Courbe proposée des bâtiments
Ces valeurs sont une base de balancing, pas encore du code.

| Niveau | QG | Forge | Mine | Laboratoire | Stockage | Recrutement | Expédition |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1→2 | 100 | 80 | 80 | 120 | 60 | 100 | 100 |
| 2→3 | 250 | 200 | 200 | 300 | 150 | 250 | 250 |
| 3→4 | 500 | 400 | 400 | 600 | 300 | 500 | 500 |
| 4→5 | 900 | 720 | 720 | 1080 | 540 | 900 | 900 |
| 5→6 | 1500 | 1200 | 1200 | 1800 | 900 | 1500 | 1500 |
| 6→7 | 2400 | 1920 | 1920 | 2880 | 1440 | 2400 | 2400 |
| 7→8 | 3800 | 3040 | 3040 | 4560 | 2280 | 3800 | 3800 |
| 8→9 | 6000 | 4800 | 4800 | 7200 | 3600 | 6000 | 6000 |
| 9→10 | 9500 | 7600 | 7600 | 11400 | 5700 | 9500 | 9500 |

### Règle
- Forge/Mine/Recrutement/Expédition : ~80 % du coût QG.
- Laboratoire : ~120 %.
- Stockage : ~60 %.
- Le QG reste le verrou principal.

## 3. Ressources
Pour le prochain système d'expédition, viser une moyenne par run :
- Bois : 35–55
- Minerai : 25–45
- Cristaux : 8–18
- Énergie : 10–20
- Matériau rare : 0–2

Le matériau rare doit avoir une fonction claire et ne pas devenir obligatoire pour toutes les actions.

## 4. Or
Pour le prototype :
- récompense de fin de run : 40–70 or ;
- bonus boss : 20–50 or ;
- bonus quotidien éventuel : 100 or maximum ;
- éviter les grosses récompenses aléatoires qui rendent le coût d'un bâtiment imprévisible.

Avec le coût actuel QG 1→2 = 100, le joueur peut obtenir sa première amélioration après environ 1–2 runs.

## 5. Gacha / recrutement
Pour un système de recrutement non monétisé pendant le prototype :

| Rareté | Taux de base |
|---|---:|
| 2★ | 65 % |
| 3★ | 27 % |
| 4★ | 7 % |
| 5★ | 1 % |

Pity proposé :
- 10 tirages : au moins un 3★ ou mieux.
- 50 tirages : au moins un 4★ ou mieux.
- 90 tirages : garantie 5★.
- Le compteur doit être sauvegardé côté serveur.
- Le résultat doit être tiré côté serveur.
- Le client ne doit jamais fournir la rareté obtenue.

Pour un prototype, ne pas connecter ce système à de l'argent réel.

## 6. Monnaies
Architecture recommandée :
- ressources : gameplay ;
- or : progression de base ;
- tickets de recrutement : obtenus en jeu ;
- monnaie premium : séparée et absente du MVP.

Ne jamais utiliser une seule variable `currency` pour tout.

## 7. Point important
Les valeurs devront être ajustées après quelques dizaines de runs simulés. Avant d'implémenter, Claude doit valider :
1. durée cible d'une expédition ;
2. revenu moyen par run ;
3. nombre de runs voulu par amélioration ;
4. vitesse d'obtention des personnages.

Ce document est une proposition d'équilibrage, pas une instruction de modifier le code immédiatement.
