import { AuthScreen } from "./scenes/AuthScreen";
import { BaseScreen } from "./scenes/BaseScreen";
import { fetchMe, fetchEquipment, fetchCosmetics, type AuthResponse, type AuthUser } from "./network/api";
import { computeEquipmentBonuses } from "./entities/equipmentTypes";
import { SKIN_DEFINITIONS, TITLE_DEFINITIONS } from "./entities/cosmeticTypes";
import { getCompanionDefinition } from "./entities/companionTypes";

const TOKEN_KEY = "game_token";

function goToBase(token: string, user: AuthUser) {
  new BaseScreen(token, async () => {
    // Chargés à la demande : la sélection de perso, le lobby multijoueur (colyseus.js est
    // assez lourd) et le moteur de jeu Pixi n'ont pas besoin d'être dans le bundle initial
    // (Phase 17 : optimisation — voir docs/journal-17-phase17-optimisation.md).
    const { CharacterSelectScreen } = await import("./scenes/CharacterSelectScreen");

    new CharacterSelectScreen(token, async (characterId) => {
      const { MultiplayerLobbyScreen } = await import("./scenes/MultiplayerLobbyScreen");

      // finalCharacterId/companionId : en multijoueur, le joueur peut changer de personnage
      // et choisir un compagnon dans le salon de groupe (PartyLobbyScreen) avant de partir —
      // en solo, ces valeurs restent celles choisies avant (characterId, pas de compagnon).
      new MultiplayerLobbyScreen(token, characterId, async (room, finalCharacterId, companionId) => {
        // Récupère l'arme/artéfact équipés (Phase 14) avant de lancer l'expédition, pour
        // appliquer leurs bonus au personnage. Si ça échoue, on part sans bonus plutôt que
        // de bloquer complètement la partie.
        let bonuses = { bonusDamage: 0, bonusMaxHp: 0, bonusSpeed: 0, bonusFireRateMs: 0 };
        let skinColor: number | undefined;
        let title = "";
        try {
          const equipment = await fetchEquipment(token);
          bonuses = computeEquipmentBonuses(equipment.equippedWeaponId, equipment.equippedArtifactId);
        } catch {
          // pas bloquant — voir commentaire ci-dessus
        }
        try {
          const cosmetics = await fetchCosmetics(token);
          skinColor = SKIN_DEFINITIONS[cosmetics.equippedSkinId]?.color;
          const titleDef = TITLE_DEFINITIONS[cosmetics.equippedTitleId];
          title = titleDef && titleDef.id !== "aucun" ? titleDef.name : "";
        } catch {
          // pas bloquant non plus — cosmétiques purement visuels
        }

        // Le compagnon choisi dans le salon de groupe ajoute son bonus par-dessus l'équipement.
        const companion = getCompanionDefinition(companionId);
        bonuses = {
          bonusDamage: bonuses.bonusDamage + companion.bonusDamage,
          bonusMaxHp: bonuses.bonusMaxHp + companion.bonusMaxHp,
          bonusSpeed: bonuses.bonusSpeed + companion.bonusSpeed,
          bonusFireRateMs: bonuses.bonusFireRateMs + companion.bonusFireRateMs,
        };

        const { ExpeditionScene } = await import("./scenes/ExpeditionScene");
        new ExpeditionScene(token, finalCharacterId, () => goToBase(token, user), room, bonuses, skinColor, title);
      });
    });
  });
}

function onAuthSuccess(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.token);
  goToBase(auth.token, auth.user);
}

async function bootstrap() {
  const savedToken = localStorage.getItem(TOKEN_KEY);

  if (savedToken) {
    try {
      const user = await fetchMe(savedToken);
      goToBase(savedToken, user);
      return;
    } catch {
      // Token expiré ou invalide : on efface et on redemande une connexion
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  new AuthScreen(onAuthSuccess);
}

bootstrap();

