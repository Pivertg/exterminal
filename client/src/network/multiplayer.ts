import { Client, Room } from "colyseus.js";

// Même logique que api.ts : VITE_WS_URL en production (voir DEPLOYMENT.md).
const SERVER_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:3000";

export interface RemotePlayerState {
  username: string;
  characterId: string;
  x: number;
  y: number;
  hp: number;
}

/**
 * Rejoint (ou crée) une partie à 2 joueurs (prototype MVP, voir GameRoom côté serveur).
 * joinOrCreate = matchmaking simple : rejoint une partie qui a de la place, sinon en crée une.
 *
 * Le typage du state reste volontairement large (any) : @colyseus/schema décode le state
 * en MapSchema à l'exécution, qui n'a pas exactement la forme d'un Map TypeScript standard.
 * On accède aux champs via room.state.players.forEach(...) comme documenté par Colyseus.
 */
export async function joinGameRoom(token: string, characterId: string): Promise<Room> {
  const client = new Client(SERVER_URL);
  return client.joinOrCreate("game_room", { token, characterId });
}
