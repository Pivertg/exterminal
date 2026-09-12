import type { Room } from "colyseus.js";
import { joinGameRoom } from "../network/multiplayer";
import { PartyLobbyScreen } from "./PartyLobbyScreen";

/**
 * Écran intermédiaire entre le choix du personnage et l'expédition.
 * MVP (section 4 du GDD) : prototype à 2 joueurs maximum, matchmaking simple (pas de code de
 * partie à saisir - joinOrCreate rejoint automatiquement une partie qui a de la place).
 * En multijoueur, bascule ensuite sur le salon de groupe (chat + choix perso/compagnon).
 */
export class MultiplayerLobbyScreen {
  private container: HTMLDivElement;

  constructor(
    private token: string,
    private characterId: string,
    private onReady: (room: Room | null, characterId: string, companionId: string) => void
  ) {
    this.container = document.createElement("div");
    Object.assign(this.container.style, {
      position: "fixed",
      inset: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#111",
      fontFamily: "sans-serif",
      color: "#eee",
    });
    document.body.appendChild(this.container);
    this.render();
  }

  private render() {
    this.container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:14px; width:300px; text-align:center;">
        <h2 style="margin:0;">Comment voulez-vous jouer ?</h2>
        <button id="solo-btn" style="padding:14px; border-radius:8px; border:none; cursor:pointer; background:#4dd0e1; color:#111; font-weight:bold;">
          Solo
        </button>
        <button id="multi-btn" style="padding:14px; border-radius:8px; border:none; cursor:pointer; background:#66bb6a; color:#111; font-weight:bold;">
          Partie à 2 joueurs
        </button>
        <p id="status-text" style="min-height:18px; margin:0; font-size:13px; color:#aaa;"></p>
      </div>
    `;

    const soloBtn = this.container.querySelector("#solo-btn") as HTMLButtonElement;
    const multiBtn = this.container.querySelector("#multi-btn") as HTMLButtonElement;
    const statusText = this.container.querySelector("#status-text") as HTMLParagraphElement;

    soloBtn.addEventListener("click", () => {
      this.destroy();
      this.onReady(null, this.characterId, "aucun");
    });

    multiBtn.addEventListener("click", async () => {
      multiBtn.disabled = true;
      soloBtn.disabled = true;
      statusText.textContent = "Recherche d'une partie...";
      try {
        const room = await joinGameRoom(this.token, this.characterId);
        this.destroy();
        new PartyLobbyScreen(this.token, room, (finalCharacterId, companionId) => {
          this.onReady(room, finalCharacterId, companionId);
        });
      } catch (err) {
        statusText.textContent = `Erreur de connexion : ${err instanceof Error ? err.message : "inconnue"}`;
        multiBtn.disabled = false;
        soloBtn.disabled = false;
      }
    });
  }

  private destroy() {
    this.container.remove();
  }
}
