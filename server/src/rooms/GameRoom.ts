import colyseus from "colyseus";
const { Room } = colyseus;
type Client = import("colyseus").Client;
import { GameRoomState, PlayerState } from "./GameRoomState.js";
import { verifyToken } from "../auth/jwt.js";

interface JoinOptions {
  token: string;
  characterId: string;
}

export interface ChatMessage {
  username: string;
  text: string;
}

/**
 * Room de partie — prototype MVP à 2 joueurs (section 4 du GDD : "commencer par un
 * prototype fiable avec 2 joueurs maximum si nécessaire, puis augmenter progressivement").
 *
 * Depuis l'ajout du lobby de groupe : chat textuel + choix du personnage/compagnon avant de
 * lancer l'expédition ensemble (voir docs/journal-22-lobby-groupe.md).
 *
 * LIMITE ACTUELLE IMPORTANTE (à corriger dans une prochaine itération, voir
 * docs/analysis/multiplayer-colyseus-vs-websocket.md) : seule la position des joueurs
 * est synchronisée pendant l'expédition. Les ennemis, le boss et les collisions restent
 * simulés localement par chaque client (comme en solo). Ce n'est donc PAS encore une
 * architecture serveur autoritaire complète pour le combat — uniquement pour la
 * présence/position des joueurs. Ne pas s'en servir pour distribuer des récompenses
 * liées au combat tant que cette limite n'est pas levée.
 */
export class GameRoom extends Room<GameRoomState> {
  maxClients = 2;

  onCreate() {
    this.setState(new GameRoomState());

    this.onMessage("move", (client, message: { x: number; y: number }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      // On fait confiance à la position ici pour le MVP (pas de validation de vitesse/collision
      // côté serveur) — acceptable tant qu'aucune récompense ne dépend de cette donnée.
      player.x = message.x;
      player.y = message.y;
    });

    // Chat textuel du lobby — simple relais, pas de stockage ni de modération pour le MVP.
    this.onMessage("chat", (client, message: { text: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || typeof message.text !== "string") return;
      const text = message.text.slice(0, 200); // limite basique anti-spam/anti-flood
      if (!text.trim()) return;
      const chatMessage: ChatMessage = { username: player.username, text };
      this.broadcast("chat", chatMessage);
    });

    this.onMessage("select-character", (client, message: { characterId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || typeof message.characterId !== "string") return;
      player.characterId = message.characterId;
      player.ready = false; // tout changement de choix annule le statut "prêt"
    });

    this.onMessage("select-companion", (client, message: { companionId: string }) => {
      const player = this.state.players.get(client.sessionId);
      if (!player || typeof message.companionId !== "string") return;
      player.companionId = message.companionId;
      player.ready = false;
    });

    this.onMessage("toggle-ready", (client) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      player.ready = !player.ready;

      // Une fois tous les joueurs présents ET prêts, l'expédition démarre pour tout le monde.
      const players = Array.from(this.state.players.values());
      const allReady = players.length >= 2 && players.every((p) => p.ready);
      if (allReady && !this.state.expeditionStarted) {
        this.state.expeditionStarted = true;
        this.broadcast("expedition-start");
      }
    });
  }

  onAuth(_client: Client, options: JoinOptions) {
    try {
      return verifyToken(options.token);
    } catch {
      throw new Error("Token invalide");
    }
  }

  onJoin(client: Client, options: JoinOptions) {
    const authData = client.auth as { username: string } | undefined;
    const player = new PlayerState();
    player.username = authData?.username ?? "Joueur";
    player.characterId = options.characterId;
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client) {
    this.state.players.delete(client.sessionId);
  }
}
