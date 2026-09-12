import { Schema, MapSchema, type } from "@colyseus/schema";

/**
 * État d'un joueur synchronisé entre les clients d'une même partie.
 * MVP : position, personnage, compagnon et statut "prêt" — les ennemis/le boss
 * restent simulés localement par chaque client pour l'instant (voir le README
 * de cette room pour le détail des limites actuelles).
 */
export class PlayerState extends Schema {
  @type("string") username = "";
  @type("string") characterId = "recrue"; // ajusté au vrai id par défaut côté client
  @type("string") companionId = "aucun";
  @type("boolean") ready = false;
  @type("number") x = 0;
  @type("number") y = 0;
  @type("number") hp = 100;
}

export class GameRoomState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
  @type("boolean") expeditionStarted = false;
}
