# OUTPOST — Pré-décision multijoueur : Colyseus vs WebSocket brut

## Recommandation
Pour OUTPOST, **Colyseus est le choix recommandé pour la Phase 12**, sauf contrainte forte découverte avant cette phase.

## Comparaison

| Critère | Colyseus | WebSocket brut |
|---|---|---|
| Rooms | intégré | à développer |
| État partagé | intégré | à développer |
| Synchronisation | mécanismes dédiés | à concevoir |
| Matchmaking | structure facilitée | entièrement custom |
| Temps de développement | plus faible | plus élevé |
| Contrôle bas niveau | moyen | maximal |
| Risque de bugs réseau | plus faible | plus élevé |
| Adapté à OUTPOST | ✅ | ⚠️ |

## Pourquoi Colyseus
OUTPOST aura :
- des parties 2–4 joueurs ;
- un état partagé ;
- des joueurs qui se déplacent ;
- des ennemis/boss ;
- des événements ;
- une progression serveur ;
- potentiellement des parties 6–8 joueurs plus tard.

Avec WebSocket brut, il faudrait construire nous-mêmes :
- rooms ;
- connexion/déconnexion ;
- synchronisation d'état ;
- validation des messages ;
- interpolation ;
- gestion des joueurs qui rejoignent/quittent ;
- protocole réseau ;
- nettoyage des parties.

Colyseus permet de concentrer davantage le travail sur le gameplay.

## Point essentiel : autorité serveur
Quel que soit le choix :
- le client envoie des intentions/input ;
- le serveur valide ;
- le serveur possède l'état critique ;
- le client ne doit pas annoncer lui-même ses dégâts, récompenses ou ressources ;
- les récompenses restent calculées côté serveur.

## Ce qu'il faut préparer avant Phase 12
Ne pas installer et intégrer Colyseus maintenant juste pour tester.

Avant Phase 12, définir :
1. fréquence de simulation serveur ;
2. taille maximale d'une room ;
3. modèle d'input joueur ;
4. données synchronisées ;
5. données purement locales ;
6. comportement lors d'une déconnexion ;
7. méthode de création/rejoindre une partie ;
8. stratégie anti-triche.

## Décision provisoire
**Phase 12 → Colyseus**, avec une architecture serveur autoritaire.

Si le projet rencontre une contrainte technique réelle avec Colyseus, WebSocket brut restera le plan B.

Cette décision ne demande aucune modification du code actuel.
