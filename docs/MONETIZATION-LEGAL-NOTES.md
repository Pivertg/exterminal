# Monétisation légale et progressive — Phase 20

Ce document est informatif, pas un avis juridique. Avant d'introduire un vrai paiement dans le
jeu, il est recommandé de consulter un professionnel du droit, en particulier pour tout ce qui
touche aux mécanismes aléatoires payants (loot boxes) et à la protection des données.

## 1. Pourquoi "progressive" (section 20 du GDD)

Le principe déjà suivi jusqu'ici (aucun paiement réel dans le MVP, cristaux/or gagnés
gratuitement) est aussi la stratégie la plus sûre légalement : commencer par des systèmes
non-monétisés, puis n'introduire de l'argent réel que sur les éléments les moins à risque.

Ordre de risque légal croissant, du plus sûr au plus encadré :
1. **Cosmétiques à prix fixe** (skins, titres) — pas de hasard, achat direct. C'est le point de
   départ le plus simple pour une première monétisation.
2. **Pass de combat / abonnement** — contenu et prix connus à l'avance, pas de hasard.
3. **Mécanismes aléatoires payants (gacha/loot boxes avec argent réel)** — c'est le point le
   plus réglementé et le plus variable d'un pays à l'autre (voir section 2).

## 2. Mécanismes aléatoires payants (gacha) : point de vigilance principal

Le recrutement du jeu (Phase 13) utilise déjà un système de probabilités et de pity — mais
sans argent réel, ce qui le place hors du champ de la plupart des régulations actuelles.
Le jour où une conversion argent réel → cristaux serait envisagée, plusieurs pays ont des
règles spécifiques et non harmonisées :

- Certains pays ont classé ou envisagé de classer certains loot boxes payants comme des jeux
  d'argent, avec des conséquences réglementaires fortes (licences, interdictions selon l'âge).
- D'autres exigent seulement une transparence des taux (déjà en place dans le jeu) et des
  limites d'âge.
- La réglementation évolue régulièrement et diffère par pays ET parfois par plateforme
  (les stores mobiles ont leurs propres règles, parfois plus strictes que la loi locale).

**Point d'action concret** : si vous envisagez sérieusement l'argent réel sur le recrutement,
identifiez d'abord les pays où le jeu sera disponible, puis faites vérifier la conformité par
un juriste spécialisé jeux vidéo/gambling law pour CES pays précis. Ce n'est pas quelque chose
qu'on peut trancher soi-même en lisant des articles généraux.

## 3. Protection des données (RGPD si joueurs dans l'UE)

Le jeu stocke déjà des données personnelles (email, pseudo, mot de passe hashé). Dès qu'un
joueur dans l'UE peut créer un compte, le RGPD s'applique, indépendamment de la monétisation :

- Une politique de confidentialité doit exister et être accessible (quelles données, pourquoi,
  combien de temps conservées, qui contacter).
- Un moyen pour l'utilisateur de demander la suppression de son compte/ses données doit exister
  (actuellement non implémenté dans le jeu — à ajouter avant un vrai lancement public).
- Les mots de passe sont déjà correctement hashés (bcrypt) — bonne pratique déjà en place.

## 4. Conditions d'utilisation (CGU / EULA)

Avant tout paiement réel, un document CGU devrait couvrir au minimum :
- Les règles du jeu et ce qui est interdit (triche, revente de comptes, etc.).
- Ce que l'argent dépensé achète exactement (monnaie virtuelle, pas de valeur monétaire
  réelle, non remboursable sauf obligation légale locale).
- Les conditions de suspension/bannissement de compte.

## 5. Classification par âge (PEGI en Europe, ESRB en Amérique du Nord)

Un jeu avec des mécanismes aléatoires payants peut nécessiter une mention spécifique
("contient des achats intégrés avec éléments aléatoires") sur les fiches PEGI/ESRB — c'est déjà
une pratique standard sur les stores mobiles et Steam, indépendamment de la légalité de fond.

## 6. Prestataire de paiement

Stripe, PayPal, ou les systèmes intégrés des stores (Apple/Google/Steam) ont chacun leurs
propres règles de conformité (KYC, TVA selon le pays de l'acheteur, etc.) qui s'ajoutent aux
obligations légales générales. À vérifier au moment de choisir le prestataire.

## Statut actuel du projet vis-à-vis de tout ça

Aucune action requise immédiatement : le jeu ne traite aucun paiement réel à ce stade, donc
aucune de ces obligations n'est encore déclenchée. Ce document sert de checklist à revisiter
le jour où une vraie monétisation est envisagée — à ce moment-là, direction : un avis
juridique réel, pas cette liste.
